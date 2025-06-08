/**
 * Ko-fi Webhook Integration Test Suite
 * Tests the complete Ko-fi webhook lifecycle and subscription management
 */

const crypto = require('crypto');

// Configuration
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const webhookSecret = process.env.KOFI_WEBHOOK_SECRET || 'test_webhook_secret';
const testUserId = 'user_test_kofi_integration';

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
function generateWebhookSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Create test webhook payload
 */
function createWebhookPayload(type, data) {
  return {
    type,
    data: {
      subscription_id: `sub_test_${Date.now()}`,
      user_id: testUserId,
      email: 'test@example.com',
      amount: type.includes('standard') ? 3 : 10,
      currency: 'USD',
      tier: type.includes('standard') ? 'standard' : 'premium',
      status: 'active',
      created_at: new Date().toISOString(),
      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ...data
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Send webhook request
 */
async function sendWebhook(payload) {
  const payloadString = JSON.stringify(payload);
  const signature = generateWebhookSignature(payloadString, webhookSecret);

  console.log(`📤 Sending webhook: ${payload.type}`);
  console.log(`   Payload size: ${payloadString.length} bytes`);
  console.log(`   Signature: ${signature.substring(0, 16)}...`);

  try {
    const response = await fetch(`${baseUrl}/api/kofi/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kofi-signature': signature
      },
      body: payloadString
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(responseData, null, 2)}`);
    
    return {
      status: response.status,
      data: responseData,
      success: response.ok
    };
  } catch (error) {
    console.error(`   Error: ${error.message}`);
    return {
      status: 0,
      error: error.message,
      success: false
    };
  }
}

/**
 * Test subscription created webhook
 */
async function testSubscriptionCreated() {
  console.log('\n🆕 Testing Subscription Created Webhook');
  console.log('=====================================');

  const payload = createWebhookPayload('subscription.created', {
    tier: 'standard',
    status: 'active'
  });

  const result = await sendWebhook(payload);
  
  if (result.success) {
    console.log('✅ Subscription created webhook processed successfully');
  } else {
    console.log('❌ Subscription created webhook failed');
  }

  return result;
}

/**
 * Test subscription updated webhook
 */
async function testSubscriptionUpdated() {
  console.log('\n🔄 Testing Subscription Updated Webhook');
  console.log('=====================================');

  const payload = createWebhookPayload('subscription.updated', {
    tier: 'premium',
    status: 'active'
  });

  const result = await sendWebhook(payload);
  
  if (result.success) {
    console.log('✅ Subscription updated webhook processed successfully');
  } else {
    console.log('❌ Subscription updated webhook failed');
  }

  return result;
}

/**
 * Test subscription cancelled webhook
 */
async function testSubscriptionCancelled() {
  console.log('\n❌ Testing Subscription Cancelled Webhook');
  console.log('=========================================');

  const payload = createWebhookPayload('subscription.cancelled', {
    tier: 'premium',
    status: 'cancelled'
  });

  const result = await sendWebhook(payload);
  
  if (result.success) {
    console.log('✅ Subscription cancelled webhook processed successfully');
  } else {
    console.log('❌ Subscription cancelled webhook failed');
  }

  return result;
}

/**
 * Test payment succeeded webhook
 */
async function testPaymentSucceeded() {
  console.log('\n💰 Testing Payment Succeeded Webhook');
  console.log('===================================');

  const payload = createWebhookPayload('subscription.payment_succeeded', {
    tier: 'standard',
    status: 'active'
  });

  const result = await sendWebhook(payload);
  
  if (result.success) {
    console.log('✅ Payment succeeded webhook processed successfully');
  } else {
    console.log('❌ Payment succeeded webhook failed');
  }

  return result;
}

/**
 * Test payment failed webhook
 */
async function testPaymentFailed() {
  console.log('\n💳 Testing Payment Failed Webhook');
  console.log('================================');

  const payload = createWebhookPayload('subscription.payment_failed', {
    tier: 'standard',
    status: 'inactive'
  });

  const result = await sendWebhook(payload);
  
  if (result.success) {
    console.log('✅ Payment failed webhook processed successfully');
  } else {
    console.log('❌ Payment failed webhook failed');
  }

  return result;
}

/**
 * Test webhook security
 */
async function testWebhookSecurity() {
  console.log('\n🔒 Testing Webhook Security');
  console.log('==========================');

  // Test without signature
  console.log('📤 Testing webhook without signature...');
  try {
    const payload = createWebhookPayload('subscription.created');
    const response = await fetch(`${baseUrl}/api/kofi/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`   Status: ${response.status} (Expected: 401)`);
    if (response.status === 401) {
      console.log('✅ Correctly rejected webhook without signature');
    } else {
      console.log('❌ Should reject webhook without signature');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test with invalid signature
  console.log('📤 Testing webhook with invalid signature...');
  try {
    const payload = createWebhookPayload('subscription.created');
    const response = await fetch(`${baseUrl}/api/kofi/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kofi-signature': 'invalid_signature'
      },
      body: JSON.stringify(payload)
    });
    console.log(`   Status: ${response.status} (Expected: 401)`);
    if (response.status === 401) {
      console.log('✅ Correctly rejected webhook with invalid signature');
    } else {
      console.log('❌ Should reject webhook with invalid signature');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Run all webhook tests
 */
async function runAllTests() {
  console.log('🧪 Ko-fi Webhook Integration Test Suite');
  console.log('=======================================');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Test User ID: ${testUserId}`);
  console.log(`Webhook Secret: ${webhookSecret ? 'Set' : 'Not Set'}`);

  const results = [];

  // Test webhook security first
  await testWebhookSecurity();

  // Test subscription lifecycle
  results.push(await testSubscriptionCreated());
  results.push(await testSubscriptionUpdated());
  results.push(await testPaymentSucceeded());
  results.push(await testPaymentFailed());
  results.push(await testSubscriptionCancelled());

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  if (successful === total) {
    console.log('\n🎉 All Ko-fi webhook tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }

  return results;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testSubscriptionCreated,
  testSubscriptionUpdated,
  testSubscriptionCancelled,
  testPaymentSucceeded,
  testPaymentFailed,
  testWebhookSecurity
};
