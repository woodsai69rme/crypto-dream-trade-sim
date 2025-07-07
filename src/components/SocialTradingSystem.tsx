import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, TrendingUp, TrendingDown, Star, Settings, 
  Copy, Bell, DollarSign, Target, Shield, Crown,
  Activity, Zap, CheckCircle, Clock, PlayCircle, PauseCircle
} from 'lucide-react';

interface TopTrader {
  id: string;
  name: string;
  avatar?: string;
  return30d: number;
  winRate: number;
  followers: number;
  totalTrades: number;
  riskScore: number;
  strategy: string;
  isFollowing: boolean;
  category: string;
  verified: boolean;
}

interface FollowedTrader {
  id: string;
  trader: TopTrader;
  followedAt: string;
  isActive: boolean;
  copySettings: {
    maxPositionSize: number;
    minConfidence: number;
    stopLoss: number;
    takeProfit: number;
    autoExecute: boolean;
  };
}

interface TradeSignal {
  id: string;
  traderId: string;
  traderName: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
  executed: boolean;
}

export const SocialTradingSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [followedTraders, setFollowedTraders] = useState<FollowedTrader[]>([]);
  const [tradeSignals, setTradeSignals] = useState<TradeSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock data for demonstration
  const mockTopTraders: TopTrader[] = [
    {
      id: '1',
      name: 'CryptoMaster Pro',
      avatar: '',
      return30d: 34.8,
      winRate: 78.2,
      followers: 12500,
      totalTrades: 856,
      riskScore: 6.8,
      strategy: 'Technical Analysis + AI',
      isFollowing: false,
      category: 'Professional',
      verified: true
    },
    {
      id: '2', 
      name: 'DeFi Whale',
      return30d: 28.5,
      winRate: 82.1,
      followers: 8900,
      totalTrades: 534,
      riskScore: 4.2,
      strategy: 'DeFi Yield Farming',
      isFollowing: true,
      category: 'DeFi Specialist',
      verified: true
    },
    {
      id: '3',
      name: 'AI Trading Bot',
      return30d: 22.7,
      winRate: 71.5,
      followers: 15600,
      totalTrades: 2134,
      riskScore: 5.9,
      strategy: 'Machine Learning',
      isFollowing: false,
      category: 'AI/Bot',
      verified: true
    },
    {
      id: '4',
      name: 'Swing Trader Elite',
      return30d: 19.3,
      winRate: 68.9,
      followers: 6700,
      totalTrades: 387,
      riskScore: 7.4,
      strategy: 'Swing Trading',
      isFollowing: false,
      category: 'Swing Trader',
      verified: false
    }
  ];

  const mockTradeSignals: TradeSignal[] = [
    {
      id: '1',
      traderId: '2',
      traderName: 'DeFi Whale',
      symbol: 'ETH',
      side: 'buy',
      price: 4126.89,
      targetPrice: 4500,
      stopLoss: 3900,
      confidence: 87,
      reasoning: 'Strong support at $4100, bullish divergence on RSI, upcoming Ethereum upgrade catalysts',
      timestamp: '2024-01-15T14:30:00Z',
      executed: false
    },
    {
      id: '2',
      traderId: '1',
      traderName: 'CryptoMaster Pro',
      symbol: 'BTC',
      side: 'sell',
      price: 110245.67,
      targetPrice: 105000,
      stopLoss: 112000,
      confidence: 92,
      reasoning: 'Resistance at $110k, overbought conditions, profit-taking expected',
      timestamp: '2024-01-15T13:45:00Z',
      executed: true
    }
  ];

  useEffect(() => {
    setTopTraders(mockTopTraders);
    setTradeSignals(mockTradeSignals);
    
    // Mock followed traders
    setFollowedTraders([
      {
        id: '1',
        trader: mockTopTraders[1], // DeFi Whale
        followedAt: '2024-01-10T10:00:00Z',
        isActive: true,
        copySettings: {
          maxPositionSize: 2500,
          minConfidence: 75,
          stopLoss: 5,
          takeProfit: 15,
          autoExecute: true
        }
      }
    ]);
  }, []);

  const handleFollowTrader = async (trader: TopTrader) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('trader_follows')
        .insert({
          user_id: user.id,
          trader_name: trader.name,
          trader_category: trader.category,
          is_active: true
        });

      if (error) throw error;

      // Update local state
      setTopTraders(prev => 
        prev.map(t => t.id === trader.id ? { ...t, isFollowing: true } : t)
      );

      toast({
        title: "Following Trader",
        description: `Now following ${trader.name}`,
      });
    } catch (error: any) {
      console.error('Error following trader:', error);
      toast({
        title: "Error",
        description: "Failed to follow trader",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowTrader = async (trader: TopTrader) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('trader_follows')
        .delete()
        .eq('user_id', user.id)
        .eq('trader_name', trader.name);

      if (error) throw error;

      // Update local state
      setTopTraders(prev => 
        prev.map(t => t.id === trader.id ? { ...t, isFollowing: false } : t)
      );

      toast({
        title: "Unfollowed Trader",
        description: `Stopped following ${trader.name}`,
      });
    } catch (error: any) {
      console.error('Error unfollowing trader:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow trader",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeTradeSignal = async (signal: TradeSignal) => {
    toast({
      title: "Trade Signal Copied",
      description: `Executing ${signal.side.toUpperCase()} ${signal.symbol} at $${signal.price.toLocaleString()}`,
    });
    
    // Mark signal as executed
    setTradeSignals(prev => 
      prev.map(s => s.id === signal.id ? { ...s, executed: true } : s)
    );
  };

  const filteredTraders = topTraders.filter(trader => {
    const matchesSearch = trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trader.strategy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || trader.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Social Trading Hub
            <Badge className="bg-purple-500/20 text-purple-400">
              <Crown className="w-3 h-3 mr-1" />
              PREMIUM
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Follow top traders, copy their strategies, and build your social trading network.
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 h-auto p-1">
          <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600 p-3">
            <Star className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Discover</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="data-[state=active]:bg-purple-600 p-3">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Following</span>
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-purple-600 p-3">
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Signals</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 p-3">
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search traders or strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-white/10 border-white/20 w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="DeFi Specialist">DeFi Specialist</SelectItem>
                <SelectItem value="AI/Bot">AI/Bot</SelectItem>
                <SelectItem value="Swing Trader">Swing Trader</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTraders.map((trader) => (
              <Card key={trader.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={trader.avatar} />
                          <AvatarFallback className="bg-purple-600">
                            {trader.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{trader.name}</h3>
                            {trader.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <p className="text-sm text-white/60">{trader.category}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={trader.isFollowing ? "outline" : "default"}
                        className={trader.isFollowing ? "border-white/20" : "bg-purple-600 hover:bg-purple-700"}
                        onClick={() => trader.isFollowing ? handleUnfollowTrader(trader) : handleFollowTrader(trader)}
                        disabled={loading}
                      >
                        {trader.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-lg font-bold ${trader.return30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.return30d >= 0 ? '+' : ''}{trader.return30d}%
                        </div>
                        <div className="text-xs text-white/60">30D Return</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{trader.winRate}%</div>
                        <div className="text-xs text-white/60">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">{trader.followers.toLocaleString()}</div>
                        <div className="text-xs text-white/60">Followers</div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Strategy:</span>
                        <span className="text-white">{trader.strategy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Total Trades:</span>
                        <span className="text-white">{trader.totalTrades.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Risk Score:</span>
                        <Badge className={`${
                          trader.riskScore <= 4 ? 'bg-green-500/20 text-green-400' :
                          trader.riskScore <= 7 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {trader.riskScore}/10
                        </Badge>
                      </div>
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
                <p className="text-white/60 mb-4">Start following traders to see their strategies and signals here.</p>
                <Button onClick={() => setActiveTab("discover")} className="bg-purple-600 hover:bg-purple-700">
                  Discover Traders
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {followedTraders.map((followed) => (
                <Card key={followed.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-600">
                            {followed.trader.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{followed.trader.name}</h3>
                          <p className="text-sm text-white/60">
                            Following since {new Date(followed.followedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={followed.isActive}
                          onCheckedChange={() => {
                            // Toggle active state
                            setFollowedTraders(prev =>
                              prev.map(f => f.id === followed.id ? { ...f, isActive: !f.isActive } : f)
                            );
                          }}
                        />
                        {followed.isActive ? (
                          <PlayCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <PauseCircle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <Label className="text-white/60">Max Position</Label>
                        <div className="text-white font-medium">${followed.copySettings.maxPositionSize}</div>
                      </div>
                      <div>
                        <Label className="text-white/60">Min Confidence</Label>
                        <div className="text-white font-medium">{followed.copySettings.minConfidence}%</div>
                      </div>
                      <div>
                        <Label className="text-white/60">Stop Loss</Label>
                        <div className="text-white font-medium">{followed.copySettings.stopLoss}%</div>
                      </div>
                      <div>
                        <Label className="text-white/60">Take Profit</Label>
                        <div className="text-white font-medium">{followed.copySettings.takeProfit}%</div>
                      </div>
                      <div>
                        <Label className="text-white/60">Auto Execute</Label>
                        <div className="text-white font-medium">
                          {followed.copySettings.autoExecute ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="space-y-4">
            {tradeSignals.map((signal) => (
              <Card key={signal.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-600 text-xs">
                            {signal.traderName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-white">{signal.traderName}</h4>
                          <p className="text-xs text-white/60">
                            {new Date(signal.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          signal.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {signal.side.toUpperCase()} {signal.symbol}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {signal.confidence}% Confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-white/60">Entry Price</Label>
                        <div className="text-white font-medium">${signal.price.toLocaleString()}</div>
                      </div>
                      {signal.targetPrice && (
                        <div>
                          <Label className="text-white/60">Target</Label>
                          <div className="text-green-400 font-medium">${signal.targetPrice.toLocaleString()}</div>
                        </div>
                      )}
                      {signal.stopLoss && (
                        <div>
                          <Label className="text-white/60">Stop Loss</Label>
                          <div className="text-red-400 font-medium">${signal.stopLoss.toLocaleString()}</div>
                        </div>
                      )}
                      <div>
                        <Label className="text-white/60">Status</Label>
                        <div className={`font-medium ${signal.executed ? 'text-green-400' : 'text-yellow-400'}`}>
                          {signal.executed ? 'Executed' : 'Pending'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg">
                      <Label className="text-white/60 text-sm">Analysis:</Label>
                      <p className="text-white/80 text-sm mt-1">{signal.reasoning}</p>
                    </div>

                    {!signal.executed && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className={`${
                            signal.side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                          }`}
                          onClick={() => executeTradeSignal(signal)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Trade
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/20">
                          <Clock className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Social Trading Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total Copied Trades</span>
                    <span className="text-white font-medium">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Successful Copies</span>
                    <span className="text-green-400 font-medium">189 (76.5%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Social Trading P&L</span>
                    <span className="text-green-400 font-medium">+$8,247.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Best Performing Trader</span>
                    <span className="text-white font-medium">DeFi Whale</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Following Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Active Follows</span>
                    <span className="text-white font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total Signals Received</span>
                    <span className="text-white font-medium">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Auto-Executed</span>
                    <span className="text-white font-medium">89 (62.7%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Average Confidence</span>
                    <span className="text-white font-medium">82.3%</span>
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