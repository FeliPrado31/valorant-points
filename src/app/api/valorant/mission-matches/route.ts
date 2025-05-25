import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ValorantAPIService } from '@/lib/valorant-api';
import { adminDb } from '@/lib/firebase-admin';

interface ProcessedMatch {
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
  playedAt: Date;
  missionRelevant: boolean;
  missionId?: string;
}

export async function GET(request: NextRequest) {
  console.log('🎯 API: /api/valorant/mission-matches called');
  try {
    const { userId } = await auth();
    console.log('🔐 API: Auth result', { userId: userId ? 'present' : 'missing' });

    if (!userId) {
      console.log('❌ API: Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');
    const size = parseInt(searchParams.get('size') || '10');

    console.log('📋 API: Request parameters', { missionId, size });

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

    // Get user's missions to determine filtering criteria
    let userMissions = [];
    if (missionId) {
      // Get specific mission
      const missionDoc = await adminDb
        .collection('userMissions')
        .where('userId', '==', userId)
        .where('missionId', '==', missionId)
        .get();

      userMissions = missionDoc.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; startedAt: unknown; missionId: string }));
      console.log(`🎯 API: Found specific mission: ${missionId}`);
    } else {
      // Get all active missions
      const missionsSnapshot = await adminDb
        .collection('userMissions')
        .where('userId', '==', userId)
        .where('isCompleted', '==', false)
        .get();

      userMissions = missionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; startedAt: unknown; missionId: string }));
      console.log(`📋 API: Found ${userMissions.length} active missions`);
    }

    try {
      console.log('🎮 API: Calling ValorantAPIService.getRecentMatches', { puuid, region, size });

      // Fetch recent matches using the v3 endpoint
      const matches = await ValorantAPIService.getRecentMatches(puuid, region, size);
      console.log('📊 API: ValorantAPIService returned', { matchCount: matches?.length || 0 });

      if (!matches || matches.length === 0) {
        console.log('⚠️  API: No matches found, returning empty array');
        return NextResponse.json({ matches: [] });
      }

      // Process matches and filter by mission timestamps
      console.log('🔍 API: Processing matches with mission timestamp filtering...');
      const processedMatches: ProcessedMatch[] = [];

      for (const match of matches) {
        console.log(`\n🔍 Processing match: ${match.metadata?.matchid || 'unknown'}`);

        // Find the target player in the match (v3 format)
        const playerData = match.players?.all_players?.find(p => p.puuid === puuid);

        if (!playerData) {
          console.warn(`⚠️  Player data not found for match ${match.metadata?.matchid || 'unknown'}`);
          continue;
        }

        // Parse match timestamp
        let matchPlayedAt: Date;
        try {
          if (match.metadata.game_start_patched) {
            matchPlayedAt = new Date(match.metadata.game_start_patched);
          } else if (match.metadata.game_start) {
            matchPlayedAt = new Date(match.metadata.game_start);
          } else {
            console.warn(`No timestamp found for match ${match.metadata.matchid}`);
            continue;
          }
        } catch (error) {
          console.error(`Error parsing timestamp for match ${match.metadata.matchid}:`, error);
          continue;
        }

        // Determine if player won (v3 format)
        const playerTeam = playerData.team;
        const won = (playerTeam === 'Red' && match.teams?.red?.has_won) ||
                    (playerTeam === 'Blue' && match.teams?.blue?.has_won);

        // Check if match is relevant for any mission
        let missionRelevant = false;
        let relevantMissionId = undefined;

        for (const userMission of userMissions) {
          const missionStartTime = userMission.startedAt && typeof userMission.startedAt === 'object' && 'toDate' in userMission.startedAt
            ? (userMission.startedAt as { toDate: () => Date }).toDate()
            : new Date(userMission.startedAt as unknown as string);

          if (matchPlayedAt > missionStartTime) {
            missionRelevant = true;
            relevantMissionId = userMission.missionId;
            console.log(`✅ Match is relevant for mission ${userMission.missionId}`);
            break;
          }
        }

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
          playedAt: matchPlayedAt,
          missionRelevant,
          missionId: relevantMissionId,
        };

        console.log(`✅ Processed match: ${processedMatch.map} - ${processedMatch.result} - ${processedMatch.agent} (Mission relevant: ${missionRelevant})`);
        processedMatches.push(processedMatch);
      }

      // Filter matches if specific mission requested
      let filteredMatches = processedMatches;
      if (missionId) {
        filteredMatches = processedMatches.filter(match =>
          match.missionRelevant && match.missionId === missionId
        );
        console.log(`🎯 Filtered to ${filteredMatches.length} matches for mission ${missionId}`);
      }

      console.log('✅ API: Successfully processed matches', {
        totalMatches: processedMatches.length,
        filteredMatches: filteredMatches.length,
        missionRelevantMatches: processedMatches.filter(m => m.missionRelevant).length
      });

      return NextResponse.json({
        matches: filteredMatches,
        totalMatches: processedMatches.length,
        missionRelevantMatches: processedMatches.filter(m => m.missionRelevant).length
      });

    } catch (error: unknown) {
      console.error('❌ Error fetching recent matches:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Rate limit exceeded')) {
        return NextResponse.json({ error: errorMessage }, { status: 429 });
      }

      return NextResponse.json({ error: 'Failed to fetch recent matches' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in mission matches API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
