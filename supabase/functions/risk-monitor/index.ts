// Risk Monitor Edge Function
// Monitors positions and triggers alerts/emergency stops

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MonitorRequest {
  accountId?: string
  checkType?: 'all' | 'drawdown' | 'daily_loss' | 'position' | 'volatility'
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

    const { accountId, checkType = 'all' }: MonitorRequest = await req.json()

    // Get accounts to monitor
    let accountQuery = supabaseClient
      .from('trading_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (accountId) {
      accountQuery = accountQuery.eq('id', accountId)
    }

    const { data: accounts, error: accountError } = await accountQuery
    if (accountError) throw accountError

    const alerts: any[] = []
    const actions: any[] = []

    for (const account of accounts || []) {
      // Skip if emergency stop already active
      if (account.emergency_stop) continue

      // Check Drawdown
      if (checkType === 'all' || checkType === 'drawdown') {
        const drawdown = ((account.initial_balance - account.current_balance) / account.initial_balance) * 100
        
        if (drawdown >= account.max_drawdown) {
          alerts.push({
            account_id: account.id,
            alert_type: 'risk',
            severity: 'emergency',
            title: 'Maximum Drawdown Reached',
            message: `Account drawdown of ${drawdown.toFixed(2)}% has exceeded the ${account.max_drawdown}% limit`,
            threshold_value: account.max_drawdown,
            current_value: drawdown
          })

          // Trigger emergency stop
          actions.push({
            type: 'emergency_stop',
            account_id: account.id,
            reason: `Max drawdown ${drawdown.toFixed(2)}% exceeded`
          })
        } else if (drawdown >= account.max_drawdown * 0.8) {
          alerts.push({
            account_id: account.id,
            alert_type: 'risk',
            severity: 'warning',
            title: 'Approaching Maximum Drawdown',
            message: `Account drawdown at ${drawdown.toFixed(2)}% - approaching ${account.max_drawdown}% limit`,
            threshold_value: account.max_drawdown,
            current_value: drawdown
          })
        }
      }

      // Check Daily Loss
      if (checkType === 'all' || checkType === 'daily_loss') {
        const today = new Date().toISOString().split('T')[0]
        
        const { data: todayTrades } = await supabaseClient
          .from('trades')
          .select('pnl')
          .eq('account_id', account.id)
          .gte('created_at', `${today}T00:00:00`)
          .not('pnl', 'is', null)

        const dailyPnL = todayTrades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0
        const dailyLossPercentage = dailyPnL < 0 
          ? (Math.abs(dailyPnL) / account.initial_balance) * 100 
          : 0

        if (dailyLossPercentage >= account.max_daily_loss) {
          alerts.push({
            account_id: account.id,
            alert_type: 'risk',
            severity: 'critical',
            title: 'Daily Loss Limit Reached',
            message: `Daily loss of ${dailyLossPercentage.toFixed(2)}% has reached the ${account.max_daily_loss}% limit`,
            threshold_value: account.max_daily_loss,
            current_value: dailyLossPercentage
          })

          // Trigger circuit breaker
          actions.push({
            type: 'circuit_breaker',
            account_id: account.id,
            breaker_type: 'daily_loss',
            reason: `Daily loss limit ${dailyLossPercentage.toFixed(2)}% exceeded`
          })
        }
      }

      // Check Position Concentration
      if (checkType === 'all' || checkType === 'position') {
        const { data: holdings } = await supabaseClient
          .from('portfolio_holdings')
          .select('*')
          .eq('account_id', account.id)

        if (holdings && holdings.length > 0) {
          const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0)
          
          for (const holding of holdings) {
            const concentration = ((holding.current_value || 0) / totalValue) * 100
            
            if (concentration > account.max_position_size * 1.5) {
              alerts.push({
                account_id: account.id,
                alert_type: 'risk',
                severity: 'warning',
                title: 'High Position Concentration',
                message: `${holding.symbol} represents ${concentration.toFixed(2)}% of portfolio`,
                symbol: holding.symbol,
                threshold_value: account.max_position_size,
                current_value: concentration
              })
            }
          }

          // Check unrealized losses
          for (const holding of holdings) {
            if (holding.unrealized_pnl_percentage && holding.unrealized_pnl_percentage < -10) {
              alerts.push({
                account_id: account.id,
                alert_type: 'trade',
                severity: 'warning',
                title: 'Significant Unrealized Loss',
                message: `${holding.symbol} is down ${Math.abs(holding.unrealized_pnl_percentage).toFixed(2)}%`,
                symbol: holding.symbol,
                current_value: holding.unrealized_pnl_percentage
              })
            }
          }
        }
      }
    }

    // Insert alerts
    if (alerts.length > 0) {
      const alertsWithUser = alerts.map(a => ({ ...a, user_id: user.id }))
      await supabaseClient.from('risk_alerts').insert(alertsWithUser)
    }

    // Execute actions
    for (const action of actions) {
      if (action.type === 'emergency_stop') {
        // Activate emergency stop
        await supabaseClient
          .from('trading_accounts')
          .update({ emergency_stop: true })
          .eq('id', action.account_id)

        await supabaseClient
          .from('emergency_stops')
          .insert({
            user_id: user.id,
            account_id: action.account_id,
            triggered_by: 'risk_monitor',
            reason: action.reason,
            is_active: true
          })

        console.log(`[RISK] Emergency stop triggered for account ${action.account_id}`)
      }

      if (action.type === 'circuit_breaker') {
        await supabaseClient
          .from('circuit_breakers')
          .upsert({
            user_id: user.id,
            account_id: action.account_id,
            breaker_type: action.breaker_type,
            threshold: 0,
            is_triggered: true,
            triggered_at: new Date().toISOString(),
            action_on_trigger: 'pause_trading'
          }, {
            onConflict: 'account_id,breaker_type'
          })

        console.log(`[RISK] Circuit breaker ${action.breaker_type} triggered for account ${action.account_id}`)
      }
    }

    // Send notifications for critical alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency')
    for (const alert of criticalAlerts) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'risk_alert',
          title: alert.title,
          message: alert.message,
          data: { alert_type: alert.alert_type, severity: alert.severity }
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts: alerts.length,
        actions: actions.length,
        details: { alerts, actions }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[RISK] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
