import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
  avgBuyPrice: number;
  totalInvested: number;
  pnl: number;
  pnlPercentage: number;
}

export const useCryptoHoldings = (accountId?: string) => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && accountId) {
      calculateHoldings();
    }
  }, [user, accountId]);

  const calculateHoldings = async () => {
    if (!user || !accountId) return;

    try {
      setLoading(true);
      
      // Get all completed trades for this account
      const { data: trades, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_id', accountId)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate holdings from trades
      const holdingsMap = new Map<string, CryptoHolding>();

      trades?.forEach(trade => {
        const existing = holdingsMap.get(trade.symbol);
        
        if (trade.side === 'buy') {
          if (existing) {
            const newAmount = existing.amount + trade.amount;
            const newTotalInvested = existing.totalInvested + trade.total_value;
            holdingsMap.set(trade.symbol, {
              ...existing,
              amount: newAmount,
              totalInvested: newTotalInvested,
              avgBuyPrice: newTotalInvested / newAmount,
            });
          } else {
            holdingsMap.set(trade.symbol, {
              symbol: trade.symbol,
              name: getAssetName(trade.symbol),
              amount: trade.amount,
              value: trade.amount * trade.price, // Will be updated with current price
              change24h: Math.random() * 10 - 5, // Mock for now
              avgBuyPrice: trade.price,
              totalInvested: trade.total_value,
              pnl: 0,
              pnlPercentage: 0,
            });
          }
        } else { // sell
          if (existing) {
            const newAmount = Math.max(0, existing.amount - trade.amount);
            const soldRatio = trade.amount / existing.amount;
            const newTotalInvested = existing.totalInvested * (1 - soldRatio);
            
            holdingsMap.set(trade.symbol, {
              ...existing,
              amount: newAmount,
              totalInvested: newTotalInvested,
              avgBuyPrice: newAmount > 0 ? newTotalInvested / newAmount : 0,
            });
          }
        }
      });

      // Update current values and calculate PnL (mock prices for now)
      const updatedHoldings = Array.from(holdingsMap.values())
        .filter(holding => holding.amount > 0)
        .map(holding => {
          const currentPrice = getMockPrice(holding.symbol);
          const currentValue = holding.amount * currentPrice;
          const pnl = currentValue - holding.totalInvested;
          const pnlPercentage = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;
          
          return {
            ...holding,
            value: currentValue,
            pnl,
            pnlPercentage,
          };
        });

      setHoldings(updatedHoldings);
    } catch (error) {
      console.error('Error calculating holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetName = (symbol: string): string => {
    const names: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'SOL': 'Solana',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'DOGE': 'Dogecoin',
    };
    return names[symbol] || symbol;
  };

  const getMockPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      'BTC': 50000 + Math.random() * 10000,
      'ETH': 2400 + Math.random() * 400,
      'SOL': 60 + Math.random() * 20,
      'ADA': 0.35 + Math.random() * 0.15,
      'DOT': 5 + Math.random() * 2,
      'LINK': 12 + Math.random() * 3,
      'UNI': 6 + Math.random() * 2,
      'DOGE': 0.08 + Math.random() * 0.02,
    };
    return prices[symbol] || 1;
  };

  return {
    holdings,
    loading,
    refreshHoldings: calculateHoldings,
  };
};