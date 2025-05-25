import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb, User, getMaxActiveMissions } from '@/lib/firebase-admin';

export async function POST() {
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

    const userData = userDoc.data() as User;

    // Check if user already has subscription data
    if (userData.subscription && userData.missionLimits) {
      return NextResponse.json({
        message: 'User already has subscription data',
        subscription: userData.subscription,
        missionLimits: userData.missionLimits
      });
    }

    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const maxMissions = getMaxActiveMissions('free'); // Default to free tier

    // Initialize subscription and mission limits for free tier
    const updateData = {
      'subscription.tier': 'free',
      'subscription.status': 'active',
      'missionLimits.maxActiveMissions': maxMissions,
      'missionLimits.availableSlots': maxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    console.log('✅ Initialized subscription data for user:', userId, {
      tier: 'free',
      maxMissions,
      availableSlots: maxMissions
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription data initialized',
      subscription: {
        tier: 'free',
        status: 'active'
      },
      missionLimits: {
        maxActiveMissions: maxMissions,
        availableSlots: maxMissions,
        lastRefresh: now.toISOString(),
        nextRefresh: nextRefresh.toISOString()
      }
    });
  } catch (error) {
    console.error('Error initializing subscription data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
