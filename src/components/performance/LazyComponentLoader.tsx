import React, { Suspense, memo, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load components for better performance
export const LazyDeribitIntegration = lazy(() => 
  import('@/components/integrations/DeribitIntegration').then(module => ({ 
    default: module.DeribitIntegration 
  }))
);

export const LazyComprehensiveAuditDashboard = lazy(() => 
  import('@/components/enhanced/ComprehensiveAuditDashboard').then(module => ({ 
    default: module.ComprehensiveAuditDashboard 
  }))
);

export const LazyEnhancedAccountResetManager = lazy(() => 
  import('@/components/EnhancedAccountResetManager').then(module => ({ 
    default: module.EnhancedAccountResetManager 
  }))
);

export const LazyAITradingBot = lazy(() => 
  import('@/components/ai/AITradingBot').then(module => ({ 
    default: module.AITradingBot 
  }))
);

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper = memo(({ children, fallback }: LazyWrapperProps) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
));

LazyWrapper.displayName = 'LazyWrapper';