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

async function clearMatches() {
  try {
    console.log('🧹 Clearing existing Valorant matches to allow reprocessing with fixed game mode logic...');

    // Get all matches for the user
    const matchesSnapshot = await db
      .collection('valorantMatches')
      .where('userId', '==', 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE')
      .get();

    console.log(`📊 Found ${matchesSnapshot.docs.length} existing matches to delete`);

    // Delete all matches
    const batch = db.batch();
    matchesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log('✅ Successfully cleared all existing matches');
    console.log('🔄 Now you can trigger "Refresh Progress" to reprocess matches with the fixed game mode logic');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing matches:', error);
    process.exit(1);
  }
}

clearMatches();
