import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n';

const isProtectedRoute = createRouteMatcher([
  '/(es|en)/dashboard(.*)',
  '/(es|en)/missions(.*)',
  '/(es|en)/leaderboard(.*)',
  '/(es|en)/subscription(.*)',
  '/(es|en)/profile(.*)',
])

// Custom locale detection function
function getLocaleFromRequest(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;

  // 1. Check if locale is already in the URL
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    console.log('🌐 Middleware: Found locale in URL:', pathnameLocale);
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
      if (browserLocale.startsWith('es')) {
        console.log('🌐 Middleware: Detected Spanish from browser');
        return 'es';
      }
      if (browserLocale.startsWith('en')) {
        console.log('🌐 Middleware: Detected English from browser');
        return 'en';
      }
    }
  }

  // 4. Default fallback
  console.log('🌐 Middleware: Using default locale:', defaultLocale);
  return defaultLocale;
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for API routes, static files, and Next.js internals
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  console.log('🌐 Middleware: Processing request for:', pathname);

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname, redirect to include locale
  if (!pathnameHasLocale) {
    const detectedLocale = getLocaleFromRequest(req);
    const newUrl = new URL(`/${detectedLocale}${pathname}`, req.url);
    console.log('🌐 Middleware: Redirecting to:', newUrl.pathname);

    const response = NextResponse.redirect(newUrl);
    // Set the locale in a header for the next request
    response.headers.set('x-middleware-locale', detectedLocale);
    return response;
  }

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  console.log('🌐 Middleware: Current locale:', locale);

  // For protected routes, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Continue with the request, setting locale in headers
  const response = NextResponse.next();
  response.headers.set('x-middleware-locale', locale);
  return response;
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
