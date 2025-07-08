import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { useAITradingBots } from '@/hooks/useAITradingBots';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { 
  TrendingUp, TrendingDown, Activity, Play, Pause, Users, Bot, 
  DollarSign, BarChart3, AlertTriangle, CheckCircle 
} from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: Date;
}

interface NewsItem {
  id: string;
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
}

export const LiveTradingDashboard = () => {
  const { 
    isActive: tradeFollowingActive, 
    stats, 
    startFollowing, 
    stopFollowing, 
    activeAccounts, 
    totalAccounts 
  } = useRealTimeTradeFollowing();
  
  const { bots, activeBots } = useAITradingBots();
  const { accounts } = useMultipleAccounts();
  
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    uptime: '99.9%',
    latency: 125
  });

  // Simulate real-time market data updates
  useEffect(() => {
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    
    const generateMarketData = () => {
      const newData = symbols.map(symbol => ({
        symbol,
        price: 40000 + Math.random() * 30000,
        change: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000000,
        timestamp: new Date()
      }));
      setMarketData(newData);
    };

    // Initial data
    generateMarketData();
    
    // Update every second for flashing effect
    const interval = setInterval(generateMarketData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate news ticker
  useEffect(() => {
    const generateNews = () => {
      const news = [
        { title: "Bitcoin reaches new resistance level", sentiment: 'positive' as const },
        { title: "Ethereum network upgrade successful", sentiment: 'positive' as const },
        { title: "Market volatility increases amid uncertainty", sentiment: 'negative' as const },
        { title: "DeFi protocols show strong adoption", sentiment: 'positive' as const },
        { title: "Regulatory clarity improves market conditions", sentiment: 'neutral' as const }
      ];
      
      const randomNews = news[Math.floor(Math.random() * news.length)];
      setNewsItems(prev => [{
        id: Date.now().toString(),
        ...randomNews,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
    };

    generateNews();
    const interval = setInterval(generateNews, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* News Ticker Top */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-lg p-2 overflow-hidden">
        <div className="flex items-center space-x-8 animate-scroll">
          {newsItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 whitespace-nowrap">
              <div className={`w-2 h-2 rounded-full ${
                item.sentiment === 'positive' ? 'bg-green-400' :
                item.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
              } animate-pulse`}></div>
              <span className="text-white/80 text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Trade Following
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Status:</span>
              <Badge className={tradeFollowingActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                {tradeFollowingActive ? `${activeAccounts}/${totalAccounts} Active` : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Signals:</span>
              <span className="text-green-400 font-medium">{stats.totalSignals}</span>
            </div>
            <Button 
              className={`w-full ${tradeFollowingActive ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-green-500/20 hover:bg-green-500/30'}`}
              onClick={tradeFollowingActive ? stopFollowing : startFollowing}
            >
              {tradeFollowingActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Following
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Following
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5" />
              AI Trading Bots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Active Bots:</span>
              <span className="text-purple-400 font-medium">{activeBots.size}/{bots.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Total Trades:</span>
              <span className="text-blue-400 font-medium">
                {bots.reduce((sum, bot) => sum + bot.performance.total_trades, 0)}
              </span>
            </div>
            <div className="text-xs text-white/60">
              Bots generating trades across all accounts
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Status:</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Uptime:</span>
              <span className="text-cyan-400 font-medium">{systemHealth.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Latency:</span>
              <span className="text-orange-400 font-medium">{systemHealth.latency}ms</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Market Data */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Live Market Data
            <Badge className="ml-auto bg-green-500/20 text-green-400 animate-pulse">
              LIVE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {marketData.map((data) => (
              <div 
                key={data.symbol} 
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{data.symbol}</span>
                  {data.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">
                    {formatPrice(data.price)}
                  </div>
                  <div className={`text-sm ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                  </div>
                  <div className="text-xs text-white/60">
                    Vol: {formatVolume(data.volume)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Account Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{account.account_name}</h3>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Balance:</span>
                    <span className="text-green-400 font-medium">
                      ${account.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">P&L:</span>
                    <span className={account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Active:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">Trading</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News Ticker Bottom */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-lg p-2 overflow-hidden">
        <div className="flex items-center space-x-8 animate-scroll-reverse">
          {[...newsItems].reverse().map((item) => (
            <div key={`bottom-${item.id}`} className="flex items-center space-x-2 whitespace-nowrap">
              <div className={`w-2 h-2 rounded-full ${
                item.sentiment === 'positive' ? 'bg-green-400' :
                item.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
              } animate-pulse`}></div>
              <span className="text-white/80 text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};