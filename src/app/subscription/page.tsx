'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import Navigation from '@/components/Navigation';
import { KofiEmailConfirmationModal } from '@/components/KofiEmailConfirmationModal';
import { Target, Crown, Zap } from 'lucide-react';


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
  const [updating, setUpdating] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [pendingTier, setPendingTier] = useState<'standard' | 'premium' | null>(null);

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

  const manualUpdateToPremium = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: 'premium',
          kofiTierId: 'premium',
          kofiSubscriptionId: 'sub_test_premium_manual'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Ko-fi subscription updated:', result);
        // Refresh the subscription info
        await fetchSubscriptionInfo();
        alert('Successfully updated to Premium plan!');
      } else {
        const error = await response.text();
        console.error('Failed to update Ko-fi subscription:', error);
        alert('Failed to update subscription: ' + error);
      }
    } catch (error) {
      console.error('Error updating Ko-fi subscription:', error);
      alert('Error updating subscription: ' + error);
    } finally {
      setUpdating(false);
    }
  };

  const handleKofiSubscription = async (tier: 'standard' | 'premium') => {
    console.log(`🔔 Handling Ko-fi subscription for tier: ${tier}`);

    // For both Standard and Premium tiers, show email confirmation modal before proceeding
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      console.error('❌ User email not available for Ko-fi integration');
      alert('Unable to get your email address. Please try again or contact support.');
      return;
    }

    // Show email confirmation modal for both tiers
    setPendingTier(tier);
    setShowEmailConfirmModal(true);
  };

  const handleEmailConfirmationConfirm = () => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;

    if (!userEmail || !pendingTier) {
      console.error('❌ Missing email or tier information');
      return;
    }

    console.log('✅ User confirmed email requirements for Ko-fi subscription');

    // Construct Ko-fi URL with user email and parameters
    const kofiUrl = new URL('https://ko-fi.com/valorantmissions/tiers');
    kofiUrl.searchParams.set('email', userEmail);
    kofiUrl.searchParams.set('source', 'valorant-points');
    kofiUrl.searchParams.set('tier', pendingTier);

    console.log('🔗 Opening Ko-fi tiers page directly:', {
      url: kofiUrl.toString(),
      email: userEmail,
      tier: pendingTier,
      userConfirmed: true
    });

    // Open Ko-fi tiers page in new tab
    window.open(kofiUrl.toString(), '_blank');

    // Close modal and reset state
    setShowEmailConfirmModal(false);
    setPendingTier(null);
  };

  const handleEmailConfirmationCancel = () => {
    console.log('🚫 User cancelled Ko-fi upgrade - email confirmation required');
    setShowEmailConfirmModal(false);
    setPendingTier(null);
  };

  const handleContactSupport = () => {
    console.log('📞 User requested support contact');

    // Open support contact options
    window.open(
      'mailto:support@valorantpoints.com?subject=Ko-fi Email Address Question&body=I need help with email address requirements for Ko-fi subscription.',
      '_blank'
    );

    // Keep modal open in case user wants to continue after contacting support
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
                  {subscriptionInfo.tier === 'free'
                    ? 'Get more missions and unlock advanced features'
                    : 'Unlock unlimited missions with Premium'
                  }
                </p>
                <Button
                  onClick={() => {
                    if (subscriptionInfo.tier === 'standard') {
                      // For Standard users, go directly to Ko-fi Premium upgrade
                      handleKofiSubscription('premium');
                    } else {
                      // For Free users, show pricing table
                      setShowPricingTable(true);
                    }
                  }}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {subscriptionInfo.tier === 'free' ? 'View Pricing Plans' : 'Upgrade to Premium'}
                </Button>
              </div>
            )}

            {/* Premium User Message */}
            {subscriptionInfo.tier === 'premium' && (
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Premium Member
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">
                    You&apos;re enjoying all premium features with unlimited missions!
                  </p>
                </div>
              </div>
            )}

            {/* Ko-fi Pricing Options */}
            {showPricingTable && (
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-center text-2xl">Choose Your Plan</CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    Subscribe through Ko-fi to support the project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subscriptionInfo.tier === 'premium' ? (
                    // Premium user - show message
                    <div className="text-center py-8">
                      <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">You have the highest tier!</h3>
                      <p className="text-gray-300">
                        You&apos;re already enjoying all premium features with unlimited missions.
                      </p>
                    </div>
                  ) : (
                    // Free or Standard user - show available upgrades
                    <div className={`grid ${subscriptionInfo.tier === 'free' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                      {/* Standard Plan - only show if user is on free tier */}
                      {subscriptionInfo.tier === 'free' && (
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center">
                              <Zap className="h-6 w-6 text-blue-500 mr-2" />
                              Standard Plan
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              $3/month • 5 active missions
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              onClick={() => handleKofiSubscription('standard')}
                            >
                              Subscribe via Ko-fi
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* Premium Plan - show for free and standard users */}
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                            Premium Plan
                            {subscriptionInfo.tier === 'standard' && (
                              <Badge className="ml-2 bg-yellow-600 text-yellow-100">Upgrade</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            $10/month • 10 active missions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            className="w-full bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200"
                            onClick={() => handleKofiSubscription('premium')}
                          >
                            {subscriptionInfo.tier === 'standard' ? 'Upgrade to Premium' : 'Subscribe via Ko-fi'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="text-center mt-6">
                    <Button
                      onClick={() => setShowPricingTable(false)}
                      variant="outline"
                      className="text-white border-slate-500 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-400 transition-all duration-200 px-6 py-2 font-medium"
                    >
                      Hide Pricing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manual Update for Testing (Development Only) */}
            {process.env.NODE_ENV === 'development' && subscriptionInfo.tier === 'free' && (
              <Card className="bg-orange-800/20 border-orange-600 mb-8">
                <CardHeader>
                  <CardTitle className="text-orange-400">Development Testing</CardTitle>
                  <CardDescription className="text-orange-300">
                    Manual subscription update for testing webhook functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-orange-200 mb-4">
                      This button simulates what should happen when a webhook is received after subscription purchase.
                    </p>
                    <Button
                      onClick={manualUpdateToPremium}
                      disabled={updating}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {updating ? 'Updating...' : 'Manually Update to Premium (Test)'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ko-fi Subscription Management */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ko-fi Subscription Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your Ko-fi subscription and billing settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">
                    Manage your subscription directly through Ko-fi
                  </p>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => window.open('https://ko-fi.com/manage/supportreceived', '_blank')}
                  >
                    Open Ko-fi Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Ko-fi Email Confirmation Modal */}
        <KofiEmailConfirmationModal
          isOpen={showEmailConfirmModal}
          onClose={handleEmailConfirmationCancel}
          onConfirm={handleEmailConfirmationConfirm}
          onContactSupport={handleContactSupport}
          userEmail={user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || ''}
          tier={pendingTier || 'standard'}
        />
      </Container>
    </div>
  );
}
