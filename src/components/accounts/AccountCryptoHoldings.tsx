import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCryptoHoldings } from "@/hooks/useCryptoHoldings";
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart } from "lucide-react";

interface AccountCryptoHoldingsProps {
  accountId: string;
  accountName: string;
}

export const AccountCryptoHoldings = ({ accountId, accountName }: AccountCryptoHoldingsProps) => {
  const { holdings, loading } = useCryptoHoldings(accountId);

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {accountName} - Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalPnLPercentage = holdings.length > 0 
    ? holdings.reduce((sum, holding) => sum + holding.pnlPercentage, 0) / holdings.length 
    : 0;

  if (holdings.length === 0) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {accountName} - Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/60">
            <PieChart className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No crypto holdings in this account.</p>
            <p className="text-sm mt-2">Start trading to build your portfolio!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {accountName} - Holdings
          </div>
          <Badge className="bg-blue-500/20 text-blue-400">
            {holdings.length} Assets
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60">Total Value</span>
            </div>
            <div className="text-xl font-bold">${totalValue.toLocaleString()}</div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-crypto-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-crypto-danger" />
              )}
              <span className="text-sm text-white/60">Total P&L</span>
            </div>
            <div className={`text-xl font-bold ${totalPnL >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/60">Avg P&L %</span>
            </div>
            <div className={`text-xl font-bold ${totalPnLPercentage >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
              {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Holdings List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Individual Holdings</h4>
          {holdings.map((holding) => {
            const portfolioPercentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
            
            return (
              <Card key={holding.symbol} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {holding.symbol[0]}
                      </div>
                      <div>
                        <div className="font-medium">{holding.name}</div>
                        <div className="text-sm text-white/60">{holding.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${holding.value.toLocaleString()}</div>
                      <Badge
                        variant={holding.pnl >= 0 ? "default" : "destructive"}
                        className={`${
                          holding.pnl >= 0
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Amount:</span>
                      <div className="font-medium">{holding.amount.toFixed(6)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Avg Buy:</span>
                      <div className="font-medium">${holding.avgBuyPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Invested:</span>
                      <div className="font-medium">${holding.totalInvested.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">P&L %:</span>
                      <div className={`font-medium ${holding.pnlPercentage >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                        {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Portfolio Allocation</span>
                      <span>{portfolioPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={portfolioPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};