import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SocialSentimentData {
  id: string;
  symbol: string;
  platform: 'twitter' | 'youtube' | 'reddit' | 'news';
  sentiment_score: number;
  mention_count: number;
  trending_rank?: number;
  data_timestamp: string;
  raw_data: any;
}

export interface SentimentSummary {
  symbol: string;
  overall_sentiment: number;
  total_mentions: number;
  trend_direction: 'up' | 'down' | 'neutral';
  platforms: {
    twitter: number;
    youtube: number;
    reddit: number;
    news: number;
  };
}

export const useSocialSentiment = (symbols: string[] = []) => {
  const [sentimentData, setSentimentData] = useState<SocialSentimentData[]>([]);
  const [summaries, setSummaries] = useState<SentimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch latest sentiment data
  const fetchSentimentData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('social_sentiment')
        .select('*')
        .in('symbol', symbols.length > 0 ? symbols : ['BTC', 'ETH', 'SOL', 'ADA'])
        .gte('data_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('data_timestamp', { ascending: false });

      if (error) throw error;

      setSentimentData((data as SocialSentimentData[]) || []);
      setLastUpdate(new Date());
      
      // Calculate summaries
      const summaryMap = new Map<string, SentimentSummary>();
      
      data?.forEach(item => {
        if (!summaryMap.has(item.symbol)) {
          summaryMap.set(item.symbol, {
            symbol: item.symbol,
            overall_sentiment: 0,
            total_mentions: 0,
            trend_direction: 'neutral',
            platforms: {
              twitter: 0,
              youtube: 0,
              reddit: 0,
              news: 0
            }
          });
        }
        
        const summary = summaryMap.get(item.symbol)!;
        summary.overall_sentiment += item.sentiment_score;
        summary.total_mentions += item.mention_count;
        summary.platforms[item.platform as keyof typeof summary.platforms] = item.sentiment_score;
      });

      // Finalize summaries
      const finalSummaries = Array.from(summaryMap.values()).map(summary => ({
        ...summary,
        overall_sentiment: summary.overall_sentiment / 4, // Average across platforms
        trend_direction: (summary.overall_sentiment > 0.1 ? 'up' : 
                         summary.overall_sentiment < -0.1 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral'
      }));

      setSummaries(finalSummaries);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  // Trigger sentiment data collection
  const refreshSentiment = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('social-sentiment-monitor');
      
      if (error) throw error;
      
      // Wait a moment then fetch the new data
      setTimeout(() => {
        fetchSentimentData();
      }, 2000);
    } catch (error) {
      console.error('Error refreshing sentiment:', error);
      setLoading(false);
    }
  }, [fetchSentimentData]);

  // Get sentiment for specific symbol
  const getSentimentForSymbol = useCallback((symbol: string) => {
    return sentimentData.filter(item => item.symbol === symbol);
  }, [sentimentData]);

  // Get trending symbols
  const getTrendingSymbols = useCallback(() => {
    return summaries
      .sort((a, b) => b.total_mentions - a.total_mentions)
      .slice(0, 10);
  }, [summaries]);

  // Get bullish/bearish symbols
  const getBullishSymbols = useCallback(() => {
    return summaries
      .filter(s => s.overall_sentiment > 0.2)
      .sort((a, b) => b.overall_sentiment - a.overall_sentiment);
  }, [summaries]);

  const getBearishSymbols = useCallback(() => {
    return summaries
      .filter(s => s.overall_sentiment < -0.2)
      .sort((a, b) => a.overall_sentiment - b.overall_sentiment);
  }, [summaries]);

  // Real-time updates
  useEffect(() => {
    fetchSentimentData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('social-sentiment-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_sentiment'
        },
        () => {
          fetchSentimentData();
        }
      )
      .subscribe();

    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshSentiment, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchSentimentData, refreshSentiment]);

  return {
    sentimentData,
    summaries,
    loading,
    lastUpdate,
    refreshSentiment,
    getSentimentForSymbol,
    getTrendingSymbols,
    getBullishSymbols,
    getBearishSymbols
  };
};