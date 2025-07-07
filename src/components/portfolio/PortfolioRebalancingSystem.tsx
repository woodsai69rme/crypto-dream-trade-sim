
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { Balance, AlertTriangle, Target, Zap, Settings } from 'lucide-react';

interface AssetAllocation {
  symbol: string;
  targetPercentage: number;
  currentPercentage: number;
  currentValue: number;
  deviation: number;
  rebalanceAmount: number;
  action: 'buy' | 'sell' | 'hold';
}

interface RebalanceAlert {
  id: string;
  symbol: string;
  currentDeviation: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
}

export const PortfolioRebalancingSystem = () => {
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [alerts, setAlerts] = useState<RebalanceAlert[]>([]);
  const [autoRebalanceEnabled, setAutoRebalanceEnabled] = useState(false);
  const [rebalanceThreshold, setRebalanceThreshold] = useState(5);
  const [loading, setLoading] = useState(false);
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolioData();
    checkRebalanceAlerts();
  }, [currentAccount]);

  const loadPortfolioData = async () => {
    if (!currentAccount) return;

    // Mock portfolio data - in production this would come from your database
    const mockAllocations: AssetAllocation[] = [
      {
        symbol: 'BTC',
        targetPercentage: 40,
        currentPercentage: 45.2,
        currentValue: 45200,
        deviation: 5.2,
        rebalanceAmount: -5200,
        action: 'sell'
      },
      {
        symbol: 'ETH',
        targetPercentage: 30,
        currentPercentage: 25.8,
        currentValue: 25800,
        deviation: -4.2,
        rebalanceAmount: 4200,
        action: 'buy'
      },
      {
        symbol: 'SOL',
        targetPercentage: 20,
        currentPercentage: 18.5,
        currentValue: 18500,
        deviation: -1.5,
        rebalanceAmount: 1500,
        action: 'buy'
      },
      {
        symbol: 'ADA',
        targetPercentage: 10,
        currentPercentage: 10.5,
        currentValue: 10500,
        deviation: 0.5,
        rebalanceAmount: -500,
        action: 'sell'
      }
    ];

    setAllocations(mockAllocations);
  };

  const checkRebalanceAlerts = () => {
    const newAlerts: RebalanceAlert[] = [];

    allocations.forEach(allocation => {
      const absDeviation = Math.abs(allocation.deviation);
      
      if (absDeviation > rebalanceThreshold) {
        const severity = absDeviation > 10 ? 'high' : absDeviation > 7 ? 'medium' : 'low';
        
        newAlerts.push({
          id: `alert_${allocation.symbol}`,
          symbol: allocation.symbol,
          currentDeviation: allocation.deviation,
          threshold: rebalanceThreshold,
          severity,
          message: `${allocation.symbol} is ${allocation.deviation > 0 ? 'over' : 'under'}weighted by ${absDeviation.toFixed(1)}%`,
          createdAt: new Date().toISOString()
        });
      }
    });

    setAlerts(newAlerts);
  };

  const updateTargetAllocation = (symbol: string, newTarget: number) => {
    setAllocations(prev => prev.map(allocation => 
      allocation.symbol === symbol 
        ? { ...allocation, targetPercentage: newTarget }
        : allocation
    ));
  };

  const executeRebalance = async (symbol?: string) => {
    if (!currentAccount) return;

    setLoading(true);
    try {
      const allocationsToRebalance = symbol 
        ? allocations.filter(a => a.symbol === symbol)
        : allocations.filter(a => Math.abs(a.deviation) > rebalanceThreshold);

      for (const allocation of allocationsToRebalance) {
        if (allocation.action === 'hold') continue;

        const success = await executeTrade({
          symbol: allocation.symbol,
          side: allocation.action,
          amount: Math.abs(allocation.rebalanceAmount) / (allocation.currentValue / allocation.currentPercentage * 100),
          price: allocation.currentValue / (allocation.currentPercentage / 100) / 100, // Mock current price
          type: 'market'
        });

        if (success) {
          toast({
            title: "Rebalance Executed",
            description: `${allocation.action.toUpperCase()} ${allocation.symbol} completed`,
          });
        }
      }

      // Refresh data after rebalancing
      await loadPortfolioData();
      checkRebalanceAlerts();
    } catch (error) {
      toast({
        title: "Rebalance Failed",
        description: "Failed to execute rebalance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-orange-500/20 text-orange-400';
      case 'low': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDeviationColor = (deviation: number) => {
    const abs = Math.abs(deviation);
    if (abs > 10) return 'text-red-400';
    if (abs > 5) return 'text-orange-400';
    if (abs > 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Balance className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Portfolio Rebalancing</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRebalanceEnabled}
              onCheckedChange={setAutoRebalanceEnabled}
            />
            <span className="text-sm text-muted-foreground">Auto Rebalance</span>
          </div>
          <Button
            onClick={() => executeRebalance()}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? 'Rebalancing...' : 'Rebalance All'}
          </Button>
        </div>
      </div>

      {/* Rebalance Alerts */}
      {alerts.length > 0 && (
        <Card className="crypto-card-gradient text-primary-foreground border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Rebalance Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{alert.symbol}</span>
                  <span className="text-sm text-muted-foreground">{alert.message}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => executeRebalance(alert.symbol)}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Fix Now
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rebalance Settings */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Rebalance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Rebalance Threshold (%)</label>
              <Input
                type="number"
                value={rebalanceThreshold}
                onChange={(e) => setRebalanceThreshold(parseFloat(e.target.value))}
                min="1"
                max="20"
                className="bg-card/20 border-white/20"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={autoRebalanceEnabled}
                onCheckedChange={setAutoRebalanceEnabled}
              />
              <span className="text-sm">Enable automatic rebalancing when threshold is exceeded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocations */}
      <div className="space-y-4">
        {allocations.map((allocation) => (
          <Card key={allocation.symbol} className="crypto-card-gradient text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-crypto-bitcoin to-crypto-ethereum flex items-center justify-center">
                    <span className="font-bold">{allocation.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium">{allocation.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      ${allocation.currentValue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${getDeviationColor(allocation.deviation)}`}>
                    {allocation.deviation > 0 ? '+' : ''}{allocation.deviation.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">deviation</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Target Allocation</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={allocation.targetPercentage}
                      onChange={(e) => updateTargetAllocation(allocation.symbol, parseFloat(e.target.value))}
                      className="w-20 h-8 text-xs bg-card/20 border-white/20"
                      min="0"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {allocation.currentPercentage.toFixed(1)}%</span>
                    <span>Target: {allocation.targetPercentage}%</span>
                  </div>
                  <Progress 
                    value={allocation.currentPercentage} 
                    className="h-2"
                  />
                </div>

                {Math.abs(allocation.deviation) > rebalanceThreshold && (
                  <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">
                        {allocation.action.toUpperCase()} ${Math.abs(allocation.rebalanceAmount).toLocaleString()} worth
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeRebalance(allocation.symbol)}
                      disabled={loading}
                      className={`${
                        allocation.action === 'buy' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {allocation.action.toUpperCase()}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
