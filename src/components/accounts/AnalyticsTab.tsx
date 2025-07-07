import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { 
  BarChart, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Activity,
  DollarSign,
  Percent,
  Calendar
} from "lucide-react";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsTab = () => {
  const { accounts, currentAccount } = useMultipleAccounts();

  // Mock analytics data
  const performanceData = [
    { date: 'Jan', portfolio: 100000, benchmark: 100000 },
    { date: 'Feb', portfolio: 105000, benchmark: 102000 },
    { date: 'Mar', portfolio: 98000, benchmark: 99000 },
    { date: 'Apr', portfolio: 112000, benchmark: 103000 },
    { date: 'May', portfolio: 118000, benchmark: 105000 },
    { date: 'Jun', portfolio: 125000, benchmark: 108000 },
  ];

  const monthlyReturns = [
    { month: 'Jan', return: 5.2 },
    { month: 'Feb', return: -6.7 },
    { month: 'Mar', return: 14.3 },
    { month: 'Apr', return: 5.4 },
    { month: 'May', return: 5.9 },
    { month: 'Jun', return: 3.2 },
  ];

  const assetAllocation = [
    { name: 'Bitcoin', value: 45, color: '#f7931a' },
    { name: 'Ethereum', value: 30, color: '#627eea' },
    { name: 'Solana', value: 15, color: '#9945ff' },
    { name: 'Others', value: 10, color: '#64748b' },
  ];

  const riskMetrics = {
    sharpeRatio: 1.42,
    maxDrawdown: -12.3,
    volatility: 18.7,
    beta: 1.15,
    alpha: 3.2,
    winRate: 68.5
  };

  const totalReturn = currentAccount ? 
    ((currentAccount.balance - currentAccount.initial_balance) / currentAccount.initial_balance) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-crypto-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">{riskMetrics.sharpeRatio}</p>
              </div>
              <Target className="w-8 h-8 text-crypto-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-crypto-success">{riskMetrics.winRate}%</p>
              </div>
              <Award className="w-8 h-8 text-crypto-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold text-crypto-danger">{riskMetrics.maxDrawdown}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-crypto-danger" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle>Portfolio vs Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)' 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="hsl(var(--crypto-success))" 
                  strokeWidth={2}
                  name="Portfolio"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="hsl(var(--crypto-info))" 
                  strokeWidth={2}
                  name="Benchmark"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {assetAllocation.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Returns */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle>Monthly Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="return" 
                stroke="hsl(var(--crypto-success))" 
                fill="hsl(var(--crypto-success))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Volatility</span>
                  <span>{riskMetrics.volatility}%</span>
                </div>
                <Progress value={riskMetrics.volatility} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Beta</span>
                  <span>{riskMetrics.beta}</span>
                </div>
                <Progress value={riskMetrics.beta * 50} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Alpha</span>
                  <span className="text-crypto-success">{riskMetrics.alpha}%</span>
                </div>
                <Progress value={riskMetrics.alpha * 10} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Win Rate</span>
                  <span className="text-crypto-success">{riskMetrics.winRate}%</span>
                </div>
                <Progress value={riskMetrics.winRate} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-center p-4 bg-card/20 rounded-lg">
                <div className="text-2xl font-bold text-crypto-success">{riskMetrics.sharpeRatio}</div>
                <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center p-4 bg-card/20 rounded-lg">
                <div className="text-2xl font-bold text-crypto-danger">{riskMetrics.maxDrawdown}%</div>
                <div className="text-xs text-muted-foreground">Max Drawdown</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Performance Summary */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle>Account Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((account, index) => (
              <div key={account.id} className="p-4 bg-card/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium truncate">{account.account_name}</h4>
                  {account.id === currentAccount?.id && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                </div>
                <div className={`text-lg font-bold ${
                  account.total_pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'
                }`}>
                  {account.total_pnl >= 0 ? '+' : ''}{account.total_pnl_percentage.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  ${account.balance.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};