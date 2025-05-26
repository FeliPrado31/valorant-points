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
