import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Target, Shield, 
  AlertTriangle, PieChart, BarChart3, LineChart as LineChartIcon,
  RefreshCw, Download, Calendar, Filter
} from 'lucide-react';

interface AnalyticsData {
  portfolioPerformance: Array<{
    date: string;
    value: number;
    benchmark: number;
    drawdown: number;
  }>;
  riskMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    beta: number;
    alpha: number;
    calmarRatio: number;
  };
  assetAllocation: Array<{
    asset: string;
    allocation: number;
    value: number;
    performance: number;
  }>;
  tradingMetrics: {
    totalTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    avgHoldTime: number;
  };
  monthlyReturns: Array<{
    month: string;
    return: number;
  }>;
}

export const AdvancedAnalyticsDashboard = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState('6M');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate loading analytics data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: AnalyticsData = {
        portfolioPerformance: generatePortfolioData(),
        riskMetrics: {
          sharpeRatio: 1.34,
          maxDrawdown: -12.5,
          volatility: 18.7,
          beta: 0.82,
          alpha: 3.2,
          calmarRatio: 0.71
        },
        assetAllocation: [
          { asset: 'Bitcoin', allocation: 35, value: 35000, performance: 8.5 },
          { asset: 'Ethereum', allocation: 30, value: 30000, performance: 12.3 },
          { asset: 'Solana', allocation: 15, value: 15000, performance: -3.2 },
          { asset: 'Cardano', allocation: 10, value: 10000, performance: 5.1 },
          { asset: 'Other Alts', allocation: 10, value: 10000, performance: 2.8 }
        ],
        tradingMetrics: {
          totalTrades: 247,
          winRate: 68.4,
          avgWin: 4.2,
          avgLoss: -2.1,
          profitFactor: 2.31,
          avgHoldTime: 4.5
        },
        monthlyReturns: [
          { month: 'Jan', return: 8.5 },
          { month: 'Feb', return: -2.3 },
          { month: 'Mar', return: 12.1 },
          { month: 'Apr', return: 5.7 },
          { month: 'May', return: -4.1 },
          { month: 'Jun', return: 9.8 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load portfolio analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolioData = () => {
    const data = [];
    const startValue = 100000;
    
    for (let i = 0; i < 180; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (180 - i));
      
      const trend = i * 0.05;
      const volatility = (Math.random() - 0.5) * 2000;
      const portfolioValue = startValue + trend * 300 + volatility;
      const benchmarkValue = startValue + trend * 200;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(portfolioValue, startValue * 0.8),
        benchmark: Math.max(benchmarkValue, startValue * 0.85),
        drawdown: Math.min(0, (portfolioValue - Math.max(...data.map(d => d?.value || startValue), startValue)) / Math.max(...data.map(d => d?.value || startValue), startValue) * 100)
      });
    }
    
    return data;
  };

  const exportAnalytics = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeframe,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: "Analytics Exported",
      description: "Portfolio analytics data has been downloaded",
    });
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-8 text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading advanced analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p>Failed to load analytics data</p>
          <Button onClick={loadAnalyticsData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Advanced Portfolio Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {['1M', '3M', '6M', '1Y', 'ALL'].map(period => (
                  <Button
                    key={period}
                    size="sm"
                    variant={timeframe === period ? "default" : "outline"}
                    onClick={() => setTimeframe(period)}
                    className={timeframe === period ? "bg-purple-600" : "border-white/20"}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              <Button onClick={exportAnalytics} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Sharpe Ratio</p>
                <p className="text-xl font-bold">{analyticsData.riskMetrics.sharpeRatio}</p>
              </div>
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Max Drawdown</p>
                <p className="text-xl font-bold text-red-400">{analyticsData.riskMetrics.maxDrawdown}%</p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Volatility</p>
                <p className="text-xl font-bold">{analyticsData.riskMetrics.volatility}%</p>
              </div>
              <Activity className="w-6 h-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Win Rate</p>
                <p className="text-xl font-bold text-green-400">{analyticsData.tradingMetrics.winRate}%</p>
              </div>
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Alpha</p>
                <p className="text-xl font-bold text-purple-400">{analyticsData.riskMetrics.alpha}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Trades</p>
                <p className="text-xl font-bold">{analyticsData.tradingMetrics.totalTrades}</p>
              </div>
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trading">Trading Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Portfolio Performance vs Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.portfolioPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }} 
                  />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} name="Portfolio" />
                  <Line type="monotone" dataKey="benchmark" stroke="#6b7280" strokeWidth={2} name="Benchmark" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Monthly Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }} 
                  />
                  <Bar dataKey="return" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.assetAllocation.map((asset) => (
                  <div key={asset.asset} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{asset.asset}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">${asset.value.toLocaleString()}</span>
                        <span className={`text-sm font-medium ${asset.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.performance >= 0 ? '+' : ''}{asset.performance}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={asset.allocation} className="flex-1" />
                      <span className="text-sm w-12">{asset.allocation}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Beta</p>
                    <p className="text-xl font-bold">{analyticsData.riskMetrics.beta}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Calmar Ratio</p>
                    <p className="text-xl font-bold">{analyticsData.riskMetrics.calmarRatio}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Volatility Risk</span>
                    <span>{analyticsData.riskMetrics.volatility}%</span>
                  </div>
                  <Progress value={analyticsData.riskMetrics.volatility} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Drawdown Risk</span>
                    <span>{Math.abs(analyticsData.riskMetrics.maxDrawdown)}%</span>
                  </div>
                  <Progress value={Math.abs(analyticsData.riskMetrics.maxDrawdown)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analyticsData.portfolioPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }} 
                    />
                    <Area type="monotone" dataKey="drawdown" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{analyticsData.tradingMetrics.profitFactor}</div>
                  <div className="text-sm text-white/60">Profit Factor</div>
                  <div className="text-xs text-white/40 mt-2">Avg Win: ${analyticsData.tradingMetrics.avgWin}%</div>
                  <div className="text-xs text-white/40">Avg Loss: {analyticsData.tradingMetrics.avgLoss}%</div>
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{analyticsData.tradingMetrics.avgHoldTime}d</div>
                  <div className="text-sm text-white/60">Avg Hold Time</div>
                  <div className="text-xs text-white/40 mt-2">Position Management</div>
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{analyticsData.tradingMetrics.totalTrades}</div>
                  <div className="text-sm text-white/60">Total Trades</div>
                  <div className="text-xs text-white/40 mt-2">Activity Level</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};