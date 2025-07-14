
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export const OptimizedTopInfoBar = () => {
  const { accounts } = useMultipleAccounts();
  const { stats, isActive } = useRealTimeTradeFollowing();
  
  const [isVisible, setIsVisible] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Memoized calculations
  const systemStats = useMemo(() => ({
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'active').length,
    totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
    totalPnL: accounts.reduce((sum, acc) => sum + acc.total_pnl, 0)
  }), [accounts]);

  // Debounced fetch function
  const fetchNewsAndAlerts = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetch < 30000) return; // Prevent frequent calls
    
    try {
      // Batch fetch with minimal data
      const [newsResponse, alertsResponse] = await Promise.all([
        supabase
          .from('news_analysis')
          .select('id, title, summary, sentiment_score, published_at, source, symbols_mentioned')
          .order('published_at', { ascending: false })
          .limit(3), // Reduced from 5
        supabase
          .from('account_notifications')
          .select('id, title, message, severity, created_at, notification_type')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5) // Reduced from 10
      ]);

      if (newsResponse.data) {
        setNewsItems(newsResponse.data);
      }

      if (alertsResponse.data) {
        const alertsData = alertsResponse.data.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          severity: notif.severity as 'info' | 'warning' | 'error',
          timestamp: notif.created_at,
          type: notif.notification_type
        }));
        setAlerts(alertsData);
      }
      
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching news and alerts:', error);
    }
  }, [lastFetch]);

  // Optimized effect with proper cleanup
  useEffect(() => {
    if (!autoRefresh) return;
    
    fetchNewsAndAlerts();
    const interval = setInterval(fetchNewsAndAlerts, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [autoRefresh, fetchNewsAndAlerts]);

  // Memoized utility functions
  const formatTimeAgo = useCallback((timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  const getSentimentColor = useCallback((score: number) => {
    if (score > 0.1) return 'text-green-400';
    if (score < -0.1) return 'text-red-400';
    return 'text-yellow-400';
  }, []);

  const getSentimentIcon = useCallback((score: number) => {
    if (score > 0.1) return TrendingUp;
    if (score < -0.1) return TrendingDown;
    return Activity;
  }, []);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  }, []);

  // Memoized news items to prevent unnecessary re-renders
  const renderedNewsItems = useMemo(() => 
    newsItems.slice(0, 3).map((news) => {
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
    }), [newsItems, getSentimentIcon, getSentimentColor, formatTimeAgo]);

  // Memoized alerts to prevent unnecessary re-renders
  const renderedAlerts = useMemo(() => 
    alerts.slice(0, 5).map((alert) => (
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
    )), [alerts, getSeverityColor, formatTimeAgo]);

  if (!isVisible) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex justify-between items-center p-2">
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
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
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
              {renderedNewsItems}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-2">
            <div className="space-y-2">
              {renderedAlerts}
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
