#!/usr/bin/env node

/**
 * Test script to verify Clerk webhook configuration
 * Run with: node scripts/test-webhook.js
 */

const crypto = require('crypto');

// Test webhook secret validation
function testWebhookSecret() {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set in environment variables');
    console.log('💡 Add CLERK_WEBHOOK_SECRET to your .env.local file');
    return false;
  }
  
  if (!webhookSecret.startsWith('whsec_')) {
    console.error('❌ CLERK_WEBHOOK_SECRET format is invalid');
    console.log('💡 Webhook secret should start with "whsec_"');
    return false;
  }
  
  console.log('✅ CLERK_WEBHOOK_SECRET is properly configured');
  console.log(`🔑 Secret format: ${webhookSecret.substring(0, 10)}...`);
  return true;
}

// Test webhook endpoint accessibility
async function testWebhookEndpoint() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/webhooks/clerk`;
  
  try {
    console.log(`🌐 Testing webhook endpoint: ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    if (response.status === 400) {
      console.log('✅ Webhook endpoint is accessible (returns 400 for invalid signature - expected)');
      return true;
    } else {
      console.log(`⚠️  Webhook endpoint returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to reach webhook endpoint:', error.message);
    console.log('💡 Make sure your development server is running (npm run dev)');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing Clerk Webhook Configuration\n');
  
  const secretTest = testWebhookSecret();
  console.log('');
  
  if (secretTest) {
    await testWebhookEndpoint();
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Ensure your webhook URL is configured in Clerk Dashboard');
  console.log('2. Test subscription events through Clerk Dashboard');
  console.log('3. Monitor webhook logs in your application');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run tests
runTests().catch(console.error);
