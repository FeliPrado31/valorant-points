import axios from 'axios';

const API_KEY = process.env.VALORANT_API_KEY;
const BASE_URL = process.env.VALORANT_API_BASE_URL;
const BASE_URL_V3 = 'https://api.henrikdev.xyz/valorant/v3';

// Rate limiting: 30 requests per minute
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

class RateLimiter {
  private requests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests older than the rate window
    this.requests = this.requests.filter(time => now - time < RATE_WINDOW);

    if (this.requests.length >= RATE_LIMIT) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getWaitTime(): number {
    if (this.requests.length < RATE_LIMIT) return 0;

    const oldestRequest = Math.min(...this.requests);
    return RATE_WINDOW - (Date.now() - oldestRequest);
  }
}

const rateLimiter = new RateLimiter();

const valorantApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const valorantApiV3 = axios.create({
  baseURL: BASE_URL_V3,
  headers: {
    'Authorization': API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add rate limiting interceptor
valorantApi.interceptors.request.use(async (config) => {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }
  return config;
});

valorantApiV3.interceptors.request.use(async (config) => {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }
  return config;
});

export interface ValorantPlayer {
  puuid: string;
  name: string;
  tag: string;
  region: string;
  account_level: number;
  card: {
    small: string;
    large: string;
    wide: string;
    id: string;
  };
  last_update: string;
  last_update_raw: number;
}

export interface ValorantMatchData {
  metadata: {
    matchid: string;
    map: string;
    game_version: string;
    game_length: number;
    game_start: number;
    game_start_patched: string;
    rounds_played: number;
    mode: string;
    queue: string;
    season_id: string;
    platform: string;
    party_rr_penalities: Record<string, unknown>;
    premier_info: Record<string, unknown>;
    region: string;
    cluster: string;
  };
  players: {
    all_players: Array<{
      puuid: string;
      name: string;
      tag: string;
      team: string;
      level: number;
      character: string;
      currenttier: number;
      currenttier_patched: string;
      player_card: string;
      player_title: string;
      party_id: string;
      session_playtime: {
        minutes: number;
        seconds: number;
        milliseconds: number;
      };
      assets: {
        card: {
          small: string;
          large: string;
          wide: string;
        };
        agent: {
          small: string;
          bust: string;
          full: string;
          killfeed: string;
        };
      };
      behaviour: {
        afk_rounds: number;
        friendly_fire: {
          incoming: number;
          outgoing: number;
        };
        rounds_in_spawn: number;
      };
      platform: {
        type: string;
        os: {
          name: string;
          version: string;
        };
      };
      ability_casts: {
        c_cast: number;
        q_cast: number;
        e_cast: number;
        x_cast: number;
      };
      stats: {
        score: number;
        kills: number;
        deaths: number;
        assists: number;
        bodyshots: number;
        headshots: number;
        legshots: number;
      };
      economy: {
        spent: {
          overall: number;
          average: number;
        };
        loadout_value: {
          overall: number;
          average: number;
        };
      };
      damage_made: number;
      damage_received: number;
    }>;
    red: Record<string, unknown>[];
    blue: Record<string, unknown>[];
  };
  teams: {
    red: {
      has_won: boolean;
      rounds_won: number;
      rounds_lost: number;
    };
    blue: {
      has_won: boolean;
      rounds_won: number;
      rounds_lost: number;
    };
  };
  rounds: Array<{
    winning_team: string;
    end_type: string;
    bomb_planted: boolean;
    bomb_defused: boolean;
    plant_events: Record<string, unknown>;
    defuse_events: Record<string, unknown>;
    player_stats: Array<{
      ability_casts: Record<string, unknown>;
      player_puuid: string;
      player_display_name: string;
      player_tag: string;
      player_team: string;
      damage_events: Record<string, unknown>[];
      damage: number;
      bodyshots: number;
      headshots: number;
      legshots: number;
      kill_events: Record<string, unknown>[];
      kills: number;
      score: number;
      economy: Record<string, unknown>;
      was_afk: boolean;
      was_penalized: boolean;
      stayed_in_spawn: boolean;
    }>;
  }>;
}

export class ValorantAPIService {
  static async getPlayerByNameAndTag(name: string, tag: string): Promise<ValorantPlayer | null> {
    try {
      // Properly encode the name and tag for URL
      const encodedName = encodeURIComponent(name);
      const encodedTag = encodeURIComponent(tag);
      console.log(`Fetching player: ${encodedName}#${encodedTag}`);
      const response = await valorantApi.get(`/account/${encodedName}/${encodedTag}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown }; config?: { url?: string } };

      console.error('Error fetching player:', {
        message: errorMessage,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url
      });

      // Re-throw the error so the calling code can handle it appropriately
      throw error;
    }
  }

  static async getPlayerMatches(puuid: string, region: string = 'na', size: number = 10): Promise<ValorantMatchData[]> {
    try {
      const response = await valorantApiV3.get(`/by-puuid/matches/${region}/${puuid}?size=${size}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching player matches:', error);
      return [];
    }
  }

  static async getMatchDetails(matchId: string): Promise<ValorantMatchData | null> {
    try {
      const response = await valorantApi.get(`/match/${matchId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching match details:', error);
      return null;
    }
  }

  static async getPlayerStats(puuid: string, region: string = 'na'): Promise<Record<string, unknown> | null> {
    try {
      const response = await valorantApi.get(`/mmr/${region}/${puuid}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }

  static async getRecentMatches(puuid: string, region: string = 'na', size: number = 3): Promise<ValorantMatchData[]> {
    try {
      // Use the v3 endpoint which is confirmed to work
      const response = await valorantApiV3.get(`/by-puuid/matches/${region}/${puuid}?size=${size}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      return [];
    }
  }
}

export default ValorantAPIService;
