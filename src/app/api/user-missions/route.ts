import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb, UserMission, User, getSubscriptionTier, getMaxActiveMissions, shouldRefreshMissionSlots } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's missions with mission details
    const userMissionsSnapshot = await adminDb
      .collection('userMissions')
      .where('userId', '==', userId)
      .orderBy('startedAt', 'desc')
      .get();

    const userMissions = [];

    for (const doc of userMissionsSnapshot.docs) {
      const userMissionData = doc.data() as UserMission;

      // Get mission details
      const missionDoc = await adminDb.collection('missions').doc(userMissionData.missionId).get();
      const missionData = missionDoc.data();

      // Convert Firestore timestamps to ISO strings for frontend consumption
      const processedUserMission = {
        ...userMissionData,
        id: doc.id,
        // Convert Firestore Timestamp objects to ISO strings
        startedAt: userMissionData.startedAt && typeof userMissionData.startedAt === 'object' && 'toDate' in userMissionData.startedAt ? (userMissionData.startedAt as { toDate: () => Date }).toDate().toISOString() : userMissionData.startedAt,
        acceptedAt: userMissionData.acceptedAt && typeof userMissionData.acceptedAt === 'object' && 'toDate' in userMissionData.acceptedAt ? (userMissionData.acceptedAt as { toDate: () => Date }).toDate().toISOString() : (userMissionData.acceptedAt || (userMissionData.startedAt && typeof userMissionData.startedAt === 'object' && 'toDate' in userMissionData.startedAt ? (userMissionData.startedAt as { toDate: () => Date }).toDate().toISOString() : userMissionData.startedAt)),
        lastUpdated: userMissionData.lastUpdated && typeof userMissionData.lastUpdated === 'object' && 'toDate' in userMissionData.lastUpdated ? (userMissionData.lastUpdated as { toDate: () => Date }).toDate().toISOString() : userMissionData.lastUpdated,
        completedAt: userMissionData.completedAt && typeof userMissionData.completedAt === 'object' && 'toDate' in userMissionData.completedAt ? (userMissionData.completedAt as { toDate: () => Date }).toDate().toISOString() : userMissionData.completedAt,
        mission: missionData
      };

      console.log('📋 Processed user mission timestamps:', {
        missionId: userMissionData.missionId,
        startedAt: processedUserMission.startedAt,
        acceptedAt: processedUserMission.acceptedAt
      });

      userMissions.push(processedUserMission);
    }

    return NextResponse.json(userMissions);
  } catch (error) {
    console.error('Error fetching user missions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { missionId } = body;

    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    // Check if user has completed Riot ID setup
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found. Please complete setup first.' }, { status: 400 });
    }

    let userData = userDoc.data() as User;
    if (!userData?.riotId || !userData.riotId.puuid) {
      return NextResponse.json({ error: 'Riot ID verification required. Please complete setup first.' }, { status: 400 });
    }

    // Initialize subscription data if missing
    if (!userData.subscription || !userData.missionLimits) {
      console.log('🔧 Initializing subscription data during mission acceptance for user:', userId);

      const now = new Date();
      const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const maxMissions = getMaxActiveMissions('free');

      const initializationData = {
        'subscription.tier': 'free',
        'subscription.status': 'active',
        'missionLimits.maxActiveMissions': maxMissions,
        'missionLimits.availableSlots': maxMissions,
        'missionLimits.lastRefresh': now,
        'missionLimits.nextRefresh': nextRefresh,
        updatedAt: now
      };

      await adminDb.collection('users').doc(userId).update(initializationData);

      // Update local userData object
      userData = {
        ...userData,
        subscription: {
          tier: 'free',
          status: 'active'
        },
        missionLimits: {
          maxActiveMissions: maxMissions,
          availableSlots: maxMissions,
          lastRefresh: now,
          nextRefresh: nextRefresh
        },
        updatedAt: now
      };

      console.log('✅ Subscription data initialized during mission acceptance:', userId);
    }

    // Get subscription info and check limits
    const currentTier = getSubscriptionTier(userData as unknown as Record<string, unknown>);
    const maxMissions = getMaxActiveMissions(currentTier);

    // Check if mission slots need refresh
    const needsRefresh = shouldRefreshMissionSlots(userData as unknown as Record<string, unknown>);
    let availableSlots = userData.missionLimits?.availableSlots || maxMissions;

    // Ensure availableSlots is properly set for initialized users
    if (availableSlots === undefined || availableSlots === null) {
      availableSlots = maxMissions;
    }

    if (needsRefresh) {
      const now = new Date();
      const refreshTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      availableSlots = maxMissions;

      // Update user document with refreshed mission limits
      await adminDb.collection('users').doc(userId).update({
        'missionLimits.availableSlots': availableSlots,
        'missionLimits.lastRefresh': now,
        'missionLimits.nextRefresh': refreshTime,
        'missionLimits.maxActiveMissions': maxMissions,
        updatedAt: now
      });

      console.log('🔄 Mission slots refreshed during mission acceptance:', userId, {
        tier: currentTier,
        availableSlots
      });
    }

    // Check if user already has this mission
    const existingMissionSnapshot = await adminDb
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('missionId', '==', missionId)
      .where('isCompleted', '==', false)
      .get();

    if (!existingMissionSnapshot.empty) {
      return NextResponse.json({ error: 'Mission already active' }, { status: 400 });
    }

    // Get current active missions count
    const activeMissionsSnapshot = await adminDb
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    const activeMissionsCount = activeMissionsSnapshot.size;

    // Check subscription limits
    if (activeMissionsCount >= maxMissions) {
      return NextResponse.json({
        error: `Mission limit reached. ${currentTier === 'free' ? 'Upgrade to Standard ($3/month) for 5 missions or Premium ($10/month) for 10 missions.' : `Your ${currentTier} plan allows up to ${maxMissions} active missions.`}`,
        currentTier,
        maxMissions,
        activeMissionsCount
      }, { status: 400 });
    }

    // Check available slots (24-hour limit)
    if (availableSlots <= 0) {
      const nextRefresh = userData.missionLimits?.nextRefresh;
      const hoursUntilRefresh = nextRefresh ? Math.max(0, Math.ceil((nextRefresh.getTime() - Date.now()) / (1000 * 60 * 60))) : 0;

      return NextResponse.json({
        error: `Daily mission limit reached. You can accept new missions in ${hoursUntilRefresh} hours.`,
        availableSlots: 0,
        hoursUntilRefresh
      }, { status: 400 });
    }

    // Check if mission exists
    const missionDoc = await adminDb.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const acceptedAt = new Date();
    const userMissionData: Omit<UserMission, 'id'> = {
      userId,
      missionId,
      progress: 0,
      isCompleted: false,
      startedAt: acceptedAt,
      acceptedAt: acceptedAt, // Clear timestamp for mission acceptance
      lastUpdated: acceptedAt,
    };

    console.log('🎯 Creating new user mission:', {
      userId,
      missionId,
      acceptedAt: acceptedAt.toISOString(),
      message: 'Only matches played after this timestamp will count toward progress'
    });

    // Create user mission in Firestore
    const userMissionRef = await adminDb.collection('userMissions').add(userMissionData);

    // Decrement available slots
    const newAvailableSlots = Math.max(0, availableSlots - 1);
    await adminDb.collection('users').doc(userId).update({
      'missionLimits.availableSlots': newAvailableSlots,
      updatedAt: acceptedAt
    });

    // Return properly formatted response with ISO date strings
    const userMissionResponse = {
      id: userMissionRef.id,
      userId,
      missionId,
      progress: 0,
      isCompleted: false,
      startedAt: acceptedAt.toISOString(),
      acceptedAt: acceptedAt.toISOString(),
      lastUpdated: acceptedAt.toISOString(),
    };

    console.log('✅ Created user mission with timestamps and updated slots:', {
      id: userMissionResponse.id,
      startedAt: userMissionResponse.startedAt,
      acceptedAt: userMissionResponse.acceptedAt,
      tier: currentTier,
      availableSlotsRemaining: newAvailableSlots,
      activeMissionsCount: activeMissionsCount + 1
    });

    return NextResponse.json(userMissionResponse, { status: 201 });
  } catch (error) {
    console.error('Error starting mission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
