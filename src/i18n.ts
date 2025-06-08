import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate and fallback to default locale if needed
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: {
      common: (await import(`./locales/${validLocale}/common.json`)).default,
      dashboard: (await import(`./locales/${validLocale}/dashboard.json`)).default,
      missions: (await import(`./locales/${validLocale}/missions.json`)).default,
      navigation: (await import(`./locales/${validLocale}/navigation.json`)).default,
      profile: (await import(`./locales/${validLocale}/profile.json`)).default,
      setup: (await import(`./locales/${validLocale}/setup.json`)).default,
      subscription: (await import(`./locales/${validLocale}/subscription.json`)).default,
      errors: (await import(`./locales/${validLocale}/errors.json`)).default,
    }
  };
});
