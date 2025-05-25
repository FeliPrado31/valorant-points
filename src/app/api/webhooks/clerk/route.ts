import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { adminDb, getTierFromClerkPlanId, getMaxActiveMissions } from '@/lib/firebase-admin';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing svix headers');
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await request.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('🔔 Clerk webhook received:', eventType);
  console.log('📊 Webhook payload:', JSON.stringify(evt.data, null, 2));

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;

      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;

      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;

      default:
        console.log('🔔 Unhandled webhook event type:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleUserCreated(userData: any) {
  try {
    const userId = userData.id;

    if (!userId) {
      console.error('❌ No user ID in user.created data');
      return;
    }

    console.log('👤 Creating user profile for:', userId);

    // Initialize user with free tier defaults
    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const freeTierMaxMissions = getMaxActiveMissions('free');

    const userProfile = {
      id: userId,
      clerkId: userId,
      email: userData.email_addresses?.[0]?.email_address || '',
      username: userData.username || userData.first_name || 'User',
      subscription: {
        tier: 'free',
        status: 'active',
        clerkSubscriptionId: null,
        planId: null,
        currentPeriodStart: now,
        currentPeriodEnd: null
      },
      missionLimits: {
        maxActiveMissions: freeTierMaxMissions,
        availableSlots: freeTierMaxMissions,
        lastRefresh: now,
        nextRefresh: nextRefresh
      },
      createdAt: now,
      updatedAt: now
    };

    await adminDb.collection('users').doc(userId).set(userProfile);

    console.log('✅ User profile created via webhook:', userId);

  } catch (error) {
    console.error('❌ Error handling user.created:', error);
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const userId = userData.id;

    if (!userId) {
      console.error('❌ No user ID in user.updated data');
      return;
    }

    console.log('👤 Processing user.updated for:', userId);

    // Check if user exists in our database
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('⚠️ User not found in database, creating new profile');
      await handleUserCreated(userData);
      return;
    }

    // Check for subscription data in metadata
    const subscriptionData = userData.private_metadata?.subscription || userData.public_metadata?.subscription;

    if (subscriptionData) {
      console.log('💳 Subscription data found in metadata:', subscriptionData);

      const { planId, status, subscriptionId } = subscriptionData;
      const tier = getTierFromClerkPlanId(planId);
      const maxMissions = getMaxActiveMissions(tier);

      const now = new Date();
      const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Update user subscription data
      const updateData = {
        'subscription.tier': tier,
        'subscription.status': status || 'active',
        'subscription.clerkSubscriptionId': subscriptionId,
        'subscription.planId': planId,
        'subscription.currentPeriodStart': now,
        'missionLimits.maxActiveMissions': maxMissions,
        'missionLimits.availableSlots': maxMissions, // Reset slots on subscription change
        'missionLimits.lastRefresh': now,
        'missionLimits.nextRefresh': nextRefresh,
        updatedAt: now
      };

      await adminDb.collection('users').doc(userId).update(updateData);

      console.log('✅ Subscription updated via user.updated webhook:', userId, {
        tier,
        maxMissions,
        status
      });
    } else {
      // Update basic user info
      const updateData: any = {
        updatedAt: new Date()
      };

      if (userData.email_addresses?.[0]?.email_address) {
        updateData.email = userData.email_addresses[0].email_address;
      }

      if (userData.username || userData.first_name) {
        updateData.username = userData.username || userData.first_name;
      }

      await adminDb.collection('users').doc(userId).update(updateData);

      console.log('✅ User profile updated via webhook:', userId);
    }

  } catch (error) {
    console.error('❌ Error handling user.updated:', error);
  }
}

async function handleUserDeleted(userData: any) {
  try {
    const userId = userData.id;

    if (!userId) {
      console.error('❌ No user ID in user.deleted data');
      return;
    }

    console.log('🗑️ Deleting user profile for:', userId);

    // Delete user document
    await adminDb.collection('users').doc(userId).delete();

    // Optionally, delete user missions
    const userMissionsQuery = await adminDb.collection('user-missions')
      .where('userId', '==', userId)
      .get();

    const batch = adminDb.batch();
    userMissionsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log('✅ User profile and missions deleted via webhook:', userId);

  } catch (error) {
    console.error('❌ Error handling user.deleted:', error);
  }
}
