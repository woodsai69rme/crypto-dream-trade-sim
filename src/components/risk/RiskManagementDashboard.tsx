
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Shield, TrendingDown, TrendingUp, DollarSign, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";

interface RiskMetric {
  name: string;
  value: number;
  max: number;
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

interface StopLossOrder {
  id: string;
  symbol: string;
  type: 'stop_loss' | 'take_profit';
  trigger_price: number;
  amount: number;
  is_active: boolean;
}

export const RiskManagementDashboard = () => {
  const { user } = useAuth();
  const { currentAccount } = useMultipleAccounts();
  const { toast } = useToast();
  
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [stopLossOrders, setStopLossOrders] = useState<StopLossOrder[]>([]);
  const [positionSize, setPositionSize] = useState([10]);
  const [riskPerTrade, setRiskPerTrade] = useState([2]);
  const [autoStopLoss, setAutoStopLoss] = useState(false);
  const [autoTakeProfit, setAutoTakeProfit] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      calculateRiskMetrics();
      loadStopLossOrders();
    }
  }, [currentAccount]);

  const calculateRiskMetrics = () => {
    // Mock risk calculations
    const metrics: RiskMetric[] = [
      {
        name: 'Portfolio Risk',
        value: 15,
        max: 25,
        status: 'safe',
        description: 'Overall portfolio volatility risk'
      },
      {
        name: 'Concentration Risk',
        value: 45,
        max: 50,
        status: 'warning',
        description: 'Single asset concentration'
      },
      {
        name: 'Drawdown Risk',
        value: 8,
        max: 20,
        status: 'safe',
        description: 'Maximum potential drawdown'
      },
      {
        name: 'Leverage Risk',
        value: 2.5,
        max: 5,
        status: 'safe',
        description: 'Current leverage ratio'
      },
      {
        name: 'Correlation Risk',
        value: 75,
        max: 80,
        status: 'warning',
        description: 'Asset correlation level'
      }
    ];
    
    setRiskMetrics(metrics);
  };

  const loadStopLossOrders = () => {
    // Mock stop loss orders
    const orders: StopLossOrder[] = [
      {
        id: '1',
        symbol: 'BTC',
        type: 'stop_loss',
        trigger_price: 95000,
        amount: 0.1,
        is_active: true
      },
      {
        id: '2',
        symbol: 'ETH',
        type: 'take_profit',
        trigger_price: 2800,
        amount: 1.5,
        is_active: true
      },
      {
        id: '3',
        symbol: 'SOL',
        type: 'stop_loss',
        trigger_price: 140,
        amount: 10,
        is_active: false
      }
    ];
    
    setStopLossOrders(orders);
  };

  const createStopLoss = (symbol: string, price: number, amount: number, type: 'stop_loss' | 'take_profit') => {
    const newOrder: StopLossOrder = {
      id: Date.now().toString(),
      symbol,
      type,
      trigger_price: price,
      amount,
      is_active: true
    };

    setStopLossOrders(prev => [...prev, newOrder]);
    
    toast({
      title: "Order Created",
      description: `${type.replace('_', ' ').toUpperCase()} order created for ${symbol}`,
    });
  };

  const toggleOrder = (orderId: string) => {
    setStopLossOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, is_active: !order.is_active }
          : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'danger': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const calculatePositionSize = (accountBalance: number, riskPercentage: number, stopLossDistance: number) => {
    return accountBalance * (riskPercentage / 100) / stopLossDistance;
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Management Dashboard
            <Badge className="bg-blue-500/20 text-blue-400">
              ACTIVE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskMetrics.map((metric) => (
              <Card key={metric.name} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{metric.value}{metric.name.includes('Risk') ? '%' : 'x'}</span>
                      <span className="text-white/60">Max: {metric.max}</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.max) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-white/60">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Position Sizing Calculator */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Position Sizing Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Position Size: {positionSize[0]}%</Label>
                  <Slider
                    value={positionSize}
                    onValueChange={setPositionSize}
                    max={25}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risk Per Trade: {riskPerTrade[0]}%</Label>
                  <Slider
                    value={riskPerTrade}
                    onValueChange={setRiskPerTrade}
                    max={5}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                <div className="text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-sm text-white/60">Account Balance</div>
                  <div className="font-semibold">${currentAccount?.balance.toFixed(2) || '0.00'}</div>
                </div>
                <div className="text-center">
                  <Percent className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-sm text-white/60">Max Position</div>
                  <div className="font-semibold">${((currentAccount?.balance || 0) * positionSize[0] / 100).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <div className="text-sm text-white/60">Max Risk</div>
                  <div className="font-semibold">${((currentAccount?.balance || 0) * riskPerTrade[0] / 100).toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Risk Management */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Automated Risk Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <Label>Auto Stop Loss</Label>
                  <p className="text-sm text-white/60">Automatically set stop losses on new positions</p>
                </div>
                <Switch
                  checked={autoStopLoss}
                  onCheckedChange={setAutoStopLoss}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <Label>Auto Take Profit</Label>
                  <p className="text-sm text-white/60">Automatically set take profit levels</p>
                </div>
                <Switch
                  checked={autoTakeProfit}
                  onCheckedChange={setAutoTakeProfit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Stop Loss Orders */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Active Risk Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stopLossOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{order.symbol}</div>
                      <Badge className={order.type === 'stop_loss' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                        {order.type === 'stop_loss' ? (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        )}
                        {order.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-white/80">
                        ${order.trigger_price.toLocaleString()} | {order.amount} units
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={order.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {order.is_active ? 'ACTIVE' : 'PAUSED'}
                      </Badge>
                      <Switch
                        checked={order.is_active}
                        onCheckedChange={() => toggleOrder(order.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
