
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useAccountReset = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  const resetAccount = async (accountId: string, resetToBalance?: number) => {
    if (!user) return false;

    setResetting(true);
    try {
      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (accountError || !account) {
        throw new Error('Account not found');
      }

      const newBalance = resetToBalance || account.initial_balance;

      // Delete all trades for this account
      const { error: tradesError } = await supabase
        .from('paper_trades')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (tradesError) {
        console.warn('Error deleting trades:', tradesError);
      }

      // Delete all analytics for this account
      const { error: analyticsError } = await supabase
        .from('account_analytics')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (analyticsError) {
        console.warn('Error deleting analytics:', analyticsError);
      }

      // Delete all notifications for this account
      const { error: notificationsError } = await supabase
        .from('account_notifications')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (notificationsError) {
        console.warn('Error deleting notifications:', notificationsError);
      }

      // Reset account balance and stats - ensure complete reset
      const { error: updateError } = await supabase
        .from('paper_trading_accounts')
        .update({
          balance: newBalance,
          initial_balance: newBalance,
          total_pnl: 0,
          total_pnl_percentage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Account Reset Complete",
        description: `Account has been reset to $${newBalance.toLocaleString()}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error resetting account:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset account",
        variant: "destructive",
      });
      return false;
    } finally {
      setResetting(false);
    }
  };

  const resetAllAccounts = async () => {
    if (!user) return false;

    setResetting(true);
    try {
      // Get all user accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('paper_trading_accounts')
        .select('id, initial_balance')
        .eq('user_id', user.id);

      if (accountsError || !accounts) {
        throw new Error('Failed to fetch accounts');
      }

      // Reset each account
      const resetPromises = accounts.map(account => resetAccount(account.id));
      await Promise.all(resetPromises);

      toast({
        title: "All Accounts Reset",
        description: `Successfully reset ${accounts.length} accounts`,
      });

      return true;
    } catch (error: any) {
      console.error('Error resetting all accounts:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset all accounts",
        variant: "destructive",
      });
      return false;
    } finally {
      setResetting(false);
    }
  };

  return {
    resetAccount,
    resetAllAccounts,
    resetting
  };
};
