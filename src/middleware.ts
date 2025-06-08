import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/missions(.*)',
  '/leaderboard(.*)',
  '/subscription(.*)',
  '/profile(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Handle locale routing first
  const response = intlMiddleware(req);

  // Check if this is a protected route (accounting for locale prefix)
  const pathname = req.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');

  if (isProtectedRoute(req) || (pathnameWithoutLocale && isProtectedRoute({ ...req, nextUrl: { ...req.nextUrl, pathname: pathnameWithoutLocale } } as NextRequest))) {
    await auth.protect()
  }

  return response;
})

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - Static files (images, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
