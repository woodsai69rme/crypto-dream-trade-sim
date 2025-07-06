import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PaperAccount {
  id: string;
  user_id: string;
  account_name: string;
  balance: number;
  initial_balance: number;
  total_pnl: number;
  total_pnl_percentage: number;
  is_default: boolean;
  is_active: boolean;
  account_type: string;
  risk_level: string;
  status: string;
  description?: string;
  color_theme: string;
  icon: string;
  max_daily_loss: number;
  max_position_size: number;
  trading_strategy: string;
  auto_rebalance: boolean;
  benchmark_symbol: string;
  notification_settings: any;
  tags: string[];
  performance_target: number;
  max_drawdown_limit: number;
  currency: string;
  timezone: string;
  last_accessed: string;
  access_count: number;
  is_public: boolean;
  share_token?: string;
  copied_from_account_id?: string;
  copy_settings: any;
  created_at: string;
  updated_at: string;
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
  created_by?: string;
  usage_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AccountNotification {
  id: string;
  account_id: string;
  notification_type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
  expires_at?: string;
}

export interface AccountAnalytics {
  id: string;
  account_id: string;
  analytics_date: string;
  daily_return: number;
  weekly_return: number;
  monthly_return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_trades: number;
  win_rate: number;
  profit_factor: number;
  benchmark_return: number;
  alpha: number;
  beta: number;
}

export const useMultipleAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [accounts, setAccounts] = useState<PaperAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<PaperAccount | null>(null);
  const [accountTemplates, setAccountTemplates] = useState<AccountTemplate[]>([]);
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, AccountAnalytics[]>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fetch all accounts for the user
  const fetchAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('last_accessed', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      
      // Set current account to default or first account
      const defaultAccount = data?.find(acc => acc.is_default) || data?.[0];
      if (defaultAccount) {
        setCurrentAccount(defaultAccount);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch account templates
  const fetchAccountTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('account_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setAccountTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('account_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  // Fetch analytics for an account
  const fetchAccountAnalytics = useCallback(async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from('account_analytics')
        .select('*')
        .eq('account_id', accountId)
        .order('analytics_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      
      setAnalytics(prev => ({
        ...prev,
        [accountId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Create account from template
  const createAccountFromTemplate = useCallback(async (
    templateId: string, 
    accountName: string, 
    customBalance?: number
  ) => {
    if (!user) return null;

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_account_from_template', {
        template_id_param: templateId,
        account_name_param: accountName,
        custom_balance_param: customBalance
      });

      if (error) throw error;

      toast({
        title: "Account Created",
        description: `${accountName} has been created successfully!`,
      });

      // Refresh accounts
      await fetchAccounts();
      return data;
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [user, toast, fetchAccounts]);

  // Create custom account
  const createCustomAccount = useCallback(async (accountData: Partial<PaperAccount>) => {
    if (!user) return null;

    setCreating(true);
    try {
      const insertData = {
        user_id: user.id,
        account_name: accountData.account_name!,
        balance: accountData.initial_balance || 100000,
        initial_balance: accountData.initial_balance || 100000,
        total_pnl: 0, // Ensure new accounts start with zero P&L
        total_pnl_percentage: 0, // Ensure new accounts start with zero P&L percentage
        account_type: (accountData.account_type as 'balanced') || 'balanced',
        risk_level: (accountData.risk_level as 'medium') || 'medium',
        description: accountData.description,
        color_theme: accountData.color_theme || '#3b82f6',
        icon: accountData.icon || 'TrendingUp',
        max_daily_loss: accountData.max_daily_loss || 1000,
        max_position_size: accountData.max_position_size || 5000,
        trading_strategy: accountData.trading_strategy || 'manual',
        tags: accountData.tags || [],
        performance_target: accountData.performance_target || 10,
        max_drawdown_limit: accountData.max_drawdown_limit || 20,
        currency: accountData.currency || 'USD',
        timezone: accountData.timezone || 'UTC',
        status: 'active' as 'active',
        is_active: true,
        is_default: false
      };

      const { data, error } = await supabase
        .from('paper_trading_accounts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Account Created",
        description: `${accountData.account_name} has been created successfully with a clean slate!`,
      });

      await fetchAccounts();
      return data;
    } catch (error: any) {
      console.error('Error creating custom account:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [user, toast, fetchAccounts]);

  // Switch default account
  const switchAccount = useCallback(async (accountId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('set_default_account', {
        account_id_param: accountId
      });

      if (error) throw error;

      // Update local state
      const newCurrentAccount = accounts.find(acc => acc.id === accountId);
      if (newCurrentAccount) {
        setCurrentAccount(newCurrentAccount);
        setAccounts(prev => prev.map(acc => ({
          ...acc,
          is_default: acc.id === accountId
        })));
      }

      toast({
        title: "Account Switched",
        description: "Successfully switched to " + newCurrentAccount?.account_name,
      });
    } catch (error: any) {
      console.error('Error switching account:', error);
      toast({
        title: "Switch Failed",
        description: error.message || "Failed to switch account",
        variant: "destructive",
      });
    }
  }, [user, accounts, toast]);

  // Update account
  const updateAccount = useCallback(async (accountId: string, updates: Partial<PaperAccount>) => {
    if (!user) return;

    try {
      // Create clean update object with only database fields
      const updateData: any = {};
      
      // Only include fields that exist in the database table
      const allowedFields = [
        'account_name', 'balance', 'initial_balance', 'total_pnl', 'total_pnl_percentage',
        'is_default', 'is_active', 'account_type', 'risk_level', 'status', 'description',
        'color_theme', 'icon', 'max_daily_loss', 'max_position_size', 'trading_strategy',
        'auto_rebalance', 'benchmark_symbol', 'notification_settings', 'tags',
        'performance_target', 'max_drawdown_limit', 'currency', 'timezone',
        'last_accessed', 'access_count', 'is_public', 'share_token',
        'copied_from_account_id', 'copy_settings'
      ];
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = updates[key as keyof PaperAccount];
        }
      });
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('paper_trading_accounts')
        .update(updateData)
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, ...updates } : acc
      ));

      if (currentAccount?.id === accountId) {
        setCurrentAccount(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Account Updated",
        description: "Account settings have been saved successfully!",
      });
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update account",
        variant: "destructive",
      });
    }
  }, [user, currentAccount, toast]);

  // Delete account
  const deleteAccount = useCallback(async (accountId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      // If deleted account was current, switch to another
      if (currentAccount?.id === accountId) {
        const remainingAccounts = accounts.filter(acc => acc.id !== accountId);
        if (remainingAccounts.length > 0) {
          await switchAccount(remainingAccounts[0].id);
        } else {
          setCurrentAccount(null);
        }
      }

      toast({
        title: "Account Deleted",
        description: "Account has been permanently deleted",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  }, [user, currentAccount, accounts, switchAccount, toast]);

  // Enhanced execute trade method with proper error handling
  const executeTrade = useCallback(async (trade: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    type: 'market' | 'limit';
  }) => {
    if (!user || !currentAccount) {
      console.error('No user or current account found');
      return false;
    }

    console.log('Executing trade:', trade, 'for account:', currentAccount.account_name);

    try {
      // Call the database function directly for better reliability
      const { data, error } = await supabase.rpc('execute_paper_trade', {
        p_user_id: user.id,
        p_account_id: currentAccount.id,
        p_symbol: trade.symbol.toUpperCase(),
        p_side: trade.side,
        p_amount: trade.amount,
        p_price: trade.price,
        p_trade_type: trade.type,
        p_order_type: trade.type
      });

      if (error) {
        console.error('Database function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('Trade execution failed:', data.error);
        throw new Error(data.error || 'Trade execution failed');
      }

      console.log('Trade executed successfully:', data);

      // Update current account balance immediately
      setCurrentAccount(prev => prev ? {
        ...prev,
        balance: data.new_balance,
        total_pnl: data.new_balance - prev.initial_balance,
        total_pnl_percentage: ((data.new_balance - prev.initial_balance) / prev.initial_balance) * 100
      } : null);

      // Update accounts list
      setAccounts(prev => prev.map(acc => 
        acc.id === currentAccount.id ? {
          ...acc,
          balance: data.new_balance,
          total_pnl: data.new_balance - acc.initial_balance,
          total_pnl_percentage: ((data.new_balance - acc.initial_balance) / acc.initial_balance) * 100
        } : acc
      ));

      toast({
        title: "Trade Executed",
        description: `${trade.side.toUpperCase()} ${trade.amount} ${trade.symbol} at $${trade.price.toLocaleString()} - New Balance: $${data.new_balance.toLocaleString()}`,
      });

      return true;
    } catch (error: any) {
      console.error('Trade execution error:', error);
      
      let errorMessage = 'Failed to execute trade';
      if (error.message.includes('Insufficient balance')) {
        errorMessage = 'Insufficient balance for this trade';
      } else if (error.message.includes('Account not found')) {
        errorMessage = 'Trading account not found';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Trade Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, currentAccount, toast]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('account_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const accountsChannel = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paper_trading_accounts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAccounts(prev => [...prev, payload.new as PaperAccount]);
          } else if (payload.eventType === 'UPDATE') {
            setAccounts(prev => prev.map(acc => 
              acc.id === payload.new.id ? payload.new as PaperAccount : acc
            ));
            if (currentAccount?.id === payload.new.id) {
              setCurrentAccount(payload.new as PaperAccount);
            }
          } else if (payload.eventType === 'DELETE') {
            setAccounts(prev => prev.filter(acc => acc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'account_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as AccountNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accountsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, currentAccount]);

  // Initial data fetching
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchAccounts(),
          fetchAccountTemplates(),
          fetchNotifications()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  // Fetch analytics when current account changes
  useEffect(() => {
    if (currentAccount && !analytics[currentAccount.id]) {
      fetchAccountAnalytics(currentAccount.id);
    }
  }, [currentAccount, analytics, fetchAccountAnalytics]);

  return {
    accounts,
    currentAccount,
    accountTemplates,
    notifications,
    analytics,
    loading,
    creating,
    fetchAccounts,
    createAccountFromTemplate,
    createCustomAccount,
    switchAccount,
    updateAccount,
    deleteAccount,
    markNotificationRead,
    executeTrade,
    fetchAccountAnalytics,
  };
};
