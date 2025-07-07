
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TOP_TRADERS, TRADER_CATEGORIES, TopTrader } from '@/data/topTraders';
import { Users, Star, TrendingUp, Shield, Search, Filter } from 'lucide-react';

export const ComprehensiveTopTraders = () => {
  const [traders, setTraders] = useState<TopTrader[]>(TOP_TRADERS);
  const [filteredTraders, setFilteredTraders] = useState<TopTrader[]>(TOP_TRADERS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("roi_ytd");
  const [followingTraders, setFollowingTraders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    let filtered = traders;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(trader => trader.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(trader => 
        trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trader.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "roi_ytd":
          return b.roi_ytd - a.roi_ytd;
        case "win_rate":
          return b.win_rate - a.win_rate;
        case "followers":
          return b.followers - a.followers;
        case "avg_monthly_return":
          return b.avg_monthly_return - a.avg_monthly_return;
        default:
          return 0;
      }
    });

    setFilteredTraders(filtered);
  }, [traders, selectedCategory, searchTerm, sortBy]);

  const handleFollowTrader = async (trader: TopTrader) => {
    try {
      const newFollowing = new Set(followingTraders);
      if (followingTraders.has(trader.id)) {
        newFollowing.delete(trader.id);
        toast({
          title: "Unfollowed Trader",
          description: `You are no longer following ${trader.name}`,
        });
      } else {
        newFollowing.add(trader.id);
        toast({
          title: "Following Trader",
          description: `You are now following ${trader.name}`,
        });
      }
      setFollowingTraders(newFollowing);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update following status",
        variant: "destructive",
      });
    }
  };

  const handleFollowAll = async () => {
    try {
      const allTraderIds = new Set(filteredTraders.map(t => t.id));
      setFollowingTraders(allTraderIds);
      toast({
        title: "Following All Traders",
        description: `Now following ${filteredTraders.length} top traders`,
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to follow all traders",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Top 20 Crypto Traders
            <Badge className="bg-green-500/20 text-green-400">
              {followingTraders.size} Following
            </Badge>
          </CardTitle>
          <Button onClick={handleFollowAll} className="bg-blue-600 hover:bg-blue-700">
            <Star className="w-4 h-4 mr-2" />
            Follow All Top 20
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-white/10 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRADER_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/10 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roi_ytd">ROI (YTD)</SelectItem>
              <SelectItem value="win_rate">Win Rate</SelectItem>
              <SelectItem value="followers">Followers</SelectItem>
              <SelectItem value="avg_monthly_return">Monthly Return</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Filter className="w-4 h-4" />
            {filteredTraders.length} of {traders.length} traders
          </div>
        </div>

        {/* Traders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTraders.map((trader, index) => (
            <Card key={trader.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{trader.name}</h3>
                        {trader.verified && (
                          <Shield className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-white/60">{trader.category}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleFollowTrader(trader)}
                    variant={followingTraders.has(trader.id) ? "default" : "outline"}
                    size="sm"
                    className={followingTraders.has(trader.id) ? 
                      "bg-green-600 hover:bg-green-700" : 
                      "border-white/20 hover:bg-white/10"
                    }
                  >
                    {followingTraders.has(trader.id) ? "Following" : "Follow"}
                  </Button>
                </div>

                <p className="text-sm text-white/80 mb-3">{trader.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/5 p-2 rounded">
                    <div className="text-xs text-white/60">ROI (YTD)</div>
                    <div className="text-green-400 font-semibold">+{trader.roi_ytd}%</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <div className="text-xs text-white/60">Win Rate</div>
                    <div className="text-blue-400 font-semibold">{trader.win_rate}%</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <div className="text-xs text-white/60">Monthly Avg</div>
                    <div className="text-purple-400 font-semibold">+{trader.avg_monthly_return}%</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <div className="text-xs text-white/60">Followers</div>
                    <div className="text-orange-400 font-semibold">
                      {trader.followers > 1000000 ? 
                        `${(trader.followers / 1000000).toFixed(1)}M` : 
                        `${(trader.followers / 1000).toFixed(0)}K`
                      }
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {trader.strategies.slice(0, 2).map((strategy) => (
                    <Badge key={strategy} variant="outline" className="text-xs border-white/20">
                      {strategy}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Min Copy: ${trader.min_copy_amount}</span>
                  <span>Risk: {trader.risk_score}/10</span>
                  <span>{trader.total_trades} trades</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTraders.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No traders found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
