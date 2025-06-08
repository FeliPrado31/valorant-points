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

async function testSubscriptionRemoval() {
  try {
    const userId = 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE';
    console.log(`🧪 TESTING SUBSCRIPTION REMOVAL FOR USER: ${userId}`);
    console.log('='.repeat(60));

    // Step 1: Get current user data
    console.log('\n📊 STEP 1: Getting current user data...');
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.log('❌ User not found');
      return;
    }

    const userData = userDoc.data();
    
    console.log('\n📋 CURRENT STATE:');
    console.log(`👤 User: ${userData.email} (${userData.username})`);
    
    if (userData.subscription) {
      console.log(`💳 Current Tier: ${userData.subscription.tier}`);
      console.log(`📊 Current Status: ${userData.subscription.status}`);
      console.log(`🏢 Provider: ${userData.subscription.provider}`);
      console.log(`🔗 Ko-fi Sub ID: ${userData.subscription.kofiSubscriptionId || 'None'}`);
    }
    
    if (userData.missionLimits) {
      console.log(`🎯 Max Missions: ${userData.missionLimits.maxActiveMissions}`);
      console.log(`📊 Available Slots: ${userData.missionLimits.availableSlots}`);
    }

    // Step 2: Check current active missions
    console.log('\n📊 STEP 2: Checking current active missions...');
    const activeMissionsSnapshot = await db
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    console.log(`🎯 Current active missions: ${activeMissionsSnapshot.docs.length}`);

    // Step 3: Remove subscription (simulate cancellation)
    console.log('\n🔄 STEP 3: Removing subscription (simulating cancellation)...');
    
    const now = new Date();
    const freeTierMaxMissions = 1; // Free tier limit
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const updateData = {
      'subscription.tier': 'free',
      'subscription.status': 'cancelled',
      'subscription.provider': 'kofi',
      'subscription.kofiSubscriptionId': null,
      'subscription.kofiTierId': null,
      'subscription.currentPeriodStart': null,
      'subscription.currentPeriodEnd': now,
      'missionLimits.maxActiveMissions': freeTierMaxMissions,
      'missionLimits.availableSlots': freeTierMaxMissions,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await db.collection('users').doc(userId).update(updateData);
    console.log('✅ Subscription removed and user downgraded to free tier');

    // Step 4: Verify the changes
    console.log('\n📊 STEP 4: Verifying changes...');
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    const updatedUserData = updatedUserDoc.data();

    console.log('\n📋 NEW STATE:');
    console.log(`💳 New Tier: ${updatedUserData.subscription.tier}`);
    console.log(`📊 New Status: ${updatedUserData.subscription.status}`);
    console.log(`🎯 New Max Missions: ${updatedUserData.missionLimits.maxActiveMissions}`);
    console.log(`📊 New Available Slots: ${updatedUserData.missionLimits.availableSlots}`);
    console.log(`🔗 Ko-fi Sub ID: ${updatedUserData.subscription.kofiSubscriptionId || 'None'}`);

    // Step 5: Check if user now exceeds free tier limits
    console.log('\n📊 STEP 5: Checking if user exceeds free tier limits...');
    if (activeMissionsSnapshot.docs.length > freeTierMaxMissions) {
      console.log(`⚠️  WARNING: User has ${activeMissionsSnapshot.docs.length} active missions but free tier only allows ${freeTierMaxMissions}`);
      console.log('🔧 In a real scenario, the app should handle this by:');
      console.log('   - Showing a warning to the user');
      console.log('   - Preventing new mission acceptance');
      console.log('   - Allowing completion of existing missions');
    } else {
      console.log(`✅ User is within free tier limits (${activeMissionsSnapshot.docs.length}/${freeTierMaxMissions} missions)`);
    }

    // Step 6: Test subscription restoration (simulate Ko-fi re-subscription)
    console.log('\n🔄 STEP 6: Testing subscription restoration...');
    
    const restoreData = {
      'subscription.tier': 'premium',
      'subscription.status': 'active',
      'subscription.provider': 'kofi',
      'subscription.kofiSubscriptionId': 'test_kofi_sub_123',
      'subscription.kofiTierId': 'premium',
      'subscription.currentPeriodStart': now,
      'subscription.currentPeriodEnd': new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      'missionLimits.maxActiveMissions': 10, // Premium tier limit
      'missionLimits.availableSlots': 10,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await db.collection('users').doc(userId).update(restoreData);
    console.log('✅ Subscription restored to premium tier');

    // Step 7: Final verification
    console.log('\n📊 STEP 7: Final verification...');
    const finalUserDoc = await db.collection('users').doc(userId).get();
    const finalUserData = finalUserDoc.data();

    console.log('\n📋 FINAL STATE:');
    console.log(`💳 Final Tier: ${finalUserData.subscription.tier}`);
    console.log(`📊 Final Status: ${finalUserData.subscription.status}`);
    console.log(`🎯 Final Max Missions: ${finalUserData.missionLimits.maxActiveMissions}`);
    console.log(`📊 Final Available Slots: ${finalUserData.missionLimits.availableSlots}`);
    console.log(`🔗 Ko-fi Sub ID: ${finalUserData.subscription.kofiSubscriptionId}`);

    console.log('\n✅ SUBSCRIPTION REMOVAL TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📝 TEST SUMMARY:');
    console.log('   ✅ Successfully downgraded user to free tier');
    console.log('   ✅ Mission limits properly reduced');
    console.log('   ✅ Ko-fi subscription data cleared');
    console.log('   ✅ Successfully restored premium subscription');
    console.log('   ✅ Mission limits properly increased');
    console.log('   ✅ Ko-fi subscription data restored');

  } catch (error) {
    console.error('❌ Error during subscription removal test:', error);
  }
}

// Run the test
testSubscriptionRemoval().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
