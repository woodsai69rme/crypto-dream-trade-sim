import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, TrendingUp, TrendingDown, Star, Copy, Crown,
  Activity, Target, Shield, Zap, AlertTriangle, Play,
  Pause, Settings, DollarSign, Trophy, CheckCircle
} from 'lucide-react';

interface SocialTrader {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verified: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  followers: number;
  following: number;
  performance: {
    return30d: number;
    return90d: number;
    return1y: number;
    winRate: number;
    totalTrades: number;
    avgHoldTime: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  strategy: {
    name: string;
    type: string;
    riskLevel: 'low' | 'medium' | 'high';
    tradingStyle: string;
  };
  copySettings: {
    minCopyAmount: number;
    maxCopyAmount: number;
    commission: number;
    available: boolean;
  };
  recentTrades: Array<{
    symbol: string;
    side: 'buy' | 'sell';
    profit: number;
    timestamp: string;
  }>;
  isFollowing: boolean;
  isCopying: boolean;
}

interface CopyTradingSettings {
  allocatedAmount: number;
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  copyOnlyProfitable: boolean;
  minConfidence: number;
  autoRebalance: boolean;
  riskMultiplier: number;
}

interface LeaderboardFilter {
  timeframe: '7d' | '30d' | '90d' | '1y';
  category: 'all' | 'crypto' | 'forex' | 'stocks';
  riskLevel: 'all' | 'low' | 'medium' | 'high';
  minTrades: number;
}

export const EnhancedSocialTradingSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topTraders, setTopTraders] = useState<SocialTrader[]>([]);
  const [followedTraders, setFollowedTraders] = useState<SocialTrader[]>([]);
  const [copyTraders, setCopyTraders] = useState<SocialTrader[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<LeaderboardFilter>({
    timeframe: '30d',
    category: 'crypto',
    riskLevel: 'all',
    minTrades: 10
  });
  const [copySettings, setCopySettings] = useState<CopyTradingSettings>({
    allocatedAmount: 5000,
    maxPositionSize: 1000,
    stopLoss: 5,
    takeProfit: 15,
    copyOnlyProfitable: true,
    minConfidence: 75,
    autoRebalance: true,
    riskMultiplier: 1.0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState<SocialTrader | null>(null);

  useEffect(() => {
    loadSocialTraders();
    loadFollowedTraders();
  }, [leaderboardFilter]);

  const loadSocialTraders = async () => {
    setLoading(true);
    try {
      // Simulate loading social traders
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTraders: SocialTrader[] = [
        {
          id: '1',
          name: 'Alex CryptoKing',
          username: '@cryptoking_pro',
          verified: true,
          tier: 'diamond',
          followers: 15420,
          following: 89,
          performance: {
            return30d: 28.5,
            return90d: 67.8,
            return1y: 234.7,
            winRate: 78.2,
            totalTrades: 156,
            avgHoldTime: 4.2,
            maxDrawdown: -12.3,
            sharpeRatio: 2.15
          },
          strategy: {
            name: 'Technical Analysis Pro',
            type: 'Technical',
            riskLevel: 'medium',
            tradingStyle: 'Swing Trading'
          },
          copySettings: {
            minCopyAmount: 100,
            maxCopyAmount: 50000,
            commission: 2.5,
            available: true
          },
          recentTrades: [
            { symbol: 'BTC', side: 'buy', profit: 3.2, timestamp: '2024-01-15T10:30:00Z' },
            { symbol: 'ETH', side: 'sell', profit: 5.7, timestamp: '2024-01-15T09:15:00Z' },
            { symbol: 'SOL', side: 'buy', profit: -1.2, timestamp: '2024-01-14T16:45:00Z' }
          ],
          isFollowing: false,
          isCopying: false
        },
        {
          id: '2',
          name: 'Sarah DeFi Master',
          username: '@defi_sarah',
          verified: true,
          tier: 'platinum',
          followers: 8934,
          following: 124,
          performance: {
            return30d: 22.1,
            return90d: 45.6,
            return1y: 189.3,
            winRate: 65.8,
            totalTrades: 234,
            avgHoldTime: 2.8,
            maxDrawdown: -8.7,
            sharpeRatio: 1.87
          },
          strategy: {
            name: 'DeFi Yield Farming',
            type: 'DeFi',
            riskLevel: 'low',
            tradingStyle: 'Yield Farming'
          },
          copySettings: {
            minCopyAmount: 250,
            maxCopyAmount: 25000,
            commission: 3.0,
            available: true
          },
          recentTrades: [
            { symbol: 'AAVE', side: 'buy', profit: 4.1, timestamp: '2024-01-15T11:20:00Z' },
            { symbol: 'UNI', side: 'sell', profit: 2.9, timestamp: '2024-01-15T08:30:00Z' }
          ],
          isFollowing: true,
          isCopying: false
        },
        {
          id: '3',
          name: 'Mike AI Trader',
          username: '@ai_mike_trades',
          verified: true,
          tier: 'gold',
          followers: 5672,
          following: 67,
          performance: {
            return30d: 31.7,
            return90d: 89.2,
            return1y: 156.4,
            winRate: 82.4,
            totalTrades: 89,
            avgHoldTime: 6.1,
            maxDrawdown: -15.8,
            sharpeRatio: 1.94
          },
          strategy: {
            name: 'AI-Powered Momentum',
            type: 'AI/ML',
            riskLevel: 'high',
            tradingStyle: 'Algorithmic'
          },
          copySettings: {
            minCopyAmount: 500,
            maxCopyAmount: 100000,
            commission: 4.0,
            available: true
          },
          recentTrades: [
            { symbol: 'BTC', side: 'sell', profit: 8.3, timestamp: '2024-01-15T12:00:00Z' },
            { symbol: 'ETH', side: 'buy', profit: 12.1, timestamp: '2024-01-14T20:15:00Z' }
          ],
          isFollowing: false,
          isCopying: true
        }
      ];
      
      setTopTraders(mockTraders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load social traders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFollowedTraders = () => {
    const followed = topTraders.filter(trader => trader.isFollowing);
    setFollowedTraders(followed);
    
    const copying = topTraders.filter(trader => trader.isCopying);
    setCopyTraders(copying);
  };

  const followTrader = async (traderId: string) => {
    try {
      setTopTraders(prev => prev.map(trader => 
        trader.id === traderId ? { ...trader, isFollowing: true, followers: trader.followers + 1 } : trader
      ));
      
      const trader = topTraders.find(t => t.id === traderId);
      toast({
        title: "Following Trader",
        description: `Now following ${trader?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow trader",
        variant: "destructive",
      });
    }
  };

  const unfollowTrader = async (traderId: string) => {
    try {
      setTopTraders(prev => prev.map(trader => 
        trader.id === traderId ? { ...trader, isFollowing: false, followers: trader.followers - 1 } : trader
      ));
      
      const trader = topTraders.find(t => t.id === traderId);
      toast({
        title: "Unfollowed Trader",
        description: `Stopped following ${trader?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow trader",
        variant: "destructive",
      });
    }
  };

  const startCopyTrading = async (traderId: string) => {
    try {
      setTopTraders(prev => prev.map(trader => 
        trader.id === traderId ? { ...trader, isCopying: true } : trader
      ));
      
      const trader = topTraders.find(t => t.id === traderId);
      toast({
        title: "Copy Trading Started",
        description: `Now copying trades from ${trader?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start copy trading",
        variant: "destructive",
      });
    }
  };

  const stopCopyTrading = async (traderId: string) => {
    try {
      setTopTraders(prev => prev.map(trader => 
        trader.id === traderId ? { ...trader, isCopying: false } : trader
      ));
      
      const trader = topTraders.find(t => t.id === traderId);
      toast({
        title: "Copy Trading Stopped",
        description: `Stopped copying trades from ${trader?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop copy trading",
        variant: "destructive",
      });
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'diamond': return <Crown className="w-4 h-4 text-blue-400" />;
      case 'platinum': return <Star className="w-4 h-4 text-gray-300" />;
      case 'gold': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'silver': return <Shield className="w-4 h-4 text-gray-400" />;
      default: return <Target className="w-4 h-4 text-orange-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-blue-500/20 text-blue-400';
      case 'platinum': return 'bg-gray-300/20 text-gray-300';
      case 'gold': return 'bg-yellow-500/20 text-yellow-400';
      case 'silver': return 'bg-gray-400/20 text-gray-400';
      default: return 'bg-orange-500/20 text-orange-400';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enhanced Social Trading
            <Badge className="bg-purple-500/20 text-purple-400">
              <Crown className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Follow top crypto traders, copy their strategies automatically, and build your social trading network.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="following">Following ({followedTraders.length})</TabsTrigger>
          <TabsTrigger value="copying">Copy Trading ({copyTraders.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {/* Filters */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-white/60">Timeframe</label>
                  <select 
                    value={leaderboardFilter.timeframe}
                    onChange={(e) => setLeaderboardFilter(prev => ({ ...prev, timeframe: e.target.value as any }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                    <option value="1y">1 Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Risk Level</label>
                  <select 
                    value={leaderboardFilter.riskLevel}
                    onChange={(e) => setLeaderboardFilter(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Min Trades</label>
                  <Input
                    type="number"
                    value={leaderboardFilter.minTrades}
                    onChange={(e) => setLeaderboardFilter(prev => ({ ...prev, minTrades: parseInt(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={loadSocialTraders} className="w-full bg-purple-600 hover:bg-purple-700">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Traders */}
          <div className="space-y-4">
            {topTraders.map((trader) => (
              <Card key={trader.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={trader.avatar} />
                            <AvatarFallback className="bg-purple-600 text-lg">
                              {trader.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {trader.verified && (
                            <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-400 bg-gray-900 rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{trader.name}</h3>
                            <Badge className={getTierColor(trader.tier)}>
                              {getTierIcon(trader.tier)}
                              {trader.tier.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/60">{trader.username}</p>
                          <p className="text-sm text-purple-300">{trader.strategy.name}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>{trader.followers.toLocaleString()} followers</span>
                            <span>•</span>
                            <span className={getRiskColor(trader.strategy.riskLevel)}>
                              {trader.strategy.riskLevel} risk
                            </span>
                            <span>•</span>
                            <span>{trader.strategy.tradingStyle}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${trader.performance.return30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.performance.return30d >= 0 ? '+' : ''}{trader.performance.return30d}%
                        </div>
                        <div className="text-sm text-white/60">30d return</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-400">{trader.performance.winRate}%</div>
                        <div className="text-xs text-white/60">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{trader.performance.totalTrades}</div>
                        <div className="text-xs text-white/60">Total Trades</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{trader.performance.avgHoldTime}d</div>
                        <div className="text-xs text-white/60">Avg Hold</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">{trader.performance.maxDrawdown}%</div>
                        <div className="text-xs text-white/60">Max DD</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">{trader.performance.sharpeRatio}</div>
                        <div className="text-xs text-white/60">Sharpe</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Recent Trades</h4>
                      <div className="flex gap-2 overflow-x-auto">
                        {trader.recentTrades.map((trade, index) => (
                          <div key={index} className="flex-shrink-0 p-2 bg-white/5 rounded text-sm">
                            <div className="flex items-center gap-1">
                              <span>{trade.symbol}</span>
                              <span className={`font-medium ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.side.toUpperCase()}
                              </span>
                            </div>
                            <div className={`font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.profit >= 0 ? '+' : ''}{trade.profit}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={trader.isFollowing ? "outline" : "default"}
                        onClick={() => trader.isFollowing ? unfollowTrader(trader.id) : followTrader(trader.id)}
                        className={trader.isFollowing ? "border-white/20" : "bg-blue-600 hover:bg-blue-700"}
                      >
                        {trader.isFollowing ? "Following" : "Follow"}
                      </Button>
                      
                      {trader.copySettings.available && (
                        <Button
                          size="sm"
                          variant={trader.isCopying ? "outline" : "default"}
                          onClick={() => trader.isCopying ? stopCopyTrading(trader.id) : startCopyTrading(trader.id)}
                          className={trader.isCopying ? "border-green-500/30 text-green-400" : "bg-purple-600 hover:bg-purple-700"}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {trader.isCopying ? "Copying" : `Copy (${trader.copySettings.commission}%)`}
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline" onClick={() => setSelectedTrader(trader)}>
                        <Activity className="w-3 h-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          {followedTraders.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-white/40 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Traders Followed</h3>
                <p className="text-white/60 mb-4">Start following top traders to see their strategies and signals here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {followedTraders.map((trader) => (
                <Card key={trader.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-600">
                            {trader.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{trader.name}</h3>
                          <p className="text-sm text-white/60">{trader.strategy.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-bold ${trader.performance.return30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trader.performance.return30d >= 0 ? '+' : ''}{trader.performance.return30d}%
                          </div>
                          <div className="text-xs text-white/60">30d return</div>
                        </div>
                        
                        <Button size="sm" variant="outline" onClick={() => unfollowTrader(trader.id)}>
                          Unfollow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="copying" className="space-y-4">
          {/* Copy Trading Settings */}
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Copy Trading Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-white/60">Allocated Amount ($)</label>
                  <Input
                    type="number"
                    value={copySettings.allocatedAmount}
                    onChange={(e) => setCopySettings(prev => ({ ...prev, allocatedAmount: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Max Position Size ($)</label>
                  <Input
                    type="number"
                    value={copySettings.maxPositionSize}
                    onChange={(e) => setCopySettings(prev => ({ ...prev, maxPositionSize: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Stop Loss (%)</label>
                  <Input
                    type="number"
                    value={copySettings.stopLoss}
                    onChange={(e) => setCopySettings(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Take Profit (%)</label>
                  <Input
                    type="number"
                    value={copySettings.takeProfit}
                    onChange={(e) => setCopySettings(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span>Copy Only Profitable Traders</span>
                  <Switch
                    checked={copySettings.copyOnlyProfitable}
                    onCheckedChange={(checked) => setCopySettings(prev => ({ ...prev, copyOnlyProfitable: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Auto Rebalance</span>
                  <Switch
                    checked={copySettings.autoRebalance}
                    onCheckedChange={(checked) => setCopySettings(prev => ({ ...prev, autoRebalance: checked }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-white/60">Risk Multiplier</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="3.0"
                    value={copySettings.riskMultiplier}
                    onChange={(e) => setCopySettings(prev => ({ ...prev, riskMultiplier: parseFloat(e.target.value) || 1.0 }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Copy Traders */}
          {copyTraders.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <Copy className="w-12 h-12 mx-auto text-white/40 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Copy Trading Active</h3>
                <p className="text-white/60 mb-4">Start copying top traders to automatically mirror their trades.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {copyTraders.map((trader) => (
                <Card key={trader.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-600">
                            {trader.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{trader.name}</h3>
                          <p className="text-sm text-white/60">Commission: {trader.copySettings.commission}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">
                          <Play className="w-3 h-3 mr-1" />
                          COPYING
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => stopCopyTrading(trader.id)}>
                          <Pause className="w-3 h-3 mr-1" />
                          Stop
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-400">+$1,234</div>
                        <div className="text-xs text-white/60">Your P&L</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">12</div>
                        <div className="text-xs text-white/60">Copied Trades</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">75%</div>
                        <div className="text-xs text-white/60">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTraders.map((trader, index) => (
                  <div key={trader.id} className="flex items-center gap-4 p-3 bg-white/5 rounded">
                    <div className="text-2xl font-bold text-purple-400">#{index + 1}</div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-600">
                        {trader.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{trader.name}</h3>
                        {getTierIcon(trader.tier)}
                      </div>
                      <p className="text-sm text-white/60">{trader.strategy.name}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${trader.performance.return30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trader.performance.return30d >= 0 ? '+' : ''}{trader.performance.return30d}%
                      </div>
                      <div className="text-xs text-white/60">{trader.performance.totalTrades} trades</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};