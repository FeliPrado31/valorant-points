import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Create service account object from environment variables
const serviceAccount = {
  type: "service_account" as const,
  project_id: process.env.FIREBASE_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_CLIENT_ID!,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
  universe_domain: "googleapis.com"
} as ServiceAccount;

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

// Types for our collections
export interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  valorantTag?: string;
  // Riot ID data
  riotId?: {
    puuid: string;
    region: string;
    name: string;
    tag: string;
    accountLevel: number;
    card: {
      small: string;
      large: string;
      wide: string;
      id: string;
    };
    lastUpdate: string;
    lastUpdateRaw: number;
  };
  // Subscription and mission limits
  subscription?: {
    tier: 'free' | 'standard' | 'premium';
    status: 'active' | 'inactive' | 'cancelled';
    provider: 'kofi';
    kofiSubscriptionId?: string;
    kofiTierId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  };
  missionLimits?: {
    maxActiveMissions: number;
    availableSlots: number;
    lastRefresh: Date;
    nextRefresh: Date;
  };
  // Daily mission selection
  dailyMissions?: {
    selectedMissionIds: string[];
    lastRefresh: Date;
    nextRefresh: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'kills' | 'headshots' | 'gamemode' | 'weapon' | 'rounds' | 'wins';
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date; // When the mission was accepted/started
  acceptedAt: Date; // Alias for startedAt for clarity
  lastUpdated: Date;
}

export interface ValorantMatch {
  id: string;
  userId: string;
  matchId: string;
  gameMode: string;
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  weapon?: string;
  roundsWon: number;
  roundsLost: number;
  won: boolean;
  playedAt: Date;
  processedAt: Date;
}

// Re-export subscription types and utilities from client-safe module
export {
  SUBSCRIPTION_TIERS,
  KOFI_TIER_ID_TO_TIER,
  getSubscriptionTier,
  getMaxActiveMissions,
  shouldRefreshMissionSlots,
  shouldRefreshDailyMissions,
  generateDailyMissionSelection,
  getTierFromKofiTierId,
  getKofiTierIdFromTier,
  type SubscriptionTierKey
} from './subscription-types';

export type SubscriptionTier = import('./subscription-types').SubscriptionTierKey;
