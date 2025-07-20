import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRealTrading } from '@/hooks/useRealTrading';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Shield, DollarSign, TrendingUp, Settings, StopCircle, Play, Lock } from 'lucide-react';

export const RealTradingPanel = () => {
  const { user } = useAuth();
  const { accounts, currentAccount } = useMultipleAccounts();
  const {
    credentials,
    riskAlerts,
    loading,
    fetchCredentials,
    addCredentials,
    toggleCredentials,
    validateRealTrade,
    executeRealTrade,
    createTradingConfirmation,
    fetchRiskAlerts,
    emergencyStop,
    removeEmergencyStop
  } = useRealTrading();

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [newCredentials, setNewCredentials] = useState({
    exchange: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    isTestnet: true
  });
  const [tradeForm, setTradeForm] = useState({
    symbol: 'BTC',
    side: 'buy' as 'buy' | 'sell',
    amount: '',
    price: '',
    tradeType: 'market' as 'market' | 'limit' | 'stop'
  });
  const [confirmationData, setConfirmationData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchCredentials();
      fetchRiskAlerts();
    }
  }, [user, fetchCredentials, fetchRiskAlerts]);

  useEffect(() => {
    if (currentAccount) {
      setIsLiveMode(currentAccount.trading_mode === 'live');
    }
  }, [currentAccount]);

  const handleAddCredentials = async () => {
    if (!newCredentials.exchange || !newCredentials.apiKey || !newCredentials.apiSecret) {
      return;
    }

    const success = await addCredentials(
      newCredentials.exchange,
      newCredentials.apiKey,
      newCredentials.apiSecret,
      newCredentials.passphrase || undefined,
      newCredentials.isTestnet
    );

    if (success) {
      setNewCredentials({
        exchange: '',
        apiKey: '',
        apiSecret: '',
        passphrase: '',
        isTestnet: true
      });
    }
  };

  const handleTradingModeToggle = async (enabled: boolean) => {
    if (!currentAccount) return;

    if (enabled && credentials.filter(c => c.is_active && !c.is_testnet).length === 0) {
      alert('Please add and activate mainnet credentials before enabling live trading.');
      return;
    }

    setIsLiveMode(enabled);
    // In a real implementation, you would update the account's trading_mode in the database
  };

  const handleTradeSubmit = async () => {
    if (!currentAccount || !isLiveMode) return;

    // Validate trade first
    const validation = await validateRealTrade({
      account_id: currentAccount.id,
      exchange_name: newCredentials.exchange,
      symbol: tradeForm.symbol,
      side: tradeForm.side,
      amount: parseFloat(tradeForm.amount),
      price: parseFloat(tradeForm.price),
      trade_type: tradeForm.tradeType === 'stop' ? 'market' : tradeForm.tradeType
    });

    if (!validation || !(validation as any).valid) {
      return;
    }

    // Create confirmation for safety
    const confirmation = await createTradingConfirmation({
      account_id: currentAccount.id,
      symbol: tradeForm.symbol,
      side: tradeForm.side,
      amount: parseFloat(tradeForm.amount),
      price: parseFloat(tradeForm.price),
      validation_result: validation
    });

    if (confirmation) {
      setConfirmationData(confirmation);
    }
  };

  const handleConfirmedTrade = async () => {
    if (!currentAccount || !confirmationData) return;

    const result = await executeRealTrade({
      account_id: currentAccount.id,
      exchange_name: newCredentials.exchange,
      symbol: tradeForm.symbol,
      side: tradeForm.side,
      amount: parseFloat(tradeForm.amount),
      price: parseFloat(tradeForm.price),
      trade_type: tradeForm.tradeType === 'stop' ? 'market' : tradeForm.tradeType,
      confirmation_token: confirmationData.confirmation_token
    });

    if (result && (result as any).valid) {
      setConfirmationData(null);
      setTradeForm({
        symbol: 'BTC',
        side: 'buy',
        amount: '',
        price: '',
        tradeType: 'market'
      });
    }
  };

  const criticalRiskAlerts = riskAlerts.filter(alert => 
    alert.risk_level === 'critical' || alert.risk_level === 'high'
  );

  return (
    <div className="space-y-6">
      {/* Risk Alerts */}
      {criticalRiskAlerts.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalRiskAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.risk_type}</span>
                    <Badge variant="destructive">{alert.risk_level}</Badge>
                  </div>
                  <p className="text-sm text-red-300 mt-1">{alert.alert_message || 'Risk threshold exceeded'}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                    <span>Current: ${alert.current_value}</span>
                    <span>•</span>
                    <span>Threshold: ${alert.threshold_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Mode Control */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Real Trading Control
            <Badge className={`${isLiveMode ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {isLiveMode ? 'LIVE MODE' : 'PAPER MODE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <Label className="text-base font-medium">Enable Live Trading</Label>
              <p className="text-sm text-white/60 mt-1">
                Switch to live trading mode. Requires active mainnet credentials.
              </p>
            </div>
            <Switch
              checked={isLiveMode}
              onCheckedChange={handleTradingModeToggle}
              disabled={loading}
            />
          </div>

          {currentAccount?.emergency_stop && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <StopCircle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Emergency Stop Active</span>
              </div>
              <p className="text-sm text-red-300 mb-3">
                All trading is currently stopped for this account.
              </p>
              <Button
                onClick={() => currentAccount && removeEmergencyStop(currentAccount.id)}
                size="sm"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                disabled={loading}
              >
                Remove Emergency Stop
              </Button>
            </div>
          )}

          {!currentAccount?.emergency_stop && currentAccount && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => emergencyStop(currentAccount.id)}
                variant="outline"
                size="sm"
                className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                disabled={loading}
              >
                <StopCircle className="w-4 h-4 mr-1" />
                Emergency Stop
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Credentials */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Trading Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Credentials */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="font-medium mb-3">Add Exchange Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Exchange</Label>
                <Select
                  value={newCredentials.exchange}
                  onValueChange={(value) => setNewCredentials(prev => ({ ...prev, exchange: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deribit">Deribit</SelectItem>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="coinbase">Coinbase Pro</SelectItem>
                    <SelectItem value="okx">OKX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newCredentials.isTestnet}
                  onCheckedChange={(checked) => setNewCredentials(prev => ({ ...prev, isTestnet: checked }))}
                />
                <Label>Testnet</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={newCredentials.apiKey}
                  onChange={(e) => setNewCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="bg-white/5 border-white/20"
                  placeholder="Enter API key"
                />
              </div>
              <div>
                <Label>API Secret</Label>
                <Input
                  type="password"
                  value={newCredentials.apiSecret}
                  onChange={(e) => setNewCredentials(prev => ({ ...prev, apiSecret: e.target.value }))}
                  className="bg-white/5 border-white/20"
                  placeholder="Enter API secret"
                />
              </div>
            </div>
            {newCredentials.exchange === 'okx' && (
              <div className="mt-4">
                <Label>Passphrase</Label>
                <Input
                  type="password"
                  value={newCredentials.passphrase}
                  onChange={(e) => setNewCredentials(prev => ({ ...prev, passphrase: e.target.value }))}
                  className="bg-white/5 border-white/20"
                  placeholder="Enter passphrase (OKX only)"
                />
              </div>
            )}
            <Button
              onClick={handleAddCredentials}
              className="mt-4"
              disabled={loading || !newCredentials.exchange || !newCredentials.apiKey || !newCredentials.apiSecret}
            >
              Add Credentials
            </Button>
          </div>

          {/* Existing Credentials */}
          <div className="space-y-3">
            {credentials.map(cred => (
              <div key={cred.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cred.exchange_name}</span>
                      <Badge className={`${cred.is_testnet ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                        {cred.is_testnet ? 'Testnet' : 'Mainnet'}
                      </Badge>
                      {cred.is_active && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <Play className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      Daily Limit: ${cred.daily_limit || 1000} • Position Limit: ${cred.position_limit || 5000}
                    </div>
                  </div>
                  <Switch
                    checked={cred.is_active}
                    onCheckedChange={(checked) => toggleCredentials(cred.id, checked)}
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Form */}
      {isLiveMode && (
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Execute Real Trade
              <Badge className="bg-red-500/20 text-red-400">LIVE TRADING</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Symbol</Label>
                <Select
                  value={tradeForm.symbol}
                  onValueChange={(value) => setTradeForm(prev => ({ ...prev, symbol: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Side</Label>
                <Select
                  value={tradeForm.side}
                  onValueChange={(value: 'buy' | 'sell') => setTradeForm(prev => ({ ...prev, side: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={tradeForm.amount}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-white/5 border-white/20"
                  placeholder="0.001"
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={tradeForm.price}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, price: e.target.value }))}
                  className="bg-white/5 border-white/20"
                  placeholder="50000"
                />
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  disabled={loading || !tradeForm.amount || !tradeForm.price}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Execute Real Trade
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">Confirm Real Trade</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to execute a REAL trade with REAL money. This action cannot be undone.
                    <br /><br />
                    <strong>Trade Details:</strong>
                    <br />• {tradeForm.side.toUpperCase()} {tradeForm.amount} {tradeForm.symbol}
                    <br />• Price: ${tradeForm.price}
                    <br />• Total Value: ${(parseFloat(tradeForm.amount) * parseFloat(tradeForm.price)).toFixed(2)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTradeSubmit}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Confirm Trade
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Trade Confirmation Dialog */}
      {confirmationData && (
        <AlertDialog open={!!confirmationData} onOpenChange={() => setConfirmationData(null)}>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400">Final Trade Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                This is your final confirmation. The trade will be executed immediately after confirmation.
                <br /><br />
                <strong>Confirmation Token:</strong> {confirmationData.confirmation_token}
                <br />
                <strong>Expires:</strong> {new Date(confirmationData.expires_at).toLocaleString()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmationData(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmedTrade}
                className="bg-red-500 hover:bg-red-600"
              >
                Execute Trade Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
