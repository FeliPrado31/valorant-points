# Foundation Setup Task - i18n Implementation

## Overview
This is the **MANDATORY FIRST TASK** that must be completed before any parallel work can begin. This task establishes the foundational infrastructure for internationalization without modifying any existing component files.

## Duration: 4 hours

## Prerequisites
- Node.js and npm installed
- Next.js 15 with App Router
- TypeScript configuration
- Git repository access

## Git Workflow
**IMPORTANT**: This foundation task should be completed directly on the base branch:

1. **Ensure you're on the correct branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   ```

2. **Work on foundation setup** following the implementation steps below

3. **Commit foundation changes**:
   ```bash
   git add .
   git commit -m "feat: implement i18n foundation setup"
   git push origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   ```

**Note**: The foundation setup is committed directly to the base branch since all parallel tasks depend on it.

## Objectives
- Install and configure next-intl package
- Set up Next.js i18n configuration
- Create translation file structure with placeholders
- Configure TypeScript types for i18n
- Set up middleware for locale detection
- Establish import/export patterns for parallel development

## Tasks

### 1. Package Installation (15 minutes)
**Goal**: Install required dependencies

**Commands**:
```bash
npm install next-intl
npm install --save-dev @types/node
```

**Files Modified**:
- `package.json` (dependency addition only)
- `package-lock.json` (auto-generated)

### 2. Next.js Configuration (30 minutes)
**Goal**: Configure Next.js for internationalization

**File**: `next.config.js`
**Action**: Add i18n configuration without removing existing config

```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing configuration preserved
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    domains: ['media.valorant-api.com', 'titles.trackercdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // ... rest of existing config ...

  // NEW: i18n configuration
  // This will be handled by next-intl plugin
};

module.exports = withNextIntl(nextConfig);
```

### 3. i18n Configuration File (45 minutes)
**Goal**: Create central i18n configuration

**File**: `src/lib/i18n.ts` (NEW FILE)
```typescript
export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸'
};

// Translation namespaces
export const namespaces = [
  'common',
  'navigation', 
  'dashboard',
  'profile',
  'setup',
  'subscription',
  'missions',
  'errors'
] as const;

export type Namespace = typeof namespaces[number];

// Utility functions for parallel development
export function getTranslationPath(locale: Locale, namespace: Namespace): string {
  return `src/locales/${locale}/${namespace}.json`;
}

export function validateLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
```

### 4. TypeScript Configuration (30 minutes)
**Goal**: Set up TypeScript types for i18n

**File**: `src/types/i18n.ts` (NEW FILE)
```typescript
// Base translation interface
export interface BaseTranslations {
  [key: string]: string | BaseTranslations;
}

// Namespace-specific interfaces (will be extended by parallel tasks)
export interface CommonTranslations extends BaseTranslations {}
export interface NavigationTranslations extends BaseTranslations {}
export interface DashboardTranslations extends BaseTranslations {}
export interface ProfileTranslations extends BaseTranslations {}
export interface SetupTranslations extends BaseTranslations {}
export interface SubscriptionTranslations extends BaseTranslations {}
export interface MissionsTranslations extends BaseTranslations {}
export interface ErrorsTranslations extends BaseTranslations {}

// Global translation interface
export interface Translations {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  dashboard: DashboardTranslations;
  profile: ProfileTranslations;
  setup: SetupTranslations;
  subscription: SubscriptionTranslations;
  missions: MissionsTranslations;
  errors: ErrorsTranslations;
}

// Utility types for parallel development
export type TranslationKey<T extends keyof Translations> = keyof Translations[T];
export type TranslationValue<T extends keyof Translations, K extends TranslationKey<T>> = 
  Translations[T][K];
```

### 5. Middleware Setup (45 minutes)
**Goal**: Create middleware for locale detection and routing

**File**: `src/middleware.ts` (MODIFY EXISTING)
```typescript
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // Handle locale routing
  const response = intlMiddleware(request);
  
  // Add any existing middleware logic here if needed
  // This preserves any existing middleware functionality
  
  return response;
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - Static files (images, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### 6. Translation File Structure (45 minutes)
**Goal**: Create organized directory structure with placeholder files

**Directory Structure**:
```
src/locales/
├── en/
│   ├── common.json
│   ├── navigation.json
│   ├── dashboard.json
│   ├── profile.json
│   ├── setup.json
│   ├── subscription.json
│   ├── missions.json
│   └── errors.json
└── es/
    ├── common.json
    ├── navigation.json
    ├── dashboard.json
    ├── profile.json
    ├── setup.json
    ├── subscription.json
    ├── missions.json
    └── errors.json
