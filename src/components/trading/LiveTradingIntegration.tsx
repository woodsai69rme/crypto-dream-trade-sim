import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLiveTrading } from '@/hooks/useLiveTrading';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, Key, TestTube, CheckCircle, XCircle, AlertTriangle, 
  Activity, Shield, Zap, TrendingUp, Settings, RefreshCw,
  ExternalLink, Lock, Unlock
} from 'lucide-react';

export const LiveTradingIntegration = () => {
  const { 
    exchanges, 
    wallets, 
    loading, 
    connectExchange, 
    connectWallet, 
    syncExchangeBalances,
    executeLiveTrade 
  } = useLiveTrading();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('exchanges');
  const [connectionForm, setConnectionForm] = useState({
    exchange: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    isSandbox: true
  });

  const [tradingStatus, setTradingStatus] = useState({
    isLive: false,
    connectedExchanges: 0,
    activeOrders: 12,
    dailyVolume: 45200
  });

  // Available exchanges
  const availableExchanges = [
    { id: 'binance', name: 'Binance', type: 'CEX', status: 'available', fees: '0.1%' },
    { id: 'coinbase', name: 'Coinbase Pro', type: 'CEX', status: 'available', fees: '0.5%' },
    { id: 'kraken', name: 'Kraken', type: 'CEX', status: 'available', fees: '0.26%' },
    { id: 'bybit', name: 'Bybit', type: 'CEX', status: 'available', fees: '0.1%' },
    { id: 'okx', name: 'OKX', type: 'CEX', status: 'available', fees: '0.1%' },
    { id: 'deribit', name: 'Deribit', type: 'Options', status: 'available', fees: '0.03%' },
    { id: 'uniswap', name: 'Uniswap V3', type: 'DEX', status: 'beta', fees: '0.3%' },
    { id: 'pancakeswap', name: 'PancakeSwap', type: 'DEX', status: 'beta', fees: '0.25%' }
  ];

  // Wallet types
  const walletTypes = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', status: 'ready' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', status: 'ready' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', status: 'ready' },
    { id: 'ledger', name: 'Ledger', icon: '🔒', status: 'ready' }
  ];

  const handleExchangeConnection = async (exchangeId: string) => {
    if (!connectionForm.apiKey || !connectionForm.apiSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please provide API key and secret",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await connectExchange(
        exchangeId,
        connectionForm.apiKey,
        connectionForm.apiSecret,
        connectionForm.passphrase,
        connectionForm.isSandbox
      );

      if (success) {
        setConnectionForm({ exchange: '', apiKey: '', apiSecret: '', passphrase: '', isSandbox: true });
        setTradingStatus(prev => ({ ...prev, connectedExchanges: prev.connectedExchanges + 1 }));
        toast({
          title: "Exchange Connected",
          description: `Successfully connected to ${exchangeId}`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect exchange. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  const handleWalletConnection = async (walletType: string) => {
    try {
      const success = await connectWallet(walletType as any, '0x1234...abcd', `My ${walletType} Wallet`);
      
      if (success) {
        toast({
          title: "Wallet Connected",
          description: `Successfully connected ${walletType} wallet`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'disconnected': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleLiveTradingToggle = (checked: boolean) => {
    setTradingStatus(prev => ({ ...prev, isLive: checked }));
    
    if (checked) {
      toast({
        title: "Live Trading Enabled",
        description: "⚠️ You are now trading with real money. Please be careful!",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Live Trading Disabled",
        description: "Switched back to demo mode",
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      await syncExchangeBalances();
      toast({
        title: "Sync Complete",
        description: "All exchange balances have been updated",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync exchange balances",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground">Live Trading Integration</h2>
          <p className="text-muted-foreground">Connect exchanges and wallets for live trading</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={tradingStatus.isLive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {tradingStatus.isLive ? 'LIVE' : 'DEMO'}
          </Badge>
          <Button variant="outline" onClick={handleSyncAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Connected Exchanges</p>
                <p className="text-2xl font-bold text-blue-400">{exchanges.filter(e => e.is_active).length}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Orders</p>
                <p className="text-2xl font-bold text-green-400">{tradingStatus.activeOrders}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Daily Volume</p>
                <p className="text-2xl font-bold text-purple-400">${(tradingStatus.dailyVolume / 1000).toFixed(1)}K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">P&L Today</p>
                <p className="text-2xl font-bold text-green-400">+$1,234</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="orders">Live Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges">
          <div className="space-y-6">
            {/* Available Exchanges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {availableExchanges.map((exchange) => {
                const connectedExchange = exchanges.find(e => e.exchange_name.toLowerCase() === exchange.id);
                const isConnected = connectedExchange?.is_active;

                return (
                  <Card key={exchange.id} className="crypto-card-gradient text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{exchange.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{exchange.type}</Badge>
                              <Badge className={
                                exchange.status === 'available' ? 'bg-green-500/20 text-green-400' :
                                exchange.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }>
                                {exchange.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {getStatusIcon(isConnected ? 'connected' : 'disconnected')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Trading Fees:</span>
                        <span className="text-white">{exchange.fees}</span>
                      </div>
                      
                      {isConnected ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Balance:</span>
                            <span className="text-green-400">${connectedExchange?.permissions?.balance || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Last Sync:</span>
                            <span className="text-white/80">
                              {connectedExchange?.last_sync ? new Date(connectedExchange.last_sync).toLocaleString() : 'Never'}
                            </span>
                          </div>
                          <Button variant="outline" className="w-full" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Connection
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`api-key-${exchange.id}`}>API Key</Label>
                            <Input
                              id={`api-key-${exchange.id}`}
                              type="password"
                              placeholder="Enter API key"
                              value={connectionForm.exchange === exchange.id ? connectionForm.apiKey : ''}
                              onChange={(e) => setConnectionForm({
                                ...connectionForm,
                                exchange: exchange.id,
                                apiKey: e.target.value
                              })}
                              className="bg-card/20 border-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`api-secret-${exchange.id}`}>API Secret</Label>
                            <Input
                              id={`api-secret-${exchange.id}`}
                              type="password"
                              placeholder="Enter API secret"
                              value={connectionForm.exchange === exchange.id ? connectionForm.apiSecret : ''}
                              onChange={(e) => setConnectionForm({
                                ...connectionForm,
                                exchange: exchange.id,
                                apiSecret: e.target.value
                              })}
                              className="bg-card/20 border-white/20"
                            />
                          </div>
                          {exchange.id === 'okx' && (
                            <div className="space-y-2">
                              <Label htmlFor={`passphrase-${exchange.id}`}>Passphrase</Label>
                              <Input
                                id={`passphrase-${exchange.id}`}
                                type="password"
                                placeholder="Enter passphrase"
                                value={connectionForm.exchange === exchange.id ? connectionForm.passphrase : ''}
                                onChange={(e) => setConnectionForm({
                                  ...connectionForm,
                                  exchange: exchange.id,
                                  passphrase: e.target.value
                                })}
                                className="bg-card/20 border-white/20"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`sandbox-${exchange.id}`}>Sandbox Mode</Label>
                            <Switch
                              id={`sandbox-${exchange.id}`}
                              checked={connectionForm.isSandbox}
                              onCheckedChange={(checked) => setConnectionForm({
                                ...connectionForm,
                                isSandbox: checked
                              })}
                            />
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => handleExchangeConnection(exchange.id)}
                            disabled={loading}
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Connect Exchange
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walletTypes.map((wallet) => {
              const connectedWallet = wallets.find(w => w.wallet_type === wallet.id);
              const isConnected = connectedWallet?.is_active;

              return (
                <Card key={wallet.id} className="crypto-card-gradient text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div>
                          <h3 className="font-medium">{wallet.name}</h3>
                          <Badge className={
                            wallet.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {wallet.status}
                          </Badge>
                        </div>
                      </div>
                      {getStatusIcon(isConnected ? 'connected' : 'disconnected')}
                    </div>

                    {isConnected ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Address:</span>
                          <span className="text-white font-mono">{connectedWallet?.wallet_address}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Balance:</span>
                          <span className="text-green-400">{connectedWallet?.balance || 0} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Network:</span>
                          <span className="text-white">{connectedWallet?.network}</span>
                        </div>
                        <Button variant="outline" className="w-full" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleWalletConnection(wallet.id)}
                        disabled={loading}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect {wallet.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Active Live Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '1', pair: 'BTC/USDT', side: 'buy', amount: '0.025', price: '$98,500', status: 'partial' },
                  { id: '2', pair: 'ETH/USDT', side: 'sell', amount: '2.5', price: '$3,850', status: 'open' },
                  { id: '3', pair: 'SOL/USDT', side: 'buy', amount: '15', price: '$220', status: 'open' }
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge className={order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {order.side.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{order.pair}</p>
                        <p className="text-sm text-white/60">{order.amount} @ {order.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{order.status}</Badge>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Trading Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Live Trading Mode</Label>
                    <p className="text-xs text-white/60">Enable real money trading</p>
                  </div>
                  <Switch 
                    checked={tradingStatus.isLive}
                    onCheckedChange={handleLiveTradingToggle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-position">Maximum Position Size (%)</Label>
                  <Input
                    id="max-position"
                    type="number"
                    defaultValue="10"
                    min="1"
                    max="100"
                    className="bg-card/20 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-loss">Maximum Daily Loss (%)</Label>
                  <Input
                    id="daily-loss"
                    type="number"
                    defaultValue="5"
                    min="1"
                    max="50"
                    className="bg-card/20 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slippage">Maximum Slippage (%)</Label>
                  <Input
                    id="slippage"
                    type="number"
                    defaultValue="0.5"
                    min="0.1"
                    max="5"
                    step="0.1"
                    className="bg-card/20 border-white/20"
                  />
                </div>

                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Trading Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-white/60">Require 2FA for trades</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">API Key Encryption</Label>
                    <p className="text-xs text-white/60">Encrypt stored API keys</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Withdrawal Restrictions</Label>
                    <p className="text-xs text-white/60">Restrict automated withdrawals</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
