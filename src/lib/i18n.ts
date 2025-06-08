export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'es';

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
