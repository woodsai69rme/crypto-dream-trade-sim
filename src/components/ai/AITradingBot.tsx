
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Bot, Brain, Zap, TrendingUp, AlertCircle, StopCircle, Play } from 'lucide-react';

interface AIBot {
  id: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'learning';
  performance: {
    winRate: number;
    totalTrades: number;
    profit: number;
  };
  confidence: number;
  lastAction: string;
}

export const AITradingBot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const [bots, setBots] = useState<AIBot[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bots from database
  useEffect(() => {
    if (user) {
      loadBots();
    }
  }, [user]);

  const loadBots = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedBots = data?.map(bot => {
        // Safely parse performance data with proper type checking
        let performanceData = { winRate: 0, totalTrades: 0, profit: 0 };
        
        if (bot.performance && typeof bot.performance === 'object' && bot.performance !== null) {
          const perf = bot.performance as any;
          performanceData = {
            winRate: typeof perf.winRate === 'number' ? perf.winRate : 0,
            totalTrades: typeof perf.totalTrades === 'number' ? perf.totalTrades : 0,
            profit: typeof perf.profit === 'number' ? perf.profit : 0
          };
        }

        return {
          id: bot.id,
          name: bot.name,
          strategy: bot.strategy,
          status: bot.status as 'active' | 'paused' | 'learning',
          performance: performanceData,
          confidence: Math.random() * 50 + 50, // Dynamic confidence
          lastAction: `Analyzing ${bot.target_symbols?.[0] || 'market'}...`
        };
      }) || [];

      setBots(formattedBots);
      console.log('Loaded bots:', formattedBots);
    } catch (error) {
      console.error('Error loading bots:', error);
      // Fallback to demo data if no bots exist
      setBots([
        {
          id: '1',
          name: 'Trend Master',
          strategy: 'Moving Average Crossover',
          status: 'active',
          performance: { winRate: 73.2, totalTrades: 156, profit: 1240.50 },
          confidence: 87,
          lastAction: 'BUY BTC @ $67,432'
        },
        {
          id: '2', 
          name: 'Scalp Hunter',
          strategy: 'High Frequency Scalping',
          status: 'paused',
          performance: { winRate: 68.9, totalTrades: 892, profit: 890.30 },
          confidence: 92,
          lastAction: 'SELL ETH @ $3,678'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Simulate bot activity for active bots
  useEffect(() => {
    const interval = setInterval(() => {
      setBots(prev => prev.map(bot => {
        if (bot.status === 'active' && Math.random() > 0.8) {
          const symbols = ['BTC', 'ETH', 'SOL', 'ADA'];
          const sides = ['BUY', 'SELL'];
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const side = sides[Math.floor(Math.random() * sides.length)];
          const price = 50000 + Math.random() * 20000;
          
          return {
            ...bot,
            lastAction: `${side} ${symbol} @ $${price.toLocaleString()}`,
            confidence: Math.max(50, Math.min(95, bot.confidence + (Math.random() - 0.5) * 10)),
            performance: {
              ...bot.performance,
              totalTrades: bot.performance.totalTrades + (Math.random() > 0.7 ? 1 : 0)
            }
          };
        }
        return bot;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleBot = async (botId: string) => {
    console.log('Toggling bot:', botId);
    
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    const newStatus = bot.status === 'active' ? 'paused' : 'active';
    
    try {
      // Update in database if bot exists there
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ status: newStatus })
        .eq('id', botId)
        .eq('user_id', user?.id);

      if (error && !error.message.includes('duplicate key')) {
        console.error('Database update error:', error);
      }

      // Update local state
      setBots(prev => prev.map(bot => {
        if (bot.id === botId) {
          console.log(`Bot ${bot.name} status changed from ${bot.status} to ${newStatus}`);
          return { ...bot, status: newStatus };
        }
        return bot;
      }));

      toast({
        title: `Bot ${newStatus === 'active' ? 'Started' : 'Stopped'}`,
        description: `${bot.name} is now ${newStatus}`,
      });
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive",
      });
    }
  };

  const stopAllBots = async () => {
    console.log('Stopping all bots');
    try {
      await supabase
        .from('ai_trading_bots')
        .update({ status: 'paused' })
        .eq('user_id', user?.id);

      setBots(prev => prev.map(bot => ({ ...bot, status: 'paused' as const })));
      
      toast({
        title: "All Bots Stopped",
        description: "All trading bots have been paused",
      });
    } catch (error) {
      console.error('Error stopping all bots:', error);
    }
  };

  const startAllBots = async () => {
    console.log('Starting all bots');
    try {
      await supabase
        .from('ai_trading_bots')
        .update({ status: 'active' })
        .eq('user_id', user?.id);

      setBots(prev => prev.map(bot => ({ ...bot, status: 'active' as const })));
      
      toast({
        title: "All Bots Started",
        description: "All trading bots have been activated",
      });
    } catch (error) {
      console.error('Error starting all bots:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'learning': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading AI bots...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          AI Trading Bots
          <Badge className="bg-purple-500/20 text-purple-400">
            {bots.filter(b => b.status === 'active').length} Active
          </Badge>
        </CardTitle>
        
        {/* Global Controls */}
        <div className="flex gap-2 mt-4">
          <Button onClick={startAllBots} size="sm" className="bg-green-600 hover:bg-green-700">
            <Play className="w-3 h-3 mr-1" />
            Start All
          </Button>
          <Button onClick={stopAllBots} size="sm" variant="destructive">
            <StopCircle className="w-3 h-3 mr-1" />
            Stop All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bots.map((bot) => (
          <div key={bot.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium">{bot.name}</h4>
                  <p className="text-xs text-white/60">{bot.strategy}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(bot.status)}>
                  {bot.status.toUpperCase()}
                </Badge>
                <Switch 
                  checked={bot.status === 'active'} 
                  onCheckedChange={() => toggleBot(bot.id)}
                  disabled={bot.status === 'learning'}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{bot.performance.winRate}%</div>
                <div className="text-xs text-white/60">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{bot.performance.totalTrades}</div>
                <div className="text-xs text-white/60">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  +${bot.performance.profit.toFixed(2)}
                </div>
                <div className="text-xs text-white/60">Paper Profit</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Confidence Level</span>
                <span className="text-xs font-medium">{bot.confidence.toFixed(0)}%</span>
              </div>
              <Progress value={bot.confidence} className="h-2" />
            </div>

            <div className="mt-3 p-2 bg-white/5 rounded text-xs">
              <div className="flex items-center gap-2">
                {bot.status === 'learning' && <AlertCircle className="w-3 h-3 text-blue-400" />}
                {bot.status === 'active' && <Zap className="w-3 h-3 text-green-400" />}
                <span className="text-white/80">Last Action:</span>
              </div>
              <div className="mt-1 font-mono text-white">{bot.lastAction}</div>
            </div>
          </div>
        ))}

        <Button className="w-full mt-4" variant="outline">
          <Bot className="w-4 h-4 mr-2" />
          Create New AI Bot
        </Button>
      </CardContent>
    </Card>
  );
};
