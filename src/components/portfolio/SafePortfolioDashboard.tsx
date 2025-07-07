
import { SafePortfolioCard } from "./SafePortfolioCard";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, Target, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

interface SafePortfolioDashboardProps {
  portfolio: any;
  paperAccount: any;
  loading: boolean;
}

export const SafePortfolioDashboard = ({ portfolio, paperAccount, loading }: SafePortfolioDashboardProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="crypto-card-gradient text-white animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-white/10 rounded mb-4"></div>
              <div className="h-8 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Ensure all amounts are paper trading only (zero for real accounts)
  const safePortfolioValue = portfolio?.total_value || 100000;
  const safeBalance = paperAccount?.balance || 100000;
  const safePnL = paperAccount?.total_pnl || 0;
  const safePnLPercentage = paperAccount?.total_pnl_percentage || 0;

  const balanceData = paperAccount ? [
    { name: 'Available Cash', value: safeBalance, color: '#10b981' },
    { name: 'Invested Amount', value: Math.abs(safePnL), color: '#3b82f6' },
    { name: 'Reserved Funds', value: safeBalance * 0.1, color: '#f59e0b' }
  ] : [];

  const performanceData = [
    { time: '1D', value: safePortfolioValue, change: 2.1 },
    { time: '7D', value: safePortfolioValue * 0.98, change: -1.2 },
    { time: '30D', value: safePortfolioValue * 1.05, change: 4.8 },
    { time: '90D', value: safePortfolioValue * 1.12, change: 12.3 },
    { time: '1Y', value: safePortfolioValue * 1.28, change: 28.1 },
  ];

  const riskMetrics = [
    { name: 'Sharpe Ratio', value: 1.67, status: 'good' },
    { name: 'Max Drawdown', value: 8.3, status: 'warning' },
    { name: 'Volatility', value: 15.2, status: 'medium' },
    { name: 'Beta', value: 0.85, status: 'good' }
  ];

  return (
    <div className="space-y-6">
      {/* Safe Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SafePortfolioCard
          title="Paper Portfolio Value"
          value={safePortfolioValue}
          isPaperTrading={true}
          icon={<Wallet className="w-8 h-8 text-blue-400" />}
        />

        <SafePortfolioCard
          title="Available Paper Balance"
          value={safeBalance}
          isPaperTrading={true}
          icon={<DollarSign className="w-8 h-8 text-green-400" />}
        />

        <SafePortfolioCard
          title="Paper P&L"
          value={safePnL}
          isPaperTrading={true}
          icon={safePnL >= 0 ? 
            <TrendingUp className="w-8 h-8 text-green-400" /> : 
            <TrendingDown className="w-8 h-8 text-red-400" />
          }
        />

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white/60 text-sm">Paper P&L %</p>
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    PAPER
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    safePnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {safePnLPercentage >= 0 ? '+' : ''}
                    {safePnLPercentage.toFixed(2)}%
                  </p>
                  <Badge
                    variant={safePnLPercentage >= 0 ? "default" : "destructive"}
                    className={`${
                      safePnLPercentage >= 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {safePnLPercentage >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    Paper
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts with Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="space-x-6">
        <ResizablePanel defaultSize={60} minSize={40}>
          <Card className="crypto-card-gradient text-white h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Paper Portfolio Performance</CardTitle>
                <div className="flex gap-2">
                  {['1D', '7D', '30D', '90D', '1Y'].map((period) => (
                    <Button key={period} variant="ghost" size="sm">
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin', 'dataMax']} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#portfolioGradient)"
                    />
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="space-y-4 h-full">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={balanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {balanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {balanceData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm text-white/60 flex-1">{entry.name}</span>
                      <span className="text-sm font-medium">${entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metric.value}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-400' :
                          metric.status === 'warning' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
