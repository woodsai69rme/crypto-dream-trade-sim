// AI Signal Generator Edge Function
// Generates trading signals using Lovable AI Gateway

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignalRequest {
  botId: string
  symbols?: string[]
  timeframe?: string
  useMarketData?: boolean
  useSentiment?: boolean
}

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
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

    const { botId, symbols, timeframe = '1h', useMarketData = true, useSentiment = false }: SignalRequest = await req.json()

    // Get bot configuration
    const { data: bot, error: botError } = await supabaseClient
      .from('ai_trading_bots')
      .select('*')
      .eq('id', botId)
      .eq('user_id', user.id)
      .single()

    if (botError || !bot) {
      throw new Error('Bot not found or unauthorized')
    }

    if (bot.status !== 'active') {
      throw new Error('Bot is not active')
    }

    const targetSymbols = symbols || bot.target_symbols || ['BTC', 'ETH']

    // Fetch market data for target symbols
    let marketDataContext = ''
    if (useMarketData) {
      const { data: marketData } = await supabaseClient
        .from('market_data_cache')
        .select('*')
        .in('symbol', targetSymbols)

      if (marketData && marketData.length > 0) {
        marketDataContext = `\nCurrent Market Data:\n${marketData.map((m: MarketData) => 
          `${m.symbol}: $${m.price?.toFixed(2)} (${m.change24h > 0 ? '+' : ''}${m.change24h?.toFixed(2)}%), Vol: $${(m.volume24h / 1e9)?.toFixed(2)}B, 24h Range: $${m.low24h?.toFixed(2)}-$${m.high24h?.toFixed(2)}`
        ).join('\n')}`
      }
    }

    // Get recent trades for context
    const { data: recentTrades } = await supabaseClient
      .from('trades')
      .select('symbol, side, price, pnl, created_at')
      .eq('user_id', user.id)
      .in('symbol', targetSymbols.map(s => `${s}/USD`))
      .order('created_at', { ascending: false })
      .limit(10)

    let tradeHistoryContext = ''
    if (recentTrades && recentTrades.length > 0) {
      tradeHistoryContext = `\nRecent Trade History:\n${recentTrades.map(t => 
        `${t.symbol} ${t.side} @ $${t.price} (PnL: ${t.pnl ? (t.pnl > 0 ? '+' : '') + t.pnl.toFixed(2) : 'pending'})`
      ).join('\n')}`
    }

    // Build AI prompt based on bot strategy
    const systemPrompt = `You are an AI trading signal generator for a ${bot.strategy} strategy bot.
Your risk level is ${bot.risk_level}. 
You analyze market data and generate actionable trading signals.

Guidelines:
- For ${bot.strategy} strategy, focus on ${getStrategyFocus(bot.strategy)}
- Risk level ${bot.risk_level}: ${getRiskGuidelines(bot.risk_level)}
- Only suggest trades when confidence is above 60%
- Always include stop loss and take profit levels
- Consider position sizing based on ${bot.max_position_size}% max position

Respond in JSON format only:
{
  "signals": [
    {
      "symbol": "BTC",
      "action": "buy" or "sell" or "hold",
      "strength": 0-100,
      "confidence": 0-100,
      "entry_price": number,
      "stop_loss": number,
      "take_profit": number,
      "reasoning": "brief explanation",
      "timeframe": "${timeframe}"
    }
  ],
  "market_summary": "brief overall market assessment"
}`

    const userPrompt = `Generate trading signals for: ${targetSymbols.join(', ')}
Timeframe: ${timeframe}
${marketDataContext}
${tradeHistoryContext}

Analyze the data and provide trading signals based on the ${bot.strategy} strategy.`

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`
      },
      body: JSON.stringify({
        model: bot.ai_model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`AI Gateway error: ${errorText}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content

    // Parse AI response
    let signalData
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        signalData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON in response')
      }
    } catch (parseError) {
      console.error('[AI] Parse error:', parseError, 'Content:', content)
      throw new Error('Failed to parse AI response')
    }

    // Store signals in database
    const signalsToInsert = signalData.signals
      .filter((s: any) => s.action !== 'hold' && s.confidence >= 60)
      .map((s: any) => ({
        user_id: user.id,
        bot_id: botId,
        symbol: s.symbol,
        signal_type: s.action,
        strength: s.strength,
        confidence: s.confidence,
        source: `ai_bot:${bot.strategy}`,
        price_at_signal: s.entry_price,
        target_price: s.take_profit,
        stop_loss: s.stop_loss,
        timeframe: s.timeframe,
        reasoning: s.reasoning,
        indicators: { strategy: bot.strategy, model: bot.ai_model },
        is_active: true,
        expires_at: new Date(Date.now() + getTimeframeMs(timeframe)).toISOString()
      }))

    if (signalsToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('trading_signals')
        .insert(signalsToInsert)

      if (insertError) {
        console.error('[AI] Signal insert error:', insertError)
      }
    }

    // Update bot last signal time
    await supabaseClient
      .from('ai_trading_bots')
      .update({ 
        last_signal_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', botId)

    console.log(`[AI] Generated ${signalsToInsert.length} signals for bot ${botId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        signals: signalData.signals,
        market_summary: signalData.market_summary,
        stored: signalsToInsert.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[AI] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function getStrategyFocus(strategy: string): string {
  const focuses: Record<string, string> = {
    'trend_following': 'identifying and following established price trends using moving averages and momentum',
    'mean_reversion': 'finding overbought/oversold conditions where price may revert to mean',
    'grid_trading': 'placing orders at regular intervals to profit from market oscillations',
    'dca': 'systematic buying at regular intervals regardless of price',
    'breakout': 'identifying key support/resistance levels and trading breakouts',
    'scalping': 'quick small profits from minor price movements',
    'swing_trading': 'capturing gains over several days to weeks',
    'momentum': 'trading assets showing strong directional movement',
    'arbitrage': 'exploiting price differences across exchanges',
    'sentiment': 'trading based on market sentiment and social indicators'
  }
  return focuses[strategy] || 'general market analysis and opportunity identification'
}

function getRiskGuidelines(riskLevel: string): string {
  const guidelines: Record<string, string> = {
    'conservative': 'Prioritize capital preservation. Only high-confidence trades. Tight stop losses. Max 2% risk per trade.',
    'moderate': 'Balance risk/reward. Medium confidence acceptable. Standard stop losses. Max 5% risk per trade.',
    'aggressive': 'Higher risk tolerance. Lower confidence acceptable. Wider stop losses. Max 10% risk per trade.',
    'custom': 'Follow custom risk parameters defined by user.'
  }
  return guidelines[riskLevel] || guidelines['moderate']
}

function getTimeframeMs(timeframe: string): number {
  const multipliers: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  }
  return multipliers[timeframe] || 60 * 60 * 1000
}
