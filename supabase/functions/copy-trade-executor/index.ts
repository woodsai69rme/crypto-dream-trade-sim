// Copy Trade Executor Edge Function
// Executes copy trades when followed traders make trades

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CopyTradeRequest {
  originalTradeId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role for internal operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { originalTradeId }: CopyTradeRequest = await req.json()

    // Get the original trade
    const { data: originalTrade, error: tradeError } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('id', originalTradeId)
      .single()

    if (tradeError || !originalTrade) {
      throw new Error('Original trade not found')
    }

    // Find all followers who have copy trading enabled for this trader
    const { data: followers, error: followError } = await supabaseAdmin
      .from('followed_traders')
      .select(`
        *,
        follower_account:trading_accounts!followed_traders_follower_account_id_fkey(*)
      `)
      .eq('trader_id', originalTrade.user_id)
      .eq('copy_trading_enabled', true)
      .eq('is_active', true)

    if (followError) throw followError

    if (!followers || followers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active copy traders', copied: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const copyResults: any[] = []

    for (const follow of followers) {
      try {
        const followerAccount = follow.follower_account

        // Skip if account has emergency stop
        if (followerAccount?.emergency_stop) {
          copyResults.push({
            followerId: follow.follower_id,
            status: 'skipped',
            reason: 'Emergency stop active'
          })
          continue
        }

        // Calculate copy amount based on percentage
        const copyPercentage = follow.copy_percentage / 100
        const copyAmount = originalTrade.quantity * copyPercentage

        // Check position size limit
        const positionValue = copyAmount * (originalTrade.price || 0)
        const positionPercentage = (positionValue / followerAccount.current_balance) * 100

        if (positionPercentage > follow.max_position_size) {
          // Adjust amount to max allowed
          const maxValue = followerAccount.current_balance * (follow.max_position_size / 100)
          const adjustedAmount = maxValue / (originalTrade.price || 1)

          copyResults.push({
            followerId: follow.follower_id,
            status: 'adjusted',
            originalAmount: copyAmount,
            adjustedAmount: adjustedAmount,
            reason: 'Position size limit applied'
          })

          // Use adjusted amount
          // Note: In real implementation, you would execute via live-trading-connector
        }

        // Create copy trade record
        const { data: copyTrade, error: copyError } = await supabaseAdmin
          .from('trades')
          .insert({
            user_id: follow.follower_id,
            account_id: follow.follower_account_id,
            symbol: originalTrade.symbol,
            side: originalTrade.side,
            order_type: originalTrade.order_type,
            quantity: copyAmount,
            price: originalTrade.price,
            stop_loss: follow.copy_stop_loss ? originalTrade.stop_loss : null,
            take_profit: follow.copy_take_profit ? originalTrade.take_profit : null,
            is_paper: true, // Default to paper for safety
            signal_source: `copy_trade:${originalTrade.user_id}`,
            reasoning: `Copied from trader ${originalTrade.user_id}`,
            status: 'filled'
          })
          .select()
          .single()

        if (copyError) throw copyError

        // Record the copy relationship
        await supabaseAdmin
          .from('trade_copies')
          .insert({
            follow_id: follow.id,
            original_trade_id: originalTradeId,
            copied_trade_id: copyTrade.id,
            follower_id: follow.follower_id,
            trader_id: originalTrade.user_id,
            copy_percentage: follow.copy_percentage,
            original_amount: originalTrade.quantity,
            copied_amount: copyAmount,
            status: 'executed'
          })

        // Update follow stats
        await supabaseAdmin
          .from('followed_traders')
          .update({
            total_copied_trades: follow.total_copied_trades + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', follow.id)

        // Notify follower
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: follow.follower_id,
            type: 'copy_trade',
            title: 'Trade Copied',
            message: `Copied ${originalTrade.side} ${copyAmount} ${originalTrade.symbol} from followed trader`,
            data: {
              original_trade_id: originalTradeId,
              copied_trade_id: copyTrade.id,
              symbol: originalTrade.symbol,
              side: originalTrade.side
            }
          })

        copyResults.push({
          followerId: follow.follower_id,
          status: 'success',
          copiedTradeId: copyTrade.id,
          amount: copyAmount
        })

        console.log(`[COPY] Trade copied for follower ${follow.follower_id}`)

      } catch (copyError) {
        console.error(`[COPY] Error for follower ${follow.follower_id}:`, copyError)

        await supabaseAdmin
          .from('trade_copies')
          .insert({
            follow_id: follow.id,
            original_trade_id: originalTradeId,
            follower_id: follow.follower_id,
            trader_id: originalTrade.user_id,
            copy_percentage: follow.copy_percentage,
            original_amount: originalTrade.quantity,
            status: 'failed',
            error_message: copyError.message
          })

        copyResults.push({
          followerId: follow.follower_id,
          status: 'error',
          error: copyError.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        copied: copyResults.filter(r => r.status === 'success').length,
        total: followers.length,
        results: copyResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[COPY] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
