// Enhanced Live Trading Connector with Real CCXT-style Exchange Integration
// Supports: Binance, Deribit, Kraken, KuCoin, OKX, Bybit

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  createBinanceOrder, 
  createDeribitOrder, 
  createKrakenOrder,
  createKuCoinOrder,
  createOKXOrder,
  createBybitOrder,
  getBalances,
  type OrderParams,
  type OrderResult,
  type ExchangeCredentials
} from '../_shared/ccxt-wrapper.ts'
import { decryptCredentials } from '../_shared/encryption.ts'

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
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop'
  accountId: string
  stopLoss?: number
  takeProfit?: number
  leverage?: number
}

interface RiskValidation {
  valid: boolean
  reason?: string
  riskScore: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  let userId: string | undefined
  let tradeRequest: TradingRequest | undefined

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Authenticate user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized - Please log in to trade')
    }
    userId = user.id

    tradeRequest = await req.json() as TradingRequest
    console.log(`[TRADE] User ${userId} requesting ${tradeRequest.side} ${tradeRequest.amount} ${tradeRequest.symbol} on ${tradeRequest.exchange}`)

    // Validate account exists and belongs to user
    const { data: account, error: accountError } = await supabaseClient
      .from('trading_accounts')
      .select('*')
      .eq('id', tradeRequest.accountId)
      .eq('user_id', userId)
      .single()

    if (accountError || !account) {
      throw new Error('Trading account not found or unauthorized')
    }

    // Check emergency stop
    if (account.emergency_stop) {
      throw new Error('Emergency stop is active on this account. Trading is disabled.')
    }

    // Check circuit breakers
    const { data: circuitBreakers } = await supabaseClient
      .from('circuit_breakers')
      .select('*')
      .eq('account_id', tradeRequest.accountId)
      .eq('is_triggered', true)

    if (circuitBreakers && circuitBreakers.length > 0) {
      throw new Error(`Circuit breaker triggered: ${circuitBreakers[0].breaker_type}`)
    }

    // Get exchange connection with encrypted credentials
    const { data: exchangeConn, error: exchangeError } = await supabaseClient
      .from('exchange_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('exchange', tradeRequest.exchange.toLowerCase())
      .eq('is_active', true)
      .single()

    if (exchangeError || !exchangeConn) {
      throw new Error(`No active ${tradeRequest.exchange} connection found. Please configure API keys.`)
    }

    // Decrypt credentials
    let credentials: ExchangeCredentials
    try {
      const decrypted = await decryptCredentials({
        apiKeyEncrypted: exchangeConn.api_key_encrypted,
        apiSecretEncrypted: exchangeConn.api_secret_encrypted,
        passphraseEncrypted: exchangeConn.passphrase_encrypted,
        iv: exchangeConn.encryption_iv,
        salt: exchangeConn.encryption_salt
      })
      credentials = {
        ...decrypted,
        isTestnet: exchangeConn.is_testnet
      }
    } catch (decryptError) {
      console.error('[TRADE] Credential decryption failed:', decryptError)
      throw new Error('Failed to decrypt exchange credentials. Please re-enter your API keys.')
    }

    // Validate trade against risk parameters
    const riskValidation = await validateTradeRisk(supabaseClient, account, tradeRequest)
    if (!riskValidation.valid) {
      throw new Error(`Risk validation failed: ${riskValidation.reason}`)
    }

    // Execute trade on exchange
    const orderParams: OrderParams = {
      symbol: tradeRequest.symbol,
      side: tradeRequest.side,
      type: tradeRequest.orderType,
      amount: tradeRequest.amount,
      price: tradeRequest.price,
      params: {
        stopLoss: tradeRequest.stopLoss,
        takeProfit: tradeRequest.takeProfit,
        leverage: tradeRequest.leverage
      }
    }

    let result: OrderResult

    switch (tradeRequest.exchange.toLowerCase()) {
      case 'binance':
        result = await createBinanceOrder(credentials, orderParams)
        break
      case 'deribit':
        result = await createDeribitOrder(credentials, orderParams)
        break
      case 'kraken':
        result = await createKrakenOrder(credentials, orderParams)
        break
      case 'kucoin':
        result = await createKuCoinOrder(credentials, orderParams)
        break
      case 'okx':
        result = await createOKXOrder(credentials, orderParams)
        break
      case 'bybit':
        result = await createBybitOrder(credentials, orderParams)
        break
      default:
        throw new Error(`Exchange ${tradeRequest.exchange} is not supported`)
    }

    const executionTime = Date.now() - startTime

    // Record trade in database
    const { data: tradeRecord, error: tradeError } = await supabaseClient
      .from('trades')
      .insert({
        user_id: userId,
        account_id: tradeRequest.accountId,
        exchange_connection_id: exchangeConn.id,
        external_order_id: result.id,
        symbol: tradeRequest.symbol,
        side: tradeRequest.side,
        order_type: tradeRequest.orderType,
        status: result.status,
        quantity: tradeRequest.amount,
        price: tradeRequest.price,
        executed_price: result.average,
        executed_quantity: result.filled,
        total_value: result.cost,
        fee: result.fee?.cost || 0,
        fee_currency: result.fee?.currency || 'USD',
        stop_loss: tradeRequest.stopLoss,
        take_profit: tradeRequest.takeProfit,
        leverage: tradeRequest.leverage || 1,
        is_paper: false,
        execution_time_ms: executionTime,
        metadata: { raw: result.raw },
        executed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (tradeError) {
      console.error('[TRADE] Failed to record trade:', tradeError)
    }

    // Update last connection time
    await supabaseClient
      .from('exchange_connections')
      .update({ 
        last_connected_at: new Date().toISOString(),
        connection_status: 'connected'
      })
      .eq('id', exchangeConn.id)

    // Log audit event
    await supabaseClient.rpc('log_audit_event', {
      p_action: 'live_trade_executed',
      p_entity_type: 'trades',
      p_entity_id: tradeRecord?.id,
      p_new_values: {
        exchange: tradeRequest.exchange,
        symbol: tradeRequest.symbol,
        side: tradeRequest.side,
        amount: tradeRequest.amount,
        executed_price: result.average,
        order_id: result.id
      },
      p_metadata: {
        execution_time_ms: executionTime,
        risk_score: riskValidation.riskScore
      }
    })

    console.log(`[TRADE] Success - Order ${result.id} on ${tradeRequest.exchange}: ${result.status}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: {
          orderId: result.id,
          status: result.status,
          filled: result.filled,
          remaining: result.remaining,
          averagePrice: result.average,
          cost: result.cost,
          fee: result.fee,
          executionTime: executionTime
        },
        tradeId: tradeRecord?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[TRADE] Error:', error)

    // Log failed trade attempt
    if (userId && tradeRequest) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        await supabaseClient.rpc('log_audit_event', {
          p_action: 'live_trade_failed',
          p_entity_type: 'trades',
          p_new_values: {
            exchange: tradeRequest.exchange,
            symbol: tradeRequest.symbol,
            side: tradeRequest.side,
            amount: tradeRequest.amount,
            error: error.message
          }
        })
      } catch (logError) {
        console.error('[TRADE] Failed to log error:', logError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        code: getErrorCode(error.message)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

// Risk validation function
async function validateTradeRisk(
  supabase: any,
  account: any,
  trade: TradingRequest
): Promise<RiskValidation> {
  let riskScore = 0
  const issues: string[] = []

  // Calculate trade value
  const tradeValue = trade.amount * (trade.price || 0)
  const positionPercentage = (tradeValue / account.current_balance) * 100

  // Check position size limit
  if (positionPercentage > account.max_position_size) {
    issues.push(`Position size ${positionPercentage.toFixed(2)}% exceeds limit of ${account.max_position_size}%`)
    riskScore += 50
  }

  // Check daily loss limit
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTrades } = await supabase
    .from('trades')
    .select('pnl')
    .eq('account_id', account.id)
    .gte('created_at', `${today}T00:00:00`)
    .not('pnl', 'is', null)

  const dailyLoss = todayTrades?.reduce((sum: number, t: any) => sum + (t.pnl < 0 ? Math.abs(t.pnl) : 0), 0) || 0
  const dailyLossPercentage = (dailyLoss / account.initial_balance) * 100

  if (dailyLossPercentage >= account.max_daily_loss) {
    issues.push(`Daily loss limit of ${account.max_daily_loss}% reached`)
    riskScore += 100
  }

  // Check drawdown
  const drawdown = ((account.initial_balance - account.current_balance) / account.initial_balance) * 100
  if (drawdown >= account.max_drawdown) {
    issues.push(`Max drawdown of ${account.max_drawdown}% reached`)
    riskScore += 100
  }

  // Check leverage
  if (trade.leverage && trade.leverage > account.leverage_limit) {
    issues.push(`Leverage ${trade.leverage}x exceeds limit of ${account.leverage_limit}x`)
    riskScore += 30
  }

  // Add risk based on order type
  if (trade.orderType === 'market') {
    riskScore += 10 // Market orders have slippage risk
  }

  // Check for stop loss on non-paper trades
  if (!trade.stopLoss && account.auto_stop_loss) {
    issues.push('Warning: No stop loss set on live trade')
    riskScore += 20
  }

  return {
    valid: issues.length === 0 || riskScore < 100,
    reason: issues.join('; '),
    riskScore: Math.min(riskScore, 100)
  }
}

function getErrorCode(message: string): string {
  if (message.includes('Unauthorized')) return 'AUTH_ERROR'
  if (message.includes('account not found')) return 'ACCOUNT_NOT_FOUND'
  if (message.includes('Emergency stop')) return 'EMERGENCY_STOP'
  if (message.includes('Circuit breaker')) return 'CIRCUIT_BREAKER'
  if (message.includes('connection not found')) return 'NO_EXCHANGE_CONNECTION'
  if (message.includes('decrypt')) return 'CREDENTIAL_ERROR'
  if (message.includes('Risk validation')) return 'RISK_LIMIT'
  if (message.includes('not supported')) return 'UNSUPPORTED_EXCHANGE'
  return 'TRADE_ERROR'
}
