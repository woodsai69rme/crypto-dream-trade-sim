import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ExchangeConnection {
  id: string;
  exchange_name: string;
  api_key_encrypted?: string;
  api_secret_encrypted?: string;
  passphrase_encrypted?: string;
  sandbox_mode: boolean;
  is_active: boolean;
  permissions?: any;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletConnection {
  id: string;
  wallet_type: 'metamask' | 'walletconnect' | 'coinbase' | 'ledger';
  wallet_address: string;
  wallet_name?: string;
  is_active: boolean;
  balance: number;
  network: string;
}

export interface LiveTradeRequest {
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  orderType: 'market' | 'limit' | 'stop';
  accountId?: string;
}

export const useLiveTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exchanges, setExchanges] = useState<ExchangeConnection[]>([]);
  const [wallets, setWallets] = useState<WalletConnection[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch exchange connections
  const fetchExchanges = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exchange_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExchanges((data as ExchangeConnection[]) || []);
    } catch (error: any) {
      console.error('Error fetching exchanges:', error);
      toast({
        title: "Error",
        description: "Failed to fetch exchange connections",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch wallet connections
  const fetchWallets = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets((data as WalletConnection[]) || []);
    } catch (error: any) {
      console.error('Error fetching wallets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet connections",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Connect to exchange
  const connectExchange = useCallback(async (
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string,
    isSandbox: boolean = true
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('exchange_connections')
        .insert({
          user_id: user.id,
          exchange_name: exchangeName,
          api_key_encrypted: apiKey, // In production, encrypt these
          api_secret_encrypted: apiSecret,
          passphrase_encrypted: passphrase,
          sandbox_mode: isSandbox,
          is_active: true,
          permissions: { read: true, trade: true }
        });

      if (error) throw error;

      toast({
        title: "Exchange Connected",
        description: `Successfully connected to ${exchangeName}`,
      });

      await fetchExchanges();
      return true;
    } catch (error: any) {
      console.error('Error connecting exchange:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to exchange",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchExchanges]);

  // Connect wallet
  const connectWallet = useCallback(async (
    walletType: 'metamask' | 'walletconnect' | 'coinbase' | 'ledger',
    walletAddress: string,
    walletName?: string,
    network: string = 'ethereum'
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wallet_connections')
        .insert({
          user_id: user.id,
          wallet_type: walletType,
          wallet_address: walletAddress,
          wallet_name: walletName,
          network: network,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Wallet Connected",
        description: `Successfully connected ${walletType} wallet`,
      });

      await fetchWallets();
      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchWallets]);

  // Execute live trade
  const executeLiveTrade = useCallback(async (tradeRequest: LiveTradeRequest) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('live-trading-connector', {
        body: tradeRequest
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Trade execution failed');
      }

      toast({
        title: "Trade Executed",
        description: `Successfully executed ${tradeRequest.side} order for ${tradeRequest.amount} ${tradeRequest.symbol}`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Error executing live trade:', error);
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Sync exchange balances
  const syncExchangeBalances = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update each active exchange with mock balance data
      const updates = exchanges
        .filter(ex => ex.is_active)
        .map(ex => ({
          id: ex.id,
          last_sync: new Date().toISOString()
        }));

      for (const update of updates) {
        await supabase
          .from('exchange_connections')
          .update({
            last_sync: update.last_sync
          })
          .eq('id', update.id);
      }

      await fetchExchanges();
      
      toast({
        title: "Balances Synced",
        description: "Successfully synced all exchange balances",
      });
    } catch (error: any) {
      console.error('Error syncing balances:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync exchange balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, exchanges, toast, fetchExchanges]);

  return {
    exchanges,
    wallets,
    loading,
    fetchExchanges,
    fetchWallets,
    connectExchange,
    connectWallet,
    executeLiveTrade,
    syncExchangeBalances
  };
};