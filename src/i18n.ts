import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  return {
    locale: locale!,
    messages: {
      common: (await import(`./locales/${locale}/common.json`)).default,
      navigation: (await import(`./locales/${locale}/navigation.json`)).default,
      dashboard: (await import(`./locales/${locale}/dashboard.json`)).default,
      profile: (await import(`./locales/${locale}/profile.json`)).default,
      setup: (await import(`./locales/${locale}/setup.json`)).default,
      subscription: (await import(`./locales/${locale}/subscription.json`)).default,
      missions: (await import(`./locales/${locale}/missions.json`)).default,
      errors: (await import(`./locales/${locale}/errors.json`)).default
    }
  };
});
