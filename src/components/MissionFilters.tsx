'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { MissionFilters } from '@/lib/utils';
import { FILTER_OPTIONS, hasActiveFilters } from '@/lib/mission-utils';
import {
  useMissionsTranslations,
  useCommonTranslations
} from '@/hooks/useI18n';

interface MissionFiltersProps {
  filters: MissionFilters;
  onFilterChange: (key: keyof MissionFilters, value: string) => void;
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
  const t = useMissionsTranslations();
  const common = useCommonTranslations();
  const hasFilters = hasActiveFilters(filters);

  // Get translated filter options
  const getTranslatedDifficultyOptions = () => {
    return FILTER_OPTIONS.difficulty.map(option => ({
      value: option.value,
      label: option.value === 'all' ? common('labels.all') : t(`difficulty.${option.value}`)
    }));
  };

  const getTranslatedTypeOptions = () => {
    return FILTER_OPTIONS.type.map(option => ({
      value: option.value,
      label: option.value === 'all' ? common('labels.all') : t(`types.${option.value}`)
    }));
  };



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
                placeholder={t('filters.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-red-500"
              />
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Dropdowns - Only show for Premium tier or when not limited */}
          {(showSearchAndFilters || !isLimitedSelection) && (
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300 whitespace-nowrap">
                  {t('filters.filterBy')}:
                </span>
              </div>

              {/* Difficulty Filter */}
              <Select
                value={filters.difficulty}
                onValueChange={(value) => onFilterChange('difficulty', value)}
              >
                <SelectTrigger className="w-full sm:w-[140px] bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder={t('filters.difficulty')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {getTranslatedDifficultyOptions().map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange('type', value)}
              >
                <SelectTrigger className="w-full sm:w-[140px] bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder={t('filters.type')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {getTranslatedTypeOptions().map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Results Count and Clear Filters */}
          <div className="flex items-center space-x-3">
            {/* Results Count */}
            <div className="text-sm text-gray-300">
              {resultCount === totalCount ? (
                <span>
                  {t('filters.showingResults', { count: totalCount, total: totalCount })}
                </span>
              ) : (
                <span>
                  {t('filters.showingResults', { count: resultCount, total: totalCount })}
                </span>
              )}
            </div>

            {/* Clear Filters Button */}
            {hasFilters && (
              <Button
                onClick={onClearFilters}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-1" />
                {t('filters.clearFilters')}
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="bg-slate-700 text-white">
                {common('labels.search')}: &quot;{filters.search}&quot;
                <button
                  onClick={() => onFilterChange('search', '')}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.difficulty !== 'all' && (
              <Badge variant="secondary" className="bg-slate-700 text-white">
                {t('filters.difficulty')}: {t(`difficulty.${filters.difficulty}`)}
                <button
                  onClick={() => onFilterChange('difficulty', 'all')}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.type !== 'all' && (
              <Badge variant="secondary" className="bg-slate-700 text-white">
                {t('filters.type')}: {t(`types.${filters.type}`)}
                <button
                  onClick={() => onFilterChange('type', 'all')}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.status !== 'all' && (
              <Badge variant="secondary" className="bg-slate-700 text-white">
                {t('filters.status')}: {t(`status.${filters.status}`)}
                <button
                  onClick={() => onFilterChange('status', 'all')}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* No Results Message */}
        {resultCount === 0 && hasFilters && (
          <div className="mt-4 text-center py-8">
            <div className="text-gray-400 mb-2">{t('filters.noResults')}</div>
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-slate-700"
            >
              {t('filters.clearFilters')}
            </Button>
          </div>
        )}

        {/* Subscription Tier Notice for Limited Selections */}
        {isLimitedSelection && subscriptionTier !== 'premium' && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="text-blue-300 text-sm">
              <strong>{common('labels.note')}:</strong> {
                subscriptionTier === 'free'
                  ? t('filters.upgradeForFilters.free')
                  : t('filters.upgradeForFilters.standard')
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
