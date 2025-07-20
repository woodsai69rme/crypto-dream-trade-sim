
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  timestamp: string;
  source: string;
  reasoning: string;
}

export const TradeSignal = ({ signal }: { signal: TradeSignal }) => {
  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded ${
            signal.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {signal.side.toUpperCase()}
          </span>
          <span className="font-medium">{signal.symbol}</span>
        </div>
        <span className="text-sm text-white/60">{signal.confidence.toFixed(1)}%</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/60">Price</div>
          <div className="font-medium">${signal.price.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-white/60">Amount</div>
          <div className="font-medium">{signal.amount.toFixed(4)}</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-white/60">
        {signal.reasoning}
      </div>
    </div>
  );
};

export const TradeSignalCard = ({ 
  signal, 
  onExecute, 
  autoExecute = false 
}: { 
  signal: TradeSignal; 
  onExecute: (signal: TradeSignal) => void;
  autoExecute?: boolean;
}) => {
  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={`${
            signal.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {signal.side.toUpperCase()}
          </Badge>
          <span className="font-medium text-white">{signal.symbol}</span>
          <Badge variant="outline" className="text-xs">
            {signal.confidence.toFixed(1)}% confidence
          </Badge>
        </div>
        <div className="text-xs text-white/60">
          {new Date(signal.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <div className="text-white/60">Price</div>
          <div className="font-medium text-white">${signal.price.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-white/60">Amount</div>
          <div className="font-medium text-white">{signal.amount.toFixed(4)}</div>
        </div>
      </div>
      
      <div className="mb-3 text-xs text-white/60">
        <strong>Source:</strong> {signal.source} | <strong>Reasoning:</strong> {signal.reasoning}
      </div>

      <div className="flex items-center justify-between">
        {autoExecute ? (
          <Badge className="bg-blue-500/20 text-blue-400">
            Auto-executing across accounts...
          </Badge>
        ) : (
          <Button 
            size="sm" 
            onClick={() => onExecute(signal)}
            className={`${
              signal.side === 'buy' 
                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' 
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
            }`}
          >
            Execute Trade
          </Button>
        )}
        <div className="text-xs text-white/60">
          Value: ${(signal.price * signal.amount).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
