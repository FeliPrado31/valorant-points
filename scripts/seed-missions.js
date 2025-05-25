const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'mentoria-b5874',
  });
}

const db = admin.firestore();

const missions = [
  // Easy Missions
  {
    title: "First Blood",
    description: "Get 5 kills in any game mode",
    type: "kills",
    target: 5,
    reward: 100,
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Headshot Hunter",
    description: "Get 3 headshots in any match",
    type: "headshots",
    target: 3,
    reward: 150,
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Spike Rush Champion",
    description: "Win 2 Spike Rush matches",
    type: "wins",
    target: 2,
    reward: 120,
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Medium Missions
  {
    title: "Killing Spree",
    description: "Get 25 kills across multiple matches",
    type: "kills",
    target: 25,
    reward: 300,
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Precision Master",
    description: "Get 15 headshots across multiple matches",
    type: "headshots",
    target: 15,
    reward: 400,
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Competitive Warrior",
    description: "Win 5 Competitive matches",
    type: "wins",
    target: 5,
    reward: 500,
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Round Dominator",
    description: "Win 50 rounds across all matches",
    type: "rounds",
    target: 50,
    reward: 350,
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Hard Missions
  {
    title: "Elimination Expert",
    description: "Get 100 kills across multiple matches",
    type: "kills",
    target: 100,
    reward: 1000,
    difficulty: "hard",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Headshot Legend",
    description: "Get 50 headshots across multiple matches",
    type: "headshots",
    target: 50,
    reward: 1200,
    difficulty: "hard",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Victory Streak",
    description: "Win 15 matches in any game mode",
    type: "wins",
    target: 15,
    reward: 1500,
    difficulty: "hard",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Round Master",
    description: "Win 200 rounds across all matches",
    type: "rounds",
    target: 200,
    reward: 1300,
    difficulty: "hard",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Special Missions
  {
    title: "Deathmatch Destroyer",
    description: "Play 5 Deathmatch games",
    type: "gamemode",
    target: 5,
    reward: 200,
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Unrated Explorer",
    description: "Play 10 Unrated matches",
    type: "gamemode",
    target: 10,
    reward: 400,
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedMissions() {
  try {
    console.log('Starting to seed missions...');

    for (const mission of missions) {
      await db.collection('missions').add(mission);
      console.log(`Added mission: ${mission.title}`);
    }

    console.log('Successfully seeded all missions!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding missions:', error);
    process.exit(1);
  }
}

seedMissions();