```

**Placeholder Content for Each File**:

**English Files** (`src/locales/en/*.json`):
```json
{
  "_namespace": "common",
  "_status": "placeholder",
  "_note": "This file will be populated by parallel tasks"
}
```

**Spanish Files** (`src/locales/es/*.json`):
```json
{
  "_namespace": "common",
  "_status": "placeholder", 
  "_note": "Este archivo será completado por tareas paralelas"
}
```

### 7. Translation Utilities (30 minutes)
**Goal**: Create utility functions for parallel development

**File**: `src/lib/translation-utils.ts` (NEW FILE)
```typescript
import { Locale, Namespace } from '@/lib/i18n';

// Utility for variable interpolation
export function interpolateTranslation(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : match;
  });
}

// Utility for pluralization (English/Spanish rules)
export function getPluralForm(
  count: number,
  translations: {
    zero?: string;
    one: string;
    other: string;
  },
  locale: Locale = 'en'
): string {
  if (count === 0 && translations.zero) {
    return translations.zero;
  }
  
  // Both English and Spanish use same basic plural rules for our use case
  return count === 1 ? translations.one : translations.other;
}

// Utility for date formatting
export function formatLocalizedDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}

// Utility for number formatting
export function formatLocalizedNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
```

### 8. Hook Foundations (30 minutes)
**Goal**: Create base hooks for parallel development

**File**: `src/hooks/useI18n.ts` (NEW FILE)
```typescript
import { useTranslations, useLocale } from 'next-intl';
import { Locale, Namespace } from '@/lib/i18n';

// Base hook for any namespace
export function useNamespaceTranslations(namespace: Namespace) {
  return useTranslations(namespace);
}

// Locale hook
export function useCurrentLocale(): Locale {
  return useLocale() as Locale;
}

// Utility hook for common translation patterns
export function useTranslationHelpers() {
  const locale = useCurrentLocale();
  
  return {
    locale,
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => 
      new Intl.DateTimeFormat(locale, options).format(date),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
  };
}

// Placeholder hooks for parallel development
// These will be implemented by parallel tasks
export function useCommonTranslations() {
  return useNamespaceTranslations('common');
}

export function useNavigationTranslations() {
  return useNamespaceTranslations('navigation');
}

export function useDashboardTranslations() {
  return useNamespaceTranslations('dashboard');
}

export function useProfileTranslations() {
  return useNamespaceTranslations('profile');
}

export function useSetupTranslations() {
  return useNamespaceTranslations('setup');
}

export function useSubscriptionTranslations() {
  return useNamespaceTranslations('subscription');
}

export function useMissionsTranslations() {
  return useNamespaceTranslations('missions');
}

export function useErrorsTranslations() {
  return useNamespaceTranslations('errors');
}
```

### 9. Next.js App Router Configuration (45 minutes)
**Goal**: Set up the locale routing structure

**File**: `src/app/[locale]/layout.tsx` (NEW FILE)
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

## Validation Checklist
After completing this task, verify:

- [ ] `npm install` runs without errors
- [ ] `npm run build` completes successfully
- [ ] TypeScript compilation passes
- [ ] All placeholder translation files exist
- [ ] Middleware handles locale routing
- [ ] No existing functionality is broken
- [ ] All new files are properly typed

## Files Created/Modified Summary

### New Files Created:
- `src/lib/i18n.ts`
- `src/types/i18n.ts`
- `src/lib/translation-utils.ts`
- `src/hooks/useI18n.ts`
- `src/app/[locale]/layout.tsx`
- `src/locales/en/*.json` (8 files)
- `src/locales/es/*.json` (8 files)

### Files Modified:
- `next.config.js` (added i18n configuration)
- `src/middleware.ts` (added locale routing)
- `package.json` (dependencies)

### Files NOT Modified:
- Any existing component files
- Any existing page files
- Root layout.tsx
- Any UI components

## Next Steps
Once this foundation task is complete, parallel tasks can begin working on:
1. Translation content extraction and creation
2. Component updates (different components per task)
3. Language switcher implementation
4. Testing setup
5. Advanced features

This foundation ensures all parallel tasks have the necessary infrastructure without conflicts.
