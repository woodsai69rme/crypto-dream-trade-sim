// Balance Sync Edge Function
// Syncs balances and positions from connected exchanges

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getBalances, type ExchangeCredentials } from '../_shared/ccxt-wrapper.ts'
import { decryptCredentials } from '../_shared/encryption.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  accountId?: string
  exchangeId?: string
  forceSync?: boolean
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

    const { accountId, exchangeId, forceSync }: SyncRequest = await req.json()

    // Get exchange connections to sync
    let query = supabaseClient
      .from('exchange_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (exchangeId) {
      query = query.eq('id', exchangeId)
    }

    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    const { data: connections, error: connError } = await query

    if (connError) throw new Error(`Failed to fetch connections: ${connError.message}`)
    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active connections to sync', synced: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const syncResults: any[] = []

    for (const conn of connections) {
      try {
        // Check if we need to sync (rate limit check)
        if (!forceSync && conn.last_sync_at) {
          const lastSync = new Date(conn.last_sync_at)
          const minInterval = 60000 // 1 minute
          if (Date.now() - lastSync.getTime() < minInterval) {
            syncResults.push({
              exchange: conn.exchange,
              status: 'skipped',
              reason: 'Rate limited - synced recently'
            })
            continue
          }
        }

        // Decrypt credentials
        const credentials: ExchangeCredentials = await decryptCredentials({
          apiKeyEncrypted: conn.api_key_encrypted,
          apiSecretEncrypted: conn.api_secret_encrypted,
          passphraseEncrypted: conn.passphrase_encrypted,
          iv: conn.encryption_iv,
          salt: conn.encryption_salt
        })
        credentials.isTestnet = conn.is_testnet

        // Fetch balances from exchange
        const balances = await getBalances(conn.exchange, credentials)

        // Update portfolio holdings
        for (const balance of balances) {
          if (balance.total <= 0) continue

          // Get current price from market data cache
          const { data: marketData } = await supabaseClient
            .from('market_data_cache')
            .select('price')
            .eq('symbol', balance.currency)
            .single()

          const currentPrice = marketData?.price || 0
          const currentValue = balance.total * currentPrice

          // Upsert holding
          await supabaseClient
            .from('portfolio_holdings')
            .upsert({
              user_id: user.id,
              account_id: conn.account_id,
              symbol: balance.currency,
              quantity: balance.total,
              current_price: currentPrice,
              current_value: currentValue,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'account_id,symbol'
            })
        }

        // Calculate total portfolio value
        const totalValue = balances.reduce((sum, b) => sum + b.total, 0)

        // Update exchange connection status
        await supabaseClient
          .from('exchange_connections')
          .update({
            last_sync_at: new Date().toISOString(),
            connection_status: 'connected',
            error_message: null
          })
          .eq('id', conn.id)

        // Update trading account balance if linked
        if (conn.account_id) {
          const { data: holdings } = await supabaseClient
            .from('portfolio_holdings')
            .select('current_value')
            .eq('account_id', conn.account_id)

          const portfolioValue = holdings?.reduce((sum, h) => sum + (h.current_value || 0), 0) || 0

          await supabaseClient
            .from('trading_accounts')
            .update({
              current_balance: portfolioValue,
              updated_at: new Date().toISOString()
            })
            .eq('id', conn.account_id)
        }

        syncResults.push({
          exchange: conn.exchange,
          status: 'success',
          balances: balances.length,
          holdings: balances.filter(b => b.total > 0).length
        })

        console.log(`[SYNC] ${conn.exchange}: Synced ${balances.length} balances`)

      } catch (error) {
        console.error(`[SYNC] ${conn.exchange} error:`, error)

        // Update connection with error status
        await supabaseClient
          .from('exchange_connections')
          .update({
            connection_status: 'error',
            error_message: error.message
          })
          .eq('id', conn.id)

        syncResults.push({
          exchange: conn.exchange,
          status: 'error',
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncResults,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SYNC] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
