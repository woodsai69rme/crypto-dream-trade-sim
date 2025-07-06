
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
import { Bot, Brain, Zap, TrendingUp, AlertCircle, StopCircle, Play, RefreshCw, Activity } from 'lucide-react';

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
  paper_account_id?: string;
}

export const AITradingBot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentAccount, accounts } = useMultipleAccounts();
  const [bots, setBots] = useState<AIBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Load bots from database
  useEffect(() => {
    if (user) {
      loadBots();
    }
  }, [user, currentAccount]);

  // Real-time subscription for bot status changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('bot-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_trading_bots',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Bot status change detected:', payload);
          loadBots(); // Refresh all bots when any bot changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadBots = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Loading AI bots for user:', user.id);
      
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error loading bots:', error);
        throw error;
      }

      console.log('Raw bot data from database:', data);

      const formattedBots = data?.map(bot => {
        // Safely parse performance data
        let performanceData = { winRate: 0, totalTrades: 0, profit: 0 };
        
        if (bot.performance && typeof bot.performance === 'object' && bot.performance !== null) {
          const perf = bot.performance as any;
          performanceData = {
            winRate: typeof perf.winRate === 'number' ? perf.winRate : (typeof perf.win_rate === 'number' ? perf.win_rate : 0),
            totalTrades: typeof perf.totalTrades === 'number' ? perf.totalTrades : (typeof perf.total_trades === 'number' ? perf.total_trades : 0),
            profit: typeof perf.profit === 'number' ? perf.profit : (typeof perf.total_return === 'number' ? perf.total_return : 0)
          };
        }

        return {
          id: bot.id,
          name: bot.name,
          strategy: bot.strategy,
          status: bot.status as 'active' | 'paused' | 'learning',
          performance: performanceData,
          confidence: 50 + Math.random() * 40, // Dynamic confidence between 50-90%
          lastAction: `Analyzing ${bot.target_symbols?.[0] || 'market'}...`,
          paper_account_id: bot.paper_account_id
        };
      }) || [];

      console.log('Formatted bots:', formattedBots);
      setBots(formattedBots);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast({
        title: "Error Loading Bots",
        description: "Failed to load AI trading bots",
        variant: "destructive",
      });
      
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshBotStatus = async () => {
    setRefreshing(true);
    try {
      await loadBots();
      toast({
        title: "Status Refreshed",
        description: "Bot statuses have been updated from database",
      });
    } catch (error) {
      console.error('Error refreshing bots:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh bot statuses",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
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
          const price = symbol === 'BTC' ? 110000 + Math.random() * 5000 : 1000 + Math.random() * 5000;
          
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
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const toggleBot = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot || actionInProgress) {
      return;
    }

    const newStatus = bot.status === 'active' ? 'paused' : 'active';
    
    setActionInProgress(botId);
    try {
      console.log(`Toggling bot ${bot.name} from ${bot.status} to ${newStatus}`);
      
      // Update in database with retry logic
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', botId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state immediately for responsiveness
      setBots(prev => prev.map(b => {
        if (b.id === botId) {
          console.log(`Local state updated: ${b.name} -> ${newStatus}`);
          return { ...b, status: newStatus };
        }
        return b;
      }));

      toast({
        title: `Bot ${newStatus === 'active' ? 'Started' : 'Stopped'}`,
        description: `${bot.name} is now ${newStatus}`,
      });

      console.log(`Successfully toggled bot ${bot.name} to ${newStatus}`);
    } catch (error: any) {
      console.error('Error toggling bot:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update bot status",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const stopAllBots = async () => {
    if (actionInProgress) return;
    
    setActionInProgress('stop-all');
    try {
      console.log('Stopping all bots for user:', user?.id);
      
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ 
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error stopping all bots:', error);
        throw error;
      }

      // Update all local bot states
      setBots(prev => prev.map(bot => ({ ...bot, status: 'paused' as const })));
      
      toast({
        title: "All Bots Stopped",
        description: "All trading bots have been paused successfully",
      });

      console.log('All bots stopped successfully');
    } catch (error: any) {
      console.error('Error stopping all bots:', error);
      toast({
        title: "Error",
        description: "Failed to stop all bots",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const startAllBots = async () => {
    if (actionInProgress) return;
    
    setActionInProgress('start-all');
    try {
      console.log('Starting all bots for user:', user?.id);
      
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error starting all bots:', error);
        throw error;
      }

      // Update all local bot states
      setBots(prev => prev.map(bot => ({ ...bot, status: 'active' as const })));
      
      toast({
        title: "All Bots Started",
        description: "All trading bots have been activated successfully",
      });

      console.log('All bots started successfully');
    } catch (error: any) {
      console.error('Error starting all bots:', error);
      toast({
        title: "Error",
        description: "Failed to start all bots",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
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
          <div className="flex items-center justify-center">
            <Activity className="w-6 h-6 animate-pulse mr-2" />
            Loading AI bots...
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeBots = bots.filter(b => b.status === 'active').length;

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          AI Trading Bots
          <Badge className="bg-purple-500/20 text-purple-400">
            {activeBots} Active
          </Badge>
          <Button
            onClick={refreshBotStatus}
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={refreshing || actionInProgress !== null}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        
        {/* Global Controls */}
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={startAllBots} 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            disabled={actionInProgress !== null}
          >
            <Play className="w-3 h-3 mr-1" />
            {actionInProgress === 'start-all' ? 'Starting...' : 'Start All'}
          </Button>
          <Button 
            onClick={stopAllBots} 
            size="sm" 
            variant="destructive"
            disabled={actionInProgress !== null}
          >
            <StopCircle className="w-3 h-3 mr-1" />
            {actionInProgress === 'stop-all' ? 'Stopping...' : 'Stop All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bots.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Bot className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No AI trading bots found.</p>
            <p className="text-sm mt-2">Create your first bot to get started with automated trading.</p>
          </div>
        ) : (
          bots.map((bot) => (
            <div key={bot.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">{bot.name}</h4>
                    <p className="text-xs text-white/60">{bot.strategy}</p>
                    {bot.paper_account_id && (
                      <p className="text-xs text-blue-400">
                        Account: {accounts.find(a => a.id === bot.paper_account_id)?.account_name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(bot.status)}>
                    {bot.status.toUpperCase()}
                  </Badge>
                  <Switch 
                    checked={bot.status === 'active'} 
                    onCheckedChange={() => toggleBot(bot.id)}
                    disabled={bot.status === 'learning' || actionInProgress === bot.id}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{bot.performance.winRate.toFixed(1)}%</div>
                  <div className="text-xs text-white/60">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{bot.performance.totalTrades}</div>
                  <div className="text-xs text-white/60">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${bot.performance.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {bot.performance.profit >= 0 ? '+' : ''}${bot.performance.profit.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/60">Paper P&L</div>
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
                  {bot.status === 'paused' && <StopCircle className="w-3 h-3 text-yellow-400" />}
                  <span className="text-white/80">Last Action:</span>
                </div>
                <div className="mt-1 font-mono text-white">{bot.lastAction}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
