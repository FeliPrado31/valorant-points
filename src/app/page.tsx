import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, Users } from 'lucide-react';
import AutoRedirect from '@/components/AutoRedirect';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Auto redirect for authenticated users */}
      {userId && <AutoRedirect />}

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Target className="h-8 w-8 text-red-500" />
          <span className="text-2xl font-bold text-white">Valorant Missions</span>
        </div>
        <div className="flex items-center space-x-4">
          {userId ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:text-red-500">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-white hover:text-red-500">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Level Up Your <span className="text-red-500">Valorant</span> Game
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Complete challenging missions based on your real Valorant gameplay.
            Track your progress, earn rewards, and compete with other players.
          </p>
          {!userId && (
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4">
                Start Your Journey
              </Button>
            </SignUpButton>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-red-500" />
                <CardTitle className="text-white">Real-Time Missions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Complete missions like "Get 10 headshots" or "Win 5 Spike Rush games"
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
        </div>

        {/* How it Works */}
        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}
