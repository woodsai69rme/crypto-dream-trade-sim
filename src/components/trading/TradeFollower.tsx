
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRealTimePortfolio } from '@/hooks/useRealTimePortfolio';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { TradeSignalCard, TradeSignal } from './TradeSignal';
import { ActiveAccountDisplay } from './ActiveAccountDisplay';
import { Users, Activity, Settings, AlertCircle } from 'lucide-react';

export const TradeFollower = () => {
  const { trades } = useRealTimePortfolio();
  const {
    signals,
    isActive,
    stats,
    startFollowing,
    stopFollowing,
    getAccountStats,
    activeAccounts,
    totalAccounts
  } = useRealTimeTradeFollowing();

  const accountStats = getAccountStats();

  const handleFollowTrade = async (signal: TradeSignal) => {
    console.log('Manual trade execution from TradeFollower:', signal);
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Advanced Trade Following System
          <Badge className={`ml-auto ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {isActive ? `${activeAccounts}/${totalAccounts} Active` : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium">Multi-Account Trade Following</h3>
            <p className="text-sm text-white/60">
              AI-powered trading across {totalAccounts} accounts with individual configurations
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={isActive ? stopFollowing : startFollowing}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-green-400">{stats.executedTrades}</div>
            <div className="text-xs text-white/60">Total Trades</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-blue-400">{stats.totalSignals}</div>
            <div className="text-xs text-white/60">Signals Processed</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-purple-400">{activeAccounts}</div>
            <div className="text-xs text-white/60">Active Accounts</div>
          </div>
        </div>

        {/* Account Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Account Activity Status
          </h4>
          {accountStats.map((account) => (
            <div key={account.accountId} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  account.settings?.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium">{account.accountName}</span>
                <Badge variant="outline" className="text-xs">
                  {account.stats.trades} trades
                </Badge>
              </div>
              <div className="text-xs text-white/60">
                Last: {account.stats.lastTrade}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Signals */}
        {isActive && signals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Trading Signals</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {signals.slice(0, 5).map((signal) => (
                <TradeSignalCard
                  key={signal.id}
                  signal={signal}
                  onExecute={handleFollowTrade}
                  autoExecute={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isActive && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                Enable trade following to start automated trading across all your accounts.
              </p>
            </div>
          </div>
        )}

        {/* Link to Enhanced View */}
        <div className="pt-2 border-t border-white/10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // This would navigate to enhanced view in a real app
              console.log('Navigate to enhanced trade following view');
            }}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings & Monitoring
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
