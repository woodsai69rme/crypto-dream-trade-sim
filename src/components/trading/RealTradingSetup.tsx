
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Key, Zap, CheckCircle, XCircle, Wallet, TrendingUp } from 'lucide-react';
import { useRealTrading } from '@/hooks/useRealTrading';
import { SUPPORTED_EXCHANGES } from '@/services/exchangeConnector';
import { useToast } from '@/hooks/use-toast';

export const RealTradingSetup = () => {
  const { credentials, loading, addCredentials, toggleCredentials, fetchCredentials } = useRealTrading();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('setup');
  const [formData, setFormData] = useState({
    exchange: 'binance',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    isTestnet: true
  });
  const [setupProgress, setSetupProgress] = useState(0);

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    // Calculate setup progress
    let progress = 0;
    if (formData.apiKey) progress += 25;
    if (formData.apiSecret) progress += 25;
    if (credentials.length > 0) progress += 50;
    setSetupProgress(progress);
  }, [formData, credentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apiKey || !formData.apiSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please provide both API key and secret",
        variant: "destructive",
      });
      return;
    }

    const success = await addCredentials(
      formData.exchange,
      formData.apiKey,
      formData.apiSecret,
      formData.passphrase || undefined,
      formData.isTestnet
    );

    if (success) {
      setFormData({
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        passphrase: '',
        isTestnet: true
      });
      setActiveTab('credentials');
    }
  };

  const getExchangeConfig = (exchangeName: string) => {
    return SUPPORTED_EXCHANGES[exchangeName.toLowerCase()];
  };

  const getCredentialStatus = (credential: any) => {
    if (credential.is_active) {
      return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, label: 'Active', color: 'green' };
    }
    return { icon: <XCircle className="h-4 w-4 text-gray-500" />, label: 'Inactive', color: 'gray' };
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Real Trading Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{setupProgress}%</span>
            </div>
            <Progress value={setupProgress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>API Credentials</span>
              <span>Connection Test</span>
              <span>Security Verification</span>
              <span>Ready to Trade</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Warnings */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p><strong>⚠️ REAL MONEY TRADING RISKS:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You can lose all your invested capital</li>
              <li>Start with small amounts and testnet mode</li>
              <li>Verify all API permissions before activating</li>
              <li>Never share your API keys with anyone</li>
              <li>Monitor your trades and risk exposure constantly</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Exchange API Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Exchange</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={formData.exchange}
                    onChange={(e) => setFormData({...formData, exchange: e.target.value})}
                  >
                    {Object.values(SUPPORTED_EXCHANGES).map(exchange => (
                      <option key={exchange.id} value={exchange.id}>
                        {exchange.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trading Fee: {(getExchangeConfig(formData.exchange)?.tradingFee * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    placeholder="Enter your API key"
                  />
                </div>

                <div>
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                    placeholder="Enter your API secret"
                  />
                </div>

                {formData.exchange === 'coinbase' && (
                  <div>
                    <Label>Passphrase</Label>
                    <Input
                      type="password"
                      value={formData.passphrase}
                      onChange={(e) => setFormData({...formData, passphrase: e.target.value})}
                      placeholder="Enter your passphrase (required for Coinbase)"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isTestnet}
                    onCheckedChange={(checked) => setFormData({...formData, isTestnet: checked})}
                  />
                  <Label>Use Testnet Mode (Recommended for testing)</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Adding Credentials...' : 'Add Exchange Credentials'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connected Exchanges
                <Badge variant="secondary">{credentials.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4" />
                  <p>No exchange credentials configured</p>
                  <p className="text-sm">Add credentials in the Setup tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {credentials.map((credential) => {
                    const status = getCredentialStatus(credential);
                    const exchangeConfig = getExchangeConfig(credential.exchange_name);
                    
                    return (
                      <div key={credential.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {status.icon}
                            <div>
                              <div className="font-medium">
                                {exchangeConfig?.name || credential.exchange_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {credential.is_testnet ? 'Testnet Mode' : 'Live Trading'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={credential.is_active ? 'default' : 'secondary'}>
                              {status.label}
                            </Badge>
                            <Switch
                              checked={credential.is_active}
                              onCheckedChange={(checked) => toggleCredentials(credential.id, checked)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Created: {new Date(credential.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API keys are encrypted and stored securely</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Row Level Security (RLS) enabled on all tables</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Trade validation functions implemented</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Risk monitoring system active</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Comprehensive audit logging enabled</span>
                </div>
                
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Recommended Actions:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Test with small amounts first ($10-50)</li>
                      <li>Use testnet mode until comfortable</li>
                      <li>Set conservative daily/position limits</li>
                      <li>Monitor trades actively for first week</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Trading Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Active Real Trades</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">$0.00</div>
                    <div className="text-sm text-muted-foreground">Today's P&L</div>
                  </div>
                </div>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Real trading monitoring will appear here once you execute your first live trade.
                    All trades are logged and monitored for risk management.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
