import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';
import { NextRequest } from 'next/server';

// Custom locale detection function
function getLocale(request: NextRequest): string {
  // 1. Check if locale is already in the URL
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    return pathnameLocale;
  }

  // 2. Check for preferred locale in cookies
  const preferredLocale = request.cookies.get('preferred-locale')?.value;
  if (preferredLocale && locales.includes(preferredLocale as any)) {
    console.log('🌐 Middleware: Found preferred locale in cookie:', preferredLocale);
    return preferredLocale;
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const browserLocales = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase());

    for (const browserLocale of browserLocales) {
      if (browserLocale.startsWith('es')) return 'es';
      if (browserLocale.startsWith('en')) return 'en';
    }
  }

  // 4. Default fallback
  console.log('🌐 Middleware: Using default locale:', defaultLocale);
  return defaultLocale;
}

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false // Disable automatic detection, we'll handle it manually
});

const isProtectedRoute = createRouteMatcher([
  '/(es|en)/dashboard(.*)',
  '/(es|en)/missions(.*)',
  '/(es|en)/leaderboard(.*)',
  '/(es|en)/subscription(.*)',
  '/(es|en)/profile(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Handle i18n routing first for all non-API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    // Check if we need to redirect to include locale
    const pathname = req.nextUrl.pathname;
    const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // If no locale in pathname, redirect to include preferred locale
    if (!pathnameHasLocale) {
      const detectedLocale = getLocale(req);
      const newUrl = new URL(`/${detectedLocale}${pathname}`, req.url);
      console.log('🌐 Middleware: Redirecting to:', newUrl.pathname);
      return Response.redirect(newUrl);
    }

    // Let next-intl handle the routing
    const i18nResponse = handleI18nRouting(req);
    if (i18nResponse) {
      return i18nResponse;
    }
  }

  // For protected routes, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
