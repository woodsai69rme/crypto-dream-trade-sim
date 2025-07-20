
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Zap } from 'lucide-react';

interface MetricData {
  timestamp: string;
  value: number;
  change: number;
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  data: MetricData[];
  unit: string;
  target?: number;
}

export const RealTimeAnalytics = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize mock metrics
    const initializeMetrics = () => {
      const mockMetrics: RealTimeMetric[] = [
        {
          id: 'portfolio_value',
          name: 'Portfolio Value',
          value: 125840,
          change: 2340,
          changePercent: 1.89,
          trend: 'up',
          unit: '$',
          target: 150000,
          data: generateTimeSeriesData(30, 120000, 130000)
        },
        {
          id: 'daily_pnl',
          name: 'Daily P&L',
          value: 1250,
          change: 340,
          changePercent: 3.74,
          trend: 'up',
          unit: '$',
          data: generateTimeSeriesData(24, -500, 1500)
        },
        {
          id: 'win_rate',
          name: 'Win Rate',
          value: 68.5,
          change: 2.1,
          changePercent: 3.16,
          trend: 'up',
          unit: '%',
          target: 75,
          data: generateTimeSeriesData(30, 60, 75)
        },
        {
          id: 'active_trades',
          name: 'Active Trades',
          value: 12,
          change: -2,
          changePercent: -14.3,
          trend: 'down',
          unit: '',
          data: generateTimeSeriesData(24, 8, 15)
        }
      ];

      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    initializeMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * metric.value * 0.02,
        change: (Math.random() - 0.5) * metric.value * 0.01,
        changePercent: (Math.random() - 0.5) * 5,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
        data: [...metric.data.slice(1), {
          timestamp: new Date().toISOString(),
          value: metric.value + (Math.random() - 0.5) * metric.value * 0.02,
          change: (Math.random() - 0.5) * metric.value * 0.01
        }]
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateTimeSeriesData = (points: number, min: number, max: number): MetricData[] => {
    const data: MetricData[] = [];
    const now = new Date();
    
    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000).toISOString();
      const value = min + Math.random() * (max - min);
      const change = (Math.random() - 0.5) * (max - min) * 0.1;
      
      data.push({ timestamp, value, change });
    }
    
    return data;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString(undefined, { 
                        maximumFractionDigits: metric.unit === '%' ? 1 : 0 
                      })}{metric.unit === '%' ? '%' : ''}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className={getTrendColor(metric.trend)}>
                    {metric.change >= 0 ? '+' : ''}{metric.unit === '$' ? '$' : ''}{metric.change.toFixed(0)}{metric.unit === '%' ? '%' : ''}
                  </span>
                  <span className="text-muted-foreground">
                    ({metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)
                  </span>
                </div>

                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress to Target</span>
                      <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                  </div>
                )}

                <div className="h-16 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.data.slice(-12)}>
                      <defs>
                        <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill={`url(#gradient-${metric.id})`}
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Portfolio Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics[0]?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Daily P&L Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics[1]?.data || []}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#pnlGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
