
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, PieChart as PieChartIcon, BarChart3, Calendar, Download } from 'lucide-react';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';

export const AdvancedPortfolioAnalytics = () => {
  const { currentAccount, accounts } = useMultipleAccounts();
  const { performanceData, metrics, loading } = usePerformanceAnalytics(currentAccount?.id);
  
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('return');

  // Advanced performance data
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalReturn: 12.45,
    sharpeRatio: 1.82,
    maxDrawdown: -5.3,
    winRate: 68.5,
    volatility: 15.2,
    alpha: 0.08,
    beta: 0.95,
    sortinoRatio: 2.14,
    calmarRatio: 2.35,
    treynorRatio: 0.13
  });

  // Risk metrics
  const riskMetrics = [
    { name: 'Value at Risk (95%)', value: '-$2,450', color: 'text-red-400' },
    { name: 'Expected Shortfall', value: '-$3,200', color: 'text-red-400' },
    { name: 'Maximum Drawdown', value: '-5.3%', color: 'text-red-400' },
    { name: 'Downside Deviation', value: '8.7%', color: 'text-yellow-400' },
    { name: 'Up Capture Ratio', value: '105.2%', color: 'text-green-400' },
    { name: 'Down Capture Ratio', value: '92.8%', color: 'text-green-400' }
  ];

  // Portfolio composition
  const portfolioComposition = [
    { name: 'Bitcoin', value: 35, amount: 35000, color: '#f59e0b' },
    { name: 'Ethereum', value: 25, amount: 25000, color: '#3b82f6' },
    { name: 'Solana', value: 15, amount: 15000, color: '#8b5cf6' },
    { name: 'Cardano', value: 10, amount: 10000, color: '#10b981' },
    { name: 'Others', value: 15, amount: 15000, color: '#6b7280' }
  ];

  // Sector allocation
  const sectorAllocation = [
    { name: 'Layer 1', percentage: 60, amount: 60000 },
    { name: 'DeFi', percentage: 20, amount: 20000 },
    { name: 'Layer 2', percentage: 10, amount: 10000 },
    { name: 'Gaming', percentage: 5, amount: 5000 },
    { name: 'NFTs', percentage: 5, amount: 5000 }
  ];

  // Performance comparison data
  const benchmarkData = [
    { date: '2024-01', portfolio: 5.2, btc: 3.8, sp500: 2.1 },
    { date: '2024-02', portfolio: 8.1, btc: 6.5, sp500: 2.8 },
    { date: '2024-03', portfolio: 12.3, btc: 9.2, sp500: 3.2 },
    { date: '2024-04', portfolio: 15.7, btc: 12.1, sp500: 4.1 },
    { date: '2024-05', portfolio: 18.9, btc: 15.3, sp500: 4.8 },
    { date: '2024-06', portfolio: 22.4, btc: 18.7, sp500: 5.5 }
  ];

  // Drawdown analysis
  const drawdownData = [
    { date: '2024-01', drawdown: 0 },
    { date: '2024-02', drawdown: -1.2 },
    { date: '2024-03', drawdown: -2.8 },
    { date: '2024-04', drawdown: -5.3 },
    { date: '2024-05', drawdown: -3.1 },
    { date: '2024-06', drawdown: -1.5 }
  ];

  const exportData = (format: 'csv' | 'pdf') => {
    // Export analytics data
    console.log(`Exporting analytics data as ${format}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading advanced analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground">Advanced Portfolio Analytics</h2>
          <p className="text-muted-foreground">Comprehensive performance analysis and risk metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Return</p>
                <p className="text-2xl font-bold text-green-400">+{performanceMetrics.totalReturn}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-blue-400">{performanceMetrics.sharpeRatio}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-400">{performanceMetrics.maxDrawdown}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Win Rate</p>
                <p className="text-2xl font-bold text-purple-400">{performanceMetrics.winRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Volatility</p>
                <p className="text-2xl font-bold text-orange-400">{performanceMetrics.volatility}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="composition">Composition</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={benchmarkData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }} 
                    />
                    <Area type="monotone" dataKey="portfolio" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Advanced Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Alpha</p>
                    <p className="text-lg font-bold text-green-400">+{performanceMetrics.alpha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Beta</p>
                    <p className="text-lg font-bold text-blue-400">{performanceMetrics.beta}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Sortino Ratio</p>
                    <p className="text-lg font-bold text-purple-400">{performanceMetrics.sortinoRatio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Calmar Ratio</p>
                    <p className="text-lg font-bold text-orange-400">{performanceMetrics.calmarRatio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Treynor Ratio</p>
                    <p className="text-lg font-bold text-cyan-400">{performanceMetrics.treynorRatio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Information Ratio</p>
                    <p className="text-lg font-bold text-pink-400">1.28</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-white/80">{metric.name}</span>
                    <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Risk-Return Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { risk: 0, return: 0 },
                    { risk: 5, return: 3 },
                    { risk: 10, return: 8 },
                    { risk: 15, return: 12 },
                    { risk: 20, return: 15 },
                    { risk: 25, return: 18 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="risk" stroke="rgba(255,255,255,0.7)" label={{ value: 'Risk (%)', position: 'insideBottom', offset: -5 }} />
                    <YAxis stroke="rgba(255,255,255,0.7)" label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="return" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="composition">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioComposition}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorAllocation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Performance vs Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={benchmarkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={3} name="Portfolio" />
                  <Line type="monotone" dataKey="btc" stroke="#f59e0b" strokeWidth={2} name="Bitcoin" />
                  <Line type="monotone" dataKey="sp500" stroke="#3b82f6" strokeWidth={2} name="S&P 500" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Drawdown Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={drawdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Monte Carlo Simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">95%</p>
                    <p className="text-sm text-white/60">Confidence Level</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-400">$125,000</p>
                      <p className="text-xs text-white/60">Expected Value (1Y)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-400">$85,000</p>
                      <p className="text-xs text-white/60">Worst Case (5%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Portfolio Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Current Allocation</span>
                    <Badge variant="secondary">Good</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Suggested Rebalancing</span>
                    <Badge variant="outline" className="text-yellow-400">Available</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Risk-Adjusted Return</span>
                    <span className="text-green-400 font-bold">+15.2%</span>
                  </div>
                  <Button className="w-full mt-4">
                    View Optimization Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
