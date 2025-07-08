import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  ai_model: string;
  target_symbols: string[];
  status: 'active' | 'paused' | 'stopped';
  confidence_threshold: number;
  last_signal_at?: string;
  performance: {
    win_rate: number;
    total_trades: number;
    daily_pnl: number;
  };
}

interface EnsembleSignal {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  votes: BotVote[];
  consensus_strength: number;
  reasoning: string;
}

interface BotVote {
  bot_id: string;
  bot_name: string;
  strategy: string;
  confidence: number;
  reasoning: string;
  weight: number;
}

interface MarketConditions {
  volatility: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'sideways';
  volume: 'low' | 'medium' | 'high';
  sentiment: number; // -1 to 1
}

export const useAIEnsembleTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bots, setBots] = useState<TradingBot[]>([]);
  const [marketConditions, setMarketConditions] = useState<MarketConditions>({
    volatility: 'medium',
    trend: 'sideways',
    volume: 'medium',
    sentiment: 0
  });
  const [isEnsembleActive, setIsEnsembleActive] = useState(false);
  const [signals, setSignals] = useState<EnsembleSignal[]>([]);

  // Fetch active trading bots
  const fetchActiveBots = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setBots((data || []).map(bot => ({
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        ai_model: bot.ai_model,
        target_symbols: bot.target_symbols,
        status: bot.status as 'active' | 'paused' | 'stopped',
        confidence_threshold: 70,
        performance: typeof bot.performance === 'object' && bot.performance ? bot.performance as any : { win_rate: 0, total_trades: 0, daily_pnl: 0 }
      })));
    } catch (error) {
      console.error('Error fetching bots:', error);
    }
  }, [user]);

  // Analyze market conditions
  const analyzeMarketConditions = useCallback(async () => {
    try {
      // Fetch recent market data
      const { data: marketData, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate volatility, trend, and volume
      const conditions = calculateMarketConditions(marketData || []);
      setMarketConditions(conditions);

    } catch (error) {
      console.error('Error analyzing market conditions:', error);
    }
  }, []);

  const calculateMarketConditions = (marketData: any[]): MarketConditions => {
    // Simplified market analysis - in production, this would be more sophisticated
    const volatility = Math.random() > 0.5 ? 'high' : 'medium';
    const trend = Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'sideways';
    const volume = Math.random() > 0.5 ? 'high' : 'medium';
    const sentiment = (Math.random() - 0.5) * 2; // -1 to 1

    return { volatility, trend, volume, sentiment };
  };

  // Generate ensemble trading signal
  const generateEnsembleSignal = useCallback(async (symbol: string): Promise<EnsembleSignal | null> => {
    const activeBots = bots.filter(bot => 
      bot.status === 'active' && 
      bot.target_symbols.includes(symbol)
    );

    if (activeBots.length < 2) return null;

    const votes: BotVote[] = [];
    
    // Collect votes from each bot
    for (const bot of activeBots) {
      const vote = await generateBotVote(bot, symbol);
      if (vote) votes.push(vote);
    }

    if (votes.length < 2) return null;

    // Calculate ensemble decision
    const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const buyVotes = votes.filter(vote => vote.confidence > 0);
    const sellVotes = votes.filter(vote => vote.confidence < 0);

    const buyWeight = buyVotes.reduce((sum, vote) => sum + (vote.confidence * vote.weight), 0);
    const sellWeight = sellVotes.reduce((sum, vote) => sum + (Math.abs(vote.confidence) * vote.weight), 0);

    const netWeight = (buyWeight - sellWeight) / totalWeight;
    const consensusStrength = Math.abs(netWeight);
    
    if (consensusStrength < 0.6) return null; // Require strong consensus

    const side: 'buy' | 'sell' = netWeight > 0 ? 'buy' : 'sell';
    const confidence = Math.min(consensusStrength * 100, 95);
    
    // Get current price (simplified)
    const price = 50000 + Math.random() * 20000;
    const amount = 0.01 + Math.random() * 0.1;

    const reasoning = generateEnsembleReasoning(votes, marketConditions, side);

    return {
      symbol,
      side,
      price,
      amount,
      confidence,
      votes,
      consensus_strength: consensusStrength,
      reasoning
    };
  }, [bots, marketConditions]);

  const generateBotVote = async (bot: TradingBot, symbol: string): Promise<BotVote | null> => {
    // Simulate bot analysis based on strategy and market conditions
    const baseConfidence = getStrategyConfidence(bot.strategy, marketConditions);
    const performanceWeight = Math.min(bot.performance.win_rate / 100, 1);
    
    // Random confidence adjustment
    const confidence = baseConfidence + (Math.random() - 0.5) * 40;
    
    if (Math.abs(confidence) < 30) return null; // Bot not confident enough

    const weight = performanceWeight * (1 + bot.performance.total_trades / 1000);
    const reasoning = generateBotReasoning(bot.strategy, symbol, confidence, marketConditions);

    return {
      bot_id: bot.id,
      bot_name: bot.name,
      strategy: bot.strategy,
      confidence,
      reasoning,
      weight
    };
  };

  const getStrategyConfidence = (strategy: string, conditions: MarketConditions): number => {
    // Strategy performance under different market conditions
    const strategyMatrix = {
      'trend-following': conditions.trend === 'bullish' ? 50 : conditions.trend === 'bearish' ? -50 : -20,
      'grid-trading': conditions.volatility === 'low' ? 40 : -20,
      'momentum': conditions.volume === 'high' && conditions.trend !== 'sideways' ? 60 : -30,
      'sentiment': conditions.sentiment * 50,
      'arbitrage': conditions.volatility === 'high' ? 30 : 10,
      'scalping': conditions.volatility === 'medium' ? 40 : -10,
      'mean-reversion': conditions.trend === 'sideways' ? 50 : -40,
      'breakout': conditions.volume === 'high' ? 55 : -25,
      'contrarian': conditions.sentiment < -0.5 ? 60 : conditions.sentiment > 0.5 ? -60 : 0
    };

    return strategyMatrix[strategy as keyof typeof strategyMatrix] || 0;
  };

  const generateBotReasoning = (strategy: string, symbol: string, confidence: number, conditions: MarketConditions): string => {
    const reasons = {
      'trend-following': `${symbol} trend momentum ${confidence > 0 ? 'bullish' : 'bearish'} with ${conditions.trend} market trend`,
      'grid-trading': `${symbol} price at optimal ${confidence > 0 ? 'support' : 'resistance'} level for grid strategy`,
      'momentum': `${symbol} showing strong ${confidence > 0 ? 'upward' : 'downward'} momentum with ${conditions.volume} volume`,
      'sentiment': `Social sentiment for ${symbol} indicates ${confidence > 0 ? 'bullish' : 'bearish'} sentiment shift`,
      'arbitrage': `${symbol} price inefficiency detected across exchanges`,
      'scalping': `${symbol} micro-trend ${confidence > 0 ? 'reversal' : 'continuation'} pattern identified`,
      'mean-reversion': `${symbol} price deviation suggests ${confidence > 0 ? 'oversold' : 'overbought'} condition`,
      'breakout': `${symbol} ${confidence > 0 ? 'breaking resistance' : 'breaking support'} with volume confirmation`,
      'contrarian': `${symbol} market sentiment extreme suggests ${confidence > 0 ? 'reversal up' : 'reversal down'}`
    };

    return reasons[strategy as keyof typeof reasons] || `AI analysis suggests ${confidence > 0 ? 'buy' : 'sell'} ${symbol}`;
  };

  const generateEnsembleReasoning = (votes: BotVote[], conditions: MarketConditions, side: 'buy' | 'sell'): string => {
    const strategies = votes.map(v => v.strategy).join(', ');
    const avgConfidence = votes.reduce((sum, v) => sum + Math.abs(v.confidence), 0) / votes.length;
    
    return `Ensemble decision (${side.toUpperCase()}) with ${avgConfidence.toFixed(1)}% avg confidence. ` +
           `Strategies: ${strategies}. Market: ${conditions.trend} trend, ${conditions.volatility} volatility. ` +
           `${votes.length} bots reached consensus.`;
  };

  // Start ensemble trading system
  const startEnsembleTrading = useCallback(() => {
    if (bots.length < 3) {
      toast({
        title: "Insufficient Bots",
        description: "Need at least 3 active bots for ensemble trading",
        variant: "destructive",
      });
      return;
    }

    setIsEnsembleActive(true);
    
    // Generate signals every 5-10 seconds
    const interval = setInterval(async () => {
      if (!isEnsembleActive) return;

      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      const signal = await generateEnsembleSignal(symbol);
      if (signal) {
        setSignals(prev => [signal, ...prev.slice(0, 19)]); // Keep last 20 signals
      }
    }, 5000 + Math.random() * 5000);

    toast({
      title: "Ensemble Trading Started",
      description: `AI ensemble system active with ${bots.length} bots`,
    });

    return () => clearInterval(interval);
  }, [bots, isEnsembleActive, toast]);

  const stopEnsembleTrading = useCallback(() => {
    setIsEnsembleActive(false);
    toast({
      title: "Ensemble Trading Stopped",
      description: "AI ensemble system has been deactivated",
    });
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchActiveBots();
      analyzeMarketConditions();
      
      // Update market conditions every 30 seconds
      const interval = setInterval(analyzeMarketConditions, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchActiveBots, analyzeMarketConditions]);

  return {
    bots,
    marketConditions,
    isEnsembleActive,
    signals,
    startEnsembleTrading,
    stopEnsembleTrading,
    generateEnsembleSignal,
    fetchActiveBots
  };
};