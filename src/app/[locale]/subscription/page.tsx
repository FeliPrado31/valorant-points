'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import Navigation from '@/components/Navigation';
import { Target, Crown, Zap, CheckCircle } from 'lucide-react';
import { PricingTable } from '@clerk/nextjs';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-types';
import { 
  useSubscriptionTranslations, 
  useCommonTranslations,
  useTranslationHelpers 
} from '@/hooks/useI18n';

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
  const locale = useLocale();
  const t = useSubscriptionTranslations();
  const common = useCommonTranslations();
  const { formatNumber } = useTranslationHelpers();
  
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPricingTable, setShowPricingTable] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const handleUpgrade = () => {
    setShowPricingTable(true);
  };

  const handleManageBilling = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.open(data.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error managing billing:', error);
    } finally {
      setUpdating(false);
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
        return 'bg-yellow-600 text-white';
      case 'standard':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{common('buttons.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />

      <Container size="lg" padding="md" className="py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">
            {t('description')}
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionInfo && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  {getTierIcon(subscriptionInfo.tier)}
                  <div>
                    <CardTitle className="text-white text-xl">
                      {t(`plans.${subscriptionInfo.tier}.name`)}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {t(`plans.${subscriptionInfo.tier}.description`)}
                    </CardDescription>
                  </div>
                  <Badge className={getTierColor(subscriptionInfo.tier)}>
                    {subscriptionInfo.tier === 'free' 
                      ? t('billing.free') 
                      : `${t('billing.price', { price: subscriptionInfo.tierInfo.price })}${t('billing.monthly')}`
                    }
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  {subscriptionInfo.tier === 'free' ? (
                    <Button
                      onClick={handleUpgrade}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {t('actions.upgrade')}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleManageBilling}
                      disabled={updating}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {updating ? common('buttons.loading') : t('actions.manageBilling')}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Plan Features */}
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {common('labels.features')}:
                  </h3>
                  <ul className="space-y-2">
                    {subscriptionInfo.tierInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Usage Stats */}
                <div className="border-t border-slate-600 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">{t('status.dailySlotsUsed')}</p>
                      <p className="text-white font-semibold">
                        {subscriptionInfo.activeMissionsCount} / {subscriptionInfo.maxActiveMissions}
                      </p>
                    </div>
                    {subscriptionInfo.hoursUntilRefresh > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm">{common('time.hours')} until refresh</p>
                        <p className="text-white font-semibold">
                          {formatNumber(subscriptionInfo.hoursUntilRefresh)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans Comparison */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            {t('plans.comparison')}
          </h2>
          <Grid cols={{ default: 1, md: 3 }} gap="lg">
            {Object.entries(SUBSCRIPTION_TIERS).map(([tierKey, tier]) => (
              <Card 
                key={tierKey} 
                className={`bg-slate-800/50 border-slate-700 relative ${
                  tierKey === 'standard' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {tierKey === 'standard' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      {t('billing.popular')}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getTierIcon(tierKey)}
                  </div>
                  <CardTitle className="text-white text-2xl">
                    {t(`plans.${tierKey}.name`)}
                  </CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {tier.price === 0 
                      ? t('billing.free') 
                      : `${t('billing.price', { price: tier.price })}${t('billing.monthly')}`
                    }
                  </div>
                  <CardDescription className="text-gray-300">
                    {t(`plans.${tierKey}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={tierKey === 'free' ? undefined : handleUpgrade}
                    disabled={subscriptionInfo?.tier === tierKey}
                    className={`w-full ${
                      subscriptionInfo?.tier === tierKey
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : tierKey === 'free'
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {subscriptionInfo?.tier === tierKey 
                      ? t('actions.currentPlan')
                      : tierKey === 'free'
                      ? t('actions.downgrade')
                      : t('actions.selectPlan')
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </div>

        {/* Clerk Pricing Table */}
        {showPricingTable && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl text-center">
                {t('billing.completeSubscription')}
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                {t('billing.choosePaymentMethod')}
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
                newSubscriptionRedirectUrl={`/${locale}/subscription`}
              />
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
}
