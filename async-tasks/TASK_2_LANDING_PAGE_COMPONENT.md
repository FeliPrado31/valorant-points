# Task 2: Landing Page Component Internationalization

## Overview
This task focuses on updating the main landing page (`src/app/page.tsx`) to use the translation system. This task works independently on the landing page component only.

## Duration: 3 hours
## Dependencies: Foundation Setup Task + Task 1 (Translation Content)
## Conflicts: None (only modifies landing page file)

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git pull origin 29-implement-internationalization-i18n-support-for-english-and-spanish-languages
   git checkout -b task-2-landing-page-component
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add src/app/page.tsx src/locales/
   git commit -m "feat: internationalize landing page component"
   git push origin task-2-landing-page-component
   ```

4. **Create Pull Request**:
   - **Target**: `29-implement-internationalization-i18n-support-for-english-and-spanish-languages`
   - **Title**: `Task 2: Landing Page Component Internationalization`
   - **Description**: Include validation checklist from this task

## Objectives
- Replace all hardcoded text in the landing page with translation calls
- Implement proper translation hooks
- Maintain responsive design and existing functionality
- Add locale-aware content and metadata

## Files Modified (No Conflicts)
**Single File Focus**:
- `src/app/page.tsx` (landing page only)

## Implementation Strategy

### 1. Landing Page Translation Content (30 minutes)
**Goal**: Add landing page specific translations to existing files

**Add to**: `src/locales/en/common.json` (extend existing)
```json
{
  "landing": {
    "hero": {
      "title": "Level Up Your",
      "valorant": "Valorant",
      "game": "Game",
      "description": "Complete challenging missions based on your real Valorant gameplay. Track your progress, earn rewards, and compete with other players.",
      "cta": "Start Your Journey"
    },
    "features": {
      "title": "Features",
      "realTimeMissions": {
        "title": "Real-Time Missions",
        "description": "Complete missions like \"Get 10 headshots\" or \"Win 5 Spike Rush games\" based on your actual Valorant match data."
      },
      "earnRewards": {
        "title": "Earn Rewards",
        "description": "Gain points and unlock achievements as you complete missions. Track your progress and celebrate your victories."
      },
      "competeCompare": {
        "title": "Compete & Compare",
        "description": "See how you stack up against other players on the leaderboard. Challenge friends and climb the ranks."
      }
    },
    "howItWorks": {
      "title": "How It Works",
      "step1": {
        "title": "Connect Your Account",
        "description": "Link your Valorant account by providing your Riot ID and tag."
      },
      "step2": {
        "title": "Choose Missions",
        "description": "Select from various missions tailored to your skill level and playstyle."
      },
      "step3": {
        "title": "Play & Progress",
        "description": "Play Valorant normally and watch your mission progress update automatically."
      }
    }
  }
}
```

**Add to**: `src/locales/es/common.json` (extend existing)
```json
{
  "landing": {
    "hero": {
      "title": "Mejora tu Juego de",
      "valorant": "Valorant",
      "game": "",
      "description": "Completa misiones desafiantes basadas en tu gameplay real de Valorant. Rastrea tu progreso, gana recompensas y compite con otros jugadores.",
      "cta": "Comienza tu Aventura"
    },
    "features": {
      "title": "Características",
      "realTimeMissions": {
        "title": "Misiones en Tiempo Real",
        "description": "Completa misiones como \"Consigue 10 disparos a la cabeza\" o \"Gana 5 partidas de Spike Rush\" basadas en tus datos reales de partidas de Valorant."
      },
      "earnRewards": {
        "title": "Gana Recompensas",
        "description": "Gana puntos y desbloquea logros mientras completas misiones. Rastrea tu progreso y celebra tus victorias."
      },
      "competeCompare": {
        "title": "Compite y Compara",
        "description": "Ve cómo te comparas con otros jugadores en la tabla de clasificación. Desafía a amigos y escala en los rankings."
      }
    },
    "howItWorks": {
      "title": "Cómo Funciona",
      "step1": {
        "title": "Conecta tu Cuenta",
        "description": "Vincula tu cuenta de Valorant proporcionando tu Riot ID y etiqueta."
      },
      "step2": {
        "title": "Elige Misiones",
        "description": "Selecciona entre varias misiones adaptadas a tu nivel de habilidad y estilo de juego."
      },
      "step3": {
        "title": "Juega y Progresa",
        "description": "Juega Valorant normalmente y observa cómo se actualiza automáticamente el progreso de tus misiones."
      }
    }
  }
}
```

### 2. Landing Page Component Update (2.5 hours)
**Goal**: Update the landing page component to use translations

**File**: `src/app/page.tsx`

**Complete Updated Implementation**:
```typescript
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Target, Trophy, Users } from 'lucide-react';
import AutoRedirect from '@/components/AutoRedirect';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Server component for metadata
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  
  return {
    title: `${t('landing.hero.title')} ${t('landing.hero.valorant')} ${t('landing.hero.game')}`,
    description: t('landing.hero.description'),
  };
}

