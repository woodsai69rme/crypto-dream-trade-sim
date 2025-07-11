import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useAccountInitialization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeUserAccounts = async () => {
      if (!user || initialized || initializing) return;

      setInitializing(true);
      try {
        // Check if user has accounts
        const { data: accounts, error: accountsError } = await supabase
          .from('paper_trading_accounts')
          .select('id')
          .eq('user_id', user.id);

        if (accountsError) throw accountsError;

        // If no accounts, create them
        if (!accounts || accounts.length === 0) {
          console.log('No accounts found for user, creating default accounts...');
          
          const { data, error } = await supabase.rpc('manual_create_account');
          
          if (error) throw error;
          
          const result = data as { success: boolean; error?: string; accounts_created?: number };
          
          if (result.success) {
            toast({
              title: "Welcome to CryptoTrader Pro!",
              description: `Your default trading account has been created with $100,000 virtual balance.`,
            });
            setInitialized(true);
          } else {
            throw new Error(result.error || 'Failed to create accounts');
          }
        } else {
          console.log(`User has ${accounts.length} existing accounts`);
          setInitialized(true);
        }
      } catch (error: any) {
        console.error('Error initializing user accounts:', error);
        toast({
          title: "Account Setup Error",
          description: "There was an issue setting up your trading accounts. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setInitializing(false);
      }
    };

    initializeUserAccounts();
  }, [user, initialized, initializing, toast]);

  return { initializing, initialized };
};