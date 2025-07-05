
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, Tooltip, Legend } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Activity, Target } from "lucide-react";

interface ChartDataPoint {
  time: string;
  value: number;
  volume: number;
  pnl: number;
  trades: number;
}

interface EnhancedPortfolioChartProps {
  accountId?: string;
  timeRange?: '1D' | '7D' | '30D' | '90D' | '1Y';
}

export const EnhancedPortfolioChart = ({ 
  accountId, 
  timeRange = '7D' 
}: EnhancedPortfolioChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'pnl' | 'volume'>('value');
  const [isLive, setIsLive] = useState(true);

  // Generate realistic chart data
  useEffect(() => {
    const generateData = () => {
      const points = timeRange === '1D' ? 24 : timeRange === '7D' ? 168 : 720;
      const data: ChartDataPoint[] = [];
      let baseValue = 100000;
      
      for (let i = 0; i < points; i++) {
        const timestamp = new Date(Date.now() - (points - i) * 60000);
        const change = (Math.random() - 0.5) * 1000;
        baseValue += change;
        
        data.push({
          time: timestamp.toISOString(),
          value: baseValue,
          volume: 10000 + Math.random() * 50000,
          pnl: change,
          trades: Math.floor(Math.random() * 10)
        });
      }
      
      setChartData(data);
    };

    generateData();
    
    if (isLive) {
      const interval = setInterval(generateData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, isLive]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatValue = (value: number) => {
    if (selectedMetric === 'volume') {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'pnl':
        return '#10b981';
      case 'volume':
        return '#8b5cf6';
      default:
        return '#3b82f6';
    }
  };

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue ? (change / previousValue) * 100 : 0;

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Portfolio Analytics
            {isLive && (
              <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedMetric === 'value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric('value')}
            >
              Value
            </Button>
            <Button
              variant={selectedMetric === 'pnl' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric('pnl')}
            >
              P&L
            </Button>
            <Button
              variant={selectedMetric === 'volume' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric('volume')}
            >
              Volume
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(currentValue)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              changePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {changePercent >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis 
                dataKey="time"
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                labelFormatter={(label) => formatTime(label)}
                formatter={(value: number, name: string) => [
                  formatValue(value),
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              
              {selectedMetric === 'value' && (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getMetricColor()}
                  strokeWidth={2}
                  fill="url(#valueGradient)"
                />
              )}
              
              {selectedMetric === 'pnl' && (
                <Bar
                  dataKey="pnl"
                  fill={getMetricColor()}
                  opacity={0.8}
                />
              )}
              
              {selectedMetric === 'volume' && (
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke={getMetricColor()}
                  strokeWidth={3}
                  dot={{ fill: getMetricColor(), strokeWidth: 2 }}
                />
              )}
              
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm text-white/60">24h High</div>
            <div className="font-bold text-green-400">
              ${Math.max(...chartData.map(d => d.value)).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/60">24h Low</div>
            <div className="font-bold text-red-400">
              ${Math.min(...chartData.map(d => d.value)).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/60">Avg Volume</div>
            <div className="font-bold text-blue-400">
              ${(chartData.reduce((sum, d) => sum + d.volume, 0) / chartData.length).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/60">Total Trades</div>
            <div className="font-bold text-purple-400">
              {chartData.reduce((sum, d) => sum + d.trades, 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
