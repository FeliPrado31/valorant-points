import { useTranslations, useLocale } from 'next-intl';
import { Locale } from '@/lib/i18n';



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
  return useTranslations();
}

export function useNavigationTranslations() {
  return useTranslations();
}

export function useDashboardTranslations() {
  return useTranslations();
}

export function useProfileTranslations() {
  return useTranslations();
}

export function useSetupTranslations() {
  return useTranslations();
}

export function useSubscriptionTranslations() {
  return useTranslations();
}

export function useMissionsTranslations() {
  return useTranslations();
}

export function useErrorsTranslations() {
  return useTranslations();
}
