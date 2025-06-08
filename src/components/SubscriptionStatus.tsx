'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, Zap, ArrowUp } from 'lucide-react';
import {
  useSubscriptionTranslations,
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

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export default function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useSubscriptionTranslations();
  const { formatNumber } = useTranslationHelpers();

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

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo) {
    return null;
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'standard':
        return <Zap className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const slotProgress = ((subscriptionInfo.tierInfo.maxActiveMissions - subscriptionInfo.availableSlots) / subscriptionInfo.tierInfo.maxActiveMissions) * 100;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            {getTierIcon(subscriptionInfo.tier)}
            <CardTitle className="text-white text-base sm:text-lg">
              {t(`plans.${subscriptionInfo.tier}.name`)} {t('status.currentPlan')}
            </CardTitle>
            <Badge className={`${getTierColor(subscriptionInfo.tier)} text-xs sm:text-sm`}>
              {subscriptionInfo.tier === 'free'
                ? t('billing.free')
                : `${t('billing.price', { price: subscriptionInfo.tierInfo.price })}${t('billing.monthly')}`
              }
            </Badge>
          </div>
          {subscriptionInfo.tier === 'free' && (
            <Button
              onClick={onUpgrade}
              size="default"
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              {t('actions.upgrade')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Plan Description */}
        <CardDescription className="text-gray-300 mb-4">
          {t(`plans.${subscriptionInfo.tier}.description`)}
        </CardDescription>

        {/* Daily Slots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{t('status.dailySlotsUsed')}</span>
            <span className="text-white font-medium">
              {formatNumber(subscriptionInfo.tierInfo.maxActiveMissions - subscriptionInfo.availableSlots)} / {formatNumber(subscriptionInfo.tierInfo.maxActiveMissions)}
            </span>
          </div>
          <Progress value={slotProgress} className="h-2" />
          {subscriptionInfo.availableSlots <= 0 && (
            <div className="flex items-center space-x-1 text-xs text-orange-400">
              <Clock className="h-3 w-3" />
              <span>
                {t('status.dailyLimitReached', { hours: formatNumber(subscriptionInfo.hoursUntilRefresh) })}
              </span>
            </div>
          )}
        </div>

        {/* Upgrade Suggestion for Free Users */}
        {subscriptionInfo.tier === 'free' && subscriptionInfo.availableSlots <= 1 && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">
                  {t('status.upgradeAvailable')}
                </p>
                <p className="text-blue-200 text-xs">
                  {t('plans.standard.description')}
                </p>
              </div>
              <Button
                onClick={onUpgrade}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('actions.upgrade')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
