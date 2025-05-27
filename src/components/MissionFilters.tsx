'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { MissionFilters } from '@/lib/utils';
import { FILTER_OPTIONS, hasActiveFilters } from '@/lib/mission-utils';

interface MissionFiltersProps {
  filters: MissionFilters;
  onFilterChange: <K extends keyof MissionFilters>(key: K, value: MissionFilters[K]) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
  subscriptionTier?: 'free' | 'standard' | 'premium';
  isLimitedSelection?: boolean;
}

export default function MissionFiltersComponent({
  filters,
  onFilterChange,
  onClearFilters,
  resultCount,
  totalCount,
  subscriptionTier = 'free',
  isLimitedSelection = false,
}: MissionFiltersProps) {
  const hasFilters = hasActiveFilters(filters);

  // Show search and filters only for Premium tier (10 missions) when it's a limited selection
  const showSearchAndFilters = subscriptionTier === 'premium' && isLimitedSelection;

  // Don't render the component at all for limited selections with small counts (Free/Standard)
  if (isLimitedSelection && (subscriptionTier === 'free' || subscriptionTier === 'standard')) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 mb-6">
      <CardContent className="p-4 sm:p-6">
        {/* Search Input - Only show for Premium tier */}
        {showSearchAndFilters && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search missions..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
              />
            </div>
          </div>
        )}

        {/* Filter Controls - Only show for Premium tier */}
        {showSearchAndFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Difficulty</label>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => onFilterChange('difficulty', value as MissionFilters['difficulty'])}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {FILTER_OPTIONS.difficulty.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange('type', value as MissionFilters['type'])}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {FILTER_OPTIONS.type.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange('status', value as MissionFilters['status'])}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {FILTER_OPTIONS.status.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 opacity-0">Clear</label>
              <Button
                onClick={onClearFilters}
                disabled={!hasFilters}
                variant="outline"
                className="w-full bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Count and Active Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Only show count for non-limited selections or when filters are applied */}
          {(!isLimitedSelection || hasFilters) && (
            <div className="text-sm text-gray-300">
              {isLimitedSelection ? (
                // For limited selections, just show the count without "of X total"
                <span>
                  <span className="font-semibold text-white">{resultCount}</span> daily missions
                </span>
              ) : (
                // For unlimited selections, show the full count
                <span>
                  Showing <span className="font-semibold text-white">{resultCount}</span> of{' '}
                  <span className="font-semibold text-white">{totalCount}</span> missions
                </span>
              )}
            </div>
          )}

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="bg-red-600/20 text-red-300 border-red-600/30">
                  <Search className="h-3 w-3 mr-1" />
                  &quot;{filters.search}&quot;
                </Badge>
              )}
              {filters.difficulty !== 'all' && (
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                  <Filter className="h-3 w-3 mr-1" />
                  {filters.difficulty}
                </Badge>
              )}
              {filters.type !== 'all' && (
                <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-600/30">
                  <Filter className="h-3 w-3 mr-1" />
                  {filters.type}
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                  <Filter className="h-3 w-3 mr-1" />
                  {filters.status}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
