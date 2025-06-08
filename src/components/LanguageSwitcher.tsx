'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'button';
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'dropdown',
  className = ''
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isChanging, setIsChanging] = useState(false);

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === currentLocale || isChanging) {
      return;
    }

    setIsChanging(true);

    try {
      // 1. Set the preferred locale in cookie
      document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // 2. Create new path with the new locale
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
      const newPath = `/${newLocale}${pathWithoutLocale}`;

      // 3. Use window.location for a complete page reload to ensure proper locale switching
      window.location.href = newPath;
    } catch {
      setIsChanging(false);
    }
  };

  if (variant === 'button') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {locales.map((locale) => (
          <Button
            key={locale}
            variant={locale === currentLocale ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLocaleChange(locale)}
            disabled={isChanging}
            className={`
              px-2 py-1 text-xs font-medium transition-all duration-200
              ${locale === currentLocale
                ? 'bg-red-600 text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
              ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="mr-1">{localeFlags[locale]}</span>
            {locale.toUpperCase()}
            {isChanging && locale !== currentLocale && (
              <span className="ml-1 animate-spin">⟳</span>
            )}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-white" />
        <div className="flex items-center space-x-1">
          {locales.map((locale) => (
            <Button
              key={locale}
              variant={locale === currentLocale ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLocaleChange(locale)}
              disabled={isChanging}
              className={`
                px-2 py-1 text-xs transition-all duration-200
                ${locale === currentLocale
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
                ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="mr-1">{localeFlags[locale]}</span>
              <span className="hidden sm:inline">{localeNames[locale]}</span>
              <span className="sm:hidden">{locale.toUpperCase()}</span>
              {isChanging && locale !== currentLocale && (
                <span className="ml-1 animate-spin">⟳</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
