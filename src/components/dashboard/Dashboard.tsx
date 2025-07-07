import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { useRealtimeMarketData } from "@/hooks/useRealtimeMarketData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, TrendingDown, Users, Activity, DollarSign } from "lucide-react";

export const Dashboard = () => {
  const { currentAccount, accounts } = useMultipleAccounts();
  const { paperAccount, loading: portfolioLoading } = useRealTimePortfolio();
  const { getPrice } = useRealtimeMarketData(['BTC', 'ETH', 'DOGE', 'SOL', 'ADA']);

  // Mock performance data
  const performanceData = [
    { date: 'Mon', value: paperAccount?.balance || 100000 },
    { date: 'Tue', value: (paperAccount?.balance || 100000) * 1.02 },
    { date: 'Wed', value: (paperAccount?.balance || 100000) * 0.98 },
    { date: 'Thu', value: (paperAccount?.balance || 100000) * 1.05 },
    { date: 'Fri', value: (paperAccount?.balance || 100000) * 1.03 },
    { date: 'Sat', value: (paperAccount?.balance || 100000) * 1.08 },
    { date: 'Sun', value: (paperAccount?.balance || 100000) * 1.12 },
  ];

  if (portfolioLoading) {
    return <div className="flex items-center justify-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(paperAccount?.balance || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {paperAccount?.total_pnl >= 0 ? '+' : ''}${paperAccount?.total_pnl.toFixed(2)} today
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Paper trading accounts
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Today</CardTitle>
            {paperAccount?.total_pnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-crypto-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-crypto-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${paperAccount?.total_pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
              {paperAccount?.total_pnl >= 0 ? '+' : ''}${paperAccount?.total_pnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paperAccount?.total_pnl_percentage.toFixed(2)}% change
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle>Portfolio Performance (7 Days)</CardTitle>
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--crypto-success))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--crypto-success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Market Overview & Account Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { symbol: 'BTC', name: 'Bitcoin', price: getPrice('BTC') },
                { symbol: 'ETH', name: 'Ethereum', price: getPrice('ETH') },
                { symbol: 'SOL', name: 'Solana', price: getPrice('SOL') },
                { symbol: 'ADA', name: 'Cardano', price: getPrice('ADA') },
                { symbol: 'DOGE', name: 'Dogecoin', price: getPrice('DOGE') },
              ].map((crypto) => (
                <div key={crypto.symbol} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{crypto.name}</span>
                    <span className="text-muted-foreground ml-2">({crypto.symbol})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${crypto.price.toLocaleString()}</div>
                    <Badge variant="secondary" className="text-xs">
                      +2.4%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader>
            <CardTitle>Current Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            {currentAccount ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{currentAccount.account_name}</span>
                  <Badge variant="secondary">{currentAccount.account_type}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-xl font-bold">${currentAccount.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <Badge variant="outline">{currentAccount.risk_level}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P&L</p>
                    <p className={`text-lg font-bold ${currentAccount.total_pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                      {currentAccount.total_pnl >= 0 ? '+' : ''}${currentAccount.total_pnl.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <p className={`text-lg font-bold ${currentAccount.total_pnl_percentage >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                      {currentAccount.total_pnl_percentage >= 0 ? '+' : ''}{currentAccount.total_pnl_percentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active account selected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};