'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Save, Globe } from 'lucide-react';
import { 
  useSetupTranslations, 
  useCommonTranslations,
  useErrorsTranslations 
} from '@/hooks/useI18n';

export default function Setup() {
  const { user } = useUser();
  const router = useRouter();
  const locale = useLocale();
  const t = useSetupTranslations();
  const common = useCommonTranslations();
  const errors = useErrorsTranslations();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    valorantName: '',
    valorantTag: '',
  });
  const [playerVerified, setPlayerVerified] = useState(false);
  const [playerData, setPlayerData] = useState<{ 
    name: string; 
    tag: string; 
    accountLevel: number; 
    region: string; 
    lastUpdate: string; 
    card: { wide: string; large: string } 
  } | null>(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const userData = await response.json();
          if (userData.riotId && userData.riotId.puuid) {
            console.log('🔒 Setup: User already has Riot ID, redirecting to dashboard');
            router.push(`/${locale}/dashboard`);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user access:', error);
      } finally {
        setCheckingAccess(false);
      }
    };

    if (user) {
      checkUserAccess();
      setFormData(prev => ({
        ...prev,
        username: user.username || user.firstName || '',
      }));
    }
  }, [user, router, locale]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = errors('validation.required');
    }

    if (!formData.valorantName.trim()) {
      newErrors.valorantName = errors('validation.required');
    }

    if (!formData.valorantTag.trim()) {
      newErrors.valorantTag = errors('validation.required');
    } else if (!/^\d{3,5}$/.test(formData.valorantTag)) {
      newErrors.valorantTag = errors('validation.invalidRiotId');
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyPlayer = async () => {
    if (!validateForm()) return;

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/valorant/verify-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.valorantName,
          tag: formData.valorantTag,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlayerData(data.player);
        setPlayerVerified(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('messages.verificationFailed'));
      }
    } catch (error) {
      console.error('Error verifying player:', error);
      setError(t('messages.verificationFailed'));
    } finally {
      setVerifying(false);
    }
  };

  const completeSetup = async () => {
    if (!playerVerified) {
      setError(t('messages.verificationFailed'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          valorantName: formData.valorantName,
          valorantTag: formData.valorantTag,
        }),
      });

      if (response.ok) {
        console.log('✅ Setup completed successfully');
        router.push(`/${locale}/dashboard`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('messages.setupFailed'));
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      setError(t('messages.setupFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{common('buttons.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-3xl mb-2">{t('title')}</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2">{t('instructions.enterRiotId')}</h3>
              <p className="text-blue-200 text-sm mb-2">{t('instructions.format')}</p>
              <p className="text-blue-200 text-xs">{t('instructions.note')}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  {t('fields.username')}
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
                />
                {validationErrors.username && (
                  <p className="text-red-400 text-sm">{validationErrors.username}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorantName" className="text-white">
                    {t('fields.valorantName')}
                  </Label>
                  <Input
                    id="valorantName"
                    value={formData.valorantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorantName: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
                  />
                  {validationErrors.valorantName && (
                    <p className="text-red-400 text-sm">{validationErrors.valorantName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorantTag" className="text-white">
                    {t('fields.valorantTag')}
                  </Label>
                  <Input
                    id="valorantTag"
                    value={formData.valorantTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorantTag: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
                  />
                  {validationErrors.valorantTag && (
                    <p className="text-red-400 text-sm">{validationErrors.valorantTag}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Verify Player Button */}
            <Button
              onClick={verifyPlayer}
              disabled={verifying || !formData.valorantName || !formData.valorantTag}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('actions.verifying')}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  {t('actions.verifyPlayer')}
                </>
              )}
            </Button>

            {/* Player Verification Success */}
            {playerVerified && playerData && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 font-semibold">{t('messages.verificationSuccess')}</span>
                </div>
                <div className="text-green-200 text-sm space-y-1">
                  <p>{t('playerInfo.accountLevel', { level: playerData.accountLevel })}</p>
                  <p>{t('playerInfo.region', { region: playerData.region })}</p>
                  <p>{t('playerInfo.lastUpdate', { date: new Date(playerData.lastUpdate).toLocaleDateString(locale) })}</p>
                </div>
              </div>
            )}

            {/* Complete Setup Button */}
            <div className="pt-4">
              <Button
                onClick={completeSetup}
                disabled={loading || !formData.username || !playerVerified}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3"
              >
                <Save className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? t('actions.setupInProgress') : t('actions.completeSetup')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
