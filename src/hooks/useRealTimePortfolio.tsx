
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  mode: 'paper' | 'live';
  initial_balance: number;
  current_balance: number;
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  positions: any;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id?: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  fee: number;
  status: string;
  reasoning?: string;
  created_at: string;
}

export const useRealTimePortfolio = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [defaultPortfolio, setDefaultPortfolio] = useState<Portfolio | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolios
  const fetchPortfolios = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching portfolios:', error);
        setError(error.message);
        toast({
          title: "Error Loading Portfolios",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setPortfolios(data);
        const defaultPort = data.find(p => p.is_default) || data[0];
        setDefaultPortfolio(defaultPort || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolios';
      console.error('Error in fetchPortfolios:', err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch trades
  const fetchTrades = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      if (data) {
        setTrades(data);
      }
    } catch (err) {
      console.error('Error in fetchTrades:', err);
    }
  };

  // Create default portfolio if none exists
  const createDefaultPortfolio = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: 'My Paper Portfolio',
          is_default: true,
          mode: 'paper',
          initial_balance: 100000,
          current_balance: 100000,
          total_value: 100000,
          total_pnl: 0,
          total_pnl_percentage: 0,
          positions: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default portfolio:', error);
        toast({
          title: "Error Creating Portfolio",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setPortfolios([data]);
        setDefaultPortfolio(data);
        toast({
          title: "Portfolio Created",
          description: "Your default portfolio has been created successfully.",
        });
      }
    } catch (err) {
      console.error('Error in createDefaultPortfolio:', err);
      toast({
        title: "Error",
        description: "Failed to create default portfolio",
        variant: "destructive",
      });
    }
  };

  // Update portfolio
  const updatePortfolio = async (portfolioId: string, updates: Partial<Portfolio>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating portfolio:', error);
        toast({
          title: "Error Updating Portfolio",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      if (data) {
        setPortfolios(prev => prev.map(p => p.id === portfolioId ? data : p));
        if (defaultPortfolio?.id === portfolioId) {
          setDefaultPortfolio(data);
        }
        return data;
      }
    } catch (err) {
      console.error('Error in updatePortfolio:', err);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      });
      return null;
    }
  };

  // Initialize and set up real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    fetchPortfolios();
    fetchTrades();

    // Set up real-time subscription for portfolios
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
          console.log('Portfolio change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setPortfolios(prev => [...prev, payload.new as Portfolio]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPortfolio = payload.new as Portfolio;
            setPortfolios(prev => 
              prev.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p)
            );
            if (defaultPortfolio?.id === updatedPortfolio.id) {
              setDefaultPortfolio(updatedPortfolio);
            }
          } else if (payload.eventType === 'DELETE') {
            setPortfolios(prev => prev.filter(p => p.id !== payload.old.id));
            if (defaultPortfolio?.id === payload.old.id) {
              setDefaultPortfolio(null);
            }
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for trades
    const tradesChannel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paper_trades',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Trade change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTrades(prev => [payload.new as Trade, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTrade = payload.new as Trade;
            setTrades(prev => 
              prev.map(t => t.id === updatedTrade.id ? updatedTrade : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTrades(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      portfolioChannel.unsubscribe();
      tradesChannel.unsubscribe();
    };
  }, [isAuthenticated, user?.id]);

  // Create default portfolio if none exists
  useEffect(() => {
    if (!loading && portfolios.length === 0 && user?.id) {
      createDefaultPortfolio();
    }
  }, [loading, portfolios.length, user?.id]);

  return {
    portfolios,
    defaultPortfolio,
    trades,
    loading,
    error,
    updatePortfolio,
    refetch: fetchPortfolios,
    // Legacy aliases for backward compatibility
    paperAccount: defaultPortfolio,
    portfolio: defaultPortfolio,
  };
};
