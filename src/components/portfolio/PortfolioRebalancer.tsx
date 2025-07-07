
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";

interface RebalanceTarget {
  symbol: string;
  currentAllocation: number;
  targetAllocation: number;
  currentValue: number;
  targetValue: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
}

const POPULAR_STRATEGIES = [
  {
    name: "Bitcoin Maximalist",
    allocations: { BTC: 80, ETH: 15, SOL: 5 }
  },
  {
    name: "Balanced Crypto",
    allocations: { BTC: 40, ETH: 30, SOL: 15, ADA: 10, XRP: 5 }
  },
  {
    name: "DeFi Focus", 
    allocations: { ETH: 50, UNI: 20, LINK: 15, AAVE: 10, COMP: 5 }
  },
  {
    name: "Equal Weight Top 5",
    allocations: { BTC: 20, ETH: 20, SOL: 20, ADA: 20, XRP: 20 }
  }
];

export const PortfolioRebalancer = () => {
  const { user } = useAuth();
  const { currentAccount } = useMultipleAccounts();
  const { toast } = useToast();
  const [targets, setTargets] = useState<RebalanceTarget[]>([]);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [rebalanceThreshold, setRebalanceThreshold] = useState([5]);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');

  useEffect(() => {
    if (currentAccount) {
      calculateRebalanceTargets();
    }
  }, [currentAccount]);

  const calculateRebalanceTargets = async () => {
    if (!currentAccount) return;

    // Mock calculation - in real app, get actual holdings
    const mockTargets: RebalanceTarget[] = [
      {
        symbol: 'BTC',
        currentAllocation: 45,
        targetAllocation: 40,
        currentValue: 4500,
        targetValue: 4000,
        action: 'sell',
        amount: 500
      },
      {
        symbol: 'ETH',
        currentAllocation: 25,
        targetAllocation: 30,
        currentValue: 2500,
        targetValue: 3000,
        action: 'buy',
        amount: 500
      },
      {
        symbol: 'SOL',
        currentAllocation: 20,
        targetAllocation: 20,
        currentValue: 2000,
        targetValue: 2000,
        action: 'hold',
        amount: 0
      },
      {
        symbol: 'ADA',
        currentAllocation: 10,
        targetAllocation: 10,
        currentValue: 1000,
        targetValue: 1000,
        action: 'hold',
        amount: 0
      }
    ];

    setTargets(mockTargets);
  };

  const executeRebalance = async () => {
    if (!currentAccount) return;

    setIsRebalancing(true);
    try {
      // Mock rebalancing execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rebalancing Complete",
        description: "Portfolio successfully rebalanced to target allocations",
      });

      calculateRebalanceTargets();
    } catch (error) {
      toast({
        title: "Rebalancing Failed",
        description: "Failed to execute rebalancing trades",
        variant: "destructive",
      });
    } finally {
      setIsRebalancing(false);
    }
  };

  const applyStrategy = (strategyName: string) => {
    const strategy = POPULAR_STRATEGIES.find(s => s.name === strategyName);
    if (!strategy) return;

    const newTargets = targets.map(target => ({
      ...target,
      targetAllocation: strategy.allocations[target.symbol] || 0,
      targetValue: (strategy.allocations[target.symbol] || 0) * currentAccount!.balance / 100,
      action: target.currentAllocation > (strategy.allocations[target.symbol] || 0) ? 'sell' as const : 
              target.currentAllocation < (strategy.allocations[target.symbol] || 0) ? 'buy' as const : 'hold' as const,
      amount: Math.abs(target.currentValue - ((strategy.allocations[target.symbol] || 0) * currentAccount!.balance / 100))
    }));

    setTargets(newTargets);
    setSelectedStrategy(strategyName);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="w-4 h-4" />;
      case 'sell': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Portfolio Rebalancing
            <Badge className="bg-blue-500/20 text-blue-400">
              {selectedStrategy || 'Custom'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strategy Selection */}
          <div className="space-y-4">
            <Label>Popular Strategies</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {POPULAR_STRATEGIES.map((strategy) => (
                <Button
                  key={strategy.name}
                  variant={selectedStrategy === strategy.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyStrategy(strategy.name)}
                  className="text-xs"
                >
                  {strategy.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Auto Rebalance Settings */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <Label>Auto Rebalancing</Label>
              <p className="text-sm text-white/60">
                Automatically rebalance when deviation exceeds threshold
              </p>
            </div>
            <Switch
              checked={autoRebalance}
              onCheckedChange={setAutoRebalance}
            />
          </div>

          {autoRebalance && (
            <div className="space-y-2">
              <Label>Rebalance Threshold: {rebalanceThreshold[0]}%</Label>
              <Slider
                value={rebalanceThreshold}
                onValueChange={setRebalanceThreshold}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Rebalance Targets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rebalance Plan</Label>
              <Button
                onClick={executeRebalance}
                disabled={isRebalancing || targets.every(t => t.action === 'hold')}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRebalancing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Execute Rebalance
              </Button>
            </div>

            <div className="space-y-3">
              {targets.map((target) => (
                <div key={target.symbol} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{target.symbol}</div>
                      <Badge className={getActionColor(target.action)}>
                        {getActionIcon(target.action)}
                        {target.action.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/80">
                      ${target.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-white/60">Current</div>
                      <div className="flex items-center gap-2">
                        <span>{target.currentAllocation}%</span>
                        <Progress value={target.currentAllocation} className="flex-1 h-2" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Target</div>
                      <div className="flex items-center gap-2">
                        <span>{target.targetAllocation}%</span>
                        <Progress value={target.targetAllocation} className="flex-1 h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-white/80">
                    <span>${target.currentValue.toFixed(2)} → ${target.targetValue.toFixed(2)}</span>
                    <span className={`${getActionColor(target.action)} font-semibold`}>
                      {target.action === 'buy' ? '+' : target.action === 'sell' ? '-' : ''}
                      ${target.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
