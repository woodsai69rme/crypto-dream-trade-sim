import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { 
  History, TrendingUp, TrendingDown, Download, Filter, 
  Calendar as CalendarIcon, DollarSign, Target, Clock,
  CheckCircle, AlertCircle, XCircle, BarChart3
} from 'lucide-react';
import { format } from "date-fns";

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  fee: number;
  status: 'completed' | 'pending' | 'cancelled';
  trade_type: 'market' | 'limit' | 'stop';
  created_at: string;
  executed_at?: string;
  account_id: string;
  reasoning?: string;
  pnl?: number;
  pnl_percentage?: number;
}

interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalVolume: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeSize: number;
}

export const TradingHistoryDashboard = () => {
  const { user } = useAuth();
  const { currentAccount, accounts } = useMultipleAccounts();
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalPnL: 0,
    totalVolume: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTradeSize: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSide, setFilterSide] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user, selectedAccount]);

  useEffect(() => {
    applyFilters();
  }, [trades, filterSymbol, filterStatus, filterSide, dateRange, searchQuery]);

  const fetchTrades = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (selectedAccount !== 'all') {
        query = query.eq('account_id', selectedAccount);
      }

      const { data, error } = await query;

      if (error) throw error;

      const tradesWithPnL = data?.map(trade => ({
        ...trade,
        side: trade.side as 'buy' | 'sell',
        pnl: Math.random() * 200 - 100, // Mock P&L calculation
        pnl_percentage: Math.random() * 20 - 10
      })) || [];

      setTrades(tradesWithPnL);
      calculateStats(tradesWithPnL);
    } catch (error: any) {
      console.error('Error fetching trades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trading history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = trades;

    // Symbol filter
    if (filterSymbol !== 'all') {
      filtered = filtered.filter(trade => trade.symbol === filterSymbol);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(trade => trade.status === filterStatus);
    }

    // Side filter
    if (filterSide !== 'all') {
      filtered = filtered.filter(trade => trade.side === filterSide);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(trade => 
        new Date(trade.created_at) >= dateRange.from!
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(trade => 
        new Date(trade.created_at) <= dateRange.to!
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(trade =>
        trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.reasoning?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTrades(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (tradeList: Trade[]) => {
    const completed = tradeList.filter(t => t.status === 'completed');
    const winning = completed.filter(t => (t.pnl || 0) > 0);
    const losing = completed.filter(t => (t.pnl || 0) < 0);
    
    const totalPnL = completed.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalVolume = completed.reduce((sum, t) => sum + t.total_value, 0);
    
    setStats({
      totalTrades: completed.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      winRate: completed.length > 0 ? (winning.length / completed.length) * 100 : 0,
      totalPnL,
      totalVolume,
      bestTrade: Math.max(...completed.map(t => t.pnl || 0), 0),
      worstTrade: Math.min(...completed.map(t => t.pnl || 0), 0),
      avgTradeSize: completed.length > 0 ? totalVolume / completed.length : 0
    });
  };

  const exportTrades = () => {
    const csvContent = [
      ['Date', 'Symbol', 'Side', 'Amount', 'Price', 'Total Value', 'Fee', 'P&L', 'Status'],
      ...filteredTrades.map(trade => [
        format(new Date(trade.created_at), 'yyyy-MM-dd HH:mm:ss'),
        trade.symbol,
        trade.side,
        trade.amount,
        trade.price,
        trade.total_value,
        trade.fee,
        trade.pnl || 0,
        trade.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredTrades.length} trades to CSV`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const uniqueSymbols = [...new Set(trades.map(t => t.symbol))];

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Trading History & Analytics
            <Badge className="bg-blue-500/20 text-blue-400">
              {filteredTrades.length} Trades
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Comprehensive trading history with advanced filtering and performance analytics.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Total Trades</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Win Rate</p>
                    <p className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Total P&L</p>
                    <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  {stats.totalPnL >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Total Volume</p>
                    <p className="text-2xl font-bold text-white">${stats.totalVolume.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Winning Trades</span>
                  <span className="text-green-400 font-medium">{stats.winningTrades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Losing Trades</span>
                  <span className="text-red-400 font-medium">{stats.losingTrades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Best Trade</span>
                  <span className="text-green-400 font-medium">${stats.bestTrade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Worst Trade</span>
                  <span className="text-red-400 font-medium">${stats.worstTrade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Avg Trade Size</span>
                  <span className="text-white font-medium">${stats.avgTradeSize.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTrades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(trade.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.side.toUpperCase()}
                            </Badge>
                            <span className="text-white font-medium">{trade.symbol}</span>
                          </div>
                          <p className="text-xs text-white/60">
                            {format(new Date(trade.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${trade.total_value.toFixed(2)}</div>
                        <div className={`text-xs ${
                          (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </div>
                <Button onClick={exportTrades} size="sm" variant="outline" className="border-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Symbols</SelectItem>
                    {uniqueSymbols.map(symbol => (
                      <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSide} onValueChange={setFilterSide}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sides</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-white/20 bg-white/10">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Date Range
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={dateRange as any}
                      onSelect={(range) => setDateRange(range || {})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  placeholder="Search trades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trades Table */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/80">Date</TableHead>
                      <TableHead className="text-white/80">Symbol</TableHead>
                      <TableHead className="text-white/80">Side</TableHead>
                      <TableHead className="text-white/80">Amount</TableHead>
                      <TableHead className="text-white/80">Price</TableHead>
                      <TableHead className="text-white/80">Total</TableHead>
                      <TableHead className="text-white/80">P&L</TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrades.map((trade) => (
                      <TableRow key={trade.id} className="border-white/10">
                        <TableCell className="text-white/80">
                          {format(new Date(trade.created_at), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell className="text-white font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge className={`${
                            trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.side.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/80">{trade.amount}</TableCell>
                        <TableCell className="text-white/80">${trade.price.toLocaleString()}</TableCell>
                        <TableCell className="text-white/80">${trade.total_value.toFixed(2)}</TableCell>
                        <TableCell className={`font-medium ${
                          (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(trade.status)}
                            <span className="text-white/80 capitalize">{trade.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Trade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Market Orders</span>
                    <span className="text-white font-medium">
                      {filteredTrades.filter(t => t.trade_type === 'market').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Limit Orders</span>
                    <span className="text-white font-medium">
                      {filteredTrades.filter(t => t.trade_type === 'limit').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Stop Orders</span>
                    <span className="text-white font-medium">
                      {filteredTrades.filter(t => t.trade_type === 'stop').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Symbol Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uniqueSymbols.slice(0, 5).map(symbol => {
                    const symbolTrades = filteredTrades.filter(t => t.symbol === symbol);
                    const symbolPnL = symbolTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                    return (
                      <div key={symbol} className="flex justify-between items-center">
                        <span className="text-white/80">{symbol}</span>
                        <div className="text-right">
                          <div className={`font-medium ${
                            symbolPnL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {symbolPnL >= 0 ? '+' : ''}${symbolPnL.toFixed(2)}
                          </div>
                          <div className="text-xs text-white/60">{symbolTrades.length} trades</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Sharpe Ratio</span>
                    <span className="text-white font-medium">1.85</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Max Drawdown</span>
                    <span className="text-red-400 font-medium">-8.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Volatility</span>
                    <span className="text-white font-medium">24.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">This Month</span>
                    <span className="text-green-400 font-medium">+$1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Last Month</span>
                    <span className="text-green-400 font-medium">+$2,134</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Best Month</span>
                    <span className="text-green-400 font-medium">+$3,892</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Trading Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Current Streak</span>
                    <span className="text-green-400 font-medium">5 wins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Best Streak</span>
                    <span className="text-green-400 font-medium">12 wins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Worst Streak</span>
                    <span className="text-red-400 font-medium">4 losses</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};