
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Pause, Play, Zap } from "lucide-react";

interface CircuitBreakerSettings {
  maxDailyLoss: number;
  maxTradesPerHour: number;
  minTimeBetweenTrades: number; // in minutes
  emergencyStopEnabled: boolean;
  autoResumeAfter: number; // hours
}

interface AccountStatus {
  id: string;
  name: string;
  dailyLoss: number;
  tradesThisHour: number;
  lastTradeTime: Date | null;
  isBlocked: boolean;
  blockReason?: string;
}

export const TradingCircuitBreaker = () => {
  const { accounts } = useMultipleAccounts();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<CircuitBreakerSettings>({
    maxDailyLoss: 5, // 5% max daily loss
    maxTradesPerHour: 10,
    minTimeBetweenTrades: 5, // 5 minutes
    emergencyStopEnabled: true,
    autoResumeAfter: 24 // 24 hours
  });

  const [accountStatuses, setAccountStatuses] = useState<AccountStatus[]>([]);
  const [globalTradingEnabled, setGlobalTradingEnabled] = useState(true);
  const [emergencyStopActive, setEmergencyStopActive] = useState(false);

  useEffect(() => {
    // Initialize account statuses
    const statuses = accounts.map(account => ({
      id: account.id,
      name: account.account_name,
      dailyLoss: Math.abs(account.total_pnl_percentage || 0),
      tradesThisHour: 0, // Would be calculated from recent trades
      lastTradeTime: null,
      isBlocked: false
    }));
    setAccountStatuses(statuses);
  }, [accounts]);

  const checkCircuitBreakers = () => {
    const updatedStatuses = accountStatuses.map(status => {
      let isBlocked = false;
      let blockReason = '';

      // Check daily loss limit
      if (status.dailyLoss > settings.maxDailyLoss) {
        isBlocked = true;
        blockReason = `Daily loss limit exceeded (${status.dailyLoss.toFixed(1)}% > ${settings.maxDailyLoss}%)`;
      }

      // Check trades per hour limit
      if (status.tradesThisHour > settings.maxTradesPerHour) {
        isBlocked = true;
        blockReason = `Hourly trade limit exceeded (${status.tradesThisHour} > ${settings.maxTradesPerHour})`;
      }

      return { ...status, isBlocked, blockReason };
    });

    setAccountStatuses(updatedStatuses);

    // Check if emergency stop should be triggered
    const criticalAccounts = updatedStatuses.filter(s => s.dailyLoss > settings.maxDailyLoss * 1.5);
    if (criticalAccounts.length > 0 && settings.emergencyStopEnabled && !emergencyStopActive) {
      triggerEmergencyStop();
    }
  };

  const triggerEmergencyStop = () => {
    setEmergencyStopActive(true);
    setGlobalTradingEnabled(false);
    
    toast({
      title: "🚨 EMERGENCY STOP ACTIVATED",
      description: "All trading has been halted due to excessive losses",
      variant: "destructive",
    });

    // Auto-resume after specified time
    setTimeout(() => {
      if (emergencyStopActive) {
        setEmergencyStopActive(false);
        setGlobalTradingEnabled(true);
        toast({
          title: "Trading Resumed",
          description: "Emergency stop has been automatically lifted",
        });
      }
    }, settings.autoResumeAfter * 60 * 60 * 1000);
  };

  const manualEmergencyStop = () => {
    setEmergencyStopActive(true);
    setGlobalTradingEnabled(false);
    
    toast({
      title: "Manual Emergency Stop",
      description: "All trading activities have been manually halted",
      variant: "destructive",
    });
  };

  const resumeTrading = () => {
    setEmergencyStopActive(false);
    setGlobalTradingEnabled(true);
    
    toast({
      title: "Trading Resumed",
      description: "Normal trading operations have resumed",
    });
  };

  useEffect(() => {
    const interval = setInterval(checkCircuitBreakers, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [accountStatuses, settings]);

  const blockedAccounts = accountStatuses.filter(s => s.isBlocked).length;
  const totalLoss = accountStatuses.reduce((sum, s) => sum + s.dailyLoss, 0) / accountStatuses.length;

  return (
    <div className="space-y-6">
      {/* Circuit Breaker Status */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Trading Circuit Breaker
            <Badge className={`ml-auto ${globalTradingEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {globalTradingEnabled ? 'Active' : 'STOPPED'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm text-white/60">System Status</div>
              <div className={`font-bold ${globalTradingEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {globalTradingEnabled ? 'Trading Enabled' : 'Trading Halted'}
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm text-white/60">Blocked Accounts</div>
              <div className={`font-bold ${blockedAccounts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {blockedAccounts} / {accountStatuses.length}
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm text-white/60">Avg Daily Loss</div>
              <div className={`font-bold ${totalLoss > 5 ? 'text-red-400' : totalLoss > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                {totalLoss.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!emergencyStopActive ? (
              <Button
                onClick={manualEmergencyStop}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Emergency Stop
              </Button>
            ) : (
              <Button
                onClick={resumeTrading}
                variant="outline"
                className="flex items-center gap-2 bg-green-500/20 border-green-500/30 text-green-400"
              >
                <Play className="w-4 h-4" />
                Resume Trading
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Circuit Breaker Settings */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Protection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Max Daily Loss (%)</label>
              <input
                type="number"
                value={settings.maxDailyLoss}
                onChange={(e) => setSettings(prev => ({ ...prev, maxDailyLoss: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                min="1"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Max Trades Per Hour</label>
              <input
                type="number"
                value={settings.maxTradesPerHour}
                onChange={(e) => setSettings(prev => ({ ...prev, maxTradesPerHour: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Min Time Between Trades (min)</label>
              <input
                type="number"
                value={settings.minTimeBetweenTrades}
                onChange={(e) => setSettings(prev => ({ ...prev, minTimeBetweenTrades: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                min="1"
                max="60"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80">Emergency Stop Auto-Trigger</span>
              <Switch 
                checked={settings.emergencyStopEnabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, emergencyStopEnabled: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Account Protection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accountStatuses.map((account) => (
              <div key={account.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{account.name}</h4>
                  <Badge className={account.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                    {account.isBlocked ? 'BLOCKED' : 'Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Daily Loss:</span>
                    <div className={`font-medium ${account.dailyLoss > settings.maxDailyLoss ? 'text-red-400' : 'text-white'}`}>
                      {account.dailyLoss.toFixed(1)}%
                    </div>
                    <Progress 
                      value={(account.dailyLoss / settings.maxDailyLoss) * 100} 
                      className="h-1 mt-1"
                    />
                  </div>
                  
                  <div>
                    <span className="text-white/60">Trades This Hour:</span>
                    <div className={`font-medium ${account.tradesThisHour > settings.maxTradesPerHour ? 'text-red-400' : 'text-white'}`}>
                      {account.tradesThisHour} / {settings.maxTradesPerHour}
                    </div>
                  </div>
                </div>

                {account.isBlocked && account.blockReason && (
                  <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {account.blockReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
