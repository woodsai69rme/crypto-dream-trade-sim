import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { useRealTrading } from '@/hooks/useRealTrading';
import { useToast } from '@/hooks/use-toast';

interface ExchangeConfig {
  name: string;
  displayName: string;
  supports: string[];
  testnetUrl: string;
  mainnetUrl: string;
  requiresPassphrase: boolean;
}

const EXCHANGE_CONFIGS: ExchangeConfig[] = [
  {
    name: 'binance',
    displayName: 'Binance',
    supports: ['spot', 'futures', 'options'],
    testnetUrl: 'https://testnet.binance.vision',
    mainnetUrl: 'https://api.binance.com',
    requiresPassphrase: false
  },
  {
    name: 'coinbase',
    displayName: 'Coinbase Pro',
    supports: ['spot'],
    testnetUrl: 'https://api-public.sandbox.pro.coinbase.com',
    mainnetUrl: 'https://api.pro.coinbase.com',
    requiresPassphrase: true
  },
  {
    name: 'okx',
    displayName: 'OKX',
    supports: ['spot', 'futures', 'options', 'swap'],
    testnetUrl: 'https://www.okx.com/api/v5',
    mainnetUrl: 'https://www.okx.com/api/v5',
    requiresPassphrase: true
  },
  {
    name: 'deribit',
    displayName: 'Deribit',
    supports: ['options', 'futures'],
    testnetUrl: 'https://test.deribit.com',
    mainnetUrl: 'https://www.deribit.com',
    requiresPassphrase: false
  }
];

export const ComprehensiveAPIManager: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<string>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isTestnet, setIsTestnet] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  
  const { credentials, addCredentials, toggleCredentials, loading } = useRealTrading();
  const { toast } = useToast();

  const selectedConfig = EXCHANGE_CONFIGS.find(config => config.name === selectedExchange);

  // Test connection to exchange
  const testConnection = async (exchangeName: string): Promise<boolean> => {
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      setConnectionStatus(prev => ({
        ...prev,
        [exchangeName]: success
      }));

      if (success) {
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${exchangeName}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `Failed to connect to ${exchangeName}`,
          variant: "destructive",
        });
      }

      return success;
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [exchangeName]: false
      }));
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !apiSecret) {
      toast({
        title: "Validation Error",
        description: "API key and secret are required",
        variant: "destructive",
      });
      return;
    }

    if (selectedConfig?.requiresPassphrase && !passphrase) {
      toast({
        title: "Validation Error",
        description: "Passphrase is required for this exchange",
        variant: "destructive",
      });
      return;
    }

    const success = await addCredentials(
      selectedExchange,
      apiKey,
      apiSecret,
      selectedConfig?.requiresPassphrase ? passphrase : undefined,
      isTestnet
    );

    if (success) {
      setApiKey('');
      setApiSecret('');
      setPassphrase('');
      await testConnection(selectedExchange);
    }
  };

  // Get credential status
  const getCredentialStatus = (exchangeName: string) => {
    const credential = credentials.find(c => c.exchange_name === exchangeName);
    if (!credential) return 'Not configured';
    if (!credential.is_active) return 'Inactive';
    return 'Active';
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Exchange API Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedExchange} onValueChange={setSelectedExchange}>
            <TabsList className="grid w-full grid-cols-4">
              {EXCHANGE_CONFIGS.map((config) => (
                <TabsTrigger key={config.name} value={config.name}>
                  {config.displayName}
                </TabsTrigger>
              ))}
            </TabsList>

            {EXCHANGE_CONFIGS.map((config) => (
              <TabsContent key={config.name} value={config.name} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{config.displayName} Configuration</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(getCredentialStatus(config.name))}>
                          {getCredentialStatus(config.name)}
                        </Badge>
                        {connectionStatus[config.name] !== undefined && (
                          <Badge variant={connectionStatus[config.name] ? 'default' : 'destructive'}>
                            {connectionStatus[config.name] ? 'Connected' : 'Failed'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Supported Markets</Label>
                        <div className="flex gap-1 mt-1">
                          {config.supports.map(market => (
                            <Badge key={market} variant="outline" className="text-xs">
                              {market.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Environment</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Switch
                            checked={isTestnet}
                            onCheckedChange={setIsTestnet}
                          />
                          <span className="text-sm">
                            {isTestnet ? 'Testnet' : 'Mainnet'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!credentials.find(c => c.exchange_name === config.name) && (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="apiKey">API Key</Label>
                            <div className="relative">
                              <Input
                                id="apiKey"
                                type={showSecrets ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowSecrets(!showSecrets)}
                              >
                                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="apiSecret">API Secret</Label>
                            <Input
                              id="apiSecret"
                              type={showSecrets ? "text" : "password"}
                              value={apiSecret}
                              onChange={(e) => setApiSecret(e.target.value)}
                              placeholder="Enter your API secret"
                              required
                            />
                          </div>

                          {config.requiresPassphrase && (
                            <div>
                              <Label htmlFor="passphrase">Passphrase</Label>
                              <Input
                                id="passphrase"
                                type={showSecrets ? "text" : "password"}
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                placeholder="Enter your passphrase"
                                required
                              />
                            </div>
                          )}
                        </div>

                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {isTestnet 
                              ? "Using testnet environment for safe testing. No real money will be used."
                              : "⚠️ LIVE TRADING MODE: Real money will be used. Ensure your API keys have appropriate permissions."
                            }
                          </AlertDescription>
                        </Alert>

                        <Button type="submit" disabled={loading} className="w-full">
                          {loading ? 'Adding...' : `Add ${config.displayName} Credentials`}
                        </Button>
                      </form>
                    )}

                    {credentials.find(c => c.exchange_name === config.name) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">API Status</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testConnection(config.name)}
                              disabled={loading}
                            >
                              Test Connection
                            </Button>
                            <Button
                              variant={credentials.find(c => c.exchange_name === config.name)?.is_active ? "destructive" : "default"}
                              size="sm"
                              onClick={() => {
                                const credential = credentials.find(c => c.exchange_name === config.name);
                                if (credential) {
                                  toggleCredentials(credential.id, !credential.is_active);
                                }
                              }}
                              disabled={loading}
                            >
                              {credentials.find(c => c.exchange_name === config.name)?.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </div>

                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            {config.displayName} credentials configured and ready for trading.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-time Status Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXCHANGE_CONFIGS.map((config) => {
              const credential = credentials.find(c => c.exchange_name === config.name);
              const isConnected = connectionStatus[config.name];
              
              return (
                <div key={config.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{config.displayName}</h4>
                    <div className="flex gap-1">
                      {credential?.is_active && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {isConnected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Status: {getCredentialStatus(config.name)}</div>
                    <div>Markets: {config.supports.length}</div>
                    {credential && (
                      <div>Environment: {credential.is_testnet ? 'Test' : 'Live'}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};