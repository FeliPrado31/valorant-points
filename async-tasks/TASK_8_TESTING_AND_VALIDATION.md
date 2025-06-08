# Task 8: Testing and Validation

## Overview
This task focuses on comprehensive testing and validation of the internationalization implementation. This task can be started once all other parallel tasks are completed and ensures the i18n system works correctly across all scenarios.

## Duration: 3 hours
## Dependencies: Foundation Setup Task + All Parallel Tasks (1-7) completed
## Conflicts: None (only creates test files and validates existing implementation)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-8-testing-and-validation
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/test/ scripts/ MANUAL_TESTING_CHECKLIST.md
   git commit -m "feat: add comprehensive i18n testing and validation"
   git push origin task-8-testing-and-validation
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 8: Testing and Validation`
   - **Description**: Include validation checklist and test results from this task

## Objectives
- Create comprehensive test suite for i18n functionality
- Validate translation completeness and accuracy
- Test language switching across all pages
- Verify responsive design with different languages
- Ensure accessibility standards are maintained
- Performance testing for i18n impact

## Files Created (No Conflicts)
**Test Files Only**:
- `src/test/i18n/translation-validation.test.ts` (new)
- `src/test/i18n/language-switching.test.ts` (new)
- `src/test/i18n/component-rendering.test.ts` (new)
- `scripts/validate-translations.js` (new)
- `scripts/test-i18n-performance.js` (new)

## Implementation Strategy

### 1. Translation Validation Script (45 minutes)
**Goal**: Create automated script to validate translation completeness

**File**: `scripts/validate-translations.js` (NEW FILE)

```javascript
const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const SUPPORTED_LOCALES = ['en', 'es'];
const NAMESPACES = ['common', 'navigation', 'dashboard', 'profile', 'setup', 'subscription', 'missions', 'errors'];

// Validation results
const results = {
  missingKeys: [],
  extraKeys: [],
  emptyValues: [],
  inconsistentVariables: [],
  totalKeys: 0,
  validationPassed: true
};

function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function getVariables(text) {
  const matches = text.match(/\{(\w+)\}/g);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
}

