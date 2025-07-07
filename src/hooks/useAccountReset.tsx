
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useAccountReset = () => {
  const [resetting, setResetting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetAccount = async (accountId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to reset account",
        variant: "destructive",
      });
      return false;
    }

    setResetting(true);
    try {
      console.log('Resetting account:', accountId);

      // Call the Supabase function to reset the account
      const { error } = await supabase.rpc('reset_paper_account', {
        account_id_param: accountId
      });

      if (error) {
        console.error('Reset account error:', error);
        throw error;
      }

      // Also clear any related trades
      const { error: tradesError } = await supabase
        .from('paper_trades')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (tradesError) {
        console.error('Clear trades error:', tradesError);
      }

      toast({
        title: "Account Reset",
        description: "Account has been successfully reset to initial balance",
      });

      return true;
    } catch (error: any) {
      console.error('Error resetting account:', error);
      toast({
        title: "Reset Failed",
        description: `Failed to reset account: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setResetting(false);
    }
  };

  const resetAllAccounts = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to reset accounts",
        variant: "destructive",
      });
      return false;
    }

    setResetting(true);
    try {
      console.log('Resetting all accounts for user:', user.id);

      // Get all user accounts
      const { data: accounts, error: fetchError } = await supabase
        .from('paper_trading_accounts')
        .select('id')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      if (!accounts || accounts.length === 0) {
        toast({
          title: "No Accounts",
          description: "No accounts found to reset",
        });
        return false;
      }

      // Reset each account
      for (const account of accounts) {
        const { error } = await supabase.rpc('reset_paper_account', {
          account_id_param: account.id
        });
        if (error) {
          console.error('Error resetting account:', account.id, error);
        }
      }

      // Clear all trades for the user
      const { error: tradesError } = await supabase
        .from('paper_trades')
        .delete()
        .eq('user_id', user.id);

      if (tradesError) {
        console.error('Clear all trades error:', tradesError);
      }

      // Clear all user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);

      if (settingsError) {
        console.error('Clear settings error:', settingsError);
      }

      toast({
        title: "Complete Reset Successful",
        description: `Successfully reset ${accounts.length} accounts and cleared all data`,
      });

      return true;
    } catch (error: any) {
      console.error('Error resetting all accounts:', error);
      toast({
        title: "Reset Failed",
        description: `Failed to reset accounts: ${error.message}`,
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
