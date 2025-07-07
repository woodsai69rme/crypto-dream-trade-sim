import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSocialSentiment } from "@/hooks/useSocialSentiment";
import { TrendingUp, TrendingDown, Minus, Twitter, Youtube, MessageSquare, Newspaper, RefreshCw } from "lucide-react";

export const SocialSentimentMonitor = () => {
  const { sentimentData, summaries, loading, lastUpdate, refreshSentiment, getTrendingSymbols, getBullishSymbols, getBearishSymbols } = useSocialSentiment();

  const getSentimentIcon = (score: number) => {
    if (score > 0.1) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (score < -0.1) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return "bg-green-500/20 text-green-400";
    if (score < -0.1) return "bg-red-500/20 text-red-400";
    return "bg-yellow-500/20 text-yellow-400";
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-3 h-3" />;
      case 'youtube': return <Youtube className="w-3 h-3" />;
      case 'reddit': return <MessageSquare className="w-3 h-3" />;
      case 'news': return <Newspaper className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const trendingSymbols = getTrendingSymbols();
  const bullishSymbols = getBullishSymbols();
  const bearishSymbols = getBearishSymbols();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Social Sentiment Monitor</h2>
          {lastUpdate && (
            <Badge variant="outline" className="text-xs">
              Updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <Button 
          onClick={refreshSentiment} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="bullish">Bullish</TabsTrigger>
          <TabsTrigger value="bearish">Bearish</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaries.slice(0, 8).map((summary) => (
              <Card key={summary.symbol} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{summary.symbol}</h3>
                    {getSentimentIcon(summary.overall_sentiment)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Sentiment Score</span>
                      <Badge className={getSentimentColor(summary.overall_sentiment)}>
                        {summary.overall_sentiment.toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Mentions</span>
                      <span className="text-white/60">{summary.total_mentions.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-white/60 mb-1">Platform Breakdown</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(summary.platforms).map(([platform, score]) => (
                          <div key={platform} className="flex items-center gap-1">
                            {getPlatformIcon(platform)}
                            <span className={score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-yellow-400'}>
                              {score.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Most Mentioned Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingSymbols.slice(0, 10).map((symbol, index) => (
                  <div key={symbol.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{symbol.symbol}</h4>
                        <div className="text-sm text-white/60">{symbol.total_mentions} mentions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(symbol.overall_sentiment)}
                      <Badge className={getSentimentColor(symbol.overall_sentiment)}>
                        {symbol.overall_sentiment.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bullish">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Most Bullish Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bullishSymbols.slice(0, 8).map((symbol) => (
                  <div key={symbol.symbol} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div>
                      <h4 className="font-medium">{symbol.symbol}</h4>
                      <div className="text-sm text-white/60">{symbol.total_mentions} mentions</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      +{symbol.overall_sentiment.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bearish">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Most Bearish Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bearishSymbols.slice(0, 8).map((symbol) => (
                  <div key={symbol.symbol} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                      <h4 className="font-medium">{symbol.symbol}</h4>
                      <div className="text-sm text-white/60">{symbol.total_mentions} mentions</div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">
                      {symbol.overall_sentiment.toFixed(2)}
                    </Badge>
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