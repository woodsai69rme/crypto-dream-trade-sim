
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Activity, TrendingUp, TrendingDown, DollarSign, Users, Bot, Target, AlertTriangle, Zap, BarChart3 } from "lucide-react";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface LiveData {
  timestamp: string;
  price: number;
  volume: number;
  change: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  status: 'up' | 'down';
}

export const LiveMonitoringDashboard = () => {
  const { currentAccount, accounts } = useMultipleAccounts();
  const { portfolio, trades } = useRealTimePortfolio();
  const [liveData, setLiveData] = useState<LiveData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');

  // Generate live market data simulation
  useEffect(() => {
    const generateLiveData = () => {
      const now = new Date();
      const data: LiveData[] = [];
      
      for (let i = 30; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000);
        data.push({
          timestamp: timestamp.toISOString(),
          price: 50000 + Math.random() * 10000 - 5000,
          volume: 1000000 + Math.random() * 500000,
          change: (Math.random() - 0.5) * 10
        });
      }
      
      setLiveData(data);
    };

    generateLiveData();
    const interval = setInterval(generateLiveData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate performance metrics
  useEffect(() => {
    const metrics: PerformanceMetric[] = [
      { name: 'Portfolio Value', value: portfolio?.total_value || 100000, change: 2.4, status: 'up' },
      { name: 'Daily P&L', value: currentAccount?.total_pnl || 0, change: -1.2, status: 'down' },
      { name: 'Win Rate', value: 73.5, change: 5.1, status: 'up' },
      { name: 'Active Trades', value: 12, change: 2, status: 'up' },
      { name: 'Risk Score', value: 45, change: -3, status: 'down' },
      { name: 'Efficiency', value: 89.2, change: 1.8, status: 'up' }
    ];
    setPerformanceMetrics(metrics);
  }, [portfolio, currentAccount]);

  const recentTrades = trades.slice(0, 10);
  const accountPerformance = accounts.map(acc => ({
    name: acc.account_name,
    pnl: acc.total_pnl,
    percentage: acc.total_pnl_percentage,
    trades: Math.floor(Math.random() * 50) + 10
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <BarChart3 className="w-4 h-4 mr-2" />
          Live Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Live Monitoring Dashboard
            <Badge className="bg-green-500/20 text-green-400 animate-pulse">
              LIVE
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Frame Selector */}
          <div className="flex gap-2">
            {['5M', '15M', '1H', '4H', '1D'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">{metric.name}</span>
                    {metric.status === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {metric.name.includes('Rate') || metric.name.includes('Score') || metric.name.includes('Efficiency') 
                      ? `${metric.value}%` 
                      : `$${metric.value.toLocaleString()}`}
                  </div>
                  <div className={`text-sm ${metric.status === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.status === 'up' ? '+' : ''}{metric.change}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Price Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Live Price Action ({selectedTimeframe})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveData}>
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                      />
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Volume Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Trading Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveData}>
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <Bar dataKey="volume" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Performance & Recent Trades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Performance */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  Account Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accountPerformance.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div>
                        <div className="font-medium text-white">{account.name}</div>
                        <div className="text-sm text-slate-400">{account.trades} trades</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${account.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {account.pnl >= 0 ? '+' : ''}${account.pnl.toFixed(2)}
                        </div>
                        <div className={`text-sm ${account.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {account.percentage >= 0 ? '+' : ''}{account.percentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentTrades.map((trade, index) => (
                    <div key={trade.id || index} className="flex items-center justify-between p-2 bg-slate-700 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {trade.side?.toUpperCase()}
                        </Badge>
                        <span className="text-white">{trade.symbol}</span>
                        <span className="text-slate-400">${trade.price?.toLocaleString()}</span>
                      </div>
                      <div className="text-slate-400">
                        {new Date(trade.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Risk Analysis & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded">
                  <div className="text-green-400 font-medium">Portfolio Health</div>
                  <div className="text-2xl font-bold text-white">Good</div>
                  <div className="text-sm text-green-400">Risk Level: Low</div>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <div className="text-yellow-400 font-medium">Exposure</div>
                  <div className="text-2xl font-bold text-white">45%</div>
                  <div className="text-sm text-yellow-400">Market Cap</div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                  <div className="text-blue-400 font-medium">Diversification</div>
                  <div className="text-2xl font-bold text-white">8/10</div>
                  <div className="text-sm text-blue-400">Well Balanced</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
