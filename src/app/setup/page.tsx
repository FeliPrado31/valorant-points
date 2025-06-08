'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Target, Globe, Save, AlertCircle } from 'lucide-react';

export default function Setup() {
  const { user } = useUser();
  const router = useRouter();
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
            router.push('/dashboard');
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
  }, [user, router]);

  const verifyValorantPlayer = async () => {
    if (!formData.valorantName || !formData.valorantTag) {
      setError('Please enter both Riot ID and tag');
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
        setError(`Verification failed: ${errorData.error}`);
        setPlayerVerified(false);
        setPlayerData(null);
      }
    } catch (error) {
      console.error('Error verifying player:', error);
      setError('Error verifying Valorant account. Please try again.');
      setPlayerVerified(false);
      setPlayerData(null);
    } finally {
      setVerifying(false);
    }
  };

  const completeSetup = async () => {
    if (!playerVerified || !playerData) {
      setError('Please verify your Valorant account first');
      return;
    }

    if (!formData.username.trim()) {
      setError('Please enter a username');
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
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(`Error saving profile: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      setError('Error completing setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Checking access...</div>
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
            <CardTitle className="text-white text-3xl mb-2">Welcome to Valorant Missions!</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              To start tracking your missions and progress, we need to connect your Valorant account.
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
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Valorant Account */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Valorant Account</h3>
              <p className="text-gray-400 text-sm">
                We need your Riot ID to track your matches and update mission progress.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorantName" className="text-white">Riot ID</Label>
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
                  <Label htmlFor="valorantTag" className="text-white">Tag</Label>
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
                  {verifying ? 'Verifying...' : 'Verify Account'}
                </Button>

                {playerVerified && (
                  <div className="text-green-400 text-sm flex items-center space-x-1">
                    <span>✓</span>
                    <span>Account verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Player Card Display */}
            {playerVerified && playerData && (
              <div className="space-y-4">
                <div className="border-t border-slate-600 pt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Confirm Your Valorant Account</h3>

                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                    {/* Player Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-lg">
                          {playerData.name}#{playerData.tag}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Level {playerData.accountLevel} • {playerData.region.toUpperCase()}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Last updated: {playerData.lastUpdate}
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
                        ✓ This is your Valorant account. Once linked, it cannot be changed or transferred to another user.
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
                {loading ? 'Setting up...' : 'Complete Setup & Start Missions'}
              </Button>
            </div>

            <div className="text-center text-gray-400 text-sm">
              Your Riot ID will be used to track your Valorant matches and update mission progress automatically.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
