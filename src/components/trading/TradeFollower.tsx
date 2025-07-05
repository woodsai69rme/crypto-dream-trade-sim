
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRealTimePortfolio } from '@/hooks/useRealTimePortfolio';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { TradeTooltip } from './TradeTooltip';
import { Users, Copy, TrendingUp, TrendingDown, Settings } from 'lucide-react';

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

  // Simulate incoming trade signals with real market movements
  useEffect(() => {
    if (!isFollowing) return;

    const interval = setInterval(() => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'];
      const sides: ('buy' | 'sell')[] = ['buy', 'sell'];
      
      const newSignal: TradeSignal = {
        id: Date.now().toString(),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: sides[Math.floor(Math.random() * sides.length)],
        price: 50000 + Math.random() * 20000,
        amount: 0.01 + Math.random() * 0.1,
        confidence: 60 + Math.random() * 40,
        source: 'AI Analysis',
        timestamp: new Date().toISOString()
      };

      setSignals(prev => [newSignal, ...prev.slice(0, 9)]); // Keep last 10 signals

      // Auto-execute if enabled and confidence is high enough
      if (followSettings.autoExecute && newSignal.confidence >= followSettings.minConfidence) {
        handleFollowTrade(newSignal);
      }
    }, 8000); // New signal every 8 seconds for better real-time feel

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
      // Remove the signal after execution to show it was processed
      setSignals(prev => prev.filter(s => s.id !== signal.id));
    }
  };

  const handleToggleFollowing = (enabled: boolean) => {
    setIsFollowing(enabled);
    if (!enabled) {
      // Clear signals when stopping
      setSignals([]);
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
          <Switch checked={isFollowing} onCheckedChange={handleToggleFollowing} />
        </div>

        {isFollowing && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Min Confidence:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={followSettings.minConfidence}
                    onChange={(e) => setFollowSettings(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
                    className="w-20"
                  />
                  <span className="font-medium w-10">{followSettings.minConfidence}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Max Position Size:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="500"
                    value={followSettings.maxPositionSize}
                    onChange={(e) => setFollowSettings(prev => ({ ...prev, maxPositionSize: parseInt(e.target.value) }))}
                    className="w-20"
                  />
                  <span className="font-medium">${followSettings.maxPositionSize}</span>
                </div>
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
                Live Trading Signals
                <Badge variant="outline" className="text-xs">
                  {signals.length}
                </Badge>
              </h4>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {signals.length === 0 ? (
                  <div className="text-center py-4 text-white/60">
                    Waiting for trading signals...
                  </div>
                ) : (
                  signals.map((signal) => (
                    <div key={signal.id} className="p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
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
                            className="text-xs hover:bg-blue-500/20"
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
                      
                      <div className="mt-2 text-xs text-white/50">
                        Source: {signal.source} • {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {currentAccount && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400">Active Account:</span>
                  <span className="font-medium">{currentAccount.account_name}</span>
                  <span className="text-white/60">• Balance: ${currentAccount.balance.toLocaleString()}</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
