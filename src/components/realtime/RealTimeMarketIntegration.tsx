import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMarketData } from "@/hooks/useRealtimeMarketData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Zap, Bell, TrendingUp, TrendingDown, Activity, 
  Settings, Volume2, AlertTriangle, Clock, Target,
  Wifi, WifiOff, Smartphone, Monitor
} from 'lucide-react';

interface MarketAlert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'volatility' | 'news';
  condition: 'above' | 'below' | 'change';
  value: number;
  currentValue: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: string;
}

interface RealTimeData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: string;
}

export const RealTimeMarketIntegration = () => {
  const { toast } = useToast();
  const { getPrice } = useRealtimeMarketData(['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX']);
  
  const [isConnected, setIsConnected] = useState(true);
  const [marketData, setMarketData] = useState<RealTimeData[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC',
    type: 'price' as const,
    condition: 'above' as const,
    value: 110000
  });

  // Simulate WebSocket connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.05 ? true : prev); // 95% uptime
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate real-time market data
  useEffect(() => {
    const updateMarketData = () => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX'];
      const newData = symbols.map(symbol => ({
        symbol,
        price: getPrice(symbol),
        change24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000000,
        high24h: getPrice(symbol) * (1 + Math.random() * 0.05),
        low24h: getPrice(symbol) * (1 - Math.random() * 0.05),
        lastUpdate: new Date().toISOString()
      }));
      
      setMarketData(newData);
      
      // Add to price history
      const btcData = newData.find(d => d.symbol === selectedSymbol);
      if (btcData) {
        setPriceHistory(prev => [...prev.slice(-50), {
          time: new Date().toLocaleTimeString(),
          price: btcData.price
        }]);
      }
    };

    const interval = setInterval(updateMarketData, 2000);
    updateMarketData(); // Initial load
    
    return () => clearInterval(interval);
  }, [selectedSymbol, getPrice]);

  // Check alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.isActive || alert.triggered) return;
      
      const currentData = marketData.find(d => d.symbol === alert.symbol);
      if (!currentData) return;
      
      let shouldTrigger = false;
      const currentValue = alert.type === 'price' ? currentData.price : 
                          alert.type === 'volume' ? currentData.volume24h :
                          Math.abs(currentData.change24h);
      
      if (alert.condition === 'above' && currentValue > alert.value) shouldTrigger = true;
      if (alert.condition === 'below' && currentValue < alert.value) shouldTrigger = true;
      if (alert.condition === 'change' && Math.abs(currentValue) > alert.value) shouldTrigger = true;
      
      if (shouldTrigger) {
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, triggered: true, currentValue } : a
        ));
        
        toast({
          title: "🚨 Market Alert Triggered!",
          description: `${alert.symbol} ${alert.type} is ${alert.condition} ${alert.value}`,
        });
      }
    });
  }, [marketData, alerts, toast]);

  const createAlert = () => {
    const alert: MarketAlert = {
      id: Date.now().toString(),
      ...newAlert,
      currentValue: 0,
      isActive: true,
      triggered: false,
      createdAt: new Date().toISOString()
    };
    
    setAlerts(prev => [...prev, alert]);
    
    toast({
      title: "Alert Created",
      description: `${alert.symbol} ${alert.type} alert set for ${alert.condition} ${alert.value}`,
    });
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isActive: !a.isActive, triggered: false } : a
    ));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-Time Market Integration
              <Badge className={`${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">WebSocket</Badge>
              <Badge variant="outline">Live Data</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Real-time cryptocurrency market data with live price feeds, volume tracking, and custom alerts.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="market">Live Market</TabsTrigger>
          <TabsTrigger value="charts">Price Charts</TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alerts ({alerts.filter(a => a.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="feeds">Data Feeds</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {marketData.map((crypto) => (
              <Card key={crypto.symbol} className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedSymbol(crypto.symbol)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{crypto.symbol}</h3>
                    <Badge className={`${crypto.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {crypto.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {crypto.change24h.toFixed(2)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold">${crypto.price.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Price</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-green-400">${crypto.high24h.toLocaleString()}</p>
                        <p className="text-xs text-white/60">24h High</p>
                      </div>
                      <div>
                        <p className="text-red-400">${crypto.low24h.toLocaleString()}</p>
                        <p className="text-xs text-white/60">24h Low</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm">${(crypto.volume24h / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-white/60">24h Volume</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-white/40">
                    Updated: {new Date(crypto.lastUpdate).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Price Chart - {selectedSymbol}</CardTitle>
                <div className="flex gap-2">
                  {['BTC', 'ETH', 'SOL', 'ADA'].map(symbol => (
                    <Button
                      key={symbol}
                      size="sm"
                      variant={selectedSymbol === symbol ? "default" : "outline"}
                      onClick={() => setSelectedSymbol(symbol)}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Create New Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-white/60">Symbol</label>
                  <select 
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    {['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'].map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Type</label>
                  <select 
                    value={newAlert.type}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="price">Price</option>
                    <option value="volume">Volume</option>
                    <option value="volatility">Volatility</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Condition</label>
                  <select 
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="change">Change %</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Value</label>
                  <Input
                    type="number"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              </div>
              
              <Button onClick={createAlert} className="w-full bg-purple-600 hover:bg-purple-700">
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-white/40 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Alerts Created</h3>
                  <p className="text-white/60">Create your first market alert to get notified of important price movements.</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${alert.triggered ? 'bg-red-500/20' : alert.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                          {alert.type === 'price' && <Target className="w-4 h-4" />}
                          {alert.type === 'volume' && <Volume2 className="w-4 h-4" />}
                          {alert.type === 'volatility' && <Activity className="w-4 h-4" />}
                        </div>
                        
                        <div>
                          <h3 className="font-medium">
                            {alert.symbol} {alert.type} {alert.condition} {alert.value}
                          </h3>
                          <p className="text-sm text-white/60">
                            Created: {new Date(alert.createdAt).toLocaleString()}
                          </p>
                          {alert.triggered && (
                            <p className="text-sm text-red-400">
                              ⚠️ Triggered at {alert.currentValue}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => toggleAlert(alert.id)}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Data Feed Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Binance WebSocket', status: 'Connected', latency: '12ms', messages: '1,245' },
                { name: 'CoinGecko API', status: 'Connected', latency: '89ms', messages: '342' },
                { name: 'CryptoCompare Feed', status: 'Connected', latency: '45ms', messages: '567' },
                { name: 'Alpha Vantage', status: 'Rate Limited', latency: '234ms', messages: '23' }
              ].map((feed, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      feed.status === 'Connected' ? 'bg-green-400' : 
                      feed.status === 'Rate Limited' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <h4 className="font-medium">{feed.name}</h4>
                      <p className="text-sm text-white/60">{feed.status}</p>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <p>Latency: {feed.latency}</p>
                    <p className="text-white/60">Messages: {feed.messages}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};