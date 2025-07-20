
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();

  console.log('DashboardLayout render:', { user: !!user, loading });

  // Show loading while auth is initializing
  if (loading) {
    console.log('Showing loading state...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xl text-foreground">Loading CryptoTrader Pro...</p>
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // For demo purposes, allow access without authentication
  // In production, this should redirect to auth
  const isDemo = process.env.NODE_ENV === 'development' || window.location.hostname.includes('lovableproject.com');
  
  if (!user && !isDemo) {
    console.log('No user found, redirecting to auth...');
    return <Navigate to="/auth" replace />;
  }

  if (!user && isDemo) {
    console.log('Demo mode: allowing access without authentication');
  } else {
    console.log('User authenticated, rendering dashboard...');
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </NotificationProvider>
    </ErrorBoundary>
  );
};
