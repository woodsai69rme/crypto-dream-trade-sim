
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { usePerformanceAnalytics } from "@/hooks/usePerformanceAnalytics";
import { TrendingUp, BarChart3, Target, DollarSign, Activity, Award } from "lucide-react";

interface PerformanceComparison {
  account_name: string;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  profit_factor: number;
  color: string;
}

interface BotPerformance {
  bot_name: string;
  strategy: string;
  win_rate: number;
  total_trades: number;
  profit: number;
  sharpe_ratio: number;
  status: string;
}

export const PerformanceAnalyticsDashboard = () => {
  const { accounts } = useMultipleAccounts();
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
  const { performanceData, metrics } = usePerformanceAnalytics(selectedAccount);
  
  const [accountComparison, setAccountComparison] = useState<PerformanceComparison[]>([]);
  const [botPerformance, setBotPerformance] = useState<BotPerformance[]>([]);
  const [portfolioEvolution, setPortfolioEvolution] = useState<any[]>([]);

  // Generate comprehensive performance analytics
  useEffect(() => {
    // Account comparison data
    const comparison: PerformanceComparison[] = accounts.map((account, idx) => ({
      account_name: account.account_name,
      total_return: account.total_pnl_percentage,
      sharpe_ratio: 1.2 + Math.random() * 1.5,
      max_drawdown: Math.abs(Math.random() * 15 + 3),
      win_rate: 55 + Math.random() * 25,
      total_trades: Math.floor(Math.random() * 200 + 50),
      profit_factor: 1.1 + Math.random() * 0.8,
      color: ['#22c55e', '#ef4444', '#3b82f6'][idx] || '#8b5cf6'
    }));
    setAccountComparison(comparison);

    // Bot performance data
    const bots: BotPerformance[] = [
      { bot_name: 'Bitcoin Trend Master', strategy: 'trend-following', win_rate: 68, total_trades: 45, profit: 12.5, sharpe_ratio: 1.8, status: 'active' },
      { bot_name: 'Ethereum Grid Bot', strategy: 'grid-trading', win_rate: 72, total_trades: 89, profit: 8.3, sharpe_ratio: 1.4, status: 'active' },
      { bot_name: 'Multi-Coin DCA', strategy: 'dca', win_rate: 78, total_trades: 120, profit: 15.2, sharpe_ratio: 2.1, status: 'active' },
      { bot_name: 'Solana Breakout Hunter', strategy: 'breakout', win_rate: 59, total_trades: 34, profit: 18.7, sharpe_ratio: 1.6, status: 'active' },
      { bot_name: 'Arbitrage Scanner', strategy: 'arbitrage', win_rate: 85, total_trades: 156, profit: 6.8, sharpe_ratio: 3.2, status: 'active' },
      { bot_name: 'Momentum Trader', strategy: 'momentum', win_rate: 63, total_trades: 78, profit: 22.1, sharpe_ratio: 1.9, status: 'active' },
      { bot_name: 'Mean Reversion Bot', strategy: 'mean-reversion', win_rate: 74, total_trades: 92, profit: 11.4, sharpe_ratio: 1.7, status: 'active' },
      { bot_name: 'Scalping Master', strategy: 'scalping', win_rate: 61, total_trades: 203, profit: 9.6, sharpe_ratio: 1.3, status: 'active' }
    ];
    setBotPerformance(bots);

    // Portfolio evolution over time
    const evolution = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      woods1: 100000 + (Math.random() * 10000 - 2000) * (i + 1) / 10,
      angry: 100000 + (Math.random() * 15000 - 3000) * (i + 1) / 8,
      handjob: 100000 + (Math.random() * 12000 - 2500) * (i + 1) / 9,
      total: 0
    }));
    
    evolution.forEach(day => {
      day.total = day.woods1 + day.angry + day.handjob;
    });
    
    setPortfolioEvolution(evolution);
  }, [accounts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceColor = (value: number, type: 'return' | 'ratio' | 'percentage') => {
    if (type === 'return' || type === 'percentage') {
      return value >= 0 ? 'text-green-400' : 'text-red-400';
    }
    if (type === 'ratio') {
      return value >= 1.5 ? 'text-green-400' : value >= 1.0 ? 'text-yellow-400' : 'text-red-400';
    }
    return 'text-white';
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
            </div>
            <p className="text-xs text-white/60">
              {accounts.reduce((sum, acc) => sum + acc.total_pnl_percentage, 0).toFixed(2)}% total return
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Strategies</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{botPerformance.filter(bot => bot.status === 'active').length}</div>
            <p className="text-xs text-white/60">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Average Win Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(botPerformance.reduce((sum, bot) => sum + bot.win_rate, 0) / botPerformance.length).toFixed(1)}%
            </div>
            <p className="text-xs text-white/60">
              {botPerformance.reduce((sum, bot) => sum + bot.total_trades, 0)} total trades
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Best Performer</CardTitle>
            <Award className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.max(...accountComparison.map(acc => acc.total_return)).toFixed(1)}%
            </div>
            <p className="text-xs text-white/60">
              {accountComparison.find(acc => acc.total_return === Math.max(...accountComparison.map(a => a.total_return)))?.account_name}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="accounts">Account Comparison</TabsTrigger>
          <TabsTrigger value="bots">Bot Performance</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Portfolio Evolution (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line type="monotone" dataKey="woods1" stroke="#22c55e" strokeWidth={2} name="Woods1" />
                  <Line type="monotone" dataKey="angry" stroke="#ef4444" strokeWidth={2} name="Angry" />
                  <Line type="monotone" dataKey="handjob" stroke="#3b82f6" strokeWidth={2} name="Handjob" />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Account Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountComparison.map((account) => (
                  <div key={account.account_name} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{account.account_name}</h4>
                      <Badge style={{ backgroundColor: `${account.color}20`, color: account.color }}>
                        {account.total_return >= 0 ? '+' : ''}{account.total_return.toFixed(2)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                      <div>
                        <span className="text-white/60">Sharpe Ratio:</span>
                        <div className={`font-medium ${getPerformanceColor(account.sharpe_ratio, 'ratio')}`}>
                          {account.sharpe_ratio.toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-white/60">Max Drawdown:</span>
                        <div className="font-medium text-red-400">
                          -{account.max_drawdown.toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <span className="text-white/60">Win Rate:</span>
                        <div className={`font-medium ${getPerformanceColor(account.win_rate, 'percentage')}`}>
                          {account.win_rate.toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <span className="text-white/60">Total Trades:</span>
                        <div className="font-medium text-white">
                          {account.total_trades}
                        </div>
                      </div>

                      <div>
                        <span className="text-white/60">Profit Factor:</span>
                        <div className={`font-medium ${getPerformanceColor(account.profit_factor, 'ratio')}`}>
                          {account.profit_factor.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">AI Bot Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {botPerformance
                  .sort((a, b) => b.profit - a.profit)
                  .map((bot, index) => (
                    <div key={bot.bot_name} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium text-white">{bot.bot_name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {bot.strategy}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getPerformanceColor(bot.profit, 'return')}`}>
                            +{bot.profit.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-white/60">Win Rate:</span>
                          <div className="font-medium text-white">{bot.win_rate}%</div>
                        </div>
                        <div>
                          <span className="text-white/60">Trades:</span>
                          <div className="font-medium text-white">{bot.total_trades}</div>
                        </div>
                        <div>
                          <span className="text-white/60">Sharpe:</span>
                          <div className="font-medium text-white">{bot.sharpe_ratio.toFixed(1)}</div>
                        </div>
                        <div>
                          <span className="text-white/60">Status:</span>
                          <div className={`font-medium ${bot.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                            {bot.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient">
              <CardHeader>
                <CardTitle className="text-white">Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={accountComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="account_name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="total_return" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient">
              <CardHeader>
                <CardTitle className="text-white">Strategy Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Trend Following', value: 25, fill: '#22c55e' },
                        { name: 'Grid Trading', value: 20, fill: '#3b82f6' },
                        { name: 'DCA', value: 15, fill: '#8b5cf6' },
                        { name: 'Arbitrage', value: 15, fill: '#ef4444' },
                        { name: 'Momentum', value: 12, fill: '#f59e0b' },
                        { name: 'Others', value: 13, fill: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
