require('dotenv').config({ path: '.env.local' });

console.log('🔧 Environment Configuration Test');
console.log('='.repeat(50));

console.log('\n📋 Ko-fi Configuration:');
console.log(`KOFI_API_KEY: ${process.env.KOFI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`KOFI_WEBHOOK_SECRET: ${process.env.KOFI_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`KOFI_API_BASE_URL: ${process.env.KOFI_API_BASE_URL || '❌ Missing'}`);
console.log(`KOFI_PAGE_URL: ${process.env.KOFI_PAGE_URL || '❌ Missing'}`);
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '❌ Missing'}`);

console.log('\n📋 Other Configuration:');
console.log(`CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || '❌ Missing'}`);
console.log(`VALORANT_API_KEY: ${process.env.VALORANT_API_KEY ? '✅ Set' : '❌ Missing'}`);

console.log('\n🔍 Ko-fi Configuration Details:');
if (process.env.KOFI_API_KEY) {
  console.log(`API Key format: ${process.env.KOFI_API_KEY.startsWith('KF_API_') ? '✅ Valid' : '⚠️ Invalid format'}`);
}
if (process.env.KOFI_PAGE_URL) {
  console.log(`Page URL format: ${process.env.KOFI_PAGE_URL.startsWith('https://ko-fi.com/') ? '✅ Valid' : '⚠️ Invalid format'}`);
}

// Test Ko-fi API client initialization
console.log('\n🧪 Testing Ko-fi API Client...');
try {
  const { getKofiApiClient } = require('../src/lib/kofi-api');
  const kofiClient = getKofiApiClient();
  console.log('✅ Ko-fi API client initialized successfully');
  
  // Test checkout URL generation
  const checkoutUrl = kofiClient.getCheckoutUrl('premium', 'test_user', 'test@example.com');
  console.log(`✅ Checkout URL generated: ${checkoutUrl}`);
} catch (error) {
  console.error('❌ Ko-fi API client initialization failed:', error.message);
}

console.log('\n🏁 Environment test completed');
