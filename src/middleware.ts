import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
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
    const i18nResponse = handleI18nRouting(req);

    // If i18n middleware returns a response (redirect), use it
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
