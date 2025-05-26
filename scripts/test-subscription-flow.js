#!/usr/bin/env node

/**
 * Test script to verify subscription functionality
 * Run with: node scripts/test-subscription-flow.js
 */

const baseUrl = 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🧪 Testing ${method} ${endpoint}`);
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    console.log('---');
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return { error: error.message };
  }
}

async function testSubscriptionEndpoints() {
  console.log('🚀 Testing Subscription Endpoints\n');

  // Test main subscription endpoint
  await testEndpoint('/api/subscriptions');

  // Test subscription sync endpoint (will fail without auth, but should return 401)
  await testEndpoint('/api/subscriptions/sync', 'POST');

  // Test manual update endpoint (will fail without auth, but should return 401)
  await testEndpoint('/api/subscriptions/manual-update', 'POST', {
    planId: 'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9',
    tier: 'premium'
  });

  // Test webhook endpoint (should return 400 for missing headers)
  await testEndpoint('/api/webhooks/clerk', 'POST', { test: true });

  console.log('✅ Endpoint tests completed');
}

async function testPlanIdMapping() {
  console.log('\n🔍 Testing Plan ID Mapping');
  
  const planIds = {
    'cplan_2xb4nXJsuap2kli8KvX3bIgIPAA': 'standard',
    'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9': 'premium',
    'invalid_plan_id': 'free'
  };

  for (const [planId, expectedTier] of Object.entries(planIds)) {
    console.log(`📋 Plan ID: ${planId} → Expected: ${expectedTier}`);
  }
}

async function checkServerHealth() {
  console.log('🏥 Checking Server Health\n');
  
  try {
    const response = await fetch(baseUrl);
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log(`⚠️ Server returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Server is not accessible:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Valorant Points - Subscription Flow Test\n');
  
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('💡 Make sure the development server is running: npm run dev');
    return;
  }

  await testPlanIdMapping();
  await testSubscriptionEndpoints();

  console.log('\n📋 Manual Testing Steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Log in with credentials: happy / Nada_2025');
  console.log('3. Navigate to /subscription page');
  console.log('4. Try purchasing the $10 Premium subscription');
  console.log('5. Check if the user is upgraded to Premium tier');
  console.log('6. Use the "Sync Subscription" button if needed');
  
  console.log('\n🔍 Debugging Tips:');
  console.log('- Check browser console for errors');
  console.log('- Monitor server logs for webhook events');
  console.log('- Verify Clerk dashboard webhook configuration');
  console.log('- Check Firebase user document for subscription data');
}

// Run tests
runTests().catch(console.error);
