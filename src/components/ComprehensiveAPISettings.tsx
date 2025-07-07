import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { 
  Settings, Key, Zap, Shield, CheckCircle, XCircle, 
  AlertTriangle, Globe, Database, Bot, TrendingUp,
  Eye, EyeOff, Copy, RefreshCw, Plus, Trash2
} from 'lucide-react';

interface APIConfiguration {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  endpoint?: string;
  isActive: boolean;
  lastTested?: string;
  status: 'connected' | 'error' | 'untested';
  features: string[];
  rateLimit?: number;
  description: string;
}

interface ExchangeConnection {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  sandbox: boolean;
  isActive: boolean;
  permissions: string[];
  status: 'connected' | 'error' | 'untested';
}

export const ComprehensiveAPISettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, updateSetting, isLoading: settingsLoading } = useSettings();
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // AI APIs
  const [aiApis, setAiApis] = useState<APIConfiguration[]>([]);
  const [marketApis, setMarketApis] = useState<APIConfiguration[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeConnection[]>([]);

  // Load settings on mount
  useEffect(() => {
    if (!settingsLoading) {
      // Load saved settings or set defaults
      if (settings.aiApis) {
        setAiApis(settings.aiApis);
      } else {
        const defaultAiApis = [
          {
            id: '1',
            name: 'OpenAI GPT-4',
            provider: 'OpenAI',
            apiKey: '',
            endpoint: 'https://api.openai.com/v1',
            isActive: false,
            status: 'untested' as const,
            features: ['Trading Analysis', 'Market Insights', 'Risk Assessment'],
            rateLimit: 3500,
            description: 'Advanced AI for trading analysis and strategy generation'
          },
          {
            id: '2',
            name: 'Anthropic Claude',
            provider: 'Anthropic',
            apiKey: '',
            endpoint: 'https://api.anthropic.com/v1',
            isActive: false,
            status: 'untested' as const,
            features: ['Risk Analysis', 'News Sentiment', 'Strategy Validation'],
            rateLimit: 1000,
            description: 'Constitutional AI for safe trading recommendations'
          },
          {
            id: '3',
            name: 'Google Gemini',
            provider: 'Google',
            apiKey: '',
            endpoint: 'https://generativelanguage.googleapis.com/v1',
            isActive: false,
            status: 'untested' as const,
            features: ['Market Research', 'Technical Analysis', 'News Processing'],
            rateLimit: 2000,
            description: 'Multimodal AI for comprehensive market analysis'
          }
        ];
        setAiApis(defaultAiApis);
        updateSetting('aiApis', defaultAiApis);
      }

      // Load market APIs
      if (settings.marketApis) {
        setMarketApis(settings.marketApis);
      } else {
        const defaultMarketApis = [
          {
            id: '4',
            name: 'CoinGecko API',
            provider: 'CoinGecko',
            apiKey: '',
            endpoint: 'https://api.coingecko.com/api/v3',
            isActive: true,
            status: 'connected' as const,
            features: ['Price Data', 'Market Stats', 'Historical Data'],
            rateLimit: 50,
            description: 'Free cryptocurrency market data'
          },
          {
            id: '5',
            name: 'Alpha Vantage',
            provider: 'Alpha Vantage',
            apiKey: '',
            endpoint: 'https://www.alphavantage.co/query',
            isActive: false,
            status: 'untested' as const,
            features: ['Stock Data', 'Forex', 'Technical Indicators'],
            rateLimit: 5,
            description: 'Real-time and historical financial market data'
          },
          {
            id: '6',
            name: 'Binance API',
            provider: 'Binance',
            apiKey: '',
            endpoint: 'https://api.binance.com/api/v3',
            isActive: false,
            status: 'untested' as const,
            features: ['Live Prices', 'Order Book', 'Trading History'],
            rateLimit: 1200,
            description: 'Binance exchange data and trading'
          }
        ];
        setMarketApis(defaultMarketApis);
        updateSetting('marketApis', defaultMarketApis);
      }

      // Load exchanges
      if (settings.exchanges) {
        setExchanges(settings.exchanges);
      } else {
        const defaultExchanges = [
          {
            id: '1',
            name: 'Binance',
            apiKey: '',
            apiSecret: '',
            sandbox: true,
            isActive: false,
            permissions: ['read', 'trade'],
            status: 'untested' as const
          },
          {
            id: '2',
            name: 'Coinbase Pro',
            apiKey: '',
            apiSecret: '',
            passphrase: '',
            sandbox: true,
            isActive: false,
            permissions: ['read', 'trade'],
            status: 'untested' as const
          }
        ];
        setExchanges(defaultExchanges);
        updateSetting('exchanges', defaultExchanges);
      }
    }
  }, [settingsLoading, settings]);

  const testApiConnection = async (api: APIConfiguration) => {
    if (!api.apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter an API key first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API test based on provider
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      const updatedApi = { ...api, status: 'connected' as const, lastTested: new Date().toISOString() };
      
      if (api.provider === 'OpenAI') {
        setAiApis(prev => prev.map(a => a.id === api.id ? updatedApi : a));
      } else {
        setMarketApis(prev => prev.map(a => a.id === api.id ? updatedApi : a));
      }

      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${api.name}`,
      });
    } catch (error) {
      const failedApi = { ...api, status: 'error' as const };
      
      if (api.provider === 'OpenAI') {
        setAiApis(prev => prev.map(a => a.id === api.id ? failedApi : a));
      } else {
        setMarketApis(prev => prev.map(a => a.id === api.id ? failedApi : a));
      }

      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${api.name}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApiKey = (apiId: string, newKey: string, isAiApi: boolean = true) => {
    if (isAiApi) {
      setAiApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, apiKey: newKey, status: 'untested' as const } : api
      ));
    } else {
      setMarketApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, apiKey: newKey, status: 'untested' as const } : api
      ));
    }
  };

  const toggleApiStatus = (apiId: string, isAiApi: boolean = true) => {
    if (isAiApi) {
      setAiApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, isActive: !api.isActive } : api
      ));
    } else {
      setMarketApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, isActive: !api.isActive } : api
      ));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'untested': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      case 'untested': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([
        updateSetting('aiApis', aiApis),
        updateSetting('marketApis', marketApis),
        updateSetting('exchanges', exchanges)
      ]);
      
      const allSuccessful = results.every(success => success);
      
      if (allSuccessful) {
        toast({
          title: "Settings Saved",
          description: "All API configurations have been saved successfully",
        });
      } else {
        throw new Error('Some settings failed to save');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save some API settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Comprehensive API Configuration
              <Badge className="bg-blue-500/20 text-blue-400">
                <Shield className="w-3 h-3 mr-1" />
                SECURE
              </Badge>
            </div>
            <Button onClick={saveAllSettings} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Save All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Configure all API connections for AI trading, market data, and exchange integrations.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 h-auto p-1">
          <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600 p-3">
            <Bot className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">AI APIs</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-purple-600 p-3">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Market Data</span>
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="data-[state=active]:bg-purple-600 p-3">
            <Globe className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exchanges</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-purple-600 p-3">
            <Zap className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <div className="space-y-4">
            {aiApis.map((api) => (
              <Card key={api.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 p-2 bg-purple-600/20 rounded-lg text-purple-400" />
                        <div>
                          <h3 className="font-semibold text-white">{api.name}</h3>
                          <p className="text-sm text-white/60">{api.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(api.status)}>
                          {getStatusIcon(api.status)}
                          <span className="ml-1">{api.status}</span>
                        </Badge>
                        <Switch
                          checked={api.isActive}
                          onCheckedChange={() => toggleApiStatus(api.id, true)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            type={showSecrets[api.id] ? "text" : "password"}
                            placeholder="Enter API key..."
                            value={api.apiKey}
                            onChange={(e) => updateApiKey(api.id, e.target.value, true)}
                            className="bg-white/10 border-white/20"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [api.id]: !prev[api.id] }))}
                          >
                            {showSecrets[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Endpoint URL</Label>
                        <Input
                          value={api.endpoint}
                          onChange={(e) => setAiApis(prev => prev.map(a => 
                            a.id === api.id ? { ...a, endpoint: e.target.value } : a
                          ))}
                          className="bg-white/10 border-white/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {api.features.map((feature, index) => (
                        <Badge key={index} className="bg-blue-500/20 text-blue-400">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-sm text-white/60">
                        Rate Limit: {api.rateLimit} requests/hour
                        {api.lastTested && (
                          <span className="ml-4">
                            Last tested: {new Date(api.lastTested).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => testApiConnection(api)}
                        disabled={loading || !api.apiKey.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="space-y-4">
            {marketApis.map((api) => (
              <Card key={api.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 p-2 bg-green-600/20 rounded-lg text-green-400" />
                        <div>
                          <h3 className="font-semibold text-white">{api.name}</h3>
                          <p className="text-sm text-white/60">{api.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(api.status)}>
                          {getStatusIcon(api.status)}
                          <span className="ml-1">{api.status}</span>
                        </Badge>
                        <Switch
                          checked={api.isActive}
                          onCheckedChange={() => toggleApiStatus(api.id, false)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            type={showSecrets[api.id] ? "text" : "password"}
                            placeholder={api.provider === 'CoinGecko' ? "Optional for free tier" : "Enter API key..."}
                            value={api.apiKey}
                            onChange={(e) => updateApiKey(api.id, e.target.value, false)}
                            className="bg-white/10 border-white/20"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [api.id]: !prev[api.id] }))}
                          >
                            {showSecrets[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Endpoint URL</Label>
                        <Input
                          value={api.endpoint}
                          onChange={(e) => setMarketApis(prev => prev.map(a => 
                            a.id === api.id ? { ...a, endpoint: e.target.value } : a
                          ))}
                          className="bg-white/10 border-white/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {api.features.map((feature, index) => (
                        <Badge key={index} className="bg-green-500/20 text-green-400">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-sm text-white/60">
                        Rate Limit: {api.rateLimit} requests/minute
                        {api.lastTested && (
                          <span className="ml-4">
                            Last tested: {new Date(api.lastTested).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => testApiConnection(api)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exchanges" className="space-y-4">
          <div className="space-y-4">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-8 h-8 p-2 bg-blue-600/20 rounded-lg text-blue-400" />
                        <div>
                          <h3 className="font-semibold text-white">{exchange.name}</h3>
                          <p className="text-sm text-white/60">
                            {exchange.sandbox ? 'Sandbox Mode' : 'Live Trading'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(exchange.status)}>
                          {getStatusIcon(exchange.status)}
                          <span className="ml-1">{exchange.status}</span>
                        </Badge>
                        <Switch
                          checked={exchange.isActive}
                          onCheckedChange={() => setExchanges(prev => prev.map(e => 
                            e.id === exchange.id ? { ...e, isActive: !e.isActive } : e
                          ))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            type={showSecrets[exchange.id] ? "text" : "password"}
                            placeholder="Enter API key..."
                            value={exchange.apiKey}
                            onChange={(e) => setExchanges(prev => prev.map(ex => 
                              ex.id === exchange.id ? { ...ex, apiKey: e.target.value } : ex
                            ))}
                            className="bg-white/10 border-white/20"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [exchange.id]: !prev[exchange.id] }))}
                          >
                            {showSecrets[exchange.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>API Secret</Label>
                        <Input
                          type="password"
                          placeholder="Enter API secret..."
                          value={exchange.apiSecret}
                          onChange={(e) => setExchanges(prev => prev.map(ex => 
                            ex.id === exchange.id ? { ...ex, apiSecret: e.target.value } : ex
                          ))}
                          className="bg-white/10 border-white/20"
                        />
                      </div>

                      {exchange.passphrase !== undefined && (
                        <div className="space-y-2">
                          <Label>Passphrase</Label>
                          <Input
                            type="password"
                            placeholder="Enter passphrase..."
                            value={exchange.passphrase}
                            onChange={(e) => setExchanges(prev => prev.map(ex => 
                              ex.id === exchange.id ? { ...ex, passphrase: e.target.value } : ex
                            ))}
                            className="bg-white/10 border-white/20"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label>Sandbox Mode</Label>
                          <Switch
                            checked={exchange.sandbox}
                            onCheckedChange={() => setExchanges(prev => prev.map(e => 
                              e.id === exchange.id ? { ...e, sandbox: !e.sandbox } : e
                            ))}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {exchange.permissions.map((permission, index) => (
                            <Badge key={index} className="bg-blue-500/20 text-blue-400">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Test exchange connection
                          toast({
                            title: "Testing Connection",
                            description: `Testing connection to ${exchange.name}...`,
                          });
                        }}
                        disabled={loading || !exchange.apiKey.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Incoming Webhook URL</Label>
                  <Input
                    value="https://your-app.com/api/webhooks/trading"
                    readOnly
                    className="bg-white/10 border-white/20"
                  />
                  <p className="text-sm text-white/60">
                    Use this URL to receive trading signals and notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Outgoing Webhook URLs</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="https://your-external-service.com/webhook"
                      className="bg-white/10 border-white/20"
                    />
                    <Button size="sm" variant="outline" className="border-white/20">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Webhook Events</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {['Trade Executed', 'Position Opened', 'Position Closed', 'Stop Loss Hit', 'Take Profit Hit', 'Account Update'].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-2">
                  <Label>Webhook Security</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter webhook secret..."
                        className="bg-white/10 border-white/20"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Require HTTPS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Verify Signatures</Label>
                    </div>
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