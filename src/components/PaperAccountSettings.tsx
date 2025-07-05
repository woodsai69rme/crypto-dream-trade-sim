
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, RefreshCw, DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface PaperAccount {
  id: string;
  balance: number;
  initial_balance: number;
  total_pnl: number;
  total_pnl_percentage: number;
  account_name: string;
  is_active: boolean;
}

interface AuditRecord {
  id: string;
  action: string;
  old_balance: number | null;
  new_balance: number | null;
  amount_changed: number | null;
  reason: string | null;
  created_at: string;
}

interface TradeStats {
  totalTrades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
}

export const PaperAccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paperAccount, setPaperAccount] = useState<PaperAccount | null>(null);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [tradeStats, setTradeStats] = useState<TradeStats>({ totalTrades: 0, winRate: 0, bestTrade: 0, worstTrade: 0 });
  const [startingBalance, setStartingBalance] = useState("100000");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchAuditRecords();
      fetchTradeStats();
    }
  }, [user]);

  const fetchAccountData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching paper account:', error);
        return;
      }

      if (data) {
        setPaperAccount(data);
        setStartingBalance(data.initial_balance.toString());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('paper_account_audit')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setAuditRecords(data);
      }
    } catch (error) {
      console.error('Error fetching audit records:', error);
    }
  };

  const fetchTradeStats = async () => {
    if (!user) return;

    try {
      const { data: trades, error } = await supabase
        .from('paper_trades')
        .select('total_value, side, account_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (trades && paperAccount) {
        // Filter trades for current account only
        const accountTrades = trades.filter(t => t.account_id === paperAccount.id);
        const totalTrades = accountTrades.length;
        
        // If no trades exist (like after reset), set all stats to 0
        if (totalTrades === 0) {
          setTradeStats({ totalTrades: 0, winRate: 0, bestTrade: 0, worstTrade: 0 });
          return;
        }
        
        // Calculate win rate based on actual profitable trades
        const profitableTrades = accountTrades.filter(t => t.total_value > 0).length;
        const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
        
        const tradeValues = accountTrades.map(t => t.total_value);
        const bestTrade = tradeValues.length > 0 ? Math.max(...tradeValues) : 0;
        const worstTrade = tradeValues.length > 0 ? Math.min(...tradeValues) : 0;

        setTradeStats({ totalTrades, winRate, bestTrade, worstTrade });
      } else {
        // No trades found, reset all stats
        setTradeStats({ totalTrades: 0, winRate: 0, bestTrade: 0, worstTrade: 0 });
      }
    } catch (error) {
      console.error('Error fetching trade stats:', error);
      // On error, also reset stats to avoid showing stale data
      setTradeStats({ totalTrades: 0, winRate: 0, bestTrade: 0, worstTrade: 0 });
    }
  };

  const handleResetAccount = async () => {
    if (!user || !paperAccount) return;

    try {
      const resetBalance = parseFloat(startingBalance);
      
      const { error } = await supabase.rpc('reset_paper_account', {
        account_id_param: paperAccount.id,
        reset_balance_param: resetBalance
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await fetchAccountData();
      await fetchAuditRecords();
      await fetchTradeStats(); // Also refresh trade stats after reset
      
      toast({
        title: "Account Reset",
        description: "Your paper trading account has been reset successfully.",
      });
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAdjustBalance = async () => {
    if (!user || !paperAccount) return;

    try {
      const newBalance = parseFloat(startingBalance);
      
      const { error } = await supabase.rpc('adjust_paper_balance', {
        account_id_param: paperAccount.id,
        new_balance_param: newBalance,
        reason_param: 'Manual balance adjustment'
      });

      if (error) {
        toast({
          title: "Adjustment Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await fetchAccountData();
      await fetchAuditRecords();
      
      toast({
        title: "Balance Adjusted",
        description: "Your account balance has been updated successfully.",
      });
    } catch (error) {
      console.error('Adjustment error:', error);
      toast({
        title: "Adjustment Failed",
        description: "Failed to adjust balance. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="crypto-card-gradient text-white animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-white/10 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paper Trading Account - {paperAccount?.account_name || 'Default Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold">${paperAccount?.balance?.toLocaleString() || '0'}</div>
              <div className="text-sm text-white/60">Current Balance</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className={`text-2xl font-bold ${
                (paperAccount?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(paperAccount?.total_pnl || 0) >= 0 ? '+' : ''}${paperAccount?.total_pnl?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-white/60">Total P&L</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{tradeStats.totalTrades}</div>
              <div className="text-sm text-white/60">Total Trades</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-green-400">{tradeStats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-white/60">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="startingBalance">Adjust Balance (USD)</Label>
              <Input
                id="startingBalance"
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="bg-white/10 border-white/20"
              />
              <p className="text-xs text-white/60">
                Current balance: ${paperAccount?.balance?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAdjustBalance}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Adjust Balance
              </Button>
              <Button
                onClick={handleResetAccount}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trading Performance */}
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Initial Balance</span>
                <span className="font-bold">${paperAccount?.initial_balance?.toLocaleString() || '0'}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Current Balance</span>
                <span className="font-bold">${paperAccount?.balance?.toLocaleString() || '0'}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Total Return</span>
                <div className="text-right">
                  <div className={`font-bold ${(paperAccount?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(paperAccount?.total_pnl || 0) >= 0 ? '+' : ''}${paperAccount?.total_pnl?.toFixed(2) || '0.00'}
                  </div>
                  <div className={`text-sm ${(paperAccount?.total_pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(paperAccount?.total_pnl_percentage || 0) >= 0 ? '+' : ''}{paperAccount?.total_pnl_percentage?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Best Trade</span>
                <span className="font-bold text-green-400">
                  ${tradeStats.bestTrade.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Worst Trade</span>
                <span className="font-bold text-red-400">
                  ${tradeStats.worstTrade.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Win Rate</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {tradeStats.winRate.toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Paper Trading Notice</h4>
                  <p className="text-sm text-white/70">
                    This is a simulated trading environment. No real money is involved. 
                    Performance may not reflect real market conditions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Account Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditRecords.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                No audit records found
              </div>
            ) : (
              auditRecords.map((record) => (
                <div key={record.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {record.action.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-white/50">
                      {formatDistanceToNow(new Date(record.created_at))} ago
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {record.old_balance !== null && (
                      <div>
                        <p className="text-white/60">Old Balance</p>
                        <p className="font-medium">${record.old_balance.toLocaleString()}</p>
                      </div>
                    )}
                    {record.new_balance !== null && (
                      <div>
                        <p className="text-white/60">New Balance</p>
                        <p className="font-medium">${record.new_balance.toLocaleString()}</p>
                      </div>
                    )}
                    {record.amount_changed !== null && (
                      <div>
                        <p className="text-white/60">Change</p>
                        <p className={`font-medium ${record.amount_changed >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {record.amount_changed >= 0 ? '+' : ''}${record.amount_changed.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {record.reason && (
                    <div className="mt-3 p-3 bg-white/5 rounded text-sm">
                      <p className="text-white/60 mb-1">Reason:</p>
                      <p>{record.reason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
