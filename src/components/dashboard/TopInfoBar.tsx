import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Settings, 
  Eye, 
  EyeOff,
  Newspaper,
  Bell,
  Activity,
  Calendar
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment_score: number;
  published_at: string;
  source: string;
  symbols_mentioned: string[];
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
  type: string;
}

export const TopInfoBar = () => {
  const { accounts } = useMultipleAccounts();
  const { stats, isActive } = useRealTimeTradeFollowing();
  
  const [isVisible, setIsVisible] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch news and alerts
  useEffect(() => {
    fetchNewsAndAlerts();
    
    if (autoRefresh) {
      const interval = setInterval(fetchNewsAndAlerts, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchNewsAndAlerts = async () => {
    try {
      // Fetch crypto news
      const { data: news } = await supabase
        .from('crypto_news_feed')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);

      if (news) setNewsItems(news);

      // Fetch alerts/notifications
      const { data: notifications } = await supabase
        .from('account_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifications) {
        const alertsData = notifications.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          severity: notif.severity as 'info' | 'warning' | 'error',
          timestamp: notif.created_at,
          type: notif.notification_type
        }));
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error fetching news and alerts:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-green-400';
    if (score < -0.1) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.1) return TrendingUp;
    if (score < -0.1) return TrendingDown;
    return Activity;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!isVisible) {
    return (
      <div className="h-full bg-background/80 backdrop-blur-sm border-b flex items-center justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show Info Bar
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background/95 backdrop-blur-sm border-b shadow-sm overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                Trading System: {isActive ? 'Active' : 'Inactive'}
              </span>
              {isActive && (
                <Badge variant="outline" className="text-xs">
                  {stats.totalSignals} signals
                </Badge>
              )}
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="py-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-refresh news (5min)</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
          </div>
        )}

        <Tabs defaultValue="news" className="pb-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              Latest News
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts ({alerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {newsItems.slice(0, 3).map((news) => {
                const SentimentIcon = getSentimentIcon(news.sentiment_score || 0);
                return (
                  <Card key={news.id} className="border-white/10 bg-white/5">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {news.source}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <SentimentIcon className={`w-3 h-3 ${getSentimentColor(news.sentiment_score || 0)}`} />
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(news.published_at)}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {news.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {news.summary}
                      </p>
                      {news.symbols_mentioned && news.symbols_mentioned.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {news.symbols_mentioned.slice(0, 3).map((symbol) => (
                            <Badge key={symbol} variant="secondary" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-2">
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center gap-3 p-2 rounded border ${getSeverityColor(alert.severity)}`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-xs opacity-80 truncate">{alert.message}</p>
                  </div>
                  <span className="text-xs opacity-60 flex-shrink-0">
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No alerts at this time</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};