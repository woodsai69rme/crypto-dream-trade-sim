import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting market data fetch...');

    // Multiple API endpoints for reliability
    let marketData: any[] = [];
    let dataSource = 'none';

    // Try CoinGecko first (most reliable)
    try {
      console.log('📡 Fetching from CoinGecko...');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; CryptoApp/1.0)',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          marketData = data;
          dataSource = 'coingecko';
          console.log(`✅ CoinGecko: ${data.length} coins fetched`);
        }
      }
    } catch (error) {
      console.warn('CoinGecko failed:', error.message);
    }

    // Fallback to CoinPaprika if CoinGecko fails
    if (marketData.length === 0) {
      try {
        console.log('📡 Fallback: Fetching from CoinPaprika...');
        const response = await fetch('https://api.coinpaprika.com/v1/tickers?limit=20');
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            // Transform CoinPaprika data to match CoinGecko format
            marketData = data.map((coin: any) => ({
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              current_price: coin.quotes?.USD?.price || 0,
              market_cap: coin.quotes?.USD?.market_cap || 0,
              market_cap_rank: coin.rank || 0,
              price_change_percentage_24h: coin.quotes?.USD?.percent_change_24h || 0,
              total_volume: coin.quotes?.USD?.volume_24h || 0,
              high_24h: coin.quotes?.USD?.price * 1.1, // Estimate
              low_24h: coin.quotes?.USD?.price * 0.9,  // Estimate
              last_updated: new Date().toISOString(),
            }));
            dataSource = 'coinpaprika';
            console.log(`✅ CoinPaprika: ${data.length} coins fetched`);
          }
        }
      } catch (error) {
        console.warn('CoinPaprika failed:', error.message);
      }
    }

    // Final fallback: Use realistic mock data
    if (marketData.length === 0) {
      console.log('⚠️ All APIs failed, using fallback data...');
      marketData = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          current_price: 101500 + Math.random() * 3000, // $101.5k-$104.5k range (real current range)
          market_cap: 2000000000000,
          market_cap_rank: 1,
          price_change_percentage_24h: (Math.random() - 0.5) * 6,
          total_volume: 48000000000,
          high_24h: 104500,
          low_24h: 99800,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          current_price: 3500 + Math.random() * 400, // $3.5k-$3.9k range
          market_cap: 420000000000,
          market_cap_rank: 2,
          price_change_percentage_24h: (Math.random() - 0.5) * 6,
          total_volume: 18000000000,
          high_24h: 3800,
          low_24h: 3400,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'solana',
          symbol: 'SOL',
          name: 'Solana',
          current_price: 180 + Math.random() * 40,
          market_cap: 85000000000,
          market_cap_rank: 5,
          price_change_percentage_24h: (Math.random() - 0.5) * 10,
          total_volume: 2500000000,
          high_24h: 210,
          low_24h: 175,
          last_updated: new Date().toISOString(),
        }
      ];
      dataSource = 'fallback';
    }

    // Update database with upsert to handle existing records properly
    let updatedCount = 0;
    const errors: string[] = [];

    for (const coin of marketData.slice(0, 15)) { // Limit to 15 coins
      try {
        const { error } = await supabase
          .from('market_data_cache')
          .upsert({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price_usd: Number(coin.current_price) || 0,
            price_aud: Number(coin.current_price) * 1.5, // Rough AUD conversion
            volume_24h_usd: Number(coin.total_volume) || 0,
            volume_24h_aud: Number(coin.total_volume) * 1.5,
            change_24h: Number(coin.current_price) * (Number(coin.price_change_percentage_24h) || 0) / 100,
            change_percentage_24h: Number(coin.price_change_percentage_24h) || 0,
            market_cap_usd: Number(coin.market_cap) || 0,
            market_cap_aud: Number(coin.market_cap) * 1.5,
            high_24h: Number(coin.high_24h) || Number(coin.current_price),
            low_24h: Number(coin.low_24h) || Number(coin.current_price),
            last_updated: coin.last_updated || new Date().toISOString(),
            exchange: dataSource,
          }, {
            onConflict: 'symbol'
          });

        if (error) {
          console.error(`Database error for ${coin.symbol}:`, error);
          errors.push(`${coin.symbol}: ${error.message}`);
        } else {
          updatedCount++;
          console.log(`✅ Updated ${coin.symbol}: $${Number(coin.current_price).toLocaleString()}`);
        }
      } catch (error) {
        console.error(`Processing error for ${coin.symbol}:`, error);
        errors.push(`${coin.symbol}: ${error.message}`);
      }
    }

    // Log Bitcoin price specifically for verification
    const btcData = marketData.find(coin => coin.symbol.toUpperCase() === 'BTC');
    if (btcData) {
      console.log(`₿ Bitcoin updated: $${Number(btcData.current_price).toLocaleString()}`);
    }

    const response = {
      success: true,
      updated: updatedCount,
      total: marketData.length,
      dataSource,
      timestamp: new Date().toISOString(),
      errors: errors.slice(0, 5), // Limit error list
      btcPrice: btcData?.current_price || 0,
    };

    console.log('✅ Market data update completed:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Market data fetch failed:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});