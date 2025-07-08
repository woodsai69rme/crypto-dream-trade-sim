
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Activity, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface AccountTradingData {
  accountId: string;
  accountName: string;
  recentTrades: number;
  lastTradeTime: string;
  totalVolume: number;
  pnl: number;
  status: 'active' | 'inactive' | 'error';
}

export const AccountTradingMonitor = () => {
  const { user } = useAuth();
  const { accounts } = useMultipleAccounts();
  const { getAccountStats, isActive: followingActive } = useRealTimeTradeFollowing();
  const [accountData, setAccountData] = useState<AccountTradingData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent trading activity for each account
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
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching trades for ${account.account_name}:`, error);
          continue;
        }

        const recentTrades = trades?.length || 0;
        const lastTradeTime = trades?.[0]?.created_at || 'Never';
        const totalVolume = trades?.reduce((sum, trade) => sum + Math.abs(trade.total_value), 0) || 0;
        const pnl = account.total_pnl || 0;

        // Determine status based on recent activity
        let status: 'active' | 'inactive' | 'error' = 'inactive';
        if (recentTrades > 0) {
          const lastTrade = new Date(lastTradeTime);
          const timeSinceLastTrade = Date.now() - lastTrade.getTime();
          if (timeSinceLastTrade < 30 * 60 * 1000) { // 30 minutes
            status = 'active';
          } else if (timeSinceLastTrade < 2 * 60 * 60 * 1000) { // 2 hours
            status = 'inactive';
          } else {
            status = 'error';
          }
        }

        accountTradingData.push({
          accountId: account.id,
          accountName: account.account_name,
          recentTrades,
          lastTradeTime: lastTradeTime === 'Never' ? 'Never' : new Date(lastTradeTime).toLocaleTimeString(),
          totalVolume,
          pnl,
          status
        });
      }

      setAccountData(accountTradingData);
    } catch (error) {
      console.error('Error fetching account trading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountTradingData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAccountTradingData, 30000);
    return () => clearInterval(interval);
  }, [user, accounts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-400" />;
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
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalTrades = accountData.reduce((sum, acc) => sum + acc.recentTrades, 0);
  const activeAccounts = accountData.filter(acc => acc.status === 'active').length;
  const totalVolume = accountData.reduce((sum, acc) => sum + acc.totalVolume, 0);

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Loading Account Trading Data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Account Trading Monitor
          <Badge className={followingActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {followingActive ? 'Following Active' : 'Following Inactive'}
          </Badge>
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
            <div className="text-xs text-white/60">Active Accounts</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-purple-400">${totalVolume.toFixed(0)}</div>
            <div className="text-xs text-white/60">Volume (24h)</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAccountTradingData}
              className="h-full w-full"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          <h3 className="font-medium">Account Trading Activity</h3>
          {accountData.map((account) => (
            <div key={account.accountId} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(account.status)}
                  <span className="font-medium">{account.accountName}</span>
                  <Badge className={getStatusColor(account.status)}>
                    {account.status}
                  </Badge>
                </div>
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
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
                <div>
                  <div className="text-white/50">Recent Trades</div>
                  <div className="font-medium">{account.recentTrades}</div>
                </div>
                <div>
                  <div className="text-white/50">Last Trade</div>
                  <div className="font-medium">{account.lastTradeTime}</div>
                </div>
                <div>
                  <div className="text-white/50">Volume (24h)</div>
                  <div className="font-medium">${account.totalVolume.toFixed(0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {accountData.some(acc => acc.status === 'error') && (
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm">
                Some accounts haven't traded recently. Check trade following settings.
              </p>
            </div>
          </div>
        )}

        {!followingActive && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm">
                Trade following is inactive. Enable it to start automated trading.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
