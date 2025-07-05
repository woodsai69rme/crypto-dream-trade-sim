
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DatabaseZap, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CryptoData {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h: number;
  change_percentage_24h: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export const MarketOverview = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      console.log('🔄 Fetching market data from cache...');
      
      // Get cached data (now with real prices)
      const { data: cachedData, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .order('market_cap_usd', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (cachedData && cachedData.length > 0) {
        console.log(`✅ Loaded ${cachedData.length} coins from cache`);
        
        // Verify Bitcoin price is realistic
        const btcData = cachedData.find(coin => coin.symbol === 'BTC');
        if (btcData) {
          console.log(`₿ Bitcoin price from cache: $${btcData.price_usd.toLocaleString()}`);
          
          // If Bitcoin price is unrealistic, trigger fresh data fetch
          if (btcData.price_usd < 100000) {
            console.log('⚠️ Bitcoin price seems outdated, fetching fresh data...');
            await refreshMarketData();
            return;
          }
        }
        
        setCryptoData(cachedData);
      } else {
        console.log('📡 No cached data, fetching fresh market data...');
        await refreshMarketData();
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Market Data Error",
        description: "Failed to load market data. Using cached data if available.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMarketData = async () => {
    setRefreshing(true);
    try {
      console.log('🚀 Triggering fresh market data fetch...');
      
      const { data, error } = await supabase
        .functions
        .invoke('fetch-market-data');
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('✅ Fresh market data fetched:', data);
      
      // Reload from cache after fresh fetch
      setTimeout(() => {
        fetchMarketData();
      }, 2000);
      
      toast({
        title: "Market Data Updated",
        description: `Updated ${data?.updated || 0} cryptocurrency prices`,
      });
    } catch (error) {
      console.error('Error refreshing market data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh market data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseZap className="w-5 h-5 animate-pulse" />
            Loading Real Market Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
                <div className="h-16 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Live Market Overview
          <Button
            onClick={refreshMarketData}
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        {cryptoData.length > 0 && (
          <p className="text-sm text-white/60">
            Last updated: {new Date(cryptoData[0]?.last_updated || Date.now()).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {cryptoData.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <DatabaseZap className="w-12 h-12 mx-auto mb-4" />
            <p>No market data available</p>
            <Button onClick={refreshMarketData} className="mt-4">
              Refresh Market Data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptoData.map((crypto) => (
              <div key={crypto.symbol} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {crypto.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{crypto.symbol}</div>
                      <div className="text-xs text-white/60 truncate max-w-20">{crypto.name}</div>
                    </div>
                  </div>
                  <Badge
                    variant={crypto.change_percentage_24h > 0 ? "default" : "destructive"}
                    className={`${
                      crypto.change_percentage_24h > 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {crypto.change_percentage_24h > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(crypto.change_percentage_24h).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="text-lg font-bold">{formatPrice(crypto.price_usd)}</div>
                  <div className={`text-sm ${crypto.change_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change_24h > 0 ? '+' : ''}${crypto.change_24h.toFixed(2)}
                  </div>
                </div>

                <div className="h-12 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { value: crypto.low_24h, index: 0 },
                      { value: crypto.price_usd * 0.99, index: 1 },
                      { value: crypto.price_usd * 1.01, index: 2 },
                      { value: crypto.high_24h, index: 3 },
                      { value: crypto.price_usd, index: 4 }
                    ]}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={crypto.change_percentage_24h > 0 ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs text-white/60 space-y-1">
                  <div>Vol: {formatCurrency(crypto.volume_24h_usd)}</div>
                  <div>MCap: {formatCurrency(crypto.market_cap_usd)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
