
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  order_type: 'market' | 'limit';
  price?: number;
  account_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const tradeData: TradeRequest = await req.json();
    const { symbol, side, amount, order_type, price, account_id } = tradeData;

    console.log('Processing paper trade:', tradeData);

    // Get current market price if not provided
    let currentPrice = price;
    if (!currentPrice || order_type === 'market') {
      const { data: marketData } = await supabase
        .from('market_data_cache')
        .select('price_usd')
        .eq('symbol', symbol.toUpperCase())
        .single();

      currentPrice = marketData?.price_usd || price || 0;
    }

    if (!currentPrice || currentPrice <= 0) {
      throw new Error(`Invalid price for ${symbol}`);
    }

    // Get user's paper account (use provided account_id or default)
    let accountQuery = supabase
      .from('paper_trading_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (account_id) {
      accountQuery = accountQuery.eq('id', account_id);
    } else {
      accountQuery = accountQuery.eq('is_default', true);
    }

    const { data: account, error: accountError } = await accountQuery.single();

    if (accountError || !account) {
      console.error('Account error:', accountError);
      throw new Error('Paper trading account not found');
    }

    console.log('Using account:', account.account_name, 'Balance:', account.balance);

    // Execute trade using database function
    const { data: result, error: tradeError } = await supabase.rpc('execute_paper_trade', {
      p_user_id: user.id,
      p_account_id: account.id,
      p_symbol: symbol.toUpperCase(),
      p_side: side,
      p_amount: amount,
      p_price: currentPrice,
      p_trade_type: order_type,
      p_order_type: order_type
    });

    if (tradeError) {
      console.error('Trade execution error:', tradeError);
      throw new Error(`Failed to execute trade: ${tradeError.message}`);
    }

    if (!result.success) {
      console.error('Trade failed:', result.error);
      throw new Error(result.error || 'Trade execution failed');
    }

    console.log('Trade executed successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        trade_id: result.trade_id,
        new_balance: result.new_balance,
        trade_value: result.trade_value,
        fee: result.fee,
        message: `${side.toUpperCase()} ${amount} ${symbol} at $${currentPrice.toLocaleString()}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error executing paper trade:', error);
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
