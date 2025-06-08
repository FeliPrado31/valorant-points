'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';

export default function AutoRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [checking, setChecking] = useState(false);

  const checkUserSetup = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        if (userData.riotId && userData.riotId.puuid) {
          // User has completed setup, redirect to localized dashboard
          router.push(`/${locale}/dashboard`);
        } else {
          // User needs to complete setup, redirect to localized setup
          router.push(`/${locale}/setup`);
        }
      } else {
        // User doesn't exist in our system, redirect to localized setup
        router.push(`/${locale}/setup`);
      }
    } catch (error) {
      console.error('Error checking user setup:', error);
      // On error, redirect to localized setup to be safe
      router.push(`/${locale}/setup`);
    }
  }, [router, locale]);

  useEffect(() => {
    if (isLoaded && user && !checking) {
      setChecking(true);
      checkUserSetup();
    }
  }, [isLoaded, user, checking, checkUserSetup]);

  // Don't render anything, this component just handles redirection
  return null;
}
