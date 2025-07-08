
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Activity, TrendingUp, TrendingDown, Clock, AlertTriangle, Users, Zap } from 'lucide-react';

interface AccountTradingData {
  accountId: string;
  accountName: string;
  recentTrades: number;
  lastTradeTime: string;
  totalVolume: number;
  pnl: number;
  status: 'active' | 'inactive' | 'error';
  balance: number;
  tradesLast24h: number;
  avgTradeSize: number;
  winRate: number;
  isFollowing: boolean;
}

export const AccountTradingMonitor = () => {
  const { user } = useAuth();
  const { accounts } = useMultipleAccounts();
  const { getAccountStats, isActive: followingActive, stats } = useRealTimeTradeFollowing();
  const [accountData, setAccountData] = useState<AccountTradingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);

  // Fetch comprehensive trading data for each account
  const fetchAccountTradingData = async () => {
    if (!user || accounts.length === 0) return;

    try {
      const accountTradingData: AccountTradingData[] = [];

      for (const account of accounts) {
        // Get recent trades for this account
        const { data: trades, error } = await supabase
          .from('paper_trades')
          .select('*')
          .eq('user_id', user.id)
          .eq('account_id', account.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching trades for ${account.account_name}:`, error);
          continue;
        }

        // Calculate comprehensive statistics
        const recentTrades = trades?.length || 0;
        const last24hTrades = trades?.filter(trade => 
          new Date(trade.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length || 0;

        const lastTradeTime = trades?.[0]?.created_at || 'Never';
        const totalVolume = trades?.reduce((sum, trade) => sum + Math.abs(trade.total_value), 0) || 0;
        const avgTradeSize = recentTrades > 0 ? totalVolume / recentTrades : 0;
        
        // Calculate win rate
        const profitableTrades = trades?.filter(trade => {
          return (trade.side === 'sell' && trade.total_value > 0) || 
                 (trade.side === 'buy' && trade.total_value < 0);
        }).length || 0;
        const winRate = recentTrades > 0 ? (profitableTrades / recentTrades) * 100 : 0;

        const pnl = account.total_pnl || 0;

        // Determine status based on recent activity and following settings
        let status: 'active' | 'inactive' | 'error' = 'inactive';
        const accountStats = getAccountStats().find(acc => acc.accountId === account.id);
        const isFollowing = accountStats?.settings?.isActive || false;

        if (last24hTrades > 0) {
          const lastTrade = new Date(lastTradeTime);
          const timeSinceLastTrade = Date.now() - lastTrade.getTime();
          if (timeSinceLastTrade < 60 * 60 * 1000) { // 1 hour
            status = 'active';
          } else if (timeSinceLastTrade < 6 * 60 * 60 * 1000) { // 6 hours
            status = 'inactive';
          } else {
            status = 'error';
          }
        } else if (isFollowing && followingActive) {
          status = 'error'; // Should be trading but isn't
        }

        accountTradingData.push({
          accountId: account.id,
          accountName: account.account_name,
          recentTrades,
          lastTradeTime: lastTradeTime === 'Never' ? 'Never' : new Date(lastTradeTime).toLocaleString(),
          totalVolume,
          pnl,
          status,
          balance: account.balance,
          tradesLast24h: last24hTrades,
          avgTradeSize,
          winRate: Math.round(winRate),
          isFollowing
        });
      }

      setAccountData(accountTradingData);
      setRealTimeUpdates(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching account trading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountTradingData();
    
    // Refresh every 15 seconds for real-time monitoring
    const interval = setInterval(fetchAccountTradingData, 15000);
    return () => clearInterval(interval);
  }, [user, accounts, followingActive]);

  // Set up real-time subscriptions for trades
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('account-trades')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'paper_trades',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New trade detected:', payload);
          fetchAccountTradingData(); // Refresh data when new trade is detected
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-400 animate-pulse" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const totalTrades = accountData.reduce((sum, acc) => sum + acc.tradesLast24h, 0);
  const activeAccounts = accountData.filter(acc => acc.status === 'active').length;
  const totalVolume = accountData.reduce((sum, acc) => sum + acc.totalVolume, 0);
  const avgWinRate = accountData.length > 0 
    ? Math.round(accountData.reduce((sum, acc) => sum + acc.winRate, 0) / accountData.length)
    : 0;

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            Loading Account Trading Data...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Real-Time Account Trading Monitor
          <div className="flex items-center gap-2 ml-auto">
            <Badge className={followingActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
              {followingActive ? 'Following Active' : 'Following Inactive'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Zap className="w-3 h-3" />
              Live #{realTimeUpdates}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-blue-400">{totalTrades}</div>
            <div className="text-xs text-white/60">Trades (24h)</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-green-400">{activeAccounts}/{accounts.length}</div>
            <div className="text-xs text-white/60">Active Now</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-purple-400">${totalVolume.toFixed(0)}</div>
            <div className="text-xs text-white/60">Volume (7d)</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-yellow-400">{avgWinRate}%</div>
            <div className="text-xs text-white/60">Avg Win Rate</div>
          </div>
        </div>

        {/* Individual Account Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Individual Account Performance</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAccountTradingData}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </div>
          
          {accountData.map((account) => (
            <div key={account.accountId} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(account.status)}
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {account.accountName}
                      <Badge className={`text-xs ${getStatusColor(account.status)}`}>
                        {account.status}
                      </Badge>
                      {account.isFollowing && (
                        <Badge variant="outline" className="text-xs">
                          Following
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-white/60">
                      Balance: ${account.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {account.pnl >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      account.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {account.pnl >= 0 ? '+' : ''}${account.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-white/60">
                    Total P&L
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-white/50">Trades (24h)</div>
                  <div className="font-medium text-blue-400">{account.tradesLast24h}</div>
                </div>
                <div>
                  <div className="text-white/50">Win Rate</div>
                  <div className="font-medium text-green-400">{account.winRate}%</div>
                </div>
                <div>
                  <div className="text-white/50">Avg Trade Size</div>
                  <div className="font-medium">${account.avgTradeSize.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-white/50">Last Trade</div>
                  <div className="font-medium text-xs">{account.lastTradeTime}</div>
                </div>
              </div>

              {/* Real-time activity indicator */}
              {account.status === 'active' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Trading actively
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trade Following Performance */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="font-medium mb-3">Trade Following Performance</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-white/50">Total Signals</div>
              <div className="font-medium text-blue-400">{stats.totalSignals}</div>
            </div>
            <div>
              <div className="text-white/50">Executed Trades</div>
              <div className="font-medium text-green-400">{stats.executedTrades}</div>
            </div>
            <div>
              <div className="text-white/50">Success Rate</div>
              <div className="font-medium text-purple-400">
                {stats.totalSignals > 0 ? Math.round((stats.executedTrades / stats.totalSignals) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="text-white/50">Avg Latency</div>
              <div className="font-medium text-yellow-400">{Math.round(stats.avgLatency)}ms</div>
            </div>
          </div>
        </div>

        {/* Alerts and Recommendations */}
        {(accountData.some(acc => acc.status === 'error') || !followingActive) && (
          <div className="space-y-3">
            {accountData.some(acc => acc.status === 'error') && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 text-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">
                    {accountData.filter(acc => acc.status === 'error').length} account(s) 
                    haven't traded recently despite being configured for trade following.
                  </p>
                </div>
              </div>
            )}

            {!followingActive && (
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-200">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">
                    Trade following is inactive. Enable it to start automated trading across all accounts.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
