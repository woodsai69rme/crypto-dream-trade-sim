import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const PortfolioDashboard = () => {
  const { portfolio, paperAccount, loading } = useRealTimePortfolio();

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

  const balanceData = paperAccount ? [
    { name: 'Current Balance', value: paperAccount.balance },
    { name: 'P&L', value: Math.abs(paperAccount.total_pnl) }
  ] : [];

  const performanceData = [
    { time: '1D', value: portfolio?.total_value || 0 },
    { time: '7D', value: (portfolio?.total_value || 0) * 0.98 },
    { time: '30D', value: (portfolio?.total_value || 0) * 1.05 },
    { time: '90D', value: (portfolio?.total_value || 0) * 1.12 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold">
                  ${portfolio?.total_value?.toLocaleString() || '0'}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">
                  ${paperAccount?.balance?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  (paperAccount?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(paperAccount?.total_pnl || 0) >= 0 ? '+' : ''}
                  ${paperAccount?.total_pnl?.toFixed(2) || '0.00'}
                </p>
              </div>
              {(paperAccount?.total_pnl || 0) >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">P&L Percentage</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    (paperAccount?.total_pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(paperAccount?.total_pnl_percentage || 0) >= 0 ? '+' : ''}
                    {paperAccount?.total_pnl_percentage?.toFixed(2) || '0.00'}%
                  </p>
                  <Badge
                    variant={(paperAccount?.total_pnl_percentage || 0) >= 0 ? "default" : "destructive"}
                    className={`${
                      (paperAccount?.total_pnl_percentage || 0) >= 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {(paperAccount?.total_pnl_percentage || 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Balance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={balanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {balanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {balanceData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-white/60">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};