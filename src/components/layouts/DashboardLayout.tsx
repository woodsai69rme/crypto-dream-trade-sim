
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

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen crypto-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-xl text-gray-300">Loading CryptoTrader Pro...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </NotificationProvider>
    </ErrorBoundary>
  );
};
