import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });

  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support push notifications",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      const newPermission = {
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default'
      };
      
      setPermission(newPermission);

      if (result === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll receive important trading alerts"
        });
        return true;
      } else {
        toast({
          title: "Notifications disabled",
          description: "You won't receive trading alerts",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.granted) return;

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendTradeAlert = (symbol: string, side: 'buy' | 'sell', amount: number, price: number) => {
    sendNotification('Trade Executed', {
      body: `${side.toUpperCase()} ${amount} ${symbol} at $${price.toLocaleString()}`,
      tag: 'trade-alert',
      requireInteraction: false
    });
  };

  const sendPriceAlert = (symbol: string, price: number, direction: 'above' | 'below', targetPrice: number) => {
    sendNotification('Price Alert', {
      body: `${symbol} is now ${direction} $${targetPrice.toLocaleString()} (current: $${price.toLocaleString()})`,
      tag: 'price-alert',
      requireInteraction: true
    });
  };

  const sendPortfolioAlert = (message: string) => {
    sendNotification('Portfolio Update', {
      body: message,
      tag: 'portfolio-alert',
      requireInteraction: false
    });
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    sendTradeAlert,
    sendPriceAlert,
    sendPortfolioAlert,
    isSupported: 'Notification' in window
  };
};