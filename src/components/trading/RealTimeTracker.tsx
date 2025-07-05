
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';
import { Activity, TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
}

export const RealTimeTracker = () => {
  const { prices, isConnected, lastUpdate } = useRealtimeMarketData(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA']);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const { toast } = useToast();

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
        toast({
          title: `🚨 Price Alert: ${alert.symbol}`,
          description: `${alert.symbol} is now ${alert.direction} $${alert.targetPrice.toLocaleString()}. Current: $${currentPrice.toLocaleString()}`,
        });

        if (Notification.permission === 'granted') {
          new Notification(`🚨 Price Alert: ${alert.symbol}`, {
            body: `${alert.symbol} is now ${alert.direction} $${alert.targetPrice.toLocaleString()}`,
            icon: '/favicon.ico'
          });
        }
      }
    });
  }, [prices, alerts, toast]);

  const getTrendDirection = (symbol: string) => {
    const history = priceHistory[symbol];
    if (!history || history.length < 2) return 'neutral';
    
    const recent = history.slice(-5);
    const trend = recent[recent.length - 1] - recent[0];
    return trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
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

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const createPriceAlert = (symbol: string) => {
    const currentPrice = prices[symbol]?.price;
    if (!currentPrice) return;

    // Example: Alert when Bitcoin goes above $120k or below $100k
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      targetPrice: symbol === 'BTC' ? (currentPrice > 115000 ? 120000 : 105000) : currentPrice * 1.1,
      direction: symbol === 'BTC' ? (currentPrice > 115000 ? 'above' : 'below') : 'above',
      triggered: false
    };

    setAlerts(prev => [...prev, newAlert]);
    toast({
      title: "Price Alert Created",
      description: `Alert set for ${symbol} ${newAlert.direction} $${newAlert.targetPrice.toLocaleString()}`,
    });
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(prices).map(([symbol, data]) => {
            const trend = getTrendDirection(symbol);
            return (
              <div 
                key={symbol} 
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => createPriceAlert(symbol)}
                title={`Click to set price alert for ${symbol}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{symbol}</span>
                  {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                  {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {trend === 'neutral' && <Zap className="w-3 h-3 text-yellow-400" />}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold">{formatPrice(data.price)}</div>
                  <div className={`text-xs ${data.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                  </div>
                  <div className="text-xs text-white/60">
                    Vol: {formatVolume(data.volume)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Price Alerts Section */}
        {alerts.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              🚨 Active Price Alerts
              <Badge variant="outline" className="text-xs">
                {alerts.filter(a => !a.triggered).length} Active
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {alerts.slice(0, 4).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-2 rounded text-xs ${
                    alert.triggered 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {alert.symbol} {alert.direction} ${alert.targetPrice.toLocaleString()}
                  {alert.triggered && ' ✅'}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {lastUpdate && (
          <div className="mt-4 text-xs text-white/60 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
            <br />
            Bitcoin: {formatPrice(prices['BTC']?.price || 0)} • Ethereum: {formatPrice(prices['ETH']?.price || 0)}
          </div>
        )}

        <div className="mt-4 text-xs text-white/50 text-center">
          💡 Click on any coin to set a price alert
        </div>
      </CardContent>
    </Card>
  );
};
