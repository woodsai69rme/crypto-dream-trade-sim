
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Search, Bot, Workflow, TrendingUp, Star, Download, Eye, Youtube, Twitter } from "lucide-react";

interface ResearchItem {
  id: string;
  name: string;
  description: string;
  type: 'bot' | 'workflow' | 'strategy';
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
  price: number;
  currency: 'USD' | 'free';
  lastUpdated: string;
  sourceUrl?: string;
  socialMentions?: number;
}

export const TradingResearch = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('bots');
  const [results, setResults] = useState<ResearchItem[]>([]);
  const [socialData, setSocialData] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(false);

  const mockData: ResearchItem[] = [
    {
      id: '1',
      name: 'Bitcoin Trend Master Pro',
      description: 'Advanced trend-following bot with machine learning capabilities',
      type: 'bot',
      author: 'CryptoExpert',
      rating: 4.8,
      downloads: 1250,
      tags: ['bitcoin', 'trend', 'ml'],
      price: 49,
      currency: 'USD',
      lastUpdated: '2024-01-01',
      sourceUrl: 'https://github.com/example/bitcoin-trend-master',
      socialMentions: 127
    },
    {
      id: '2',
      name: 'Multi-Exchange Arbitrage',
      description: 'Automated arbitrage trading workflow across multiple exchanges',
      type: 'workflow',
      author: 'ArbitrageKing',
      rating: 4.6,
      downloads: 890,
      tags: ['arbitrage', 'multi-exchange'],
      price: 0,
      currency: 'free',
      lastUpdated: '2023-12-15',
      socialMentions: 89
    },
    {
      id: '3',
      name: 'Mean Reversion Strategy',
      description: 'Statistical mean reversion strategy with risk management',
      type: 'strategy',
      author: 'QuantTrader',
      rating: 4.4,
      downloads: 567,
      tags: ['mean-reversion', 'statistics'],
      price: 25,
      currency: 'USD',
      lastUpdated: '2024-01-10',
      socialMentions: 45
    }
  ];

  const performSearch = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filtered = mockData;
      if (searchTerm) {
        filtered = mockData.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (activeTab !== 'all') {
        filtered = filtered.filter(item => {
          if (activeTab === 'bots') return item.type === 'bot';
          if (activeTab === 'workflows') return item.type === 'workflow';
          if (activeTab === 'strategies') return item.type === 'strategy';
          return true;
        });
      }

      setResults(filtered);
      
      // Simulate social media data fetch
      const socialMockData = {
        youtube: { mentions: 45, sentiment: 'positive', trending: true },
        twitter: { mentions: 128, sentiment: 'neutral', hashtags: ['#crypto', '#trading'] }
      };
      setSocialData(socialMockData);

    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Could not fetch research results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [activeTab]);

  const installItem = (item: ResearchItem) => {
    toast({
      title: "Installation Started",
      description: `Installing ${item.name}...`,
    });

    // Simulate installation
    setTimeout(() => {
      toast({
        title: "Installation Complete",
        description: `${item.name} has been added to your library`,
      });
    }, 2000);
  };

  const viewDetails = (item: ResearchItem) => {
    toast({
      title: "Opening Details",
      description: `Viewing details for ${item.name}`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'workflow': return <Workflow className="w-4 h-4" />;
      case 'strategy': return <TrendingUp className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">Trading Research Hub</h2>
      </div>

      {/* Search Bar */}
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for bots, workflows, or strategies..."
                className="bg-card/20 border-white/20"
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>
            <Button onClick={performSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Monitoring */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-400" />
            Social Media Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Youtube className="w-5 h-5 text-red-400" />
                <span className="font-medium">YouTube Mentions</span>
              </div>
              <div className="text-2xl font-bold">{socialData.youtube?.mentions || 0}</div>
              <div className="text-sm text-white/60">
                Sentiment: {socialData.youtube?.sentiment || 'Unknown'}
                {socialData.youtube?.trending && (
                  <Badge className="ml-2 bg-orange-500/20 text-orange-400">Trending</Badge>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Twitter Mentions</span>
              </div>
              <div className="text-2xl font-bold">{socialData.twitter?.mentions || 0}</div>
              <div className="text-sm text-white/60">
                Top hashtags: {socialData.twitter?.hashtags?.join(', ') || 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="bots">AI Bots</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((item) => (
              <Card key={item.id} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-white/60">by {item.author}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-white/80 mb-3">{item.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                    <span>{item.downloads} downloads</span>
                    <span>Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                  </div>

                  {item.socialMentions && (
                    <div className="text-sm text-white/60 mb-3">
                      <span className="flex items-center gap-1">
                        <Twitter className="w-3 h-3" />
                        {item.socialMentions} social mentions
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.price === 0 ? 'Free' : `$${item.price}`}
                      </span>
                      {item.price === 0 && (
                        <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDetails(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => installItem(item)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Install
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {results.length === 0 && !loading && (
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60">No results found. Try different search terms.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
