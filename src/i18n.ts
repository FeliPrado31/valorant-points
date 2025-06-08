import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const actualLocale = locale || 'en';

  return {
    locale: actualLocale,
    messages: {
      ...(await import(`./locales/${actualLocale}/common.json`)).default,
      ...(await import(`./locales/${actualLocale}/subscription.json`)).default,
      ...(await import(`./locales/${actualLocale}/navigation.json`)).default,
      ...(await import(`./locales/${actualLocale}/dashboard.json`)).default,
      ...(await import(`./locales/${actualLocale}/profile.json`)).default,
      ...(await import(`./locales/${actualLocale}/setup.json`)).default,
      ...(await import(`./locales/${actualLocale}/missions.json`)).default,
      ...(await import(`./locales/${actualLocale}/errors.json`)).default
    }
  };
});
