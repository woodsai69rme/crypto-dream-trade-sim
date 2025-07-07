
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, Tooltip, Legend } from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, BarChart3, Target, Zap } from "lucide-react";

interface BacktestConfig {
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  parameters: Record<string, any>;
}

interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  equityCurve: Array<{date: string, value: number, benchmark: number}>;
  trades: Array<any>;
}

export const BacktestingEngine = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<BacktestConfig>({
    strategy: 'moving_average_crossover',
    symbol: 'BTC',
    timeframe: '1h',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialCapital: 100000,
    parameters: {
      fast_ma: 20,
      slow_ma: 50,
      stop_loss: 5,
      take_profit: 10
    }
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BacktestResult | null>(null);

  const strategies = [
    { value: 'moving_average_crossover', label: 'Moving Average Crossover' },
    { value: 'rsi_oversold', label: 'RSI Oversold/Overbought' },
    { value: 'bollinger_bands', label: 'Bollinger Bands Mean Reversion' },
    { value: 'momentum', label: 'Momentum Strategy' },
    { value: 'grid_trading', label: 'Grid Trading' },
    { value: 'dca', label: 'Dollar Cost Averaging' }
  ];

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      // Simulate backtesting progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Generate mock results
      const mockResults: BacktestResult = {
        totalReturn: 45.3,
        sharpeRatio: 1.8,
        maxDrawdown: -12.5,
        winRate: 68.5,
        totalTrades: 156,
        profitFactor: 2.4,
        equityCurve: generateEquityCurve(),
        trades: []
      };

      setResults(mockResults);
      
      toast({
        title: "Backtest Complete",
        description: `Strategy achieved ${mockResults.totalReturn}% return with Sharpe ratio of ${mockResults.sharpeRatio}`,
      });
    } catch (error) {
      toast({
        title: "Backtest Failed",
        description: "Unable to complete backtest",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const generateEquityCurve = () => {
    const data = [];
    let portfolioValue = config.initialCapital;
    let benchmarkValue = config.initialCapital;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date('2024-01-01');
      date.setDate(date.getDate() + i);
      
      // Simulate portfolio performance
      const dailyReturn = (Math.random() - 0.48) * 0.03; // Slight positive bias
      portfolioValue *= (1 + dailyReturn);
      
      // Simulate benchmark (market)
      const benchmarkReturn = (Math.random() - 0.5) * 0.02;
      benchmarkValue *= (1 + benchmarkReturn);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(portfolioValue),
        benchmark: Math.round(benchmarkValue)
      });
    }
    
    return data;
  };

  const updateParameter = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Strategy Backtesting</h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runBacktest}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Backtest'}
          </Button>
          <Button variant="outline" disabled={isRunning}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Strategy</Label>
              <Select
                value={config.strategy}
                onValueChange={(value) => setConfig(prev => ({ ...prev, strategy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Select
                  value={config.symbol}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, symbol: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="ADA">ADA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select
                  value={config.timeframe}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, timeframe: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1m</SelectItem>
                    <SelectItem value="5m">5m</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="4h">4h</SelectItem>
                    <SelectItem value="1d">1d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Initial Capital</Label>
              <Input
                type="number"
                value={config.initialCapital}
                onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
              />
            </div>

            {/* Strategy Parameters */}
            <div className="space-y-2">
              <Label>Strategy Parameters</Label>
              {config.strategy === 'moving_average_crossover' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Fast MA</Label>
                      <Input
                        type="number"
                        value={config.parameters.fast_ma}
                        onChange={(e) => updateParameter('fast_ma', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Slow MA</Label>
                      <Input
                        type="number"
                        value={config.parameters.slow_ma}
                        onChange={(e) => updateParameter('slow_ma', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Stop Loss %</Label>
                      <Input
                        type="number"
                        value={config.parameters.stop_loss}
                        onChange={(e) => updateParameter('stop_loss', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Take Profit %</Label>
                      <Input
                        type="number"
                        value={config.parameters.take_profit}
                        onChange={(e) => updateParameter('take_profit', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {results && (
            <>
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="crypto-card-gradient text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Return</div>
                    <div className="text-2xl font-bold text-green-400">
                      +{results.totalReturn}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="crypto-card-gradient text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Sharpe Ratio</div>
                    <div className="text-2xl font-bold">{results.sharpeRatio}</div>
                  </CardContent>
                </Card>
                
                <Card className="crypto-card-gradient text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Max Drawdown</div>
                    <div className="text-2xl font-bold text-red-400">
                      {results.maxDrawdown}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="crypto-card-gradient text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                    <div className="text-2xl font-bold">{results.winRate}%</div>
                  </CardContent>
                </Card>
                
                <Card className="crypto-card-gradient text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                    <div className="text-2xl font-bold">{results.totalTrades}</div>
                  </CardContent>
                </Card>
                
                <Card className="crypto-card-gradient text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Profit Factor</div>
                    <div className="text-2xl font-bold">{results.profitFactor}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Equity Curve */}
              <Card className="crypto-card-gradient text-primary-foreground">
                <CardHeader>
                  <CardTitle>Equity Curve vs Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.equityCurve}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          name="Strategy" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="benchmark" 
                          stroke="#6b7280" 
                          strokeWidth={2} 
                          name="Benchmark" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
