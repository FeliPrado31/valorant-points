import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ValorantAPIService } from '@/lib/valorant-api';
import { adminDb, ValorantMatch, UserMission } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const region = searchParams.get('region') || 'na';
    const size = parseInt(searchParams.get('size') || '10');

    if (!puuid) {
      return NextResponse.json({ error: 'PUUID is required' }, { status: 400 });
    }

    try {
      const matches = await ValorantAPIService.getPlayerMatches(puuid, region, size);
      return NextResponse.json(matches);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Rate limit exceeded')) {
        return NextResponse.json({ error: errorMessage }, { status: 429 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { puuid, region = 'na' } = body;

    if (!puuid) {
      return NextResponse.json({ error: 'PUUID is required' }, { status: 400 });
    }

    // Get recent matches
    const matches = await ValorantAPIService.getPlayerMatches(puuid, region, 5);

    // Process matches and update mission progress
    const processedMatches = [];

    for (const match of matches) {
      // Find the player in the match
      const playerData = match.players.all_players.find(p => p.puuid === puuid);

      if (!playerData) continue;

      // Check if match is already processed
      const existingMatch = await adminDb
        .collection('valorantMatches')
        .where('userId', '==', userId)
        .where('matchId', '==', match.metadata.matchid)
        .get();

      if (!existingMatch.empty) continue;

      // Determine if player won
      const playerTeam = playerData.team;
      const won = (playerTeam === 'Red' && match.teams.red.has_won) ||
                  (playerTeam === 'Blue' && match.teams.blue.has_won);

      // Parse match timestamp from Henrik API v3 format
      let matchPlayedAt: Date;
      try {
        // Henrik API v3 uses game_start_patched (formatted string) or game_start (timestamp)
        if (match.metadata.game_start_patched) {
          // Parse formatted date string like "Saturday, May 24, 2025 11:19 PM"
          matchPlayedAt = new Date(match.metadata.game_start_patched);
        } else if (match.metadata.game_start) {
          // Fallback to raw timestamp
          matchPlayedAt = new Date(match.metadata.game_start);
        } else {
          // Fallback to current time if no timestamp available
          console.warn(`No timestamp found for match ${match.metadata.matchid}, using current time`);
          matchPlayedAt = new Date();
        }
      } catch (error) {
        console.error(`Error parsing match timestamp for ${match.metadata.matchid}:`, error);
        matchPlayedAt = new Date();
      }

      console.log(`🕐 Match timestamp parsing:`, {
        matchId: match.metadata.matchid,
        game_start_patched: match.metadata.game_start_patched,
        game_start: match.metadata.game_start,
        parsedDate: matchPlayedAt.toISOString()
      });

      // Create match record
      const matchData: Omit<ValorantMatch, 'id'> = {
        userId,
        matchId: match.metadata.matchid,
        gameMode: match.metadata.mode,
        map: match.metadata.map,
        kills: playerData.stats.kills,
        deaths: playerData.stats.deaths,
        assists: playerData.stats.assists,
        headshots: playerData.stats.headshots,
        bodyshots: playerData.stats.bodyshots,
        legshots: playerData.stats.legshots,
        roundsWon: playerTeam === 'Red' ? match.teams.red.rounds_won : match.teams.blue.rounds_won,
        roundsLost: playerTeam === 'Red' ? match.teams.red.rounds_lost : match.teams.blue.rounds_lost,
        won,
        playedAt: matchPlayedAt,
        processedAt: new Date(),
      };

      // Save match to Firestore
      const matchRef = await adminDb.collection('valorantMatches').add(matchData);
      const savedMatch = { id: matchRef.id, ...matchData };
      processedMatches.push(savedMatch);

      // Update mission progress
      await updateMissionProgress(userId, savedMatch);
    }

    return NextResponse.json({
      processedMatches: processedMatches.length,
      matches: processedMatches
    });
  } catch (error) {
    console.error('Error processing matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateMissionProgress(userId: string, matchData: ValorantMatch) {
  console.log('🎯 Updating mission progress for match:', {
    matchId: matchData.matchId,
    playedAt: matchData.playedAt,
    userId
  });

  // Get user's active missions
  const userMissionsSnapshot = await adminDb
    .collection('userMissions')
    .where('userId', '==', userId)
    .where('isCompleted', '==', false)
    .get();

  console.log(`📋 Found ${userMissionsSnapshot.docs.length} active missions`);

  for (const userMissionDoc of userMissionsSnapshot.docs) {
    const userMission = userMissionDoc.data() as UserMission;

    // CRITICAL: Only count matches played AFTER mission acceptance
    const missionStartTime = userMission.startedAt && typeof userMission.startedAt === 'object' && 'toDate' in userMission.startedAt
      ? (userMission.startedAt as { toDate: () => Date }).toDate()
      : new Date(userMission.startedAt as unknown as string);
    const matchPlayTime = matchData.playedAt;

    console.log(`🕐 Mission ${userMission.missionId} timestamp check:`, {
      missionStarted: missionStartTime.toISOString(),
      matchPlayed: matchPlayTime.toISOString(),
      isAfterMissionStart: matchPlayTime > missionStartTime
    });

    if (matchPlayTime <= missionStartTime) {
      console.log(`⏰ Skipping match - played before mission acceptance`);
      continue;
    }

    // Get mission details
    const missionDoc = await adminDb.collection('missions').doc(userMission.missionId).get();
    const mission = missionDoc.data();

    if (!mission) {
      console.log(`❌ Mission data not found for ${userMission.missionId}`);
      continue;
    }

    let progressIncrement = 0;

    // Calculate progress based on mission type
    switch (mission.type) {
      case 'kills':
        progressIncrement = matchData.kills;
        break;
      case 'headshots':
        progressIncrement = matchData.headshots;
        break;
      case 'gamemode':
        // Extract the key game mode from mission description (e.g., "Deathmatch" from "Play 5 Deathmatch games")
        const missionGameMode = mission.description.toLowerCase().match(/\b(deathmatch|competitive|unrated|spike rush|escalation|replication|snowball fight)\b/)?.[0];
        const actualGameMode = matchData.gameMode.toLowerCase();

        console.log(`🎮 Game mode matching:`, {
          missionDescription: mission.description,
          extractedGameMode: missionGameMode,
          actualGameMode: actualGameMode,
          matches: missionGameMode && actualGameMode.includes(missionGameMode)
        });

        // Check if the actual game mode contains the mission's target game mode
        // This handles cases like "Team Deathmatch" matching "Deathmatch"
        if (missionGameMode && actualGameMode.includes(missionGameMode)) {
          progressIncrement = 1;
        }
        break;
      case 'wins':
        if (matchData.won) {
          progressIncrement = 1;
        }
        break;
      case 'rounds':
        progressIncrement = matchData.roundsWon;
        break;
    }

    console.log(`📊 Mission progress calculation:`, {
      missionType: mission.type,
      missionTitle: mission.title,
      missionDescription: mission.description,
      matchGameMode: matchData.gameMode,
      progressIncrement,
      currentProgress: userMission.progress,
      target: mission.target
    });

    if (progressIncrement > 0) {
      const newProgress = userMission.progress + progressIncrement;
      const isCompleted = newProgress >= mission.target;

      const updateData: Partial<UserMission> = {
        progress: newProgress,
        isCompleted,
        lastUpdated: new Date(),
        ...(isCompleted && { completedAt: new Date() })
      };

      await adminDb.collection('userMissions').doc(userMissionDoc.id).update(updateData);

      console.log(`✅ Updated mission progress:`, {
        missionTitle: mission.title,
        oldProgress: userMission.progress,
        newProgress,
        isCompleted,
        increment: progressIncrement
      });
    } else {
      console.log(`⚪ No progress increment for mission: ${mission.title}`);
    }
  }
}
