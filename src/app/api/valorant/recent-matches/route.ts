import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ValorantAPIService } from '@/lib/valorant-api';
import { adminDb } from '@/lib/firebase-admin';

export interface ProcessedMatch {
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

export async function GET(request: NextRequest) {
  console.log('🔍 API: /api/valorant/recent-matches called');
  try {
    const { userId } = await auth();
    console.log('🔐 API: Auth result', { userId: userId ? 'present' : 'missing' });

    if (!userId) {
      console.log('❌ API: Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to extract puuid and region
    console.log('🔍 API: Fetching user document for userId:', userId);
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.log('❌ API: User profile not found for userId:', userId);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    console.log('✅ API: User data retrieved', {
      username: userData?.username,
      hasRiotId: !!userData?.riotId,
      hasPuuid: !!userData?.riotId?.puuid,
      region: userData?.riotId?.region
    });

    if (!userData?.riotId || !userData.riotId.puuid) {
      console.log('❌ API: Riot ID not found in user data');
      return NextResponse.json({ error: 'Riot ID not found. Please complete setup first.' }, { status: 400 });
    }

    const { puuid, region } = userData.riotId;
    console.log('✅ API: Extracted PUUID and region', { puuid, region });

    try {
      // Debug logging
      console.log('🎮 API: Calling ValorantAPIService.getRecentMatches', { puuid, region });

      // Fetch recent matches using the v3 endpoint
      const matches = await ValorantAPIService.getRecentMatches(puuid, region, 3);
      console.log('📊 API: ValorantAPIService returned', { matchCount: matches?.length || 0 });

      if (!matches || matches.length === 0) {
        console.log('⚠️  API: No matches found, returning empty array');
        return NextResponse.json({ matches: [] });
      }

      // Process matches to extract relevant information (v3 format)
      console.log('🔍 API: Processing matches...');
      const processedMatches: ProcessedMatch[] = [];

      for (const match of matches) {
        // Find the current user's data in the match (v3 format)
        const playerData = match.players?.all_players?.find((p: any) => p.puuid === puuid);

        if (!playerData) {
          console.warn(`Player data not found for match ${match.metadata?.matchid || 'unknown'}`);
          continue;
        }

        // Determine if player won (v3 format)
        const playerTeam = playerData.team;
        const won = (playerTeam === 'Red' && match.teams?.red?.has_won) ||
                    (playerTeam === 'Blue' && match.teams?.blue?.has_won);

        // Process the match data (v3 format)
        const processedMatch: ProcessedMatch = {
          matchId: match.metadata?.matchid || 'unknown',
          map: match.metadata?.map || 'Unknown Map',
          gameMode: match.metadata?.mode || 'Unknown Mode',
          result: won ? 'Win' : 'Loss',
          agent: playerData.character || 'Unknown Agent',
          kills: playerData.stats?.kills || 0,
          deaths: playerData.stats?.deaths || 0,
          assists: playerData.stats?.assists || 0,
          matchDate: match.metadata?.game_start_patched || new Date().toISOString(),
          rank: playerData.currenttier_patched || 'Unranked',
          agentImage: playerData.assets?.agent?.small || undefined,
        };

        processedMatches.push(processedMatch);
      }

      console.log('✅ API: Successfully processed matches', {
        processedCount: processedMatches.length,
        matches: processedMatches.map(m => ({ map: m.map, result: m.result, agent: m.agent }))
      });
      return NextResponse.json({ matches: processedMatches });

    } catch (error: any) {
      console.error('Error fetching recent matches:', error);

      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }

      return NextResponse.json({ error: 'Failed to fetch recent matches' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in recent matches API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
