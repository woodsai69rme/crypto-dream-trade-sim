import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const TradingHistory = () => {
  const { trades, loading } = useRealTimePortfolio();

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Loading Trading History...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trades.length) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Trading History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-white/60">No trades yet. Start trading to see your history!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Trading History
          <Badge className="bg-white/10 text-white">
            {trades.length} trades
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {trades.map((trade) => (
            <div 
              key={trade.id} 
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={trade.side === "buy" ? "default" : "destructive"}
                    className={`${
                      trade.side === "buy"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {trade.side === "buy" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {trade.side.toUpperCase()}
                  </Badge>
                  <span className="font-semibold text-lg">{trade.symbol}</span>
                </div>
                <Badge
                  variant={trade.status === "completed" ? "default" : "secondary"}
                  className={trade.status === "completed" ? "bg-green-500/20 text-green-400" : ""}
                >
                  {trade.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Amount</p>
                  <p className="font-medium">{trade.amount}</p>
                </div>
                <div>
                  <p className="text-white/60">Price</p>
                  <p className="font-medium">${trade.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/60">Total Value</p>
                  <p className="font-medium">${trade.total_value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/60">Fee</p>
                  <p className="font-medium">${trade.fee.toFixed(2)}</p>
                </div>
              </div>
              
              {trade.reasoning && (
                <div className="mt-3 p-3 bg-white/5 rounded">
                  <p className="text-white/60 text-xs mb-1">Trade Reasoning:</p>
                  <p className="text-sm">{trade.reasoning}</p>
                </div>
              )}
              
              <div className="mt-3 flex justify-between items-center text-xs text-white/50">
                <span>Trade ID: {trade.id.slice(0, 8)}...</span>
                <span>{formatDistanceToNow(new Date(trade.created_at))} ago</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};