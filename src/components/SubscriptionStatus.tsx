'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, Zap, ArrowUp } from 'lucide-react';

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
  subscription: any;
}

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export default function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

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
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'standard':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const missionProgress = (subscriptionInfo.activeMissionsCount / subscriptionInfo.maxActiveMissions) * 100;
  const slotProgress = ((subscriptionInfo.tierInfo.maxActiveMissions - subscriptionInfo.availableSlots) / subscriptionInfo.tierInfo.maxActiveMissions) * 100;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTierIcon(subscriptionInfo.tier)}
            <CardTitle className="text-white text-lg">
              {subscriptionInfo.tierInfo.name} Plan
            </CardTitle>
            <Badge className={getTierColor(subscriptionInfo.tier)}>
              {subscriptionInfo.tier === 'free' ? 'Free' : `$${subscriptionInfo.tierInfo.price}/month`}
            </Badge>
          </div>
          {subscriptionInfo.tier === 'free' && (
            <Button
              onClick={onUpgrade}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
        <CardDescription className="text-gray-300">
          Manage your mission limits and subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Missions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Active Missions</span>
            <span className="text-white font-medium">
              {subscriptionInfo.activeMissionsCount} / {subscriptionInfo.maxActiveMissions}
            </span>
          </div>
          <Progress value={missionProgress} className="h-2" />
          {subscriptionInfo.activeMissionsCount >= subscriptionInfo.maxActiveMissions && (
            <p className="text-yellow-400 text-xs">
              Mission limit reached. {subscriptionInfo.tier === 'free' ? 'Upgrade for more missions!' : 'Complete missions to free up slots.'}
            </p>
          )}
        </div>

        {/* Daily Slots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Daily Slots Used</span>
            <span className="text-white font-medium">
              {subscriptionInfo.tierInfo.maxActiveMissions - subscriptionInfo.availableSlots} / {subscriptionInfo.tierInfo.maxActiveMissions}
            </span>
          </div>
          <Progress value={slotProgress} className="h-2" />
          {subscriptionInfo.availableSlots <= 0 && (
            <div className="flex items-center space-x-1 text-xs text-orange-400">
              <Clock className="h-3 w-3" />
              <span>
                Daily limit reached. Resets in {subscriptionInfo.hoursUntilRefresh} hours
              </span>
            </div>
          )}
        </div>

        {/* Mission Status */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Can Accept Missions</span>
            <Badge variant={subscriptionInfo.canAcceptMissions ? "default" : "destructive"}>
              {subscriptionInfo.canAcceptMissions ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {subscriptionInfo.tier === 'free' && (
          <div className="pt-2 border-t border-slate-700">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                Want more missions? Upgrade your plan!
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 p-2 rounded">
                  <div className="text-blue-400 font-medium">Standard</div>
                  <div className="text-gray-300">5 missions • $3/month</div>
                </div>
                <div className="bg-slate-700/50 p-2 rounded">
                  <div className="text-yellow-400 font-medium">Premium</div>
                  <div className="text-gray-300">10 missions • $10/month</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
