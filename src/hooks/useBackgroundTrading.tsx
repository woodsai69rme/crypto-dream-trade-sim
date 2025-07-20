import { useState, useEffect, useCallback } from 'react';
import { backgroundTradingService, ServiceStatus } from '@/services/backgroundTradingService';
import { useToast } from './use-toast';

export const useBackgroundTrading = () => {
  const [status, setStatus] = useState<ServiceStatus>(backgroundTradingService.getStatus());
  const [isRunning, setIsRunning] = useState(backgroundTradingService.isServiceRunning());
  const { toast } = useToast();

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      setStatus(backgroundTradingService.getStatus());
      setIsRunning(backgroundTradingService.isServiceRunning());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const startTradeFollowing = useCallback(async () => {
    try {
      backgroundTradingService.enableTradeFollowing();
      
      if (!isRunning) {
        await backgroundTradingService.start();
        setIsRunning(true);
      }

      toast({
        title: "Background Trade Following Started",
        description: "Trade following will continue running in the background even when you navigate away",
      });
    } catch (error) {
      console.error('Error starting background trade following:', error);
      toast({
        title: "Error",
        description: "Failed to start background trade following",
        variant: "destructive",
      });
    }
  }, [isRunning, toast]);

  const stopTradeFollowing = useCallback(() => {
    backgroundTradingService.disableTradeFollowing();
    
    toast({
      title: "Background Trade Following Stopped",
      description: "Trade following has been disabled",
    });
  }, [toast]);

  const startAIBots = useCallback(async () => {
    try {
      backgroundTradingService.enableAIBots();
      
      if (!isRunning) {
        await backgroundTradingService.start();
        setIsRunning(true);
      }

      toast({
        title: "Background AI Bots Started",
        description: "AI bots will continue trading in the background even when you navigate away",
      });
    } catch (error) {
      console.error('Error starting background AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to start background AI bots",
        variant: "destructive",
      });
    }
  }, [isRunning, toast]);

  const stopAIBots = useCallback(() => {
    backgroundTradingService.disableAIBots();
    
    toast({
      title: "Background AI Bots Stopped",
      description: "AI bots have been disabled",
    });
  }, [toast]);

  const startAll = useCallback(async () => {
    try {
      backgroundTradingService.enableTradeFollowing();
      backgroundTradingService.enableAIBots();
      
      if (!isRunning) {
        await backgroundTradingService.start();
        setIsRunning(true);
      }

      toast({
        title: "All Background Services Started",
        description: "Trade following and AI bots are now running in the background",
      });
    } catch (error) {
      console.error('Error starting all background services:', error);
      toast({
        title: "Error",
        description: "Failed to start background services",
        variant: "destructive",
      });
    }
  }, [isRunning, toast]);

  const stopAll = useCallback(() => {
    backgroundTradingService.disableTradeFollowing();
    backgroundTradingService.disableAIBots();
    backgroundTradingService.stop();
    setIsRunning(false);
    
    toast({
      title: "All Background Services Stopped",
      description: "All background trading has been disabled",
    });
  }, [toast]);

  return {
    status,
    isRunning,
    startTradeFollowing,
    stopTradeFollowing,
    startAIBots,
    stopAIBots,
    startAll,
    stopAll,
  };
};