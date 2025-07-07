import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLiveTrading } from '@/hooks/useLiveTrading';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, Key, TestTube, CheckCircle, XCircle, AlertTriangle, 
  Activity, Zap, Settings, Plus, TrendingUp, Link
} from 'lucide-react';

export const LiveTradingHub = () => {
  const { 
    exchanges, 
    wallets, 
    loading, 
    fetchExchanges, 
    fetchWallets,
    connectExchange,
    connectWallet,
    executeLiveTrade,
    syncExchangeBalances
  } = useLiveTrading();
  
  const { toast } = useToast();
  const [connectionModal, setConnectionModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    isSandbox: true
  });

  useEffect(() => {
    fetchExchanges();
    fetchWallets();
  }, [fetchExchanges, fetchWallets]);

  const handleConnectExchange = async () => {
    if (!selectedExchange || !credentials.apiKey || !credentials.apiSecret) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const success = await connectExchange(
      selectedExchange,
      credentials.apiKey,
      credentials.apiSecret,
      credentials.passphrase,
      credentials.isSandbox
    );

    if (success) {
      setConnectionModal(false);
      setCredentials({ apiKey: '', apiSecret: '', passphrase: '', isSandbox: true });
      setSelectedExchange('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6" />
          <h1 className="text-3xl font-bold text-primary-foreground">Live Trading Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={syncExchangeBalances} disabled={loading}>
            <Activity className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Dialog open={connectionModal} onOpenChange={setConnectionModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Connect Exchange
              </Button>
            </DialogTrigger>
            <DialogContent className="crypto-card-gradient text-white">
              <DialogHeader>
                <DialogTitle>Connect Exchange</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Exchange</Label>
                  <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exchange" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deribit">Deribit (Options)</SelectItem>
                      <SelectItem value="binance">Binance Futures</SelectItem>
                      <SelectItem value="okx">OKX</SelectItem>
                      <SelectItem value="coinbase">Coinbase Pro</SelectItem>
                      <SelectItem value="kraken">Kraken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                </div>

                <div>
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={credentials.apiSecret}
                    onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                    placeholder="Enter your API secret"
                  />
                </div>

                {(selectedExchange === 'okx' || selectedExchange === 'coinbase') && (
                  <div>
                    <Label>Passphrase</Label>
                    <Input
                      type="password"
                      value={credentials.passphrase}
                      onChange={(e) => setCredentials({ ...credentials, passphrase: e.target.value })}
                      placeholder="Enter passphrase"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Sandbox/Testnet Mode</Label>
                  <Switch
                    checked={credentials.isSandbox}
                    onCheckedChange={(checked) => setCredentials({ ...credentials, isSandbox: checked })}
                  />
                </div>

                <Button onClick={handleConnectExchange} disabled={loading} className="w-full">
                  {loading ? 'Connecting...' : 'Connect Exchange'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="exchanges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="trading">Live Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="crypto-card-gradient text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{exchange.exchange_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon('connected')}
                          <span className="text-sm">Connected</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={exchange.sandbox_mode ? "secondary" : "default"}>
                      {exchange.sandbox_mode ? 'Testnet' : 'Live'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-white/60">Status</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm">Active</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">Last Sync</Label>
                        <div className="text-sm">
                          {exchange.last_sync ? new Date(exchange.last_sync).toLocaleTimeString() : 'Never'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>API Access</span>
                        <Badge variant="outline" className="text-xs">
                          Read & Trade
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Auto-sync</span>
                        <Switch checked={exchange.is_active} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {exchanges.length === 0 && (
              <Card className="crypto-card-gradient text-white">
                <CardContent className="text-center py-12">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-white/40" />
                  <h3 className="text-lg font-medium mb-2">No Exchanges Connected</h3>
                  <p className="text-white/60 mb-4">
                    Connect your first exchange to start live trading
                  </p>
                  <Button onClick={() => setConnectionModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Exchange
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="crypto-card-gradient text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{wallet.wallet_type}</CardTitle>
                        <div className="text-sm text-white/60">
                          {wallet.wallet_address.substring(0, 6)}...{wallet.wallet_address.substring(-4)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {wallet.network}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-white/60">Balance</Label>
                      <div className="text-xl font-bold">${wallet.balance.toLocaleString()}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Connected</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Auto-sync</span>
                        <Switch checked={wallet.is_active} />
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <Link className="w-4 h-4 mr-2" />
                      View on Explorer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="crypto-card-gradient text-white border-dashed">
              <CardContent className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <h3 className="text-lg font-medium mb-2">Connect Wallet</h3>
                <p className="text-white/60 mb-4">
                  Connect your crypto wallet for direct trading
                </p>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    MetaMask
                  </Button>
                  <Button className="w-full" variant="outline">
                    WalletConnect
                  </Button>
                  <Button className="w-full" variant="outline">
                    Coinbase Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Live Trading Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Trade Panel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Quick Trade</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Exchange</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exchange" />
                        </SelectTrigger>
                        <SelectContent>
                          {exchanges.map(exchange => (
                            <SelectItem key={exchange.id} value={exchange.id}>
                              {exchange.exchange_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Symbol</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="BTC-USD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC-USD">BTC-USD</SelectItem>
                          <SelectItem value="ETH-USD">ETH-USD</SelectItem>
                          <SelectItem value="SOL-USD">SOL-USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <Input placeholder="0.001" />
                    </div>
                    <div>
                      <Label>Price (USD)</Label>
                      <Input placeholder="50,000" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Buy
                    </Button>
                    <Button variant="destructive">
                      <TrendingUp className="w-4 h-4 mr-2 rotate-180" />
                      Sell
                    </Button>
                  </div>
                </div>

                {/* Trade History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Trades</h3>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={i % 2 === 0 ? "default" : "destructive"} className="text-xs">
                              {i % 2 === 0 ? 'BUY' : 'SELL'}
                            </Badge>
                            <span className="font-medium">BTC-USD</span>
                          </div>
                          <div className="text-sm text-white/60">0.001 BTC @ $50,000</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">$50.00</div>
                          <div className="text-xs text-white/60">2 min ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};