import { MissionFilters } from './utils';

// Mission and UserMission interfaces (matching existing types)
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'kills' | 'headshots' | 'gamemode' | 'weapon' | 'rounds' | 'wins';
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserMission {
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

// Mission status types
export type MissionStatus = 'available' | 'active' | 'completed';

/**
 * Get the status of a mission for the current user
 */
export function getMissionStatus(mission: Mission, userMissions: UserMission[]): MissionStatus {
  const userMission = userMissions.find(um => um.missionId === mission.id);
  
  if (!userMission) {
    return 'available';
  }
  
  if (userMission.isCompleted) {
    return 'completed';
  }
  
  return 'active';
}

/**
 * Filter missions based on the provided filters
 */
export function filterMissions(
  missions: Mission[], 
  userMissions: UserMission[], 
  filters: MissionFilters
): Mission[] {
  return missions.filter(mission => {
    // Search filter (case-insensitive search in title and description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const titleMatch = mission.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = mission.description.toLowerCase().includes(searchTerm);
      
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }
    
    // Difficulty filter
    if (filters.difficulty !== 'all' && mission.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Type filter
    if (filters.type !== 'all' && mission.type !== filters.type) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all') {
      const status = getMissionStatus(mission, userMissions);
      if (status !== filters.status) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * URL parameter utilities for filter persistence
 */
export function filtersToURLParams(filters: MissionFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.difficulty !== 'all') params.set('difficulty', filters.difficulty);
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.status !== 'all') params.set('status', filters.status);
  
  return params;
}

/**
 * Parse URL parameters to filters
 */
export function urlParamsToFilters(searchParams: URLSearchParams): Partial<MissionFilters> {
  const filters: Partial<MissionFilters> = {};
  
  const search = searchParams.get('search');
  if (search) filters.search = search;
  
  const difficulty = searchParams.get('difficulty');
  if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
    filters.difficulty = difficulty as 'easy' | 'medium' | 'hard';
  }
  
  const type = searchParams.get('type');
  if (type && ['kills', 'headshots', 'gamemode', 'weapon', 'rounds', 'wins'].includes(type)) {
    filters.type = type as 'kills' | 'headshots' | 'gamemode' | 'weapon' | 'rounds' | 'wins';
  }
  
  const status = searchParams.get('status');
  if (status && ['available', 'active', 'completed'].includes(status)) {
    filters.status = status as 'available' | 'active' | 'completed';
  }
  
  return filters;
}

/**
 * Check if filters are active (not default)
 */
export function hasActiveFilters(filters: MissionFilters): boolean {
  return (
    filters.search !== '' ||
    filters.difficulty !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all'
  );
}

/**
 * Get filter options for dropdowns
 */
export const FILTER_OPTIONS = {
  difficulty: [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ],
  type: [
    { value: 'all', label: 'All Types' },
    { value: 'kills', label: 'Kills' },
    { value: 'headshots', label: 'Headshots' },
    { value: 'gamemode', label: 'Game Mode' },
    { value: 'weapon', label: 'Weapon' },
    { value: 'rounds', label: 'Rounds' },
    { value: 'wins', label: 'Wins' },
  ],
  status: [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ],
} as const;

// Add translation-aware filter options
export const getTranslatedFilterOptions = (t: (key: string) => string) => ({
  difficulty: [
    { value: 'all', label: t('common.labels.all') },
    { value: 'easy', label: t('missions.difficulty.easy') },
    { value: 'medium', label: t('missions.difficulty.medium') },
    { value: 'hard', label: t('missions.difficulty.hard') }
  ],
  type: [
    { value: 'all', label: t('common.labels.all') },
    { value: 'kills', label: t('missions.types.kills') },
    { value: 'headshots', label: t('missions.types.headshots') },
    { value: 'gamemode', label: t('missions.types.gamemode') },
    { value: 'weapon', label: t('missions.types.weapon') },
    { value: 'rounds', label: t('missions.types.rounds') },
    { value: 'wins', label: t('missions.types.wins') }
  ]
});

// Helper function to get translated mission status
export const getTranslatedMissionStatus = (status: string, t: (key: string) => string) => {
  const statusMap: Record<string, string> = {
    'available': t('missions.status.available'),
    'active': t('missions.status.active'),
    'completed': t('missions.status.completed'),
    'expired': t('missions.status.expired')
  };

  return statusMap[status] || status;
};

// Helper function to get translated difficulty
export const getTranslatedDifficulty = (difficulty: string, t: (key: string) => string) => {
  const difficultyMap: Record<string, string> = {
    'easy': t('missions.difficulty.easy'),
    'medium': t('missions.difficulty.medium'),
    'hard': t('missions.difficulty.hard')
  };

  return difficultyMap[difficulty] || difficulty;
};

// Helper function to get translated mission type
export const getTranslatedMissionType = (type: string, t: (key: string) => string) => {
  const typeMap: Record<string, string> = {
    'kills': t('missions.types.kills'),
    'headshots': t('missions.types.headshots'),
    'gamemode': t('missions.types.gamemode'),
    'weapon': t('missions.types.weapon'),
    'rounds': t('missions.types.rounds'),
    'wins': t('missions.types.wins')
  };

  return typeMap[type] || type;
};
