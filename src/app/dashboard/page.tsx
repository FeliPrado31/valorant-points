'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Users, RefreshCw, Plus, Calendar, Sword, Shield } from 'lucide-react';
import Link from 'next/link';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import PricingModal from '@/components/PricingModal';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserMission {
  id: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: string; // ISO date string from API
  acceptedAt?: string; // ISO date string from API
  lastUpdated: string; // ISO date string from API
  completedAt?: string; // ISO date string from API
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

export default function Dashboard() {
  const { user } = useUser();
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('🔍 Dashboard: Starting fetchData()');
    try {
      const [userMissionsRes, missionsRes, userRes] = await Promise.all([
        fetch('/api/user-missions'),
        fetch('/api/missions'),
        fetch('/api/users')
      ]);

      console.log('📊 Dashboard: API responses received', {
        userMissions: userMissionsRes.status,
        missions: missionsRes.status,
        user: userRes.status
      });

      if (userMissionsRes.ok) {
        const userMissionsData = await userMissionsRes.json();
        setUserMissions(userMissionsData);
        console.log('✅ Dashboard: User missions loaded', userMissionsData.length);
      }

      if (missionsRes.ok) {
        const missionsData = await missionsRes.json();
        setAvailableMissions(missionsData);
        console.log('✅ Dashboard: Available missions loaded', missionsData.length);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('✅ Dashboard: User data loaded', {
          username: userData.username,
          hasRiotId: !!userData.riotId,
          hasPuuid: !!userData.riotId?.puuid,
          region: userData.riotId?.region
        });
        setUserProfile(userData);

        // Fetch recent matches if user has Riot ID
        if (userData.riotId && userData.riotId.puuid) {
          console.log('🎮 Dashboard: User has Riot ID, fetching recent matches...');
          fetchRecentMatches();
        } else {
          console.log('⚠️  Dashboard: User does not have Riot ID or PUUID');
        }
      } else {
        console.error('❌ Dashboard: Failed to fetch user data', userRes.status);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMatches = async () => {
    console.log('🎮 Dashboard: Starting fetchRecentMatches()');
    setMatchesLoading(true);
    try {
      console.log('📡 Dashboard: Calling /api/valorant/recent-matches');
      const response = await fetch('/api/valorant/recent-matches');
      console.log('📊 Dashboard: Recent matches response', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard: Recent matches data received', {
          hasMatches: !!data.matches,
          matchCount: data.matches?.length || 0,
          data: data
        });
        setRecentMatches(data.matches || []);
      } else {
        const errorData = await response.text();
        console.error('❌ Dashboard: Failed to fetch recent matches', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        setRecentMatches([]);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching recent matches:', error);
      setRecentMatches([]);
    } finally {
      console.log('🏁 Dashboard: fetchRecentMatches() completed');
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

      // Trigger match processing to update mission progress
      console.log('📡 Dashboard: Calling /api/valorant/matches to process recent matches');
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
        const result = await response.json();
        console.log('✅ Dashboard: Match processing completed', {
          processedMatches: result.processedMatches,
          message: 'Mission progress updated based on timestamp filtering'
        });

        // Refetch user missions to get updated progress
        await fetchData();
      } else {
        console.error('❌ Dashboard: Failed to process matches', response.status);
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

        // Show upgrade modal if it's a subscription limit error
        if (errorData.error?.includes('Mission limit reached') || errorData.error?.includes('Upgrade to')) {
          setShowPricingModal(true);
        } else {
          // Show other errors as alerts
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
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-slate-700">
        <Link href="/" className="flex items-center space-x-2">
          <Target className="h-8 w-8 text-red-500" />
          <span className="text-2xl font-bold text-white">Valorant Missions</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/profile">
            <Button
              variant="outline"
              className="text-white border-slate-600 hover:bg-slate-800"
            >
              Profile
            </Button>
          </Link>
          <Link href="/subscription">
            <Button
              variant="outline"
              className="text-white border-slate-600 hover:bg-slate-800"
            >
              Subscription
            </Button>
          </Link>
          <Button
            onClick={refreshProgress}
            disabled={refreshing}
            variant="outline"
            className="text-white border-slate-600 hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Progress
          </Button>
          <div className="text-white">
            Welcome, {user?.firstName || user?.username}!
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        {userProfile && (
          <div className="mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Welcome back, {userProfile.username}!
                    </h2>
                    <p className="text-gray-300">
                      Connected Riot ID: <span className="text-red-400 font-semibold">{userProfile.valorantTag}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Ready to complete missions!</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus onUpgrade={() => setShowPricingModal(true)} />
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Missions</CardTitle>
              <Target className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeMissions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedMissions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Points</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matches */}
        {userProfile && userProfile.riotId && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Matches</h2>
            {matchesLoading ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-300">Loading recent matches...</div>
                </CardContent>
              </Card>
            ) : recentMatches.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-300">No recent matches found. Play some Valorant to see your match history!</div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMatches.map((match) => (
                  <Card key={match.matchId} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${match.result === 'Win' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <CardTitle className="text-white text-lg">{match.result}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {match.gameMode}
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-sm">{match.map}</div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {match.agentImage && (
                            <img
                              src={match.agentImage}
                              alt={match.agent}
                              className="w-8 h-8 rounded"
                            />
                          )}
                          <span className="text-white font-medium">{match.agent}</span>
                        </div>
                        <div className="text-gray-400 text-sm">{match.rank}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Sword className="h-4 w-4 text-red-400" />
                            <span className="text-white">{match.kills}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span className="text-white">{match.deaths}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span className="text-white">{match.assists}</span>
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {match.kills}/{match.deaths}/{match.assists}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-gray-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Missions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Active Missions</h2>
          {activeMissions.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <p className="text-gray-300 mb-4">No active missions. Start a new mission below!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMissions.map((userMission) => (
                <Card key={userMission.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{userMission.mission?.title}</CardTitle>
                      <Badge className={getDifficultyColor(userMission.mission?.difficulty || 'easy')}>
                        {userMission.mission?.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {userMission.mission?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white">
                          {userMission.progress} / {userMission.mission?.target}
                        </span>
                      </div>
                      <Progress
                        value={(userMission.progress / (userMission.mission?.target || 1)) * 100}
                        className="h-2"
                      />
                      <div className="text-sm text-yellow-500">
                        Reward: {userMission.mission?.reward} points
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Accepted: {userMission.acceptedAt || userMission.startedAt ?
                          new Date(userMission.acceptedAt || userMission.startedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Only matches played after acceptance count toward progress
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Missions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Available Missions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMissions
              .filter(mission => !userMissions.some(um => um.missionId === mission.id && !um.isCompleted))
              .map((mission) => (
                <Card key={mission.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{mission.title}</CardTitle>
                      <Badge className={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {mission.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-300">
                        Target: {mission.target} {mission.type}
                      </div>
                      <div className="text-sm text-yellow-500">
                        Reward: {mission.reward} points
                      </div>
                      <Button
                        onClick={() => startMission(mission.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start Mission
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentTier={userProfile?.subscription?.tier || 'free'}
      />
    </div>
  );
}
