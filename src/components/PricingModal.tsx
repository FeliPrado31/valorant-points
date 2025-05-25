'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Crown, Zap, X } from 'lucide-react';
import { PricingTable } from '@clerk/nextjs';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'standard' | 'premium';
}

// Enhanced pricing plans with UI properties
const PRICING_PLANS = {
  free: {
    ...SUBSCRIPTION_TIERS.free,
    maxMissions: SUBSCRIPTION_TIERS.free.maxActiveMissions,
    icon: <X className="h-6 w-6 text-gray-500" />,
    color: 'border-gray-600',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    popular: false
  },
  standard: {
    ...SUBSCRIPTION_TIERS.standard,
    maxMissions: SUBSCRIPTION_TIERS.standard.maxActiveMissions,
    icon: <Zap className="h-6 w-6 text-blue-500" />,
    color: 'border-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    popular: true
  },
  premium: {
    ...SUBSCRIPTION_TIERS.premium,
    maxMissions: SUBSCRIPTION_TIERS.premium.maxActiveMissions,
    icon: <Crown className="h-6 w-6 text-yellow-500" />,
    color: 'border-yellow-600',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    popular: false
  }
};

export default function PricingModal({ isOpen, onClose, currentTier = 'free' }: PricingModalProps) {
  const [showClerkPricing, setShowClerkPricing] = useState(false);

  const handlePlanSelect = (planKey: string) => {
    if (planKey === 'free') {
      // Handle downgrade to free (if needed)
      return;
    }

    // For paid plans, show Clerk pricing table
    setShowClerkPricing(true);
  };

  if (showClerkPricing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Complete Your Subscription</DialogTitle>
            <DialogDescription className="text-gray-300">
              Choose your payment method and complete the subscription process
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <PricingTable
              appearance={{
                elements: {
                  card: "bg-slate-800 border-slate-700",
                  cardHeader: "text-white",
                  cardContent: "text-gray-300",
                  button: "bg-red-600 hover:bg-red-700"
                }
              }}
              newSubscriptionRedirectUrl="/dashboard?subscription=success"
            />
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Plan IDs: Standard ({SUBSCRIPTION_TIERS.standard.clerkPlanId}) • Premium ({SUBSCRIPTION_TIERS.premium.clerkPlanId})</p>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setShowClerkPricing(false)}
              variant="outline"
              className="text-white border-slate-600 hover:bg-slate-800"
            >
              Back to Plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-3xl text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-gray-300 text-center text-lg">
            Unlock more missions and features with our subscription plans
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative bg-slate-800/50 ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500' : ''} transition-all hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-white">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-lg text-gray-400">/month</span>}
                </div>
                <CardDescription className="text-gray-300">
                  Up to {plan.maxMissions} active missions
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-300">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanSelect(key)}
                  disabled={currentTier === key}
                  className={`w-full ${plan.buttonColor} text-white`}
                >
                  {currentTier === key ? 'Current Plan' :
                   key === 'free' ? 'Downgrade' : 'Upgrade'}
                </Button>

                {currentTier === key && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Active
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>All plans include mission tracking and progress monitoring.</p>
          <p>Cancel anytime. No hidden fees.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
