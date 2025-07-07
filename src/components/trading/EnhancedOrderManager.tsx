
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { websocketService, OrderUpdate } from '@/services/websocketService';
import { Edit, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  amount: number;
  price: number;
  stopPrice?: number;
  filledAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const EnhancedOrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [modifyPrice, setModifyPrice] = useState('');
  const [modifyAmount, setModifyAmount] = useState('');
  const { currentAccount } = useMultipleAccounts();
  const { toast } = useToast();

  useEffect(() => {
    // Load existing orders
    loadOrders();

    // Subscribe to order updates
    const unsubscribe = websocketService.subscribeToOrders((orderUpdate: OrderUpdate) => {
      setOrders(prev => prev.map(order => 
        order.id === orderUpdate.orderId 
          ? {
              ...order,
              status: orderUpdate.status,
              filledAmount: orderUpdate.filledAmount,
              remainingAmount: orderUpdate.remainingAmount,
              updatedAt: new Date().toISOString()
            }
          : order
      ));
    });

    return unsubscribe;
  }, [currentAccount]);

  const loadOrders = async () => {
    // Mock data - in production this would fetch from your database
    const mockOrders: Order[] = [
      {
        id: '1',
        symbol: 'BTC',
        side: 'buy',
        type: 'limit',
        amount: 0.1,
        price: 45000,
        filledAmount: 0.05,
        remainingAmount: 0.05,
        status: 'partial',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: '2',
        symbol: 'ETH',
        side: 'sell',
        type: 'stop',
        amount: 2,
        price: 3000,
        stopPrice: 2800,
        filledAmount: 0,
        remainingAmount: 2,
        status: 'pending',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setOrders(mockOrders);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'filled': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled': return <X className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'partial': return 'bg-orange-500/20 text-orange-400';
      case 'filled': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleModifyOrder = async (orderId: string) => {
    if (!modifyPrice && !modifyAmount) return;

    try {
      // In production, this would call your order modification API
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? {
              ...order,
              price: modifyPrice ? parseFloat(modifyPrice) : order.price,
              amount: modifyAmount ? parseFloat(modifyAmount) : order.amount,
              updatedAt: new Date().toISOString()
            }
          : order
      ));

      toast({
        title: "Order Modified",
        description: `Order ${orderId} has been updated successfully`,
      });

      setEditingOrder(null);
      setModifyPrice('');
      setModifyAmount('');
    } catch (error) {
      toast({
        title: "Modification Failed",
        description: "Failed to modify order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Order Cancelled",
        description: `Order ${orderId} has been cancelled successfully`,
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeOrders = orders.filter(order => ['pending', 'partial'].includes(order.status));
  const completedOrders = orders.filter(order => ['filled', 'cancelled'].includes(order.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Edit className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">Order Management</h2>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Order History ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card className="crypto-card-gradient text-primary-foreground">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active orders</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="crypto-card-gradient text-primary-foreground">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {order.side.toUpperCase()} {order.symbol}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {order.type.charAt(0).toUpperCase() + order.type.slice(1)} Order
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div className="font-medium">{order.amount} {order.symbol}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-medium">${order.price.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Filled:</span>
                      <div className="font-medium">{order.filledAmount} {order.symbol}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <div className="font-medium">{order.remainingAmount} {order.symbol}</div>
                    </div>
                  </div>

                  {order.stopPrice && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Stop Price:</span>
                      <span className="font-medium ml-2">${order.stopPrice.toLocaleString()}</span>
                    </div>
                  )}

                  {editingOrder === order.id ? (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">New Price</label>
                        <Input
                          type="number"
                          value={modifyPrice}
                          onChange={(e) => setModifyPrice(e.target.value)}
                          placeholder={order.price.toString()}
                          className="bg-card/20 border-white/20"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">New Amount</label>
                        <Input
                          type="number"
                          value={modifyAmount}
                          onChange={(e) => setModifyAmount(e.target.value)}
                          placeholder={order.amount.toString()}
                          className="bg-card/20 border-white/20"
                        />
                      </div>
                      <Button
                        onClick={() => handleModifyOrder(order.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingOrder(null)}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingOrder(order.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-3 h-3" />
                        Modify
                      </Button>
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.map((order) => (
            <Card key={order.id} className="crypto-card-gradient text-primary-foreground">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="font-medium">
                        {order.side.toUpperCase()} {order.amount} {order.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        at ${order.price.toLocaleString()} • {new Date(order.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
