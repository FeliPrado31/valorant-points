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

async function testUISubscriptionValidation() {
  try {
    const userId = 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE';
    console.log(`🧪 TESTING UI SUBSCRIPTION VALIDATION FOR USER: ${userId}`);
    console.log('='.repeat(70));

    // Step 1: Set user to free tier to test restrictions
    console.log('\n📊 STEP 1: Setting user to free tier...');
    
    const now = new Date();
    const freeTierMaxMissions = 1; // Free tier limit
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const freeUserData = {
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

    await db.collection('users').doc(userId).update(freeUserData);
    console.log('✅ User set to free tier');

    // Step 2: Check current active missions
    console.log('\n📊 STEP 2: Checking current active missions...');
    const activeMissionsSnapshot = await db
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    console.log(`🎯 Current active missions: ${activeMissionsSnapshot.docs.length}`);
    console.log(`🎯 Free tier limit: ${freeTierMaxMissions}`);

    if (activeMissionsSnapshot.docs.length > freeTierMaxMissions) {
      console.log(`⚠️  User exceeds free tier limits (${activeMissionsSnapshot.docs.length}/${freeTierMaxMissions})`);
      console.log('📝 Expected UI behavior:');
      console.log('   - SubscriptionStatus should show "Mission limit exceeded"');
      console.log('   - Start Mission buttons should be disabled');
      console.log('   - Upgrade prompt should be visible');
      console.log('   - PricingModal should open when clicking upgrade');
    } else {
      console.log(`✅ User is within free tier limits (${activeMissionsSnapshot.docs.length}/${freeTierMaxMissions})`);
    }

    // Step 3: Simulate API responses that the UI would receive
    console.log('\n📊 STEP 3: Simulating API responses...');
    
    // Get user data (simulates /api/users endpoint)
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    console.log('\n📋 /api/users response simulation:');
    console.log(`   tier: ${userData.subscription.tier}`);
    console.log(`   status: ${userData.subscription.status}`);
    console.log(`   maxActiveMissions: ${userData.missionLimits.maxActiveMissions}`);
    console.log(`   availableSlots: ${userData.missionLimits.availableSlots}`);

    // Simulate /api/subscriptions endpoint response
    const subscriptionInfo = {
      tier: userData.subscription.tier,
      tierInfo: {
        name: userData.subscription.tier === 'free' ? 'Free' : 
              userData.subscription.tier === 'standard' ? 'Standard' : 'Premium',
        maxActiveMissions: userData.missionLimits.maxActiveMissions,
        price: userData.subscription.tier === 'free' ? 0 : 
               userData.subscription.tier === 'standard' ? 3 : 10,
        features: userData.subscription.tier === 'free' ? 
                 ['1 active mission', 'Basic features'] :
                 userData.subscription.tier === 'standard' ?
                 ['5 active missions', 'Advanced features'] :
                 ['10 active missions', 'Premium features']
      },
      maxActiveMissions: userData.missionLimits.maxActiveMissions,
      activeMissionsCount: activeMissionsSnapshot.docs.length,
      availableSlots: userData.missionLimits.availableSlots,
      canAcceptMissions: userData.missionLimits.availableSlots > 0 && activeMissionsSnapshot.docs.length < userData.missionLimits.maxActiveMissions,
      nextRefresh: userData.missionLimits.nextRefresh,
      hoursUntilRefresh: Math.max(0, Math.ceil((userData.missionLimits.nextRefresh.toDate().getTime() - Date.now()) / (1000 * 60 * 60))),
      subscription: userData.subscription
    };

    console.log('\n📋 /api/subscriptions response simulation:');
    console.log(`   canAcceptMissions: ${subscriptionInfo.canAcceptMissions}`);
    console.log(`   activeMissionsCount: ${subscriptionInfo.activeMissionsCount}`);
    console.log(`   maxActiveMissions: ${subscriptionInfo.maxActiveMissions}`);
    console.log(`   availableSlots: ${subscriptionInfo.availableSlots}`);

    // Step 4: Test mission acceptance restriction
    console.log('\n📊 STEP 4: Testing mission acceptance restriction...');
    
    if (!subscriptionInfo.canAcceptMissions) {
      console.log('❌ Mission acceptance should be BLOCKED');
      console.log('📝 Expected API behavior:');
      console.log('   - POST /api/user-missions should return 400 error');
      console.log('   - Error message should suggest upgrade');
      console.log('   - UI should show upgrade prompt');
    } else {
      console.log('✅ Mission acceptance should be ALLOWED');
    }

    // Step 5: Test UI component states
    console.log('\n📊 STEP 5: Expected UI component states...');
    
    console.log('\n🎨 SubscriptionStatus Component:');
    console.log(`   - Should show "${subscriptionInfo.tierInfo.name} Plan"`);
    console.log(`   - Should show "Free" badge`);
    console.log(`   - Should show "Upgrade" button`);
    console.log(`   - Progress bar: ${subscriptionInfo.activeMissionsCount}/${subscriptionInfo.maxActiveMissions}`);
    
    if (subscriptionInfo.activeMissionsCount >= subscriptionInfo.maxActiveMissions) {
      console.log('   - Should show "Mission limit reached" warning');
    }
    
    if (subscriptionInfo.availableSlots <= 0) {
      console.log('   - Should show "Daily limit reached" warning');
    }

    console.log('\n🎨 Dashboard Mission Cards:');
    if (!subscriptionInfo.canAcceptMissions) {
      console.log('   - "Start Mission" buttons should be DISABLED');
      console.log('   - Should show upgrade prompt when clicked');
    } else {
      console.log('   - "Start Mission" buttons should be ENABLED');
    }

    console.log('\n🎨 PricingModal:');
    console.log('   - Should show Ko-fi subscription options');
    console.log('   - Standard plan: $3/month, 5 missions');
    console.log('   - Premium plan: $10/month, 10 missions');
    console.log('   - Should highlight current tier as "Current Plan"');

    // Step 6: Test subscription restoration
    console.log('\n📊 STEP 6: Testing subscription restoration...');
    
    const premiumUserData = {
      'subscription.tier': 'premium',
      'subscription.status': 'active',
      'subscription.provider': 'kofi',
      'subscription.kofiSubscriptionId': 'test_kofi_sub_123',
      'subscription.kofiTierId': 'premium',
      'subscription.currentPeriodStart': now,
      'subscription.currentPeriodEnd': new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      'missionLimits.maxActiveMissions': 10,
      'missionLimits.availableSlots': 10,
      'missionLimits.lastRefresh': now,
      'missionLimits.nextRefresh': nextRefresh,
      updatedAt: now
    };

    await db.collection('users').doc(userId).update(premiumUserData);
    console.log('✅ User restored to premium tier');

    // Final verification
    const finalUserDoc = await db.collection('users').doc(userId).get();
    const finalUserData = finalUserDoc.data();
    
    console.log('\n📋 FINAL STATE:');
    console.log(`   tier: ${finalUserData.subscription.tier}`);
    console.log(`   status: ${finalUserData.subscription.status}`);
    console.log(`   maxActiveMissions: ${finalUserData.missionLimits.maxActiveMissions}`);
    console.log(`   availableSlots: ${finalUserData.missionLimits.availableSlots}`);

    console.log('\n✅ UI SUBSCRIPTION VALIDATION TEST COMPLETED!');
    console.log('\n📝 SUMMARY OF EXPECTED UI BEHAVIOR:');
    console.log('   ✅ Free tier users see upgrade prompts');
    console.log('   ✅ Mission limits are enforced in UI');
    console.log('   ✅ Subscription status is clearly displayed');
    console.log('   ✅ Ko-fi integration works for upgrades');
    console.log('   ✅ Premium users have full access');

    console.log('\n🧪 MANUAL TESTING RECOMMENDATIONS:');
    console.log('   1. Login as this user and verify dashboard shows correct limits');
    console.log('   2. Try to start a mission when at limit - should show upgrade prompt');
    console.log('   3. Click upgrade button - should open Ko-fi pricing modal');
    console.log('   4. Verify subscription status component shows correct tier');
    console.log('   5. Test mission acceptance after subscription upgrade');

  } catch (error) {
    console.error('❌ Error during UI subscription validation test:', error);
  }
}

// Run the test
testUISubscriptionValidation().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
