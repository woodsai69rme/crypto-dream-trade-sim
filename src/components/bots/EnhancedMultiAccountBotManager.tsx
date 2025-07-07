import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { Bot, Play, Pause, Settings, TrendingUp, TrendingDown, BarChart3, Users, Zap, Target } from "lucide-react";

interface AITradingBot {
  id: string;
  name: string;
  strategy: string;
  ai_model: string;
  target_symbols: string[];
  status: 'active' | 'paused' | 'stopped';
  mode: 'paper' | 'live';
  paper_balance: number;
  paper_account_id?: string;
  max_position_size: number;
  risk_level: string;
  performance: {
    total_return: number;
    win_rate: number;
    total_trades: number;
    daily_pnl: number;
  };
  config: any;
  last_trade_at?: string;
}

export const EnhancedMultiAccountBotManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { accounts } = useMultipleAccounts();
  const [bots, setBots] = useState<AITradingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<AITradingBot | null>(null);

  useEffect(() => {
    if (user) {
      fetchBots();
    }
  }, [user]);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedBots: AITradingBot[] = (data || []).map(bot => ({
        ...bot,
        status: bot.status as 'active' | 'paused' | 'stopped',
        mode: bot.mode as 'paper' | 'live',
        performance: typeof bot.performance === 'object' && bot.performance ? bot.performance as any : {
          total_return: 0,
          win_rate: 0,
          total_trades: 0,
          daily_pnl: 0
        }
      }));
      
      setBots(mappedBots);
    } catch (error: any) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Error",
        description: "Failed to load trading bots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBotStatus = async (botId: string, newStatus: 'active' | 'paused') => {
    try {
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ status: newStatus })
        .eq('id', botId);

      if (error) throw error;

      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, status: newStatus } : bot
      ));

      toast({
        title: newStatus === 'active' ? "Bot Started" : "Bot Paused",
        description: `Trading bot has been ${newStatus === 'active' ? 'started' : 'paused'}`,
      });
    } catch (error: any) {
      console.error('Error updating bot status:', error);
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive",
      });
    }
  };

  const assignBotToAccount = async (botId: string, accountId: string) => {
    try {
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ paper_account_id: accountId })
        .eq('id', botId);

      if (error) throw error;

      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, paper_account_id: accountId } : bot
      ));

      toast({
        title: "Bot Assigned",
        description: "Bot has been assigned to the selected account",
      });
    } catch (error: any) {
      console.error('Error assigning bot:', error);
      toast({
        title: "Error",
        description: "Failed to assign bot to account",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'stopped': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'aggressive': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const activeBots = bots.filter(bot => bot.status === 'active');
  const pausedBots = bots.filter(bot => bot.status === 'paused');
  const totalPnL = bots.reduce((sum, bot) => sum + (bot.performance?.daily_pnl || 0), 0);
  const totalTrades = bots.reduce((sum, bot) => sum + (bot.performance?.total_trades || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Multi-Account Bot Manager</h2>
          <Badge variant="outline">{bots.length} bots</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Active: {activeBots.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Paused: {pausedBots.length}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total P&L</p>
                <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalPnL.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Bots</p>
                <p className="text-lg font-bold">{activeBots.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Trades</p>
                <p className="text-lg font-bold">{totalTrades}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Avg Win Rate</p>
                <p className="text-lg font-bold">
                  {bots.length > 0 ? (bots.reduce((sum, bot) => sum + (bot.performance?.win_rate || 0), 0) / bots.length).toFixed(1) : 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Bots ({activeBots.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused Bots ({pausedBots.length})</TabsTrigger>
          <TabsTrigger value="all">All Bots ({bots.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4">
            {activeBots.map((bot) => (
              <Card key={bot.id} className="crypto-card-gradient text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{bot.name}</h3>
                        <p className="text-sm text-white/60">{bot.strategy} • {bot.ai_model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                      <Badge className={getRiskColor(bot.risk_level)}>
                        {bot.risk_level}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/60">Balance</p>
                      <p className="font-medium">${bot.paper_balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Daily P&L</p>
                      <p className={`font-medium ${(bot.performance?.daily_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${(bot.performance?.daily_pnl || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Win Rate</p>
                      <p className="font-medium">{(bot.performance?.win_rate || 0).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Trades</p>
                      <p className="font-medium">{bot.performance?.total_trades || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">Symbols:</span>
                      <div className="flex gap-1">
                        {bot.target_symbols.slice(0, 3).map(symbol => (
                          <Badge key={symbol} variant="outline" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                        {bot.target_symbols.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{bot.target_symbols.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select value={bot.paper_account_id || ''} onValueChange={(value) => assignBotToAccount(bot.id, value)}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBotStatus(bot.id, 'paused')}
                        className="h-8"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBot(bot)}
                        className="h-8"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paused">
          <div className="grid gap-4">
            {pausedBots.map((bot) => (
              <Card key={bot.id} className="crypto-card-gradient text-white opacity-75">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{bot.name}</h3>
                        <p className="text-sm text-white/60">{bot.strategy} • {bot.ai_model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBotStatus(bot.id, 'active')}
                        className="h-8"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {bots.map((bot) => (
              <Card key={bot.id} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        bot.status === 'active' ? 'bg-green-500/20' : 
                        bot.status === 'paused' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        <Bot className={`w-4 h-4 ${
                          bot.status === 'active' ? 'text-green-400' : 
                          bot.status === 'paused' ? 'text-yellow-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{bot.name}</h4>
                        <p className="text-xs text-white/60">{bot.strategy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                      <span className="text-sm">${bot.paper_balance.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};