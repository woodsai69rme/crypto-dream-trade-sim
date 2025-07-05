
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  created_at: string;
  status?: string;
}

interface TradeTooltipProps {
  trades: Trade[];
  isVisible: boolean;
  position: { x: number; y: number };
  onFollow?: (trade: Trade) => void;
}

export const TradeTooltip = ({ trades, isVisible, position, onFollow }: TradeTooltipProps) => {
  if (!isVisible || trades.length === 0) return null;

  const recentTrades = trades.slice(0, 5);

  return (
    <div 
      className="fixed z-50 pointer-events-auto"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <Card className="crypto-card-gradient text-white border-white/20 shadow-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h4 className="font-medium">Live Trading Feed</h4>
            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
          </div>
          
          <div className="space-y-2 max-w-xs">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="p-2 bg-white/5 rounded border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{trade.symbol}</span>
                    <Badge className={
                      trade.side === 'buy' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }>
                      {trade.side === 'buy' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {trade.side.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs text-white/60">
                    {formatDistanceToNow(new Date(trade.created_at))} ago
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>${trade.price.toLocaleString()}</span>
                  </div>
                  <span className="text-white/60">
                    {trade.amount} {trade.symbol}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium">
                    Total: ${Math.abs(trade.total_value).toLocaleString()}
                  </span>
                  {onFollow && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => onFollow(trade)}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t border-white/10 text-xs text-white/60">
            Hover over trades to see details • Click to follow signals
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
