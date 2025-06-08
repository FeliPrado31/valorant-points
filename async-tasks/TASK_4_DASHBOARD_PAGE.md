# Task 4: Dashboard Page Internationalization

## Overview
This task focuses on updating the Dashboard page (`src/app/dashboard/page.tsx`) to use the translation system. This task works independently on the dashboard page only.

## Duration: 4 hours
## Dependencies: Foundation Setup Task + Task 1 (Translation Content)
## Conflicts: None (only modifies dashboard page file)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-4-dashboard-page
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/app/[locale]/dashboard/
   git commit -m "feat: internationalize dashboard page"
   git push origin task-4-dashboard-page
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 4: Dashboard Page Internationalization`
   - **Description**: Include validation checklist from this task

## Objectives
- Replace all hardcoded text in the dashboard page with translation calls
- Implement proper translation hooks for dashboard namespace
- Add locale-aware date and number formatting
- Maintain existing functionality and responsive design
- Handle mission progress display with translations

## Files Modified (No Conflicts)
**Single File Focus**:
- `src/app/[locale]/dashboard/page.tsx` (create new localized version)

## Implementation Strategy

### 1. Create Localized Dashboard Route (30 minutes)
**Goal**: Set up the dashboard page in the new locale structure

**File**: `src/app/[locale]/dashboard/page.tsx` (NEW FILE)
**Note**: This replaces the existing `src/app/dashboard/page.tsx`

### 2. Dashboard Component Update (3.5 hours)
**Goal**: Update the dashboard component to use translations

**Complete Updated Implementation**:
```typescript
'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import Navigation from '@/components/Navigation';
import { Target, Trophy, Users, Plus, Calendar, Sword, Shield } from 'lucide-react';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import PricingModal from '@/components/PricingModal';
import { useMissionFilters } from '@/hooks/useMissionFilters';
import { filterMissions } from '@/lib/mission-utils';
import { useDebounce } from '@/lib/utils';
import MissionFiltersComponent from '@/components/MissionFilters';
import { 
  useDashboardTranslations, 
  useCommonTranslations,
  useMissionsTranslations,
  useTranslationHelpers 
} from '@/hooks/useI18n';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'kills' | 'headshots' | 'gamemode' | 'weapon' | 'rounds' | 'wins';
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserMission {
  id: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: string;
  acceptedAt?: string;
  lastUpdated: string;
  completedAt?: string;
  mission: Mission;
}

interface RecentMatch {
  matchId: string;
  gameMode: string;
  mapName: string;
  startTime: string;
  roundsWon: number;
  roundsLost: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
}

