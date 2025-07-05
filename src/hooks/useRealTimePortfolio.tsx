import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PortfolioData {
  id: string;
  name: string;
  current_balance: number;
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  positions: any;
  updated_at: string;
}

interface PaperAccount {
  id: string;
  balance: number;
  total_pnl: number;
  total_pnl_percentage: number;
  updated_at: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: string;
  amount: number;
  price: number;
  total_value: number;
  fee: number;
  status: string;
  reasoning: string;
  created_at: string;
}

export const useRealTimePortfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [paperAccount, setPaperAccount] = useState<PaperAccount | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchInitialData();
    setupRealtimeSubscriptions();
  }, [user]);

  const fetchInitialData = async () => {
    if (!user) return;

    try {
      // Fetch portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (portfolioData) {
        setPortfolio(portfolioData);
      }

      // Fetch paper trading account
      const { data: accountData } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (accountData) {
        setPaperAccount(accountData);
      }

      // Fetch recent trades
      const { data: tradesData } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (tradesData) {
        setTrades(tradesData);
      }

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Portfolio updates
    const portfolioChannel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).is_default) {
            setPortfolio(payload.new as PortfolioData);
          }
        }
      )
      .subscribe();

    // Paper account updates
    const accountChannel = supabase
      .channel('account-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paper_trading_accounts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setPaperAccount(payload.new as PaperAccount);
          }
        }
      )
      .subscribe();

    // Trades updates
    const tradesChannel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'paper_trades',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setTrades(prev => [payload.new as Trade, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(portfolioChannel);
      supabase.removeChannel(accountChannel);
      supabase.removeChannel(tradesChannel);
    };
  };

  return {
    portfolio,
    paperAccount,
    trades,
    loading,
    refetch: fetchInitialData
  };
};