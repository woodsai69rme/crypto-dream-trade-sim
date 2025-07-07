
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Wallet, Key, TestTube, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";

interface ExchangeConnection {
  id: string;
  name: string;
  type: 'futures' | 'spot' | 'options';
  status: 'connected' | 'disconnected' | 'error';
  balance: number;
  positions: number;
  isTestnet: boolean;
  lastSync: string;
}

export const LiveTradingIntegration = () => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<ExchangeConnection[]>([
    {
      id: '1',
      name: 'Deribit',
      type: 'options',
      status: 'disconnected',
      balance: 0,
      positions: 0,
      isTestnet: true,
      lastSync: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Binance Futures',
      type: 'futures',
      status: 'disconnected',
      balance: 0,
      positions: 0,
      isTestnet: true,
      lastSync: new Date().toISOString()
    },
    {
      id: '3',
      name: 'OKX',
      type: 'spot',
      status: 'disconnected',
      balance: 0,
      positions: 0,
      isTestnet: true,
      lastSync: new Date().toISOString()
    }
  ]);

  const [newConnection, setNewConnection] = useState({
    exchange: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    testnet: true
  });

  const connectExchange = async (exchangeId: string) => {
    try {
      // Simulate connection process
      setConnections(prev => prev.map(conn => 
        conn.id === exchangeId 
          ? { ...conn, status: 'connected' as const, balance: Math.random() * 10000, lastSync: new Date().toISOString() }
          : conn
      ));

      toast({
        title: "Exchange Connected",
        description: "Successfully connected to exchange",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to exchange",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      case 'disconnected': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'disconnected': return <AlertTriangle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">Live Trading Integration</h2>
      </div>

      <Tabs defaultValue="exchanges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {connections.map((connection) => (
              <Card key={connection.id} className="crypto-card-gradient text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <Badge className={getStatusColor(connection.status)}>
                          {getStatusIcon(connection.status)}
                          {connection.status}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {connection.type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-white/60">Balance</Label>
                      <div className="text-lg font-bold">${connection.balance.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-white/60">Positions</Label>
                      <div className="text-lg font-bold">{connection.positions}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Testnet Mode</Label>
                    <Switch checked={connection.isTestnet} />
                  </div>

                  <div className="text-xs text-white/60">
                    Last sync: {new Date(connection.lastSync).toLocaleString()}
                  </div>

                  <div className="flex gap-2">
                    {connection.status === 'disconnected' ? (
                      <Button 
                        onClick={() => connectExchange(connection.id)}
                        className="flex-1"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Wallet Connections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">₿</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Bitcoin Wallet</h4>
                      <p className="text-xs text-white/60">bc1q...xyz</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold">0.00521 BTC</div>
                  <div className="text-sm text-green-400">$234.56</div>
                </Card>

                <Card className="p-4 bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">E</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Ethereum Wallet</h4>
                      <p className="text-xs text-white/60">0x...abc</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold">1.234 ETH</div>
                  <div className="text-sm text-green-400">$2,845.67</div>
                </Card>
              </div>

              <Button className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                Connect New Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Live Trading Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-sync Balances</Label>
                    <p className="text-xs text-white/60">Automatically sync account balances every 30 seconds</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Real-time Notifications</Label>
                    <p className="text-xs text-white/60">Get notified of trade executions and balance changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Risk Management</Label>
                    <p className="text-xs text-white/60">Enable automatic position size limits and stop-losses</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="max-position">Maximum Position Size (%)</Label>
                  <Input
                    id="max-position"
                    type="number"
                    defaultValue="5"
                    className="bg-card/20 border-white/20"
                  />
                </div>

                <div>
                  <Label htmlFor="daily-loss">Maximum Daily Loss (%)</Label>
                  <Input
                    id="daily-loss"
                    type="number"
                    defaultValue="2"
                    className="bg-card/20 border-white/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
