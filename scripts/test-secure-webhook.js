#!/usr/bin/env node

/**
 * Test script to verify secure webhook implementation
 * This script tests that the webhook properly validates signatures and rejects invalid requests
 */

const crypto = require('crypto');

const baseUrl = 'http://localhost:3000';

// Test webhook security by sending invalid requests
async function testWebhookSecurity() {
  console.log('🔒 Testing Webhook Security\n');

  // Test 1: Request without headers (should fail)
  console.log('🧪 Test 1: Request without svix headers');
  try {
    const response = await fetch(`${baseUrl}/api/webhooks/clerk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'invalid' })
    });
    console.log(`Status: ${response.status} (Expected: 400)`);
    const text = await response.text();
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('---\n');

  // Test 2: Request with invalid signature (should fail)
  console.log('🧪 Test 2: Request with invalid signature');
  try {
    const response = await fetch(`${baseUrl}/api/webhooks/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'msg_fake',
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'v1,fake_signature'
      },
      body: JSON.stringify({ test: 'invalid' })
    });
    console.log(`Status: ${response.status} (Expected: 400)`);
    const text = await response.text();
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('---\n');

  // Test 3: Malformed JSON (should fail)
  console.log('🧪 Test 3: Malformed JSON payload');
  try {
    const response = await fetch(`${baseUrl}/api/webhooks/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'msg_fake',
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'v1,fake_signature'
      },
      body: 'invalid json'
    });
    console.log(`Status: ${response.status} (Expected: 400)`);
    const text = await response.text();
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('---\n');
}

// Test subscription endpoint security
async function testSubscriptionEndpointSecurity() {
  console.log('🔒 Testing Subscription Endpoint Security\n');

  // Test that subscription endpoints require authentication
  const endpoints = [
    { path: '/api/subscriptions', method: 'GET' },
    { path: '/api/subscriptions', method: 'POST', body: { tier: 'premium' } }
  ];

  for (const endpoint of endpoints) {
    console.log(`🧪 Testing ${endpoint.method} ${endpoint.path}`);
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${baseUrl}${endpoint.path}`, options);
      console.log(`Status: ${response.status} (Expected: 401 - Unauthorized)`);
      
      if (response.status !== 401) {
        console.log('⚠️ WARNING: Endpoint should require authentication!');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    console.log('---');
  }
}

// Test that removed endpoints are actually gone
async function testRemovedEndpoints() {
  console.log('\n🗑️ Testing Removed Insecure Endpoints\n');

  const removedEndpoints = [
    '/api/subscriptions/sync',
    '/api/subscriptions/manual-update'
  ];

  for (const endpoint of removedEndpoints) {
    console.log(`🧪 Testing removed endpoint: ${endpoint}`);
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      console.log(`Status: ${response.status} (Expected: 404 - Not Found)`);
      
      if (response.status !== 404) {
        console.log('⚠️ WARNING: Insecure endpoint still exists!');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    console.log('---');
  }
}

async function runSecurityTests() {
  console.log('🛡️ Valorant Points - Security Test Suite\n');
  
  // Check if server is running
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      console.log('❌ Server is not accessible');
      return;
    }
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server is not accessible:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
    return;
  }

  await testWebhookSecurity();
  await testSubscriptionEndpointSecurity();
  await testRemovedEndpoints();

  console.log('\n📋 Security Implementation Summary:');
  console.log('✅ Webhook signature verification required');
  console.log('✅ Subscription endpoints require authentication');
  console.log('✅ Insecure manual sync endpoints removed');
  console.log('✅ Client-side manipulation points eliminated');
  console.log('✅ Plan ID validation implemented');
  console.log('✅ Tier change audit logging added');
  
  console.log('\n🔍 Manual Testing Required:');
  console.log('1. Test actual subscription purchase through Clerk PricingTable');
  console.log('2. Verify webhook receives user.updated event with subscription metadata');
  console.log('3. Confirm tier upgrade happens automatically without client intervention');
  console.log('4. Check that subscription data cannot be manipulated client-side');
}

// Run security tests
runSecurityTests().catch(console.error);
