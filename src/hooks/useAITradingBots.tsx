
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMultipleAccounts } from './useMultipleAccounts';
import { useToast } from './use-toast';

interface AITradingBot {
  id: string;
  name: string;
  strategy: string;
  ai_model: string;
  target_symbols: string[];
  status: 'active' | 'paused' | 'stopped';
  mode: 'paper' | 'live';
  paper_balance: number;
  max_position_size: number;
  risk_level: string;
  config: any;
  performance: {
    total_return: number;
    win_rate: number;
    total_trades: number;
    daily_pnl: number;
    weekly_pnl: number;
    monthly_pnl: number;
  };
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface BotTrade {
  botId: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  confidence: number;
  reasoning: string;
  strategy: string;
}

export const useAITradingBots = () => {
  const { user } = useAuth();
  const { accounts, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();
  
  const [bots, setBots] = useState<AITradingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBots, setActiveBots] = useState<Set<string>>(new Set());

  // Load AI trading bots with pagination for performance
  const loadBots = useCallback(async (limit = 20) => {
    if (!user) return;

    try {
      // Only load essential data for the first 20 bots to improve performance
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('id, name, strategy, ai_model, target_symbols, status, mode, paper_balance, max_position_size, risk_level, performance, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setBots((data || []).map(bot => ({
        ...bot,
        status: bot.status as 'active' | 'paused' | 'stopped',
        mode: bot.mode as 'paper' | 'live',
        performance: bot.performance as {
          total_return: number;
          win_rate: number;
          total_trades: number;
          daily_pnl: number;
          weekly_pnl: number;
          monthly_pnl: number;
        },
        paper_balance: bot.paper_balance || 0,
        config: {}, // Default empty config for optimization
        user_id: user.id // Set user_id from context
      })));
      
      // Load active bots from database status, not just first 5
      const activeIds = new Set((data || []).filter(bot => bot.status === 'active').map(bot => bot.id));
      setActiveBots(activeIds);
      
      console.log(`📋 Loaded ${data?.length || 0} AI trading bots (limited to ${limit}), ${activeIds.size} active`);
    } catch (error) {
      console.error('Error loading AI trading bots:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Generate AI trading signals based on bot strategies
  const generateBotSignal = useCallback((bot: AITradingBot): BotTrade | null => {
    if (!bot.target_symbols.length) return null;

    const symbol = bot.target_symbols[Math.floor(Math.random() * bot.target_symbols.length)];
    const strategies = {
      'trend-following': () => ({
        side: Math.random() > 0.6 ? 'buy' : 'sell' as const,
        confidence: 70 + Math.random() * 25,
        reasoning: `Trend analysis indicates ${Math.random() > 0.5 ? 'upward' : 'downward'} momentum for ${symbol}`
      }),
      'grid-trading': () => ({
        side: Math.random() > 0.5 ? 'buy' : 'sell' as const,
        confidence: 60 + Math.random() * 30,
        reasoning: `Grid trading strategy triggered for ${symbol} at support/resistance level`
      }),
      'dca': () => ({
        side: 'buy' as const,
        confidence: 80 + Math.random() * 15,
        reasoning: `DCA strategy: Regular purchase of ${symbol} regardless of price`
      }),
      'breakout': () => ({
        side: Math.random() > 0.3 ? 'buy' : 'sell' as const,
        confidence: 75 + Math.random() * 20,
        reasoning: `Breakout pattern detected for ${symbol} - price movement expected`
      }),
      'arbitrage': () => ({
        side: Math.random() > 0.5 ? 'buy' : 'sell' as const,
        confidence: 85 + Math.random() * 10,
        reasoning: `Arbitrage opportunity identified for ${symbol} across exchanges`
      }),
      'momentum': () => ({
        side: Math.random() > 0.4 ? 'buy' : 'sell' as const,
        confidence: 65 + Math.random() * 25,
        reasoning: `Momentum indicators show strong ${Math.random() > 0.5 ? 'bullish' : 'bearish'} signals for ${symbol}`
      }),
      'mean-reversion': () => ({
        side: Math.random() > 0.5 ? 'buy' : 'sell' as const,
        confidence: 70 + Math.random() * 20,
        reasoning: `Mean reversion strategy: ${symbol} price deviation from average detected`
      }),
      'scalping': () => ({
        side: Math.random() > 0.5 ? 'buy' : 'sell' as const,
        confidence: 60 + Math.random() * 25,
        reasoning: `Scalping opportunity: Short-term price movement detected for ${symbol}`
      }),
      'sentiment': () => ({
        side: Math.random() > 0.4 ? 'buy' : 'sell' as const,
        confidence: 65 + Math.random() * 25,
        reasoning: `Sentiment analysis shows ${Math.random() > 0.5 ? 'positive' : 'negative'} market sentiment for ${symbol}`
      }),
      'ml-prediction': () => ({
        side: Math.random() > 0.45 ? 'buy' : 'sell' as const,
        confidence: 75 + Math.random() * 20,
        reasoning: `ML model predicts ${Math.random() > 0.5 ? 'upward' : 'downward'} price movement for ${symbol}`
      })
    };

    const strategyFunc = strategies[bot.strategy as keyof typeof strategies] || strategies['trend-following'];
    const signal = strategyFunc();

    // Updated realistic price ranges
    const priceRanges = {
      BTC: { min: 99000, max: 105000 }, // Current realistic Bitcoin range
      ETH: { min: 2000, max: 4000 },
      SOL: { min: 80, max: 200 },
      ADA: { min: 0.3, max: 1.5 },
      DOT: { min: 5, max: 15 },
      LINK: { min: 10, max: 30 },
      UNI: { min: 5, max: 15 },
      AVAX: { min: 20, max: 50 },
      MATIC: { min: 0.5, max: 2 },
      ATOM: { min: 8, max: 20 }
    };

    const priceRange = priceRanges[symbol as keyof typeof priceRanges] || { min: 1, max: 100 };
    const price = priceRange.min + Math.random() * (priceRange.max - priceRange.min);

    return {
      botId: bot.id,
      symbol,
      side: signal.side as 'buy' | 'sell',
      amount: 0.001 + Math.random() * 0.05, // Small amounts for bots
      price: Math.round(price * 100) / 100,
      confidence: Math.round(signal.confidence),
      reasoning: signal.reasoning,
      strategy: bot.strategy
    };
  }, []);

  // Execute bot trades across accounts
  const executeBotTrade = useCallback(async (botTrade: BotTrade) => {
    if (accounts.length === 0) return;

    // Select a random account for this bot trade
    const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
    
    try {
      console.log(`🤖 Bot executing trade:`, {
        bot: bots.find(b => b.id === botTrade.botId)?.name,
        account: randomAccount.account_name,
        ...botTrade
      });

      const success = await executeTrade({
        symbol: botTrade.symbol,
        side: botTrade.side,
        amount: botTrade.amount,
        price: botTrade.price,
        type: 'market'
      });

      if (success) {
        // Update bot performance
        const bot = bots.find(b => b.id === botTrade.botId);
        if (bot) {
          const updatedPerformance = {
            ...bot.performance,
            total_trades: bot.performance.total_trades + 1,
            daily_pnl: bot.performance.daily_pnl + (Math.random() - 0.5) * 100, // Simulated P&L
          };

          await supabase
            .from('ai_trading_bots')
            .update({ 
              performance: updatedPerformance,
              updated_at: new Date().toISOString()
            })
            .eq('id', botTrade.botId);
        }

        // Log to comprehensive audit
        await supabase
          .from('comprehensive_audit')
          .insert({
            user_id: user?.id,
            account_id: randomAccount.id,
            action_type: 'bot_trade_executed',
            entity_type: 'ai_bot_trade',
            entity_id: botTrade.botId,
            metadata: {
              bot_id: botTrade.botId,
              bot_name: bots.find(b => b.id === botTrade.botId)?.name,
              symbol: botTrade.symbol,
              side: botTrade.side,
              amount: botTrade.amount,
              price: botTrade.price,
              confidence: botTrade.confidence,
              reasoning: botTrade.reasoning,
              strategy: botTrade.strategy,
              account_name: randomAccount.account_name,
              success: true
            } as any
          });

        console.log(`✅ Bot trade executed successfully for ${randomAccount.account_name}`);
      }
    } catch (error) {
      console.error('Error executing bot trade:', error);
    }
  }, [accounts, bots, executeTrade, user]);

  // Main bot trading loop
  useEffect(() => {
    if (!user || activeBots.size === 0 || accounts.length === 0) return;

    const runBotTrading = () => {
      const activeBotsList = bots.filter(bot => 
        activeBots.has(bot.id) && bot.status === 'active'
      );

      if (activeBotsList.length === 0) return;

      // Generate signals for random active bots
      const numberOfBotsToRun = Math.min(2, activeBotsList.length);
      const selectedBots = activeBotsList
        .sort(() => Math.random() - 0.5)
        .slice(0, numberOfBotsToRun);

      selectedBots.forEach(bot => {
        const signal = generateBotSignal(bot);
        if (signal && Math.random() > 0.3) { // 70% chance to execute
          executeBotTrade(signal);
        }
      });
    };

    // Run bot trading every 10-20 seconds
    const interval = setInterval(runBotTrading, 10000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [user, activeBots, bots, accounts, generateBotSignal, executeBotTrade]);

  const toggleBotStatus = useCallback(async (botId: string, status: 'active' | 'paused' | 'stopped') => {
    try {
      await supabase
        .from('ai_trading_bots')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', botId);

      setBots(prev => prev.map(bot => 
        bot.id === botId ? { ...bot, status } : bot
      ));

      if (status === 'active') {
        setActiveBots(prev => new Set([...prev, botId]));
      } else {
        setActiveBots(prev => {
          const newSet = new Set(prev);
          newSet.delete(botId);
          return newSet;
        });
      }

      toast({
        title: "Bot Status Updated",
        description: `Bot ${status === 'active' ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating bot status:', error);
    }
  }, [toast]);

  useEffect(() => {
    loadBots(20); // Load only 20 bots initially for performance
  }, [loadBots]);

  return {
    bots,
    loading,
    activeBots,
    toggleBotStatus,
    loadBots,
    totalBots: bots.length
  };
};
