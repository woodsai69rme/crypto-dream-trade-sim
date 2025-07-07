
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  tradeType?: 'market' | 'limit' | 'stop';
  orderType?: 'market' | 'limit' | 'stop';
  stopLoss?: number;
  takeProfit?: number;
  reasoning?: string;
}

interface TradeResponse {
  success: boolean;
  trade_id?: string;
  new_balance?: number;
  trade_value?: number;
  fee?: number;
  error?: string;
}

export const usePaperTrading = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentAccount } = useMultipleAccounts();
  const { toast } = useToast();

  const executeTrade = async (tradeRequest: TradeRequest) => {
    if (!user || !currentAccount) {
      toast({
        title: "Error",
        description: "Please log in and select an account",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('execute_paper_trade', {
        p_user_id: user.id,
        p_account_id: currentAccount.id,
        p_symbol: tradeRequest.symbol,
        p_side: tradeRequest.side,
        p_amount: tradeRequest.amount,
        p_price: tradeRequest.price,
        p_trade_type: tradeRequest.tradeType || 'market',
        p_order_type: tradeRequest.orderType || 'market'
      });

      if (error) throw error;

      // Type guard to check if data is a TradeResponse object
      const tradeResponse = data as unknown as TradeResponse;
      
      if (tradeResponse && typeof tradeResponse === 'object' && tradeResponse.success) {
        // Add additional trade details if provided
        if (tradeRequest.stopLoss || tradeRequest.takeProfit || tradeRequest.reasoning) {
          if (tradeResponse.trade_id) {
            await supabase
              .from('paper_trades')
              .update({
                stop_loss: tradeRequest.stopLoss,
                take_profit: tradeRequest.takeProfit,
                reasoning: tradeRequest.reasoning,
                trade_category: 'manual'
              })
              .eq('id', tradeResponse.trade_id);
          }
        }

        toast({
          title: "Trade Executed",
          description: `${tradeRequest.side.toUpperCase()} ${tradeRequest.amount} ${tradeRequest.symbol} at $${tradeRequest.price}`,
        });

        return tradeResponse;
      } else {
        const errorMessage = tradeResponse?.error || "Unknown error occurred";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Trade execution error:', error);
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTradeHistory = async (accountId?: string, limit: number = 50) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trade history:', error);
      return [];
    }
  };

  const calculatePortfolioValue = async (accountId: string) => {
    if (!user) return 0;

    try {
      // Get all trades for the account
      const { data: trades, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_id', accountId);

      if (error) throw error;

      // Calculate current holdings
      const holdings: { [symbol: string]: number } = {};
      
      trades?.forEach(trade => {
        if (!holdings[trade.symbol]) holdings[trade.symbol] = 0;
        
        if (trade.side === 'buy') {
          holdings[trade.symbol] += trade.amount;
        } else {
          holdings[trade.symbol] -= trade.amount;
        }
      });

      // Get current prices and calculate value
      const { data: marketData } = await supabase
        .from('market_data_cache')
        .select('symbol, price_usd');

      let totalValue = 0;
      
      Object.entries(holdings).forEach(([symbol, amount]) => {
        const coinData = marketData?.find(coin => coin.symbol === symbol);
        if (coinData && amount > 0) {
          totalValue += amount * coinData.price_usd;
        }
      });

      return totalValue;
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      return 0;
    }
  };

  return {
    executeTrade,
    getTradeHistory,
    calculatePortfolioValue,
    loading
  };
};
