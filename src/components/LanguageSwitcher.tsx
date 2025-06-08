'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'button';
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'dropdown', 
  className = '' 
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isChanging, setIsChanging] = useState(false);

  console.log('🌐 LanguageSwitcher: Current locale:', currentLocale);
  console.log('🌐 LanguageSwitcher: Current pathname:', pathname);
  console.log('🌐 LanguageSwitcher: Available locales:', locales);

  const handleLocaleChange = async (newLocale: string) => {
    console.log('🌐 LanguageSwitcher: Attempting to change locale from', currentLocale, 'to', newLocale);
    console.log('🌐 LanguageSwitcher: Current pathname:', pathname);

    if (newLocale === currentLocale || isChanging) {
      console.log('🌐 LanguageSwitcher: Change blocked - same locale or already changing');
      return;
    }

    setIsChanging(true);

    try {
      // Remove current locale from pathname
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
      console.log('🌐 LanguageSwitcher: Path without locale:', pathWithoutLocale);

      // Navigate to new locale
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      console.log('🌐 LanguageSwitcher: Navigating to:', newPath);
      router.push(newPath);

      // Store preference
      document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('preferred-locale', newLocale);
      console.log('🌐 LanguageSwitcher: Preference stored');
    } catch (error) {
      console.error('❌ LanguageSwitcher: Error changing locale:', error);
    } finally {
      // Reset changing state after a delay
      setTimeout(() => setIsChanging(false), 1000);
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
              px-2 py-1 text-xs font-medium
              ${locale === currentLocale 
                ? 'bg-red-600 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="mr-1">{localeFlags[locale]}</span>
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Select 
      value={currentLocale} 
      onValueChange={handleLocaleChange}
      disabled={isChanging}
    >
      <SelectTrigger 
        className={`
          w-auto min-w-[100px] border-white/20 bg-white/5 text-white 
          hover:bg-white/10 focus:border-red-500 focus:ring-red-500/20
          ${className}
        `}
        aria-label="Select language"
      >
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
          <span className="sm:hidden">{localeFlags[currentLocale]}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {locales.map((locale) => (
          <SelectItem 
            key={locale} 
            value={locale}
            className="text-white hover:bg-slate-700 focus:bg-slate-700"
          >
            <div className="flex items-center space-x-2">
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
