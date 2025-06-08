import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ locale }) => {
  // Get locale from middleware headers as backup
  const headersList = await headers();
  const middlewareLocale = headersList.get('x-middleware-locale');

  // Validate that the incoming locale parameter is valid
  const validLocales = ['en', 'es'];

  // Priority: 1. locale parameter, 2. middleware header, 3. default
  let actualLocale = 'es'; // default fallback

  if (locale && validLocales.includes(locale)) {
    actualLocale = locale;
  } else if (middlewareLocale && validLocales.includes(middlewareLocale)) {
    actualLocale = middlewareLocale;
  }

  try {
    const messages = {
      common: (await import(`./locales/${actualLocale}/common.json`)).default,
      navigation: (await import(`./locales/${actualLocale}/navigation.json`)).default,
      dashboard: (await import(`./locales/${actualLocale}/dashboard.json`)).default,
      profile: (await import(`./locales/${actualLocale}/profile.json`)).default,
      setup: (await import(`./locales/${actualLocale}/setup.json`)).default,
      subscription: (await import(`./locales/${actualLocale}/subscription.json`)).default,
      missions: (await import(`./locales/${actualLocale}/missions.json`)).default,
      errors: (await import(`./locales/${actualLocale}/errors.json`)).default
    };

    return {
      locale: actualLocale,
      messages
    };
  } catch (error) {

    // Fallback to Spanish if there's any error
    const fallbackMessages = {
      common: (await import(`./locales/es/common.json`)).default,
      navigation: (await import(`./locales/es/navigation.json`)).default,
      dashboard: (await import(`./locales/es/dashboard.json`)).default,
      profile: (await import(`./locales/es/profile.json`)).default,
      setup: (await import(`./locales/es/setup.json`)).default,
      subscription: (await import(`./locales/es/subscription.json`)).default,
      missions: (await import(`./locales/es/missions.json`)).default,
      errors: (await import(`./locales/es/errors.json`)).default
    };

    return {
      locale: 'es',
      messages: fallbackMessages
    };
  }
});
