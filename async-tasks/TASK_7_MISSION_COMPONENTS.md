# Task 7: Mission Components Internationalization

## Overview
This task focuses on updating mission-related components to use the translation system. This includes the mission filters component and any other mission-specific UI elements.

## Duration: 1.5 hours
## Dependencies: Foundation Setup Task + Task 1 (Translation Content)
## Conflicts: None (only modifies mission-related component files)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-7-mission-components
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/components/MissionFilters.tsx src/locales/
   git commit -m "feat: internationalize mission components"
   git push origin task-7-mission-components
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 7: Mission Components Internationalization`
   - **Description**: Include validation checklist from this task

## Objectives
- Replace all hardcoded text in mission components with translation calls
- Implement proper mission type and difficulty translations
- Add translated filter options and search functionality
- Maintain existing functionality and responsive design
- Handle mission status and progress with translations

## Files Modified (No Conflicts)
**Specific Files**:
- `src/components/MissionFilters.tsx` (update existing)

## Implementation Strategy

### 1. Mission Filters Component Update (1.5 hours)
**Goal**: Update the mission filters component to use translations

**File**: `src/components/MissionFilters.tsx`

```typescript
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

  // Show search and filters only for Premium tier (10 missions) when it's a limited selection
  const showSearchAndFilters = subscriptionTier === 'premium' && isLimitedSelection;

  // Don't render the component at all for limited selections with small counts (Free/Standard)
  if (isLimitedSelection && (subscriptionTier === 'free' || subscriptionTier === 'standard')) {
    return null;
  }

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
                {common('labels.search')}: "{filters.search}"
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
```

### 2. Additional Mission Translation Content
**Goal**: Add missing translation keys for mission filters

**Add to**: `src/locales/en/missions.json` (extend existing)
```json
{
  "filters": {
    "upgradeForFilters": {
      "free": "Upgrade to Standard or Premium to access mission filters and search.",
      "standard": "Upgrade to Premium to access advanced mission filters and search."
    }
  }
}
```

**Add to**: `src/locales/es/missions.json` (extend existing)
```json
{
  "filters": {
    "upgradeForFilters": {
      "free": "Mejora a Estándar o Premium para acceder a filtros de misiones y búsqueda.",
      "standard": "Mejora a Premium para acceder a filtros avanzados de misiones y búsqueda."
    }
  }
}
```

**Add to**: `src/locales/en/common.json` (extend existing)
```json
{
  "labels": {
    "all": "All",
    "note": "Note",
    "features": "Features"
  }
}
```

**Add to**: `src/locales/es/common.json` (extend existing)
```json
{
  "labels": {
    "all": "Todos",
    "note": "Nota",
    "features": "Características"
  }
}
```

### 3. Mission Utility Functions Update
**Goal**: Update mission utility functions to work with translations

**File**: `src/lib/mission-utils.ts` (if it needs translation support)

```typescript
// Add translation-aware filter options
export const getTranslatedFilterOptions = (t: any) => ({
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
export const getTranslatedMissionStatus = (status: string, t: any) => {
  const statusMap: Record<string, string> = {
    'available': t('missions.status.available'),
    'active': t('missions.status.active'),
    'completed': t('missions.status.completed'),
    'expired': t('missions.status.expired')
  };
  
  return statusMap[status] || status;
};

// Helper function to get translated difficulty
export const getTranslatedDifficulty = (difficulty: string, t: any) => {
  const difficultyMap: Record<string, string> = {
    'easy': t('missions.difficulty.easy'),
    'medium': t('missions.difficulty.medium'),
    'hard': t('missions.difficulty.hard')
  };
  
  return difficultyMap[difficulty] || difficulty;
};

// Helper function to get translated mission type
export const getTranslatedMissionType = (type: string, t: any) => {
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
```

## Key Changes Made

### Translation Integration
- ✅ Replaced all hardcoded strings with translation calls
- ✅ Used proper namespace hooks for mission content
- ✅ Implemented translated filter options and search
- ✅ Added locale-aware mission type and difficulty display

### Filter Functionality
- ✅ Translated all filter labels and options
- ✅ Localized search placeholder text
- ✅ Translated results count and status messages
- ✅ Added translated upgrade notices for subscription tiers

### User Experience
- ✅ Maintained all existing filter functionality
- ✅ Preserved responsive design
- ✅ Added proper active filter display with translations
- ✅ Translated no results messages

### Utility Functions
- ✅ Created helper functions for translating mission-related content
- ✅ Added support for dynamic translation of mission properties
- ✅ Maintained backward compatibility with existing code

## Validation Checklist
- [ ] Mission filters render correctly in both languages
- [ ] All filter options are properly translated
- [ ] Search functionality works with translated placeholder
- [ ] Results count displays correctly in both languages
- [ ] Active filters show translated labels
- [ ] No results message appears in correct language
- [ ] Subscription upgrade notices are properly translated
- [ ] Responsive design works with longer Spanish text

## Testing Notes
- Test all filter combinations in both languages
- Verify search functionality works correctly
- Check that filter clearing works properly
- Confirm results count updates correctly
- Test responsive behavior with translated content
- Verify subscription tier notices display correctly

## Next Steps
This task completes the mission components internationalization. All mission-related filtering and display functionality now fully supports both English and Spanish languages with proper localization of mission types, difficulties, and status messages.
