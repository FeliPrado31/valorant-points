import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb, User, getSubscriptionTier, getMaxActiveMissions, shouldRefreshMissionSlots, SUBSCRIPTION_TIERS, getTierFromClerkPlanId, getClerkPlanIdFromTier } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userData = userDoc.data() as User;

    // Initialize subscription data if missing
    if (!userData.subscription || !userData.missionLimits) {
      console.log('🔧 Initializing subscription data for user:', userId);

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

      console.log('✅ Subscription data initialized for user:', userId, {
        tier: 'free',
        maxMissions,
        availableSlots: maxMissions
      });
    }

    const currentTier = getSubscriptionTier(userData);
    const maxMissions = getMaxActiveMissions(currentTier);

    // Get current active missions count
    const activeMissionsSnapshot = await adminDb
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    const activeMissionsCount = activeMissionsSnapshot.size;

    // Check if mission slots need refresh
    const needsRefresh = shouldRefreshMissionSlots(userData);
    let availableSlots = userData.missionLimits?.availableSlots || maxMissions;
    let nextRefresh = userData.missionLimits?.nextRefresh;

    // Convert Firestore Timestamp to Date if needed
    if (nextRefresh && typeof nextRefresh.toDate === 'function') {
      nextRefresh = nextRefresh.toDate();
    } else if (nextRefresh && typeof nextRefresh === 'string') {
      nextRefresh = new Date(nextRefresh);
    }

    // Refresh mission slots if needed
    if (needsRefresh) {
      const now = new Date();
      const refreshTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      availableSlots = maxMissions;
      nextRefresh = refreshTime;

      // Update user document with refreshed mission limits
      await adminDb.collection('users').doc(userId).update({
        'missionLimits.availableSlots': availableSlots,
        'missionLimits.lastRefresh': now,
        'missionLimits.nextRefresh': refreshTime,
        'missionLimits.maxActiveMissions': maxMissions,
        updatedAt: now
      });

      console.log('🔄 Mission slots refreshed for user:', userId, {
        tier: currentTier,
        availableSlots,
        nextRefresh: refreshTime.toISOString()
      });
    }

    const subscriptionInfo = {
      tier: currentTier,
      tierInfo: SUBSCRIPTION_TIERS[currentTier],
      maxActiveMissions: maxMissions,
      activeMissionsCount,
      availableSlots,
      canAcceptMissions: availableSlots > 0 && activeMissionsCount < maxMissions,
      nextRefresh: nextRefresh instanceof Date ? nextRefresh.toISOString() : null,
      hoursUntilRefresh: nextRefresh instanceof Date ? Math.max(0, Math.ceil((nextRefresh.getTime() - Date.now()) / (1000 * 60 * 60))) : 0,
      subscription: userData.subscription || null
    };

    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error('Error fetching subscription info:', error);
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
    const { tier, clerkSubscriptionId, planId } = body;

    // Validate tier or derive from planId
    let finalTier = tier;
    if (planId && !tier) {
      finalTier = getTierFromClerkPlanId(planId);
    }

    if (!finalTier || !['free', 'standard', 'premium'].includes(finalTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier or plan ID' }, { status: 400 });
    }

    // Validate that the planId matches the tier
    const expectedPlanId = getClerkPlanIdFromTier(finalTier);
    if (finalTier !== 'free' && planId && planId !== expectedPlanId) {
      return NextResponse.json({
        error: `Plan ID ${planId} does not match tier ${finalTier}. Expected: ${expectedPlanId}`
      }, { status: 400 });
    }

    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const maxMissions = getMaxActiveMissions(finalTier);
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const finalPlanId = planId || getClerkPlanIdFromTier(finalTier);

    // Update user subscription and mission limits
    const updateData = {
      'subscription.tier': finalTier,
      'subscription.status': 'active',
      'subscription.clerkSubscriptionId': clerkSubscriptionId || null,
      'subscription.planId': finalPlanId,
      'subscription.currentPeriodStart': now,
      'missionLimits.maxActiveMissions': maxMissions,
      'missionLimits.availableSlots': maxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    console.log('✅ Subscription updated for user:', userId, {
      tier: finalTier,
      maxMissions,
      clerkSubscriptionId,
      planId: finalPlanId,
      expectedPlanId: getClerkPlanIdFromTier(finalTier)
    });

    return NextResponse.json({
      success: true,
      tier: finalTier,
      maxActiveMissions: maxMissions,
      planId: finalPlanId,
      message: `Subscription updated to ${SUBSCRIPTION_TIERS[finalTier as keyof typeof SUBSCRIPTION_TIERS].name}`
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
