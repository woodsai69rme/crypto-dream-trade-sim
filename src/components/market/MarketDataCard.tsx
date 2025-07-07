
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface MarketDataCardProps {
  symbol: string;
  name: string;
  price_usd: number;
  change_percentage_24h: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  onTrade?: (symbol: string) => void;
}

export const MarketDataCard = ({ 
  symbol, 
  name, 
  price_usd, 
  change_percentage_24h, 
  market_cap_usd, 
  volume_24h_usd,
  onTrade 
}: MarketDataCardProps) => {
  const isPositive = change_percentage_24h >= 0;
  
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card className="crypto-card-gradient text-primary-foreground hover:scale-105 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-crypto-bitcoin to-crypto-ethereum flex items-center justify-center">
              <span className="text-xs font-bold text-white">{name}</span>
            </div>
            <div>
              <CardTitle className="text-sm">{symbol.toUpperCase()}</CardTitle>
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
          </div>
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className={`${isPositive ? 'bg-crypto-success' : 'bg-crypto-danger'}`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(change_percentage_24h).toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold">{formatCurrency(price_usd)}</div>
          <div className={`text-sm ${isPositive ? 'text-crypto-success' : 'text-crypto-danger'}`}>
            {isPositive ? '+' : ''}{change_percentage_24h.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Market Cap</span>
            <div className="font-semibold">{formatCurrency(market_cap_usd)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Volume 24h</span>
            <div className="font-semibold">{formatCurrency(volume_24h_usd)}</div>
          </div>
        </div>

        {onTrade && (
          <Button
            onClick={() => onTrade(symbol)}
            size="sm"
            className="w-full bg-crypto-info hover:bg-crypto-info/80"
          >
            Trade {name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
