import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Target, Trophy, Users } from 'lucide-react';

export default async function Home() {
  // TODO: Implement Ko-fi based authentication
  const userId = null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80">
        <Container size="xl" padding="md">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-red-500" />
              <span className="text-xl sm:text-2xl font-bold text-white">
                <span className="hidden sm:inline">Valorant Missions</span>
                <span className="sm:hidden">VM</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost-light" className="text-sm sm:text-base px-3 sm:px-4 py-2">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Sign In</span>
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <Container size="xl" padding="md" className="py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Level Up Your <span className="text-red-500">Valorant</span> Game
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
            Complete challenging missions based on your real Valorant gameplay.
            Track your progress, earn rewards, and compete with other players.
          </p>
          <Link href="/auth/signup">
            <Button size="xl" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
              Start Your Journey
            </Button>
          </Link>
        </div>

        {/* Features */}
        <Grid cols={{ default: 1, md: 3 }} gap="lg" className="mt-12 sm:mt-16 lg:mt-20">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-red-500" />
                <CardTitle className="text-white">Real-Time Missions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Complete missions like &quot;Get 10 headshots&quot; or &quot;Win 5 Spike Rush games&quot;
                based on your actual Valorant match data.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-white">Earn Rewards</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Gain points and unlock achievements as you complete missions.
                Track your progress and celebrate your victories.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <CardTitle className="text-white">Compete & Compare</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                See how you stack up against other players on the leaderboard.
                Challenge friends and climb the ranks.
              </CardDescription>
            </CardContent>
          </Card>
        </Grid>

        {/* How it Works */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12">How It Works</h2>
          <Grid cols={{ default: 1, md: 3 }} gap="lg">
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Connect Your Account</h3>
              <p className="text-gray-300">
                Link your Valorant account by providing your Riot ID and tag.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Choose Missions</h3>
              <p className="text-gray-300">
                Select from various missions tailored to your skill level and playstyle.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Play & Progress</h3>
              <p className="text-gray-300">
                Play Valorant normally and watch your mission progress update automatically.
              </p>
            </div>
          </Grid>
        </div>
      </Container>
    </div>
  );
}
