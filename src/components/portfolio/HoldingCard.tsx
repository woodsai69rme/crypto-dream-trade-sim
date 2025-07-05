import { memo } from 'react';

interface Holding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  avgPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface HoldingCardProps {
  holding: Holding;
}

export const HoldingCard = memo(({ holding }: HoldingCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center font-bold">
          {holding.symbol}
        </div>
        <div>
          <div className="font-medium">{holding.name}</div>
          <div className="text-sm text-white/60">{holding.amount} {holding.symbol}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold">${holding.value.toLocaleString()}</div>
        <div className="text-sm text-white/60">Avg: ${holding.avgPrice}</div>
      </div>
      
      <div className="text-right">
        <div className={`font-bold ${holding.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {holding.pnl > 0 ? '+' : ''}${holding.pnl.toFixed(2)}
        </div>
        <div className={`text-sm ${holding.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {holding.pnlPercent > 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
});

HoldingCard.displayName = 'HoldingCard';