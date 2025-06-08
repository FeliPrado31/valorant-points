import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Target, Trophy, Users } from 'lucide-react';
import AutoRedirect from '@/components/AutoRedirect';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';

// Dynamically import LanguageSwitcher to ensure it's client-side only
const LanguageSwitcher = dynamic(() => import('@/components/LanguageSwitcher'), {
  loading: () => <div className="w-20 h-8 bg-gray-700/20 rounded animate-pulse"></div>
});

export default async function LocalizedHome({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  const t = await getTranslations('common');
  const nav = await getTranslations('navigation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Auto redirect for authenticated users */}
      {userId && <AutoRedirect />}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80">
        <Container size="xl" padding="md">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-red-500" />
              <span className="text-xl sm:text-2xl font-bold text-white">
                <span className="hidden sm:inline">{nav('brand.name')}</span>
                <span className="sm:hidden">{nav('brand.shortName')}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher variant="button" />

              {userId ? (
                <>
                  <Link href={`/${locale}/dashboard`}>
                    <Button variant="ghost-light" className="text-sm sm:text-base px-3 sm:px-4 py-2">
                      {nav('items.dashboard.label')}
                    </Button>
                  </Link>
                  <UserButton />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost-light" className="text-sm sm:text-base px-3 sm:px-4 py-2">
                      <span className="hidden sm:inline">{t('buttons.signIn')}</span>
                      <span className="sm:hidden">{t('buttons.signIn')}</span>
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2">
                      <span className="hidden sm:inline">{t('buttons.getStarted')}</span>
                      <span className="sm:hidden">{t('buttons.getStarted')}</span>
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <Container size="xl" padding="md" className="py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span dangerouslySetInnerHTML={{
              __html: t('home.hero.title', { valorant: '<span class="text-red-500">Valorant</span>' })
            }} />
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
            {t('home.hero.subtitle')}
          </p>
          {!userId && (
            <SignUpButton mode="modal">
              <Button size="xl" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                {t('home.hero.cta')}
              </Button>
            </SignUpButton>
          )}
        </div>

        {/* Features */}
        <Grid cols={{ default: 1, md: 3 }} gap="lg" className="mt-12 sm:mt-16 lg:mt-20">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-red-500" />
                <CardTitle className="text-white">{t('home.features.realTime.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {t('home.features.realTime.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-white">{t('home.features.rewards.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {t('home.features.rewards.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <CardTitle className="text-white">{t('home.features.compete.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {t('home.features.compete.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </Grid>

        {/* How it Works */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12">
            {t('home.howItWorks.title')}
          </h2>
          <Grid cols={{ default: 1, md: 3 }} gap="lg">
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{t('home.howItWorks.steps.connect.title')}</h3>
              <p className="text-gray-300">
                {t('home.howItWorks.steps.connect.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{t('home.howItWorks.steps.choose.title')}</h3>
              <p className="text-gray-300">
                {t('home.howItWorks.steps.choose.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{t('home.howItWorks.steps.play.title')}</h3>
              <p className="text-gray-300">
                {t('home.howItWorks.steps.play.description')}
              </p>
            </div>
          </Grid>
        </div>
      </Container>
    </div>
  );
}
