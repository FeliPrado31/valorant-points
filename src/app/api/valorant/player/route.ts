import { NextRequest, NextResponse } from 'next/server';
import { ValorantAPIService } from '@/lib/valorant-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const tag = searchParams.get('tag');

    console.log('API Route - Environment check:');
    console.log('VALORANT_API_KEY:', process.env.VALORANT_API_KEY ? 'Present' : 'Missing');
    console.log('VALORANT_API_BASE_URL:', process.env.VALORANT_API_BASE_URL);
    console.log('Request params:', { name, tag });

    if (!name || !tag) {
      return NextResponse.json({ error: 'Name and tag are required' }, { status: 400 });
    }

    try {
      const player = await ValorantAPIService.getPlayerByNameAndTag(name, tag);

      if (!player) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }

      return NextResponse.json(player);
    } catch (error: unknown) {
      console.error('API Route Error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Rate limit exceeded')) {
        return NextResponse.json({ error: errorMessage }, { status: 429 });
      }

      // Handle specific HTTP errors from the Valorant API
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response: { status: number; data?: { message?: string }; statusText?: string } }).response;
        const status = response.status;
        const message = response.data?.message || response.statusText || 'API Error';

        if (status === 401) {
          return NextResponse.json({ error: 'API authentication failed' }, { status: 401 });
        } else if (status === 404) {
          return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        } else if (status === 429) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        } else {
          return NextResponse.json({ error: `API Error: ${message}` }, { status: status });
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
