
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradeRequest {
  account_id: string;
  exchange_name: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  trade_type: 'market' | 'limit' | 'stop';
  confirmation_token?: string;
}

interface DeribitCredentials {
  clientId: string;
  clientSecret: string;
  isTestnet: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const tradeRequest: TradeRequest = await req.json();
    console.log('Processing trade request:', tradeRequest);

    // Validate the trade using our database function
    const { data: validation, error: validationError } = await supabase.rpc('validate_real_trade', {
      p_user_id: user.id,
      p_account_id: tradeRequest.account_id,
      p_symbol: tradeRequest.symbol,
      p_side: tradeRequest.side,
      p_amount: tradeRequest.amount,
      p_price: tradeRequest.price
    });

    if (validationError) {
      throw new Error(`Validation error: ${validationError.message}`);
    }

    const validationResult = validation as any;
    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get exchange credentials
    const { data: credentials, error: credError } = await supabase
      .from('real_trading_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('exchange_name', tradeRequest.exchange_name)
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      throw new Error(`No active credentials found for ${tradeRequest.exchange_name}`);
    }

    // Execute trade based on exchange
    let tradeResult;
    if (tradeRequest.exchange_name === 'deribit') {
      tradeResult = await executeDeribitTrade(credentials, tradeRequest);
    } else {
      throw new Error(`Exchange ${tradeRequest.exchange_name} not yet supported`);
    }

    // Record the trade result in database
    const { data: dbResult, error: dbError } = await supabase.rpc('execute_real_trade', {
      p_user_id: user.id,
      p_account_id: tradeRequest.account_id,
      p_exchange_name: tradeRequest.exchange_name,
      p_symbol: tradeRequest.symbol,
      p_side: tradeRequest.side,
      p_amount: tradeRequest.amount,
      p_price: tradeRequest.price,
      p_confirmation_token: tradeRequest.confirmation_token || null
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        trade_result: tradeResult,
        database_result: dbResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Trade execution error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function executeDeribitTrade(credentials: any, tradeRequest: TradeRequest) {
  console.log('Executing Deribit trade...');
  
  // Decode credentials (in production, use proper decryption)
  const apiKey = atob(credentials.api_key_encrypted);
  const apiSecret = atob(credentials.api_secret_encrypted);
  
  const baseUrl = credentials.is_testnet 
    ? 'https://test.deribit.com/api/v2'
    : 'https://www.deribit.com/api/v2';

  try {
    // Get access token
    const authResponse = await fetch(`${baseUrl}/public/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'public/auth',
        params: {
          grant_type: 'client_credentials',
          client_id: apiKey,
          client_secret: apiSecret
        }
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.result.access_token;

    // Map symbol to Deribit format
    const instrument = mapSymbolToDeribit(tradeRequest.symbol);
    
    // Place order
    const orderResponse = await fetch(`${baseUrl}/private/${tradeRequest.side}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        method: `private/${tradeRequest.side}`,
        params: {
          instrument_name: instrument,
          amount: tradeRequest.amount,
          type: tradeRequest.trade_type,
          price: tradeRequest.trade_type === 'market' ? undefined : tradeRequest.price
        }
      })
    });

    if (!orderResponse.ok) {
      throw new Error(`Order failed: ${orderResponse.statusText}`);
    }

    const orderData = await orderResponse.json();
    
    if (orderData.error) {
      throw new Error(`Deribit error: ${orderData.error.message}`);
    }

    console.log('Deribit trade successful:', orderData.result);
    
    return {
      order_id: orderData.result.order.order_id,
      filled_amount: orderData.result.order.filled_amount || 0,
      average_price: orderData.result.order.average_price || tradeRequest.price,
      order_state: orderData.result.order.order_state,
      creation_timestamp: orderData.result.order.creation_timestamp,
      fee: orderData.result.order.commission || 0
    };

  } catch (error) {
    console.error('Deribit trade error:', error);
    throw new Error(`Deribit execution failed: ${error.message}`);
  }
}

function mapSymbolToDeribit(symbol: string): string {
  // Map common symbols to Deribit instrument names
  const symbolMap: { [key: string]: string } = {
    'BTC': 'BTC-PERPETUAL',
    'ETH': 'ETH-PERPETUAL',
    'SOL': 'SOL-PERPETUAL'
  };
  
  return symbolMap[symbol] || `${symbol}-PERPETUAL`;
}
