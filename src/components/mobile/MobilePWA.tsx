
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Download, Bell, Zap, Wifi, WifiOff } from "lucide-react";

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const MobilePWA = () => {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Check push notification support
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "App Installed",
          description: "Trading app has been installed successfully!",
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Unable to install the app",
        variant: "destructive",
      });
    }
  };

  const enablePushNotifications = async () => {
    if (!pushSupported) return;

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setPushEnabled(true);
        toast({
          title: "Notifications Enabled",
          description: "You'll receive trading alerts and updates",
        });
      } else {
        toast({
          title: "Notifications Denied",
          description: "Enable notifications in browser settings for alerts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Notification Error",
        description: "Unable to enable push notifications",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Trading Alert', {
        body: 'BTC has reached your target price of $50,000',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Smartphone className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">Mobile & PWA Features</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Installation Status */}
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              App Installation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="space-y-2">
                <Badge className="bg-green-500/20 text-green-400">
                  App Installed
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You're running the installed version of the trading app.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Install this app for the best mobile experience with offline support.
                </p>
                <Button 
                  onClick={installPWA}
                  disabled={!deferredPrompt}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge className={isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {isOnline 
                ? 'Real-time market data and trading available'
                : 'Limited functionality in offline mode'
              }
            </p>
            {!isOnline && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400">
                  Offline mode: You can view cached data and prepare trades that will execute when back online.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pushSupported ? (
              <div className="space-y-2">
                <Badge className={pushEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                  {pushEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {!pushEnabled ? (
                  <Button 
                    onClick={enablePushNotifications}
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                ) : (
                  <Button 
                    onClick={sendTestNotification}
                    variant="outline"
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Push notifications are not supported in this browser.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Features */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle>Mobile Optimizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Touch Gestures</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Swipe left/right to navigate charts</li>
                <li>• Pinch to zoom on price charts</li>
                <li>• Pull to refresh market data</li>
                <li>• Long press for context menus</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Offline Capabilities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View cached portfolio data</li>
                <li>• Access trading history</li>
                <li>• Prepare trades for execution</li>
                <li>• Read educational content</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Performance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Optimized for mobile networks</li>
                <li>• Lazy loading of heavy components</li>
                <li>• Service worker caching</li>
                <li>• Background sync support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Native Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share trading results</li>
                <li>• Add to home screen</li>
                <li>• Background notifications</li>
                <li>• Device storage access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
