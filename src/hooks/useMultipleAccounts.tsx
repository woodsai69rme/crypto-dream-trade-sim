
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PaperAccount {
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
  last_accessed: string;
  access_count: number;
  performance_target?: number;
  max_drawdown_limit?: number;
  auto_rebalance?: boolean;
  currency?: string;
  timezone?: string;
}

export interface AccountTemplate {
  id: string;
  name: string;
  description: string;
  account_type: string;
  risk_level: string;
  initial_balance: number;
  max_daily_loss: number;
  max_position_size: number;
  trading_strategy: string;
  color_theme: string;
  icon: string;
  tags: string[];
  is_public: boolean;
  created_by: string;
  usage_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AccountNotification {
  id: string;
  account_id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
  expires_at?: string;
}

interface Trade {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  type: 'market' | 'limit';
}

// Type alias for backward compatibility
export type Account = PaperAccount;

export const useMultipleAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<PaperAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<PaperAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);

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

      const typedAccounts = (data || []) as PaperAccount[];
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

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('account_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as AccountNotification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [user]);

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
          updated_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
          access_count: account.access_count + 1
        })
        .eq('id', accountId);

      toast({
        title: "Account Switched",
        description: `Now using ${account.account_name} account`,
      });
    } catch (error) {
      console.error('Error switching account:', error);
    }
  }, [accounts, toast]);

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

  // Update account
  const updateAccount = useCallback(async (accountId: string, updates: Partial<PaperAccount>) => {
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update(updates as any)
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadAccounts();
      toast({
        title: "Account Updated",
        description: "Account has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update account",
        variant: "destructive",
      });
    }
  }, [user, loadAccounts, toast]);

  // Delete account
  const deleteAccount = useCallback(async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadAccounts();
      toast({
        title: "Account Deleted",
        description: "Account has been deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  }, [user, loadAccounts, toast]);

  // Create account from template
  const createAccountFromTemplate = useCallback(async (templateId: string, accountName: string, customBalance?: number): Promise<boolean> => {
    if (!user) return false;

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_account_from_template', {
        template_id_param: templateId,
        account_name_param: accountName,
        custom_balance_param: customBalance
      });

      if (error) throw error;

      await loadAccounts();
      toast({
        title: "Account Created",
        description: `Account "${accountName}" created successfully`,
      });
      return true;
    } catch (error: any) {
      console.error('Error creating account from template:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    } finally {
      setCreating(false);
    }
  }, [user, loadAccounts, toast]);

  // Create custom account
  const createCustomAccount = useCallback(async (accountData: Partial<PaperAccount>): Promise<boolean> => {
    if (!user) return false;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .insert([{
          account_name: accountData.account_name,
          account_type: accountData.account_type || 'balanced',
          risk_level: accountData.risk_level || 'medium',
          balance: accountData.initial_balance || 100000,
          initial_balance: accountData.initial_balance || 100000,
          max_daily_loss: accountData.max_daily_loss || 1000,
          max_position_size: accountData.max_position_size || 5000,
          trading_strategy: accountData.trading_strategy || 'manual',
          color_theme: accountData.color_theme || '#3b82f6',
          icon: accountData.icon || 'TrendingUp',
          tags: accountData.tags || [],
          description: accountData.description || '',
          status: 'active'
        }]);

      if (error) throw error;

      await loadAccounts();
      toast({
        title: "Account Created",
        description: `Account "${accountData.account_name}" created successfully`,
      });
      return true;
    } catch (error: any) {
      console.error('Error creating custom account:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    } finally {
      setCreating(false);
    }
  }, [user, loadAccounts, toast]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('account_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

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
    loadNotifications();
  }, [loadAccounts, loadNotifications]);

  // Initialize
  useEffect(() => {
    loadAccounts();
    loadNotifications();
  }, [loadAccounts, loadNotifications]);

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
    creating,
    notifications,
    switchAccount,
    executeTrade,
    updateAccount,
    deleteAccount,
    createAccountFromTemplate,
    createCustomAccount,
    markNotificationRead,
    refreshAccounts,
    accountSummary: getAccountSummary(),
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'active').length
  };
};
