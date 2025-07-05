
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Copy } from "lucide-react";

export interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  source: string;
  timestamp: string;
}

interface TradeSignalProps {
  signal: TradeSignal;
  trades: any[];
  onFollow: (signal: TradeSignal) => void;
  minConfidence: number;
}

export const TradeSignalCard = ({ signal, trades, onFollow, minConfidence }: TradeSignalProps) => {
  return (
    <div className="p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={signal.side === "buy" ? "default" : "destructive"}
            className={`${
              signal.side === "buy"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {signal.side === "buy" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {signal.side.toUpperCase()}
          </Badge>
          <span className="font-medium">{signal.symbol}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onFollow(signal)}
          disabled={signal.confidence < minConfidence}
          className="text-xs hover:bg-blue-500/20"
        >
          <Copy className="w-3 h-3 mr-1" />
          Follow
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-white/60">Price:</span>
          <br />
          <span>${signal.price.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-white/60">Amount:</span>
          <br />
          <span>{signal.amount.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-white/60">Confidence:</span>
          <br />
          <Badge 
            variant="outline" 
            className={`text-xs ${
              signal.confidence >= 80 ? 'border-green-500/30 text-green-400' :
              signal.confidence >= 60 ? 'border-yellow-500/30 text-yellow-400' :
              'border-red-500/30 text-red-400'
            }`}
          >
            {signal.confidence.toFixed(0)}%
          </Badge>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-white/50">
        Source: {signal.source} • {new Date(signal.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};
