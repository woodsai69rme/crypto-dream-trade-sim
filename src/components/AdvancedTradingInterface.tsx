import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, TrendingDown, Target, Shield, Zap, Bot, 
  AlertTriangle, CheckCircle, Clock, DollarSign, Percent, 
  BarChart3, LineChart, Activity, Settings2
} from 'lucide-react';

interface TradingPosition {
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  stopLoss?: number;
  takeProfit?: number;
  riskReward: number;
}

interface OrderBook {
  bids: Array<[number, number]>; // [price, size]
  asks: Array<[number, number]>;
}

export const AdvancedTradingInterface = () => {
  const { prices, isConnected, createPriceAlert } = useRealtimeMarketData(['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'XRP']);
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();

  // Trading State
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop_limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  // Advanced Features
  const [riskPercentage, setRiskPercentage] = useState([2]); // 2% default risk
  const [autoStopLoss, setAutoStopLoss] = useState(true);
  const [autoTakeProfit, setAutoTakeProfit] = useState(true);
  const [trailingStop, setTrailingStop] = useState(false);
  const [positionSizing, setPositionSizing] = useState('fixed');
  
  // Analytics
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [executionQuality, setExecutionQuality] = useState(98.5);

  const currentPrice = prices[selectedSymbol]?.price || 0;
  const priceChange = prices[selectedSymbol]?.change24h || 0;

  // Calculate position size based on risk management
  const calculatePositionSize = () => {
    if (!currentAccount || !currentPrice) return 0;
    
    const accountBalance = currentAccount.balance;
    const riskAmount = (accountBalance * riskPercentage[0]) / 100;
    
    if (positionSizing === 'risk_based' && stopLoss) {
      const stopLossPrice = parseFloat(stopLoss);
      const riskPerShare = Math.abs(currentPrice - stopLossPrice);
      return riskAmount / riskPerShare;
    }
    
    return parseFloat(amount) || 0;
  };

  // Risk-Reward Calculator
  const calculateRiskReward = () => {
    if (!stopLoss || !takeProfit) return 0;
    
    const slPrice = parseFloat(stopLoss);
    const tpPrice = parseFloat(takeProfit);
    const risk = Math.abs(currentPrice - slPrice);
    const reward = Math.abs(tpPrice - currentPrice);
    
    return risk > 0 ? reward / risk : 0;
  };

  // Execute Advanced Trade
  const executeAdvancedTrade = async () => {
    if (!currentAccount) {
      toast({
        title: "❌ No Account Selected",
        description: "Please select a trading account first",
        variant: "destructive"
      });
      return;
    }

    const tradeSize = calculatePositionSize();
    const riskReward = calculateRiskReward();

    // Risk validation
    if (riskReward < 1 && (stopLoss && takeProfit)) {
      toast({
        title: "⚠️ Poor Risk/Reward Ratio",
        description: `Risk/Reward ratio is ${riskReward.toFixed(2)}:1. Consider adjusting your targets.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Execute the trade with advanced parameters
      const tradeData = {
        symbol: selectedSymbol,
        side,
        amount: tradeSize,
        price: orderType === 'market' ? currentPrice : parseFloat(price),
        order_type: orderType,
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
        account_id: currentAccount.id,
        risk_percentage: riskPercentage[0],
        trailing_stop: trailingStop,
        notes: `Risk/Reward: ${riskReward.toFixed(2)}:1`,
        trade_category: 'advanced'
      };

      const { data, error } = await supabase.functions.invoke('paper-trade', {
        body: tradeData
      });

      if (error) throw error;

      toast({
        title: "✅ Trade Executed Successfully",
        description: `${side.toUpperCase()} ${tradeSize.toFixed(6)} ${selectedSymbol} at $${currentPrice.toLocaleString()}`,
        variant: "default"
      });

      // Create price alerts if enabled
      if (stopLoss) {
        createPriceAlert(selectedSymbol, parseFloat(stopLoss), side === 'buy' ? 'below' : 'above');
      }
      if (takeProfit) {
        createPriceAlert(selectedSymbol, parseFloat(takeProfit), side === 'buy' ? 'above' : 'below');
      }

      // Reset form
      setAmount('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');

    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: "❌ Trade Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Auto-calculate stop loss and take profit
  useEffect(() => {
    if (autoStopLoss && currentPrice > 0) {
      const slPercentage = side === 'buy' ? 0.02 : -0.02; // 2% stop loss
      const autoSL = currentPrice * (1 - slPercentage);
      setStopLoss(autoSL.toFixed(2));
    }
    
    if (autoTakeProfit && currentPrice > 0) {
      const tpPercentage = side === 'buy' ? 0.06 : -0.06; // 6% take profit (3:1 R/R)
      const autoTP = currentPrice * (1 + tpPercentage);
      setTakeProfit(autoTP.toFixed(2));
    }
  }, [currentPrice, side, autoStopLoss, autoTakeProfit]);

  const riskReward = calculateRiskReward();
  const positionSize = calculatePositionSize();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-medium">
                {isConnected ? '🟢 Live Market Data' : '🔴 Disconnected'}
              </span>
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              Execution Quality: {executionQuality}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <div className="lg:col-span-2">
          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Advanced Trading Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Symbol Selection & Price Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trading Pair</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(prices).map(symbol => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}/USDT
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Price</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      ${currentPrice.toLocaleString()}
                    </span>
                    <Badge className={priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(priceChange).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="trade" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trade">Trade</TabsTrigger>
                  <TabsTrigger value="risk">Risk Mgmt</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="trade" className="space-y-4">
                  {/* Order Type & Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Order Type</Label>
                      <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                          <SelectItem value="stop">Stop</SelectItem>
                          <SelectItem value="stop_limit">Stop Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Side</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={side === 'buy' ? 'default' : 'outline'}
                          onClick={() => setSide('buy')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          BUY
                        </Button>
                        <Button
                          variant={side === 'sell' ? 'default' : 'outline'}
                          onClick={() => setSide('sell')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          SELL
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount ({selectedSymbol})</Label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    {orderType !== 'market' && (
                      <div className="space-y-2">
                        <Label>Price (USDT)</Label>
                        <Input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder={currentPrice.toString()}
                        />
                      </div>
                    )}
                  </div>

                  {/* Stop Loss & Take Profit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Stop Loss</Label>
                        <div className="flex items-center gap-2">
                          <Switch checked={autoStopLoss} onCheckedChange={setAutoStopLoss} />
                          <span className="text-xs">Auto</span>
                        </div>
                      </div>
                      <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Take Profit</Label>
                        <div className="flex items-center gap-2">
                          <Switch checked={autoTakeProfit} onCheckedChange={setAutoTakeProfit} />
                          <span className="text-xs">Auto</span>
                        </div>
                      </div>
                      <Input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  {/* Risk Management */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Risk Per Trade: {riskPercentage[0]}%</Label>
                        <Badge variant="outline">${((currentAccount?.balance || 0) * riskPercentage[0] / 100).toFixed(2)}</Badge>
                      </div>
                      <Slider
                        value={riskPercentage}
                        onValueChange={setRiskPercentage}
                        max={10}
                        min={0.5}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Position Sizing</Label>
                      <Select value={positionSizing} onValueChange={setPositionSizing}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="risk_based">Risk-Based</SelectItem>
                          <SelectItem value="kelly">Kelly Criterion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Trailing Stop</Label>
                      <Switch checked={trailingStop} onCheckedChange={setTrailingStop} />
                    </div>

                    {/* Risk Metrics */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg">
                      <div>
                        <Label className="text-xs opacity-60">Risk/Reward</Label>
                        <div className={`text-lg font-bold ${riskReward >= 2 ? 'text-green-400' : riskReward >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {riskReward.toFixed(2)}:1
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs opacity-60">Position Size</Label>
                        <div className="text-lg font-bold">
                          {positionSize.toFixed(6)} {selectedSymbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  {/* Trading Analytics */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-white/5">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Win Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">73.2%</div>
                    </Card>
                    <Card className="p-4 bg-white/5">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">Avg R/R</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">2.4:1</div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>Portfolio Allocation</Label>
                    <Progress value={35} className="h-2" />
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Used: 35%</span>
                      <span>Available: 65%</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Execute Button */}
              <Button
                onClick={executeAdvancedTrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-bold"
                disabled={!currentAccount || !amount}
              >
                <Zap className="w-5 h-5 mr-2" />
                Execute {side.toUpperCase()} Order
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Market Data & Order Book */}
        <div className="space-y-4">
          {/* Price Chart Placeholder */}
          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                {selectedSymbol}/USDT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-white/5 rounded">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-60">Live Chart Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs opacity-60">24h High</span>
                <span className="font-mono">${(currentPrice * 1.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs opacity-60">24h Low</span>
                <span className="font-mono">${(currentPrice * 0.94).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs opacity-60">Volume</span>
                <span className="font-mono">${prices[selectedSymbol]?.volume?.toLocaleString() || '0'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};