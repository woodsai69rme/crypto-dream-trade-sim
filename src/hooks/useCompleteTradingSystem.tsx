
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMultipleAccounts } from './useMultipleAccounts';
import { useToast } from './use-toast';

interface SystemStats {
  activeAccounts: number;
  activeBots: number;
  followedTraders: number;
  totalTrades: number;
  totalVolume: number;
  systemUptime: number;
}

interface LiveTradeSignal {
  id: string;
  trader_name: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
  executed_accounts: string[];
}

export const useCompleteTradingSystem = () => {
  const { user } = useAuth();
  const { accounts, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();

  const [systemActive, setSystemActive] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    activeAccounts: 0,
    activeBots: 0,
    followedTraders: 0,
    totalTrades: 0,
    totalVolume: 0,
    systemUptime: 0
  });
  const [liveSignals, setLiveSignals] = useState<LiveTradeSignal[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch system stats
  const fetchSystemStats = useCallback(async () => {
    if (!user) return;

    try {
      const [accountsRes, botsRes, tradersRes, tradesRes] = await Promise.all([
        supabase.from('paper_trading_accounts').select('*').eq('user_id', user.id),
        supabase.from('ai_trading_bots').select('*').eq('user_id', user.id),
        supabase.from('trader_follows').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('paper_trades').select('total_value').eq('user_id', user.id)
      ]);

      const totalVolume = tradesRes.data?.reduce((sum, trade) => sum + (trade.total_value || 0), 0) || 0;

      setStats({
        activeAccounts: accountsRes.data?.length || 0,
        activeBots: botsRes.data?.filter(bot => bot.status === 'active').length || 0,
        followedTraders: tradersRes.data?.length || 0,
        totalTrades: tradesRes.data?.length || 0,
        totalVolume,
        systemUptime: systemActive ? Date.now() - (systemActive ? 0 : Date.now()) : 0
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  }, [user, systemActive]);

  // Generate live trading signals
  const generateLiveSignal = useCallback(() => {
    const traders = ['Michael Saylor', 'Plan B', 'Vitalik Buterin', 'CZ', 'Raoul Pal', 'Willy Woo'];
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'];
    const sides = ['buy', 'sell'] as const;
    
    const signal: LiveTradeSignal = {
      id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trader_name: traders[Math.floor(Math.random() * traders.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      side: sides[Math.floor(Math.random() * sides.length)],
      price: 45000 + Math.random() * 25000,
      amount: 0.1 + Math.random() * 2,
      confidence: 70 + Math.random() * 25,
      reasoning: generateSignalReasoning(),
      timestamp: new Date().toISOString(),
      executed_accounts: []
    };

    return signal;
  }, []);

  const generateSignalReasoning = () => {
    const reasons = [
      'Strong technical breakout with volume confirmation',
      'Bullish divergence detected on RSI with price support',
      'Major institutional accumulation observed',
      'Breaking above key resistance with momentum',
      'Oversold bounce expected from strong support level',
      'Whale activity suggests major move incoming',
      'Fed policy shift creating favorable conditions',
      'Network fundamentals showing strong growth',
      'Social sentiment reaching extreme levels',
      'Options flow indicating bullish positioning'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  // Execute trades across all accounts for a signal
  const executeSignalAcrossAccounts = useCallback(async (signal: LiveTradeSignal) => {
    const executedAccounts: string[] = [];

    for (const account of accounts) {
      try {
        // Simulate different risk tolerances per account
        const riskMultiplier = account.account_name === 'woods1' ? 0.5 : 
                             account.account_name === 'angry' ? 2.0 : 1.0;
        
        const adjustedAmount = signal.amount * riskMultiplier;
        
        // Only execute if confidence meets account threshold
        const confidenceThreshold = account.account_name === 'woods1' ? 85 : 
                                   account.account_name === 'angry' ? 65 : 75;
        
        if (signal.confidence >= confidenceThreshold) {
          const success = await executeTrade({
            symbol: signal.symbol,
            side: signal.side,
            amount: adjustedAmount,
            price: signal.price,
            type: 'market'
          });

          if (success) {
            executedAccounts.push(account.account_name);
            
            // Log to comprehensive audit
            await supabase.from('comprehensive_audit').insert({
              user_id: user?.id,
              account_id: account.id,
              action_type: 'trade_executed',
              entity_type: 'trader_signal',
              entity_id: signal.id,
              metadata: {
                signal_id: signal.id,
                trader_name: signal.trader_name,
                symbol: signal.symbol,
                side: signal.side,
                amount: adjustedAmount,
                price: signal.price,
                confidence: signal.confidence,
                reasoning: signal.reasoning,
                execution_time: new Date().toISOString()
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error executing trade for account ${account.account_name}:`, error);
      }
    }

    return executedAccounts;
  }, [accounts, executeTrade, user]);

  // Start the complete trading system
  const startSystem = useCallback(async () => {
    if (!user || accounts.length === 0) {
      toast({
        title: "System Not Ready",
        description: "Please ensure accounts are loaded before starting the system",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Activate all AI bots
      await supabase
        .from('ai_trading_bots')
        .update({ status: 'active' })
        .eq('user_id', user.id);

      // Enable copy trading for all followed traders
      await supabase
        .from('trader_follows')
        .update({ copy_trading_enabled: true })
        .eq('user_id', user.id);

      setSystemActive(true);

      // Start generating live signals every 3-8 seconds
      const signalInterval = setInterval(() => {
        if (!systemActive) return;

        const signal = generateLiveSignal();
        
        // Execute signal across accounts
        executeSignalAcrossAccounts(signal).then(executedAccounts => {
          const updatedSignal = { ...signal, executed_accounts: executedAccounts };
          setLiveSignals(prev => [updatedSignal, ...prev.slice(0, 49)]);
          
          if (executedAccounts.length > 0) {
            toast({
              title: `Trade Signal Executed`,
              description: `${signal.side.toUpperCase()} ${signal.symbol} executed on ${executedAccounts.length} account(s)`,
            });
          }
        });
      }, 3000 + Math.random() * 5000);

      // Update stats every 5 seconds
      const statsInterval = setInterval(fetchSystemStats, 5000);

      toast({
        title: "Complete Trading System Activated",
        description: `All ${accounts.length} accounts, 20 bots, and 20 traders are now active`,
      });

      // Cleanup on unmount or system stop
      return () => {
        clearInterval(signalInterval);
        clearInterval(statsInterval);
      };

    } catch (error) {
      console.error('Error starting system:', error);
      toast({
        title: "System Start Failed",
        description: "Unable to start the complete trading system",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, accounts, systemActive, generateLiveSignal, executeSignalAcrossAccounts, fetchSystemStats, toast]);

  // Stop the system
  const stopSystem = useCallback(async () => {
    if (!user) return;

    try {
      // Pause all AI bots
      await supabase
        .from('ai_trading_bots')
        .update({ status: 'paused' })
        .eq('user_id', user.id);

      // Disable copy trading
      await supabase
        .from('trader_follows')
        .update({ copy_trading_enabled: false })
        .eq('user_id', user.id);

      setSystemActive(false);
      setLiveSignals([]);

      toast({
        title: "System Stopped",
        description: "All trading activities have been paused",
      });
    } catch (error) {
      console.error('Error stopping system:', error);
    }
  }, [user, toast]);

  // Initialize stats on mount
  useEffect(() => {
    fetchSystemStats();
  }, [fetchSystemStats]);

  return {
    systemActive,
    stats,
    liveSignals,
    loading,
    startSystem,
    stopSystem,
    fetchSystemStats
  };
};
