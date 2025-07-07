
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { Scale, TrendingUp, AlertTriangle, Target, Zap, Settings } from "lucide-react";

interface AssetAllocation {
  symbol: string;
  currentWeight: number;
  targetWeight: number;
  currentValue: number;
  targetValue: number;
  rebalanceAmount: number;
  action: 'buy' | 'sell' | 'hold';
}

export const PortfolioRebalancingSystem = () => {
  const { currentAccount } = useMultipleAccounts();
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [rebalanceThreshold, setRebalanceThreshold] = useState([5]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      generateMockAllocations();
    }
  }, [currentAccount]);

  const generateMockAllocations = () => {
    const mockAllocations: AssetAllocation[] = [
      {
        symbol: 'BTC',
        currentWeight: 45,
        targetWeight: 40,
        currentValue: 45000,
        targetValue: 40000,
        rebalanceAmount: -5000,
        action: 'sell'
      },
      {
        symbol: 'ETH',
        currentWeight: 25,
        targetWeight: 30,
        currentValue: 25000,
        targetValue: 30000,
        rebalanceAmount: 5000,
        action: 'buy'
      },
      {
        symbol: 'SOL',
        currentWeight: 15,
        targetWeight: 15,
        currentValue: 15000,
        targetValue: 15000,
        rebalanceAmount: 0,
        action: 'hold'
      },
      {
        symbol: 'ADA',
        currentWeight: 10,
        targetWeight: 10,
        currentValue: 10000,
        targetValue: 10000,
        rebalanceAmount: 0,
        action: 'hold'
      },
      {
        symbol: 'DOT',
        currentWeight: 5,
        targetWeight: 5,
        currentValue: 5000,
        targetValue: 5000,
        rebalanceAmount: 0,
        action: 'hold'
      }
    ];
    setAllocations(mockAllocations);
  };

  const updateTargetWeight = (symbol: string, newWeight: number) => {
    setAllocations(prev => prev.map(allocation => {
      if (allocation.symbol === symbol) {
        const totalValue = 100000; // Mock total portfolio value
        const newTargetValue = (newWeight / 100) * totalValue;
        const rebalanceAmount = newTargetValue - allocation.currentValue;
        
        return {
          ...allocation,
          targetWeight: newWeight,
          targetValue: newTargetValue,
          rebalanceAmount,
          action: rebalanceAmount > 100 ? 'buy' : rebalanceAmount < -100 ? 'sell' : 'hold'
        };
      }
      return allocation;
    }));
  };

  const executeRebalance = async () => {
    setLoading(true);
    try {
      // Simulate rebalancing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Portfolio Rebalanced",
        description: "All trades executed successfully",
      });

      // Update current weights to match target weights
      setAllocations(prev => prev.map(allocation => ({
        ...allocation,
        currentWeight: allocation.targetWeight,
        currentValue: allocation.targetValue,
        rebalanceAmount: 0,
        action: 'hold' as const
      })));
    } catch (error) {
      toast({
        title: "Rebalancing Failed",
        description: "Unable to execute all trades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-500/20 text-green-400';
      case 'sell': return 'bg-red-500/20 text-red-400';
      case 'hold': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const needsRebalancing = allocations.some(a => Math.abs(a.currentWeight - a.targetWeight) >= rebalanceThreshold[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Portfolio Rebalancing</h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={executeRebalance}
            disabled={loading || !needsRebalancing}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Rebalancing...' : 'Execute Rebalance'}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Rebalancing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Rebalancing</div>
              <div className="text-sm text-muted-foreground">
                Automatically rebalance when threshold is exceeded
              </div>
            </div>
            <Switch
              checked={autoRebalance}
              onCheckedChange={setAutoRebalance}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Rebalance Threshold</span>
              <span className="text-sm text-muted-foreground">{rebalanceThreshold[0]}%</span>
            </div>
            <Slider
              value={rebalanceThreshold}
              onValueChange={setRebalanceThreshold}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Allocation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allocations.map((allocation) => (
          <Card key={allocation.symbol} className="crypto-card-gradient text-primary-foreground">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{allocation.symbol}</CardTitle>
                <Badge className={getActionColor(allocation.action)}>
                  {allocation.action.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {allocation.currentWeight}%</span>
                  <span>Target: {allocation.targetWeight}%</span>
                </div>
                <Progress 
                  value={allocation.currentWeight} 
                  className="w-full h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Target Allocation</div>
                <Slider
                  value={[allocation.targetWeight]}
                  onValueChange={(value) => updateTargetWeight(allocation.symbol, value[0])}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Current Value</div>
                  <div className="font-medium">${allocation.currentValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Target Value</div>
                  <div className="font-medium">${allocation.targetValue.toLocaleString()}</div>
                </div>
              </div>

              {allocation.rebalanceAmount !== 0 && (
                <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Rebalance: </span>
                    <span className={allocation.rebalanceAmount > 0 ? 'text-green-400' : 'text-red-400'}>
                      {allocation.rebalanceAmount > 0 ? '+' : ''}
                      ${Math.abs(allocation.rebalanceAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rebalancing Summary */}
      {needsRebalancing && (
        <Card className="crypto-card-gradient text-primary-foreground border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              Rebalancing Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allocations
                .filter(a => Math.abs(a.rebalanceAmount) > 100)
                .map(allocation => (
                  <div key={allocation.symbol} className="flex justify-between items-center">
                    <span>{allocation.symbol}</span>
                    <span className={allocation.rebalanceAmount > 0 ? 'text-green-400' : 'text-red-400'}>
                      {allocation.action.toUpperCase()} ${Math.abs(allocation.rebalanceAmount).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
