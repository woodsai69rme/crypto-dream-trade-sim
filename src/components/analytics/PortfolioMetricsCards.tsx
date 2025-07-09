
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target, Shield, DollarSign } from "lucide-react";

interface MetricsData {
  totalValue: number;
  totalReturn: number;
  dailyChange: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

interface PortfolioMetricsCardsProps {
  metrics: MetricsData;
  loading?: boolean;
}

export const PortfolioMetricsCards = ({ metrics, loading = false }: PortfolioMetricsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="crypto-card-gradient animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(metrics.totalValue)}
          </div>
          <p className="text-xs text-white/60">
            {formatPercentage(metrics.dailyChange)} today
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Total Return</CardTitle>
          {metrics.totalReturn >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getPerformanceColor(metrics.totalReturn)}`}>
            {formatPercentage(metrics.totalReturn)}
          </div>
          <p className="text-xs text-white/60">
            Since inception
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Win Rate</CardTitle>
          <Target className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-400">
            {metrics.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-white/60">
            {metrics.totalTrades} total trades
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Sharpe Ratio</CardTitle>
          <Activity className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <p className="text-xs text-white/60">
            Risk-adjusted return
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Max Drawdown</CardTitle>
          <Shield className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">
            -{Math.abs(metrics.maxDrawdown).toFixed(2)}%
          </div>
          <p className="text-xs text-white/60">
            Worst decline
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Volatility</CardTitle>
          <Activity className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400">
            {metrics.volatility.toFixed(1)}%
          </div>
          <p className="text-xs text-white/60">
            Price variation
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Active Trades</CardTitle>
          <Activity className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">
            12
          </div>
          <p className="text-xs text-white/60">
            Currently running
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Risk Score</CardTitle>
          <Shield className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-400">
            7.2
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              Moderate
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