function DashboardContent() {
  const { user } = useUser();
  const locale = useLocale();
  const t = useDashboardTranslations();
  const common = useCommonTranslations();
  const missions = useMissionsTranslations();
  const { formatDate, formatNumber } = useTranslationHelpers();
  
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [userProfile, setUserProfile] = useState<{ 
    username: string; 
    valorantTag: string; 
    riotId?: { puuid: string; region: string }; 
    subscription?: { tier: string } 
  } | null>(null);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [dailyMissionsData, setDailyMissionsData] = useState<{
    missions: Mission[];
    tier: string;
    isLimited: boolean;
  }>({ missions: [], tier: 'free', isLimited: false });

  // Mission filters
  const { filters, updateFilter, clearFilters } = useMissionFilters();
  const debouncedFilters = useDebounce(filters, 300);

  // Filter available missions
  const availableFilteredMissions = useMemo(() => {
    return filterMissions(availableMissions, debouncedFilters);
  }, [availableMissions, debouncedFilters]);

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await fetch('/api/users');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
        
        // Fetch user missions
        const missionsResponse = await fetch('/api/missions/user');
        if (missionsResponse.ok) {
          const missionsData = await missionsResponse.json();
          setUserMissions(missionsData);
        }
        
        // Fetch available missions
        const availableResponse = await fetch('/api/missions/available');
        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          setAvailableMissions(availableData.missions || []);
          setDailyMissionsData({
            missions: availableData.missions || [],
            tier: availableData.tier || 'free',
            isLimited: availableData.isLimited || false
          });
        }
        
        // Fetch recent matches if PUUID exists
        if (profileData.riotId?.puuid) {
          fetchRecentMatches(profileData.riotId.puuid, profileData.riotId.region);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMatches = async (puuid: string, region: string) => {
    try {
      setMatchesLoading(true);
      const response = await fetch(`/api/valorant/matches?puuid=${puuid}&region=${region}`);
      if (response.ok) {
        const matchesData = await response.json();
        setRecentMatches(matchesData.matches || []);
      }
    } catch (error) {
      console.error('Error fetching recent matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const refreshProgress = async () => {
    console.log('🔄 Dashboard: Starting mission progress refresh');
    setRefreshing(true);
    try {
      if (!userProfile?.riotId?.puuid) {
        console.log('❌ Dashboard: No PUUID available for refresh');
        return;
      }

      const response = await fetch('/api/valorant/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puuid: userProfile.riotId.puuid,
          region: userProfile.riotId.region || 'na'
        }),
      });

      if (response.ok) {
        console.log('✅ Dashboard: Mission progress refresh successful');
        // Refresh user missions after processing
        await fetchUserData();
      } else {
        console.error('❌ Dashboard: Mission progress refresh failed');
      }
    } catch (error) {
      console.error('❌ Dashboard: Error during mission progress refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const acceptMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/missions/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId }),
      });

      if (response.ok) {
        // Refresh missions after accepting
        await fetchUserData();
      } else {
        console.error('Failed to accept mission');
      }
    } catch (error) {
      console.error('Error accepting mission:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'hard':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const activeMissions = userMissions.filter(um => !um.isCompleted);
  const completedMissions = userMissions.filter(um => um.isCompleted);
  const totalPoints = completedMissions.reduce((sum, um) => sum + (um.mission?.reward || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation
        user={user}
        onRefresh={refreshProgress}
        refreshing={refreshing}
      />

      <Container size="xl" padding="md" className="py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        {userProfile && (
          <div className="mb-6 sm:mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {t('welcome.title', { username: userProfile.username })}
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base">
                      {t('welcome.connectedRiotId', { riotId: userProfile.valorantTag })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm text-gray-400">{t('welcome.readyMessage')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Status */}
        <div className="mb-6 sm:mb-8">
          <SubscriptionStatus onUpgrade={() => setShowPricingModal(true)} />
        </div>

        {/* Stats Overview */}
        <Grid
          cols={{ default: 1, sm: 2, lg: 3 }}
          gap="md"
          className="mb-6 sm:mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">{t('stats.activeMissions')}</CardTitle>
              <Target className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeMissions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">{t('stats.completedMissions')}</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedMissions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">{t('stats.totalPoints')}</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(totalPoints)}</div>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Missions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('stats.activeMissions')}</h2>
          {activeMissions.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="text-gray-400">{t('missions.noActiveMissions')}</div>
              </CardContent>
            </Card>
          ) : (
            <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
              {activeMissions.map((userMission) => (
                <Card key={userMission.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{userMission.mission.title}</CardTitle>
                      <Badge className={getDifficultyColor(userMission.mission.difficulty)}>
                        {missions(`difficulty.${userMission.mission.difficulty}`)}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {userMission.mission.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-300">
                        {t('missions.target', { 
                          target: userMission.mission.target, 
                          type: missions(`types.${userMission.mission.type}`)
                        })}
                      </div>
                      <div className="text-sm text-gray-300">
                        {t('missions.reward', { points: userMission.mission.reward })}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{common('labels.progress')}</span>
                          <span className="text-white">
                            {t('missions.progress', { 
                              current: userMission.progress, 
                              target: userMission.mission.target 
                            })}
                          </span>
                        </div>
                        <Progress 
                          value={(userMission.progress / userMission.mission.target) * 100} 
                          className="h-2" 
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('missions.accepted', { 
                          date: formatDate(new Date(userMission.acceptedAt || userMission.startedAt))
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('missions.progressNote')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          )}
        </div>

        {/* Mission Filters */}
        <MissionFiltersComponent
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          resultCount={availableFilteredMissions.length}
          totalCount={availableMissions.length}
          subscriptionTier={dailyMissionsData?.tier || 'free'}
          isLimitedSelection={dailyMissionsData?.isLimited || false}
        />

        {/* Available Missions */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('missions.available')}</h2>
          <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
            {availableFilteredMissions.map((mission) => (
              <Card key={mission.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{mission.title}</CardTitle>
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {missions(`difficulty.${mission.difficulty}`)}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-300">
                    {mission.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300">
                      {t('missions.target', { 
                        target: mission.target, 
                        type: missions(`types.${mission.type}`)
                      })}
                    </div>
                    <div className="text-sm text-gray-300">
                      {t('missions.reward', { points: mission.reward })}
                    </div>
                    <Button
                      onClick={() => acceptMission(mission.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('missions.acceptMission')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </div>

        {/* Pricing Modal */}
        {showPricingModal && (
          <PricingModal
            isOpen={showPricingModal}
            onClose={() => setShowPricingModal(false)}
            currentTier={userProfile?.subscription?.tier || 'free'}
          />
        )}
      </Container>
    </div>
  );
}

export default function Dashboard() {
  const t = useDashboardTranslations();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-lg">{t('loadingDashboard')}</div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
```

## Key Changes Made

### Translation Integration
- ✅ Replaced all hardcoded strings with translation calls
- ✅ Used proper namespace hooks (`useDashboardTranslations`, `useMissionsTranslations`)
- ✅ Implemented locale-aware date and number formatting
- ✅ Added proper variable interpolation for dynamic content

### Localization Features
- ✅ Date formatting respects user locale
- ✅ Number formatting for points and statistics
- ✅ Mission types and difficulty levels translated
- ✅ Progress indicators with localized text

### Functionality Preservation
- ✅ All existing dashboard functionality maintained
- ✅ Mission acceptance and progress tracking work
- ✅ Subscription status integration preserved
- ✅ Responsive design maintained

## Validation Checklist
- [ ] Dashboard renders correctly in both languages
- [ ] All mission content is properly translated
- [ ] Date and number formatting respects locale
- [ ] Mission acceptance functionality works
- [ ] Progress tracking displays correctly
- [ ] Subscription status shows properly
- [ ] Responsive design works with longer Spanish text

## Testing Notes
- Test mission acceptance in both languages
- Verify date formatting shows correctly for locale
- Check that mission progress updates properly
- Confirm subscription status displays correctly
- Test responsive behavior with translated content

## Next Steps
This task completes the dashboard page internationalization. The dashboard now fully supports both English and Spanish languages with proper formatting and maintains all existing functionality.
