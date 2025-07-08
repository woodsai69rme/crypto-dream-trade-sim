
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, User } from "lucide-react";

export interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  source: string;
  timestamp: string;
  reasoning?: string;
}

export interface TradeSignalProps {
  signal: TradeSignal;
  autoExecute?: boolean;
  onExecute?: (signal: TradeSignal) => Promise<void>;
}

export const TradeSignalCard = ({ signal, autoExecute = false, onExecute }: TradeSignalProps) => {
  const handleExecute = async () => {
    if (onExecute) {
      await onExecute(signal);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500/20 text-green-400';
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const signalTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - signalTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <Card className="crypto-card-gradient text-white border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {signal.side === 'buy' ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="font-medium text-lg">{signal.symbol}</span>
            <Badge className={getSideColor(signal.side)}>
              {signal.side.toUpperCase()}
            </Badge>
          </div>
          <Badge className={getConfidenceColor(signal.confidence)}>
            {signal.confidence.toFixed(0)}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-sm text-white/60">Price</div>
            <div className="font-medium">${signal.price.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Amount</div>
            <div className="font-medium">{signal.amount.toFixed(4)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User className="w-3 h-3" />
            <span>{signal.source}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(signal.timestamp)}</span>
          </div>
        </div>

        {signal.reasoning && (
          <div className="mb-3">
            <div className="text-sm text-white/60 mb-1">Reasoning</div>
            <div className="text-sm text-white/80 bg-white/5 p-2 rounded">
              {signal.reasoning}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-white/60">
            Value: ${(signal.price * signal.amount).toLocaleString()}
          </div>
          {!autoExecute && onExecute && (
            <Button
              size="sm"
              onClick={handleExecute}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Execute Trade
            </Button>
          )}
          {autoExecute && (
            <Badge className="bg-blue-500/20 text-blue-400">
              Auto-Executing
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
