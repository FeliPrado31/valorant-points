'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AutoRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !checking) {
      setChecking(true);
      checkUserSetup();
    }
  }, [isLoaded, user, checking]);

  const checkUserSetup = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        if (userData.riotId && userData.riotId.puuid) {
          // User has completed setup, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User needs to complete setup
          router.push('/setup');
        }
      } else {
        // User doesn't exist in our system, redirect to setup
        router.push('/setup');
      }
    } catch (error) {
      console.error('Error checking user setup:', error);
      // On error, redirect to setup to be safe
      router.push('/setup');
    }
  };

  // Don't render anything, this component just handles redirection
  return null;
}
