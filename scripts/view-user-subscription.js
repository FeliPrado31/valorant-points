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

async function viewUserSubscription() {
  try {
    const userId = 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE';
    console.log(`🔍 Viewing subscription data for user: ${userId}`);

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.log('❌ User not found');
      return;
    }

    const userData = userDoc.data();
    
    console.log('\n📊 CURRENT USER DATA:');
    console.log('='.repeat(50));
    console.log(`👤 User ID: ${userData.id}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`👤 Username: ${userData.username}`);
    console.log(`🎮 Valorant Tag: ${userData.valorantTag}`);
    
    console.log('\n💳 SUBSCRIPTION DATA:');
    console.log('-'.repeat(30));
    if (userData.subscription) {
      console.log(`📦 Tier: ${userData.subscription.tier}`);
      console.log(`📊 Status: ${userData.subscription.status}`);
      console.log(`🏢 Provider: ${userData.subscription.provider}`);
      console.log(`🔗 Ko-fi Subscription ID: ${userData.subscription.kofiSubscriptionId || 'None'}`);
      console.log(`🏷️  Ko-fi Tier ID: ${userData.subscription.kofiTierId || 'None'}`);
      console.log(`📅 Current Period Start: ${userData.subscription.currentPeriodStart ? new Date(userData.subscription.currentPeriodStart._seconds * 1000).toISOString() : 'None'}`);
      console.log(`📅 Current Period End: ${userData.subscription.currentPeriodEnd ? new Date(userData.subscription.currentPeriodEnd._seconds * 1000).toISOString() : 'None'}`);
    } else {
      console.log('❌ No subscription data found');
    }

    console.log('\n🎯 MISSION LIMITS:');
    console.log('-'.repeat(30));
    if (userData.missionLimits) {
      console.log(`🎯 Max Active Missions: ${userData.missionLimits.maxActiveMissions}`);
      console.log(`📊 Available Slots: ${userData.missionLimits.availableSlots}`);
      console.log(`🔄 Last Refresh: ${userData.missionLimits.lastRefresh ? new Date(userData.missionLimits.lastRefresh._seconds * 1000).toISOString() : 'None'}`);
      console.log(`⏰ Next Refresh: ${userData.missionLimits.nextRefresh ? new Date(userData.missionLimits.nextRefresh._seconds * 1000).toISOString() : 'None'}`);
    } else {
      console.log('❌ No mission limits data found');
    }

    console.log('\n📋 DAILY MISSIONS:');
    console.log('-'.repeat(30));
    if (userData.dailyMissions) {
      console.log(`📝 Selected Mission IDs: ${userData.dailyMissions.selectedMissionIds ? userData.dailyMissions.selectedMissionIds.join(', ') : 'None'}`);
      console.log(`🔄 Last Refresh: ${userData.dailyMissions.lastRefresh ? new Date(userData.dailyMissions.lastRefresh._seconds * 1000).toISOString() : 'None'}`);
      console.log(`⏰ Next Refresh: ${userData.dailyMissions.nextRefresh ? new Date(userData.dailyMissions.nextRefresh._seconds * 1000).toISOString() : 'None'}`);
    } else {
      console.log('❌ No daily missions data found');
    }

    console.log('\n📅 TIMESTAMPS:');
    console.log('-'.repeat(30));
    console.log(`📅 Created At: ${userData.createdAt ? new Date(userData.createdAt._seconds * 1000).toISOString() : 'None'}`);
    console.log(`📅 Updated At: ${userData.updatedAt ? new Date(userData.updatedAt._seconds * 1000).toISOString() : 'None'}`);

    // Check current active missions
    console.log('\n🎯 ACTIVE MISSIONS:');
    console.log('-'.repeat(30));
    const activeMissionsSnapshot = await db
      .collection('userMissions')
      .where('userId', '==', userId)
      .where('isCompleted', '==', false)
      .get();

    console.log(`📊 Active missions count: ${activeMissionsSnapshot.docs.length}`);
    
    if (activeMissionsSnapshot.docs.length > 0) {
      for (const doc of activeMissionsSnapshot.docs) {
        const userMission = doc.data();
        console.log(`  - Mission ID: ${userMission.missionId}, Progress: ${userMission.progress}`);
      }
    }

    console.log('\n✅ User subscription data retrieved successfully!');

  } catch (error) {
    console.error('❌ Error viewing user subscription:', error);
  }
}

// Run the script
viewUserSubscription().then(() => {
  console.log('\n🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
