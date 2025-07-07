
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';
import { TrendingUp, TrendingDown, Settings, Eye, EyeOff, Volume2, Activity, BarChart3 } from 'lucide-react';

interface TickerSettings {
  refreshRate: number;
  showVolume: boolean;
  showChange24h: boolean;
  showMarketCap: boolean;
  colorCoding: boolean;
  soundAlerts: boolean;
  priceAlerts: boolean;
  displayMode: 'compact' | 'detailed' | 'chart';
  sortBy: 'price' | 'change' | 'volume' | 'marketcap';
  filterBy: 'all' | 'gainers' | 'losers' | 'high_volume';
}

export const AdvancedTickerSystem = () => {
  const { prices, isConnected } = useRealtimeMarketData(['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX']);
  
  const [settings, setSettings] = useState<TickerSettings>({
    refreshRate: 1000,
    showVolume: true,
    showChange24h: true,
    showMarketCap: true,
    colorCoding: true,
    soundAlerts: false,
    priceAlerts: true,
    displayMode: 'detailed',
    sortBy: 'change',
    filterBy: 'all'
  });

  const [visibleColumns, setVisibleColumns] = useState({
    price: true,
    change24h: true,
    volume: true,
    marketCap: true,
    high24h: false,
    low24h: false
  });

  const [priceAlerts, setPriceAlerts] = useState<Record<string, { above?: number; below?: number }>>({});

  const updateSetting = (key: keyof TickerSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const getFilteredAndSortedData = () => {
    let data = Object.entries(prices).map(([symbol, data]) => ({
      symbol,
      ...data,
      change24h: data.change24h || (Math.random() - 0.5) * 10,
      volume: data.volume || Math.random() * 1000000000,
      marketCap: data.price * Math.random() * 1000000000,
      high24h: data.price * (1 + Math.random() * 0.1),
      low24h: data.price * (1 - Math.random() * 0.1)
    }));

    // Filter
    switch (settings.filterBy) {
      case 'gainers':
        data = data.filter(item => item.change24h > 0);
        break;
      case 'losers':
        data = data.filter(item => item.change24h < 0);
        break;
      case 'high_volume':
        data = data.filter(item => item.volume > 500000000);
        break;
    }

    // Sort
    switch (settings.sortBy) {
      case 'price':
        data.sort((a, b) => b.price - a.price);
        break;
      case 'change':
        data.sort((a, b) => b.change24h - a.change24h);
        break;
      case 'volume':
        data.sort((a, b) => b.volume - a.volume);
        break;
      case 'marketcap':
        data.sort((a, b) => b.marketCap - a.marketCap);
        break;
    }

    return data;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const tickerData = getFilteredAndSortedData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Advanced Ticker System</h2>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <Badge className="bg-blue-500/20 text-blue-400">
          {tickerData.length} Assets
        </Badge>
      </div>

      <Tabs defaultValue="ticker" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ticker">Live Ticker</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="ticker">
          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Market Data</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={settings.filterBy} onValueChange={(value: any) => updateSetting('filterBy', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="gainers">Gainers</SelectItem>
                      <SelectItem value="losers">Losers</SelectItem>
                      <SelectItem value="high_volume">High Volume</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={settings.sortBy} onValueChange={(value: any) => updateSetting('sortBy', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="change">Change</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="marketcap">Market Cap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 text-xs text-white/60 border-b border-white/10 pb-2">
                  <div className="col-span-2">Symbol</div>
                  {visibleColumns.price && <div className="col-span-2 text-right">Price</div>}
                  {visibleColumns.change24h && <div className="col-span-2 text-right">24h Change</div>}
                  {visibleColumns.volume && <div className="col-span-2 text-right">Volume</div>}
                  {visibleColumns.marketCap && <div className="col-span-2 text-right">Market Cap</div>}
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Data Rows */}
                {tickerData.map((item) => (
                  <div key={item.symbol} className="grid grid-cols-12 gap-4 items-center py-2 hover:bg-white/5 rounded">
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {item.symbol.charAt(0)}
                      </div>
                      <span className="font-medium">{item.symbol}</span>
                    </div>
                    
                    {visibleColumns.price && (
                      <div className="col-span-2 text-right font-mono">
                        ${item.price.toLocaleString()}
                      </div>
                    )}
                    
                    {visibleColumns.change24h && (
                      <div className={`col-span-2 text-right flex items-center justify-end gap-1 ${
                        settings.colorCoding 
                          ? item.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          : 'text-white'
                      }`}>
                        {item.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                      </div>
                    )}
                    
                    {visibleColumns.volume && (
                      <div className="col-span-2 text-right text-sm">
                        ${formatNumber(item.volume)}
                      </div>
                    )}
                    
                    {visibleColumns.marketCap && (
                      <div className="col-span-2 text-right text-sm">
                        ${formatNumber(item.marketCap)}
                      </div>
                    )}
                    
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <BarChart3 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Ticker Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Refresh Rate: {settings.refreshRate}ms</Label>
                  <Slider
                    value={[settings.refreshRate]}
                    onValueChange={([value]) => updateSetting('refreshRate', value)}
                    max={5000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show Volume</Label>
                    <Switch 
                      checked={settings.showVolume} 
                      onCheckedChange={(checked) => updateSetting('showVolume', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">24h Change</Label>
                    <Switch 
                      checked={settings.showChange24h} 
                      onCheckedChange={(checked) => updateSetting('showChange24h', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Market Cap</Label>
                    <Switch 
                      checked={settings.showMarketCap} 
                      onCheckedChange={(checked) => updateSetting('showMarketCap', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Color Coding</Label>
                    <Switch 
                      checked={settings.colorCoding} 
                      onCheckedChange={(checked) => updateSetting('colorCoding', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Sound Alerts</Label>
                    <Switch 
                      checked={settings.soundAlerts} 
                      onCheckedChange={(checked) => updateSetting('soundAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Price Alerts</Label>
                    <Switch 
                      checked={settings.priceAlerts} 
                      onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Visible Columns</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(visibleColumns).map(([column, visible]) => (
                      <div key={column} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <Label className="text-sm capitalize">{column.replace(/([A-Z])/g, ' $1')}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleColumn(column as keyof typeof visibleColumns)}
                          className="h-6 w-6 p-0"
                        >
                          {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Price Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tickerData.slice(0, 5).map((item) => (
                <div key={item.symbol} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {item.symbol.charAt(0)}
                      </div>
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-sm text-white/60">${item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-white/60">Alert Above</Label>
                      <Input
                        type="number"
                        placeholder="Price threshold"
                        className="bg-card/20 border-white/20 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/60">Alert Below</Label>
                      <Input
                        type="number"
                        placeholder="Price threshold"
                        className="bg-card/20 border-white/20 text-sm"
                      />
                    </div>
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
