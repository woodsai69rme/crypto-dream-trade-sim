
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, TrendingDown, DollarSign, Zap, Shield, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Mock trading pairs with current market prices
const tradingPairs = [
  { symbol: "BTC/USDT", price: 110245.67, change: 2.3 },
  { symbol: "ETH/USDT", price: 4126.89, change: -0.8 },
  { symbol: "BNB/USDT", price: 710.34, change: 1.4 },
  { symbol: "SOL/USDT", price: 245.67, change: 4.2 },
  { symbol: "ADA/USDT", price: 1.08, change: -2.1 },
  { symbol: "DOT/USDT", price: 8.92, change: 1.8 },
];

// Mock order history for paper trading
const paperOrderHistory = [
  { id: 1, pair: "BTC/USDT", type: "Buy", amount: 0.1, price: 108000, status: "Filled", time: "2024-01-15 14:30" },
  { id: 2, pair: "ETH/USDT", type: "Sell", amount: 2.5, price: 4200, status: "Filled", time: "2024-01-15 13:15" },
  { id: 3, pair: "SOL/USDT", type: "Buy", amount: 50, price: 240, status: "Pending", time: "2024-01-15 12:45" },
];

export const TradingPanel = () => {
  const { user } = useAuth();
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [autoExecute, setAutoExecute] = useState(false);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [executing, setExecuting] = useState(false);

  const selectedCoin = tradingPairs.find(pair => pair.symbol === selectedPair);
  
  // Safe paper trading balances only
  const paperBalance = currentAccount?.balance || 0;
  const availableBTC = 0.668; // Paper trading amount
  const availableUSDT = paperBalance;

  const executePaperTrade = async (tradeData: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    type: 'market' | 'limit';
  }) => {
    if (!user || !currentAccount) {
      throw new Error('User or account not found');
    }

    console.log('Executing paper trade:', tradeData);

    // Use the database function for proper trade execution
    const { data, error } = await supabase.rpc('execute_paper_trade', {
      p_user_id: user.id,
      p_account_id: currentAccount.id,
      p_symbol: tradeData.symbol,
      p_side: tradeData.side,
      p_amount: tradeData.amount,
      p_price: tradeData.price,
      p_trade_type: tradeData.type,
      p_order_type: tradeData.type
    });

    if (error) {
      console.error('Trade execution error:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Trade execution failed');
    }

    console.log('Trade executed successfully:', data);
    return data;
  };

  const handlePlaceOrder = async () => {
    if (!currentAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select a paper trading account first",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid limit price",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    try {
      const symbol = selectedPair.split('/')[0];
      const orderPrice = orderType === 'market' ? selectedCoin?.price || 0 : parseFloat(price);
      const orderAmount = parseFloat(amount);

      console.log('Placing order:', {
        symbol,
        side,
        amount: orderAmount,
        price: orderPrice,
        type: orderType
      });

      const result = await executePaperTrade({
        symbol,
        side: side as 'buy' | 'sell',
        amount: orderAmount,
        price: orderPrice,
        type: orderType as 'market' | 'limit'
      });

      // Clear form
      setAmount("");
      setPrice("");
      setStopLoss("");
      setTakeProfit("");

      toast({
        title: "Paper Trade Executed",
        description: `${side.toUpperCase()} ${orderAmount} ${symbol} at $${orderPrice.toLocaleString()} - New Balance: $${result.new_balance.toLocaleString()}`,
      });

      console.log('Trade completed successfully');
    } catch (error: any) {
      console.error("Paper trade error:", error);
      toast({
        title: "Paper Trade Failed",
        description: error.message || "Failed to execute paper trade",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trading Chart */}
      <Card className="lg:col-span-2 crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedPair} onValueChange={setSelectedPair}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tradingPairs.map(pair => (
                    <SelectItem key={pair.symbol} value={pair.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span>{pair.symbol}</span>
                        <Badge
                          variant={pair.change > 0 ? "default" : "destructive"}
                          className={`ml-2 ${
                            pair.change > 0
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {pair.change > 0 ? '+' : ''}{pair.change}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCoin && (
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">${selectedCoin.price.toLocaleString()}</div>
                  <Badge
                    variant={selectedCoin.change > 0 ? "default" : "destructive"}
                    className={`${
                      selectedCoin.change > 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {selectedCoin.change > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {selectedCoin.change}%
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    PAPER
                  </Badge>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { time: '09:00', price: selectedCoin ? selectedCoin.price * 0.98 : 66000 },
                { time: '10:00', price: selectedCoin ? selectedCoin.price * 0.99 : 66500 },
                { time: '11:00', price: selectedCoin ? selectedCoin.price * 1.01 : 67000 },
                { time: '12:00', price: selectedCoin ? selectedCoin.price * 0.995 : 66800 },
                { time: '13:00', price: selectedCoin ? selectedCoin.price * 1.005 : 67200 },
                { time: '14:00', price: selectedCoin?.price || 67432 },
              ]}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Paper Order History */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Recent Paper Orders
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  <Shield className="w-3 h-3 mr-1" />
                  PAPER
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paperOrderHistory.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={order.type === "Buy" ? "default" : "destructive"}
                        className={`${
                          order.type === "Buy"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {order.type}
                      </Badge>
                      <span className="font-medium">{order.pair}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>{order.amount} @ ${order.price.toLocaleString()}</div>
                      <div className="text-white/60">{order.time}</div>
                    </div>
                    <Badge
                      variant={order.status === "Filled" ? "default" : "secondary"}
                      className={order.status === "Filled" ? "bg-green-500/20 text-green-400" : ""}
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Paper Trading Form */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Paper Trading
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Shield className="w-3 h-3 mr-1" />
              SAFE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={side} onValueChange={setSide}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">
                Sell
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === "limit" && (
                <div className="space-y-2">
                  <Label>Price (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/10 border-white/20"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["25%", "50%", "75%", "100%"].map(percent => (
                  <Button
                    key={percent}
                    size="sm"
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                    onClick={() => {
                      const maxAmount = paperBalance / (selectedCoin?.price || 1) * (parseInt(percent) / 100);
                      setAmount(maxAmount.toFixed(6));
                    }}
                  >
                    {percent}
                  </Button>
                ))}
              </div>

              {/* Advanced Options */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <Label>Auto Execute</Label>
                  <Switch
                    checked={autoExecute}
                    onCheckedChange={setAutoExecute}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Take Profit</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                </div>
              </div>

              <Button
                className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={handlePlaceOrder}
                disabled={!currentAccount || executing}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {executing ? (
                  'Executing...'
                ) : (
                  `Paper ${side === 'buy' ? 'Buy' : 'Sell'} ${selectedPair.split('/')[0]}`
                )}
              </Button>
            </div>
          </Tabs>

          {/* Available Paper Balance */}
          <Card className="bg-white/5">
            <CardContent className="pt-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Paper BTC:</span>
                  <span>{availableBTC.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Paper USDT:</span>
                  <span>${availableUSDT.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-white/10">
                  <Shield className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Paper Trading Only - No Real Money</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!currentAccount && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Please select a paper trading account to start trading</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
