
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, Plus, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useCryptoHoldings } from "@/hooks/useCryptoHoldings";
import { useEffect, useState } from "react";

const cryptoColors: Record<string, string> = {
  'BTC': '#f7931a',
  'ETH': '#627eea', 
  'SOL': '#9945ff',
  'ADA': '#0033ad',
  'DOT': '#e6007a',
  'LINK': '#2a5ada',
  'UNI': '#ff007a',
  'DOGE': '#c2a633',
  'BNB': '#f3ba2f',
  'MATIC': '#8247e5',
  'Default': '#64748b'
};

export const Portfolio = () => {
  const { currentAccount, accountSummary } = useMultipleAccounts();
  const { holdings, loading: holdingsLoading, refreshHoldings } = useCryptoHoldings(currentAccount?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate portfolio data from real holdings
  const portfolioData = holdings.map(holding => ({
    name: holding.name,
    value: holding.value,
    percentage: holdings.length > 0 ? (holding.value / holdings.reduce((sum, h) => sum + h.value, 0)) * 100 : 0,
    color: cryptoColors[holding.symbol] || cryptoColors.Default
  }));

  // Add cash position if account has remaining balance
  if (currentAccount && currentAccount.balance > 0) {
    const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const cashValue = Math.max(0, currentAccount.balance - totalHoldingsValue);
    if (cashValue > 0) {
      portfolioData.push({
        name: "Cash",
        value: cashValue,
        percentage: (cashValue / (totalHoldingsValue + cashValue)) * 100,
        color: "#10b981"
      });
    }
  }

  const totalValue = currentAccount?.balance || 0;
  const totalPnL = currentAccount?.total_pnl || 0;
  const totalPnLPercent = currentAccount?.total_pnl_percentage || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHoldings();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Show loading state if no current account
  if (!currentAccount) {
    return (
      <div className="space-y-6">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/5 rounded mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-2/3 mx-auto"></div>
              </div>
              <p className="text-white/60 mt-4">Loading portfolio data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Portfolio Overview - {currentAccount.account_name}
            </div>
            <Badge
              variant={totalPnL > 0 ? "default" : "destructive"}
              className={`${
                totalPnL > 0
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {totalPnL > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {totalPnLPercent.toFixed(2)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">${totalValue.toLocaleString()}</div>
              <div className={`text-lg mb-6 ${totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnLPercent.toFixed(2)}%)
              </div>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-3">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.value.toLocaleString()}</div>
                    <div className="text-sm text-white/60">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Holdings
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isRefreshing ? 'Refreshing...' : 'Refresh Holdings'}
              </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-4 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-white/10 rounded w-20 mb-2"></div>
                          <div className="h-3 bg-white/5 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-white/5 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : holdings.length > 0 ? (
              holdings.map((holding, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: cryptoColors[holding.symbol] || cryptoColors.Default }}
                    >
                      {holding.symbol}
                    </div>
                    <div>
                      <div className="font-medium">{holding.name}</div>
                      <div className="text-sm text-white/60">{holding.amount.toFixed(6)} {holding.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold">${holding.value.toLocaleString()}</div>
                    <div className="text-sm text-white/60">Avg: ${holding.avgBuyPrice.toFixed(2)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${holding.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.pnl > 0 ? '+' : ''}${holding.pnl.toFixed(2)}
                    </div>
                    <div className={`text-sm ${holding.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.pnlPercentage > 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-white/60 mb-2">No holdings found</div>
                <div className="text-sm text-white/40">
                  Start trading to see your positions here
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
