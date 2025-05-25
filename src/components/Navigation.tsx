'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Target, Menu, X, User, CreditCard, LayoutDashboard, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  user?: {
    firstName?: string | null;
    username?: string | null;
  } | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const navigationItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'View your missions and progress'
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your account settings'
  },
  {
    href: '/subscription',
    label: 'Subscription',
    icon: CreditCard,
    description: 'Manage your subscription plan'
  }
];

export default function Navigation({ user, onRefresh, refreshing }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            onClick={closeMobileMenu}
          >
            <Target className="h-8 w-8 text-red-500 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-white sm:text-2xl">
              <span className="hidden sm:inline">Valorant Missions</span>
              <span className="sm:hidden">VM</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="navigation"
                    size="default"
                    className={cn(
                      "relative",
                      isActive && "bg-white/15 border-white/50 text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={refreshing}
                variant="navigation"
                size="default"
                className="ml-2"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                <span className="hidden lg:inline">Refresh</span>
              </Button>
            )}
          </div>

          {/* User Info & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {/* User Welcome (Desktop) */}
            {user && (
              <div className="hidden md:block text-sm text-white/90">
                Welcome, {user.firstName || user.username}!
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="navigation"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Welcome (Mobile) */}
              {user && (
                <div className="px-3 py-2 text-sm text-white/90 border-b border-white/10 mb-2">
                  Welcome, {user.firstName || user.username}!
                </div>
              )}

              {/* Navigation Items */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block"
                  >
                    <Button
                      variant="ghost-light"
                      size="lg"
                      className={cn(
                        "w-full justify-start text-left",
                        isActive && "bg-white/15 text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-white/70">{item.description}</span>
                      </div>
                    </Button>
                  </Link>
                );
              })}

              {/* Refresh Button (Mobile) */}
              {onRefresh && (
                <Button
                  onClick={() => {
                    onRefresh();
                    closeMobileMenu();
                  }}
                  disabled={refreshing}
                  variant="ghost-light"
                  size="lg"
                  className="w-full justify-start text-left mt-2"
                >
                  <RefreshCw className={cn("h-5 w-5 mr-3", refreshing && "animate-spin")} />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Refresh Progress</span>
                    <span className="text-xs text-white/70">Update mission progress</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
