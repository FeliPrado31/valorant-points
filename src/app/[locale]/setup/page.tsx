'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Target, Globe, Save, AlertCircle } from 'lucide-react';

export default function Setup() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Translation hooks
  const t = useTranslations('setup');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');

  // Debug: Log the current locale and translations
  console.log('🌐 Setup Page - Current locale:', locale);
  console.log('🌐 Setup Page - Title translation:', t('title'));
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    valorantName: '',
    valorantTag: '',
  });
  const [playerVerified, setPlayerVerified] = useState(false);
  const [playerData, setPlayerData] = useState<{ name: string; tag: string; accountLevel: number; region: string; lastUpdate: string; card: { wide: string; large: string } } | null>(null);
  const [error, setError] = useState('');

  // Check if user already has a Riot ID and redirect if they do
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const userData = await response.json();
          // If user already has a Riot ID, redirect to dashboard
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

  const verifyValorantPlayer = async () => {
    if (!formData.valorantName || !formData.valorantTag) {
      setError(tErrors('validation.invalidRiotId'));
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/riot-id/verify', {
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
        const result = await response.json();
        setPlayerData(result.playerData);
        setPlayerVerified(true);
        setError('');
      } else {
        const errorData = await response.json();
        setError(`${t('messages.verificationFailed')}: ${errorData.error}`);
        setPlayerVerified(false);
        setPlayerData(null);
      }
    } catch (error) {
      console.error('Error verifying player:', error);
      setError(tErrors('profile.verificationFailed'));
      setPlayerVerified(false);
      setPlayerData(null);
    } finally {
      setVerifying(false);
    }
  };

  const completeSetup = async () => {
    if (!playerVerified || !playerData) {
      setError(tErrors('profile.verificationFailed'));
      return;
    }

    if (!formData.username.trim()) {
      setError(tErrors('validation.required'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/riot-id/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerData,
          username: formData.username,
        }),
      });

      if (response.ok) {
        // Setup completed successfully, redirect to dashboard
        router.push(`/${locale}/dashboard`);
      } else {
        const errorData = await response.json();
        setError(`${tErrors('profile.saveFailed')}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      setError(t('messages.setupFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{tCommon('status.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-center p-6">
        <div className="flex items-center space-x-2">
          <Target className="h-8 w-8 text-red-500" />
          <span className="text-2xl font-bold text-white">Valorant Missions</span>
        </div>
      </div>

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

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{tCommon('labels.name')}</h3>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">{t('fields.username')}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder={t('fields.username')}
                  required
                />
              </div>
            </div>

            {/* Valorant Account */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{t('fields.valorantName')}</h3>
              <p className="text-gray-400 text-sm">
                {t('instructions.enterRiotId')}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorantName" className="text-white">{t('fields.valorantName')}</Label>
                  <Input
                    id="valorantName"
                    value={formData.valorantName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, valorantName: e.target.value }));
                      setPlayerVerified(false);
                      setPlayerData(null);
                      setError('');
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="YourName"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorantTag" className="text-white">{t('fields.valorantTag')}</Label>
                  <Input
                    id="valorantTag"
                    value={formData.valorantTag}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, valorantTag: e.target.value }));
                      setPlayerVerified(false);
                      setPlayerData(null);
                      setError('');
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="1234"
                    required
                  />
                </div>
              </div>



              <div className="flex items-center space-x-4">
                <Button
                  onClick={verifyValorantPlayer}
                  disabled={verifying || !formData.valorantName || !formData.valorantTag}
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-800"
                >
                  <Globe className={`h-4 w-4 mr-2 ${verifying ? 'animate-spin' : ''}`} />
                  {verifying ? t('actions.verifying') : t('actions.verifyPlayer')}
                </Button>

                {playerVerified && (
                  <div className="text-green-400 text-sm flex items-center space-x-1">
                    <span>✓</span>
                    <span>{t('messages.verificationSuccess')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Player Card Display */}
            {playerVerified && playerData && (
              <div className="space-y-4">
                <div className="border-t border-slate-600 pt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">{t('steps.verification')}</h3>

                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                    {/* Player Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-lg">
                          {playerData.name}#{playerData.tag}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {t('playerInfo.accountLevel', { level: playerData.accountLevel })} • {t('playerInfo.region', { region: playerData.region.toUpperCase() })}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {t('playerInfo.lastUpdate', { date: playerData.lastUpdate })}
                        </div>
                      </div>
                    </div>

                    {/* Player Card */}
                    <div className="space-y-2">
                      <div className="text-white text-sm font-medium">Player Card:</div>
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={playerData.card.wide}
                          alt="Player Card"
                          className="w-full max-w-md rounded-lg border border-slate-600"
                          onError={(e) => {
                            // Fallback to large card if wide card fails
                            e.currentTarget.src = playerData.card.large;
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                      <div className="text-blue-300 text-sm">
                        ✓ {t('instructions.note')}
                      </div>
                    </div>
                  </div>
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

            <div className="text-center text-gray-400 text-sm">
              {t('instructions.note')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}