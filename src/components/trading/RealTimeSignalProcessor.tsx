
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAIEnsembleTrading } from '@/hooks/useAIEnsembleTrading';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export const RealTimeSignalProcessor = () => {
  const { 
    bots, 
    signals, 
    marketConditions, 
    loading, 
    ensembleActive, 
    startEnsemble, 
    stopEnsemble 
  } = useAIEnsembleTrading();
  
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const [processedSignals, setProcessedSignals] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    if (signals.length > 0) {
      setProcessedSignals(signals.length);
      const successful = signals.filter(signal => signal.confidence > 75).length;
      setSuccessRate((successful / signals.length) * 100);
    }
  }, [signals]);

  const executeSignal = async (signal: any) => {
    if (!currentAccount) return;

    const success = await executeTrade({
      symbol: signal.symbol,
      side: signal.side,
      amount: signal.amount,
      price: signal.price,
      type: 'market'
    });

    if (success) {
      console.log('Signal executed successfully:', signal);
    }
  };

  const getMarketTrend = () => {
    switch (marketConditions.trend) {
      case 'bullish':
        return { icon: TrendingUp, color: 'text-green-500', label: 'Bullish' };
      case 'bearish':
        return { icon: TrendingDown, color: 'text-red-500', label: 'Bearish' };
      default:
        return { icon: Activity, color: 'text-yellow-500', label: 'Sideways' };
    }
  };

  const trend = getMarketTrend();
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-Time Signal Processor
            <Badge className={ensembleActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
              {ensembleActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Panel */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-medium">Ensemble Processing</h3>
              <p className="text-sm text-white/60">
                {ensembleActive ? 'Processing signals from AI ensemble' : 'Signal processing is paused'}
              </p>
            </div>
            <Button
              onClick={ensembleActive ? stopEnsemble : startEnsemble}
              variant={ensembleActive ? "destructive" : "default"}
            >
              {ensembleActive ? 'Stop Processing' : 'Start Processing'}
            </Button>
          </div>

          {/* Market Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                <span className="text-sm font-medium">Market Trend</span>
              </div>
              <div className={`text-lg font-bold ${trend.color}`}>
                {trend.label}
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-sm font-medium text-white/60 mb-2">Volatility</div>
              <div className="text-lg font-bold">
                {(marketConditions.volatility * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-sm font-medium text-white/60 mb-2">Volume</div>
              <div className="text-lg font-bold">
                ${(marketConditions.volume / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>

          {/* Processing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{bots.filter(b => b.status === 'active').length}</div>
              <div className="text-sm text-white/60">Active Bots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{processedSignals}</div>
              <div className="text-sm text-white/60">Signals Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{successRate.toFixed(1)}%</div>
              <div className="text-sm text-white/60">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{signals.length}</div>
              <div className="text-sm text-white/60">Pending Signals</div>
            </div>
          </div>

          {/* Recent Signals */}
          {signals.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Recent Signals</h3>
              {signals.slice(0, 5).map((signal) => (
                <div key={signal.timestamp} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={signal.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {signal.side.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{signal.symbol}</span>
                    <span className="text-white/60">${signal.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {signal.confidence.toFixed(0)}%
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => executeSignal(signal)}
                      disabled={!currentAccount}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Signals Message */}
          {signals.length === 0 && ensembleActive && (
            <div className="text-center py-8 text-white/60">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p>No signals detected</p>
              <p className="text-sm mt-2">AI ensemble is analyzing market conditions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
