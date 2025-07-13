
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useDeribitIntegration } from '@/hooks/useDeribitIntegration';
import { TrendingUp, DollarSign, Target, Eye, EyeOff, RefreshCw, Plus } from "lucide-react";

export const DeribitIntegration = () => {
  const { toast } = useToast();
  const {
    loading,
    connected,
    positions,
    orders,
    authenticate,
    fetchPositions,
    fetchOpenOrders,
    placeOrder,
    disconnect,
  } = useDeribitIntegration();

  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
    isTestnet: true,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [orderForm, setOrderForm] = useState({
    instrument: 'BTC-PERPETUAL',
    amount: 10,
    direction: 'buy' as 'buy' | 'sell',
    orderType: 'market' as 'limit' | 'market',
    price: 0,
  });

  const instruments = [
    'BTC-PERPETUAL',
    'ETH-PERPETUAL',
    'SOL-PERPETUAL',
    'BTC-31DEC24',
    'ETH-31DEC24',
  ];

  const handleConnect = async () => {
    if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Client ID and Client Secret",
        variant: "destructive",
      });
      return;
    }

    await authenticate(credentials);
  };

  const handleRefreshData = async () => {
    if (!connected) return;
    
    await Promise.all([
      fetchPositions(credentials.isTestnet),
      fetchOpenOrders(credentials.isTestnet),
    ]);
  };

  const handlePlaceOrder = async () => {
    if (!connected) return;

    const result = await placeOrder(
      orderForm.instrument,
      orderForm.amount,
      orderForm.direction,
      orderForm.orderType,
      orderForm.orderType === 'limit' ? orderForm.price : undefined,
      credentials.isTestnet
    );

    if (result) {
      // Refresh data after placing order
      await handleRefreshData();
      
      // Reset form
      setOrderForm({
        ...orderForm,
        amount: 10,
        price: 0,
      });
    }
  };

  const getTotalPnL = () => {
    return positions.reduce((total, pos) => total + pos.unrealized_pnl, 0);
  };

  const getTotalMargin = () => {
    return positions.reduce((total, pos) => total + pos.maintenance_margin, 0);
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Deribit Integration
              <Badge className={connected ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                {connected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400">
                {credentials.isTestnet ? "TESTNET" : "MAINNET"}
              </Badge>
            </div>
            {connected && (
              <Button
                size="sm"
                variant="outline"
                onClick={disconnect}
                className="border-white/20"
              >
                Disconnect
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={credentials.isTestnet}
                  onCheckedChange={(checked) => 
                    setCredentials(prev => ({ ...prev, isTestnet: checked }))
                  }
                />
                <Label>Use Testnet (Recommended for testing)</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    placeholder="Enter Deribit Client ID"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecret ? "text" : "password"}
                      placeholder="Enter Deribit Client Secret"
                      value={credentials.clientSecret}
                      onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                      className="bg-white/10 border-white/20"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Deribit"
                )}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-8 h-8 p-2 bg-blue-600/20 rounded-lg text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Open Positions</p>
                  <p className="text-2xl font-bold">{positions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8 p-2 bg-green-600/20 rounded-lg text-green-400" />
                <div>
                  <p className="text-sm font-medium">Total PnL</p>
                  <p className={`text-2xl font-bold ${getTotalPnL() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${getTotalPnL().toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-8 h-8 p-2 bg-purple-600/20 rounded-lg text-purple-400" />
                <div>
                  <p className="text-sm font-medium">Active Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {connected && (
        <Tabs defaultValue="trading" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Place Order</span>
                  <Button
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instrument</Label>
                    <Select
                      value={orderForm.instrument}
                      onValueChange={(value) => setOrderForm(prev => ({ ...prev, instrument: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((instrument) => (
                          <SelectItem key={instrument} value={instrument}>
                            {instrument}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select
                      value={orderForm.direction}
                      onValueChange={(value: 'buy' | 'sell') => setOrderForm(prev => ({ ...prev, direction: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select
                      value={orderForm.orderType}
                      onValueChange={(value: 'market' | 'limit') => setOrderForm(prev => ({ ...prev, orderType: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="bg-white/10 border-white/20"
                    />
                  </div>

                  {orderForm.orderType === 'limit' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={orderForm.price}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="bg-white/10 border-white/20"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className={`w-full ${
                    orderForm.direction === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {orderForm.direction.toUpperCase()} {orderForm.amount} {orderForm.instrument}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <div className="grid gap-4">
              {positions.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6 text-center">
                    <p className="text-white/60">No open positions</p>
                  </CardContent>
                </Card>
              ) : (
                positions.map((position, index) => (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{position.instrument_name}</h3>
                          <Badge className={position.direction === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {position.direction.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge className={position.unrealized_pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          ${position.unrealized_pnl.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Size:</span>
                          <p className="font-medium">{position.size}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Avg Price:</span>
                          <p className="font-medium">${position.average_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Mark Price:</span>
                          <p className="font-medium">${position.mark_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Margin:</span>
                          <p className="font-medium">${position.maintenance_margin.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4">
              {orders.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6 text-center">
                    <p className="text-white/60">No open orders</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.order_id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{order.instrument_name}</h3>
                          <Badge className={order.direction === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {order.direction.toUpperCase()}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {order.order_type.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          {order.order_state.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Amount:</span>
                          <p className="font-medium">{order.amount}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Price:</span>
                          <p className="font-medium">${order.price?.toFixed(2) || 'Market'}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Filled:</span>
                          <p className="font-medium">{order.filled_amount}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Created:</span>
                          <p className="font-medium">{new Date(order.creation_timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
