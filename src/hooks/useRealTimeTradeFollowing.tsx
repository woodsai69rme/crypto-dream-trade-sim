
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

  // Initialize settings for all accounts with proper distribution
  useEffect(() => {
    if (accounts.length > 0) {
      const newSettings: Record<string, AccountFollowingSettings> = {};
      
      accounts.forEach((account, index) => {
        // Create distinct settings for each account to ensure different behavior
        newSettings[account.id] = {
          minConfidence: 60 + (index * 10), // Different confidence thresholds: 60%, 70%, 80%
          maxPositionSize: account.balance * (0.15 + index * 0.05), // Different position sizes
          autoExecute: true,
          followRatio: 0.7 + (index * 0.15), // Different follow ratios: 70%, 85%, 100%
          riskMultiplier: 1.2 - (index * 0.2), // Different risk levels: 1.2, 1.0, 0.8
          delayMs: index * 500 + Math.random() * 300, // Staggered execution with randomness
          isActive: true // Ensure all accounts are active by default
        };
      });
      
      setAccountSettings(newSettings);
      console.log('✅ Initialized distinct settings for all accounts:', Object.keys(newSettings));
    }
  }, [accounts]);

  // Enhanced signal generation with more realistic patterns
  useEffect(() => {
    if (!isActive || accounts.length === 0) return;

    const generateSignal = () => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX', 'MATIC', 'ATOM'];
      const sides: ('buy' | 'sell')[] = ['buy', 'sell'];
      const sources = ['AI Analysis', 'Technical Indicator', 'Market Sentiment', 'Volume Analysis', 'Whale Activity'];
      
      // Create more realistic price ranges per symbol
      const priceRanges = {
        BTC: { min: 40000, max: 70000 },
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

      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const priceRange = priceRanges[symbol as keyof typeof priceRanges];
      const price = priceRange.min + Math.random() * (priceRange.max - priceRange.min);
      
      const signal: TradeSignal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        price: Math.round(price * 100) / 100,
        amount: 0.001 + Math.random() * 0.1, // Smaller, more realistic amounts
        confidence: 50 + Math.random() * 50,
        source: sources[Math.floor(Math.random() * sources.length)],
        reasoning: `${side === 'buy' ? 'Bullish' : 'Bearish'} signal detected for ${symbol}`,
        timestamp: new Date().toISOString()
      };

      setSignals(prev => [signal, ...prev.slice(0, 49)]);
      setStats(prev => ({ ...prev, totalSignals: prev.totalSignals + 1 }));
      
      // Process signal with enhanced error handling
      handleNewSignal(signal);
    };

    // Generate signals every 5-10 seconds for more realistic trading
    const interval = setInterval(generateSignal, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [isActive, accounts, accountSettings]);

  const handleNewSignal = useCallback(async (signal: TradeSignal) => {
    console.log(`🔄 Processing signal ${signal.id} for ${signal.symbol} across ${accounts.length} accounts`);
    
    if (accounts.length === 0) {
      console.warn('❌ No accounts available for trade execution');
      return;
    }

    let totalExecuted = 0;
    let totalAttempted = 0;

    // Process each account individually with proper error handling
    for (const account of accounts) {
      totalAttempted++;
      const settings = accountSettings[account.id];
      
      if (!settings) {
        console.warn(`⚠️ No settings found for account ${account.account_name}`);
        continue;
      }

      if (!settings.isActive || !settings.autoExecute) {
        console.log(`⏭️ Skipping account ${account.account_name} - inactive or manual mode`);
        continue;
      }
      
      if (signal.confidence < settings.minConfidence) {
        console.log(`⏭️ Skipping account ${account.account_name} - low confidence: ${signal.confidence} < ${settings.minConfidence}`);
        continue;
      }

      try {
        const startTime = Date.now();
        
        // Calculate position size with account-specific settings
        const baseAmount = signal.amount * settings.followRatio * settings.riskMultiplier;
        const maxAmount = Math.min(baseAmount, settings.maxPositionSize / signal.price);
        const finalAmount = Math.max(maxAmount, 0.001);

        // Add staggered delay to prevent simultaneous execution
        const delay = settings.delayMs + Math.random() * 200;
        await new Promise(resolve => setTimeout(resolve, delay));

        console.log(`💰 Executing trade for ${account.account_name}:`, {
          symbol: signal.symbol,
          side: signal.side,
          amount: finalAmount,
          price: signal.price,
          confidence: signal.confidence,
          delay: delay
        });

        // Execute trade directly on this specific account using database function
        const { data, error } = await supabase.rpc('execute_paper_trade', {
          p_user_id: user!.id,
          p_account_id: account.id,
          p_symbol: signal.symbol,
          p_side: signal.side,
          p_amount: finalAmount,
          p_price: signal.price,
          p_trade_type: 'market',
          p_order_type: 'market'
        });

        if (error) throw error;

        const result = data as { success: boolean; error?: string; new_balance?: number };
        const success = result.success;

        if (success) {
          totalExecuted++;
          const latency = Date.now() - startTime;
          
          // Update account-specific stats
          setStats(prev => ({
            ...prev,
            executedTrades: prev.executedTrades + 1,
            avgLatency: Math.round((prev.avgLatency + latency) / 2),
            successRate: Math.round(((prev.executedTrades + 1) / (prev.totalSignals || 1)) * 100),
            accountStats: {
              ...prev.accountStats,
              [account.id]: {
                trades: (prev.accountStats[account.id]?.trades || 0) + 1,
                success: (prev.accountStats[account.id]?.success || 0) + 1,
                lastTrade: new Date().toLocaleTimeString()
              }
            }
          }));

          // Log successful trade to comprehensive audit
          await supabase
            .from('comprehensive_audit')
            .insert({
              user_id: user?.id,
              account_id: account.id,
              action_type: 'trade_executed',
              entity_type: 'trade_signal',
              entity_id: signal.id,
              metadata: {
                signal_id: signal.id,
                symbol: signal.symbol,
                side: signal.side,
                execution_latency: latency,
                executed_amount: finalAmount,
                confidence: signal.confidence,
                account_name: account.account_name,
                success: true
              } as any
            });

          console.log(`✅ Trade executed successfully for ${account.account_name} (${latency}ms)`);
        } else {
          console.log(`❌ Trade failed for ${account.account_name}`);
          
          // Log failed trade
          await supabase
            .from('comprehensive_audit')
            .insert({
              user_id: user?.id,
              account_id: account.id,
              action_type: 'trade_failed',
              entity_type: 'trade_signal',
              entity_id: signal.id,
              metadata: {
                signal_id: signal.id,
                symbol: signal.symbol,
                side: signal.side,
                account_name: account.account_name,
                success: false,
                error: 'Trade execution failed'
              } as any
            });
        }
      } catch (error) {
        console.error(`💥 Error executing trade for ${account.account_name}:`, error);
        
        // Log error to audit
        await supabase
          .from('comprehensive_audit')
          .insert({
            user_id: user?.id,
            account_id: account.id,
            action_type: 'trade_error',
            entity_type: 'trade_signal',
            entity_id: signal.id,
            metadata: {
              signal_id: signal.id,
              symbol: signal.symbol,
              side: signal.side,
              account_name: account.account_name,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            } as any
          });
      }
    }

    console.log(`📊 Signal ${signal.id} processed: ${totalExecuted}/${totalAttempted} accounts executed trades`);
    
    // Show toast notification for significant results
    if (totalExecuted > 0) {
      toast({
        title: "Trades Executed",
        description: `${totalExecuted}/${totalAttempted} accounts executed ${signal.side} ${signal.symbol}`,
      });
    }
    
  }, [accounts, accountSettings, executeTrade, user, toast]);

  const updateAccountSettings = useCallback((accountId: string, settings: Partial<AccountFollowingSettings>) => {
    setAccountSettings(prev => ({
      ...prev,
      [accountId]: { ...prev[accountId], ...settings }
    }));
    console.log(`⚙️ Updated settings for account ${accountId}:`, settings);
  }, []);

  const startFollowing = useCallback(() => {
    setIsActive(true);
    
    // Ensure all accounts have active settings
    const updatedSettings = { ...accountSettings };
    accounts.forEach(account => {
      if (!updatedSettings[account.id]) {
        updatedSettings[account.id] = {
          minConfidence: 65,
          maxPositionSize: account.balance * 0.1,
          autoExecute: true,
          followRatio: 0.8,
          riskMultiplier: 1.0,
          delayMs: Math.random() * 1000,
          isActive: true
        };
      } else {
        updatedSettings[account.id].isActive = true;
      }
    });
    
    setAccountSettings(updatedSettings);
    
    toast({
      title: "Trade Following Started",
      description: `Active on all ${accounts.length} accounts with distributed execution`,
    });
    
    console.log(`🚀 Trade following started for ${accounts.length} accounts:`, accounts.map(a => a.account_name));
  }, [accounts, accountSettings, toast]);

  const stopFollowing = useCallback(() => {
    setIsActive(false);
    setSignals([]);
    
    toast({
      title: "Trade Following Stopped",
      description: "All accounts paused from following trades",
    });
    
    console.log('🛑 Trade following stopped for all accounts');
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
