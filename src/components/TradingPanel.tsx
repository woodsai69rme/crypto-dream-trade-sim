
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const tradingPairs = [
  { symbol: "BTC/USDT", price: 67432.15, change: 3.6 },
  { symbol: "ETH/USDT", price: 3678.92, change: -1.2 },
  { symbol: "BNB/USDT", price: 634.21, change: 2.0 },
  { symbol: "SOL/USDT", price: 178.45, change: 5.3 },
];

const orderHistory = [
  { id: 1, pair: "BTC/USDT", type: "Buy", amount: 0.1, price: 65000, status: "Filled", time: "2024-01-15 14:30" },
  { id: 2, pair: "ETH/USDT", type: "Sell", amount: 2.5, price: 3720, status: "Filled", time: "2024-01-15 13:15" },
  { id: 3, pair: "SOL/USDT", type: "Buy", amount: 50, price: 170, status: "Pending", time: "2024-01-15 12:45" },
];

export const TradingPanel = () => {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const selectedCoin = tradingPairs.find(pair => pair.symbol === selectedPair);

  const handlePlaceOrder = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('paper-trade', {
        body: {
          symbol: selectedPair.split('/')[0],
          side,
          amount: parseFloat(amount),
          order_type: orderType,
          price: orderType === 'limit' ? parseFloat(price) : undefined
        }
      });

      if (error) {
        console.error("Trade error:", error);
        return;
      }

      console.log("Trade executed:", data);
      // Reset form
      setAmount("");
      setPrice("");
    } catch (error) {
      console.error("Error placing order:", error);
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
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { time: '09:00', price: 66000 },
                { time: '10:00', price: 66500 },
                { time: '11:00', price: 67000 },
                { time: '12:00', price: 66800 },
                { time: '13:00', price: 67200 },
                { time: '14:00', price: 67432 },
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

          {/* Order History */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orderHistory.map(order => (
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
                      <div>{order.amount} @ ${order.price}</div>
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

      {/* Trading Form */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Place Order
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
            
            <TabsContent value="buy" className="space-y-4">
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
                      // Calculate amount based on percentage of available balance
                      console.log(`Setting ${percent} of balance`);
                    }}
                  >
                    {percent}
                  </Button>
                ))}
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handlePlaceOrder}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Buy {selectedPair.split('/')[0]}
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              {/* Similar structure for sell orders */}
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

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handlePlaceOrder}
              >
                Sell {selectedPair.split('/')[0]}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Available Balance */}
          <Card className="bg-white/5">
            <CardContent className="pt-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Available BTC:</span>
                  <span>0.668</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Available USDT:</span>
                  <span>$25,430.50</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
