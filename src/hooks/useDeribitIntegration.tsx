import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface DeribitCredentials {
  clientId: string;
  clientSecret: string;
  isTestnet: boolean;
}

export interface DeribitPosition {
  instrument_name: string;
  size: number;
  direction: 'buy' | 'sell';
  average_price: number;
  mark_price: number;
  index_price: number;
  unrealized_pnl: number | null;
  maintenance_margin: number;
}

export interface DeribitOrder {
  order_id: string;
  instrument_name: string;
  amount: number;
  price?: number;
  direction: 'buy' | 'sell';
  order_type: 'limit' | 'market' | 'stop_limit';
  order_state: 'open' | 'filled' | 'rejected' | 'cancelled';
  filled_amount: number;
  average_price?: number;
  creation_timestamp: number;
}

export const useDeribitIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [positions, setPositions] = useState<DeribitPosition[]>([]);
  const [orders, setOrders] = useState<DeribitOrder[]>([]);
  const [savedCredentials, setSavedCredentials] = useState<DeribitCredentials | null>(null);

  // Load saved credentials on component mount
  useEffect(() => {
    if (user) {
      loadSavedCredentials();
    }
  }, [user]);

  const loadSavedCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', user?.id)
        .eq('setting_name', 'deribit_credentials')
        .single();

      if (error) {
        console.log('No saved Deribit credentials found');
        return;
      }

      if (data?.setting_value) {
        const credentials = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value;
        setSavedCredentials(credentials as DeribitCredentials);
        console.log('Loaded saved Deribit credentials');
      }
    } catch (error) {
      console.error('Error loading Deribit credentials:', error);
    }
  };

  const saveCredentials = async (credentials: DeribitCredentials) => {
    if (!user) return false;

    try {
      // Convert credentials to JSON-compatible format
      const credentialsJson = JSON.stringify(credentials);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: 'deribit_credentials',
          setting_value: credentialsJson,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving Deribit credentials:', error);
        return false;
      }

      setSavedCredentials(credentials);
      console.log('Deribit credentials saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving Deribit credentials:', error);
      return false;
    }
  };

  const getBaseUrl = (isTestnet: boolean) => {
    return isTestnet ? 'https://test.deribit.com' : 'https://www.deribit.com';
  };

  const authenticate = useCallback(async (credentials: DeribitCredentials) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save Deribit settings",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const baseUrl = getBaseUrl(credentials.isTestnet);
      
      const response = await fetch(`${baseUrl}/api/v2/public/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'public/auth',
          params: {
            grant_type: 'client_credentials',
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Authentication failed');
      }

      // Save credentials after successful authentication
      const saved = await saveCredentials(credentials);
      if (!saved) {
        toast({
          title: "Warning",
          description: "Connected successfully but couldn't save credentials",
          variant: "destructive",
        });
      }

      setAccessToken(data.result.access_token);
      setConnected(true);
      
      toast({
        title: "Deribit Connected",
        description: `Successfully connected to ${credentials.isTestnet ? 'testnet' : 'mainnet'}`,
      });

      return true;
    } catch (error: any) {
      console.error('Deribit authentication error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Deribit",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  const fetchPositions = useCallback(async (isTestnet: boolean) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const baseUrl = getBaseUrl(isTestnet);
      
      const response = await fetch(`${baseUrl}/api/v2/private/get_positions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'private/get_positions',
          params: {
            currency: 'BTC',
            kind: 'future',
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Ensure unrealized_pnl is properly handled
      const processedPositions = (data.result || []).map((position: any) => ({
        ...position,
        unrealized_pnl: position.unrealized_pnl ?? 0,
      }));

      setPositions(processedPositions);
    } catch (error: any) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  const placeOrder = useCallback(async (
    instrumentName: string,
    amount: number,
    direction: 'buy' | 'sell',
    orderType: 'limit' | 'market' = 'market',
    price?: number,
    isTestnet: boolean = true
  ) => {
    if (!accessToken) return null;

    setLoading(true);
    try {
      const baseUrl = getBaseUrl(isTestnet);
      const method = direction === 'buy' ? 'private/buy' : 'private/sell';
      
      const params: any = {
        instrument_name: instrumentName,
        amount: amount,
        type: orderType,
      };

      if (orderType === 'limit' && price) {
        params.price = price;
      }

      const response = await fetch(`${baseUrl}/api/v2/${method}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: method,
          params: params,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      toast({
        title: "Order Placed",
        description: `${direction.toUpperCase()} order for ${amount} ${instrumentName}`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  const fetchOpenOrders = useCallback(async (isTestnet: boolean) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const baseUrl = getBaseUrl(isTestnet);
      
      const response = await fetch(`${baseUrl}/api/v2/private/get_open_orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'private/get_open_orders',
          params: {
            currency: 'BTC',
            kind: 'future',
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setOrders(data.result || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  const disconnect = useCallback(async () => {
    setAccessToken(null);
    setConnected(false);
    setPositions([]);
    setOrders([]);

    // Clear saved credentials
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', user.id)
          .eq('setting_name', 'deribit_credentials');
        
        setSavedCredentials(null);
      } catch (error) {
        console.error('Error clearing saved credentials:', error);
      }
    }
    
    toast({
      title: "Disconnected",
      description: "Deribit connection closed and credentials cleared",
    });
  }, [toast, user]);

  return {
    loading,
    connected,
    positions,
    orders,
    savedCredentials,
    authenticate,
    fetchPositions,
    fetchOpenOrders,
    placeOrder,
    disconnect,
    saveCredentials,
  };
};
