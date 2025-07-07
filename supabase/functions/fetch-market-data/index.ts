
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch data from CoinGecko API
    const coinGeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple,chainlink,uniswap,polkadot,avalanche-2,polygon&vs_currencies=usd,aud&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true'
    
    const response = await fetch(coinGeckoUrl)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform and insert data
    const marketDataInserts = []
    
    for (const [coinId, coinData] of Object.entries(data)) {
      const symbolMap = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH', 
        'solana': 'SOL',
        'cardano': 'ADA',
        'ripple': 'XRP',
        'chainlink': 'LINK',
        'uniswap': 'UNI',
        'polkadot': 'DOT',
        'avalanche-2': 'AVAX',
        'polygon': 'MATIC'
      }
      
      marketDataInserts.push({
        symbol: coinId,
        name: symbolMap[coinId] || coinId.toUpperCase(),
        price_usd: coinData.usd,
        price_aud: coinData.aud,
        volume_24h_usd: coinData.usd_24h_vol,
        volume_24h_aud: coinData.aud_24h_vol,
        change_24h: coinData.usd_24h_change,
        change_percentage_24h: coinData.usd_24h_change,
        market_cap_usd: coinData.usd_market_cap,
        market_cap_aud: coinData.aud_market_cap,
        last_updated: new Date(coinData.last_updated_at * 1000).toISOString(),
        exchange: 'coingecko'
      })
    }

    // Clear old data and insert new data
    await supabaseClient.from('market_data_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const { error: insertError } = await supabaseClient
      .from('market_data_cache')
      .insert(marketDataInserts)

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Market data updated successfully',
        count: marketDataInserts.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching market data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
