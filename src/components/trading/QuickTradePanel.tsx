
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePaperTrading } from '@/hooks/usePaperTrading';
import { useMarketData } from '@/hooks/useMarketData';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';

export const QuickTradePanel = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('bitcoin');
  const [amount, setAmount] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [useMarketPrice, setUseMarketPrice] = useState(true);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [reasoning, setReasoning] = useState('');
  
  const { executeTrade, loading } = usePaperTrading();
  const { marketData } = useMarketData();
  const { currentAccount } = useMultipleAccounts();

  const selectedCoin = marketData.find(coin => coin.symbol === selectedSymbol);
  const currentPrice = selectedCoin?.price_usd || 0;
  const displayPrice = useMarketPrice ? currentPrice : parseFloat(customPrice) || 0;
  const tradeValue = parseFloat(amount) * displayPrice;

  const handleTrade = async (side: 'buy' | 'sell') => {
    if (!selectedCoin || !amount || !displayPrice) return;

    await executeTrade({
      symbol: selectedSymbol,
      side,
      amount: parseFloat(amount),
      price: displayPrice,
      tradeType: useMarketPrice ? 'market' : 'limit',
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      reasoning: reasoning || undefined
    });

    // Reset form
    setAmount('');
    setCustomPrice('');
    setStopLoss('');
    setTakeProfit('');
    setReasoning('');
  };

  return (
    <Card className="crypto-card-gradient text-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Quick Trade
          {currentAccount && (
            <Badge className="bg-crypto-success/20 text-crypto-success">
              {currentAccount.account_name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Symbol Selection */}
        <div className="space-y-2">
          <Label>Cryptocurrency</Label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {marketData.map((coin) => (
                <SelectItem key={coin.symbol} value={coin.symbol}>
                  <div className="flex items-center gap-2">
                    <span>{coin.name}</span>
                    <Badge variant="outline">${coin.price_usd.toFixed(2)}</Badge>
                    <Badge 
                      variant={coin.change_percentage_24h >= 0 ? "default" : "destructive"}
                      className={coin.change_percentage_24h >= 0 ? 'bg-crypto-success' : 'bg-crypto-danger'}
                    >
                      {coin.change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Use Market Price</Label>
            <Switch checked={useMarketPrice} onCheckedChange={setUseMarketPrice} />
          </div>
          
          {!useMarketPrice && (
            <div className="space-y-2">
              <Label>Custom Price ($)</Label>
              <Input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Enter custom price"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded">
            <DollarSign className="w-4 h-4 text-crypto-info" />
            <span className="text-sm">
              Current Price: <strong>${currentPrice.toFixed(4)}</strong>
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to trade"
            step="0.0001"
          />
          {tradeValue > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="w-3 h-3" />
              Trade Value: ${tradeValue.toFixed(2)}
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Trade Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleTrade('buy')}
                disabled={loading || !amount || !displayPrice}
                className="bg-crypto-success hover:bg-crypto-success/80"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button
                onClick={() => handleTrade('sell')}
                disabled={loading || !amount || !displayPrice}
                className="bg-crypto-danger hover:bg-crypto-danger/80"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stop Loss ($)</Label>
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Take Profit ($)</Label>
                <Input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trading Reasoning</Label>
              <Input
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Why are you making this trade?"
              />
            </div>

            {/* Trade Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleTrade('buy')}
                disabled={loading || !amount || !displayPrice}
                className="bg-crypto-success hover:bg-crypto-success/80"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button
                onClick={() => handleTrade('sell')}
                disabled={loading || !amount || !displayPrice}
                className="bg-crypto-danger hover:bg-crypto-danger/80"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Account Balance Display */}
        {currentAccount && (
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Available Balance:</span>
              <span className="font-bold">${currentAccount.balance.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
