
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface ChartDataPoint {
  date: string;
  value: number;
  volume: number;
  benchmark: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  loading?: boolean;
}

export const PerformanceChart = ({ 
  data, 
  timeframe, 
  onTimeframeChange, 
  loading = false 
}: PerformanceChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  
  const timeframes = [
    { key: '1D', label: '1 Day' },
    { key: '7D', label: '7 Days' },
    { key: '30D', label: '30 Days' },
    { key: '90D', label: '90 Days' },
    { key: '1Y', label: '1 Year' },
    { key: 'ALL', label: 'All Time' }
  ];

  const formatValue = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeframe === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue ? (change / previousValue) * 100 : 0;

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5" />
            <CardTitle>Portfolio Performance</CardTitle>
            <Badge className="bg-green-500/20 text-green-400">
              LIVE
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
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
          
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.key}
                variant={timeframe === tf.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeframeChange(tf.key)}
                className="text-xs"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={formatValue}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value: number, name: string) => [
                    formatValue(value),
                    name === 'value' ? 'Portfolio' : 'Benchmark'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="url(#portfolioGradient)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6b7280" 
                  fill="url(#benchmarkGradient)"
                  strokeWidth={1}
                />
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={formatValue}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value: number, name: string) => [
                    formatValue(value),
                    name === 'value' ? 'Portfolio' : 'Benchmark'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
