import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface DataPoint {
  id: string;
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: Date;
}

export const RealTimeDataFeed = () => {
  const [dataFeed, setDataFeed] = useState<DataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Simulate real-time data feed
    const generateDataPoint = (): DataPoint => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'MATIC'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      return {
        id: `${symbol}-${Date.now()}`,
        symbol,
        price: 50000 + Math.random() * 50000,
        change: (Math.random() - 0.5) * 10,
        volume: 1000000 + Math.random() * 5000000,
        timestamp: new Date()
      };
    };

    const interval = setInterval(() => {
      const newDataPoint = generateDataPoint();
      setDataFeed(prev => [newDataPoint, ...prev.slice(0, 19)]); // Keep last 20 updates
    }, 2000);

    // Simulate occasional connection issues
    const connectionCheck = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, []);

  return (
    <Card className="crypto-card-gradient text-white h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Market Feed
          </div>
          <Badge className={isConnected ? 
            'bg-green-500/20 text-green-400 border-green-500/30' : 
            'bg-red-500/20 text-red-400 border-red-500/30'
          }>
            <Zap className="w-3 h-3 mr-1" />
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-72 overflow-y-auto scrollbar-hide">
          {dataFeed.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Waiting for market data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {dataFeed.map((data, index) => (
                <div 
                  key={data.id}
                  className={`flex items-center justify-between p-2 rounded text-sm transition-all duration-300 ${
                    index === 0 ? 'bg-white/20 scale-105' : 'bg-white/5'
                  }`}
                  style={{
                    animation: index === 0 ? 'fadeIn 0.3s ease-out' : undefined
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {data.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{data.symbol}</div>
                      <div className="text-xs text-white/60">
                        Vol: {(data.volume / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">
                      ${data.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${
                      data.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                    </div>
                  </div>

                  <div className="text-xs text-white/40">
                    {data.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </Card>
  );
};