
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Activity, TrendingUp, TrendingDown, DollarSign, Users, Bot, Target, AlertTriangle, Zap, BarChart3, Maximize2, Minimize2, Settings, RefreshCw } from "lucide-react";
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

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error';
  user: string;
}

export const LiveMonitoringDashboard = () => {
  const { currentAccount, accounts } = useMultipleAccounts();
  const { portfolio, trades } = useRealTimePortfolio();
  const [liveData, setLiveData] = useState<LiveData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Generate live market data simulation
  useEffect(() => {
    const generateLiveData = () => {
      const now = new Date();
      const data: LiveData[] = [];
      
      for (let i = 100; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000);
        const basePrice = 50000;
        const volatility = 0.02;
        const trend = Math.sin(i * 0.1) * 0.01;
        const randomWalk = (Math.random() - 0.5) * volatility;
        const price = basePrice * (1 + trend + randomWalk);
        
        data.push({
          timestamp: timestamp.toISOString(),
          price: price,
          volume: 1000000 + Math.random() * 500000,
          change: (Math.random() - 0.5) * 10
        });
      }
      
      setLiveData(data);
    };

    const generateAuditLogs = () => {
      const actions = [
        'Trade Executed', 'Position Opened', 'Stop Loss Triggered', 'Take Profit Hit',
        'Account Switch', 'Risk Limit Adjusted', 'Bot Started', 'Bot Stopped',
        'API Connected', 'Balance Updated', 'Signal Generated', 'Alert Triggered'
      ];
      
      const logs: AuditEntry[] = [];
      for (let i = 0; i < 50; i++) {
        logs.push({
          id: `audit-${i}`,
          timestamp: new Date(Date.now() - i * 30000).toISOString(),
          action: actions[Math.floor(Math.random() * actions.length)],
          details: `System performed automated action for account ${currentAccount?.account_name || 'Default'}`,
          status: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'warning' : 'success',
          user: 'System'
        });
      }
      setAuditLogs(logs);
    };

    generateLiveData();
    generateAuditLogs();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateLiveData();
        generateAuditLogs();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, currentAccount]);

  // Generate performance metrics
  useEffect(() => {
    const metrics: PerformanceMetric[] = [
      { name: 'Portfolio Value', value: portfolio?.total_value || 100000, change: 2.4, status: 'up' },
      { name: 'Daily P&L', value: currentAccount?.total_pnl || 0, change: -1.2, status: 'down' },
      { name: 'Win Rate', value: 73.5, change: 5.1, status: 'up' },
      { name: 'Active Trades', value: 12, change: 2, status: 'up' },
      { name: 'Risk Score', value: 45, change: -3, status: 'down' },
      { name: 'Efficiency', value: 89.2, change: 1.8, status: 'up' },
      { name: 'Sharpe Ratio', value: 1.67, change: 0.12, status: 'up' },
      { name: 'Max Drawdown', value: 8.3, change: -2.1, status: 'up' }
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

  const ChartComponent = ({ title, children, fullscreenContent }: { title: string, children: React.ReactNode, fullscreenContent?: React.ReactNode }) => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            {title}
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{title} - Fullscreen</DialogTitle>
              </DialogHeader>
              <div className="h-[70vh]">
                {fullscreenContent || children}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <BarChart3 className="w-4 h-4 mr-2" />
          Live Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Live Monitoring Dashboard
              <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                LIVE
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="h-[85vh] overflow-y-auto">
          <ResizablePanelGroup direction="vertical" className="space-y-4">
            {/* Control Panel */}
            <ResizablePanel defaultSize={15} minSize={10}>
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                  {performanceMetrics.map((metric, index) => (
                    <Card key={index} className="bg-slate-800 border-slate-700 p-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          {metric.status === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{metric.name}</div>
                        <div className="text-sm font-bold text-white">
                          {metric.name.includes('Rate') || metric.name.includes('Score') || metric.name.includes('Efficiency') || metric.name.includes('Ratio') || metric.name.includes('Drawdown')
                            ? `${metric.value}%` 
                            : `$${metric.value.toLocaleString()}`}
                        </div>
                        <div className={`text-xs ${metric.status === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.status === 'up' ? '+' : ''}{metric.change}%
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Charts Section */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResizablePanelGroup direction="horizontal" className="gap-4">
                <ResizablePanel defaultSize={60} minSize={40}>
                  <ChartComponent 
                    title={`Live Price Action (${selectedTimeframe})`}
                    fullscreenContent={
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
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                            formatter={(value: any) => [`$${value.toLocaleString()}`, 'Price']}
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
                    }
                  >
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveData.slice(-20)}>
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                            formatter={(value: any) => [`$${value.toLocaleString()}`, 'Price']}
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
                  </ChartComponent>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={40} minSize={30}>
                  <ChartComponent title="Trading Volume">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={liveData.slice(-15)}>
                          <XAxis 
                            dataKey="timestamp"
                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                            formatter={(value: any) => [`${(value/1000000).toFixed(2)}M`, 'Volume']}
                          />
                          <Bar dataKey="volume" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartComponent>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Bottom Section - Account Performance & Audit Logs */}
            <ResizablePanel defaultSize={35} minSize={25}>
              <ResizablePanelGroup direction="horizontal" className="gap-4">
                <ResizablePanel defaultSize={40} minSize={30}>
                  <Card className="bg-slate-800 border-slate-700 h-full">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-400" />
                        Account Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {accountPerformance.map((account, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                            <div>
                              <div className="font-medium text-white text-sm">{account.name}</div>
                              <div className="text-xs text-slate-400">{account.trades} trades</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-sm ${account.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {account.pnl >= 0 ? '+' : ''}${account.pnl.toFixed(2)}
                              </div>
                              <div className={`text-xs ${account.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {account.percentage >= 0 ? '+' : ''}{account.percentage.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={60} minSize={40}>
                  <Card className="bg-slate-800 border-slate-700 h-full">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        Live Trading Audit Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {auditLogs.slice(0, 20).map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-2 bg-slate-700 rounded text-xs">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                log.status === 'success' ? 'bg-green-400' : 
                                log.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                              }`} />
                              <span className="text-white font-medium">{log.action}</span>
                              <span className="text-slate-400">{log.details}</span>
                            </div>
                            <span className="text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};
