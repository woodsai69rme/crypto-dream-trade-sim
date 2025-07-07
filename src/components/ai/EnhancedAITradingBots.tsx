import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { 
  Bot, Play, Pause, Settings, TrendingUp, Brain, 
  Zap, Target, Shield, Activity, Clock, RefreshCw,
  Plus, Trash2, Copy, BarChart3
} from 'lucide-react';

interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'technical' | 'ai' | 'arbitrage' | 'dca' | 'grid' | 'momentum';
  riskLevel: 'low' | 'medium' | 'high' | 'aggressive';
  parameters: Record<string, any>;
  performance: {
    winRate: number;
    totalTrades: number;
    avgReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  isActive: boolean;
  backtestResults?: BacktestResult;
}

interface BacktestResult {
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  sharpeRatio: number;
  equityCurve: Array<{ date: string; value: number }>;
}

interface AIBot {
  id: string;
  name: string;
  strategy: TradingStrategy;
  status: 'active' | 'paused' | 'learning' | 'backtesting';
  paperBalance: number;
  targetSymbols: string[];
  performance: {
    dailyPnL: number;
    weeklyPnL: number;
    monthlyPnL: number;
    totalTrades: number;
    winRate: number;
  };
  settings: {
    maxPositionSize: number;
    stopLoss: number;
    takeProfit: number;
    confidence: number;
  };
  lastAction: string;
  createdAt: string;
}

