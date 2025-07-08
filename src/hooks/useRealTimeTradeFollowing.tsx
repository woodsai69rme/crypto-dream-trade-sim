import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMultipleAccounts } from './useMultipleAccounts';
import { useToast } from './use-toast';

interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  source: string;
  reasoning: string;
  bot_id?: string;
  account_id?: string;
  timestamp: string;
}

interface FollowingSettings {
  minConfidence: number;
  maxPositionSize: number;
  autoExecute: boolean;
  followRatio: number;
  riskMultiplier: number;
  delayMs: number;
}

export const useRealTimeTradeFollowing = () => {
  const { user } = useAuth();
  const { accounts, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();

  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [followingSettings, setFollowingSettings] = useState<Record<string, FollowingSettings>>({});
  const [stats, setStats] = useState({
    totalSignals: 0,
    executedTrades: 0,
    successRate: 0,
    avgLatency: 0
  });

  // WebSocket connection for real-time signals
  useEffect(() => {
    if (!isActive || !user) return;

    const channel = supabase
      .channel('trade-signals')
      .on('broadcast', { event: 'new-signal' }, (payload) => {
        const signal = payload.signal as TradeSignal;
        handleNewSignal(signal);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isActive, user]);

  const handleNewSignal = useCallback(async (signal: TradeSignal) => {
    console.log('New trade signal received:', signal);
    
    setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals
    setStats(prev => ({ ...prev, totalSignals: prev.totalSignals + 1 }));

    // Execute signal across all accounts with following enabled
    for (const account of accounts) {
      const accountSettings = followingSettings[account.id];
      if (!accountSettings?.autoExecute) continue;
      
      if (signal.confidence < accountSettings.minConfidence) continue;

      try {
        const startTime = Date.now();
        
        // Calculate position size based on settings
        const adjustedAmount = signal.amount * accountSettings.followRatio * accountSettings.riskMultiplier;
        const maxAmount = Math.min(adjustedAmount, accountSettings.maxPositionSize / signal.price);

        // Add delay to prevent all accounts from trading simultaneously
        setTimeout(async () => {
          const success = await executeTrade({
            symbol: signal.symbol,
            side: signal.side,
            amount: maxAmount,
            price: signal.price,
            type: 'market'
          });

          if (success) {
            const latency = Date.now() - startTime;
            setStats(prev => ({
              ...prev,
              executedTrades: prev.executedTrades + 1,
              avgLatency: (prev.avgLatency + latency) / 2
            }));

            // Log successful trade following
            await supabase
              .from('comprehensive_audit')
              .insert({
                user_id: user.id,
                account_id: account.id,
                action_type: 'trade_followed',
                entity_type: 'trade_signal',
                entity_id: signal.id,
                metadata: {
                  signal_id: signal.id,
                  symbol: signal.symbol,
                  side: signal.side,
                  execution_latency: latency,
                  executed_amount: maxAmount,
                  confidence: signal.confidence
                } as any
              });
          }
        }, accountSettings.delayMs + Math.random() * 200);

      } catch (error) {
        console.error('Error executing follow trade:', error);
      }
    }
  }, [accounts, followingSettings, executeTrade, user]);

  const broadcastSignal = useCallback(async (signal: TradeSignal) => {
    try {
      await supabase
        .channel('trade-signals')
        .send({
          type: 'broadcast',
          event: 'new-signal',
          signal
        });
    } catch (error) {
      console.error('Error broadcasting signal:', error);
    }
  }, []);

  const updateFollowingSettings = useCallback((accountId: string, settings: FollowingSettings) => {
    setFollowingSettings(prev => ({
      ...prev,
      [accountId]: settings
    }));
  }, []);

  const startFollowing = useCallback(() => {
    setIsActive(true);
    
    // Initialize default settings for all accounts
    accounts.forEach(account => {
      if (!followingSettings[account.id]) {
        setFollowingSettings(prev => ({
          ...prev,
          [account.id]: {
            minConfidence: 70,
            maxPositionSize: 1000,
            autoExecute: true,
            followRatio: 1.0,
            riskMultiplier: 1.0,
            delayMs: 500
          }
        }));
      }
    });

    toast({
      title: "Trade Following Started",
      description: "Real-time trade following is now active across all accounts",
    });
  }, [accounts, followingSettings, toast]);

  const stopFollowing = useCallback(() => {
    setIsActive(false);
    setSignals([]);
    
    toast({
      title: "Trade Following Stopped",
      description: "Real-time trade following has been disabled",
    });
  }, [toast]);

  const clearSignals = useCallback(() => {
    setSignals([]);
    setStats(prev => ({ ...prev, totalSignals: 0, executedTrades: 0 }));
  }, []);

  return {
    signals,
    isActive,
    followingSettings,
    stats,
    startFollowing,
    stopFollowing,
    updateFollowingSettings,
    broadcastSignal,
    clearSignals,
    handleNewSignal
  };
};