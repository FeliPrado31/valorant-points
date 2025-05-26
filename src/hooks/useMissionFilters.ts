'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MissionFilters, defaultFilters } from '@/lib/utils';
import { filtersToURLParams, urlParamsToFilters } from '@/lib/mission-utils';

/**
 * Custom hook for managing mission filters with URL persistence
 */
export function useMissionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<MissionFilters>(() => {
    try {
      const urlFilters = urlParamsToFilters(searchParams);
      return { ...defaultFilters, ...urlFilters };
    } catch {
      // Fallback to defaults if searchParams is not available during SSR
      return defaultFilters;
    }
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: MissionFilters) => {
    const params = filtersToURLParams(newFilters);
    const queryString = params.toString();

    // Use replace to avoid adding to browser history for every filter change
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newURL);
  }, [router, pathname]);

  // Update filters and URL
  const updateFilters = useCallback((newFilters: MissionFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof MissionFilters>(
    key: K,
    value: MissionFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    updateFilters(defaultFilters);
  }, [updateFilters]);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    try {
      const urlFilters = urlParamsToFilters(searchParams);
      const newFilters = { ...defaultFilters, ...urlFilters };

      // Only update state if URL filters are different from current filters
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters);
      }
    } catch {
      // Handle case where searchParams is not available
      console.log('SearchParams not available, using current filters');
    }
  }, [searchParams, filters]); // Include filters but check for changes to avoid infinite loop

  return {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
  };
}
