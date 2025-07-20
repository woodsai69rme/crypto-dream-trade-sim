import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingSignal {
  id: string;
  symbol: string;
  signal_type: 'buy' | 'sell' | 'hold';
  strength: number;
  confidence: number;
  price_target: number;
  stop_loss: number;
  time_horizon: string;
  source: string;
  created_at: string;
  status: 'active' | 'executed' | 'expired';
}

interface RiskMetrics {
  portfolio_risk: number;
  position_concentration: number;
  correlation_risk: number;
  volatility_score: number;
  max_drawdown: number;
}

export const RealTimeSignalProcessor: React.FC = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [autoExecute, setAutoExecute] = useState(false);
  const { toast } = useToast();

  // Generate mock signals for demo
  useEffect(() => {
    const generateSignals = () => {
      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
      const sources = ['Technical Analysis', 'AI Model', 'News Sentiment', 'Options Flow'];
      
      const mockSignals: TradingSignal[] = symbols.map((symbol, index) => ({
        id: `signal_${index}`,
        symbol,
        signal_type: Math.random() > 0.5 ? 'buy' : 'sell',
        strength: Math.floor(Math.random() * 100),
        confidence: Math.floor(Math.random() * 100),
        price_target: 50000 + Math.random() * 10000,
        stop_loss: 45000 + Math.random() * 5000,
        time_horizon: ['1H', '4H', '1D', '1W'][Math.floor(Math.random() * 4)],
        source: sources[Math.floor(Math.random() * sources.length)],
        created_at: new Date().toISOString(),
        status: ['active', 'executed', 'expired'][Math.floor(Math.random() * 3)] as any
      }));

      setSignals(mockSignals);
    };

    const generateRiskMetrics = () => {
      setRiskMetrics({
        portfolio_risk: Math.floor(Math.random() * 100),
        position_concentration: Math.floor(Math.random() * 100),
        correlation_risk: Math.floor(Math.random() * 100),
        volatility_score: Math.floor(Math.random() * 100),
        max_drawdown: Math.floor(Math.random() * 20)
      });
    };

    generateSignals();
    generateRiskMetrics();

    // Update every 30 seconds
    const interval = setInterval(() => {
      generateSignals();
      generateRiskMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const executeSignal = async (signal: TradingSignal) => {
    setProcessingStatus('processing');
    
    try {
      // Simulate signal execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSignals(prev => prev.map(s => 
        s.id === signal.id 
          ? { ...s, status: 'executed' as const }
          : s
      ));

      toast({
        title: "Signal Executed",
        description: `${signal.signal_type.toUpperCase()} signal for ${signal.symbol} executed successfully`,
      });
    } catch (error) {
      setProcessingStatus('error');
      toast({
        title: "Execution Error",
        description: "Failed to execute trading signal",
        variant: "destructive",
      });
    } finally {
      setProcessingStatus('idle');
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return 'text-green-500';
    if (risk <= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Signals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Trading Signals
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={processingStatus === 'processing' ? 'default' : 'secondary'}>
                {processingStatus === 'processing' ? 'Processing' : 'Active'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoExecute(!autoExecute)}
              >
                Auto-Execute: {autoExecute ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signals.map((signal) => (
              <div key={signal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getSignalIcon(signal.signal_type)}
                    <div>
                      <h4 className="font-medium">{signal.symbol}</h4>
                      <p className="text-sm text-muted-foreground">{signal.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={signal.status === 'active' ? 'default' : 'secondary'}>
                      {signal.status}
                    </Badge>
                    {signal.status === 'active' && (
                      <Button 
                        size="sm" 
                        onClick={() => executeSignal(signal)}
                        disabled={processingStatus === 'processing'}
                      >
                        Execute
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Signal Strength</div>
                    <div className={`font-medium ${getStrengthColor(signal.strength)}`}>
                      {signal.strength}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Confidence</div>
                    <div className="font-medium">{signal.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Target Price</div>
                    <div className="font-medium">${signal.price_target.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Time Horizon</div>
                    <div className="font-medium">{signal.time_horizon}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Confidence Level</span>
                    <span>{signal.confidence}%</span>
                  </div>
                  <Progress value={signal.confidence} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Monitoring */}
      {riskMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Real-Time Risk Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(riskMetrics).map(([key, value]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">
                      {key.replace('_', ' ')}
                    </h4>
                    <span className={`font-bold ${getRiskColor(value)}`}>
                      {key === 'max_drawdown' ? `${value}%` : `${value}/100`}
                    </span>
                  </div>
                  <Progress 
                    value={value} 
                    className={`h-2 ${value > 70 ? 'bg-red-100' : value > 40 ? 'bg-yellow-100' : 'bg-green-100'}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {value <= 30 ? 'Low Risk' : value <= 70 ? 'Medium Risk' : 'High Risk'}
                  </p>
                </div>
              ))}
            </div>

            {riskMetrics.portfolio_risk > 80 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High portfolio risk detected. Consider reducing position sizes or implementing hedging strategies.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Signal Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">78%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">2.4x</div>
              <div className="text-sm text-muted-foreground">Profit Factor</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Signals Today</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">1.2s</div>
              <div className="text-sm text-muted-foreground">Avg Execution</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};