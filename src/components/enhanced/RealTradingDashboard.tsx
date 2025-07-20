import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield,
  Users,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ComprehensiveAPIManager } from '@/components/integrations/ComprehensiveAPIManager';
import { RealTimeSignalProcessor } from '@/components/trading/RealTimeSignalProcessor';
import { SecurityValidationLayer } from '@/components/trading/SecurityValidationLayer';
import { EnhancedTradeAuditSystem } from '@/components/trading/EnhancedTradeAuditSystem';

interface PerformanceMetrics {
  total_pnl: number;
  daily_pnl: number;
  win_rate: number;
  total_trades: number;
  active_positions: number;
  portfolio_value: number;
}

interface MarketOverview {
  symbol: string;
  price: number;
  change_24h: number;
  volume: number;
  market_cap: number;
}

export const RealTradingDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [marketData, setMarketData] = useState<MarketOverview[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate mock data for demo
  useEffect(() => {
    const generateMockData = () => {
      setPerformanceData({
        total_pnl: 15420.75,
        daily_pnl: 892.50,
        win_rate: 78.2,
        total_trades: 156,
        active_positions: 8,
        portfolio_value: 125630.40
      });

      setMarketData([
        {
          symbol: 'BTC',
          price: 43250.00,
          change_24h: 2.45,
          volume: 28500000000,
          market_cap: 850000000000
        },
        {
          symbol: 'ETH',
          price: 2680.50,
          change_24h: -1.23,
          volume: 15200000000,
          market_cap: 320000000000
        },
        {
          symbol: 'SOL',
          price: 98.75,
          change_24h: 5.67,
          volume: 2100000000,
          market_cap: 42000000000
        },
        {
          symbol: 'ADA',
          price: 0.48,
          change_24h: -0.85,
          volume: 890000000,
          market_cap: 17000000000
        }
      ]);

      setLoading(false);
    };

    generateMockData();

    // Update every 10 seconds
    const interval = setInterval(generateMockData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(performanceData?.portfolio_value || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${(performanceData?.total_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(performanceData?.total_pnl || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <p className={`text-2xl font-bold ${(performanceData?.daily_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(performanceData?.daily_pnl || 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {performanceData?.win_rate?.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{performanceData?.total_trades}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold">{performanceData?.active_positions}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.map((market) => (
              <div key={market.symbol} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{market.symbol}</h4>
                  <Badge variant={market.change_24h >= 0 ? 'default' : 'destructive'}>
                    {formatPercentage(market.change_24h)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">{formatCurrency(market.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-medium">${(market.volume / 1e9).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap:</span>
                    <span className="font-medium">${(market.market_cap / 1e9).toFixed(0)}B</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="trading" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trading">Live Trading</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Real trading system is active. All trades will execute on live markets.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Risk Exposure</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    65% of maximum risk allocation used
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Orders Today:</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Execution Time:</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-green-500">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals">
          <RealTimeSignalProcessor />
        </TabsContent>

        <TabsContent value="exchanges">
          <ComprehensiveAPIManager />
        </TabsContent>

        <TabsContent value="security">
          <SecurityValidationLayer />
        </TabsContent>

        <TabsContent value="audit">
          <EnhancedTradeAuditSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};