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
