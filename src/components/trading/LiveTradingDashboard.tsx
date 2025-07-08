
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompleteTradingSystem } from "@/hooks/useCompleteTradingSystem";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useFollowingAccounts } from "@/hooks/useFollowingAccounts";
import { Activity, Play, Square, TrendingUp, TrendingDown, Users, Bot, Wallet, BarChart3 } from "lucide-react";

export const LiveTradingDashboard = () => {
  const { systemActive, stats, liveSignals, loading, startSystem, stopSystem } = useCompleteTradingSystem();
  const { accounts } = useMultipleAccounts();
  const { followingAccounts } = useFollowingAccounts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* System Control Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className={`w-8 h-8 ${systemActive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
          <div>
            <h1 className="text-3xl font-bold text-white">Live Trading System</h1>
            <p className="text-white/60">
              {systemActive ? 'System Active - All accounts trading live' : 'System Ready - Click start to begin'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!systemActive ? (
            <Button 
              onClick={startSystem} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              {loading ? 'Starting...' : 'Start Complete System'}
            </Button>
          ) : (
            <Button 
              onClick={stopSystem}
              variant="destructive"
              className="px-6 py-3"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop System
            </Button>
          )}
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Accounts</CardTitle>
            <Wallet className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeAccounts}</div>
            <p className="text-xs text-white/60">All accounts operational</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeBots}/20</div>
            <p className="text-xs text-white/60">AI trading bots running</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Followed Traders</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.followedTraders}/20</div>
            <p className="text-xs text-white/60">Top crypto traders</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalVolume)}</div>
            <p className="text-xs text-white/60">{stats.totalTrades} trades executed</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Account Status ({accounts.length} Active)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${systemActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="font-medium text-white">{account.account_name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {account.account_type}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Balance:</span>
                    <span className="text-white font-medium">{formatCurrency(account.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">P&L:</span>
                    <span className={`font-medium ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(account.total_pnl)} ({account.total_pnl_percentage.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Risk Level:</span>
                    <span className="text-white">{account.risk_level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Trading Signals */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Trading Signals ({liveSignals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liveSignals.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                {systemActive ? 'Waiting for trading signals...' : 'Start the system to see live signals'}
              </div>
            ) : (
              liveSignals.map((signal) => (
                <div key={signal.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={signal.side === 'buy' ? 'default' : 'destructive'} className="text-xs">
                        {signal.side.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-white">{signal.symbol}</span>
                      <span className="text-white/60">from {signal.trader_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {signal.confidence.toFixed(0)}% confidence
                      </Badge>
                      <span className="text-xs text-white/60">{formatTime(signal.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-4 text-sm">
                      <span className="text-white/60">Price: <span className="text-white">${signal.price.toFixed(2)}</span></span>
                      <span className="text-white/60">Amount: <span className="text-white">{signal.amount.toFixed(3)}</span></span>
                    </div>
                    
                    {signal.executed_accounts.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">
                          Executed on {signal.executed_accounts.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-white/60 italic">{signal.reasoning}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Following Status */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top Traders Being Followed ({followingAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {followingAccounts.slice(0, 8).map((trader) => (
              <div key={trader.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white text-sm">{trader.trader_name}</span>
                  <div className={`w-2 h-2 rounded-full ${systemActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                </div>
                <div className="text-xs text-white/60">{trader.trader_category}</div>
                {trader.live_data && (
                  <div className="mt-2 text-xs">
                    <div className={`flex items-center gap-1 ${trader.live_data.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trader.live_data.total_pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trader.live_data.total_pnl_percentage.toFixed(1)}%
                    </div>
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
