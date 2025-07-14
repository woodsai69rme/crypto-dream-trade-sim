
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { usePaperTrading } from "@/hooks/usePaperTrading";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";

interface TradingLimits {
  accountId: string;
  maxTradeSize: number;
  maxDailyVolume: number;
  minProfitTarget: number;
  maxStopLoss: number;
  cooldownPeriod: number; // minutes
  volatilityThreshold: number;
}

interface MarketCondition {
  symbol: string;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  riskLevel: 'low' | 'medium' | 'high';
}

export const SmartTradingLimits = () => {
  const { accounts, currentAccount } = useMultipleAccounts();
  const { executeTrade } = usePaperTrading();
  const { toast } = useToast();

  const [tradingLimits, setTradingLimits] = useState<TradingLimits[]>([]);
  const [marketConditions, setMarketConditions] = useState<MarketCondition[]>([]);
  const [lastTradeTime, setLastTradeTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize trading limits for each account
    const limits = accounts.map(account => ({
      accountId: account.id,
      maxTradeSize: account.balance * 0.05, // 5% of balance max
      maxDailyVolume: account.balance * 0.20, // 20% of balance daily
      minProfitTarget: 2.0, // 2% minimum profit target
      maxStopLoss: 3.0, // 3% maximum stop loss
      cooldownPeriod: 15, // 15-minute cooldown between trades
      volatilityThreshold: 5.0 // 5% volatility threshold
    }));
    setTradingLimits(limits);

    // Mock market conditions (in real app, this would come from market data)
    setMarketConditions([
      { symbol: 'BTC', volatility: 4.2, trend: 'bullish', riskLevel: 'medium' },
      { symbol: 'ETH', volatility: 6.8, trend: 'sideways', riskLevel: 'high' },
      { symbol: 'SOL', volatility: 3.1, trend: 'bullish', riskLevel: 'low' },
    ]);
  }, [accounts]);

  const calculateDynamicLimits = (accountId: string, symbol: string) => {
    const baseLimits = tradingLimits.find(l => l.accountId === accountId);
    const marketCondition = marketConditions.find(m => m.symbol === symbol);
    
    if (!baseLimits || !marketCondition) return baseLimits;

    // Adjust limits based on market conditions
    let adjustedLimits = { ...baseLimits };

    // Reduce trade size in high volatility
    if (marketCondition.volatility > baseLimits.volatilityThreshold) {
      adjustedLimits.maxTradeSize *= 0.5; // Halve the trade size
      adjustedLimits.cooldownPeriod *= 2; // Double cooldown period
    }

    // Adjust based on risk level
    switch (marketCondition.riskLevel) {
      case 'high':
        adjustedLimits.maxTradeSize *= 0.6;
        adjustedLimits.minProfitTarget *= 1.5;
        adjustedLimits.maxStopLoss *= 0.7;
        break;
      case 'low':
        adjustedLimits.maxTradeSize *= 1.2;
        adjustedLimits.minProfitTarget *= 0.8;
        break;
    }

    return adjustedLimits;
  };

  const canExecuteTrade = (symbol: string, amount: number, price: number) => {
    if (!currentAccount) return { allowed: false, reason: 'No account selected' };

    const limits = calculateDynamicLimits(currentAccount.id, symbol);
    if (!limits) return { allowed: false, reason: 'Limits not configured' };

    const tradeValue = amount * price;

    // Check trade size limit
    if (tradeValue > limits.maxTradeSize) {
      return { 
        allowed: false, 
        reason: `Trade size exceeds limit ($${tradeValue.toFixed(2)} > $${limits.maxTradeSize.toFixed(2)})` 
      };
    }

    // Check cooldown period
    if (lastTradeTime) {
      const timeSinceLastTrade = (Date.now() - lastTradeTime.getTime()) / (1000 * 60); // minutes
      if (timeSinceLastTrade < limits.cooldownPeriod) {
        return {
          allowed: false,
          reason: `Cooldown active (${(limits.cooldownPeriod - timeSinceLastTrade).toFixed(1)} min remaining)`
        };
      }
    }

    // Check market volatility
    const marketCondition = marketConditions.find(m => m.symbol === symbol);
    if (marketCondition && marketCondition.volatility > limits.volatilityThreshold) {
      return {
        allowed: false,
        reason: `High volatility detected (${marketCondition.volatility.toFixed(1)}% > ${limits.volatilityThreshold}%)`
      };
    }

    return { allowed: true, reason: 'Trade approved' };
  };

  const updateTradingLimit = (accountId: string, field: keyof TradingLimits, value: number) => {
    setTradingLimits(prev => prev.map(limit => 
      limit.accountId === accountId 
        ? { ...limit, [field]: value }
        : limit
    ));
  };

  const executeSafeTrade = async (symbol: string, side: 'buy' | 'sell', amount: number, price: number) => {
    const tradeCheck = canExecuteTrade(symbol, amount, price);
    
    if (!tradeCheck.allowed) {
      toast({
        title: "Trade Blocked",
        description: tradeCheck.reason,
        variant: "destructive",
      });
      return;
    }

    try {
      await executeTrade({
        symbol,
        side,
        amount,
        price,
        reasoning: `Smart trading limits approved: ${tradeCheck.reason}`
      });

      setLastTradeTime(new Date());
      
      toast({
        title: "Trade Executed",
        description: `${side.toUpperCase()} ${amount} ${symbol} at $${price}`,
      });
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Failed to execute trade",
        variant: "destructive",
      });
    }
  };

  const currentLimits = currentAccount ? tradingLimits.find(l => l.accountId === currentAccount.id) : null;

  return (
    <div className="space-y-6">
      {/* Current Account Limits */}
      {currentAccount && currentLimits && (
        <Card className="crypto-card-gradient">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Smart Trading Limits - {currentAccount.account_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/60">Max Trade Size</div>
                <div className="font-bold text-green-400">${currentLimits.maxTradeSize.toFixed(0)}</div>
                <div className="text-xs text-white/40">
                  {((currentLimits.maxTradeSize / currentAccount.balance) * 100).toFixed(1)}% of balance
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/60">Daily Volume Limit</div>
                <div className="font-bold text-blue-400">${currentLimits.maxDailyVolume.toFixed(0)}</div>
                <div className="text-xs text-white/40">
                  {((currentLimits.maxDailyVolume / currentAccount.balance) * 100).toFixed(1)}% of balance
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/60">Profit Target</div>
                <div className="font-bold text-green-400">{currentLimits.minProfitTarget.toFixed(1)}%</div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/60">Stop Loss</div>
                <div className="font-bold text-red-400">{currentLimits.maxStopLoss.toFixed(1)}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/60">Cooldown Period</div>
                <div className="font-bold text-white">{currentLimits.cooldownPeriod} minutes</div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/60">Volatility Threshold</div>
                <div className="font-bold text-yellow-400">{currentLimits.volatilityThreshold.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Conditions */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Real-time Market Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketConditions.map((condition) => (
              <div key={condition.symbol} className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{condition.symbol}</h4>
                  <Badge className={
                    condition.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                    condition.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {condition.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Volatility:</span>
                    <span className={`font-medium ${condition.volatility > 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {condition.volatility.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/60">Trend:</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      condition.trend === 'bullish' ? 'text-green-400' :
                      condition.trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {condition.trend === 'bullish' ? <TrendingUp className="w-3 h-3" /> :
                       condition.trend === 'bearish' ? <TrendingDown className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {condition.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Status */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Trading Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lastTradeTime && currentLimits && (
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">Last Trade:</span>
                  <span className="text-white">{lastTradeTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-blue-400">Next Trade Allowed:</span>
                  <span className="text-white">
                    {new Date(lastTradeTime.getTime() + currentLimits.cooldownPeriod * 60 * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button
                onClick={() => executeSafeTrade('BTC', 'buy', 0.001, 50000)}
                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                disabled={!canExecuteTrade('BTC', 0.001, 50000).allowed}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Test Safe Trade (BTC)
              </Button>
              {!canExecuteTrade('BTC', 0.001, 50000).allowed && (
                <div className="text-xs text-red-400 mt-2">
                  {canExecuteTrade('BTC', 0.001, 50000).reason}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
