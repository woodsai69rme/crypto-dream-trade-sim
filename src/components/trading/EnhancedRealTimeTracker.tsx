import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';
import { Activity, TrendingUp, TrendingDown, Zap, RefreshCw, Bell, BellRing, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt: Date;
}

export const EnhancedRealTimeTracker = () => {
  const { prices, isConnected, lastUpdate } = useRealtimeMarketData(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA']);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [clickedCoin, setClickedCoin] = useState<string | null>(null);
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
        
        // Enhanced notification
        toast({
          title: `🚨 Price Alert Triggered!`,
          description: `${alert.symbol} reached ${alert.direction} $${alert.targetPrice.toLocaleString()}! Current: $${currentPrice.toLocaleString()}`,
        });

        if (Notification.permission === 'granted') {
          new Notification(`🚨 ${alert.symbol} Price Alert`, {
            body: `${alert.symbol} is now ${alert.direction} $${alert.targetPrice.toLocaleString()}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
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

  const refreshMarketData = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) throw error;
      
      toast({
        title: "✅ Market Data Refreshed",
        description: `Updated ${data?.updated || 0} cryptocurrency prices`,
      });
    } catch (error) {
      console.error('Error refreshing market data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh market data. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const createPriceAlert = (symbol: string) => {
    const currentPrice = prices[symbol]?.price;
    if (!currentPrice) {
      toast({
        title: "❌ Unable to Create Alert",
        description: `No price data available for ${symbol}. Please wait for data to load.`,
        variant: "destructive",
      });
      return;
    }

    // Smart alert pricing based on current market conditions
    const getAlertPrice = (symbol: string, currentPrice: number) => {
      switch (symbol) {
        case 'BTC':
          return currentPrice > 100000 ? Math.round(currentPrice * 1.05) : Math.round(currentPrice * 0.95);
        case 'ETH':
          return currentPrice > 3500 ? Math.round(currentPrice * 1.1) : Math.round(currentPrice * 0.9);
        case 'SOL':
          return currentPrice > 180 ? Math.round(currentPrice * 1.15) : Math.round(currentPrice * 0.85);
        default:
          return Math.round(currentPrice * (Math.random() > 0.5 ? 1.15 : 0.85));
      }
    };

    const targetPrice = getAlertPrice(symbol, currentPrice);
    const direction: 'above' | 'below' = targetPrice > currentPrice ? 'above' : 'below';

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      targetPrice,
      direction,
      triggered: false,
      createdAt: new Date()
    };

    setAlerts(prev => [...prev, newAlert]);
    setClickedCoin(symbol);
    
    // Visual feedback
    setTimeout(() => setClickedCoin(null), 1000);
    
    // Enhanced user feedback
    toast({
      title: "🚨 Price Alert Created!",
      description: `Watching ${symbol} for ${direction} $${targetPrice.toLocaleString()} (Current: $${currentPrice.toLocaleString()})`,
    });

    // Request notification permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "🔔 Notifications Enabled",
            description: "You'll receive browser notifications when your price alerts trigger.",
          });
        }
      });
    }
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast({
      title: "Alert Removed",
      description: "Price alert has been deleted.",
    });
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Enhanced Real-Time Market Tracker
          <Badge className={`ml-auto ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? '🟢 Live' : '🔴 Offline'}
          </Badge>
          <Button
            onClick={refreshMarketData}
            variant="ghost"
            size="sm"
            disabled={refreshing}
            className="ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(prices).map(([symbol, data]) => {
            const trend = getTrendDirection(symbol);
            const isClicked = clickedCoin === symbol;
            return (
              <div 
                key={symbol} 
                className={`p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                  isClicked ? 'bg-green-500/20 border-green-500/40 scale-105' : ''
                }`}
                onClick={() => createPriceAlert(symbol)}
                title={`Click to set price alert for ${symbol} (Current: ${formatPrice(data.price)})`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{symbol}</span>
                  <div className="flex items-center gap-1">
                    {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                    {trend === 'neutral' && <Zap className="w-3 h-3 text-yellow-400" />}
                    {isClicked && <Bell className="w-3 h-3 text-green-400 animate-pulse" />}
                  </div>
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
        
        {/* Enhanced Price Alerts Section */}
        {alerts.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BellRing className="w-4 h-4" />
              Active Price Alerts
              <Badge variant="outline" className="text-xs">
                {alerts.filter(a => !a.triggered).length} Active • {alerts.filter(a => a.triggered).length} Triggered
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {alerts.slice(0, 6).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border text-xs relative group ${
                    alert.triggered 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{alert.symbol} {alert.direction} ${alert.targetPrice.toLocaleString()}</div>
                      <div className="text-xs opacity-60">
                        Created: {alert.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.triggered && <span>✅</span>}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlert(alert.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
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
          💡 Click on any coin to set a price alert • 🔔 Enable browser notifications for instant alerts
          <br />
          <span className="text-white/40">Real-time data updates every 30 seconds</span>
        </div>
      </CardContent>
    </Card>
  );
};