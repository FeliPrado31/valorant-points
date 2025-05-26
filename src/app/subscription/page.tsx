'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import Navigation from '@/components/Navigation';
import { Target, Crown, Zap } from 'lucide-react';
import { PricingTable, UserProfile } from '@clerk/nextjs';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-types';

interface SubscriptionInfo {
  tier: 'free' | 'standard' | 'premium';
  tierInfo: {
    name: string;
    maxActiveMissions: number;
    price: number;
    features: string[];
  };
  maxActiveMissions: number;
  activeMissionsCount: number;
  availableSlots: number;
  canAcceptMissions: boolean;
  nextRefresh?: string;
  hoursUntilRefresh: number;
  subscription: Record<string, unknown>;
}

export default function SubscriptionPage() {
  const { user } = useUser();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPricingTable, setShowPricingTable] = useState(false);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 'standard':
        return <Zap className="h-8 w-8 text-blue-500" />;
      default:
        return <Target className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'border-yellow-600 bg-yellow-600/10';
      case 'standard':
        return 'border-blue-600 bg-blue-600/10';
      default:
        return 'border-gray-600 bg-gray-600/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading subscription information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation user={user} />

      <Container size="lg" padding="md" className="py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Subscription Management</h1>
          <p className="text-gray-300 text-base sm:text-lg">
            Manage your subscription and unlock more missions
          </p>


        </div>

        {subscriptionInfo && (
          <>
            {/* Current Subscription */}
            <Card className={`mb-6 sm:mb-8 ${getTierColor(subscriptionInfo.tier)} border-2`}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {getTierIcon(subscriptionInfo.tier)}
                    <div>
                      <CardTitle className="text-white text-xl sm:text-2xl">
                        {subscriptionInfo.tierInfo.name} Plan
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base sm:text-lg">
                        {subscriptionInfo.tier === 'free' ? 'Free forever' : `$${subscriptionInfo.tierInfo.price}/month`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 ${
                      subscriptionInfo.tier === 'premium' ? 'border-yellow-500 text-yellow-500' :
                      subscriptionInfo.tier === 'standard' ? 'border-blue-500 text-blue-500' :
                      'border-gray-500 text-gray-500'
                    }`}
                  >
                    Current Plan
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <Grid cols={{ default: 1, md: 2 }} gap="md">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Plan Features</h3>
                    <ul className="space-y-2">
                      {subscriptionInfo.tierInfo.features.map((feature, index) => (
                        <li key={index} className="text-gray-300 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-3">Usage Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Active Missions</span>
                        <span className="text-white font-medium">
                          {subscriptionInfo.activeMissionsCount} / {subscriptionInfo.maxActiveMissions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Daily Slots Available</span>
                        <span className="text-white font-medium">
                          {subscriptionInfo.availableSlots}
                        </span>
                      </div>
                      {subscriptionInfo.hoursUntilRefresh > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Next Refresh</span>
                          <span className="text-white font-medium">
                            {subscriptionInfo.hoursUntilRefresh}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Grid>
              </CardContent>
            </Card>

            {/* Upgrade Options */}
            {subscriptionInfo.tier !== 'premium' && (
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  {subscriptionInfo.tier === 'free' ? 'Upgrade Your Plan' : 'Upgrade to Premium'}
                </h2>
                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                  Get more missions and unlock advanced features
                </p>
                <Button
                  onClick={() => setShowPricingTable(true)}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                >
                  View Pricing Plans
                </Button>
              </div>
            )}

            {/* Clerk Pricing Table */}
            {showPricingTable && (
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-center text-2xl">Choose Your Plan</CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    Select the plan that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingTable
                    appearance={{
                      elements: {
                        card: "bg-slate-800 border-slate-700",
                        cardHeader: "text-white",
                        cardContent: "text-gray-300",
                        button: "bg-red-600 hover:bg-red-700"
                      }
                    }}
                    newSubscriptionRedirectUrl="/subscription"
                  />
                  <div className="mt-4 text-center text-sm text-gray-400">
                    <p>Available Plans:</p>
                    <p>Standard: {SUBSCRIPTION_TIERS.standard.clerkPlanId}</p>
                    <p>Premium: {SUBSCRIPTION_TIERS.premium.clerkPlanId}</p>
                  </div>
                  <div className="text-center mt-6">
                    <Button
                      onClick={() => setShowPricingTable(false)}
                      variant="outline"
                      className="text-white border-slate-600 hover:bg-slate-800"
                    >
                      Hide Pricing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Management */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Subscription Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your billing and subscription settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile
                  appearance={{
                    elements: {
                      card: "bg-slate-800 border-slate-700",
                      navbar: "bg-slate-700",
                      navbarButton: "text-white hover:bg-slate-600",
                      headerTitle: "text-white",
                      headerSubtitle: "text-gray-300"
                    }
                  }}
                />
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}
