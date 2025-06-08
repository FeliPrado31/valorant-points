import { useTranslations, useLocale } from 'next-intl';
import { Locale, Namespace } from '@/lib/i18n';
import { useEffect, useState } from 'react';

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

// Hook to dynamically load namespace translations
function useDynamicTranslations(namespace: string) {
  const locale = useCurrentLocale();
  const [messages, setMessages] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const translationModule = await import(`../locales/${locale}/${namespace}.json`);
        setMessages(translationModule.default);
      } catch (error) {
        console.error(`Failed to load ${namespace} translations for ${locale}:`, error);
        setMessages({});
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [locale, namespace]);

  return (key: string, params?: Record<string, string | number>) => {
    if (loading) return key;

    const keys = key.split('.');
    let value: unknown = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return String(params[paramKey]) || match;
      });
    }

    return typeof value === 'string' ? value : key;
  };
}

// Placeholder hooks for parallel development
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
  return useDynamicTranslations('profile');
}

export function useSetupTranslations() {
  return useDynamicTranslations('setup');
}

export function useSubscriptionTranslations() {
  return useNamespaceTranslations('subscription');
}

export function useMissionsTranslations() {
  return useNamespaceTranslations('missions');
}

export function useErrorsTranslations() {
  return useDynamicTranslations('errors');
}
