import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Target, Shield } from "lucide-react";

interface PerformanceData {
  date: string;
  value: number;
  return: number;
}

interface MetricsProps {
  data: PerformanceData[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    volatility: number;
  };
}

export const PerformanceMetrics = memo(({ data, metrics }: MetricsProps) => {
  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${metrics.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.totalReturn > 0 ? '+' : ''}{metrics.totalReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-white/60">Total Return</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{metrics.sharpeRatio.toFixed(2)}</div>
            <div className="text-sm text-white/60">Sharpe Ratio</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">-{metrics.maxDrawdown.toFixed(2)}%</div>
            <div className="text-sm text-white/60">Max Drawdown</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{metrics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-white/60">Win Rate</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--crypto-success))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Badge className="bg-green-500/20 text-green-400 justify-center py-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            Low Risk
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 justify-center py-2">
            <Shield className="w-3 h-3 mr-1" />
            Stable
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 justify-center py-2">
            <Target className="w-3 h-3 mr-1" />
            Optimized
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceMetrics.displayName = 'PerformanceMetrics';