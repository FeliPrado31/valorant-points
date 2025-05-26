import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mission filtering types and utilities
export interface MissionFilters {
  search: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  type: 'all' | 'kills' | 'headshots' | 'gamemode' | 'weapon' | 'rounds' | 'wins';
  status: 'all' | 'available' | 'active' | 'completed';
}

export const defaultFilters: MissionFilters = {
  search: '',
  difficulty: 'all',
  type: 'all',
  status: 'all'
};

// Debounce utility hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
