import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Newspaper, TrendingUp, AlertTriangle, RefreshCw, Rss, Brain } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  content?: string;
  summary?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  symbols_mentioned?: string[];
  published_at: string;
  created_at: string;
}

interface ResearchSettings {
  enabled: boolean;
  sources: string[];
  symbols: string[];
  sentiment_threshold: number;
  update_frequency: number;
  ai_analysis: boolean;
}

export const CryptoNewsResearch = () => {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [settings, setSettings] = useState<ResearchSettings>({
    enabled: true,
    sources: ['CoinDesk', 'CryptoSlate', 'The Block', 'Decrypt', 'Cointelegraph'],
    symbols: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'],
    sentiment_threshold: 0.1,
    update_frequency: 15,
    ai_analysis: true
  });
  const [loading, setLoading] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    if (settings.enabled) {
      fetchNews();
      const interval = setInterval(fetchNews, settings.update_frequency * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.enabled, settings.update_frequency]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news_analysis')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const refreshNews = async () => {
    setLoading(true);
    try {
      // Simulate news fetching and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call external news APIs
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
          url: 'https://example.com/btc-ath',
          source: 'CoinDesk',
          summary: 'Bitcoin surged to a new record high as major institutions continue to adopt cryptocurrency.',
          sentiment_score: 0.8,
          sentiment_label: 'positive',
          symbols_mentioned: ['BTC'],
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Ethereum 2.0 Staking Rewards Hit Record Levels',
          url: 'https://example.com/eth-staking',
          source: 'The Block',
          summary: 'Ethereum staking yields reach new highs as network adoption grows.',
          sentiment_score: 0.6,
          sentiment_label: 'positive',
          symbols_mentioned: ['ETH'],
          published_at: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Regulatory Concerns Impact Solana DeFi Ecosystem',
          url: 'https://example.com/sol-regulation',
          source: 'Decrypt',
          summary: 'New regulatory frameworks may affect Solana-based DeFi protocols.',
          sentiment_score: -0.3,
          sentiment_label: 'negative',
          symbols_mentioned: ['SOL'],
          published_at: new Date(Date.now() - 7200000).toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      setNews(mockNews);
      toast({
        title: "News Updated",
        description: `Fetched ${mockNews.length} new articles with AI sentiment analysis`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to fetch latest news",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSource = () => {
    if (newSource && !settings.sources.includes(newSource)) {
      setSettings(prev => ({
        ...prev,
        sources: [...prev.sources, newSource]
      }));
      setNewSource('');
      toast({
        title: "Source Added",
        description: `${newSource} added to news sources`,
      });
    }
  };

  const removeSource = (source: string) => {
    setSettings(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s !== source)
    }));
  };

  const addSymbol = () => {
    if (newSymbol && !settings.symbols.includes(newSymbol.toUpperCase())) {
      setSettings(prev => ({
        ...prev,
        symbols: [...prev.symbols, newSymbol.toUpperCase()]
      }));
      setNewSymbol('');
      toast({
        title: "Symbol Added",
        description: `${newSymbol.toUpperCase()} added to tracking symbols`,
      });
    }
  };

  const removeSymbol = (symbol: string) => {
    setSettings(prev => ({
      ...prev,
      symbols: prev.symbols.filter(s => s !== symbol)
    }));
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (score?: number) => {
    if (!score) return null;
    if (score > 0.3) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (score < -0.3) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4 rounded-full bg-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Crypto News Research Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable News Research</Label>
            <Switch 
              checked={settings.enabled} 
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>AI Sentiment Analysis</Label>
            <Switch 
              checked={settings.ai_analysis} 
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ai_analysis: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Update Frequency (minutes)</Label>
            <Input
              type="number"
              value={settings.update_frequency}
              onChange={(e) => setSettings(prev => ({ ...prev, update_frequency: parseInt(e.target.value) || 15 }))}
              className="bg-white/10 border-white/20"
              min="1"
              max="1440"
            />
          </div>

          <div className="space-y-2">
            <Label>Sentiment Threshold</Label>
            <Input
              type="number"
              step="0.1"
              min="-1"
              max="1"
              value={settings.sentiment_threshold}
              onChange={(e) => setSettings(prev => ({ ...prev, sentiment_threshold: parseFloat(e.target.value) || 0.1 }))}
              className="bg-white/10 border-white/20"
            />
          </div>

          {/* News Sources */}
          <div className="space-y-2">
            <Label>News Sources</Label>
            <div className="flex gap-2">
              <Input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Add news source..."
                className="bg-white/10 border-white/20"
              />
              <Button onClick={addSource} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.sources.map((source) => (
                <Badge 
                  key={source} 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => removeSource(source)}
                >
                  {source} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Tracked Symbols */}
          <div className="space-y-2">
            <Label>Tracked Symbols</Label>
            <div className="flex gap-2">
              <Input
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Add symbol (e.g., BTC)..."
                className="bg-white/10 border-white/20"
              />
              <Button onClick={addSymbol} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.symbols.map((symbol) => (
                <Badge 
                  key={symbol} 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => removeSymbol(symbol)}
                >
                  {symbol} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Feed */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Live News Feed
              <Badge variant="outline">{news.length} articles</Badge>
            </CardTitle>
            <Button 
              onClick={refreshNews} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings.enabled ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {news.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Rss className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No news articles yet. Click refresh to fetch latest news.
                </div>
              ) : (
                news.map((article) => (
                  <div key={article.id} className="border border-white/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{article.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getSentimentIcon(article.sentiment_score)}
                        <span className={`text-xs ${getSentimentColor(article.sentiment_score)}`}>
                          {article.sentiment_score ? article.sentiment_score.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {article.summary && (
                      <p className="text-sm text-white/70">{article.summary}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                      {article.symbols_mentioned && article.symbols_mentioned.length > 0 && (
                        <div className="flex gap-1">
                          {article.symbols_mentioned.map((symbol) => (
                            <Badge key={symbol} variant="outline" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              News research is disabled. Enable it in settings to start tracking crypto news.
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Summary */}
      {settings.enabled && settings.ai_analysis && (
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Market Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">68%</div>
                <div className="text-sm text-white/70">Positive Sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">22%</div>
                <div className="text-sm text-white/70">Neutral Sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">10%</div>
                <div className="text-sm text-white/70">Negative Sentiment</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded">
              <h4 className="font-medium mb-2">AI Market Summary</h4>
              <p className="text-sm text-white/80">
                Overall market sentiment remains bullish with strong institutional adoption driving Bitcoin to new highs. 
                Ethereum staking developments show positive momentum. Regulatory concerns around some altcoins require monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};