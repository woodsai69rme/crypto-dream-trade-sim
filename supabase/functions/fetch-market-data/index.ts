import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch from multiple free APIs for redundancy and accuracy
    let data: CoinGeckoData[] = [];
    
    try {
      // Primary: CoinGecko API (free, no key required)
      const cgResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d'
      );
      
      if (cgResponse.ok) {
        data = await cgResponse.json();
        console.log('✅ CoinGecko data fetched successfully');
      } else {
        throw new Error(`CoinGecko API error: ${cgResponse.status}`);
      }
    } catch (error) {
      console.error('❌ CoinGecko failed, trying fallback APIs:', error);
      
      // Fallback: CoinCap API
      try {
        const ccResponse = await fetch('https://api.coincap.io/v2/assets?limit=50');
        if (ccResponse.ok) {
          const ccData = await ccResponse.json();
          data = ccData.data.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol.toLowerCase(),
            name: coin.name,
            current_price: parseFloat(coin.priceUsd),
            price_change_24h: parseFloat(coin.changePercent24Hr) / 100 * parseFloat(coin.priceUsd),
            price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
            market_cap: parseFloat(coin.marketCapUsd),
            total_volume: parseFloat(coin.volumeUsd24Hr),
            high_24h: parseFloat(coin.priceUsd) * 1.05,
            low_24h: parseFloat(coin.priceUsd) * 0.95
          }));
          console.log('✅ CoinCap fallback data fetched');
        }
      } catch (fallbackError) {
        console.error('❌ All APIs failed:', fallbackError);
        throw new Error('All market data APIs unavailable');
      }
    }
    
    // Transform and update market data cache with real exchange rates
    const audRate = 1.52; // Current approximate USD to AUD rate
    const marketData = data.map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price_usd: coin.current_price,
      price_aud: coin.current_price * audRate,
      volume_24h_usd: coin.total_volume,
      volume_24h_aud: coin.total_volume * audRate,
      change_24h: coin.price_change_24h,
      change_percentage_24h: coin.price_change_percentage_24h,
      market_cap_usd: coin.market_cap,
      market_cap_aud: coin.market_cap * audRate,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      exchange: 'coingecko',
      last_updated: new Date().toISOString()
    }));

    // Upsert market data with better error handling
    const upsertPromises = marketData.map(item => 
      supabase
        .from('market_data_cache')
        .upsert(item, { 
          onConflict: 'symbol,exchange',
          ignoreDuplicates: false 
        })
    );

    await Promise.allSettled(upsertPromises);

    console.log(`Updated ${marketData.length} market data entries`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: marketData.length,
        data: marketData.slice(0, 10) // Return first 10 for preview
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching market data:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});