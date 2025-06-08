import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale and use default if invalid
  const validLocales = ['en', 'es'];
  const actualLocale = validLocales.includes(locale) ? locale : 'es';

  console.log('🌐 i18n.ts: Requested locale:', locale);
  console.log('🌐 i18n.ts: Using actual locale:', actualLocale);

  return {
    locale: actualLocale,
    messages: {
      common: (await import(`./locales/${actualLocale}/common.json`)).default,
      navigation: (await import(`./locales/${actualLocale}/navigation.json`)).default,
      dashboard: (await import(`./locales/${actualLocale}/dashboard.json`)).default,
      profile: (await import(`./locales/${actualLocale}/profile.json`)).default,
      setup: (await import(`./locales/${actualLocale}/setup.json`)).default,
      subscription: (await import(`./locales/${actualLocale}/subscription.json`)).default,
      missions: (await import(`./locales/${actualLocale}/missions.json`)).default,
      errors: (await import(`./locales/${actualLocale}/errors.json`)).default
    }
  };
});
