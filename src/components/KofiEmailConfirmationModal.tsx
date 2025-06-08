'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Mail, ExternalLink, HelpCircle } from 'lucide-react';

interface KofiEmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onContactSupport: () => void;
  userEmail: string;
  tier: 'standard' | 'premium';
}

export function KofiEmailConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onContactSupport,
  userEmail,
  tier
}: KofiEmailConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            Email Address Requirement
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            Important information before proceeding to Ko-fi {tier === 'standard' ? 'Standard' : 'Premium'} subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Email Display */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">Your Current Email:</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-600/20 border-blue-500 text-blue-300 px-3 py-1">
                {userEmail}
              </Badge>
            </div>
          </div>

          {/* Critical Requirement */}
          <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">CRITICAL REQUIREMENT</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You <strong className="text-white">MUST use the same email address</strong> ({userEmail})
                  when subscribing to the {tier === 'standard' ? 'Standard' : 'Premium'} plan on Ko-fi.
                </p>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              Why this matters:
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 ml-7">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Ko-fi sends webhooks with the email used during subscription
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Our system matches users by email to update subscription status
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>
                  <strong className="text-red-300">Using a different email will prevent</strong> your 
                  subscription from being activated
                </span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h3 className="font-semibold text-white mb-3">What happens next:</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">1.</span>
                You'll be redirected to Ko-fi in a new tab
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">2.</span>
                Use <strong className="text-white">{userEmail}</strong> when subscribing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">3.</span>
                Ko-fi will send us a webhook to activate your Premium subscription
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">4.</span>
                Your account will be automatically upgraded to {tier === 'standard' ? 'Standard' : 'Premium'}
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Support Button */}
            <Button
              variant="outline"
              onClick={onContactSupport}
              className="flex items-center gap-2 border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
            >
              <HelpCircle className="h-4 w-4" />
              Contact Support
            </Button>
            
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </Button>
            
            {/* Continue Button */}
            <Button
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 flex-1"
            >
              <ExternalLink className="h-4 w-4" />
              Continue to Ko-fi ({tier === 'standard' ? 'Standard' : 'Premium'})
            </Button>
          </div>
        </DialogFooter>

        {/* Footer Note */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-slate-700">
          Need to use a different email? Update your account settings first or contact support.
        </div>
      </DialogContent>
    </Dialog>
  );
}
