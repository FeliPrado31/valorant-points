# Task 3: Navigation Component Internationalization

## Overview
This task focuses on updating the Navigation component (`src/components/Navigation.tsx`) to use the translation system and implementing the Language Switcher component. This task works independently on navigation-related components only.

## Duration: 2.5 hours
## Dependencies: Foundation Setup Task + Task 1 (Translation Content)
## Conflicts: None (only modifies navigation component and creates language switcher)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-3-navigation-component
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/components/Navigation.tsx src/components/LanguageSwitcher.tsx
   git commit -m "feat: internationalize navigation and add language switcher"
   git push origin task-3-navigation-component
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 3: Navigation Component Internationalization`
   - **Description**: Include validation checklist from this task

## Objectives
- Replace all hardcoded text in Navigation component with translation calls
- Create a Language Switcher component
- Integrate language switcher into navigation
- Maintain responsive design and existing functionality
- Add proper locale-aware routing

## Files Modified/Created (No Conflicts)
**Specific Files**:
- `src/components/Navigation.tsx` (update existing)
- `src/components/LanguageSwitcher.tsx` (create new)

## Implementation Strategy

### 1. Language Switcher Component (1.5 hours)
**Goal**: Create a standalone language switcher component

**File**: `src/components/LanguageSwitcher.tsx` (NEW FILE)
```typescript
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'button';
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'dropdown', 
  className = '' 
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isChanging, setIsChanging] = useState(false);

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === currentLocale || isChanging) return;
    
    setIsChanging(true);
    
    try {
      // Remove current locale from pathname
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
      
      // Navigate to new locale
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      router.push(newPath);
      
      // Store preference
      document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('preferred-locale', newLocale);
    } catch (error) {
      console.error('Error changing locale:', error);
    } finally {
      // Reset changing state after a delay
      setTimeout(() => setIsChanging(false), 1000);
    }
  };

  if (variant === 'button') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {locales.map((locale) => (
          <Button
            key={locale}
            variant={locale === currentLocale ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLocaleChange(locale)}
            disabled={isChanging}
            className={`
              px-2 py-1 text-xs font-medium
              ${locale === currentLocale 
                ? 'bg-red-600 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="mr-1">{localeFlags[locale]}</span>
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Select 
      value={currentLocale} 
      onValueChange={handleLocaleChange}
      disabled={isChanging}
    >
      <SelectTrigger 
        className={`
          w-auto min-w-[100px] border-white/20 bg-white/5 text-white 
          hover:bg-white/10 focus:border-red-500 focus:ring-red-500/20
          ${className}
        `}
        aria-label="Select language"
      >
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
          <span className="sm:hidden">{localeFlags[currentLocale]}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {locales.map((locale) => (
          <SelectItem 
            key={locale} 
            value={locale}
            className="text-white hover:bg-slate-700 focus:bg-slate-700"
          >
            <div className="flex items-center space-x-2">
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 2. Navigation Component Update (1 hour)
**Goal**: Update Navigation component to use translations and include language switcher

**File**: `src/components/Navigation.tsx`

**Complete Updated Implementation**:
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Target, Menu, X, User, CreditCard, LayoutDashboard, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationTranslations } from '@/hooks/useI18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavigationProps {
  user?: {
    firstName?: string | null;
    username?: string | null;
  } | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function Navigation({ user, onRefresh, refreshing }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useNavigationTranslations();

  // Create navigation items with translations
  const navigationItems = [
    {
      href: '/dashboard',
      label: t('items.dashboard.label'),
      icon: LayoutDashboard,
      description: t('items.dashboard.description')
    },
    {
      href: '/profile',
      label: t('items.profile.label'),
      icon: User,
      description: t('items.profile.description')
    },
    {
      href: '/subscription',
      label: t('items.subscription.label'),
      icon: CreditCard,
      description: t('items.subscription.description')
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Helper function to create locale-aware links
  const createLocalizedHref = (href: string) => {
    return `/${locale}${href}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={createLocalizedHref('/')}
            className="flex items-center space-x-2 group"
            onClick={closeMobileMenu}
          >
            <Target className="h-8 w-8 text-red-500 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-white sm:text-2xl">
              <span className="hidden sm:inline">{t('brand.name')}</span>
              <span className="sm:hidden">{t('brand.shortName')}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === createLocalizedHref(item.href);

              return (
                <Link key={item.href} href={createLocalizedHref(item.href)}>
                  <Button
                    variant="navigation"
                    size="default"
                    className={cn(
                      "relative",
                      isActive && "bg-white/15 border-white/50 text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={refreshing}
                variant="navigation"
                size="default"
                className="ml-2"
                aria-label={t('actions.refreshProgress')}
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                <span className="hidden lg:inline">{t('actions.refresh')}</span>
              </Button>
            )}

            {/* Language Switcher - Desktop */}
            <div className="ml-4">
              <LanguageSwitcher variant="dropdown" />
            </div>
          </div>

          {/* User Info & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {/* User Welcome (Desktop) */}
            {user && (
              <div className="hidden md:block text-sm text-white/90">
                {t('welcome', { name: user.firstName || user.username })}
              </div>
            )}

            {/* Language Switcher - Mobile (Button Style) */}
            <div className="md:hidden">
              <LanguageSwitcher variant="button" />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="navigation"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? t('mobileMenu.close') : t('mobileMenu.open')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Welcome (Mobile) */}
              {user && (
                <div className="px-3 py-2 text-sm text-white/90 border-b border-white/10 mb-2">
                  {t('welcome', { name: user.firstName || user.username })}
                </div>
              )}

              {/* Navigation Items */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === createLocalizedHref(item.href);

                return (
                  <Link
                    key={item.href}
                    href={createLocalizedHref(item.href)}
                    onClick={closeMobileMenu}
                    className="block"
                  >
                    <Button
                      variant="ghost-light"
                      size="lg"
                      className={cn(
                        "w-full justify-start text-left",
                        isActive && "bg-white/15 text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-white/70">{item.description}</span>
                      </div>
                    </Button>
                  </Link>
                );
              })}

              {/* Refresh Button (Mobile) */}
              {onRefresh && (
                <Button
                  onClick={() => {
                    onRefresh();
                    closeMobileMenu();
                  }}
                  disabled={refreshing}
                  variant="ghost-light"
                  size="lg"
                  className="w-full justify-start text-left mt-2"
                >
                  <RefreshCw className={cn("h-5 w-5 mr-3", refreshing && "animate-spin")} />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{t('actions.refreshProgress')}</span>
                    <span className="text-xs text-white/70">{t('actions.updateMissionProgress')}</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
```

## Key Changes Made

### Translation Integration
- ✅ Replaced all hardcoded strings with translation calls
- ✅ Used `useNavigationTranslations` hook for proper namespace
- ✅ Implemented locale-aware routing for all links
- ✅ Added proper ARIA labels with translations

### Language Switcher
- ✅ Created standalone LanguageSwitcher component
- ✅ Supports both dropdown and button variants
- ✅ Handles locale persistence in cookies and localStorage
- ✅ Responsive design for mobile and desktop

### Responsive Design
- ✅ Preserved all responsive classes and breakpoints
- ✅ Different language switcher styles for mobile/desktop
- ✅ Maintained existing layout and spacing

### Functionality
- ✅ Preserved all existing navigation functionality
- ✅ Maintained mobile menu behavior
- ✅ Added locale-aware link generation
- ✅ Kept refresh functionality intact

## Validation Checklist
- [ ] Navigation renders correctly in both languages
- [ ] Language switcher works on both mobile and desktop
- [ ] All navigation links include proper locale prefix
- [ ] Mobile menu functions correctly
- [ ] Refresh button works as expected
- [ ] User welcome message displays correctly
- [ ] Language preference persists across sessions

## Testing Notes
- Test language switching from navigation
- Verify all links navigate to correct localized URLs
- Check mobile menu behavior with different languages
- Confirm responsive design with longer Spanish text
- Test language persistence after browser refresh

## Next Steps
This task completes the navigation internationalization and provides the language switcher functionality. The navigation component is now fully localized and provides seamless language switching capabilities.
