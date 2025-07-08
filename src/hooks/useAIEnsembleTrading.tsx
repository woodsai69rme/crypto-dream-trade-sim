
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AIBot {
  id: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'error';
  performance: {
    win_rate: number;
    total_return: number;
    total_trades: number;
    daily_pnl: number;
  };
  confidence_threshold: number;
  risk_level: string;
  target_symbols: string[];
}

export interface TradingSignal {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  timestamp: string;
  reasoning: string;
  bot_id: string;
}

export interface MarketConditions {
  volatility: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  volume: number;
  support_level: number;
  resistance_level: number;
}

export const useAIEnsembleTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bots, setBots] = useState<AIBot[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [marketConditions, setMarketConditions] = useState<MarketConditions>({
    volatility: 0.15,
    trend: 'sideways',
    volume: 1000000,
    support_level: 45000,
    resistance_level: 50000
  });
  const [loading, setLoading] = useState(true);
  const [ensembleActive, setEnsembleActive] = useState(false);

  // Load AI bots from database
  const loadBots = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database records to AIBot format with proper type handling
      const transformedBots: AIBot[] = (data || []).map(bot => {
        // Parse performance JSON safely
        let performance = {
          win_rate: 0,
          total_return: 0,
          total_trades: 0,
          daily_pnl: 0
        };

        if (bot.performance && typeof bot.performance === 'object') {
          const perf = bot.performance as any;
          performance = {
            win_rate: Number(perf.win_rate) || 0,
            total_return: Number(perf.total_return) || 0,
            total_trades: Number(perf.total_trades) || 0,
            daily_pnl: Number(perf.daily_pnl) || 0
          };
        }

        return {
          id: bot.id,
          name: bot.name,
          strategy: bot.strategy,
          status: bot.status as 'active' | 'paused' | 'error',
          performance,
          confidence_threshold: 70,
          risk_level: bot.risk_level,
          target_symbols: bot.target_symbols || []
        };
      });

      setBots(transformedBots);
      console.log(`Loaded ${transformedBots.length} AI bots`);
    } catch (error: any) {
      console.error('Error loading bots:', error);
      toast({
        title: "Error Loading Bots",
        description: "Failed to load AI trading bots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Generate ensemble trading signal
  const generateEnsembleSignal = useCallback(async (): Promise<TradingSignal | null> => {
    if (!ensembleActive || bots.length === 0) return null;

    const activeBots = bots.filter(bot => bot.status === 'active');
    if (activeBots.length === 0) return null;

    // Simulate AI ensemble decision making
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
    
    // Calculate ensemble confidence based on bot votes
    const botVotes = activeBots.filter(() => Math.random() > 0.3).length;
    const confidence = Math.min(95, (botVotes / activeBots.length) * 100);

    if (confidence < 60) return null; // Only execute high-confidence signals

    const signal: TradingSignal = {
      symbol,
      side,
      price: 45000 + Math.random() * 25000,
      amount: 0.01 + Math.random() * 0.1,
      confidence,
      timestamp: new Date().toISOString(),
      reasoning: `Ensemble of ${botVotes}/${activeBots.length} bots agree on ${side} signal for ${symbol}`,
      bot_id: 'ensemble'
    };

    // Log the signal generation with proper JSON conversion
    try {
      await supabase.from('comprehensive_audit').insert({
        user_id: user?.id || '',
        action_type: 'ensemble_signal_generated',
        entity_type: 'trading_signal',
        entity_id: signal.symbol,
        metadata: {
          signal: JSON.parse(JSON.stringify(signal)),
          market_conditions: JSON.parse(JSON.stringify(marketConditions)),
          bot_votes: botVotes,
          active_bots: activeBots.length
        } as any
      });
    } catch (error) {
      console.error('Error logging ensemble signal:', error);
    }

    return signal;
  }, [ensembleActive, bots, marketConditions, user]);

  // Start ensemble trading
  const startEnsemble = useCallback(() => {
    setEnsembleActive(true);
    toast({
      title: "AI Ensemble Activated",
      description: `${bots.filter(b => b.status === 'active').length} bots now trading collectively`,
    });
  }, [bots, toast]);

  // Stop ensemble trading
  const stopEnsemble = useCallback(() => {
    setEnsembleActive(false);
    toast({
      title: "AI Ensemble Deactivated",
      description: "Collective trading has been stopped",
    });
  }, [toast]);

  // Update bot status
  const updateBotStatus = useCallback(async (botId: string, status: 'active' | 'paused' | 'error') => {
    try {
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ status })
        .eq('id', botId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setBots(prev => prev.map(bot => 
        bot.id === botId ? { ...bot, status } : bot
      ));

      toast({
        title: "Bot Updated",
        description: `Bot status changed to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating bot status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update bot",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Generate signals periodically when ensemble is active
  useEffect(() => {
    if (!ensembleActive) return;

    const interval = setInterval(async () => {
      const signal = await generateEnsembleSignal();
      if (signal) {
        setSignals(prev => [signal, ...prev.slice(0, 19)]); // Keep last 20 signals
      }
    }, 12000); // Generate signal every 12 seconds

    return () => clearInterval(interval);
  }, [ensembleActive, generateEnsembleSignal]);

  // Update market conditions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketConditions(prev => ({
        ...prev,
        volatility: 0.1 + Math.random() * 0.3,
        trend: ['bullish', 'bearish', 'sideways'][Math.floor(Math.random() * 3)] as any,
        volume: 800000 + Math.random() * 400000,
        support_level: 44000 + Math.random() * 2000,
        resistance_level: 49000 + Math.random() * 3000
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize
  useEffect(() => {
    loadBots();
  }, [loadBots]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('bot-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ai_trading_bots',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Bot change detected:', payload);
        loadBots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadBots]);

  return {
    bots,
    signals,
    marketConditions,
    loading,
    ensembleActive,
    startEnsemble,
    stopEnsemble,
    updateBotStatus,
    refreshBots: loadBots,
    activeBots: bots.filter(bot => bot.status === 'active').length,
    totalBots: bots.length
  };
};
