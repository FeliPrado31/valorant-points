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
  // For protected routes, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // For non-API routes, handle i18n routing
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return handleI18nRouting(req);
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
