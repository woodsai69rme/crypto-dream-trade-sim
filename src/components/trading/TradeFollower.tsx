
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRealTimePortfolio } from '@/hooks/useRealTimePortfolio';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { TradeTooltip } from './TradeTooltip';
import { Users, Copy, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  source: string;
  timestamp: string;
}

export const TradeFollower = () => {
  const { trades } = useRealTimePortfolio();
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const [isFollowing, setIsFollowing] = useState(false);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [followSettings, setFollowSettings] = useState({
    minConfidence: 70,
    maxPositionSize: 1000,
    autoExecute: false
  });

  // Simulate incoming trade signals
  useEffect(() => {
    if (!isFollowing) return;

    const interval = setInterval(() => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA'];
      const newSignal: TradeSignal = {
        id: Date.now().toString(),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        price: 50000 + Math.random() * 20000,
        amount: Math.random() * 0.1,
        confidence: 60 + Math.random() * 40,
        source: 'AI Analysis',
        timestamp: new Date().toISOString()
      };

      setSignals(prev => [newSignal, ...prev.slice(0, 9)]); // Keep last 10 signals

      // Auto-execute if enabled and confidence is high enough
      if (followSettings.autoExecute && newSignal.confidence >= followSettings.minConfidence) {
        handleFollowTrade(newSignal);
      }
    }, 15000); // New signal every 15 seconds

    return () => clearInterval(interval);
  }, [isFollowing, followSettings]);

  const handleFollowTrade = async (signal: TradeSignal) => {
    if (!currentAccount) return;

    const success = await executeTrade({
      symbol: signal.symbol,
      side: signal.side,
      amount: Math.min(signal.amount, followSettings.maxPositionSize / signal.price),
      price: signal.price,
      type: 'market'
    });

    if (success) {
      console.log('Trade followed successfully:', signal);
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Trade Following System
          <Badge className={`ml-auto ${isFollowing ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {isFollowing ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
          <span>Enable Trade Following</span>
          <Switch checked={isFollowing} onCheckedChange={setIsFollowing} />
        </div>

        {isFollowing && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Min Confidence:</span>
                <span className="font-medium">{followSettings.minConfidence}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Max Position Size:</span>
                <span className="font-medium">${followSettings.maxPositionSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Execute:</span>
                <Switch 
                  checked={followSettings.autoExecute} 
                  onCheckedChange={(checked) => setFollowSettings(prev => ({ ...prev, autoExecute: checked }))} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                Recent Signals
                <Badge variant="outline" className="text-xs">
                  {signals.length}
                </Badge>
              </h4>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {signals.map((signal) => (
                  <div key={signal.id} className="p-3 bg-white/5 rounded border border-white/10">
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
                      <TradeTooltip trades={trades}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollowTrade(signal)}
                          disabled={signal.confidence < followSettings.minConfidence}
                          className="text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                      </TradeTooltip>
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
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
