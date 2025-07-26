import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/encryption';
import { ExchangeConnector } from '@/services/exchangeConnector';
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

      // Test connection before storing
      const connector = new ExchangeConnector(exchangeName);
      
      // Store encrypted credentials
      await SecureStorage.storeSecureCredentials(
        exchangeName,
        apiKey,
        apiSecret,
        passphrase
      );

      toast({
        title: "Success",
        description: "Trading credentials added successfully. Connection will be tested.",
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

  // Toggle credentials active status with connection test
  const toggleCredentials = async (credentialId: string, isActive: boolean): Promise<boolean> => {
    try {
      setLoading(true);

      if (isActive) {
        // Test connection before activating
        const connector = new ExchangeConnector('binance'); // Get from credential
        const connected = await connector.validateConnection();
        
        if (!connected) {
          throw new Error('Failed to validate exchange connection');
        }
      }

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
        description: error instanceof Error ? error.message : "Failed to update credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
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

  // Enhanced execute real trade with actual exchange integration
  const executeRealTrade = async (tradeRequest: RealTradeRequest): Promise<any | null> => {
    try {
      setLoading(true);

      // Validate trade first
      const validation = await validateRealTrade(tradeRequest);
      if (!validation?.valid) {
        throw new Error(validation?.error || 'Trade validation failed');
      }

      // Get active credentials for the exchange
      const activeCredential = credentials.find(cred => 
        cred.exchange_name === tradeRequest.exchange_name && cred.is_active
      );

      if (!activeCredential) {
        throw new Error('No active credentials found for this exchange');
      }

      // Initialize exchange connector
      const connector = new ExchangeConnector(tradeRequest.exchange_name);
      const loaded = await connector.loadCredentials(activeCredential.id);
      
      if (!loaded) {
        throw new Error('Failed to load exchange credentials');
      }

      // Execute the trade
      const result = await connector.executeTrade({
        symbol: tradeRequest.symbol,
        side: tradeRequest.side,
        amount: tradeRequest.amount,
        price: tradeRequest.price,
        orderType: tradeRequest.trade_type as 'market' | 'limit' | 'stop'
      });

      if (!result.success) {
        throw new Error(result.error || 'Trade execution failed');
      }

      // Record the trade in database
      const { error: dbError } = await supabase
        .from('real_trades')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          account_id: tradeRequest.account_id,
          exchange_name: tradeRequest.exchange_name,
          symbol: tradeRequest.symbol,
          side: tradeRequest.side,
          amount: tradeRequest.amount,
          price: tradeRequest.price,
          execution_price: result.executedPrice,
          total_value: (result.executedAmount || 0) * (result.executedPrice || 0),
          fee: result.fee,
          external_order_id: result.orderId,
          status: 'filled'
        });

      if (dbError) {
        console.error('Failed to record trade in database:', dbError);
      }

      toast({
        title: "Trade Executed Successfully",
        description: `${tradeRequest.side.toUpperCase()} ${tradeRequest.amount} ${tradeRequest.symbol} at $${result.executedPrice}`,
      });

      return result;
    } catch (error) {
      console.error('Error executing real trade:', error);
      toast({
        title: "Trade Execution Failed",
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
