// Client-safe subscription types and constants
// This file can be imported in both client and server components

export interface SubscriptionTier {
  name: string;
  maxActiveMissions: number;
  price: number;
  clerkPlanId: string | null;
  features: string[];
}

// Subscription tier configuration with Clerk plan IDs
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    maxActiveMissions: 3,
    price: 0,
    clerkPlanId: null,
    features: ['Up to 3 active missions', 'Basic mission tracking', 'Daily mission refresh']
  },
  standard: {
    name: 'Standard',
    maxActiveMissions: 5,
    price: 3,
    clerkPlanId: 'cplan_2xb4nXJsuap2kli8KvX3bIgIPAA',
    features: ['Up to 5 active missions', 'Advanced mission tracking', 'Daily mission refresh', 'Priority support']
  },
  premium: {
    name: 'Premium',
    maxActiveMissions: 10,
    price: 10,
    clerkPlanId: 'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9',
    features: ['Up to 10 active missions', 'Advanced mission tracking', 'Daily mission refresh', 'Priority support', 'Exclusive missions']
  }
} as const;

// Plan ID to tier mapping for reverse lookup
export const CLERK_PLAN_ID_TO_TIER = {
  'cplan_2xb4nXJsuap2kli8KvX3bIgIPAA': 'standard',
  'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9': 'premium'
} as const;

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;

// Utility functions for subscription management (client-safe)
export const getSubscriptionTier = (user: Record<string, unknown>): SubscriptionTierKey => {
  const subscription = user?.subscription as { tier?: SubscriptionTierKey } | undefined;
  return subscription?.tier || 'free';
};

export const getMaxActiveMissions = (tier: SubscriptionTierKey): number => {
  return SUBSCRIPTION_TIERS[tier].maxActiveMissions;
};

export const shouldRefreshMissionSlots = (user: Record<string, unknown>): boolean => {
  const missionLimits = user?.missionLimits as { lastRefresh?: unknown } | undefined;
  if (!missionLimits?.lastRefresh) return true;

  const now = new Date();
  let lastRefresh: Date;

  // Handle different date formats: Firestore Timestamp, Date object, or string
  const lastRefreshValue = missionLimits.lastRefresh;
  if (lastRefreshValue && typeof lastRefreshValue === 'object' && 'toDate' in lastRefreshValue && typeof (lastRefreshValue as { toDate: () => Date }).toDate === 'function') {
    // Firestore Timestamp
    lastRefresh = (lastRefreshValue as { toDate: () => Date }).toDate();
  } else if (lastRefreshValue instanceof Date) {
    // Already a Date object
    lastRefresh = lastRefreshValue;
  } else {
    // String or other format
    lastRefresh = new Date(lastRefreshValue as string);
  }

  // Validate the date
  if (isNaN(lastRefresh.getTime())) {
    console.warn('Invalid lastRefresh date, forcing refresh');
    return true;
  }

  const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
  return hoursSinceRefresh >= 24;
};

// Get tier from Clerk plan ID
export const getTierFromClerkPlanId = (planId: string): SubscriptionTierKey => {
  return CLERK_PLAN_ID_TO_TIER[planId as keyof typeof CLERK_PLAN_ID_TO_TIER] || 'free';
};

// Get Clerk plan ID from tier
export const getClerkPlanIdFromTier = (tier: SubscriptionTierKey): string | null => {
  return SUBSCRIPTION_TIERS[tier].clerkPlanId;
};

// Check if daily missions need refresh
export const shouldRefreshDailyMissions = (user: Record<string, unknown>): boolean => {
  const dailyMissions = user?.dailyMissions as { lastRefresh?: unknown } | undefined;
  if (!dailyMissions?.lastRefresh) return true;

  const now = new Date();
  let lastRefresh: Date;

  // Handle different date formats: Firestore Timestamp, Date object, or string
  const lastRefreshValue = dailyMissions.lastRefresh;
  if (lastRefreshValue && typeof lastRefreshValue === 'object' && 'toDate' in lastRefreshValue && typeof (lastRefreshValue as { toDate: () => Date }).toDate === 'function') {
    // Firestore Timestamp
    lastRefresh = (lastRefreshValue as { toDate: () => Date }).toDate();
  } else if (lastRefreshValue instanceof Date) {
    // Already a Date object
    lastRefresh = lastRefreshValue;
  } else {
    // String or other format
    lastRefresh = new Date(lastRefreshValue as string);
  }

  // Validate the date
  if (isNaN(lastRefresh.getTime())) {
    console.warn('Invalid lastRefresh date for daily missions, forcing refresh');
    return true;
  }

  const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
  return hoursSinceRefresh >= 24;
};

// Generate deterministic random selection of missions based on user ID and date
export const generateDailyMissionSelection = (
  allMissions: Array<{ id: string }>,
  userId: string,
  maxMissions: number
): string[] => {
  if (allMissions.length <= maxMissions) {
    return allMissions.map(m => m.id);
  }

  // Create a deterministic seed based on user ID and current date (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const seedString = `${userId}-${today}`;

  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash as seed for deterministic randomization
  const seed = Math.abs(hash);

  // Fisher-Yates shuffle with deterministic random
  const missions = [...allMissions];
  let currentIndex = missions.length;
  let randomIndex: number;

  // Simple linear congruential generator for deterministic randomness
  let rng = seed;
  const nextRandom = () => {
    rng = (rng * 1664525 + 1013904223) % 4294967296;
    return rng / 4294967296;
  };

  while (currentIndex !== 0) {
    randomIndex = Math.floor(nextRandom() * currentIndex);
    currentIndex--;
    [missions[currentIndex], missions[randomIndex]] = [missions[randomIndex], missions[currentIndex]];
  }

  return missions.slice(0, maxMissions).map(m => m.id);
};
