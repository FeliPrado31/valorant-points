#!/usr/bin/env node

/**
 * Test script to simulate subscription update via webhook
 * This simulates what should happen when Clerk sends a user.updated webhook
 * with subscription metadata after a successful subscription purchase
 */

const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const baseUrl = 'http://localhost:3000';
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.error('❌ CLERK_WEBHOOK_SECRET not found in environment');
  process.exit(1);
}

// Create a valid webhook signature for testing
function createWebhookSignature(payload, secret, timestamp) {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret.replace('whsec_', ''))
    .update(signedPayload, 'utf8')
    .digest('base64');
  
  return `v1,${signature}`;
}

// Simulate a user.updated webhook with subscription metadata
async function simulateSubscriptionWebhook() {
  console.log('🧪 Simulating Clerk user.updated webhook with Premium subscription\n');

  const timestamp = Math.floor(Date.now() / 1000);
  const webhookId = `msg_${Date.now()}`;
  
  // Simulate the webhook payload that Clerk would send
  // when a user completes a Premium subscription
  const webhookPayload = {
    type: 'user.updated',
    data: {
      id: 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE', // The test user ID
      email_addresses: [
        {
          email_address: 'feliprado99@gmail.com',
          id: 'idn_test',
          object: 'email_address'
        }
      ],
      username: 'happy',
      private_metadata: {
        subscription: {
          planId: 'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9', // Premium plan ID
          status: 'active',
          subscriptionId: 'sub_test_premium_123',
          tier: 'premium'
        }
      },
      public_metadata: {},
      unsafe_metadata: {},
      created_at: Date.now() - 86400000, // 1 day ago
      updated_at: Date.now(),
      object: 'user'
    }
  };

  const payloadString = JSON.stringify(webhookPayload);
  const signature = createWebhookSignature(payloadString, webhookSecret, timestamp);

  console.log('📋 Webhook payload:');
  console.log(JSON.stringify(webhookPayload, null, 2));
  console.log('\n🔐 Generated signature:', signature);
  console.log('⏰ Timestamp:', timestamp);
  console.log('🆔 Webhook ID:', webhookId);

  try {
    console.log('\n🚀 Sending webhook to:', `${baseUrl}/api/webhooks/clerk`);
    
    const response = await fetch(`${baseUrl}/api/webhooks/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': webhookId,
        'svix-timestamp': timestamp.toString(),
        'svix-signature': signature
      },
      body: payloadString
    });

    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully!');
      const responseText = await response.text();
      if (responseText) {
        console.log('📄 Response:', responseText);
      }
    } else {
      console.log('❌ Webhook processing failed');
      const errorText = await response.text();
      console.log('📄 Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error sending webhook:', error.message);
  }

  console.log('\n📋 Next steps:');
  console.log('1. Check the application logs for webhook processing');
  console.log('2. Refresh the dashboard to see if subscription status updated');
  console.log('3. Verify that mission limits increased to 10 (Premium tier)');
}

// Run the test
simulateSubscriptionWebhook().catch(console.error);
