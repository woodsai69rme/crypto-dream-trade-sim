
import { useState, useEffect, useCallback } from 'react';
import { useMultipleAccounts } from './useMultipleAccounts';
import { useSettings } from './useSettings';
import { useToast } from './use-toast';
import { TradeSignal } from '@/components/trading/TradeSignal';
import { supabase } from '@/integrations/supabase/client';

export interface TradeFollowingStats {
  totalSignals: number;
  executedTrades: number;
  successRate: number;
  lastSignalTime: string;
}

export const useRealTimeTradeFollowing = () => {
  const { accounts } = useMultipleAccounts();
  const { settings, updateSetting } = useSettings();
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [stats, setStats] = useState<TradeFollowingStats>({
    totalSignals: 0,
    executedTrades: 0,
    successRate: 0,
    lastSignalTime: 'Never'
  });

  // Check if following is enabled for each account
  const getAccountFollowingStatus = useCallback(() => {
    return accounts.map(account => ({
      accountId: account.id,
      accountName: account.account_name,
      isFollowing: settings[`following_${account.id}`] || false,
      confidenceThreshold: getConfidenceThreshold(account.risk_level)
    }));
  }, [accounts, settings]);

  const getConfidenceThreshold = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 80;
      case 'medium': return 75; 
      case 'high': return 70;
      case 'aggressive': return 60;
      default: return 75;
    }
  };

  const activeAccounts = getAccountFollowingStatus().filter(acc => acc.isFollowing).length;
  const totalAccounts = accounts.length;

  // Start trade following system
  const startFollowing = useCallback(async () => {
    console.log('🚀 Starting multi-account trade following system');
    
    // Enable following for all accounts
    const enablePromises = accounts.map(account => 
      updateSetting(`following_${account.id}`, true)
    );
    
    await Promise.all(enablePromises);
    setIsActive(true);
    
    toast({
      title: "Trade Following Started",
      description: `Synchronized trading activated across ${accounts.length} accounts`,
    });

    // Start signal generation
    generateRealTimeSignals();
  }, [accounts, updateSetting, toast]);

  // Stop trade following system
  const stopFollowing = useCallback(async () => {
    console.log('⏹️ Stopping multi-account trade following system');
    
    setIsActive(false);
    
    toast({
      title: "Trade Following Stopped",
      description: "Multi-account trading has been deactivated",
    });
  }, [toast]);

  // Generate realistic trading signals
  const generateRealTimeSignals = useCallback(() => {
    if (!isActive) return;

    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'UNI', 'AVAX', 'MATIC', 'DOT'];
    const sides = ['buy', 'sell'];
    
    const interval = setInterval(() => {
      if (!isActive) {
        clearInterval(interval);
        return;
      }

      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)] as 'buy' | 'sell';
      const confidence = Math.random() * 40 + 50; // 50-90% confidence
      const price = Math.random() * 1000 + 100;
      
      const signal: TradeSignal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        price,
        confidence,
        timestamp: new Date(),
        source: 'AI_ENSEMBLE',
        reasoning: `${confidence > 80 ? 'Strong' : 'Moderate'} ${side} signal for ${symbol} based on technical analysis`
      };

      setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals
      processSignalAcrossAccounts(signal);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalSignals: prev.totalSignals + 1,
        lastSignalTime: new Date().toLocaleTimeString()
      }));
      
    }, Math.random() * 4000 + 2000); // 2-6 seconds between signals

    return () => clearInterval(interval);
  }, [isActive]);

  // Process signal across all accounts with staggered execution
  const processSignalAcrossAccounts = async (signal: TradeSignal) => {
    console.log(`🔄 Processing signal ${signal.id} for ${signal.symbol} across ${accounts.length} accounts`);
    
    const accountStatuses = getAccountFollowingStatus();
    let executedCount = 0;

    for (let i = 0; i < accountStatuses.length; i++) {
      const accountStatus = accountStatuses[i];
      const account = accounts.find(acc => acc.id === accountStatus.accountId);
      
      if (!account || !accountStatus.isFollowing) {
        continue;
      }

      // Check confidence threshold
      if (signal.confidence < accountStatus.confidenceThreshold) {
        console.log(`⏭️ Skipping account ${account.account_name} - low confidence: ${signal.confidence} < ${accountStatus.confidenceThreshold}`);
        continue;
      }

      // Staggered execution delay (0-2 seconds between accounts)
      const delay = Math.random() * 2000;
      
      setTimeout(async () => {
        try {
          const amount = calculatePositionSize(account, signal);
          
          console.log(`💰 Executing trade for ${account.account_name}:`, {
            symbol: signal.symbol,
            side: signal.side,
            amount,
            price: signal.price,
            confidence: signal.confidence,
            delay
          });

          // Simulate trade execution
          const executionTime = Math.random() * 500 + 200;
          await new Promise(resolve => setTimeout(resolve, executionTime));
          
          console.log(`✅ Trade executed successfully for ${account.account_name} (${executionTime.toFixed(0)}ms)`);
          executedCount++;
          
          // Update stats
          setStats(prev => ({
            ...prev,
            executedTrades: prev.executedTrades + 1,
            successRate: ((prev.executedTrades + 1) / prev.totalSignals) * 100
          }));

        } catch (error) {
          console.error(`❌ Trade execution failed for ${account.account_name}:`, error);
        }
      }, delay);
    }

    // Log completion after all accounts processed
    setTimeout(() => {
      console.log(`📊 Signal ${signal.id} processed: ${executedCount}/${accountStatuses.filter(s => s.isFollowing).length} accounts executed trades`);
    }, 3000);
  };

  const calculatePositionSize = (account: any, signal: TradeSignal) => {
    const baseSize = account.balance * 0.02; // 2% of account balance
    const confidenceMultiplier = signal.confidence / 100;
    const riskMultiplier = getRiskMultiplier(account.risk_level);
    
    return baseSize * confidenceMultiplier * riskMultiplier / signal.price;
  };

  const getRiskMultiplier = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 0.5;
      case 'medium': return 1.0;
      case 'high': return 1.5;
      case 'aggressive': return 2.0;
      default: return 1.0;
    }
  };

  // Get account statistics
  const getAccountStats = useCallback(() => {
    return accounts.map(account => ({
      accountId: account.id,
      accountName: account.account_name,
      settings: {
        isActive: settings[`following_${account.id}`] || false,
        confidenceThreshold: getConfidenceThreshold(account.risk_level)
      },
      stats: {
        trades: Math.floor(Math.random() * 50) + 10,
        lastTrade: Math.random() > 0.5 ? 'Just now' : `${Math.floor(Math.random() * 60)} min ago`
      }
    }));
  }, [accounts, settings]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('tradeFollowingActive');
    if (savedState === 'true' && accounts.length > 0) {
      setIsActive(true);
      generateRealTimeSignals();
    }
  }, [accounts.length]);

  // Save state when isActive changes
  useEffect(() => {
    localStorage.setItem('tradeFollowingActive', isActive.toString());
    if (isActive) {
      generateRealTimeSignals();
    }
  }, [isActive, generateRealTimeSignals]);

  return {
    isActive,
    signals,
    stats,
    activeAccounts,
    totalAccounts,
    startFollowing,
    stopFollowing,
    getAccountStats
  };
};
