import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useCryptoHoldings } from "@/hooks/useCryptoHoldings";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Shield, AlertTriangle } from "lucide-react";

const tradingPairs = [
  { symbol: "BTC/USDT", price: 110245.67, change: 2.3 },
  { symbol: "ETH/USDT", price: 4126.89, change: -0.8 },
  { symbol: "SOL/USDT", price: 245.67, change: 4.2 },
  { symbol: "ADA/USDT", price: 1.08, change: -2.1 },
];

export const MultiAccountTradingPanel = () => {
  const { accounts, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();
  
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [executing, setExecuting] = useState(false);

  const selectedCoin = tradingPairs.find(pair => pair.symbol === selectedPair);

  const toggleAccountSelection = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const executeMultiAccountTrade = async () => {
    if (selectedAccounts.size === 0) {
      toast({
        title: "No Accounts Selected",
        description: "Please select at least one account for trading",
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

    setExecuting(true);
    
    try {
      const symbol = selectedPair.split('/')[0];
      const orderPrice = orderType === 'market' ? selectedCoin?.price || 0 : parseFloat(price);
      const orderAmount = parseFloat(amount);

      const tradePromises = Array.from(selectedAccounts).map(async (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) return null;

        try {
          const result = await executeTrade({
            symbol,
            side: side as 'buy' | 'sell',
            amount: orderAmount,
            price: orderPrice,
            type: orderType as 'market' | 'limit'
          });
          return { accountId, accountName: account.account_name, success: true, result };
        } catch (error: any) {
          return { accountId, accountName: account.account_name, success: false, error: error.message };
        }
      });

      const results = await Promise.all(tradePromises);
      const successful = results.filter(r => r && r.success);
      const failed = results.filter(r => r && !r.success);

      if (successful.length > 0) {
        toast({
          title: "Multi-Account Trade Completed",
          description: `Successfully executed on ${successful.length} accounts. ${failed.length > 0 ? `${failed.length} failed.` : ''}`,
        });
      }

      if (failed.length > 0) {
        toast({
          title: "Some Trades Failed",
          description: `${failed.length} accounts failed to execute the trade.`,
          variant: "destructive",
        });
      }

      // Clear form
      setAmount("");
      setPrice("");
      setSelectedAccounts(new Set());

    } catch (error: any) {
      toast({
        title: "Multi-Account Trade Failed",
        description: error.message || "Failed to execute trades",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Multi-Account Trading
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Zap className="w-3 h-3 mr-1" />
              ADVANCED
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Accounts for Trading</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <Card 
                  key={account.id} 
                  className={`cursor-pointer transition-all ${
                    selectedAccounts.has(account.id) 
                      ? 'border-crypto-success bg-crypto-success/10' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => toggleAccountSelection(account.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{account.account_name}</div>
                        <div className="text-sm text-white/60">
                          Balance: ${account.balance.toLocaleString()}
                        </div>
                        <div className={`text-sm ${account.total_pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                          P&L: {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)} 
                          ({account.total_pnl_percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.has(account.id)}
                          onChange={() => toggleAccountSelection(account.id)}
                          className="w-5 h-5 rounded border-white/20 bg-white/10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trading Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Trading Pair</Label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger className="bg-white/10 border-white/20">
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
              </div>

              <Tabs value={side} onValueChange={setSide}>
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
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
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-medium mb-2">Trade Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Selected Accounts:</span>
                    <span>{selectedAccounts.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Pair:</span>
                    <span>{selectedPair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Side:</span>
                    <span className={side === 'buy' ? 'text-crypto-success' : 'text-crypto-danger'}>
                      {side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Amount:</span>
                    <span>{amount || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Price:</span>
                    <span>
                      {orderType === 'market' 
                        ? `Market (~$${selectedCoin?.price.toLocaleString()})` 
                        : `$${price || '0'}`
                      }
                    </span>
                  </div>
                  {selectedCoin && amount && (
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-white/60">Total Value:</span>
                      <span className="font-medium">
                        ${((parseFloat(amount) || 0) * selectedCoin.price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={executeMultiAccountTrade}
                disabled={selectedAccounts.size === 0 || executing || !amount}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {executing ? (
                  'Executing...'
                ) : (
                  `Execute on ${selectedAccounts.size} Account${selectedAccounts.size !== 1 ? 's' : ''}`
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-yellow-400 mt-2">
                <Shield className="w-3 h-3" />
                <span>Paper Trading Only - No Real Money</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};