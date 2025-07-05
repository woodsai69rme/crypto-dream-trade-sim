import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface PerformanceData {
  date: string;
  value: number;
  return: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  volatility: number;
  alpha: number;
  beta: number;
}

export const usePerformanceAnalytics = (accountId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    volatility: 0,
    alpha: 0,
    beta: 0
  });

  const fetchPerformanceData = useCallback(async () => {
    if (!user || !accountId) return;

    try {
      setLoading(true);
      
      // Fetch account analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('account_analytics')
        .select('*')
        .eq('account_id', accountId)
        .order('analytics_date', { ascending: false })
        .limit(30);

      if (analyticsError) throw analyticsError;

      if (analyticsData && analyticsData.length > 0) {
        const latestAnalytics = analyticsData[0];
        
        setMetrics({
          totalReturn: latestAnalytics.yearly_return || 0,
          sharpeRatio: latestAnalytics.sharpe_ratio || 0,
          maxDrawdown: Math.abs(latestAnalytics.max_drawdown || 0),
          winRate: latestAnalytics.win_rate || 0,
          volatility: latestAnalytics.volatility || 0,
          alpha: latestAnalytics.alpha || 0,
          beta: latestAnalytics.beta || 1
        });

        // Generate performance chart data
        const chartData: PerformanceData[] = analyticsData.reverse().map((item, index) => ({
          date: new Date(item.analytics_date).toLocaleDateString(),
          value: 100 + (item.daily_return || 0) * (index + 1),
          return: item.daily_return || 0
        }));

        setPerformanceData(chartData);
      }

    } catch (error: any) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load performance analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, accountId, toast]);

  const calculateMetrics = useCallback(async (accountId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('calculate_account_metrics', {
        account_id_param: accountId
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error calculating metrics:', error);
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (accountId) {
      fetchPerformanceData();
    }
  }, [accountId, fetchPerformanceData]);

  return {
    performanceData,
    metrics,
    loading,
    refetch: fetchPerformanceData,
    calculateMetrics
  };
};