
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DatabaseZap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

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
}

export const MarketOverview = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch fresh market data from our edge function
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) {
        console.error('Error fetching market data:', error);
      } else {
        console.log('✅ Fresh market data updated');
      }

      // Get cached data (now with real prices)
      const { data: cachedData } = await supabase
        .from('market_data_cache')
        .select('*')
        .order('market_cap_usd', { ascending: false })
        .limit(8);

      if (cachedData && cachedData.length > 0) {
        setCryptoData(cachedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseZap className="w-5 h-5 animate-pulse" />
            Loading Market Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cryptoData.map((crypto) => (
            <div key={crypto.symbol} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {crypto.symbol}
                  </div>
                  <div>
                    <div className="font-medium">{crypto.symbol}</div>
                    <div className="text-xs text-white/60">{crypto.name}</div>
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
                  {crypto.change_percentage_24h.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="text-lg font-bold">${crypto.price_usd.toLocaleString()}</div>
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
      </CardContent>
    </Card>
  );
};
