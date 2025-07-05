
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, TrendingUp, Star, ExternalLink, Twitter, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const topTraders = [
  {
    name: "Changpeng Zhao (CZ)",
    title: "CEO of Binance",
    netWorth: "$38B",
    description: "Richest crypto trader, sold apartment in 2014 to invest in Binance",
    performance: "+2,847%",
    followers: 8700000,
    platform: "Twitter",
    icon: Twitter,
    following: false,
    category: "Billionaire Traders"
  },
  {
    name: "Giancarlo Devasini",
    title: "Co-founder & CFO, Tether",
    netWorth: "$9.2B",
    description: "Owns 47% stake in Tether, co-founder of Bitfinex",
    performance: "+1,456%",
    followers: 125000,
    platform: "LinkedIn",
    icon: ExternalLink,
    following: false,
    category: "Billionaire Traders"
  },
  {
    name: "Brian Armstrong",
    title: "CEO of Coinbase",
    netWorth: "$8B",
    description: "Co-founded Coinbase in 2012, owns ~20% of Coinbase tokens",
    performance: "+1,234%",
    followers: 956000,
    platform: "Twitter",
    icon: Twitter,
    following: true,
    category: "Billionaire Traders"
  },
  {
    name: "Michael Saylor",
    title: "Co-founder, MicroStrategy",
    netWorth: "$6B",
    description: "Adopted Bitcoin acquisition strategy for MicroStrategy",
    performance: "+892%",
    followers: 3200000,
    platform: "Twitter",
    icon: Twitter,
    following: true,
    category: "Billionaire Traders"
  },
  {
    name: "Vitalik Buterin",
    title: "Co-founder of Ethereum",
    netWorth: "$1.5B",
    description: "Creator of Ethereum, nearly 4M Twitter followers",
    performance: "+15,678%",
    followers: 4000000,
    platform: "Twitter",
    icon: Twitter,
    following: true,
    category: "Crypto Influencers"
  },
  {
    name: "Elon Musk",
    title: "CEO Tesla, SpaceX",
    netWorth: "$219B",
    description: "Known for Dogecoin support, tweets impact market significantly",
    performance: "+567%",
    followers: 100000000,
    platform: "Twitter",
    icon: Twitter,
    following: false,
    category: "Crypto Influencers"
  },
  {
    name: "Andreas M. Antonopoulos",
    title: "Crypto Educator & Author",
    netWorth: "$50M",
    description: "Author of Mastering Bitcoin, key role in crypto education",
    performance: "+234%",
    followers: 980000,
    platform: "Twitter",
    icon: Twitter,
    following: true,
    category: "Crypto Influencers"
  },
  {
    name: "Jacob Bury",
    title: "YouTube Crypto Analyst",
    netWorth: "$25M",
    description: "No hype, no clickbait crypto analysis on YouTube",
    performance: "+345%",
    followers: 750000,
    platform: "YouTube",
    icon: Youtube,
    following: false,
    category: "YouTube Influencers"
  },
  {
    name: "Benjamin Cowen",
    title: "Data-Driven Analyst",
    netWorth: "$15M",
    description: "Trusted by Reddit community for data-driven analysis",
    performance: "+278%",
    followers: 850000,
    platform: "YouTube",
    icon: Youtube,
    following: true,
    category: "YouTube Influencers"
  },
  {
    name: "BitBoy Crypto",
    title: "Crypto YouTuber",
    netWorth: "$12M",
    description: "Ben Armstrong, crypto enthusiast and founder of BitBoyCrypto.com",
    performance: "+189%",
    followers: 1200000,
    platform: "YouTube",
    icon: Youtube,
    following: false,
    category: "YouTube Influencers"
  }
];

export const TopTraders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followedTraders, setFollowedTraders] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Billionaire Traders", "Crypto Influencers", "YouTube Influencers"];

  // Load followed traders from database
  useEffect(() => {
    if (user) {
      loadFollowedTraders();
    }
  }, [user]);

  const loadFollowedTraders = async () => {
    try {
      // Use type assertion to work with the table until types are regenerated
      const { data, error } = await (supabase as any)
        .from('trader_follows')
        .select('trader_name')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error loading followed traders:', error);
        setFollowedTraders([]);
        return;
      }

      const followed = data?.map((item: any) => item.trader_name) || [];
      setFollowedTraders(followed);
      console.log('Loaded followed traders:', followed);
    } catch (error) {
      console.error('Error loading followed traders:', error);
      setFollowedTraders([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (traderName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow traders",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyFollowing = followedTraders.includes(traderName);
    console.log(`Toggling follow for ${traderName}, currently following: ${isCurrentlyFollowing}`);

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await (supabase as any)
          .from('trader_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('trader_name', traderName);

        if (error) throw error;

        setFollowedTraders(prev => prev.filter(name => name !== traderName));
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${traderName}`,
        });
      } else {
        // Follow
        const { error } = await (supabase as any)
          .from('trader_follows')
          .insert({
            user_id: user.id,
            trader_name: traderName,
            trader_category: topTraders.find(t => t.name === traderName)?.category || 'Other'
          });

        if (error) throw error;

        setFollowedTraders(prev => [...prev, traderName]);
        toast({
          title: "Following",
          description: `You are now following ${traderName}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const filteredTraders = selectedCategory === "All" 
    ? topTraders 
    : topTraders.filter(trader => trader.category === selectedCategory);

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading traders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Crypto Traders & Influencers
          <Badge className="bg-green-500/20 text-green-400">
            {followedTraders.length} Following
          </Badge>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-white/20 text-white/70 hover:bg-white/10"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredTraders.map((trader, index) => {
          const Icon = trader.icon;
          const isFollowing = followedTraders.includes(trader.name);
          
          return (
            <div key={index} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold">
                      {trader.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{trader.name}</h3>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        <Star className="w-3 h-3 mr-1" />
                        {trader.netWorth}
                      </Badge>
                      {isFollowing && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          Following
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-purple-300 mb-2">{trader.title}</p>
                    <p className="text-sm text-white/70 mb-3">{trader.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">{trader.performance}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-white/60">
                        <Icon className="w-4 h-4" />
                        <span>{(trader.followers / 1000000).toFixed(1)}M followers</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => toggleFollow(trader.name)}
                  className={`${
                    isFollowing
                      ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
