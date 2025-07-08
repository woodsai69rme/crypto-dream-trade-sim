
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Account {
  id: string;
  user_id: string;
  account_name: string;
  account_type: string;
  risk_level: string;
  balance: number;
  initial_balance: number;
  total_pnl: number;
  total_pnl_percentage: number;
  max_daily_loss: number;
  max_position_size: number;
  trading_strategy: string;
  color_theme: string;
  icon: string;
  tags: string[];
  description: string;
  status: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface Trade {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  type: 'market' | 'limit';
}

export const useMultipleAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accounts from database
  const loadAccounts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedAccounts = data as Account[];
      setAccounts(typedAccounts);

      // Set default account
      const defaultAccount = typedAccounts.find(acc => acc.is_default) || typedAccounts[0];
      if (defaultAccount) {
        setCurrentAccount(defaultAccount);
      }

      console.log(`Loaded ${typedAccounts.length} accounts for user`);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      setError(error.message);
      toast({
        title: "Error Loading Accounts",
        description: "Failed to load your trading accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Switch to different account
  const switchAccount = useCallback(async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) {
      toast({
        title: "Account Not Found",
        description: "The selected account could not be found",
        variant: "destructive",
      });
      return;
    }

    setCurrentAccount(account);

    // Update last accessed in database
    try {
      await supabase
        .from('paper_trading_accounts')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      // Log account switch
      await supabase.from('comprehensive_audit').insert({
        user_id: user?.id,
        account_id: accountId,
        action_type: 'account_switched',
        entity_type: 'account',
        entity_id: accountId,
        metadata: {
          account_name: account.account_name,
          previous_account: currentAccount?.account_name,
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Account Switched",
        description: `Now using ${account.account_name} account`,
      });
    } catch (error) {
      console.error('Error switching account:', error);
    }
  }, [accounts, currentAccount, user, toast]);

  // Execute trade on current account
  const executeTrade = useCallback(async (trade: Trade): Promise<boolean> => {
    if (!currentAccount || !user) {
      toast({
        title: "No Account Selected",
        description: "Please select an account to execute trades",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Executing trade:', trade, 'on account:', currentAccount.account_name);

      // Execute trade using the paper trading function
      const { data, error } = await supabase.rpc('execute_paper_trade', {
        p_user_id: user.id,
        p_account_id: currentAccount.id,
        p_symbol: trade.symbol,
        p_side: trade.side,
        p_amount: trade.amount,
        p_price: trade.price,
        p_trade_type: trade.type,
        p_order_type: trade.type
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number; trade_id?: string };

      if (!result.success) {
        toast({
          title: "Trade Failed",
          description: result.error || "Trade execution failed",
          variant: "destructive",
        });
        return false;
      }

      // Update local account balance
      if (result.new_balance) {
        setCurrentAccount(prev => prev ? {
          ...prev,
          balance: result.new_balance!,
          total_pnl: result.new_balance! - prev.initial_balance,
          total_pnl_percentage: ((result.new_balance! - prev.initial_balance) / prev.initial_balance) * 100
        } : null);

        // Reload all accounts to get updated data
        loadAccounts();
      }

      toast({
        title: "Trade Executed",
        description: `${trade.side.toUpperCase()} ${trade.amount} ${trade.symbol} at $${trade.price.toLocaleString()}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error executing trade:', error);
      toast({
        title: "Trade Execution Error",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
      return false;
    }
  }, [currentAccount, user, toast, loadAccounts]);

  // Get account summary statistics
  const getAccountSummary = useCallback(() => {
    if (accounts.length === 0) {
      return {
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        activeAccounts: 0,
        bestPerformingAccount: null,
        worstPerformingAccount: null
      };
    }

    const totalValue = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalPnL = accounts.reduce((sum, acc) => sum + acc.total_pnl, 0);
    const totalPnLPercentage = totalPnL / accounts.reduce((sum, acc) => sum + acc.initial_balance, 0) * 100;
    const activeAccounts = accounts.filter(acc => acc.status === 'active').length;

    const sortedByPerformance = [...accounts].sort((a, b) => b.total_pnl_percentage - a.total_pnl_percentage);
    const bestPerformingAccount = sortedByPerformance[0];
    const worstPerformingAccount = sortedByPerformance[sortedByPerformance.length - 1];

    return {
      totalValue,
      totalPnL,
      totalPnLPercentage,
      activeAccounts,
      bestPerformingAccount,
      worstPerformingAccount
    };
  }, [accounts]);

  // Refresh account data
  const refreshAccounts = useCallback(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Initialize
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Set up real-time subscriptions for account updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('account-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'paper_trading_accounts',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Account change detected:', payload);
        loadAccounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadAccounts]);

  return {
    accounts,
    currentAccount,
    loading,
    error,
    switchAccount,
    executeTrade,
    refreshAccounts,
    accountSummary: getAccountSummary(),
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'active').length
  };
};
