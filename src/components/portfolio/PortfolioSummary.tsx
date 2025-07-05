import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export const PortfolioSummary = ({ totalValue, totalPnL, totalPnLPercent }: PortfolioSummaryProps) => {
  return (
    <div>
      <div className="text-3xl font-bold mb-2">${totalValue.toLocaleString()}</div>
      <div className={`text-lg mb-6 ${totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnLPercent.toFixed(2)}%)
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
    </div>
  );
};