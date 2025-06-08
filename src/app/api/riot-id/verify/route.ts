import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ValorantAPIService } from '@/lib/valorant-api';

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement Ko-fi authentication
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, tag } = body;

    if (!name || !tag) {
      return NextResponse.json({ error: 'Name and tag are required' }, { status: 400 });
    }

    try {
      // Get player data from Valorant API
      const playerData = await ValorantAPIService.getPlayerByNameAndTag(name, tag);

      if (!playerData) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }

      // Check if this Riot ID (puuid) is already linked to another user
      const existingUserSnapshot = await adminDb
        .collection('users')
        .where('riotId.puuid', '==', playerData.puuid)
        .get();

      if (!existingUserSnapshot.empty) {
        // Check if it's linked to the current user
        const existingUser = existingUserSnapshot.docs[0];
        if (existingUser.id !== userId) {
          return NextResponse.json({
            error: 'This Riot ID is already linked to another account'
          }, { status: 409 });
        }
      }

      // Return the player data for confirmation
      return NextResponse.json({
        verified: true,
        playerData: {
          puuid: playerData.puuid,
          region: playerData.region,
          name: playerData.name,
          tag: playerData.tag,
          accountLevel: playerData.account_level,
          card: playerData.card,
          lastUpdate: playerData.last_update,
          lastUpdateRaw: playerData.last_update_raw,
        }
      });

    } catch (error: unknown) {
      console.error('Riot ID verification error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Rate limit exceeded')) {
        return NextResponse.json({ error: errorMessage }, { status: 429 });
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response: { status: number } }).response;
        const status = response.status;
        if (status === 404) {
          return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        } else if (status === 429) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
      }

      return NextResponse.json({ error: 'Failed to verify Riot ID' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in Riot ID verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
