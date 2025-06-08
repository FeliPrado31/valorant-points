import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  return {
    locale: locale!,
    messages: {
      ...(await import(`./locales/${locale}/common.json`)).default,
      ...(await import(`./locales/${locale}/navigation.json`)).default,
      ...(await import(`./locales/${locale}/dashboard.json`)).default,
      ...(await import(`./locales/${locale}/profile.json`)).default,
      ...(await import(`./locales/${locale}/setup.json`)).default,
      ...(await import(`./locales/${locale}/subscription.json`)).default,
      ...(await import(`./locales/${locale}/missions.json`)).default,
      ...(await import(`./locales/${locale}/errors.json`)).default,
    }
  };
});
