
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { MobileNav } from '../ui/mobile-nav';
import { ThemeToggle } from '../ui/theme-toggle';
import { HelpSystem } from '../help/HelpSystem';
import { NotificationSystem } from '../notifications/NotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  TrendingUp, 
  Bot, 
  Users, 
  BarChart3, 
  Settings, 
  TestTube,
  LogOut,
  User
} from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: TrendingUp, label: 'Trading', path: '/trading' },
    { icon: Bot, label: 'AI Bots', path: '/bots' },
    { icon: Users, label: 'Social', path: '/social' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: TestTube, label: 'Testing', path: '/testing' }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">CryptoTrader Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to={item.path} className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <NotificationSystem />
            <HelpSystem />
            <ThemeToggle />
            
            {/* User menu */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="h-4 w-4 mr-2" />
                {user.email?.split('@')[0]}
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  );
};
