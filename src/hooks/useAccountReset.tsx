
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
    console.log('Starting account reset for:', accountId);
    
    try {
      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (accountError || !account) {
        console.error('Account fetch error:', accountError);
        throw new Error('Account not found');
      }

      const newBalance = resetToBalance || account.initial_balance;
      console.log('Resetting account to balance:', newBalance);

      // Start transaction-like operations
      const promises = [];

      // 1. Delete all trades for this account
      console.log('Deleting trades for account:', accountId);
      promises.push(
        supabase
          .from('paper_trades')
          .delete()
          .eq('account_id', accountId)
          .eq('user_id', user.id)
      );

      // 2. Delete all analytics for this account
      console.log('Deleting analytics for account:', accountId);
      promises.push(
        supabase
          .from('account_analytics')
          .delete()
          .eq('account_id', accountId)
          .eq('user_id', user.id)
      );

      // 3. Delete all notifications for this account
      console.log('Deleting notifications for account:', accountId);
      promises.push(
        supabase
          .from('account_notifications')
          .delete()
          .eq('account_id', accountId)
          .eq('user_id', user.id)
      );

      // 4. Stop all bots associated with this account
      console.log('Stopping bots for account:', accountId);
      promises.push(
        supabase
          .from('ai_trading_bots')
          .update({ 
            status: 'paused',
            updated_at: new Date().toISOString()
          })
          .eq('account_id', accountId)
          .eq('user_id', user.id)
      );

      // Execute all deletions
      const results = await Promise.allSettled(promises);
      
      // Log any errors but don't fail the reset
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Reset operation ${index} failed:`, result.reason);
        } else {
          console.log(`Reset operation ${index} completed`);
        }
      });

      // 5. Reset account balance and stats - this is the critical operation
      console.log('Updating account balance and stats');
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
        console.error('Account update error:', updateError);
        throw updateError;
      }

      // 6. Create audit record
      console.log('Creating audit record');
      await supabase
        .from('paper_account_audit')
        .insert({
          user_id: user.id,
          account_id: accountId,
          action: 'reset',
          old_balance: account.balance,
          new_balance: newBalance,
          amount_changed: newBalance - account.balance,
          reason: 'Complete account reset with trade history cleared'
        });

      console.log('Account reset completed successfully');
      toast({
        title: "Account Reset Complete",
        description: `Account has been reset to $${newBalance.toLocaleString()} with all history cleared`,
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
    console.log('Starting reset for all accounts');
    
    try {
      // Get all user accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('paper_trading_accounts')
        .select('id, account_name, initial_balance')
        .eq('user_id', user.id);

      if (accountsError || !accounts) {
        throw new Error('Failed to fetch accounts');
      }

      console.log('Found accounts to reset:', accounts.length);

      // Reset each account sequentially to avoid database conflicts
      let successCount = 0;
      for (const account of accounts) {
        console.log(`Resetting account: ${account.account_name}`);
        const success = await resetAccount(account.id, account.initial_balance);
        if (success) successCount++;
        
        // Small delay between resets
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "All Accounts Reset",
        description: `Successfully reset ${successCount} of ${accounts.length} accounts`,
      });

      return successCount === accounts.length;
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
