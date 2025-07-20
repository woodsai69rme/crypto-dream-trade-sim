
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentLoaderProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export const LazyComponentLoader = ({ 
  component, 
  fallback, 
  props = {} 
}: LazyComponentLoaderProps) => {
  const LazyComponent = lazy(component);
  
  const defaultFallback = (
    <div className="space-y-2 p-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loaded components
export const LazyTradingPanel = () => import('@/components/TradingPanel');
export const LazyAccountManager = () => import('@/components/accounts/EnhancedAccountManager');
export const LazySettingsPanel = () => import('@/components/settings/SettingsPanel');
export const LazyAITradingBot = () => import('@/components/ai/AITradingBot');
