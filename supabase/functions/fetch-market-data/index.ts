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

    // Fetch data from CoinGecko API (free, no key required)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoData[] = await response.json();
    
    // Transform and update market data cache
    const marketData = data.map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price_usd: coin.current_price,
      price_aud: coin.current_price * 1.5, // Mock AUD conversion
      volume_24h_usd: coin.total_volume,
      volume_24h_aud: coin.total_volume * 1.5,
      change_24h: coin.price_change_24h,
      change_percentage_24h: coin.price_change_percentage_24h,
      market_cap_usd: coin.market_cap,
      market_cap_aud: coin.market_cap * 1.5,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      exchange: 'coingecko',
      last_updated: new Date().toISOString()
    }));

    // Upsert market data
    for (const item of marketData) {
      await supabase
        .from('market_data_cache')
        .upsert(item, { 
          onConflict: 'symbol,exchange',
          ignoreDuplicates: false 
        });
    }

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