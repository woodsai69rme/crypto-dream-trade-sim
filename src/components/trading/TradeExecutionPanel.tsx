import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';

interface TradeExecutionPanelProps {
  symbol: string;
  currentPrice: number;
}

export const TradeExecutionPanel = ({ symbol, currentPrice }: TradeExecutionPanelProps) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice.toString());
  const [positionSize, setPositionSize] = useState([25]); // Percentage of account balance
  const [executing, setExecuting] = useState(false);
  
  const { currentAccount, executeTrade } = useMultipleAccounts();
  const { toast } = useToast();

  const calculateMaxAmount = () => {
    if (!currentAccount) return 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
    const maxValue = (currentAccount.balance * positionSize[0]) / 100;
    return side === 'buy' ? maxValue / price : maxValue;
  };

  const calculateTradeValue = () => {
    const tradeAmount = parseFloat(amount) || 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
    return tradeAmount * price;
  };

  const handleExecuteTrade = async () => {
    if (!currentAccount || !amount) {
      toast({
        title: "Invalid Trade",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    try {
      const tradeData = {
        symbol,
        side,
        amount: parseFloat(amount),
        price: orderType === 'market' ? currentPrice : parseFloat(limitPrice),
        type: orderType
      };

      const success = await executeTrade(tradeData);
      
      if (success) {
        toast({
          title: "Trade Executed",
          description: `Successfully ${side === 'buy' ? 'bought' : 'sold'} ${amount} ${symbol}`,
        });
        setAmount('');
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: "Trade Failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const maxAmount = calculateMaxAmount();
  const tradeValue = calculateTradeValue();

  return (
    <Card className="crypto-card-gradient text-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Trade - {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Price */}
        <div className="text-center p-3 bg-card/20 rounded-lg">
          <div className="text-sm text-muted-foreground">Current Price</div>
          <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
        </div>

        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'buy' ? 'default' : 'outline'}
            onClick={() => setSide('buy')}
            className={`${side === 'buy' ? 'bg-crypto-success hover:bg-crypto-success/80' : ''}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            onClick={() => setSide('sell')}
            className={`${side === 'sell' ? 'bg-crypto-danger hover:bg-crypto-danger/80' : ''}`}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Sell
          </Button>
        </div>

        {/* Order Type */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={orderType === 'market' ? 'secondary' : 'outline'}
            onClick={() => setOrderType('market')}
            size="sm"
          >
            Market
          </Button>
          <Button
            variant={orderType === 'limit' ? 'secondary' : 'outline'}
            onClick={() => setOrderType('limit')}
            size="sm"
          >
            Limit
          </Button>
        </div>

        {/* Limit Price (if limit order) */}
        {orderType === 'limit' && (
          <div>
            <label className="text-sm text-muted-foreground">Limit Price</label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter limit price"
              className="bg-card/20 border-white/20"
            />
          </div>
        )}

        {/* Position Size Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Position Size</span>
            <span>{positionSize[0]}% of balance</span>
          </div>
          <Slider
            value={positionSize}
            onValueChange={setPositionSize}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="text-muted-foreground">Amount ({symbol})</label>
            <span className="text-xs text-muted-foreground">
              Max: {maxAmount.toFixed(6)}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${symbol} amount`}
              className="bg-card/20 border-white/20"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(maxAmount.toFixed(6))}
            >
              Max
            </Button>
          </div>
        </div>

        {/* Trade Summary */}
        <div className="p-3 bg-card/20 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Trade Value:</span>
            <span className="font-medium">${tradeValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fee (0.1%):</span>
            <span>${(tradeValue * 0.001).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Total:</span>
            <span>${(tradeValue * (side === 'buy' ? 1.001 : 0.999)).toFixed(2)}</span>
          </div>
        </div>

        {/* Execute Button */}
        <Button
          onClick={handleExecuteTrade}
          disabled={!amount || executing || !currentAccount}
          className={`w-full ${
            side === 'buy' 
              ? 'bg-crypto-success hover:bg-crypto-success/80' 
              : 'bg-crypto-danger hover:bg-crypto-danger/80'
          }`}
        >
          {executing ? (
            'Executing...'
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
            </>
          )}
        </Button>

        {/* Account Balance */}
        {currentAccount && (
          <div className="text-center text-sm text-muted-foreground">
            Available Balance: ${currentAccount.balance.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};