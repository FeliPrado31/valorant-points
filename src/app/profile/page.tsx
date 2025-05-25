'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Container } from '@/components/ui/container';
import Navigation from '@/components/Navigation';
import { User, Globe, Save } from 'lucide-react';

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  valorantTag?: string;
}

export default function Profile() {
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    valorantName: '',
    valorantTag: '',
  });
  const [playerVerified, setPlayerVerified] = useState(false);
  const [riotIdLinked, setRiotIdLinked] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || user.firstName || '',
      }));
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          valorantName: profileData.valorantTag?.split('#')[0] || '',
          valorantTag: profileData.valorantTag?.split('#')[1] || '',
        });
        if (profileData.valorantTag) {
          setPlayerVerified(true);
        }
        // Check if Riot ID is linked (has riotId data)
        if (profileData.riotId) {
          setRiotIdLinked(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyValorantPlayer = async () => {
    if (!formData.valorantName || !formData.valorantTag) {
      alert('Please enter both Valorant name and tag');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(`/api/valorant/player?name=${formData.valorantName}&tag=${formData.valorantTag}`);

      if (response.ok) {
        setPlayerVerified(true);
        alert('Valorant account verified successfully!');
      } else {
        const error = await response.json();
        alert(`Verification failed: ${error.error}`);
        setPlayerVerified(false);
      }
    } catch (error) {
      console.error('Error verifying player:', error);
      alert('Error verifying Valorant account');
      setPlayerVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const valorantTag = formData.valorantName && formData.valorantTag
        ? `${formData.valorantName}#${formData.valorantTag}`
        : undefined;

      const profileData = {
        username: formData.username,
        valorantTag,
      };

      const method = profile ? 'PUT' : 'POST';
      const body = profile
        ? profileData
        : { ...profileData, email: user?.emailAddresses[0]?.emailAddress };

      const response = await fetch('/api/users', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        alert('Profile saved successfully!');
        // Redirect to dashboard after successful save
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        const error = await response.json();
        alert(`Error saving profile: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation user={user} />

      <Container size="md" padding="md" className="py-4 sm:py-6 lg:py-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-white text-2xl">Profile Settings</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Configure your profile and connect your Valorant account to start tracking missions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
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
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input
                  value={user?.emailAddresses[0]?.emailAddress || ''}
                  disabled
                  className="bg-slate-700 border-slate-600 text-gray-400"
                />
              </div>
            </div>

            {/* Valorant Account */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Valorant Account</h3>
              {riotIdLinked && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    🔒 Your Riot ID has been verified and linked to your account. For security reasons,
                    it cannot be changed. Contact support if you need assistance.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorantName" className="text-white">
                    Riot ID
                    {riotIdLinked && <span className="text-xs text-gray-400 ml-2">(Verified & Locked)</span>}
                  </Label>
                  <Input
                    id="valorantName"
                    value={formData.valorantName}
                    onChange={(e) => {
                      if (!riotIdLinked) {
                        setFormData(prev => ({ ...prev, valorantName: e.target.value }));
                        setPlayerVerified(false);
                      }
                    }}
                    disabled={riotIdLinked}
                    className={`${riotIdLinked ? 'bg-slate-600 border-slate-500 text-gray-300 cursor-not-allowed' : 'bg-slate-700 border-slate-600 text-white'}`}
                    placeholder="YourName"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorantTag" className="text-white">
                    Tag
                    {riotIdLinked && <span className="text-xs text-gray-400 ml-2">(Verified & Locked)</span>}
                  </Label>
                  <Input
                    id="valorantTag"
                    value={formData.valorantTag}
                    onChange={(e) => {
                      if (!riotIdLinked) {
                        setFormData(prev => ({ ...prev, valorantTag: e.target.value }));
                        setPlayerVerified(false);
                      }
                    }}
                    disabled={riotIdLinked}
                    className={`${riotIdLinked ? 'bg-slate-600 border-slate-500 text-gray-300 cursor-not-allowed' : 'bg-slate-700 border-slate-600 text-white'}`}
                    placeholder="1234"
                  />
                </div>
              </div>



              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {!riotIdLinked ? (
                  <Button
                    onClick={verifyValorantPlayer}
                    disabled={verifying || !formData.valorantName || !formData.valorantTag}
                    variant="outline-light"
                    size="default"
                    className="w-full sm:w-auto"
                  >
                    <Globe className={`h-4 w-4 mr-2 ${verifying ? 'animate-spin' : ''}`} />
                    Verify Account
                  </Button>
                ) : (
                  <div className="text-green-400 text-sm flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    ✓ Riot ID Verified & Linked
                  </div>
                )}

                {playerVerified && !riotIdLinked && (
                  <div className="text-green-400 text-sm">✓ Account verified</div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={saveProfile}
                disabled={saving || !formData.username}
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
