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
export const getSubscriptionTier = (user: any): SubscriptionTierKey => {
  return user?.subscription?.tier || 'free';
};

export const getMaxActiveMissions = (tier: SubscriptionTierKey): number => {
  return SUBSCRIPTION_TIERS[tier].maxActiveMissions;
};

export const shouldRefreshMissionSlots = (user: any): boolean => {
  if (!user?.missionLimits?.lastRefresh) return true;

  const now = new Date();
  let lastRefresh: Date;

  // Handle different date formats: Firestore Timestamp, Date object, or string
  if (user.missionLimits.lastRefresh.toDate && typeof user.missionLimits.lastRefresh.toDate === 'function') {
    // Firestore Timestamp
    lastRefresh = user.missionLimits.lastRefresh.toDate();
  } else if (user.missionLimits.lastRefresh instanceof Date) {
    // Already a Date object
    lastRefresh = user.missionLimits.lastRefresh;
  } else {
    // String or other format
    lastRefresh = new Date(user.missionLimits.lastRefresh);
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
