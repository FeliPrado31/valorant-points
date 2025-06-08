import { NextRequest, NextResponse } from 'next/server';
import { adminDb, User, getSubscriptionTier, getMaxActiveMissions, shouldRefreshMissionSlots, SUBSCRIPTION_TIERS, getTierFromKofiTierId, getKofiTierIdFromTier } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement Ko-fi authentication
    // For now, get userId from headers or query params
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
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

    const currentTier = getSubscriptionTier(userData as unknown as Record<string, unknown>);
    const maxMissions = getMaxActiveMissions(currentTier);

    // Get current active missions count
    const activeMissionsSnapshot = await adminDb
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    const activeMissionsCount = activeMissionsSnapshot.size;

    // Check if mission slots need refresh
    const needsRefresh = shouldRefreshMissionSlots(userData as unknown as Record<string, unknown>);
    let availableSlots = userData.missionLimits?.availableSlots || maxMissions;
    let nextRefresh = userData.missionLimits?.nextRefresh;

    // Convert Firestore Timestamp to Date if needed
    if (nextRefresh && typeof nextRefresh === 'object' && 'toDate' in nextRefresh && typeof (nextRefresh as { toDate: () => Date }).toDate === 'function') {
      nextRefresh = (nextRefresh as { toDate: () => Date }).toDate();
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
    // TODO: Implement Ko-fi authentication
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, kofiSubscriptionId, kofiTierId } = body;

    // Validate tier or derive from kofiTierId
    let finalTier = tier;
    if (kofiTierId && !tier) {
      finalTier = getTierFromKofiTierId(kofiTierId);
    }

    if (!finalTier || !['free', 'standard', 'premium'].includes(finalTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier or Ko-fi tier ID' }, { status: 400 });
    }

    // Validate that the kofiTierId matches the tier
    const expectedKofiTierId = getKofiTierIdFromTier(finalTier);
    if (finalTier !== 'free' && kofiTierId && kofiTierId !== expectedKofiTierId) {
      return NextResponse.json({
        error: `Ko-fi tier ID ${kofiTierId} does not match tier ${finalTier}. Expected: ${expectedKofiTierId}`
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
    const finalKofiTierId = kofiTierId || getKofiTierIdFromTier(finalTier);

    // Update user subscription and mission limits
    const updateData = {
      'subscription.tier': finalTier,
      'subscription.status': 'active',
      'subscription.provider': 'kofi',
      'subscription.kofiSubscriptionId': kofiSubscriptionId || null,
      'subscription.kofiTierId': finalKofiTierId,
      'subscription.currentPeriodStart': now,
      'missionLimits.maxActiveMissions': maxMissions,
      'missionLimits.availableSlots': maxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    console.log('✅ Ko-fi subscription updated for user:', userId, {
      tier: finalTier,
      maxMissions,
      kofiSubscriptionId,
      kofiTierId: finalKofiTierId,
      expectedKofiTierId: getKofiTierIdFromTier(finalTier)
    });

    return NextResponse.json({
      success: true,
      tier: finalTier,
      maxActiveMissions: maxMissions,
      kofiTierId: finalKofiTierId,
      message: `Subscription updated to ${SUBSCRIPTION_TIERS[finalTier as keyof typeof SUBSCRIPTION_TIERS].name}`
    });
  } catch (error) {
    console.error('Error updating Ko-fi subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
