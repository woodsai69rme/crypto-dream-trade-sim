
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

interface AccountFollowingSettings {
  minConfidence: number;
  maxPositionSize: number;
  autoExecute: boolean;
  followRatio: number;
  riskMultiplier: number;
  delayMs: number;
  isActive: boolean;
}

export const useRealTimeTradeFollowing = () => {
  const { user } = useAuth();
  const { accounts, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();

  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [accountSettings, setAccountSettings] = useState<Record<string, AccountFollowingSettings>>({});
  const [stats, setStats] = useState({
    totalSignals: 0,
    executedTrades: 0,
    successRate: 0,
    avgLatency: 0,
    accountStats: {} as Record<string, { trades: number; success: number; lastTrade: string }>
  });

  // Initialize settings for all accounts
  useEffect(() => {
    if (accounts.length > 0) {
      const newSettings: Record<string, AccountFollowingSettings> = {};
      
      accounts.forEach((account, index) => {
        // Stagger settings to diversify trading behavior
        newSettings[account.id] = {
          minConfidence: 65 + (index * 5), // Different confidence thresholds
          maxPositionSize: account.balance * 0.1, // 10% of account balance
          autoExecute: true,
          followRatio: 0.8 + (index * 0.1), // Varying follow ratios
          riskMultiplier: 1.0 - (index * 0.1), // Different risk levels
          delayMs: index * 300, // Staggered execution
          isActive: true
        };
      });
      
      setAccountSettings(newSettings);
      console.log('Initialized settings for accounts:', Object.keys(newSettings));
    }
  }, [accounts]);

  // Generate realistic trading signals
  useEffect(() => {
    if (!isActive) return;

    const generateSignal = () => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX'];
      const sides: ('buy' | 'sell')[] = ['buy', 'sell'];
      const sources = ['AI Analysis', 'Technical Indicator', 'Market Sentiment', 'Volume Analysis'];
      
      const signal: TradeSignal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: sides[Math.floor(Math.random() * sides.length)],
        price: 1000 + Math.random() * 50000,
        amount: 0.01 + Math.random() * 0.5,
        confidence: 50 + Math.random() * 50,
        source: sources[Math.floor(Math.random() * sources.length)],
        reasoning: `Technical analysis suggests ${sides[Math.floor(Math.random() * sides.length)]} opportunity`,
        timestamp: new Date().toISOString()
      };

      setSignals(prev => [signal, ...prev.slice(0, 49)]);
      setStats(prev => ({ ...prev, totalSignals: prev.totalSignals + 1 }));
      
      // Process signal across all accounts
      handleNewSignal(signal);
    };

    // Generate signals every 3-8 seconds for more activity
    const interval = setInterval(generateSignal, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [isActive, accounts]);

  const handleNewSignal = useCallback(async (signal: TradeSignal) => {
    console.log('Processing signal across all accounts:', signal);
    
    // Process signal for each account with individual settings
    const tradePromises = accounts.map(async (account, index) => {
      const settings = accountSettings[account.id];
      if (!settings?.isActive || !settings.autoExecute) {
        console.log(`Skipping account ${account.account_name} - inactive or manual mode`);
        return null;
      }
      
      if (signal.confidence < settings.minConfidence) {
        console.log(`Skipping account ${account.account_name} - low confidence: ${signal.confidence} < ${settings.minConfidence}`);
        return null;
      }

      try {
        const startTime = Date.now();
        
        // Calculate position size based on account-specific settings
        const baseAmount = signal.amount * settings.followRatio * settings.riskMultiplier;
        const maxAmount = Math.min(baseAmount, settings.maxPositionSize / signal.price);
        
        // Ensure minimum viable trade size
        const finalAmount = Math.max(maxAmount, 0.001);

        // Add staggered delay to prevent simultaneous execution
        await new Promise(resolve => setTimeout(resolve, settings.delayMs + Math.random() * 200));

        console.log(`Executing trade for ${account.account_name}:`, {
          symbol: signal.symbol,
          side: signal.side,
          amount: finalAmount,
          price: signal.price,
          confidence: signal.confidence
        });

        const success = await executeTrade({
          symbol: signal.symbol,
          side: signal.side,
          amount: finalAmount,
          price: signal.price,
          type: 'market'
        });

        if (success) {
          const latency = Date.now() - startTime;
          
          // Update account-specific stats
          setStats(prev => ({
            ...prev,
            executedTrades: prev.executedTrades + 1,
            avgLatency: (prev.avgLatency + latency) / 2,
            accountStats: {
              ...prev.accountStats,
              [account.id]: {
                trades: (prev.accountStats[account.id]?.trades || 0) + 1,
                success: (prev.accountStats[account.id]?.success || 0) + 1,
                lastTrade: new Date().toLocaleTimeString()
              }
            }
          }));

          // Log successful trade
          await supabase
            .from('comprehensive_audit')
            .insert({
              user_id: user?.id,
              account_id: account.id,
              action_type: 'trade_followed',
              entity_type: 'trade_signal',
              entity_id: signal.id,
              metadata: {
                signal_id: signal.id,
                symbol: signal.symbol,
                side: signal.side,
                execution_latency: latency,
                executed_amount: finalAmount,
                confidence: signal.confidence,
                account_name: account.account_name
              } as any
            });

          console.log(`✅ Trade executed successfully for ${account.account_name}`);
          return { account: account.account_name, success: true, amount: finalAmount };
        } else {
          console.log(`❌ Trade failed for ${account.account_name}`);
          return { account: account.account_name, success: false, error: 'Execution failed' };
        }
      } catch (error) {
        console.error(`Error executing trade for ${account.account_name}:`, error);
        return { account: account.account_name, success: false, error: error.message };
      }
    });

    // Execute all trades and log results
    const results = await Promise.allSettled(tradePromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    console.log(`Signal processed: ${successful}/${accounts.length} accounts executed trades`);
    
  }, [accounts, accountSettings, executeTrade, user]);

  const updateAccountSettings = useCallback((accountId: string, settings: Partial<AccountFollowingSettings>) => {
    setAccountSettings(prev => ({
      ...prev,
      [accountId]: { ...prev[accountId], ...settings }
    }));
    console.log(`Updated settings for account ${accountId}:`, settings);
  }, []);

  const startFollowing = useCallback(() => {
    setIsActive(true);
    
    // Ensure all accounts have active settings
    accounts.forEach(account => {
      if (!accountSettings[account.id]?.isActive) {
        updateAccountSettings(account.id, { isActive: true });
      }
    });
    
    toast({
      title: "Trade Following Started",
      description: `Active on all ${accounts.length} accounts with staggered execution`,
    });
    
    console.log('Trade following started for accounts:', accounts.map(a => a.account_name));
  }, [accounts, accountSettings, updateAccountSettings, toast]);

  const stopFollowing = useCallback(() => {
    setIsActive(false);
    setSignals([]);
    
    toast({
      title: "Trade Following Stopped",
      description: "All accounts paused from following trades",
    });
    
    console.log('Trade following stopped for all accounts');
  }, [toast]);

  const getAccountStats = useCallback(() => {
    return accounts.map(account => ({
      accountId: account.id,
      accountName: account.account_name,
      balance: account.balance,
      settings: accountSettings[account.id],
      stats: stats.accountStats[account.id] || { trades: 0, success: 0, lastTrade: 'Never' }
    }));
  }, [accounts, accountSettings, stats]);

  return {
    signals,
    isActive,
    accountSettings,
    stats,
    startFollowing,
    stopFollowing,
    updateAccountSettings,
    handleNewSignal,
    getAccountStats,
    activeAccounts: accounts.filter(acc => accountSettings[acc.id]?.isActive).length,
    totalAccounts: accounts.length
  };
};
