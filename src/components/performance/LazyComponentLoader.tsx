
import { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
}

export const LazyComponentLoader = ({ component }: LazyComponentProps) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
};

// Pre-configured lazy components
export const LazyTradingPanel = () => import('@/components/TradingPanel').then(module => ({ default: module.TradingPanel }));
export const LazyAccountManager = () => import('@/components/accounts/EnhancedAccountManager').then(module => ({ default: module.EnhancedAccountManager }));
export const LazySettingsPanel = () => import('@/components/settings/SettingsPanel').then(module => ({ default: module.SettingsPanel }));
export const LazyAITradingBot = () => import('@/components/ai/AITradingBot').then(module => ({ default: module.AITradingBot }));