export default async function Home() {
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
              {userId ? (
                <>
                  <Link href="/dashboard">
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
                      {t('buttons.signIn')}
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2">
                      <span className="hidden sm:inline">{t('buttons.getStarted')}</span>
                      <span className="sm:hidden">{t('buttons.signUp')}</span>
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
            {t('landing.hero.title')} <span className="text-red-500">{t('landing.hero.valorant')}</span> {t('landing.hero.game')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
            {t('landing.hero.description')}
          </p>
          {!userId && (
            <SignUpButton mode="modal">
              <Button size="xl" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                {t('landing.hero.cta')}
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
                <CardTitle className="text-white">{t('landing.features.realTimeMissions.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {t('landing.features.realTimeMissions.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-white">{t('landing.features.earnRewards.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {t('landing.features.earnRewards.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <CardTitle className="text-white">{t('landing.features.competeCompare.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {t('landing.features.competeCompare.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </Grid>

        {/* How it Works */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12">
            {t('landing.howItWorks.title')}
          </h2>
          <Grid cols={{ default: 1, md: 3 }} gap="lg">
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                {t('landing.howItWorks.step1.title')}
              </h3>
              <p className="text-gray-300">
                {t('landing.howItWorks.step1.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                {t('landing.howItWorks.step2.title')}
              </h3>
              <p className="text-gray-300">
                {t('landing.howItWorks.step2.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                {t('landing.howItWorks.step3.title')}
              </h3>
              <p className="text-gray-300">
                {t('landing.howItWorks.step3.description')}
              </p>
            </div>
          </Grid>
        </div>
      </Container>
    </div>
  );
}
```

## Key Changes Made

### Translation Integration
- ✅ Replaced all hardcoded strings with translation calls
- ✅ Used server-side `getTranslations` for metadata and content
- ✅ Implemented proper namespace usage (`common`, `navigation`)
- ✅ Maintained existing component structure and styling

### Responsive Design
- ✅ Preserved all responsive classes and breakpoints
- ✅ Maintained mobile/desktop text variations
- ✅ Kept existing layout and spacing

### Functionality
- ✅ Preserved authentication logic
- ✅ Maintained auto-redirect functionality
- ✅ Kept all existing button behaviors
- ✅ Preserved Clerk integration

## Validation Checklist
- [ ] Landing page renders correctly in both languages
- [ ] All text is properly translated
- [ ] Responsive design works on all screen sizes
- [ ] Authentication flows work correctly
- [ ] No hardcoded strings remain
- [ ] Metadata is properly localized
- [ ] Navigation links work correctly

## Testing Notes
- Test language switching on the landing page
- Verify responsive behavior with longer Spanish text
- Confirm all buttons and links function correctly
- Check that auto-redirect works for authenticated users

## Next Steps
This task completes the landing page internationalization. The component is now ready for use with the translation system and will automatically display content in the user's selected language.
