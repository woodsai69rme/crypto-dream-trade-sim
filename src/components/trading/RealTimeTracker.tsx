
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';
import { marketDataService } from '@/services/marketDataService';
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
}

export const RealTimeTracker = () => {
  const { prices, isConnected, lastUpdate } = useRealtimeMarketData(['BTC', 'ETH', 'SOL', 'BNB']);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});

  // Track price changes for trend analysis
  useEffect(() => {
    Object.entries(prices).forEach(([symbol, data]) => {
      setPriceHistory(prev => ({
        ...prev,
        [symbol]: [...(prev[symbol] || []).slice(-19), data.price] // Keep last 20 prices
      }));
    });
  }, [prices]);

  // Check price alerts
  useEffect(() => {
    alerts.forEach(alert => {
      const currentPrice = prices[alert.symbol]?.price;
      if (!currentPrice || alert.triggered) return;

      const triggered = alert.direction === 'above' 
        ? currentPrice >= alert.targetPrice 
        : currentPrice <= alert.targetPrice;

      if (triggered) {
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, triggered: true } : a
        ));
        
        // Show notification
        new Notification(`🚨 Price Alert: ${alert.symbol}`, {
          body: `${alert.symbol} is now ${alert.direction} $${alert.targetPrice.toLocaleString()}`,
          icon: '/favicon.ico'
        });
      }
    });
  }, [prices, alerts]);

  const getTrendDirection = (symbol: string) => {
    const history = priceHistory[symbol];
    if (!history || history.length < 2) return 'neutral';
    
    const recent = history.slice(-5);
    const trend = recent[recent.length - 1] - recent[0];
    return trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-Time Market Tracker
          <Badge className={`ml-auto ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? '🟢 Live' : '🔴 Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(prices).map(([symbol, data]) => {
            const trend = getTrendDirection(symbol);
            return (
              <div key={symbol} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{symbol}</span>
                  {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                  {trend === 'neutral' && <Zap className="w-4 h-4 text-yellow-400" />}
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">${data.price.toLocaleString()}</div>
                  <div className={`text-sm ${data.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                  </div>
                  <div className="text-xs text-white/60">
                    Vol: ${(data.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {lastUpdate && (
          <div className="mt-4 text-xs text-white/60 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
