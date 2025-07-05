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
    const { symbol, side, amount, order_type, price } = tradeData;

    // Get current market price
    const { data: marketData } = await supabase
      .from('market_data_cache')
      .select('price_usd')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (!marketData) {
      throw new Error(`Market data not found for ${symbol}`);
    }

    const currentPrice = price || marketData.price_usd;
    const totalValue = amount * currentPrice;
    const fee = totalValue * 0.001; // 0.1% fee

    // Get user's paper account
    const { data: account } = await supabase
      .from('paper_trading_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!account) {
      throw new Error('Paper trading account not found');
    }

    // Check if user has sufficient balance for buy orders
    if (side === 'buy' && account.balance < totalValue + fee) {
      throw new Error('Insufficient balance');
    }

    // Execute the paper trade
    const { data: trade, error: tradeError } = await supabase
      .from('paper_trades')
      .insert({
        user_id: user.id,
        bot_id: null, // Manual trade
        symbol: symbol.toUpperCase(),
        side,
        amount,
        price: currentPrice,
        total_value: totalValue,
        fee,
        status: 'completed',
        reasoning: `Manual ${side} order via trading panel`
      })
      .select()
      .single();

    if (tradeError) {
      throw new Error(`Failed to create trade: ${tradeError.message}`);
    }

    // Update account balance
    const balanceChange = side === 'buy' ? -(totalValue + fee) : (totalValue - fee);
    const newBalance = account.balance + balanceChange;

    await supabase
      .from('paper_trading_accounts')
      .update({ 
        balance: newBalance,
        total_pnl: newBalance - account.initial_balance,
        total_pnl_percentage: ((newBalance - account.initial_balance) / account.initial_balance) * 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id);

    // Update portfolio
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (portfolio) {
      await supabase
        .from('portfolios')
        .update({
          current_balance: newBalance,
          total_value: newBalance,
          total_pnl: newBalance - portfolio.initial_balance,
          total_pnl_percentage: ((newBalance - portfolio.initial_balance) / portfolio.initial_balance) * 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio.id);
    }

    console.log(`Paper trade executed: ${side} ${amount} ${symbol} at ${currentPrice}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        trade,
        new_balance: newBalance
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error executing paper trade:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});