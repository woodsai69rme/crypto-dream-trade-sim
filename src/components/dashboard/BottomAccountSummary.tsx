import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  DollarSign,
  Target,
  BarChart3,
  Timer
} from 'lucide-react';

interface HoldingData {
  symbol: string;
  amount: number;
  value: number;
  percentage: number;
  change24h: number;
}

interface AccountSummary {
  accountId: string;
  accountName: string;
  balance: number;
  totalValue: number;
  holdings: HoldingData[];
  pnl: number;
  pnlPercentage: number;
  lastTradeTime: string;
  status: string;
  risk_level: string;
}

export const BottomAccountSummary = () => {
  const { accounts } = useMultipleAccounts();
  const { stats, activeAccounts, totalAccounts } = useRealTimeTradeFollowing();
  
  const [isVisible, setIsVisible] = useState(true);
  const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'holdings' | 'performance'>('overview');

  // Calculate totals
  const totalBalance = accountSummaries.reduce((sum, acc) => sum + acc.balance, 0);
  const totalValue = accountSummaries.reduce((sum, acc) => sum + acc.totalValue, 0);
  const totalPnL = accountSummaries.reduce((sum, acc) => sum + acc.pnl, 0);
  const avgPnLPercentage = accountSummaries.length > 0 
    ? accountSummaries.reduce((sum, acc) => sum + acc.pnlPercentage, 0) / accountSummaries.length 
    : 0;

  // Fetch account data
  useEffect(() => {
    fetchAccountSummaries();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAccountSummaries, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [accounts, autoRefresh]);

  const fetchAccountSummaries = async () => {
    try {
      setRefreshing(true);
      
      const summaries: AccountSummary[] = await Promise.all(
        accounts.map(async (account) => {
          // Fetch recent trades for this account
          const { data: trades } = await supabase
            .from('paper_trades')
            .select('*')
            .eq('account_id', account.id)
            .order('created_at', { ascending: false })
            .limit(10);

          // Calculate holdings (simplified - in real app would aggregate positions)
          const holdings: HoldingData[] = generateMockHoldings(account.balance);
          
          // Calculate total value including holdings
          const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
          const totalValue = account.balance + holdingsValue;
          
          // Calculate PnL
          const pnl = totalValue - account.initial_balance;
          const pnlPercentage = (pnl / account.initial_balance) * 100;
          
          const lastTrade = trades?.[0];
          
          return {
            accountId: account.id,
            accountName: account.account_name,
            balance: account.balance,
            totalValue,
            holdings,
            pnl,
            pnlPercentage,
            lastTradeTime: lastTrade?.created_at || 'Never',
            status: account.status || 'active',
            risk_level: account.risk_level || 'medium'
          };
        })
      );
      
      setAccountSummaries(summaries);
    } catch (error) {
      console.error('Error fetching account summaries:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateMockHoldings = (balance: number): HoldingData[] => {
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK'];
    return symbols.map(symbol => {
      const allocation = Math.random() * 0.3; // 0-30% allocation
      const value = balance * allocation;
      const amount = value / (Math.random() * 50000 + 1000); // Mock price
      const change24h = (Math.random() - 0.5) * 10; // -5% to +5%
      
      return {
        symbol,
        amount,
        value,
        percentage: allocation * 100,
        change24h
      };
    }).filter(holding => holding.value > 100); // Only show meaningful holdings
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    if (timestamp === 'Never') return 'Never';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'aggressive': return 'text-red-400 bg-red-500/10';
      default: return 'text-blue-400 bg-blue-500/10';
    }
  };

  if (!isVisible) {
    return (
      <div className="h-full bg-background/80 backdrop-blur-sm border-t flex items-center justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show Account Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background/95 backdrop-blur-sm border-t shadow-lg overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Portfolio Summary</span>
              <Badge variant="outline" className="text-xs">
                {totalAccounts} accounts
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">{formatCurrency(totalBalance)}</span>
                <span className="text-muted-foreground">Cash</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span className="font-medium">{formatCurrency(totalValue)}</span>
                <span className="text-muted-foreground">Total Value</span>
              </div>
              
              <div className="flex items-center gap-1">
                {totalPnL >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={`font-medium ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)} ({avgPnLPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAccountSummaries}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-refresh (30s)</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
          </div>
        )}

        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="pb-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="holdings" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Holdings
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {accountSummaries.map((account) => (
                <Card key={account.accountId} className="border-white/10 bg-white/5">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium truncate">{account.accountName}</h4>
                      <Badge className={getRiskColor(account.risk_level)} variant="outline">
                        {account.risk_level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium">{formatCurrency(account.totalValue)}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">P&L:</span>
                        <span className={`font-medium ${account.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {account.pnl >= 0 ? '+' : ''}{formatCurrency(account.pnl)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Last Trade:</span>
                        <span>{formatTimeAgo(account.lastTradeTime)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accountSummaries.map((account) => (
                <Card key={account.accountId} className="border-white/10 bg-white/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{account.accountName} Holdings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {account.holdings.map((holding) => (
                      <div key={holding.symbol} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{holding.symbol}</Badge>
                          <span className="text-muted-foreground">{holding.amount.toFixed(4)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(holding.value)}</div>
                          <div className={`text-xs ${holding.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                    {account.holdings.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No holdings</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Return:</span>
                      <span className={totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {avgPnLPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, avgPnLPercentage + 50))} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Best Performer:</span>
                    <span className="text-green-400">
                      {accountSummaries.reduce((best, current) => 
                        current.pnlPercentage > best.pnlPercentage ? current : best,
                        accountSummaries[0] || { accountName: 'N/A', pnlPercentage: 0 }
                      ).accountName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Active Traders:</span>
                    <span>{activeAccounts}/{totalAccounts}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Trading Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Signals Today:</span>
                    <span>{stats.totalSignals}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Executed Trades:</span>
                    <span>{stats.executedTrades}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="text-green-400">{stats.successRate.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Last Signal:</span>
                    <span className="text-muted-foreground">{stats.lastSignalTime}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['low', 'medium', 'high', 'aggressive'].map(risk => {
                    const count = accountSummaries.filter(acc => acc.risk_level === risk).length;
                    const percentage = totalAccounts > 0 ? (count / totalAccounts) * 100 : 0;
                    
                    return (
                      <div key={risk} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{risk}:</span>
                        <div className="flex items-center gap-2">
                          <span>{count}</span>
                          <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getRiskColor(risk)} transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};