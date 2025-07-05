
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, TrendingUp, Star, ExternalLink, Twitter, Youtube, Instagram } from "lucide-react";
import { useState } from "react";

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
  const [followedTraders, setFollowedTraders] = useState<string[]>(
    topTraders.filter(trader => trader.following).map(trader => trader.name)
  );
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Billionaire Traders", "Crypto Influencers", "YouTube Influencers"];

  const filteredTraders = selectedCategory === "All" 
    ? topTraders 
    : topTraders.filter(trader => trader.category === selectedCategory);

  const toggleFollow = (traderName: string) => {
    setFollowedTraders(prev => 
      prev.includes(traderName)
        ? prev.filter(name => name !== traderName)
        : [...prev, traderName]
    );
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Crypto Traders & Influencers
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
