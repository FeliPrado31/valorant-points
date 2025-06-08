'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid } from '@/components/ui/grid';
import { PricingTable } from '@clerk/nextjs';
import { Crown, Zap, X, CheckCircle } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-types';
import {
  useSubscriptionTranslations
} from '@/hooks/useI18n';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
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
  const locale = useLocale();
  const t = useSubscriptionTranslations();

  const handlePlanSelect = (planKey: string) => {
    if (planKey === 'free') {
      return;
    }
    setShowClerkPricing(true);
  };

  if (showClerkPricing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              {t('billing.completeSubscription')}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {t('billing.choosePaymentMethod')}
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
              newSubscriptionRedirectUrl={`/${locale}/subscription`}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl text-center">
            {t('actions.upgrade')}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            {t('billing.choosePlan')}
          </DialogDescription>
        </DialogHeader>

        <Grid cols={{ default: 1, md: 3 }} gap="lg" className="mt-6">
          {Object.entries(PRICING_PLANS).map(([planKey, plan]) => (
            <Card
              key={planKey}
              className={`bg-slate-800/50 border-slate-700 relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    {t('billing.popular')}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-white text-2xl">
                  {t(`plans.${planKey}.name`)}
                </CardTitle>
                <div className="text-3xl font-bold text-white">
                  {plan.price === 0
                    ? t('billing.free')
                    : `${t('billing.price', { price: plan.price })}${t('billing.monthly')}`
                  }
                </div>
                <CardDescription className="text-gray-300">
                  {t(`plans.${planKey}.description`)}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanSelect(planKey)}
                  disabled={currentTier === planKey}
                  className={`w-full ${
                    currentTier === planKey
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : plan.buttonColor + ' text-white'
                  }`}
                >
                  {currentTier === planKey
                    ? t('actions.currentPlan')
                    : planKey === 'free'
                    ? t('actions.downgrade')
                    : t('actions.selectPlan')
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
