
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { PortfolioMetricsCards } from "./PortfolioMetricsCards";
import { PerformanceChart } from "./PerformanceChart";
import { RiskAnalysisPanel } from "./RiskAnalysisPanel";
import { EnhancedPortfolioChart } from "../charts/EnhancedPortfolioChart";
import { 
  BarChart3, RefreshCw, Download, Settings, 
  TrendingUp, AlertTriangle, Calendar
} from 'lucide-react';

interface AnalyticsData {
  portfolioValue: number;
  totalReturn: number;
  dailyChange: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  performanceData: Array<{
    date: string;
    value: number;
    volume: number;
    benchmark: number;
  }>;
  riskMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    beta: number;
    alpha: number;
    sortinoRatio: number;
    calmarRatio: number;
    var95: number;
    skewness: number;
    kurtosis: number;
  };
}

export const AdvancedPortfolioAnalytics = () => {
  const { toast } = useToast();
  const { accounts, currentAccount } = useMultipleAccounts();
  const [timeframe, setTimeframe] = useState('30D');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Generate realistic analytics data
  const generateAnalyticsData = (): AnalyticsData => {
    const baseValue = currentAccount?.balance || 100000;
    const performanceData = [];
    
    // Generate performance data based on timeframe
    const days = timeframe === '1D' ? 1 : 
                 timeframe === '7D' ? 7 : 
                 timeframe === '30D' ? 30 : 
                 timeframe === '90D' ? 90 : 
                 timeframe === '1Y' ? 365 : 30;

    let currentValue = baseValue * 0.9; // Start slightly below current
    const volatility = 0.02; // 2% daily volatility
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Random walk with slight upward bias
      const randomChange = (Math.random() - 0.45) * volatility;
      currentValue *= (1 + randomChange);
      
      const benchmarkValue = baseValue * (1 + (i / days) * 0.05); // 5% benchmark growth
      
      performanceData.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(currentValue),
        volume: Math.round(50000 + Math.random() * 200000),
        benchmark: Math.round(benchmarkValue)
      });
    }

    const finalValue = performanceData[performanceData.length - 1].value;
    const totalReturn = ((finalValue - baseValue) / baseValue) * 100;
    const dailyChanges = performanceData.slice(1).map((point, i) => 
      (point.value - performanceData[i].value) / performanceData[i].value
    );
    
    const avgDailyReturn = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;
    const dailyVolatility = Math.sqrt(
      dailyChanges.reduce((sum, change) => sum + Math.pow(change - avgDailyReturn, 2), 0) / dailyChanges.length
    );
    
    const sharpeRatio = avgDailyReturn / dailyVolatility * Math.sqrt(252); // Annualized
    const maxDrawdownValue = Math.min(...performanceData.map((point, i) => {
      const peak = Math.max(...performanceData.slice(0, i + 1).map(p => p.value));
      return (point.value - peak) / peak * 100;
    }));

    return {
      portfolioValue: finalValue,
      totalReturn,
      dailyChange: dailyChanges[dailyChanges.length - 1] * 100,
      totalTrades: 247 + Math.floor(Math.random() * 50),
      winRate: 65 + Math.random() * 15,
      sharpeRatio: Math.max(0.5, sharpeRatio),
      maxDrawdown: maxDrawdownValue,
      volatility: dailyVolatility * Math.sqrt(252) * 100, // Annualized volatility
      performanceData,
      riskMetrics: {
        sharpeRatio: Math.max(0.5, sharpeRatio),
        maxDrawdown: maxDrawdownValue,
        volatility: dailyVolatility * Math.sqrt(252) * 100,
        beta: 0.8 + Math.random() * 0.4,
        alpha: (Math.random() - 0.5) * 6,
        sortinoRatio: Math.max(0.8, sharpeRatio * 1.2),
        calmarRatio: Math.abs(totalReturn / maxDrawdownValue),
        var95: -Math.abs(2 + Math.random() * 3),
        skewness: (Math.random() - 0.5) * 2,
        kurtosis: 3 + Math.random() * 2
      }
    };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateAnalyticsData();
      setAnalyticsData(data);
      setLastUpdated(new Date());
      
      toast({
        title: "Analytics Updated",
        description: "Portfolio analytics have been refreshed",
      });
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

  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      timeframe,
      account: currentAccount?.account_name,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, currentAccount]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadAnalytics();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loading]);

  if (!analyticsData && loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-white">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Advanced Portfolio Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive performance analysis and risk assessment
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            {currentAccount && (
              <Badge variant="secondary" className="text-xs">
                {currentAccount.account_name}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalytics}
            disabled={!analyticsData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Key Metrics Cards */}
          <PortfolioMetricsCards
            metrics={{
              totalValue: analyticsData.portfolioValue,
              totalReturn: analyticsData.totalReturn,
              dailyChange: analyticsData.dailyChange,
              totalTrades: analyticsData.totalTrades,
              winRate: analyticsData.winRate,
              sharpeRatio: analyticsData.sharpeRatio,
              maxDrawdown: analyticsData.maxDrawdown,
              volatility: analyticsData.volatility
            }}
            loading={loading}
          />

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="charts">Advanced Charts</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <PerformanceChart
                data={analyticsData.performanceData}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="risk" className="space-y-6">
              <RiskAnalysisPanel
                metrics={analyticsData.riskMetrics}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <EnhancedPortfolioChart
                accountId={currentAccount?.id}
                timeRange={timeframe as any}
              />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle>Account Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account, index) => (
                      <div key={account.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{account.account_name}</h4>
                          <Badge className={
                            account.total_pnl_percentage >= 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }>
                            {account.total_pnl_percentage >= 0 ? '+' : ''}
                            {account.total_pnl_percentage.toFixed(2)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-white/60">Balance:</span>
                            <div className="font-medium text-white">
                              ${account.balance.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-white/60">P&L:</span>
                            <div className={`font-medium ${
                              account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${account.total_pnl.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-white/60">Risk Level:</span>
                            <div className="font-medium text-white capitalize">
                              {account.risk_level}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
