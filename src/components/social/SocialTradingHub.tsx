
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, TrendingUp, MessageSquare, Heart, Share2, 
  Star, Trophy, Eye, Copy, Bell, Settings,
  ThumbsUp, Award, Crown, Target
} from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  verified: boolean;
  followers: number;
  following: number;
  performance: {
    totalReturn: number;
    winRate: number;
    trades: number;
    sharpeRatio: number;
  };
  recentTrades: Trade[];
  badge: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  pnl: number;
  confidence: number;
}

interface SocialPost {
  id: string;
  trader: Trader;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  trade?: Trade;
  isLiked: boolean;
}

export const SocialTradingHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('feed');
  const [followingTraders, setFollowingTraders] = useState<string[]>([]);

  // Top traders data
  const [topTraders] = useState<Trader[]>([
    {
      id: '1',
      name: 'CryptoKing88',
      avatar: '/api/placeholder/40/40',
      rank: 1,
      verified: true,
      followers: 15420,
      following: 89,
      performance: {
        totalReturn: 387.5,
        winRate: 89.2,
        trades: 1247,
        sharpeRatio: 2.84
      },
      recentTrades: [],
      badge: 'Diamond'
    },
    {
      id: '2',
      name: 'BitcoinBull',
      avatar: '/api/placeholder/40/40',
      rank: 2,
      verified: true,
      followers: 12890,
      following: 156,
      performance: {
        totalReturn: 234.8,
        winRate: 78.9,
        trades: 892,
        sharpeRatio: 2.31
      },
      recentTrades: [],
      badge: 'Gold'
    },
    {
      id: '3',
      name: 'AltcoinAlpha',
      avatar: '/api/placeholder/40/40',
      rank: 3,
      verified: false,
      followers: 8750,
      following: 234,
      performance: {
        totalReturn: 198.3,
        winRate: 82.1,
        trades: 634,
        sharpeRatio: 1.97
      },
      recentTrades: [],
      badge: 'Silver'
    }
  ]);

  // Social feed data
  const [socialFeed] = useState<SocialPost[]>([
    {
      id: '1',
      trader: topTraders[0],
      content: "Just opened a long position on BTC at $98,500. Technical indicators showing strong bullish momentum. RSI oversold and MACD crossing positive. Target: $105,000 🚀",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      likes: 347,
      comments: 89,
      shares: 52,
      isLiked: false,
      trade: {
        id: 'trade1',
        symbol: 'BTC',
        side: 'buy',
        amount: 0.5,
        price: 98500,
        timestamp: new Date(),
        pnl: 0,
        confidence: 85
      }
    },
    {
      id: '2',
      trader: topTraders[1],
      content: "ETH looking strong after the recent consolidation. Breaking out of the triangle pattern with volume. This could be the start of the next leg up to $4,200.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      likes: 234,
      comments: 56,
      shares: 31,
      isLiked: true
    },
    {
      id: '3',
      trader: topTraders[2],
      content: "Portfolio update: Up 23% this month thanks to strategic altcoin positions. DYOR but I'm seeing massive potential in the AI/DeepSeek narrative 🧠",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      likes: 189,
      comments: 43,
      shares: 28,
      isLiked: false
    }
  ]);

  // Leaderboard data
  const leaderboardData = [
    { rank: 1, name: 'CryptoKing88', return: '387.5%', badge: '👑' },
    { rank: 2, name: 'BitcoinBull', return: '234.8%', badge: '🥇' },
    { rank: 3, name: 'AltcoinAlpha', return: '198.3%', badge: '🥈' },
    { rank: 4, name: 'DeFiMaestro', return: '176.2%', badge: '🥉' },
    { rank: 5, name: 'TradingBot2000', return: '154.7%', badge: '🤖' },
    { rank: 6, name: 'MoonLambo', return: '142.3%', badge: '🚀' },
    { rank: 7, name: 'DiamondHands', return: '138.9%', badge: '💎' },
    { rank: 8, name: 'CryptoPro', return: '127.4%', badge: '⭐' }
  ];

  const handleFollow = (traderId: string) => {
    if (followingTraders.includes(traderId)) {
      setFollowingTraders(prev => prev.filter(id => id !== traderId));
      toast({
        title: "Unfollowed",
        description: "You are no longer following this trader",
      });
    } else {
      setFollowingTraders(prev => [...prev, traderId]);
      toast({
        title: "Following",
        description: "You are now following this trader",
      });
    }
  };

  const handleCopyTrade = (trade: Trade) => {
    toast({
      title: "Trade Copied",
      description: `Copied ${trade.side} order for ${trade.amount} ${trade.symbol}`,
    });
  };

  const handleLike = (postId: string) => {
    toast({
      title: "Liked",
      description: "Post liked successfully",
    });
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Diamond': return '💎';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '⭐';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground">Social Trading Hub</h2>
          <p className="text-muted-foreground">Follow top traders and copy their strategies</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400">
            {followingTraders.length} Following
          </Badge>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Traders</p>
                <p className="text-2xl font-bold text-blue-400">12,847</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Copied Trades</p>
                <p className="text-2xl font-bold text-green-400">3,452</p>
              </div>
              <Copy className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Success Rate</p>
                <p className="text-2xl font-bold text-purple-400">78.9%</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Community P&L</p>
                <p className="text-2xl font-bold text-orange-400">+$2.3M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Social Feed</TabsTrigger>
          <TabsTrigger value="traders">Top Traders</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="space-y-4">
            {socialFeed.map((post) => (
              <Card key={post.id} className="crypto-card-gradient text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={post.trader.avatar} />
                      <AvatarFallback>{post.trader.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{post.trader.name}</h4>
                        {post.trader.verified && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5">
                            ✓ Verified
                          </Badge>
                        )}
                        <span className="text-sm text-white/60">
                          #{post.trader.rank} • {getBadgeIcon(post.trader.badge)}
                        </span>
                        <span className="text-sm text-white/40">
                          {post.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-white/90">{post.content}</p>

                      {post.trade && (
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge className={post.trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {post.trade.side.toUpperCase()}
                                </Badge>
                                <span className="font-medium">{post.trade.symbol}</span>
                                <span className="text-white/80">{post.trade.amount} @ ${post.trade.price.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {post.trade.confidence}% confidence
                                </Badge>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCopyTrade(post.trade!)}
                                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Trade
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex items-center gap-4 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleLike(post.id)}
                          className={post.isLiked ? 'text-red-400' : 'text-white/60'}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/60">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/60">
                          <Share2 className="w-4 h-4 mr-1" />
                          {post.shares}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="traders">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topTraders.map((trader) => (
              <Card key={trader.id} className="crypto-card-gradient text-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={trader.avatar} />
                        <AvatarFallback>{trader.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{trader.name}</h3>
                          {trader.verified && (
                            <Badge className="bg-blue-500/20 text-blue-400">✓</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span>#{trader.rank}</span>
                          <span>{getBadgeIcon(trader.badge)} {trader.badge}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                          <span>{trader.followers.toLocaleString()} followers</span>
                          <span>{trader.following} following</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleFollow(trader.id)}
                      className={followingTraders.includes(trader.id) ? 'bg-gray-500/20' : 'bg-blue-500/20 hover:bg-blue-500/30'}
                    >
                      {followingTraders.includes(trader.id) ? 'Following' : 'Follow'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/60">Total Return</p>
                      <p className="text-lg font-bold text-green-400">+{trader.performance.totalReturn}%</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/60">Win Rate</p>
                      <p className="text-lg font-bold text-blue-400">{trader.performance.winRate}%</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/60">Trades</p>
                      <p className="text-lg font-bold text-purple-400">{trader.performance.trades}</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/60">Sharpe Ratio</p>
                      <p className="text-lg font-bold text-orange-400">{trader.performance.sharpeRatio}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Monthly Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.map((trader) => (
                  <div key={trader.rank} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="font-bold">{trader.rank}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{trader.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span>{trader.badge}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">{trader.return}</p>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Follow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Following ({followingTraders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {followingTraders.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">You're not following any traders yet</p>
                  <Button className="mt-4" onClick={() => setActiveTab('traders')}>
                    Discover Traders
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topTraders
                    .filter(trader => followingTraders.includes(trader.id))
                    .map((trader) => (
                      <div key={trader.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={trader.avatar} />
                            <AvatarFallback>{trader.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{trader.name}</h4>
                            <p className="text-sm text-green-400">+{trader.performance.totalReturn}% return</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleFollow(trader.id)}
                          >
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
