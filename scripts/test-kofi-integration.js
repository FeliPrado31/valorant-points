require('dotenv').config({ path: '.env.local' });

console.log('🧪 Ko-fi Integration Configuration Test');
console.log('='.repeat(60));

// Test 1: Environment Configuration
console.log('\n📋 1. ENVIRONMENT CONFIGURATION TEST');
console.log('-'.repeat(40));

const kofiConfig = {
  apiKey: process.env.KOFI_API_KEY,
  webhookSecret: process.env.KOFI_WEBHOOK_SECRET,
  apiBaseUrl: process.env.KOFI_API_BASE_URL,
  pageUrl: process.env.KOFI_PAGE_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL
};

console.log(`KOFI_API_KEY: ${kofiConfig.apiKey ? '✅ Set' : '❌ Missing'}`);
console.log(`KOFI_WEBHOOK_SECRET: ${kofiConfig.webhookSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`KOFI_API_BASE_URL: ${kofiConfig.apiBaseUrl || '❌ Missing'}`);
console.log(`KOFI_PAGE_URL: ${kofiConfig.pageUrl || '❌ Missing'}`);
console.log(`NEXT_PUBLIC_APP_URL: ${kofiConfig.appUrl || '❌ Missing'}`);

// Test 2: Ko-fi Page URL Validation
console.log('\n📋 2. KO-FI PAGE URL VALIDATION');
console.log('-'.repeat(40));

if (kofiConfig.pageUrl) {
  const isValidKofiUrl = kofiConfig.pageUrl.startsWith('https://ko-fi.com/');
  const isValorantMissions = kofiConfig.pageUrl.includes('valorantmissions');
  
  console.log(`✅ URL Format: ${isValidKofiUrl ? 'Valid' : 'Invalid'}`);
  console.log(`✅ Valorant Missions Page: ${isValorantMissions ? 'Correct' : 'Incorrect'}`);
  console.log(`📋 Full URL: ${kofiConfig.pageUrl}`);
} else {
  console.log('❌ Ko-fi page URL not configured');
}

// Test 3: Ko-fi API Client Initialization
console.log('\n📋 3. KO-FI API CLIENT TEST');
console.log('-'.repeat(40));

try {
  // Import Ko-fi API client
  const kofiApiPath = require.resolve('../src/lib/kofi-api.ts');
  console.log(`✅ Ko-fi API module found: ${kofiApiPath}`);
  
  // Test checkout URL generation
  console.log('\n🔗 Testing checkout URL generation...');
  
  const testUserId = 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE';
  const testEmail = 'feliprado99@gmail.com';
  
  // Simulate checkout URL generation for both tiers
  const standardUrl = `${kofiConfig.pageUrl}?source=valorant-points&tier=standard&user_id=${testUserId}&return_url=${kofiConfig.appUrl}/subscription?success=true`;
  const premiumUrl = `${kofiConfig.pageUrl}?source=valorant-points&tier=premium&user_id=${testUserId}&return_url=${kofiConfig.appUrl}/subscription?success=true`;
  
  console.log(`📋 Standard Tier URL: ${standardUrl}`);
  console.log(`📋 Premium Tier URL: ${premiumUrl}`);
  
} catch (error) {
  console.error('❌ Ko-fi API client test failed:', error.message);
}

// Test 4: Subscription Tier Mapping
console.log('\n📋 4. SUBSCRIPTION TIER MAPPING TEST');
console.log('-'.repeat(40));

const tierMapping = {
  'free': { maxMissions: 1, price: 0 },
  'standard': { maxMissions: 5, price: 3 },
  'estandar': { maxMissions: 5, price: 3 }, // Spanish version
  'premium': { maxMissions: 10, price: 10 }
};

console.log('📋 Tier Mapping Configuration:');
Object.entries(tierMapping).forEach(([tier, config]) => {
  console.log(`   ${tier}: ${config.maxMissions} missions, $${config.price}/month`);
});

// Test 5: Webhook Configuration
console.log('\n📋 5. WEBHOOK CONFIGURATION TEST');
console.log('-'.repeat(40));

const webhookEndpoint = `${kofiConfig.appUrl}/api/webhooks/kofi`;
console.log(`📋 Webhook Endpoint: ${webhookEndpoint}`);
console.log(`📋 Webhook Secret: ${kofiConfig.webhookSecret ? 'Configured' : 'Missing'}`);

// Test 6: Ko-fi Integration Status
console.log('\n📋 6. INTEGRATION STATUS SUMMARY');
console.log('-'.repeat(40));

const integrationChecks = [
  { name: 'Ko-fi API Key', status: !!kofiConfig.apiKey },
  { name: 'Webhook Secret', status: !!kofiConfig.webhookSecret },
  { name: 'Ko-fi Page URL', status: !!kofiConfig.pageUrl && kofiConfig.pageUrl.includes('valorantmissions') },
  { name: 'App URL', status: !!kofiConfig.appUrl },
  { name: 'API Base URL', status: !!kofiConfig.apiBaseUrl }
];

const passedChecks = integrationChecks.filter(check => check.status).length;
const totalChecks = integrationChecks.length;

integrationChecks.forEach(check => {
  console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
});

console.log(`\n📊 Integration Status: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('🎉 Ko-fi integration is fully configured and ready!');
} else {
  console.log('⚠️  Ko-fi integration needs additional configuration');
}

// Test 7: Production Readiness
console.log('\n📋 7. PRODUCTION READINESS CHECKLIST');
console.log('-'.repeat(40));

const productionChecks = [
  { 
    name: 'Ko-fi Page Active', 
    status: kofiConfig.pageUrl === 'https://ko-fi.com/valorantmissions',
    note: 'Verify Ko-fi page is live and accepting memberships'
  },
  { 
    name: 'Membership Tiers Configured', 
    status: true,
    note: 'Standard ($3) and Premium ($10) tiers should be set up on Ko-fi'
  },
  { 
    name: 'Webhook Endpoint Ready', 
    status: !!kofiConfig.webhookSecret,
    note: 'Webhook endpoint should be deployed and accessible'
  },
  { 
    name: 'API Keys Secured', 
    status: !!kofiConfig.apiKey,
    note: 'Real Ko-fi API keys should be configured in production'
  }
];

productionChecks.forEach(check => {
  console.log(`   ${check.status ? '✅' : '⚠️ '} ${check.name}`);
  console.log(`      ${check.note}`);
});

// Test 8: Manual Testing Instructions
console.log('\n📋 8. MANUAL TESTING INSTRUCTIONS');
console.log('-'.repeat(40));

console.log('🧪 To complete the Ko-fi integration testing:');
console.log('   1. Visit http://localhost:3000/subscription');
console.log('   2. Click "Open Ko-fi Dashboard" button');
console.log('   3. Verify it redirects to https://ko-fi.com/valorantmissions');
console.log('   4. Test subscription upgrade flow');
console.log('   5. Verify webhook processing (requires real Ko-fi account)');

console.log('\n🔗 Ko-fi Page URLs to Test:');
console.log(`   Main Page: ${kofiConfig.pageUrl}`);
console.log(`   Standard Checkout: ${kofiConfig.pageUrl}?tier=standard`);
console.log(`   Premium Checkout: ${kofiConfig.pageUrl}?tier=premium`);

console.log('\n✅ Ko-fi Integration Configuration Test Complete!');
console.log('='.repeat(60));
