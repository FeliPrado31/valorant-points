import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getKofiApiClient, mapKofiStatusToInternal, mapKofiTierToInternal, type KofiWebhookEvent } from '@/lib/kofi-api';
import { getMaxActiveMissions } from '@/lib/subscription-types';

/**
 * Ko-fi Webhook Handler
 * Processes subscription events from Ko-fi and updates user data in Firebase
 */
export async function POST(request: NextRequest) {
  console.log('🔔 Ko-fi webhook received');

  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-kofi-signature') || '';

    // Verify webhook signature
    const kofiClient = getKofiApiClient();
    if (!(await kofiClient.verifyWebhookSignature(body, signature))) {
      console.error('❌ Invalid Ko-fi webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook event
    let event: KofiWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Failed to parse Ko-fi webhook body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log('📨 Ko-fi webhook event:', {
      type: event.type,
      subscriptionId: event.data.subscription_id,
      userId: event.data.user_id,
      tier: event.data.tier,
      status: event.data.status
    });

    // Process the webhook event based on type
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      case 'subscription.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'subscription.payment_failed':
        await handlePaymentFailed(event);
        break;
      default:
        console.warn('⚠️ Unhandled Ko-fi webhook event type:', event.type);
    }

    // Log the event for audit trail
    await logWebhookEvent(event);

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('❌ Ko-fi webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(event: KofiWebhookEvent) {
  const { user_id, subscription_id, tier, status } = event.data;
  
  console.log('✅ Processing subscription created:', {
    userId: user_id,
    subscriptionId: subscription_id,
    tier,
    status
  });

  const internalTier = mapKofiTierToInternal(tier);
  const internalStatus = mapKofiStatusToInternal(status);
  const maxMissions = getMaxActiveMissions(internalTier);
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Update user subscription data in Firebase
  const updateData = {
    'subscription.tier': internalTier,
    'subscription.status': internalStatus,
    'subscription.provider': 'kofi',
    'subscription.kofiSubscriptionId': subscription_id,
    'subscription.kofiTierId': tier,
    'subscription.currentPeriodStart': now,
    'subscription.currentPeriodEnd': event.data.next_payment_date ? new Date(event.data.next_payment_date) : null,
    'missionLimits.maxActiveMissions': maxMissions,
    'missionLimits.availableSlots': maxMissions,
    'missionLimits.lastRefresh': now,
    'missionLimits.nextRefresh': nextRefresh,
    updatedAt: now
  };

  await adminDb.collection('users').doc(user_id).update(updateData);
  
  console.log('✅ User subscription created via Ko-fi:', user_id, {
    tier: internalTier,
    status: internalStatus,
    maxMissions
  });
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(event: KofiWebhookEvent) {
  const { user_id, subscription_id, tier, status } = event.data;
  
  console.log('🔄 Processing subscription updated:', {
    userId: user_id,
    subscriptionId: subscription_id,
    tier,
    status
  });

  const internalTier = mapKofiTierToInternal(tier);
  const internalStatus = mapKofiStatusToInternal(status);
  const maxMissions = getMaxActiveMissions(internalTier);
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const updateData = {
    'subscription.tier': internalTier,
    'subscription.status': internalStatus,
    'subscription.kofiTierId': tier,
    'subscription.currentPeriodEnd': event.data.next_payment_date ? new Date(event.data.next_payment_date) : null,
    'missionLimits.maxActiveMissions': maxMissions,
    'missionLimits.availableSlots': maxMissions, // Reset slots on tier change
    'missionLimits.lastRefresh': now,
    'missionLimits.nextRefresh': nextRefresh,
    updatedAt: now
  };

  await adminDb.collection('users').doc(user_id).update(updateData);
  
  console.log('✅ User subscription updated via Ko-fi:', user_id, {
    tier: internalTier,
    status: internalStatus,
    maxMissions
  });
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(event: KofiWebhookEvent) {
  const { user_id, subscription_id } = event.data;
  
  console.log('❌ Processing subscription cancelled:', {
    userId: user_id,
    subscriptionId: subscription_id
  });

  const now = new Date();
  const freeTierMaxMissions = getMaxActiveMissions('free');
  const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Downgrade to free tier
  const updateData = {
    'subscription.tier': 'free',
    'subscription.status': 'cancelled',
    'subscription.currentPeriodEnd': now, // End immediately on cancellation
    'missionLimits.maxActiveMissions': freeTierMaxMissions,
    'missionLimits.availableSlots': freeTierMaxMissions,
    'missionLimits.lastRefresh': now,
    'missionLimits.nextRefresh': nextRefresh,
    updatedAt: now
  };

  await adminDb.collection('users').doc(user_id).update(updateData);
  
  console.log('✅ User subscription cancelled, downgraded to free:', user_id);
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(event: KofiWebhookEvent) {
  const { user_id, subscription_id } = event.data;
  
  console.log('💰 Processing payment succeeded:', {
    userId: user_id,
    subscriptionId: subscription_id,
    amount: event.data.amount
  });

  // Update subscription status to active and extend period
  const updateData = {
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': event.data.next_payment_date ? new Date(event.data.next_payment_date) : null,
    updatedAt: new Date()
  };

  await adminDb.collection('users').doc(user_id).update(updateData);
  
  console.log('✅ Payment processed successfully for user:', user_id);
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(event: KofiWebhookEvent) {
  const { user_id, subscription_id } = event.data;
  
  console.log('💳 Processing payment failed:', {
    userId: user_id,
    subscriptionId: subscription_id
  });

  // Mark subscription as inactive but don't downgrade immediately
  // Give user a grace period to update payment method
  const updateData = {
    'subscription.status': 'inactive',
    updatedAt: new Date()
  };

  await adminDb.collection('users').doc(user_id).update(updateData);
  
  console.log('⚠️ Payment failed for user, marked as inactive:', user_id);
}

/**
 * Log webhook event for audit trail
 */
async function logWebhookEvent(event: KofiWebhookEvent) {
  try {
    const logData = {
      type: event.type,
      subscriptionId: event.data.subscription_id,
      userId: event.data.user_id,
      tier: event.data.tier,
      status: event.data.status,
      amount: event.data.amount,
      timestamp: event.timestamp,
      processedAt: new Date()
    };

    await adminDb.collection('webhook_logs').add(logData);
  } catch (error) {
    console.error('Failed to log webhook event:', error);
    // Don't throw error as this shouldn't fail the webhook processing
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
