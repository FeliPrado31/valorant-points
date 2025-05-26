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

  let evt: { type: string; data: Record<string, unknown> };

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  const timestamp = new Date().toISOString();

  console.log(`🔔 [${timestamp}] Clerk webhook received:`, eventType);
  console.log(`📊 [${timestamp}] Webhook payload:`, JSON.stringify(evt.data, null, 2));

  // Security: Log webhook source for audit trail
  console.log(`🔒 [${timestamp}] Webhook security verified - signature valid`);

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

async function handleUserCreated(userData: Record<string, unknown>) {
  try {
    const userId = userData.id as string;

    if (!userId) {
      console.error('❌ No user ID in user.created data');
      return;
    }

    console.log('👤 Creating user profile for:', userId);

    // Initialize user with free tier defaults
    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const freeTierMaxMissions = getMaxActiveMissions('free');

    const emailAddresses = userData.email_addresses as Array<{ email_address: string }> | undefined;
    const userProfile = {
      id: userId,
      clerkId: userId,
      email: emailAddresses?.[0]?.email_address || '',
      username: (userData.username as string) || (userData.first_name as string) || 'User',
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

async function handleUserUpdated(userData: Record<string, unknown>) {
  try {
    const userId = userData.id as string;
    const timestamp = new Date().toISOString();

    if (!userId) {
      console.error('❌ No user ID in user.updated data');
      return;
    }

    console.log(`👤 [${timestamp}] Processing user.updated for:`, userId);

    // Check if user exists in our database
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`⚠️ [${timestamp}] User not found in database, creating new profile`);
      await handleUserCreated(userData);
      return;
    }

    // Check for subscription data in metadata
    const privateMetadata = userData.private_metadata as Record<string, unknown> | undefined;
    const publicMetadata = userData.public_metadata as Record<string, unknown> | undefined;

    console.log(`🔍 [${timestamp}] Checking metadata for subscription data:`, {
      hasPrivateMetadata: !!privateMetadata,
      hasPublicMetadata: !!publicMetadata,
      privateKeys: privateMetadata ? Object.keys(privateMetadata) : [],
      publicKeys: publicMetadata ? Object.keys(publicMetadata) : []
    });

    const subscriptionData = privateMetadata?.subscription || publicMetadata?.subscription;

    if (subscriptionData) {
      console.log(`💳 [${timestamp}] Subscription data found in metadata:`, subscriptionData);

      const subscription = subscriptionData as {
        planId?: string;
        status?: string;
        subscriptionId?: string;
        tier?: string;
      };
      const { planId, status, subscriptionId, tier: metaTier } = subscription;

      // Security: Validate planId against our known plan IDs
      if (planId && !['cplan_2xb4nXJsuap2kli8KvX3bIgIPAA', 'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9'].includes(planId)) {
        console.error(`❌ [${timestamp}] Invalid plan ID detected:`, planId);
        return;
      }

      // Determine tier from planId (more secure) or use metadata tier as fallback
      const tierCandidate = planId ? getTierFromClerkPlanId(planId) : (metaTier || 'free');

      // Security: Only allow valid tiers
      if (!['free', 'standard', 'premium'].includes(tierCandidate)) {
        console.error(`❌ [${timestamp}] Invalid tier detected:`, tierCandidate);
        return;
      }

      const tier = tierCandidate as 'free' | 'standard' | 'premium';
      const maxMissions = getMaxActiveMissions(tier);

      const now = new Date();
      const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Get current user data to compare changes
      const currentUserDoc = await adminDb.collection('users').doc(userId).get();
      const currentUserData = currentUserDoc.data();
      const currentTier = currentUserData?.subscription?.tier || 'free';

      // Security: Log tier changes for audit trail
      if (currentTier !== tier) {
        console.log(`🔄 [${timestamp}] TIER CHANGE DETECTED:`, {
          userId,
          previousTier: currentTier,
          newTier: tier,
          planId,
          subscriptionId,
          source: 'clerk_webhook'
        });
      }

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

      console.log(`✅ [${timestamp}] Subscription updated via secure webhook:`, userId, {
        tier,
        maxMissions,
        status,
        planId,
        subscriptionId,
        source: planId ? 'planId' : 'metadata',
        previousTier: currentTier,
        tierChanged: currentTier !== tier
      });
    } else {
      // Update basic user info
      const updateData: Record<string, unknown> = {
        updatedAt: new Date()
      };

      const emailAddresses = userData.email_addresses as Array<{ email_address: string }> | undefined;
      if (emailAddresses?.[0]?.email_address) {
        updateData.email = emailAddresses[0].email_address;
      }

      if (userData.username || userData.first_name) {
        updateData.username = (userData.username as string) || (userData.first_name as string);
      }

      await adminDb.collection('users').doc(userId).update(updateData);

      console.log('✅ User profile updated via webhook:', userId);
    }

  } catch (error) {
    console.error('❌ Error handling user.updated:', error);
  }
}

async function handleUserDeleted(userData: Record<string, unknown>) {
  try {
    const userId = userData.id as string;

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


