'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
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
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

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
  map: string;
  gameMode: string;
  result: 'Win' | 'Loss';
  agent: string;
  kills: number;
  deaths: number;
  assists: number;
  matchDate: string;
  rank: string;
  agentImage?: string;
}

function DashboardContent() {
  const { user } = useUser();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard');
  const common = useTranslations('common');
  const nav = useTranslations('navigation');
  
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
    tier: 'free' | 'standard' | 'premium';
    maxMissions: number;
    isLimited: boolean;
  } | null>(null);

  // Mission filtering
  const { filters, updateFilter, clearFilters } = useMissionFilters();
  const debouncedSearch = useDebounce(filters.search, 300);

  // Apply filters to missions
  const filteredMissions = useMemo(() => {
    const filtersWithDebouncedSearch = { ...filters, search: debouncedSearch };
    return filterMissions(availableMissions, userMissions, filtersWithDebouncedSearch);
  }, [availableMissions, userMissions, filters, debouncedSearch]);

  // Filter available missions (exclude already active missions)
  const availableFilteredMissions = useMemo(() => {
    return filteredMissions.filter(mission =>
      !userMissions.some(um => um.missionId === mission.id && !um.isCompleted)
    );
  }, [filteredMissions, userMissions]);

  const fetchData = useCallback(async () => {
    console.log('🔍 Dashboard: Starting fetchData()');
    try {
      const [userMissionsRes, dailyMissionsRes, userRes] = await Promise.all([
        fetch('/api/user-missions'),
        fetch('/api/daily-missions'),
        fetch('/api/users')
      ]);

      if (userMissionsRes.ok) {
        const userMissionsData = await userMissionsRes.json();
        setUserMissions(userMissionsData);
      }

      if (dailyMissionsRes.ok) {
        const dailyMissionsData = await dailyMissionsRes.json();
        setDailyMissionsData(dailyMissionsData);
        setAvailableMissions(dailyMissionsData.missions);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserProfile(userData);

        // Fetch recent matches if user has Riot ID
        if (userData.riotId && userData.riotId.puuid) {
          fetchRecentMatches();
        }
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchRecentMatches = async () => {
    setMatchesLoading(true);
    try {
      const response = await fetch('/api/valorant/recent-matches');
      if (response.ok) {
        const data = await response.json();
        setRecentMatches(data.matches || []);
      } else {
        setRecentMatches([]);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching recent matches:', error);
      setRecentMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  };

  const refreshProgress = async () => {
    setRefreshing(true);
    try {
      if (!userProfile?.riotId?.puuid) {
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
        await fetchData();
      }
    } catch (error) {
      console.error('❌ Dashboard: Error refreshing progress:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const startMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/user-missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorData = await response.json();
        if (errorData.error?.includes('Mission limit reached') || errorData.error?.includes('Upgrade to')) {
          setShowPricingModal(true);
        } else {
          alert(errorData.error || 'Failed to start mission');
        }
      }
    } catch (error) {
      console.error('Error starting mission:', error);
      alert('Failed to start mission. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const activeMissions = userMissions.filter(um => !um.isCompleted);
  const completedMissions = userMissions.filter(um => um.isCompleted);
  const totalPoints = completedMissions.reduce((sum, um) => sum + (um.mission?.reward || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{common('messages.loading')}</div>
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
                      {nav('welcome', { name: userProfile.username })}
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
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing Modal */}
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
        />
      </Container>
    </div>
  );
}

export default function LocalizedDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
