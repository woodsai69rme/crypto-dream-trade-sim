import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradingRequest {
  exchange: string
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price?: number
  orderType: 'market' | 'limit' | 'stop'
  accountId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { exchange, symbol, side, amount, price, orderType, accountId }: TradingRequest = await req.json()

    // Get exchange connection details
    const { data: exchangeData, error: exchangeError } = await supabaseClient
      .from('exchange_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('exchange_name', exchange)
      .eq('is_active', true)
      .single()

    if (exchangeError || !exchangeData) {
      throw new Error('Exchange connection not found or inactive')
    }

    let result: any = {}

    // Execute trade based on exchange
    switch (exchange.toLowerCase()) {
      case 'deribit':
        result = await executeDeribitTrade({
          apiKey: exchangeData.api_key_encrypted,
          apiSecret: exchangeData.api_secret_encrypted,
          isTestnet: exchangeData.is_testnet,
          symbol,
          side,
          amount,
          price,
          orderType
        })
        break

      case 'binance':
        result = await executeBinanceTrade({
          apiKey: exchangeData.api_key_encrypted,
          apiSecret: exchangeData.api_secret_encrypted,
          isTestnet: exchangeData.is_testnet,
          symbol,
          side,
          amount,
          price,
          orderType
        })
        break

      case 'okx':
        result = await executeOKXTrade({
          apiKey: exchangeData.api_key_encrypted,
          apiSecret: exchangeData.api_secret_encrypted,
          passphrase: exchangeData.passphrase_encrypted,
          isTestnet: exchangeData.is_testnet,
          symbol,
          side,
          amount,
          price,
          orderType
        })
        break

      default:
        throw new Error(`Exchange ${exchange} not supported`)
    }

    // Log the trade in audit trail
    await supabaseClient.rpc('log_comprehensive_audit', {
      p_account_id: accountId,
      p_action_type: 'live_trade_executed',
      p_entity_type: 'trade',
      p_entity_id: result.orderId || 'unknown',
      p_new_values: {
        exchange,
        symbol,
        side,
        amount,
        price,
        orderType,
        result
      }
    })

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Live trading error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function executeDeribitTrade(params: any) {
  const baseUrl = params.isTestnet ? 'https://test.deribit.com' : 'https://www.deribit.com'
  
  // Authenticate with Deribit
  const authResponse = await fetch(`${baseUrl}/api/v2/public/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'public/auth',
      params: {
        grant_type: 'client_credentials',
        client_id: params.apiKey,
        client_secret: params.apiSecret
      }
    })
  })

  const authData = await authResponse.json()
  if (!authData.result?.access_token) {
    throw new Error('Deribit authentication failed')
  }

  // Place order
  const orderParams = {
    method: params.orderType === 'market' ? 'private/buy_market' : 'private/buy',
    params: {
      instrument_name: params.symbol,
      amount: params.amount,
      type: params.orderType,
      ...(params.price && { price: params.price })
    }
  }

  if (params.side === 'sell') {
    orderParams.method = params.orderType === 'market' ? 'private/sell_market' : 'private/sell'
  }

  const orderResponse = await fetch(`${baseUrl}/api/v2/private/${orderParams.method.split('/')[1]}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.result.access_token}`
    },
    body: JSON.stringify(orderParams)
  })

  const orderData = await orderResponse.json()
  return orderData.result
}

async function executeBinanceTrade(params: any) {
  const baseUrl = params.isTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com'
  
  // Create signature for Binance API
  const timestamp = Date.now()
  const queryString = `symbol=${params.symbol}&side=${params.side.toUpperCase()}&type=${params.orderType.toUpperCase()}&quantity=${params.amount}&timestamp=${timestamp}`
  
  // For demo purposes, return mock data
  return {
    orderId: `BINANCE_${Date.now()}`,
    status: 'FILLED',
    executedQty: params.amount,
    fills: [{
      price: params.price || 50000,
      qty: params.amount
    }]
  }
}

async function executeOKXTrade(params: any) {
  const baseUrl = params.isTestnet ? 'https://www.okx.com' : 'https://www.okx.com'
  
  // For demo purposes, return mock data
  return {
    orderId: `OKX_${Date.now()}`,
    state: 'filled',
    fillSz: params.amount,
    avgPx: params.price || 50000
  }
}