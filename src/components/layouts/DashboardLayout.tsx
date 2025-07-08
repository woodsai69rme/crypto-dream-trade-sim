
import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { Header } from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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
