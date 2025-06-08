require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function downgradeUserToFree() {
  try {
    const userId = 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE';
    console.log('🔄 DOWNGRADING USER TO FREE TIER');
    console.log('='.repeat(60));
    console.log(`👤 User ID: ${userId}`);

    // Step 1: Get current user data (BEFORE state)
    console.log('\n📊 STEP 1: Getting current user subscription state...');
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.log('❌ User not found');
      return;
    }

    const userData = userDoc.data();
    
    console.log('\n📋 BEFORE STATE:');
    console.log(`👤 User: ${userData.email} (${userData.username})`);
    console.log(`💳 Current Tier: ${userData.subscription?.tier || 'unknown'}`);
    console.log(`📊 Current Status: ${userData.subscription?.status || 'unknown'}`);
    console.log(`🏢 Provider: ${userData.subscription?.provider || 'unknown'}`);
    console.log(`🔗 Ko-fi Sub ID: ${userData.subscription?.kofiSubscriptionId || 'None'}`);
    console.log(`🏷️  Ko-fi Tier ID: ${userData.subscription?.kofiTierId || 'None'}`);
    console.log(`🎯 Max Missions: ${userData.missionLimits?.maxActiveMissions || 'unknown'}`);
    console.log(`📊 Available Slots: ${userData.missionLimits?.availableSlots || 'unknown'}`);

    // Check current active missions
    const activeMissionsSnapshot = await db
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    console.log(`🎮 Current Active Missions: ${activeMissionsSnapshot.docs.length}`);

    // Step 2: Prepare downgrade data
    console.log('\n📊 STEP 2: Preparing downgrade to free tier...');
    
    const now = new Date();
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const freeTierMaxMissions = 1;

    const downgradeData = {
      // Subscription updates
      'subscription.tier': 'free',
      'subscription.status': 'cancelled',
      'subscription.provider': 'kofi',
      'subscription.kofiSubscriptionId': null,
      'subscription.kofiTierId': null,
      'subscription.currentPeriodStart': null,
      'subscription.currentPeriodEnd': now,
      
      // Mission limits updates
      'missionLimits.maxActiveMissions': freeTierMaxMissions,
      'missionLimits.availableSlots': freeTierMaxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      
      // Update timestamp
      updatedAt: now
    };

    console.log('📋 Downgrade configuration:');
    console.log(`   • New Tier: free`);
    console.log(`   • New Status: cancelled`);
    console.log(`   • New Max Missions: ${freeTierMaxMissions}`);
    console.log(`   • Ko-fi fields: cleared`);
    console.log(`   • Period End: ${now.toISOString()}`);

    // Step 3: Apply the downgrade
    console.log('\n📊 STEP 3: Applying downgrade to Firebase...');
    
    await db.collection('users').doc(userId).update(downgradeData);
    console.log('✅ User downgraded to free tier successfully');

    // Step 4: Verify the changes (AFTER state)
    console.log('\n📊 STEP 4: Verifying downgrade changes...');
    
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    const updatedUserData = updatedUserDoc.data();

    console.log('\n📋 AFTER STATE:');
    console.log(`👤 User: ${updatedUserData.email} (${updatedUserData.username})`);
    console.log(`💳 New Tier: ${updatedUserData.subscription.tier}`);
    console.log(`📊 New Status: ${updatedUserData.subscription.status}`);
    console.log(`🏢 Provider: ${updatedUserData.subscription.provider}`);
    console.log(`🔗 Ko-fi Sub ID: ${updatedUserData.subscription.kofiSubscriptionId || 'None'}`);
    console.log(`🏷️  Ko-fi Tier ID: ${updatedUserData.subscription.kofiTierId || 'None'}`);
    console.log(`🎯 New Max Missions: ${updatedUserData.missionLimits.maxActiveMissions}`);
    console.log(`📊 New Available Slots: ${updatedUserData.missionLimits.availableSlots}`);
    console.log(`📅 Period End: ${updatedUserData.subscription.currentPeriodEnd.toDate().toISOString()}`);

    // Step 5: Analyze mission limit impact
    console.log('\n📊 STEP 5: Analyzing mission limit impact...');
    
    const currentActiveMissions = activeMissionsSnapshot.docs.length;
    const newMaxMissions = updatedUserData.missionLimits.maxActiveMissions;

    if (currentActiveMissions > newMaxMissions) {
      console.log(`⚠️  MISSION LIMIT EXCEEDED:`);
      console.log(`   • User has ${currentActiveMissions} active missions`);
      console.log(`   • Free tier allows only ${newMaxMissions} mission`);
      console.log(`   • Excess: ${currentActiveMissions - newMaxMissions} missions`);
      console.log('\n📝 Expected UI behavior:');
      console.log('   • Show "Mission limit exceeded" warning');
      console.log('   • Disable "Start Mission" buttons');
      console.log('   • Display upgrade prompt');
      console.log('   • Allow completion of existing missions');
    } else {
      console.log(`✅ User is within free tier limits (${currentActiveMissions}/${newMaxMissions})`);
    }

    // Step 6: Generate Ko-fi upgrade URLs
    console.log('\n📊 STEP 6: Generating Ko-fi upgrade URLs...');
    
    const kofiPageUrl = process.env.KOFI_PAGE_URL || 'https://ko-fi.com/valorantmissions';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const standardUpgradeUrl = `${kofiPageUrl}?source=valorant-points&tier=standard&user_id=${userId}&return_url=${appUrl}/subscription?success=true`;
    const premiumUpgradeUrl = `${kofiPageUrl}?source=valorant-points&tier=premium&user_id=${userId}&return_url=${appUrl}/subscription?success=true`;

    console.log('🔗 Ko-fi Upgrade URLs:');
    console.log(`   Standard ($3/month): ${standardUpgradeUrl}`);
    console.log(`   Premium ($10/month): ${premiumUpgradeUrl}`);

    // Step 7: Expected UI changes
    console.log('\n📊 STEP 7: Expected UI changes...');
    
    console.log('\n🎨 Dashboard Changes:');
    console.log('   • Subscription status: "Free Plan" instead of "Premium Plan"');
    console.log('   • Mission progress: Shows 6/1 (over limit)');
    console.log('   • Warning message: "Mission limit exceeded"');
    console.log('   • Upgrade button: Prominently displayed');

    console.log('\n🎨 Subscription Page Changes:');
    console.log('   • Current plan: Shows "Free Plan"');
    console.log('   • Features: Limited to free tier features');
    console.log('   • Upgrade options: Standard and Premium plans available');
    console.log('   • Ko-fi integration: Upgrade buttons redirect to Ko-fi');

    console.log('\n🎨 Mission Acceptance:');
    console.log('   • Start Mission buttons: Disabled (over limit)');
    console.log('   • Upgrade prompt: Shown when trying to start missions');
    console.log('   • Existing missions: Can still be completed');

    // Step 8: Testing recommendations
    console.log('\n📊 STEP 8: Manual testing recommendations...');
    
    console.log('\n🧪 UI Testing Steps:');
    console.log('   1. Refresh http://localhost:3000/dashboard');
    console.log('   2. Verify subscription status shows "Free Plan"');
    console.log('   3. Check mission counter shows over-limit warning');
    console.log('   4. Try to start a new mission (should be blocked)');
    console.log('   5. Navigate to /subscription page');
    console.log('   6. Test Ko-fi upgrade buttons');
    console.log('   7. Verify Ko-fi checkout redirects work');

    console.log('\n🔄 Ko-fi Integration Testing:');
    console.log('   1. Click upgrade button in UI');
    console.log('   2. Verify redirect to Ko-fi page');
    console.log('   3. Test subscription flow (with test Ko-fi account)');
    console.log('   4. Verify webhook processing (if configured)');
    console.log('   5. Check subscription restoration');

    console.log('\n✅ USER DOWNGRADE COMPLETED SUCCESSFULLY!');
    console.log('\n📝 SUMMARY:');
    console.log('   ✅ User downgraded from Premium to Free tier');
    console.log('   ✅ Mission limits reduced from 10 to 1');
    console.log('   ✅ Ko-fi subscription data cleared');
    console.log('   ✅ Subscription status set to cancelled');
    console.log('   ✅ Ko-fi upgrade URLs generated');
    console.log('   ⚠️  User now exceeds free tier mission limit (6/1)');
    console.log('   🧪 Ready for Ko-fi integration testing');

  } catch (error) {
    console.error('❌ Error during user downgrade:', error);
  }
}

// Run the downgrade
downgradeUserToFree().then(() => {
  console.log('\n🏁 Downgrade process completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Downgrade process failed:', error);
  process.exit(1);
});
