import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCryptoHoldings } from "@/hooks/useCryptoHoldings";
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";

interface CryptoHoldingsCardProps {
  accountId: string;
}

export const CryptoHoldingsCard = ({ accountId }: CryptoHoldingsCardProps) => {
  const { holdings, loading, refreshHoldings } = useCryptoHoldings(accountId);

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalPnLPercentage = holdings.reduce((sum, holding) => sum + holding.totalInvested, 0) > 0 
    ? (totalPnL / holdings.reduce((sum, holding) => sum + holding.totalInvested, 0)) * 100 
    : 0;

  return (
    <Card className="crypto-card-gradient text-primary-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Crypto Holdings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshHoldings}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-card/20 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </p>
            <p className={`text-xs ${totalPnLPercentage >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
              {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Individual Holdings */}
        <div className="space-y-2">
          {holdings.length > 0 ? (
            holdings.map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between p-2 bg-card/10 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{holding.symbol}</span>
                    <span className="text-xs text-muted-foreground">{holding.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {holding.amount.toFixed(6)} @ ${holding.avgBuyPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${holding.value.toFixed(2)}</div>
                  <div className={`text-xs flex items-center gap-1 ${
                    holding.pnlPercentage >= 0 ? 'text-crypto-success' : 'text-crypto-danger'
                  }`}>
                    {holding.pnlPercentage >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No crypto holdings yet</p>
              <p className="text-xs">Start trading to see your positions here</p>
            </div>
          )}
        </div>

        {/* Allocation Chart */}
        {holdings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Allocation</h4>
            {holdings.map((holding) => {
              const percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
              return (
                <div key={holding.symbol} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{holding.symbol}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-1" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};