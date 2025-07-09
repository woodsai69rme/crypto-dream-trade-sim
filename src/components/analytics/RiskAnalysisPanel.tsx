
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingDown, Activity, Target } from "lucide-react";

interface RiskMetrics {
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
}

interface RiskAnalysisPanelProps {
  metrics: RiskMetrics;
  loading?: boolean;
}

export const RiskAnalysisPanel = ({ metrics, loading = false }: RiskAnalysisPanelProps) => {
  const getRiskLevel = (sharpe: number) => {
    if (sharpe > 2) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (sharpe > 1) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getPerformanceRating = (value: number, type: 'ratio' | 'percentage') => {
    if (type === 'ratio') {
      if (value >= 2) return 'Excellent';
      if (value >= 1.5) return 'Good';
      if (value >= 1) return 'Fair';
      return 'Poor';
    } else {
      if (Math.abs(value) <= 5) return 'Low';
      if (Math.abs(value) <= 15) return 'Medium';
      return 'High';
    }
  };

  const riskLevel = getRiskLevel(metrics.sharpeRatio);

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Analysis
          </CardTitle>
          <Badge className={`${riskLevel.bg} ${riskLevel.color}`}>
            {riskLevel.level} Risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">Sharpe Ratio</span>
              <Badge variant="outline" className="text-xs">
                {getPerformanceRating(metrics.sharpeRatio, 'ratio')}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {metrics.sharpeRatio.toFixed(2)}
            </div>
            <Progress value={Math.min(metrics.sharpeRatio * 33.33, 100)} className="h-2 mt-2" />
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">Max Drawdown</span>
              <Badge variant="outline" className="text-xs">
                {getPerformanceRating(metrics.maxDrawdown, 'percentage')}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-red-400">
              -{Math.abs(metrics.maxDrawdown).toFixed(2)}%
            </div>
            <Progress value={Math.min(Math.abs(metrics.maxDrawdown), 100)} className="h-2 mt-2" />
          </div>
        </div>

        {/* Advanced Risk Metrics */}
        <div className="space-y-4">
          <h4 className="font-medium text-white mb-3">Advanced Risk Metrics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Volatility</span>
                <span className="font-medium">{metrics.volatility.toFixed(2)}%</span>
              </div>
              <Progress value={Math.min(metrics.volatility * 2, 100)} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Beta</span>
                <span className="font-medium">{metrics.beta.toFixed(2)}</span>
              </div>
              <Progress value={Math.min(metrics.beta * 50, 100)} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Alpha</span>
                <span className={`font-medium ${metrics.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.alpha >= 0 ? '+' : ''}{metrics.alpha.toFixed(2)}%
                </span>
              </div>
              <Progress value={Math.min(Math.abs(metrics.alpha) * 10, 100)} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Sortino Ratio</span>
                <span className="font-medium">{metrics.sortinoRatio.toFixed(2)}</span>
              </div>
              <Progress value={Math.min(metrics.sortinoRatio * 25, 100)} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Calmar Ratio</span>
                <span className="font-medium">{metrics.calmarRatio.toFixed(2)}</span>
              </div>
              <Progress value={Math.min(metrics.calmarRatio * 20, 100)} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">VaR (95%)</span>
                <span className="font-medium text-red-400">-{Math.abs(metrics.var95).toFixed(2)}%</span>
              </div>
              <Progress value={Math.min(Math.abs(metrics.var95) * 2, 100)} className="h-2" />
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-white/60">Risk Score</div>
              <div className="text-lg font-bold text-orange-400">7.2/10</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Diversification</div>
              <div className="text-lg font-bold text-blue-400">8.5/10</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Liquidity</div>
              <div className="text-lg font-bold text-green-400">9.1/10</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Stability</div>
              <div className="text-lg font-bold text-purple-400">7.8/10</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
