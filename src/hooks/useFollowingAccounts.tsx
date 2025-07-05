
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FollowingAccount {
  id: string;
  trader_name: string;
  trader_category: string;
  followed_at: string;
  is_active: boolean;
  live_data?: {
    current_balance: number;
    total_pnl: number;
    total_pnl_percentage: number;
    recent_trades: any[];
    win_rate: number;
    total_trades: number;
  };
}

export const useFollowingAccounts = () => {
  const { user } = useAuth();
  const [followingAccounts, setFollowingAccounts] = useState<FollowingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowingAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trader_follows')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('followed_at', { ascending: false });

      if (error) throw error;

      // Simulate live data for followed accounts
      const accountsWithLiveData = data?.map(account => ({
        ...account,
        live_data: {
          current_balance: 50000 + Math.random() * 100000,
          total_pnl: (Math.random() - 0.3) * 20000,
          total_pnl_percentage: (Math.random() - 0.3) * 40,
          recent_trades: generateMockTrades(account.trader_name),
          win_rate: 60 + Math.random() * 30,
          total_trades: Math.floor(100 + Math.random() * 500)
        }
      })) || [];

      setFollowingAccounts(accountsWithLiveData);
    } catch (error) {
      console.error('Error fetching following accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateMockTrades = (traderName: string) => {
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    const trades = [];
    
    for (let i = 0; i < 5; i++) {
      trades.push({
        id: `trade-${i}`,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.random() * 10,
        price: 1000 + Math.random() * 50000,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        pnl: (Math.random() - 0.4) * 1000
      });
    }
    
    return trades;
  };

  useEffect(() => {
    fetchFollowingAccounts();
  }, [fetchFollowingAccounts]);

  // Set up real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('following-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trader_follows',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchFollowingAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFollowingAccounts]);

  // Simulate live updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFollowingAccounts(prev => prev.map(account => ({
        ...account,
        live_data: account.live_data ? {
          ...account.live_data,
          current_balance: account.live_data.current_balance * (1 + (Math.random() - 0.5) * 0.02),
          total_pnl: account.live_data.total_pnl * (1 + (Math.random() - 0.5) * 0.05),
          total_pnl_percentage: account.live_data.total_pnl_percentage * (1 + (Math.random() - 0.5) * 0.05),
        } : undefined
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    followingAccounts,
    loading,
    refetch: fetchFollowingAccounts
  };
};
