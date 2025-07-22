
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/encryption';
import { useToast } from '@/hooks/use-toast';

// Interface definitions
interface RealTradingCredentials {
  id: string;
  exchange_name: string;
  is_active: boolean;
  is_testnet: boolean;
  created_at: string;
  permissions: any;
  daily_limit?: number;
  position_limit?: number;
}

interface RealTradeRequest {
  account_id: string;
  exchange_name: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  trade_type: 'market' | 'limit';
  confirmation_token?: string;
}

interface TradingConfirmation {
  confirmation_token: string;
  expires_at: string;
  trade_data: any;
}

interface RiskMonitoring {
  id: string;
  account_id: string;
  risk_type: string;
  current_value: number;
  threshold_value: number;
  risk_level: string;
  created_at: string;
  alert_message?: string;
}

export const useRealTrading = () => {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<RealTradingCredentials[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskMonitoring[]>([]);
  const { toast } = useToast();

  // Fetch credentials
  const fetchCredentials = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('real_trading_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trading credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add credentials with enhanced security
  const addCredentials = async (
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string,
    isTestnet: boolean = true
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!apiKey || !apiSecret) {
        throw new Error('API key and secret are required');
      }

      // Store encrypted credentials
      await SecureStorage.storeSecureCredentials(
        exchangeName,
        apiKey,
        apiSecret,
        passphrase
      );

      toast({
        title: "Success",
        description: "Trading credentials added successfully",
      });

      await fetchCredentials();
      return true;
    } catch (error) {
      console.error('Error adding credentials:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle credentials active status
  const toggleCredentials = async (credentialId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('real_trading_credentials')
        .update({ is_active: isActive })
        .eq('id', credentialId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Credentials ${isActive ? 'activated' : 'deactivated'}`,
      });

      await fetchCredentials();
      return true;
    } catch (error) {
      console.error('Error toggling credentials:', error);
      toast({
        title: "Error",
        description: "Failed to update credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create trading confirmation
  const createTradingConfirmation = async (tradeData: any): Promise<TradingConfirmation | null> => {
    try {
      const confirmationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const { data, error } = await supabase
        .from('trading_confirmations')
        .insert({
          confirmation_token: confirmationToken,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          trade_data: tradeData,
          expires_at: expiresAt.toISOString(),
          confirmed: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        confirmation_token: confirmationToken,
        expires_at: expiresAt.toISOString(),
        trade_data: tradeData
      };
    } catch (error) {
      console.error('Error creating confirmation:', error);
      return null;
    }
  };

  // Validate real trade
  const validateRealTrade = async (
    tradeRequest: Omit<RealTradeRequest, 'confirmation_token'>
  ): Promise<any | null> => {
    try {
      const { data, error } = await supabase.rpc('validate_real_trade', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_account_id: tradeRequest.account_id,
        p_symbol: tradeRequest.symbol,
        p_side: tradeRequest.side,
        p_amount: tradeRequest.amount,
        p_price: tradeRequest.price
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating trade:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate trade request",
        variant: "destructive",
      });
      return null;
    }
  };

  // Execute real trade
  const executeRealTrade = async (tradeRequest: RealTradeRequest): Promise<any | null> => {
    try {
      setLoading(true);

      // Validate trade first
      const validation = await validateRealTrade(tradeRequest);
      if (!validation?.valid) {
        throw new Error(validation?.error || 'Trade validation failed');
      }

      // Execute trade via edge function
      const { data, error } = await supabase.functions.invoke('real-trade-executor', {
        body: tradeRequest
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Trade Executed",
          description: `${tradeRequest.side.toUpperCase()} order for ${tradeRequest.amount} ${tradeRequest.symbol}`,
        });
        return data;
      } else {
        throw new Error(data.error || 'Trade execution failed');
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute trade",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch risk alerts
  const fetchRiskAlerts = async (accountId?: string): Promise<void> => {
    try {
      let query = supabase
        .from('risk_monitoring')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRiskAlerts(data || []);
    } catch (error) {
      console.error('Error fetching risk alerts:', error);
    }
  };

  // Emergency stop
  const emergencyStop = async (accountId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({ emergency_stop: true })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Emergency Stop Activated",
        description: "All trading has been halted for this account",
        variant: "destructive",
      });

      return true;
    } catch (error) {
      console.error('Error activating emergency stop:', error);
      toast({
        title: "Error",
        description: "Failed to activate emergency stop",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove emergency stop
  const removeEmergencyStop = async (accountId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({ emergency_stop: false })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Emergency Stop Removed",
        description: "Trading has been resumed for this account",
      });

      return true;
    } catch (error) {
      console.error('Error removing emergency stop:', error);
      toast({
        title: "Error",
        description: "Failed to remove emergency stop",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCredentials();
    fetchRiskAlerts();
  }, []);

  return {
    loading,
    credentials,
    riskAlerts,
    addCredentials,
    toggleCredentials,
    createTradingConfirmation,
    validateRealTrade,
    executeRealTrade,
    fetchRiskAlerts,
    emergencyStop,
    removeEmergencyStop,
    fetchCredentials
  };
};