export const EnhancedAITradingBots = () => {
  const { toast } = useToast();
  const { settings, updateSetting } = useSettings();
  const [bots, setBots] = useState<AIBot[]>([]);
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [selectedBot, setSelectedBot] = useState<AIBot | null>(null);
  const [isCreatingBot, setIsCreatingBot] = useState(false);
  const [backtestInProgress, setBacktestInProgress] = useState<string | null>(null);
  
  const [newBot, setNewBot] = useState({
    name: '',
    strategyId: '',
    paperBalance: 10000,
    targetSymbols: ['BTC', 'ETH'],
    maxPositionSize: 1000,
    stopLoss: 5,
    takeProfit: 15,
    confidence: 75
  });

  useEffect(() => {
    loadStrategies();
    loadBots();
  }, []);

  const loadStrategies = () => {
    const defaultStrategies: TradingStrategy[] = [
      {
        id: 'trend-following',
        name: 'AI Trend Following',
        description: 'Advanced trend detection using neural networks and technical indicators',
        type: 'ai',
        riskLevel: 'medium',
        parameters: {
          lookbackPeriod: 20,
          trendThreshold: 0.6,
          rsiPeriod: 14,
          macdSignal: true
        },
        performance: {
          winRate: 72.5,
          totalTrades: 156,
          avgReturn: 3.2,
          maxDrawdown: -8.5,
          sharpeRatio: 1.45
        },
        isActive: true
      },
      {
        id: 'mean-reversion',
        name: 'Mean Reversion Bot',
        description: 'Identifies oversold/overbought conditions for contrarian trades',
        type: 'technical',
        riskLevel: 'low',
        parameters: {
          rsiLower: 30,
          rsiUpper: 70,
          bollinger: true,
          stochastic: true
        },
        performance: {
          winRate: 65.8,
          totalTrades: 234,
          avgReturn: 2.1,
          maxDrawdown: -5.2,
          sharpeRatio: 1.12
        },
        isActive: true
      },
      {
        id: 'arbitrage',
        name: 'Cross-Exchange Arbitrage',
        description: 'Exploits price differences across multiple exchanges',
        type: 'arbitrage',
        riskLevel: 'low',
        parameters: {
          minSpread: 0.5,
          maxSpread: 3.0,
          exchangeCount: 3,
          latencyThreshold: 100
        },
        performance: {
          winRate: 89.2,
          totalTrades: 445,
          avgReturn: 0.8,
          maxDrawdown: -2.1,
          sharpeRatio: 2.34
        },
        isActive: true
      },
      {
        id: 'grid-trading',
        name: 'Dynamic Grid Trading',
        description: 'Places buy/sell orders at regular intervals around current price',
        type: 'grid',
        riskLevel: 'medium',
        parameters: {
          gridLevels: 10,
          gridSpacing: 2.0,
          autoAdjust: true,
          volumeWeighted: true
        },
        performance: {
          winRate: 58.7,
          totalTrades: 892,
          avgReturn: 1.5,
          maxDrawdown: -12.8,
          sharpeRatio: 0.87
        },
        isActive: false
      },
      {
        id: 'momentum',
        name: 'Momentum Breakout',
        description: 'Captures strong price movements and trend continuations',
        type: 'momentum',
        riskLevel: 'high',
        parameters: {
          breakoutThreshold: 3.0,
          volumeConfirmation: true,
          timeframe: '1h',
          stopDistance: 2.0
        },
        performance: {
          winRate: 45.3,
          totalTrades: 67,
          avgReturn: 8.7,
          maxDrawdown: -18.5,
          sharpeRatio: 1.67
        },
        isActive: true
      },
      {
        id: 'ml-prediction',
        name: 'Machine Learning Predictor',
        description: 'Uses advanced ML models to predict price movements',
        type: 'ai',
        riskLevel: 'aggressive',
        parameters: {
          modelType: 'lstm',
          features: ['price', 'volume', 'sentiment', 'onchain'],
          confidenceThreshold: 80,
          retrainFreq: 'weekly'
        },
        performance: {
          winRate: 76.8,
          totalTrades: 89,
          avgReturn: 12.4,
          maxDrawdown: -25.3,
          sharpeRatio: 1.92
        },
        isActive: true
      }
    ];
    
    setStrategies(defaultStrategies);
  };

  const loadBots = () => {
    // Mock bot data - in real app, load from database
    const mockBots: AIBot[] = [
      {
        id: '1',
        name: 'Bitcoin Trend Master',
        strategy: strategies[0] || {} as TradingStrategy,
        status: 'active',
        paperBalance: 12547.89,
        targetSymbols: ['BTC'],
        performance: {
          dailyPnL: 234.56,
          weeklyPnL: 1205.67,
          monthlyPnL: 2547.89,
          totalTrades: 45,
          winRate: 73.3
        },
        settings: {
          maxPositionSize: 2500,
          stopLoss: 5,
          takeProfit: 15,
          confidence: 75
        },
        lastAction: 'BUY BTC @ $110,234',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ];
    
    setBots(mockBots);
  };

  const createBot = async () => {
    const strategy = strategies.find(s => s.id === newBot.strategyId);
    if (!strategy) {
      toast({
        title: "Error",
        description: "Please select a trading strategy",
        variant: "destructive",
      });
      return;
    }

    const bot: AIBot = {
      id: Date.now().toString(),
      name: newBot.name,
      strategy,
      status: 'paused',
      paperBalance: newBot.paperBalance,
      targetSymbols: newBot.targetSymbols,
      performance: {
        dailyPnL: 0,
        weeklyPnL: 0,
        monthlyPnL: 0,
        totalTrades: 0,
        winRate: 0
      },
      settings: {
        maxPositionSize: newBot.maxPositionSize,
        stopLoss: newBot.stopLoss,
        takeProfit: newBot.takeProfit,
        confidence: newBot.confidence
      },
      lastAction: 'Bot initialized',
      createdAt: new Date().toISOString()
    };

    setBots(prev => [...prev, bot]);
    setIsCreatingBot(false);
    setNewBot({
      name: '',
      strategyId: '',
      paperBalance: 10000,
      targetSymbols: ['BTC', 'ETH'],
      maxPositionSize: 1000,
      stopLoss: 5,
      takeProfit: 15,
      confidence: 75
    });

    toast({
      title: "Bot Created",
      description: `${bot.name} has been created successfully`,
    });
  };

  const runBacktest = async (strategyId: string) => {
    setBacktestInProgress(strategyId);
    
    try {
      // Simulate backtest
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const strategy = strategies.find(s => s.id === strategyId);
      if (!strategy) return;
      
      const backtestResult: BacktestResult = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        initialCapital: 10000,
        finalCapital: 13450,
        totalReturn: 34.5,
        maxDrawdown: -12.3,
        winRate: 68.7,
        totalTrades: 156,
        profitFactor: 2.15,
        sharpeRatio: 1.45,
        equityCurve: generateEquityCurve()
      };
      
      setStrategies(prev => prev.map(s => 
        s.id === strategyId ? { ...s, backtestResults: backtestResult } : s
      ));
      
      toast({
        title: "Backtest Complete",
        description: `${strategy.name}: ${backtestResult.totalReturn}% return`,
      });
    } catch (error) {
      toast({
        title: "Backtest Failed",
        description: "Failed to run backtest",
        variant: "destructive",
      });
    } finally {
      setBacktestInProgress(null);
    }
  };

  const generateEquityCurve = () => {
    const curve = [];
    let value = 10000;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (365 - i));
      
      value += (Math.random() - 0.48) * 100; // Slight positive bias
      curve.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(value, 5000) // Don't go below 50% drawdown
      });
    }
    
    return curve;
  };

  const toggleBot = (botId: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const newStatus = bot.status === 'active' ? 'paused' : 'active';
        toast({
          title: `Bot ${newStatus === 'active' ? 'Started' : 'Paused'}`,
          description: `${bot.name} is now ${newStatus}`,
        });
        return { ...bot, status: newStatus };
      }
      return bot;
    }));
  };

  const deleteBot = (botId: string) => {
    setBots(prev => prev.filter(bot => bot.id !== botId));
    toast({
      title: "Bot Deleted",
      description: "Trading bot has been removed",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'aggressive': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'learning': return 'bg-blue-500/20 text-blue-400';
      case 'backtesting': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Enhanced AI Trading Bots
              <Badge className="bg-purple-500/20 text-purple-400">
                {bots.filter(b => b.status === 'active').length} Active
              </Badge>
            </CardTitle>
            <Button onClick={() => setIsCreatingBot(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Bot
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="bots">My Bots</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-4">
          {isCreatingBot && (
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Create New Trading Bot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label>Bot Name</Label>
                    <Input
                      value={newBot.name}
                      onChange={(e) => setNewBot(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Trading Bot"
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                  
                  <div>
                    <Label>Trading Strategy</Label>
                    <Select value={newBot.strategyId} onValueChange={(value) => setNewBot(prev => ({ ...prev, strategyId: value }))}>
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map(strategy => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name} ({strategy.performance.winRate}% win rate)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Paper Balance ($)</Label>
                    <Input
                      type="number"
                      value={newBot.paperBalance}
                      onChange={(e) => setNewBot(prev => ({ ...prev, paperBalance: parseFloat(e.target.value) || 0 }))}
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                  
                  <div>
                    <Label>Max Position Size ($)</Label>
                    <Input
                      type="number"
                      value={newBot.maxPositionSize}
                      onChange={(e) => setNewBot(prev => ({ ...prev, maxPositionSize: parseFloat(e.target.value) || 0 }))}
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={createBot} className="bg-purple-600 hover:bg-purple-700">
                    Create Bot
                  </Button>
                  <Button onClick={() => setIsCreatingBot(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <Card key={bot.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{bot.name}</h3>
                        <p className="text-sm text-white/60">{bot.strategy.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(bot.status)}>
                          {bot.status.toUpperCase()}
                        </Badge>
                        <Switch
                          checked={bot.status === 'active'}
                          onCheckedChange={() => toggleBot(bot.id)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-lg font-bold ${bot.performance.monthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.performance.monthlyPnL >= 0 ? '+' : ''}${bot.performance.monthlyPnL.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/60">Monthly P&L</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{bot.performance.winRate}%</div>
                        <div className="text-xs text-white/60">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{bot.performance.totalTrades}</div>
                        <div className="text-xs text-white/60">Trades</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Paper Balance:</span>
                        <span>${bot.paperBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Symbols:</span>
                        <span>{bot.targetSymbols.join(', ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Action:</span>
                        <span className="text-purple-400">{bot.lastAction}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedBot(bot)}>
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteBot(bot.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{strategy.name}</h3>
                        <p className="text-sm text-white/60">{strategy.description}</p>
                      </div>
                      <Badge className={getRiskColor(strategy.riskLevel)}>
                        {strategy.riskLevel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Win Rate:</span>
                        <span className="ml-2 font-medium text-green-400">{strategy.performance.winRate}%</span>
                      </div>
                      <div>
                        <span className="text-white/60">Avg Return:</span>
                        <span className="ml-2 font-medium">{strategy.performance.avgReturn}%</span>
                      </div>
                      <div>
                        <span className="text-white/60">Max Drawdown:</span>
                        <span className="ml-2 font-medium text-red-400">{strategy.performance.maxDrawdown}%</span>
                      </div>
                      <div>
                        <span className="text-white/60">Sharpe Ratio:</span>
                        <span className="ml-2 font-medium">{strategy.performance.sharpeRatio}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => runBacktest(strategy.id)}
                        disabled={backtestInProgress === strategy.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {backtestInProgress === strategy.id ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        {backtestInProgress === strategy.id ? 'Running...' : 'Backtest'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3 mr-1" />
                        Clone
                      </Button>
                    </div>

                    {strategy.backtestResults && (
                      <div className="mt-4 p-3 bg-white/5 rounded">
                        <h4 className="font-medium mb-2">Latest Backtest Results</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Total Return: <span className="text-green-400">{strategy.backtestResults.totalReturn}%</span></div>
                          <div>Total Trades: {strategy.backtestResults.totalTrades}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400">+$12,547</div>
                <div className="text-sm text-white/60">Total P&L (All Bots)</div>
                <div className="text-xs text-white/40 mt-2">+18.7% return</div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400">73.2%</div>
                <div className="text-sm text-white/60">Average Win Rate</div>
                <div className="text-xs text-white/40 mt-2">Across all strategies</div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">234</div>
                <div className="text-sm text-white/60">Total Trades</div>
                <div className="text-xs text-white/40 mt-2">This month</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};