function validateTranslations() {
  console.log('🔍 Starting translation validation...\n');
  
  // Load all translation files
  const translations = {};
  
  for (const locale of SUPPORTED_LOCALES) {
    translations[locale] = {};
    
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          translations[locale][namespace] = JSON.parse(content);
        } catch (error) {
          console.error(`❌ Error parsing ${locale}/${namespace}.json:`, error.message);
          results.validationPassed = false;
        }
      } else {
        console.error(`❌ Missing file: ${locale}/${namespace}.json`);
        results.validationPassed = false;
      }
    }
  }
  
  // Validate each namespace
  for (const namespace of NAMESPACES) {
    console.log(`📁 Validating namespace: ${namespace}`);
    
    // Get all keys from English (reference)
    const enKeys = getAllKeys(translations.en[namespace] || {}, namespace);
    results.totalKeys += enKeys.length;
    
    // Check each locale against English
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === 'en') continue;
      
      const localeKeys = getAllKeys(translations[locale][namespace] || {}, namespace);
      
      // Find missing keys
      for (const key of enKeys) {
        if (!localeKeys.includes(key)) {
          results.missingKeys.push(`${locale}: ${key}`);
          results.validationPassed = false;
        }
      }
      
      // Find extra keys
      for (const key of localeKeys) {
        if (!enKeys.includes(key)) {
          results.extraKeys.push(`${locale}: ${key}`);
        }
      }
      
      // Check for empty values
      for (const key of localeKeys) {
        const keyPath = key.split('.');
        let value = translations[locale][namespace];
        
        for (let i = 1; i < keyPath.length; i++) {
          value = value[keyPath[i]];
        }
        
        if (typeof value === 'string' && value.trim() === '') {
          results.emptyValues.push(`${locale}: ${key}`);
          results.validationPassed = false;
        }
      }
      
      // Check variable consistency
      for (const key of enKeys) {
        if (localeKeys.includes(key)) {
          const enKeyPath = key.split('.');
          const localeKeyPath = key.split('.');
          
          let enValue = translations.en[namespace];
          let localeValue = translations[locale][namespace];
          
          for (let i = 1; i < enKeyPath.length; i++) {
            enValue = enValue[enKeyPath[i]];
            localeValue = localeValue[localeKeyPath[i]];
          }
          
          if (typeof enValue === 'string' && typeof localeValue === 'string') {
            const enVars = getVariables(enValue);
            const localeVars = getVariables(localeValue);
            
            if (JSON.stringify(enVars.sort()) !== JSON.stringify(localeVars.sort())) {
              results.inconsistentVariables.push(`${locale}: ${key} - EN: [${enVars.join(', ')}], ${locale.toUpperCase()}: [${localeVars.join(', ')}]`);
              results.validationPassed = false;
            }
          }
        }
      }
    }
    
    console.log(`✅ ${namespace} validation complete`);
  }
  
  // Print results
  console.log('\n📊 Validation Results:');
  console.log(`Total translation keys: ${results.totalKeys}`);
  
  if (results.missingKeys.length > 0) {
    console.log(`\n❌ Missing Keys (${results.missingKeys.length}):`);
    results.missingKeys.forEach(key => console.log(`  - ${key}`));
  }
  
  if (results.extraKeys.length > 0) {
    console.log(`\n⚠️  Extra Keys (${results.extraKeys.length}):`);
    results.extraKeys.forEach(key => console.log(`  - ${key}`));
  }
  
  if (results.emptyValues.length > 0) {
    console.log(`\n❌ Empty Values (${results.emptyValues.length}):`);
    results.emptyValues.forEach(key => console.log(`  - ${key}`));
  }
  
  if (results.inconsistentVariables.length > 0) {
    console.log(`\n❌ Inconsistent Variables (${results.inconsistentVariables.length}):`);
    results.inconsistentVariables.forEach(key => console.log(`  - ${key}`));
  }
  
  if (results.validationPassed) {
    console.log('\n✅ All translations are valid and complete!');
  } else {
    console.log('\n❌ Translation validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run validation
validateTranslations();
```

### 2. Component Rendering Tests (1 hour)
**Goal**: Test that all components render correctly in both languages

**File**: `src/test/i18n/component-rendering.test.ts` (NEW FILE)

```typescript
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Navigation from '@/components/Navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MissionFiltersComponent from '@/components/MissionFilters';

// Mock translations
const mockMessages = {
  en: {
    navigation: {
      brand: { name: 'Valorant Missions', shortName: 'VM' },
      items: {
        dashboard: { label: 'Dashboard', description: 'View your missions' },
        profile: { label: 'Profile', description: 'Manage your account' }
      },
      welcome: 'Welcome, {name}!'
    },
    missions: {
      filters: {
        searchPlaceholder: 'Search missions...',
        filterBy: 'Filter by',
        difficulty: 'Difficulty',
        type: 'Type',
        showingResults: 'Showing {count} of {total} missions'
      },
      difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
      types: { kills: 'kills', headshots: 'headshots' }
    },
    common: {
      labels: { all: 'All', search: 'Search' },
      buttons: { loading: 'Loading...' }
    }
  },
  es: {
    navigation: {
      brand: { name: 'Valorant Missions', shortName: 'VM' },
      items: {
        dashboard: { label: 'Panel', description: 'Ve tus misiones' },
        profile: { label: 'Perfil', description: 'Gestiona tu cuenta' }
      },
      welcome: '¡Bienvenido, {name}!'
    },
    missions: {
      filters: {
        searchPlaceholder: 'Buscar misiones...',
        filterBy: 'Filtrar por',
        difficulty: 'Dificultad',
        type: 'Tipo',
        showingResults: 'Mostrando {count} de {total} misiones'
      },
      difficulty: { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' },
      types: { kills: 'eliminaciones', headshots: 'disparos a la cabeza' }
    },
    common: {
      labels: { all: 'Todos', search: 'Buscar' },
      buttons: { loading: 'Cargando...' }
    }
  }
};

const renderWithIntl = (component: React.ReactElement, locale: 'en' | 'es' = 'en') => {
  return render(
    <NextIntlClientProvider messages={mockMessages[locale]} locale={locale}>
      {component}
    </NextIntlClientProvider>
  );
};

describe('Component Rendering with i18n', () => {
  describe('Navigation Component', () => {
    it('renders correctly in English', () => {
      renderWithIntl(<Navigation />);
      
      expect(screen.getByText('Valorant Missions')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders correctly in Spanish', () => {
      renderWithIntl(<Navigation />, 'es');
      
      expect(screen.getByText('Valorant Missions')).toBeInTheDocument();
      expect(screen.getByText('Panel')).toBeInTheDocument();
      expect(screen.getByText('Perfil')).toBeInTheDocument();
    });

    it('displays welcome message with user name', () => {
      const user = { firstName: 'John', username: 'john123' };
      renderWithIntl(<Navigation user={user} />);
      
      expect(screen.getByText(/Welcome, John/)).toBeInTheDocument();
    });

    it('displays Spanish welcome message with user name', () => {
      const user = { firstName: 'Juan', username: 'juan123' };
      renderWithIntl(<Navigation user={user} />, 'es');
      
      expect(screen.getByText(/¡Bienvenido, Juan/)).toBeInTheDocument();
    });
  });

  describe('Language Switcher Component', () => {
    it('renders language options', () => {
      renderWithIntl(<LanguageSwitcher />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows current locale', () => {
      renderWithIntl(<LanguageSwitcher />, 'es');
      
      expect(screen.getByDisplayValue('es')).toBeInTheDocument();
    });
  });

  describe('Mission Filters Component', () => {
    const mockFilters = {
      search: '',
      difficulty: 'all',
      type: 'all'
    };

    const mockProps = {
      filters: mockFilters,
      onFilterChange: jest.fn(),
      onClearFilters: jest.fn(),
      resultCount: 10,
      totalCount: 20,
      subscriptionTier: 'premium' as const
    };

    it('renders search placeholder in English', () => {
      renderWithIntl(<MissionFiltersComponent {...mockProps} />);
      
      expect(screen.getByPlaceholderText('Search missions...')).toBeInTheDocument();
    });

    it('renders search placeholder in Spanish', () => {
      renderWithIntl(<MissionFiltersComponent {...mockProps} />, 'es');
      
      expect(screen.getByPlaceholderText('Buscar misiones...')).toBeInTheDocument();
    });

    it('displays results count in English', () => {
      renderWithIntl(<MissionFiltersComponent {...mockProps} />);
      
      expect(screen.getByText(/Showing 10 of 20 missions/)).toBeInTheDocument();
    });

    it('displays results count in Spanish', () => {
      renderWithIntl(<MissionFiltersComponent {...mockProps} />, 'es');
      
      expect(screen.getByText(/Mostrando 10 de 20 misiones/)).toBeInTheDocument();
    });
  });
});
```

### 3. Language Switching Tests (45 minutes)
**Goal**: Test language switching functionality

**File**: `src/test/i18n/language-switching.test.ts` (NEW FILE)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Language Switching', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    
    mockUsePathname.mockReturnValue('/en/dashboard');
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to Spanish when Spanish is selected', async () => {
    const { useLocale } = require('next-intl');
    useLocale.mockReturnValue('en');
    
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/es/dashboard');
    });
  });

  it('navigates to English when English is selected', async () => {
    const { useLocale } = require('next-intl');
    useLocale.mockReturnValue('es');
    mockUsePathname.mockReturnValue('/es/profile');
    
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en/profile');
    });
  });

  it('stores language preference in localStorage', async () => {
    const { useLocale } = require('next-intl');
    useLocale.mockReturnValue('en');
    
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith('preferred-locale', 'es');
    });
  });

  it('sets cookie for language preference', async () => {
    const { useLocale } = require('next-intl');
    useLocale.mockReturnValue('en');
    
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    await waitFor(() => {
      expect(document.cookie).toContain('preferred-locale=es');
    });
  });

  it('handles button variant correctly', () => {
    const { useLocale } = require('next-intl');
    useLocale.mockReturnValue('en');
    
    render(<LanguageSwitcher variant="button" />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('disables switching when already changing', async () => {
    const { useLocale } = require('next-intl');
    useLocale.mockReturnValue('en');
    
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    
    // First click
    fireEvent.click(select);
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    // Second click should be ignored
    fireEvent.click(select);
    const spanishOption2 = screen.getByText('Español');
    fireEvent.click(spanishOption2);
    
    // Should only be called once
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
```

### 4. Performance Testing Script (30 minutes)
**Goal**: Test performance impact of i18n implementation

**File**: `scripts/test-i18n-performance.js` (NEW FILE)

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting i18n performance testing...\n');

// Build the application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Analyze bundle sizes
console.log('📊 Analyzing bundle sizes...');

const buildDir = '.next/static/chunks';
const files = fs.readdirSync(buildDir);

let totalSize = 0;
let i18nSize = 0;
let pagesSizes = {};

files.forEach(file => {
  const filePath = path.join(buildDir, file);
  const stats = fs.statSync(filePath);
  const size = stats.size;
  
  totalSize += size;
  
  // Identify i18n related chunks
  if (file.includes('intl') || file.includes('locale') || file.includes('translation')) {
    i18nSize += size;
  }
  
  // Identify page chunks
  if (file.includes('pages/') || file.includes('app/')) {
    pagesSizes[file] = size;
  }
});

console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`i18n bundle size: ${(i18nSize / 1024).toFixed(2)} KB`);
console.log(`i18n impact: ${((i18nSize / totalSize) * 100).toFixed(2)}%\n`);

// Check if i18n impact is acceptable (should be < 10%)
const i18nImpact = (i18nSize / totalSize) * 100;
if (i18nImpact > 10) {
  console.log('⚠️  Warning: i18n bundle size impact is higher than 10%');
} else {
  console.log('✅ i18n bundle size impact is acceptable');
}

// Analyze translation file sizes
console.log('\n📄 Translation file sizes:');
const localesDir = path.join(__dirname, '../src/locales');
const locales = ['en', 'es'];

locales.forEach(locale => {
  const localeDir = path.join(localesDir, locale);
  const files = fs.readdirSync(localeDir);
  let localeSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(localeDir, file);
    const stats = fs.statSync(filePath);
    localeSize += stats.size;
  });
  
  console.log(`${locale.toUpperCase()}: ${(localeSize / 1024).toFixed(2)} KB`);
});

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
console.log('- Translation files are loaded on-demand per locale');
console.log('- Consider lazy loading for large translation namespaces');
console.log('- Use tree-shaking to eliminate unused translations');
console.log('- Implement caching for translation files');

console.log('\n✅ Performance analysis completed!');
```

### 5. Manual Testing Checklist (30 minutes)
**Goal**: Create comprehensive manual testing checklist

**File**: `MANUAL_TESTING_CHECKLIST.md` (NEW FILE)

```markdown
# Manual Testing Checklist for i18n Implementation

## Pre-Testing Setup
- [ ] Application builds without errors
- [ ] All translation files are valid JSON
- [ ] No TypeScript compilation errors
- [ ] Development server starts successfully

## Language Switching
- [ ] Language switcher appears in navigation
- [ ] Can switch from English to Spanish
- [ ] Can switch from Spanish to English
- [ ] Language preference persists after page refresh
- [ ] Language preference persists after browser restart
- [ ] URL updates correctly with locale prefix (/en/, /es/)

## Page-by-Page Testing

### Landing Page (/)
- [ ] Hero section displays correctly in both languages
- [ ] Feature cards show translated content
- [ ] How it works section is properly translated
- [ ] Call-to-action buttons use correct language
- [ ] Navigation items are translated

### Dashboard (/dashboard)
- [ ] Welcome message shows in correct language
- [ ] Statistics cards display translated labels
- [ ] Mission cards show translated content
- [ ] Mission types and difficulties are translated
- [ ] Progress indicators use correct language
- [ ] Date formatting respects locale

### Profile (/profile)
- [ ] Form labels are translated
- [ ] Validation messages appear in correct language
- [ ] Success/error messages are translated
- [ ] Placeholder text is localized

### Setup (/setup)
- [ ] Instructions are clearly translated
- [ ] Form validation works in both languages
- [ ] Success messages appear correctly
- [ ] Error handling uses correct language

### Subscription (/subscription)
- [ ] Plan names and descriptions are translated
- [ ] Pricing displays correctly for locale
- [ ] Feature lists are properly translated
- [ ] Billing information is localized

## Component Testing

### Navigation
- [ ] Brand name displays correctly
- [ ] Menu items are translated
- [ ] User welcome message uses correct language
- [ ] Mobile menu works in both languages

### Mission Filters
- [ ] Search placeholder is translated
- [ ] Filter options show in correct language
- [ ] Results count displays properly
- [ ] Clear filters button is translated

### Subscription Status
- [ ] Current plan displays correctly
- [ ] Usage statistics are translated
- [ ] Upgrade prompts use correct language

## Responsive Design
- [ ] Mobile layout works with longer Spanish text
- [ ] Tablet layout accommodates translated content
- [ ] Desktop layout remains intact
- [ ] Text doesn't overflow containers
- [ ] Buttons remain properly sized

## Accessibility
- [ ] Screen readers announce content in correct language
- [ ] Language switcher is keyboard accessible
- [ ] Focus indicators work properly
- [ ] ARIA labels are translated where applicable

## Performance
- [ ] Initial page load time is acceptable
- [ ] Language switching is smooth (< 1 second)
- [ ] No visible layout shifts during language change
- [ ] Translation loading doesn't block UI

## Error Scenarios
- [ ] Invalid locale in URL redirects properly
- [ ] Missing translations fall back gracefully
- [ ] Network errors show translated messages
- [ ] Form validation errors are localized

## Browser Compatibility
- [ ] Chrome: All functionality works
- [ ] Firefox: All functionality works
- [ ] Safari: All functionality works
- [ ] Edge: All functionality works

## Final Validation
- [ ] No hardcoded English text visible in Spanish mode
- [ ] No hardcoded Spanish text visible in English mode
- [ ] All user-facing text is properly translated
- [ ] Date and number formatting respects locale
- [ ] Currency formatting is appropriate
- [ ] No console errors related to i18n
```

## Validation Checklist
- [ ] Translation validation script runs without errors
- [ ] All component rendering tests pass
- [ ] Language switching tests pass
- [ ] Performance impact is within acceptable limits
- [ ] Manual testing checklist completed
- [ ] No accessibility regressions
- [ ] All browsers tested successfully

## Success Criteria
- ✅ 100% translation coverage for both languages
- ✅ All automated tests passing
- ✅ Performance impact < 10% of total bundle size
- ✅ Language switching works smoothly
- ✅ No accessibility violations
- ✅ Responsive design maintained

## Next Steps
After completing this testing task:
1. Fix any issues found during testing
2. Update documentation with testing results
3. Prepare for production deployment
4. Create user guide for language switching

This task ensures the i18n implementation is production-ready and meets all quality standards.
