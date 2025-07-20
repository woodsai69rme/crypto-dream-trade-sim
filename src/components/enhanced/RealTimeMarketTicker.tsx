
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTickerData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  lastUpdate: string;
}

const MOCK_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'];

export const RealTimeMarketTicker = () => {
  const [marketData, setMarketData] = useState<MarketTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock WebSocket connection for demo
  useEffect(() => {
    const generateRealisticData = () => {
      const baseData = {
        'BTC': { basePrice: 102500, symbol: 'BTC' },
        'ETH': { basePrice: 3750, symbol: 'ETH' },
        'SOL': { basePrice: 195, symbol: 'SOL' },
        'ADA': { basePrice: 0.89, symbol: 'ADA' },
        'DOT': { basePrice: 8.5, symbol: 'DOT' },
        'LINK': { basePrice: 23.4, symbol: 'LINK' }
      };

      return Object.values(baseData).map(({ basePrice, symbol }) => {
        const changePercent = (Math.random() - 0.5) * 8; // -4% to +4%
        const currentPrice = basePrice * (1 + changePercent / 100);
        const change24h = basePrice * (changePercent / 100);
        
        return {
          symbol,
          price: currentPrice,
          change24h,
          changePercent24h: changePercent,
          volume24h: Math.random() * (symbol === 'BTC' ? 50000000000 : 5000000000),
          lastUpdate: new Date().toISOString()
        };
      });
    };

    // Initial load
    setMarketData(generateRealisticData());
    setIsLoading(false);

    // Update every 3 seconds with realistic price movements
    const interval = setInterval(() => {
      setMarketData(generateRealisticData());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Market Ticker</h3>
        <Badge variant="outline" className="text-xs">
          Live
          <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {marketData.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{item.symbol.charAt(0)}</span>
              </div>
              <div>
                <div className="font-medium">{item.symbol}</div>
                <div className="text-sm text-muted-foreground">
                  ${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`flex items-center gap-1 ${
                item.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.changePercent24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {item.changePercent24h >= 0 ? '+' : ''}
                  {item.changePercent24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                ${Math.abs(item.change24h).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
