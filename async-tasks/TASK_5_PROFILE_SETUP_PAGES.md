# Task 5: Profile and Setup Pages Internationalization

## Overview
This task focuses on updating the Profile and Setup pages to use the translation system. This task works independently on these specific page files only.

## Duration: 3 hours
## Dependencies: Foundation Setup Task + Task 1 (Translation Content)
## Conflicts: None (only modifies profile and setup page files)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-5-profile-setup-pages
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/app/[locale]/profile/ src/app/[locale]/setup/
   git commit -m "feat: internationalize profile and setup pages"
   git push origin task-5-profile-setup-pages
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 5: Profile and Setup Pages Internationalization`
   - **Description**: Include validation checklist from this task

## Objectives
- Replace all hardcoded text in Profile and Setup pages with translation calls
- Implement proper form validation with translated messages
- Add locale-aware form handling
- Maintain existing functionality and responsive design
- Handle user feedback messages with translations

## Files Modified (No Conflicts)
**Specific Files**:
- `src/app/[locale]/profile/page.tsx` (create new localized version)
- `src/app/[locale]/setup/page.tsx` (create new localized version)

## Implementation Strategy

### 1. Profile Page Update (1.5 hours)
**Goal**: Update the profile page to use translations

**File**: `src/app/[locale]/profile/page.tsx` (NEW FILE)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();
  const t = useProfileTranslations();
  const common = useCommonTranslations();
  const errors = useErrorsTranslations();
  
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
  };

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
```

### 2. Setup Page Update (1.5 hours)
**Goal**: Update the setup page to use translations

**File**: `src/app/[locale]/setup/page.tsx` (NEW FILE)

```typescript
'use client';

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
```

## Key Changes Made

### Translation Integration
- ✅ Replaced all hardcoded strings with translation calls
- ✅ Used proper namespace hooks for profile and setup
- ✅ Implemented form validation with translated error messages
- ✅ Added locale-aware date formatting

### Form Handling
- ✅ Translated form labels and placeholders
- ✅ Localized validation error messages
- ✅ Translated success and error feedback
- ✅ Proper error handling with user-friendly messages

### User Experience
- ✅ Maintained all existing functionality
- ✅ Preserved responsive design
- ✅ Added proper loading states with translations
- ✅ Locale-aware routing and redirects

## Validation Checklist
- [ ] Profile page renders correctly in both languages
- [ ] Setup page renders correctly in both languages
- [ ] Form validation shows translated error messages
- [ ] Success/error messages display properly
- [ ] Date formatting respects user locale
- [ ] All form functionality works correctly
- [ ] Responsive design works with longer Spanish text

## Testing Notes
- Test form validation in both languages
- Verify player verification process works
- Check that success/error messages display correctly
- Confirm date formatting shows properly for locale
- Test responsive behavior with translated content

## Next Steps
This task completes the Profile and Setup pages internationalization. Both pages now fully support English and Spanish languages with proper form validation and user feedback.
