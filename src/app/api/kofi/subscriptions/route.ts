import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase-admin';
import { getKofiApiClient, mapKofiStatusToInternal, mapKofiTierToInternal } from '@/lib/kofi-api';
import { getMaxActiveMissions, type SubscriptionTierKey } from '@/lib/subscription-types';

/**
 * Ko-fi Subscription Management API
 * Handles Ko-fi subscription operations for authenticated users
 */

/**
 * GET - Retrieve user's Ko-fi subscription status
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user document from Firebase
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;

    // If user has Ko-fi subscription, fetch latest status from Ko-fi API
    if (subscription?.kofiSubscriptionId) {
      const kofiClient = getKofiApiClient();
      const kofiResponse = await kofiClient.getSubscription(subscription.kofiSubscriptionId);

      if (kofiResponse.success && kofiResponse.data) {
        const kofiSubscription = kofiResponse.data;
        
        // Update local data with latest Ko-fi status
        const internalTier = mapKofiTierToInternal(kofiSubscription.tier);
        const internalStatus = mapKofiStatusToInternal(kofiSubscription.status);
        
        const updatedSubscription = {
          ...subscription,
          tier: internalTier,
          status: internalStatus,
          kofiTierId: kofiSubscription.tier,
          currentPeriodEnd: kofiSubscription.next_payment_date ? new Date(kofiSubscription.next_payment_date) : null
        };

        // Update Firebase with latest data
        await adminDb.collection('users').doc(userId).update({
          'subscription': updatedSubscription,
          updatedAt: new Date()
        });

        return NextResponse.json({
          subscription: updatedSubscription,
          kofiData: kofiSubscription
        });
      }
    }

    // Return local subscription data
    return NextResponse.json({
      subscription: subscription || {
        tier: 'free',
        status: 'active',
        provider: 'kofi'
      }
    });

  } catch (error) {
    console.error('❌ Failed to get Ko-fi subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new Ko-fi subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body;

    if (!tier || !['standard', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "standard" or "premium"' },
        { status: 400 }
      );
    }

    // Get user data for email
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Create Ko-fi subscription
    const kofiClient = getKofiApiClient();
    const createResponse = await kofiClient.createSubscription({
      user_id: userId,
      email: userEmail,
      tier: tier as 'standard' | 'premium',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?cancelled=true`
    });

    if (!createResponse.success) {
      console.error('❌ Failed to create Ko-fi subscription:', createResponse.error);
      return NextResponse.json(
        { error: createResponse.error || 'Failed to create subscription' },
        { status: 400 }
      );
    }

    const kofiSubscription = createResponse.data!;
    const internalTier = mapKofiTierToInternal(kofiSubscription.tier);
    const internalStatus = mapKofiStatusToInternal(kofiSubscription.status);
    const maxMissions = getMaxActiveMissions(internalTier);
    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Update user subscription data in Firebase
    const updateData = {
      'subscription.tier': internalTier,
      'subscription.status': internalStatus,
      'subscription.provider': 'kofi',
      'subscription.kofiSubscriptionId': kofiSubscription.id,
      'subscription.kofiTierId': kofiSubscription.tier,
      'subscription.currentPeriodStart': now,
      'subscription.currentPeriodEnd': kofiSubscription.next_payment_date ? new Date(kofiSubscription.next_payment_date) : null,
      'missionLimits.maxActiveMissions': maxMissions,
      'missionLimits.availableSlots': maxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    console.log('✅ Ko-fi subscription created:', {
      userId,
      subscriptionId: kofiSubscription.id,
      tier: internalTier,
      status: internalStatus
    });

    return NextResponse.json({
      success: true,
      subscription: kofiSubscription,
      checkoutUrl: kofiClient.getCheckoutUrl(tier as 'standard' | 'premium', userId, userEmail)
    });

  } catch (error) {
    console.error('❌ Failed to create Ko-fi subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update existing Ko-fi subscription
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, status } = body;

    // Get user's current subscription
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;

    if (!subscription?.kofiSubscriptionId) {
      return NextResponse.json(
        { error: 'No Ko-fi subscription found' },
        { status: 404 }
      );
    }

    // Update Ko-fi subscription
    const kofiClient = getKofiApiClient();
    const updateResponse = await kofiClient.updateSubscription({
      subscription_id: subscription.kofiSubscriptionId,
      ...(tier && { tier }),
      ...(status && { status })
    });

    if (!updateResponse.success) {
      console.error('❌ Failed to update Ko-fi subscription:', updateResponse.error);
      return NextResponse.json(
        { error: updateResponse.error || 'Failed to update subscription' },
        { status: 400 }
      );
    }

    const updatedSubscription = updateResponse.data!;
    const internalTier = mapKofiTierToInternal(updatedSubscription.tier);
    const internalStatus = mapKofiStatusToInternal(updatedSubscription.status);
    const maxMissions = getMaxActiveMissions(internalTier);
    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Update Firebase with new subscription data
    const updateData = {
      'subscription.tier': internalTier,
      'subscription.status': internalStatus,
      'subscription.kofiTierId': updatedSubscription.tier,
      'subscription.currentPeriodEnd': updatedSubscription.next_payment_date ? new Date(updatedSubscription.next_payment_date) : null,
      'missionLimits.maxActiveMissions': maxMissions,
      'missionLimits.availableSlots': maxMissions, // Reset slots on tier change
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    console.log('✅ Ko-fi subscription updated:', {
      userId,
      subscriptionId: updatedSubscription.id,
      tier: internalTier,
      status: internalStatus
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription
    });

  } catch (error) {
    console.error('❌ Failed to update Ko-fi subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel Ko-fi subscription
 */
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current subscription
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;

    if (!subscription?.kofiSubscriptionId) {
      return NextResponse.json(
        { error: 'No Ko-fi subscription found' },
        { status: 404 }
      );
    }

    // Cancel Ko-fi subscription
    const kofiClient = getKofiApiClient();
    const cancelResponse = await kofiClient.cancelSubscription(subscription.kofiSubscriptionId);

    if (!cancelResponse.success) {
      console.error('❌ Failed to cancel Ko-fi subscription:', cancelResponse.error);
      return NextResponse.json(
        { error: cancelResponse.error || 'Failed to cancel subscription' },
        { status: 400 }
      );
    }

    // Update Firebase to reflect cancellation
    const now = new Date();
    const freeTierMaxMissions = getMaxActiveMissions('free');
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const updateData = {
      'subscription.tier': 'free',
      'subscription.status': 'cancelled',
      'subscription.currentPeriodEnd': now,
      'missionLimits.maxActiveMissions': freeTierMaxMissions,
      'missionLimits.availableSlots': freeTierMaxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    console.log('✅ Ko-fi subscription cancelled:', {
      userId,
      subscriptionId: subscription.kofiSubscriptionId
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Failed to cancel Ko-fi subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
