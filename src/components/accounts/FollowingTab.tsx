import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  UserCheck, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Users, 
  Activity,
  Award,
  Target
} from "lucide-react";

interface TraderProfile {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  totalReturn: number;
  followers: number;
  isFollowing: boolean;
  recentTrades: number;
  badge: string;
}

const mockTraders: TraderProfile[] = [
  {
    id: '1',
    name: 'CryptoMaster_Pro',
    avatar: 'CM',
    winRate: 78.5,
    totalReturn: 234.8,
    followers: 1247,
    isFollowing: true,
    recentTrades: 23,
    badge: 'Elite'
  },
  {
    id: '2',
    name: 'BitcoinWhale',
    avatar: 'BW',
    winRate: 71.2,
    totalReturn: 189.3,
    followers: 893,
    isFollowing: true,
    recentTrades: 18,
    badge: 'Pro'
  },
  {
    id: '3',
    name: 'AltcoinHunter',
    avatar: 'AH',
    winRate: 85.1,
    totalReturn: 412.7,
    followers: 2103,
    isFollowing: false,
    recentTrades: 31,
    badge: 'Master'
  },
];

const TraderCard = ({ trader }: { trader: TraderProfile }) => {
  return (
    <Card className="crypto-card-gradient text-primary-foreground">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-r from-crypto-bitcoin to-crypto-ethereum text-white font-bold">
                {trader.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{trader.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {trader.badge}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {trader.followers}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {trader.recentTrades} trades
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant={trader.isFollowing ? "secondary" : "default"}
            size="sm"
            className={trader.isFollowing ? "bg-crypto-success/20 text-crypto-success" : ""}
          >
            {trader.isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Following
              </>
            ) : (
              'Follow'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-card/20 rounded-lg">
            <div className="text-2xl font-bold text-crypto-success">
              {trader.totalReturn > 0 ? '+' : ''}{trader.totalReturn}%
            </div>
            <div className="text-xs text-muted-foreground">Total Return</div>
          </div>
          
          <div className="text-center p-3 bg-card/20 rounded-lg">
            <div className="text-2xl font-bold">{trader.winRate}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Win Rate Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Success Rate</span>
            <span>{trader.winRate}%</span>
          </div>
          <Progress value={trader.winRate} className="h-2" />
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Signals</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>BTC Long Entry</span>
              <Badge variant="secondary" className="text-xs bg-crypto-success/20 text-crypto-success">
                +5.2%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>ETH Position Exit</span>
              <Badge variant="secondary" className="text-xs bg-crypto-success/20 text-crypto-success">
                +3.1%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>SOL Short Entry</span>
              <Badge variant="secondary" className="text-xs bg-crypto-danger/20 text-crypto-danger">
                -1.8%
              </Badge>
            </div>
          </div>
        </div>

        {/* Copy Trading Stats */}
        {trader.isFollowing && (
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Auto-copy: Enabled</span>
              <span>Position size: 5%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const FollowingTab = () => {
  const followingTraders = mockTraders.filter(trader => trader.isFollowing);
  const suggestedTraders = mockTraders.filter(trader => !trader.isFollowing);

  return (
    <div className="space-y-6">
      {/* Following Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-foreground">Following Traders</h2>
          <Badge variant="secondary">
            {followingTraders.length} Trader{followingTraders.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {followingTraders.length === 0 ? (
          <Card className="crypto-card-gradient text-primary-foreground">
            <CardContent className="text-center py-12">
              <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Not following anyone yet</h3>
              <p className="text-muted-foreground mb-4">
                Start following successful traders to copy their strategies
              </p>
              <Button>Browse Traders</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {followingTraders.map((trader) => (
              <TraderCard key={trader.id} trader={trader} />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Traders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-foreground">Suggested Traders</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {suggestedTraders.slice(0, 3).map((trader) => (
            <TraderCard key={trader.id} trader={trader} />
          ))}
        </div>
      </div>

      {/* Copy Trading Settings */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Copy Trading Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-card/20 rounded-lg">
              <div className="text-2xl font-bold">5%</div>
              <div className="text-sm text-muted-foreground">Max Position Size</div>
            </div>
            <div className="text-center p-4 bg-card/20 rounded-lg">
              <div className="text-2xl font-bold">$500</div>
              <div className="text-sm text-muted-foreground">Daily Copy Limit</div>
            </div>
            <div className="text-center p-4 bg-card/20 rounded-lg">
              <div className="text-2xl font-bold">75%</div>
              <div className="text-sm text-muted-foreground">Min Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};