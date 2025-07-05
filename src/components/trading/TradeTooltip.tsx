
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  created_at: string;
}

interface TradeTooltipProps {
  trades: Trade[];
  children: React.ReactNode;
}

export const TradeTooltip = ({ trades, children }: TradeTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const recentTrades = trades.slice(0, 5);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      
      {showTooltip && recentTrades.length > 0 && (
        <Card className="absolute z-50 top-full left-0 mt-2 w-80 bg-gray-900/95 border-gray-700 shadow-xl">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Last 5 Trades</h4>
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={trade.side === "buy" ? "default" : "destructive"}
                      className={`text-xs ${
                        trade.side === "buy"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {trade.side === "buy" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {trade.side.toUpperCase()}
                    </Badge>
                    <span className="text-white text-sm">{trade.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">${trade.price.toLocaleString()}</div>
                    <div className="text-white/60 text-xs">
                      {formatDistanceToNow(new Date(trade.created_at))} ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
