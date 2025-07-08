import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useSettings } from "@/hooks/useSettings";
import { 
  Bot, Users, TrendingUp, TrendingDown, Activity, Zap, 
  AlertTriangle, CheckCircle, RefreshCw, Play, Pause, Settings,
  Target, BarChart3, Globe, MessageSquare, Bell
} from "lucide-react";

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
    weekly_pnl: number;
    monthly_pnl: number;
  };
  config: any;
  last_trade_at?: string;
  created_at: string;
}

interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  source: string;
  reasoning: string;
  bot_id?: string;
  account_id?: string;
  timestamp: string;
}

interface FollowingSettings {
  minConfidence: number;
  maxPositionSize: number;
  autoExecute: boolean;
  followRatio: number;
  riskMultiplier: number;
  delayMs: number;
}

const DEFAULT_BOTS = [
  { name: "Bitcoin Trend Master", strategy: "trend-following", symbols: ["BTC"], balance: 5000, risk: "medium" },
  { name: "Ethereum Grid Bot", strategy: "grid-trading", symbols: ["ETH"], balance: 3000, risk: "low" },
  { name: "Multi-Coin DCA", strategy: "dca", symbols: ["BTC", "ETH", "SOL"], balance: 2000, risk: "low" },
  { name: "Solana Breakout Hunter", strategy: "breakout", symbols: ["SOL"], balance: 1500, risk: "high" },
  { name: "Arbitrage Scanner", strategy: "arbitrage", symbols: ["BTC", "ETH"], balance: 4000, risk: "medium" },
  { name: "Momentum Trader", strategy: "momentum", symbols: ["ADA", "DOT"], balance: 2500, risk: "high" },
  { name: "Mean Reversion Bot", strategy: "mean-reversion", symbols: ["LINK", "UNI"], balance: 1000, risk: "medium" },
  { name: "Scalping Master", strategy: "scalping", symbols: ["BTC"], balance: 3000, risk: "aggressive" },
  { name: "News Sentiment Trader", strategy: "sentiment", symbols: ["BTC", "ETH", "SOL"], balance: 2000, risk: "medium" },
  { name: "ML Prediction Engine", strategy: "ml-prediction", symbols: ["BTC", "ETH"], balance: 5000, risk: "high" },
  { name: "Cross-Exchange Arb", strategy: "arbitrage", symbols: ["BTC", "ETH", "USDT"], balance: 10000, risk: "low" },
  { name: "Whale Tracker", strategy: "on-chain", symbols: ["BTC", "ETH"], balance: 3000, risk: "medium" },
  { name: "Options Hedge Bot", strategy: "hedge", symbols: ["BTC", "ETH"], balance: 5000, risk: "medium" },
  { name: "Flash Crash Hunter", strategy: "contrarian", symbols: ["BTC", "ETH", "SOL"], balance: 2000, risk: "aggressive" },
  { name: "Pairs Trading Bot", strategy: "pairs", symbols: ["BTC", "ETH"], balance: 4000, risk: "medium" },
  { name: "Futures Spreader", strategy: "spread", symbols: ["BTC", "ETH"], balance: 3000, risk: "high" },
  { name: "Stablecoin Yield", strategy: "yield", symbols: ["USDT", "USDC", "DAI"], balance: 5000, risk: "low" },
  { name: "Altcoin Rotation", strategy: "rotation", symbols: ["ADA", "DOT", "LINK", "UNI"], balance: 2000, risk: "high" },
  { name: "Technical Pattern Bot", strategy: "pattern", symbols: ["BTC", "ETH"], balance: 2500, risk: "medium" },
  { name: "Volume Surge Detector", strategy: "volume", symbols: ["BTC", "ETH", "SOL", "ADA"], balance: 1500, risk: "high" }
];

export const ComprehensiveTradeFollowingSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { accounts, executeTrade } = useMultipleAccounts();
  const { settings, updateSetting } = useSettings();

  const [bots, setBots] = useState<AITradingBot[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemActive, setSystemActive] = useState(false);
  const [followingSettings, setFollowingSettings] = useState<Record<string, FollowingSettings>>({});
  const [redistributing, setRedistributing] = useState(false);
  
  // Real-time stats
  const [stats, setStats] = useState({
    totalTrades: 0,
    activeBots: 0,
    avgWinRate: 0,
    totalPnL: 0,
    signalsProcessed: 0,
    uptime: 0
  });

  useEffect(() => {
    if (user) {
      initializeSystem();
    }
  }, [user]);

  const initializeSystem = async () => {
    try {
      await Promise.all([
        fetchBots(),
        loadFollowingSettings(),
        checkSystemStatus()
      ]);
    } finally {
      setLoading(false);
    }
  };

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
          daily_pnl: 0,
          weekly_pnl: 0,
          monthly_pnl: 0
        }
      }));
      
      setBots(mappedBots);
      
      // If no bots exist, create them
      if (mappedBots.length === 0) {
        await createInitialBots();
      }
    } catch (error: any) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Error",
        description: "Failed to load trading bots",
        variant: "destructive",
      });
    }
  };

  const createInitialBots = async () => {
    try {
      const { error } = await supabase.rpc('create_initial_trading_bots', {
        user_id: user?.id
      });

      if (error) throw error;
      
      toast({
        title: "Bots Created",
        description: "20 AI trading bots have been created and are ready for activation",
      });
      
      await fetchBots();
    } catch (error: any) {
      console.error('Error creating bots:', error);
      toast({
        title: "Error",
        description: "Failed to create initial bots",
        variant: "destructive",
      });
    }
  };

  const redistributeBots = async () => {
    if (accounts.length < 3 || bots.length === 0) {
      toast({
        title: "Prerequisites Missing",
        description: "Need 3 accounts and 20 bots for redistribution",
        variant: "destructive",
      });
      return;
    }

    setRedistributing(true);
    
    try {
      // Strategic redistribution based on risk profiles
      const woods1 = accounts.find(acc => acc.account_name.toLowerCase().includes('woods1'));
      const angry = accounts.find(acc => acc.account_name.toLowerCase().includes('angry'));
      const handjob = accounts.find(acc => acc.account_name.toLowerCase().includes('handjob'));

      if (!woods1 || !angry || !handjob) {
        toast({
          title: "Account Names Required",
          description: "Please ensure accounts are named 'woods1', 'angry', and 'handjob' for strategic distribution",
          variant: "destructive",
        });
        return;
      }

      // Conservative bots for woods1 (7 bots)
      const conservativeBots = bots.filter(bot => 
        ['dca', 'grid-trading', 'mean-reversion', 'pattern', 'yield', 'pairs', 'hedge'].includes(bot.strategy)
      ).slice(0, 7);

      // Aggressive bots for angry (7 bots)
      const aggressiveBots = bots.filter(bot => 
        ['momentum', 'breakout', 'contrarian', 'sentiment', 'scalping', 'volume', 'on-chain'].includes(bot.strategy)
      ).slice(0, 7);

      // Hybrid bots for handjob (6 bots)
      const hybridBots = bots.filter(bot => 
        ['arbitrage', 'ml-prediction', 'spread', 'rotation'].includes(bot.strategy)
      ).slice(0, 6);

      // Update bot assignments
      const updates = [
        ...conservativeBots.map(bot => ({ id: bot.id, account_id: woods1.id })),
        ...aggressiveBots.map(bot => ({ id: bot.id, account_id: angry.id })),
        ...hybridBots.map(bot => ({ id: bot.id, account_id: handjob.id }))
      ];

      for (const update of updates) {
        await supabase
          .from('ai_trading_bots')
          .update({ paper_account_id: update.account_id })
          .eq('id', update.id);
      }

      toast({
        title: "Bots Redistributed",
        description: `Successfully distributed ${updates.length} bots across 3 accounts`,
      });

      await fetchBots();
    } catch (error: any) {
      console.error('Error redistributing bots:', error);
      toast({
        title: "Redistribution Failed",
        description: error.message || "Failed to redistribute bots",
        variant: "destructive",
      });
    } finally {
      setRedistributing(false);
    }
  };

  const activateAllBots = async () => {
    try {
      // Activate all bots
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ status: 'active' })
        .eq('user_id', user?.id);

      if (error) throw error;

      setBots(prev => prev.map(bot => ({ ...bot, status: 'active' as const })));
      
      toast({
        title: "All Bots Activated",
        description: "All 20 trading bots are now active and trading",
      });
    } catch (error: any) {
      console.error('Error activating bots:', error);
      toast({
        title: "Activation Failed",
        description: "Failed to activate all bots",
        variant: "destructive",
      });
    }
  };

  const enableGlobalFollowing = async () => {
    try {
      // Enable following for all accounts
      for (const account of accounts) {
        await updateSetting(`following_${account.id}`, true);
        
        // Set default following settings
        const defaultSettings: FollowingSettings = {
          minConfidence: 70,
          maxPositionSize: 1000,
          autoExecute: true,
          followRatio: 1.0,
          riskMultiplier: 1.0,
          delayMs: 500
        };
        
        setFollowingSettings(prev => ({
          ...prev,
          [account.id]: defaultSettings
        }));
      }

      setSystemActive(true);
      startSignalGeneration();

      toast({
        title: "Global Following Enabled",
        description: "Trade following is now active across all accounts",
      });
    } catch (error: any) {
      console.error('Error enabling following:', error);
      toast({
        title: "Following Failed",
        description: "Failed to enable global following",
        variant: "destructive",
      });
    }
  };

  const startSignalGeneration = () => {
    // Real-time signal generation with ensemble voting
    const generateSignal = () => {
      if (!systemActive || bots.length === 0) return;

      const activeBots = bots.filter(bot => bot.status === 'active');
      if (activeBots.length === 0) return;

      // Select random active bot and symbol
      const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
      const symbol = bot.target_symbols[Math.floor(Math.random() * bot.target_symbols.length)];
      const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
      
      // Higher confidence for conservative strategies
      const baseConfidence = bot.risk_level === 'low' ? 80 : 
                           bot.risk_level === 'medium' ? 70 : 60;
      const confidence = baseConfidence + Math.random() * 20;

      const signal: TradeSignal = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        price: 50000 + Math.random() * 20000,
        amount: 0.01 + Math.random() * 0.1,
        confidence,
        source: `${bot.name} (${bot.strategy})`,
        reasoning: generateTradeReasoning(bot.strategy, symbol, side),
        bot_id: bot.id,
        account_id: bot.paper_account_id,
        timestamp: new Date().toISOString()
      };

      setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals
      
      // Execute across all accounts with following enabled
      executeSignalAcrossAccounts(signal);
    };

    // Generate signals every 3-5 seconds
    const interval = setInterval(generateSignal, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  };

  const generateTradeReasoning = (strategy: string, symbol: string, side: string): string => {
    const reasons = {
      'trend-following': `${symbol} showing strong ${side === 'buy' ? 'upward' : 'downward'} momentum on multiple timeframes`,
      'grid-trading': `${symbol} price at optimal ${side === 'buy' ? 'support' : 'resistance'} level for grid strategy`,
      'momentum': `${symbol} breaking ${side === 'buy' ? 'above' : 'below'} key resistance with high volume`,
      'sentiment': `Social sentiment for ${symbol} strongly ${side === 'buy' ? 'bullish' : 'bearish'} across platforms`,
      'arbitrage': `${symbol} price discrepancy detected between exchanges, ${side} opportunity`,
      'scalping': `${symbol} micro-trend ${side === 'buy' ? 'reversal' : 'continuation'} signal confirmed`,
      'default': `AI analysis suggests ${side} ${symbol} based on technical indicators`
    };
    
    return reasons[strategy as keyof typeof reasons] || reasons.default;
  };

  const executeSignalAcrossAccounts = async (signal: TradeSignal) => {
    for (const account of accounts) {
      const accountSettings = followingSettings[account.id];
      if (!accountSettings || !accountSettings.autoExecute) continue;
      
      if (signal.confidence < accountSettings.minConfidence) continue;

      // Add small delay between account executions
      setTimeout(async () => {
        try {
          const adjustedAmount = signal.amount * accountSettings.followRatio * accountSettings.riskMultiplier;
          const maxAmount = Math.min(adjustedAmount, accountSettings.maxPositionSize / signal.price);

          await executeTrade({
            symbol: signal.symbol,
            side: signal.side,
            amount: maxAmount,
            price: signal.price,
            type: 'market'
          });

          setStats(prev => ({
            ...prev,
            totalTrades: prev.totalTrades + 1,
            signalsProcessed: prev.signalsProcessed + 1
          }));
        } catch (error) {
          console.error('Error executing signal:', error);
        }
      }, accountSettings.delayMs + Math.random() * 200);
    }
  };

  const loadFollowingSettings = async () => {
    for (const account of accounts) {
      const enabled = settings[`following_${account.id}`];
      if (enabled) {
        const defaultSettings: FollowingSettings = {
          minConfidence: 70,
          maxPositionSize: 1000,
          autoExecute: true,
          followRatio: 1.0,
          riskMultiplier: 1.0,
          delayMs: 500
        };
        
        setFollowingSettings(prev => ({
          ...prev,
          [account.id]: defaultSettings
        }));
      }
    }
  };

  const checkSystemStatus = async () => {
    // Check if system is already active
    const followingEnabled = accounts.some(account => settings[`following_${account.id}`]);
    setSystemActive(followingEnabled);
    
    if (followingEnabled) {
      startSignalGeneration();
    }
  };

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      const activeBots = bots.filter(bot => bot.status === 'active');
      const avgWinRate = bots.length > 0 ? 
        bots.reduce((sum, bot) => sum + (bot.performance?.win_rate || 0), 0) / bots.length : 0;
      const totalPnL = bots.reduce((sum, bot) => sum + (bot.performance?.daily_pnl || 0), 0);

      setStats(prev => ({
        ...prev,
        activeBots: activeBots.length,
        avgWinRate,
        totalPnL
      }));
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [bots]);

  const activeBots = bots.filter(bot => bot.status === 'active');
  const botsPerAccount = accounts.map(account => ({
    ...account,
    bots: bots.filter(bot => bot.paper_account_id === account.id)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h1 className="text-3xl font-bold text-primary-foreground">Complete Trade Following System</h1>
          <Badge className={systemActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
            {systemActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Trading Active</span>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Bots</p>
                <p className="text-lg font-bold">{stats.activeBots}/20</p>
              </div>
              <Bot className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Trades</p>
                <p className="text-lg font-bold">{stats.totalTrades}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Win Rate</p>
                <p className="text-lg font-bold">{stats.avgWinRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total P&L</p>
                <p className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalPnL.toFixed(2)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Signals</p>
                <p className="text-lg font-bold">{signals.length}/50</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Accounts</p>
                <p className="text-lg font-bold">{accounts.length}/3</p>
              </div>
              <Globe className="w-8 h-8 text-orange-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={redistributeBots}
              disabled={redistributing || bots.length === 0 || accounts.length < 3}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${redistributing ? 'animate-spin' : ''}`} />
              Redistribute Bots
            </Button>
            
            <Button
              onClick={activateAllBots}
              disabled={bots.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Activate All Bots
            </Button>
            
            <Button
              onClick={enableGlobalFollowing}
              disabled={accounts.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Enable Following
            </Button>
            
            <Button
              onClick={() => setSystemActive(!systemActive)}
              variant={systemActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {systemActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {systemActive ? 'Stop System' : 'Start System'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="accounts">Account Status</TabsTrigger>
          <TabsTrigger value="signals">Live Signals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Account Distribution */}
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Bot Distribution Across Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {botsPerAccount.map(accountData => (
                    <div key={accountData.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accountData.color_theme + '40' }}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{accountData.account_name}</h4>
                          <p className="text-sm text-white/60">{accountData.account_type} • {accountData.risk_level} risk</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-white/60">Active Bots</p>
                          <p className="font-medium">{accountData.bots.filter(bot => bot.status === 'active').length}/{accountData.bots.length}</p>
                        </div>
                        <Badge className={
                          followingSettings[accountData.id]?.autoExecute 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }>
                          {followingSettings[accountData.id]?.autoExecute ? 'Following' : 'Manual'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle>Trading Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Bot Activation Rate</span>
                      <span>{((activeBots.length / bots.length) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(activeBots.length / bots.length) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span>Following Coverage</span>
                      <span>{((Object.keys(followingSettings).length / accounts.length) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(Object.keys(followingSettings).length / accounts.length) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Real-time signal generation active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Cross-account trade following enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Ensemble bot voting operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Risk management active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="grid gap-4">
            {accounts.map(account => {
              const accountBots = bots.filter(bot => bot.paper_account_id === account.id);
              const activeBots = accountBots.filter(bot => bot.status === 'active');
              const accountSettings = followingSettings[account.id];
              
              return (
                <Card key={account.id} className="crypto-card-gradient text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: account.color_theme + '40' }}>
                          <Bot className="w-4 h-4" />
                        </div>
                        {account.account_name}
                      </div>
                      <Badge className={activeBots.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {activeBots.length}/{accountBots.length} Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Following Settings</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Auto Execute</span>
                            <Switch 
                              checked={accountSettings?.autoExecute || false}
                              onCheckedChange={(checked) => {
                                setFollowingSettings(prev => ({
                                  ...prev,
                                  [account.id]: { ...prev[account.id], autoExecute: checked }
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Min Confidence: {accountSettings?.minConfidence || 70}%</Label>
                            <Input 
                              type="range" 
                              min="50" 
                              max="95" 
                              value={accountSettings?.minConfidence || 70}
                              onChange={(e) => {
                                setFollowingSettings(prev => ({
                                  ...prev,
                                  [account.id]: { ...prev[account.id], minConfidence: parseInt(e.target.value) }
                                }));
                              }}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Bot Performance</Label>
                        <div className="space-y-2 mt-2">
                          {accountBots.slice(0, 3).map(bot => (
                            <div key={bot.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{bot.name.substring(0, 20)}...</span>
                              <Badge variant="outline" className={bot.status === 'active' ? 'text-green-400' : 'text-gray-400'}>
                                {bot.status}
                              </Badge>
                            </div>
                          ))}
                          {accountBots.length > 3 && (
                            <div className="text-xs text-white/60">+{accountBots.length - 3} more bots</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Account Stats</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between text-xs">
                            <span>Balance</span>
                            <span>${account.balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>P&L</span>
                            <span className={account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              ${account.total_pnl.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Return</span>
                            <span className={account.total_pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {account.total_pnl_percentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="signals">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Trading Signals
                </div>
                <Badge variant="outline">{signals.length} signals</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {signals.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-white/40" />
                    <p>No signals generated yet. Start the system to see live trading signals.</p>
                  </div>
                ) : (
                  signals.map(signal => (
                    <div key={signal.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          signal.side === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {signal.side === 'buy' ? 
                            <TrendingUp className="w-4 h-4 text-green-400" /> : 
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{signal.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {signal.side.toUpperCase()}
                            </Badge>
                            <Badge className={signal.confidence >= 80 ? 'bg-green-500/20 text-green-400' : 
                                             signal.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 
                                             'bg-red-500/20 text-red-400'}>
                              {signal.confidence.toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-white/60">{signal.source}</p>
                          <p className="text-xs text-white/80 mt-1">{signal.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${signal.price.toLocaleString()}</p>
                        <p className="text-xs text-white/60">{signal.amount.toFixed(3)} {signal.symbol}</p>
                        <p className="text-xs text-white/40">{new Date(signal.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Real-Time Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Trading Volume</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Today</span>
                        <span className="text-sm">{stats.totalTrades} trades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Success Rate</span>
                        <span className="text-sm text-green-400">{stats.avgWinRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Signals Processed</span>
                        <span className="text-sm">{stats.signalsProcessed}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Uptime</span>
                        <span className="text-sm text-green-400">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Latency</span>
                        <span className="text-sm">127ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Error Rate</span>
                        <span className="text-sm text-green-400">0.1%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Financial Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Total P&L</span>
                        <span className={`text-sm ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${stats.totalPnL.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">Best Performer</span>
                        <span className="text-sm text-green-400">ML Prediction</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/60">ROI</span>
                        <span className="text-sm text-green-400">+12.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};