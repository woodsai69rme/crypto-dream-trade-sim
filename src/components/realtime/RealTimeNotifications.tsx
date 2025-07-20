
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'trade' | 'price_alert' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  data?: any;
}

export const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Listen for real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'account_notifications'
      }, (payload) => {
        const newNotification: Notification = {
          id: payload.new.id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.notification_type,
          severity: payload.new.severity,
          timestamp: payload.new.created_at,
          data: payload.new.metadata
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        const icon = getNotificationIcon(newNotification.type);
        toast[newNotification.severity](newNotification.title, {
          description: newNotification.message,
          icon,
          action: newNotification.type === 'trade' ? {
            label: 'View',
            onClick: () => console.log('View trade:', newNotification.data)
          } : undefined
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4" />;
      case 'price_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'security': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'success': return 'border-green-500 bg-green-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) markAsRead();
        }}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse bg-red-500">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isExpanded && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50 border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Recent Notifications
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 rounded border ${getSeverityColor(notification.severity)} relative`}
                >
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearNotification(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
