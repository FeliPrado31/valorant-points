'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Container } from '@/components/ui/container';
import Navigation from '@/components/Navigation';
import { User, Globe, Save, CheckCircle, AlertCircle } from 'lucide-react';
import {
  useProfileTranslations,
  useCommonTranslations,
  useErrorsTranslations
} from '@/hooks/useI18n';

export default function Profile() {
  const { user } = useUser();
  const t = useProfileTranslations();
  const common = useCommonTranslations();
  const errors = useErrorsTranslations();

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const profileData = await response.json();
        setFormData({
          username: profileData.username || '',
          valorantName: profileData.valorantTag?.split('#')[0] || '',
          valorantTag: profileData.valorantTag?.split('#')[1] || '',
        });
        if (profileData.valorantTag) {
          setPlayerVerified(true);
        }
        if (profileData.riotId) {
          setRiotIdLinked(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage(errors('profile.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [errors]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || user.firstName || '',
      }));
      fetchProfile();
    }
  }, [user, fetchProfile]);



  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = t('validation.usernameRequired');
    }

    if (!formData.valorantName.trim()) {
      newErrors.valorantName = t('validation.valorantNameRequired');
    }

    if (!formData.valorantTag.trim()) {
      newErrors.valorantTag = t('validation.valorantTagRequired');
    } else if (!/^\d{3,5}$/.test(formData.valorantTag)) {
      newErrors.valorantTag = t('validation.invalidTag');
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyPlayer = async () => {
    if (!validateForm()) return;

    setVerifying(true);
    setErrorMessage('');
    setSuccessMessage('');

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
        setPlayerVerified(true);
        setSuccessMessage(t('messages.verificationSuccess'));
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || t('messages.verificationFailed'));
      }
    } catch (error) {
      console.error('Error verifying player:', error);
      setErrorMessage(t('messages.verificationFailed'));
    } finally {
      setVerifying(false);
    }
  };

  const saveProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          valorantTag: `${formData.valorantName}#${formData.valorantTag}`,
        }),
      });

      if (response.ok) {
        setSuccessMessage(t('messages.profileSaved'));
        await fetchProfile();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || t('messages.saveFailed'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage(t('messages.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const linkRiotAccount = async () => {
    if (!playerVerified) {
      setErrorMessage(t('messages.verificationFailed'));
      return;
    }

    try {
      const response = await fetch('/api/users/link-riot', {
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
        setRiotIdLinked(true);
        setSuccessMessage(t('messages.accountLinked'));
        await fetchProfile();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || errors('profile.linkFailed'));
      }
    } catch (error) {
      console.error('Error linking Riot account:', error);
      setErrorMessage(errors('profile.linkFailed'));
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

      <Container size="md" padding="md" className="py-4 sm:py-6 lg:py-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-white text-2xl">{t('title')}</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-300">{successMessage}</span>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300">{errorMessage}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{t('sections.basicInfo')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  {t('fields.username')}
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder={t('placeholders.username')}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
                />
                {validationErrors.username && (
                  <p className="text-red-400 text-sm">{validationErrors.username}</p>
                )}
              </div>
            </div>

            {/* Valorant Account */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{t('sections.valorantAccount')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorantName" className="text-white">
                    {t('fields.valorantName')}
                  </Label>
                  <Input
                    id="valorantName"
                    value={formData.valorantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorantName: e.target.value }))}
                    placeholder={t('placeholders.valorantName')}
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
                    placeholder={t('placeholders.valorantTag')}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
                  />
                  {validationErrors.valorantTag && (
                    <p className="text-red-400 text-sm">{validationErrors.valorantTag}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{t('sections.verification')}</h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={verifyPlayer}
                  disabled={verifying || !formData.valorantName || !formData.valorantTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('actions.verifying')}
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      {t('actions.verify')}
                    </>
                  )}
                </Button>

                {playerVerified && !riotIdLinked && (
                  <Button
                    onClick={linkRiotAccount}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {t('actions.linkAccount')}
                  </Button>
                )}
              </div>

              {playerVerified && (
                <div className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('messages.verificationSuccess')}
                </div>
              )}

              {riotIdLinked && (
                <div className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('messages.accountLinked')}
                </div>
              )}
            </div>

            {/* Save Profile */}
            <div className="pt-4">
              <Button
                onClick={saveProfile}
                disabled={saving || !formData.username}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('actions.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('actions.saveProfile')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
