
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface AIBot {
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

interface MarketConditions {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'medium' | 'high';
  sentiment: number; // -100 to 100
}

interface TradingSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  bot_votes: number;
  reasoning: string;
  timestamp: string;
}

export const useAIEnsembleTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bots, setBots] = useState<AIBot[]>([]);
  const [isEnsembleActive, setIsEnsembleActive] = useState(false);
  const [marketConditions, setMarketConditions] = useState<MarketConditions>({
    trend: 'sideways',
    volatility: 'medium',
    volume: 'medium',
    sentiment: 0
  });
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load AI bots from database
  const loadBots = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBots: AIBot[] = data?.map(bot => ({
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        status: bot.status as 'active' | 'paused' | 'error',
        performance: bot.performance || {
          win_rate: 0,
          total_return: 0,
          total_trades: 0,
          daily_pnl: 0
        },
        confidence_threshold: 75,
        risk_level: bot.risk_level,
        target_symbols: bot.target_symbols || []
      })) || [];

      setBots(formattedBots);
    } catch (error) {
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

  // Generate market conditions (simulated)
  const updateMarketConditions = useCallback(() => {
    const trends = ['bullish', 'bearish', 'sideways'] as const;
    const volatilities = ['low', 'medium', 'high'] as const;
    const volumes = ['low', 'medium', 'high'] as const;

    setMarketConditions({
      trend: trends[Math.floor(Math.random() * trends.length)],
      volatility: volatilities[Math.floor(Math.random() * volatilities.length)],
      volume: volumes[Math.floor(Math.random() * volumes.length)],
      sentiment: Math.floor(Math.random() * 200) - 100 // -100 to 100
    });
  }, []);

  // Generate AI ensemble signals
  const generateEnsembleSignal = useCallback(() => {
    if (!isEnsembleActive || bots.length === 0) return;

    const activeBots = bots.filter(bot => bot.status === 'active');
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'];
    const sides = ['buy', 'sell'] as const;

    // Simulate bot voting
    const botVotes = Math.floor(Math.random() * activeBots.length) + 1;
    const confidence = 60 + Math.random() * 35; // 60-95%

    const signal: TradingSignal = {
      id: `signal-${Date.now()}`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      side: sides[Math.floor(Math.random() * sides.length)],
      price: 45000 + Math.random() * 25000,
      amount: 0.1 + Math.random() * 0.9,
      confidence,
      bot_votes: botVotes,
      reasoning: generateSignalReasoning(marketConditions),
      timestamp: new Date().toISOString()
    };

    setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals

    // Log signal to audit
    if (user) {
      supabase.from('comprehensive_audit').insert({
        user_id: user.id,
        action_type: 'ai_signal_generated',
        entity_type: 'trading_signal',
        entity_id: signal.id,
        metadata: {
          signal,
          market_conditions: marketConditions,
          bot_votes: botVotes,
          active_bots: activeBots.length
        }
      });
    }
  }, [isEnsembleActive, bots, marketConditions, user]);

  const generateSignalReasoning = (conditions: MarketConditions) => {
    const reasons = [
      `${conditions.trend} market trend with ${conditions.volatility} volatility suggests strong momentum`,
      `Technical analysis shows breakout potential with ${conditions.volume} volume confirmation`,
      `AI ensemble detected pattern matching with ${Math.floor(Math.random() * 30 + 70)}% historical accuracy`,
      `Risk-adjusted signal based on current ${conditions.trend} market conditions`,
      `Multi-timeframe analysis confirms entry point with favorable risk/reward ratio`,
      `Sentiment analysis (${conditions.sentiment > 0 ? 'positive' : 'negative'}) aligns with technical indicators`,
      `Volume profile analysis indicates institutional ${conditions.volume === 'high' ? 'accumulation' : 'interest'}`,
      `Correlation analysis with major assets suggests independent movement opportunity`
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  // Start/stop ensemble trading
  const toggleEnsemble = useCallback(async (active: boolean) => {
    setIsEnsembleActive(active);

    if (active) {
      // Activate all bots
      await supabase
        .from('ai_trading_bots')
        .update({ status: 'active' })
        .eq('user_id', user?.id);

      toast({
        title: "AI Ensemble Activated",
        description: `${bots.length} trading bots are now generating signals`,
      });
    } else {
      // Pause all bots
      await supabase
        .from('ai_trading_bots')
        .update({ status: 'paused' })
        .eq('user_id', user?.id);

      toast({
        title: "AI Ensemble Paused",
        description: "All trading bots have been paused",
      });
    }

    // Reload bot status
    loadBots();
  }, [user, bots.length, toast, loadBots]);

  // Update bot performance (simulated)
  const updateBotPerformance = useCallback(async () => {
    if (!user || bots.length === 0) return;

    const updatedBots = bots.map(bot => ({
      ...bot,
      performance: {
        ...bot.performance,
        win_rate: Math.max(0, Math.min(100, bot.performance.win_rate + (Math.random() - 0.5) * 2)),
        total_return: bot.performance.total_return + (Math.random() - 0.4) * 0.5,
        daily_pnl: (Math.random() - 0.4) * 100
      }
    }));

    setBots(updatedBots);

    // Update database periodically
    const randomBot = updatedBots[Math.floor(Math.random() * updatedBots.length)];
    await supabase
      .from('ai_trading_bots')
      .update({ performance: randomBot.performance })
      .eq('id', randomBot.id);
  }, [user, bots]);

  // Initialize and start intervals
  useEffect(() => {
    loadBots();
  }, [loadBots]);

  useEffect(() => {
    if (!isEnsembleActive) return;

    const marketInterval = setInterval(updateMarketConditions, 30000); // Every 30s
    const signalInterval = setInterval(generateEnsembleSignal, 8000); // Every 8s
    const performanceInterval = setInterval(updateBotPerformance, 60000); // Every 60s

    return () => {
      clearInterval(marketInterval);
      clearInterval(signalInterval);
      clearInterval(performanceInterval);
    };
  }, [isEnsembleActive, updateMarketConditions, generateEnsembleSignal, updateBotPerformance]);

  return {
    bots,
    isEnsembleActive,
    marketConditions,
    signals,
    loading,
    toggleEnsemble,
    loadBots,
    activeBots: bots.filter(bot => bot.status === 'active').length,
    totalSignals: signals.length,
    averageConfidence: signals.length > 0 
      ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length 
      : 0
  };
};
