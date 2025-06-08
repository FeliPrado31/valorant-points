import { Locale } from '@/lib/i18n';

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
  }
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
