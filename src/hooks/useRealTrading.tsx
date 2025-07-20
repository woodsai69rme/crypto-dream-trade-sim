import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface RealTradingCredentials {
  id: string;
  exchange_name: string;
  is_testnet: boolean;
  is_active: boolean;
  permissions: any;
  daily_limit: number;
  position_limit: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface RealTradeRequest {
  account_id: string;
  exchange_name: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  trade_type?: 'market' | 'limit' | 'stop';
  confirmation_token?: string;
}

export interface TradingConfirmation {
  id: string;
  confirmation_token: string;
  trade_data: any;
  expires_at: string;
  confirmed: boolean;
}

export interface RiskMonitoring {
  id: string;
  risk_type: string;
  current_value: number;
  threshold_value: number;
  risk_level: string;
  alert_triggered: boolean;
  alert_message?: string;
}

export const useRealTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<RealTradingCredentials[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskMonitoring[]>([]);

  // Fetch real trading credentials
  const fetchCredentials = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('real_trading_credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trading credentials",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Add real trading credentials
  const addCredentials = useCallback(async (
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string,
    isTestnet: boolean = true
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Generate a simple encryption key ID (in production, use proper encryption)
      const encryptionKeyId = `key_${Date.now()}`;
      
      const { error } = await supabase
        .from('real_trading_credentials')
        .insert({
          user_id: user.id,
          exchange_name: exchangeName,
          api_key_encrypted: btoa(apiKey), // Base64 encoding (use proper encryption in production)
          api_secret_encrypted: btoa(apiSecret),
          passphrase_encrypted: passphrase ? btoa(passphrase) : null,
          encryption_key_id: encryptionKeyId,
          is_testnet: isTestnet,
          is_active: false, // Start inactive for safety
          permissions: ['read'], // Start with read-only
          daily_limit: isTestnet ? 10000 : 1000,
          position_limit: isTestnet ? 5000 : 500
        });

      if (error) throw error;

      toast({
        title: "Credentials Added",
        description: `${exchangeName} credentials added successfully. Please activate them to start trading.`,
      });

      await fetchCredentials();
      return true;
    } catch (error: any) {
      console.error('Error adding credentials:', error);
      toast({
        title: "Failed to Add Credentials",
        description: error.message || "Failed to add trading credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchCredentials]);

  // Toggle credentials activation
  const toggleCredentials = useCallback(async (credentialId: string, isActive: boolean) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('real_trading_credentials')
        .update({ 
          is_active: isActive,
          last_used: isActive ? new Date().toISOString() : null
        })
        .eq('id', credentialId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: isActive ? "Credentials Activated" : "Credentials Deactivated",
        description: `Trading credentials ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      await fetchCredentials();
      return true;
    } catch (error: any) {
      console.error('Error toggling credentials:', error);
      toast({
        title: "Error",
        description: "Failed to update credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchCredentials]);

  // Create trading confirmation
  const createTradingConfirmation = useCallback(async (tradeData: any) => {
    if (!user) return null;

    try {
      const confirmationToken = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const { data, error } = await supabase
        .from('trading_confirmations')
        .insert({
          user_id: user.id,
          trade_data: tradeData,
          confirmation_token: confirmationToken,
          expires_at: expiresAt.toISOString(),
          ip_address: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) throw error;

      return {
        confirmation_token: confirmationToken,
        expires_at: expiresAt.toISOString(),
        trade_data: tradeData
      };
    } catch (error: any) {
      console.error('Error creating confirmation:', error);
      toast({
        title: "Error",
        description: "Failed to create trade confirmation",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Validate real trade
  const validateRealTrade = useCallback(async (tradeRequest: Omit<RealTradeRequest, 'confirmation_token'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('validate_real_trade', {
        p_user_id: user.id,
        p_account_id: tradeRequest.account_id,
        p_symbol: tradeRequest.symbol,
        p_side: tradeRequest.side,
        p_amount: tradeRequest.amount,
        p_price: tradeRequest.price
      });

      if (error) throw error;
      return data as any;
    } catch (error: any) {
      console.error('Error validating trade:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate trade",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Execute real trade
  const executeRealTrade = useCallback(async (tradeRequest: RealTradeRequest) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('execute_real_trade', {
        p_user_id: user.id,
        p_account_id: tradeRequest.account_id,
        p_exchange_name: tradeRequest.exchange_name,
        p_symbol: tradeRequest.symbol,
        p_side: tradeRequest.side,
        p_amount: tradeRequest.amount,
        p_price: tradeRequest.price,
        p_confirmation_token: tradeRequest.confirmation_token || null
      });

      if (error) throw error;

      const result = data as any;
      if (result.valid) {
        toast({
          title: "Trade Submitted",
          description: `${tradeRequest.side.toUpperCase()} order for ${tradeRequest.amount} ${tradeRequest.symbol} submitted`,
        });
      } else {
        throw new Error(result.error || 'Trade validation failed');
      }

      return data;
    } catch (error: any) {
      console.error('Error executing real trade:', error);
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch risk monitoring data
  const fetchRiskAlerts = useCallback(async (accountId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('risk_monitoring')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRiskAlerts((data || []) as RiskMonitoring[]);
    } catch (error: any) {
      console.error('Error fetching risk alerts:', error);
    }
  }, [user]);

  // Emergency stop all trading
  const emergencyStop = useCallback(async (accountId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({ emergency_stop: true })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Emergency Stop Activated",
        description: "All trading has been stopped for this account",
        variant: "destructive",
      });

      return true;
    } catch (error: any) {
      console.error('Error activating emergency stop:', error);
      toast({
        title: "Error",
        description: "Failed to activate emergency stop",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Remove emergency stop
  const removeEmergencyStop = useCallback(async (accountId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({ emergency_stop: false })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Emergency Stop Removed",
        description: "Trading can now resume for this account",
      });

      return true;
    } catch (error: any) {
      console.error('Error removing emergency stop:', error);
      toast({
        title: "Error",
        description: "Failed to remove emergency stop",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    credentials,
    riskAlerts,
    loading,
    fetchCredentials,
    addCredentials,
    toggleCredentials,
    createTradingConfirmation,
    validateRealTrade,
    executeRealTrade,
    fetchRiskAlerts,
    emergencyStop,
    removeEmergencyStop
  };
};