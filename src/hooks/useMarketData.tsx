
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  price_usd: number;
  price_aud: number;
  volume_24h_usd: number;
  volume_24h_aud: number;
  change_24h: number;
  change_percentage_24h: number;
  market_cap_usd: number;
  market_cap_aud: number;
  last_updated: string;
  exchange: string;
}

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;

      setMarketData(data || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const refreshMarketData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) throw error;
      
      await fetchMarketData();
      
      toast({
        title: "Success",
        description: "Market data updated successfully",
      });
    } catch (error) {
      console.error('Error refreshing market data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    // Set up real-time subscription
    const channel = supabase
      .channel('market-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data_cache'
        },
        () => {
          fetchMarketData();
        }
      )
      .subscribe();

    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshMarketData, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    marketData,
    loading,
    lastUpdated,
    refreshMarketData,
    fetchMarketData
  };
};
