import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Key, Plus, Trash2, TestTube, CheckCircle, XCircle, Eye, EyeOff, Bot, TrendingUp } from "lucide-react";
import { OpenRouterManagement } from './OpenRouterManagement';
import { DeribitIntegration } from './DeribitIntegration';

interface APIConnection {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTested?: string;
  isActive: boolean;
}

export const APIManagement = () => {
  const { toast } = useToast();
  const [apis, setApis] = useState<APIConnection[]>([
    {
      id: '1',
      name: 'OpenRouter',
      provider: 'openrouter',
      apiKey: 'sk-or-***',
      baseUrl: 'https://openrouter.ai/api/v1',
      status: 'connected',
      lastTested: new Date().toISOString(),
      isActive: true
    },
    {
      id: '2', 
      name: 'CoinGecko',
      provider: 'coingecko',
      apiKey: 'CG-***',
      baseUrl: 'https://api.coingecko.com/api/v3',
      status: 'connected',
      lastTested: new Date(Date.now() - 300000).toISOString(),
      isActive: true
    },
    {
      id: '3',
      name: 'Deribit Testnet',
      provider: 'deribit',
      apiKey: 'testnet-***',
      baseUrl: 'https://test.deribit.com/api/v2',
      status: 'disconnected',
      isActive: false
    }
  ]);

  const [newApi, setNewApi] = useState({
    name: '',
    provider: '',
    apiKey: '',
    baseUrl: ''
  });

  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [testing, setTesting] = useState<{[key: string]: boolean}>({});

  const addAPI = () => {
    if (!newApi.name || !newApi.provider || !newApi.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const api: APIConnection = {
      id: Date.now().toString(),
      ...newApi,
      status: 'disconnected',
      isActive: false
    };

    setApis(prev => [...prev, api]);
    setNewApi({ name: '', provider: '', apiKey: '', baseUrl: '' });
    
    toast({
      title: "API Added",
      description: `${newApi.name} has been added to your API connections`,
    });
  };

  const testAPI = async (apiId: string) => {
    setTesting(prev => ({ ...prev, [apiId]: true }));
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setApis(prev => prev.map(api => 
        api.id === apiId 
          ? { ...api, status: 'connected', lastTested: new Date().toISOString() }
          : api
      ));

      toast({
        title: "API Test Successful",
        description: "API connection is working properly",
      });
    } catch (error) {
      setApis(prev => prev.map(api => 
        api.id === apiId 
          ? { ...api, status: 'error' }
          : api
      ));

      toast({
        title: "API Test Failed",
        description: "Could not connect to the API",
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, [apiId]: false }));
    }
  };

  const removeAPI = (apiId: string) => {
    setApis(prev => prev.filter(api => api.id !== apiId));
    toast({
      title: "API Removed",
      description: "API connection has been deleted",
    });
  };

  const toggleKeyVisibility = (apiId: string) => {
    setShowKeys(prev => ({ ...prev, [apiId]: !prev[apiId] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      case 'disconnected': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">API Management</h2>
      </div>

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="existing">Existing APIs</TabsTrigger>
          <TabsTrigger value="openrouter">
            <Bot className="w-4 h-4 mr-2" />
            OpenRouter
          </TabsTrigger>
          <TabsTrigger value="deribit">
            <TrendingUp className="w-4 h-4 mr-2" />
            Deribit
          </TabsTrigger>
          <TabsTrigger value="add-new">Add New API</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">
          <div className="space-y-4">
            {apis.map((api) => (
              <Card key={api.id} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{api.name}</h3>
                        <p className="text-sm text-white/60">{api.provider}</p>
                      </div>
                      <Badge className={getStatusColor(api.status)}>
                        {getStatusIcon(api.status)}
                        {api.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testAPI(api.id)}
                        disabled={testing[api.id]}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        {testing[api.id] ? 'Testing...' : 'Test'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeAPI(api.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-white/60">API Key</Label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showKeys[api.id] ? api.apiKey : '••••••••••••••••'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(api.id)}
                        >
                          {showKeys[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    {api.baseUrl && (
                      <div>
                        <Label className="text-white/60">Base URL</Label>
                        <p className="font-mono text-xs break-all">{api.baseUrl}</p>
                      </div>
                    )}
                  </div>

                  {api.lastTested && (
                    <p className="text-xs text-white/40 mt-2">
                      Last tested: {new Date(api.lastTested).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="openrouter">
          <OpenRouterManagement />
        </TabsContent>

        <TabsContent value="deribit">
          <DeribitIntegration />
        </TabsContent>

        <TabsContent value="add-new">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New API Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api-name">API Name *</Label>
                  <Input
                    id="api-name"
                    value={newApi.name}
                    onChange={(e) => setNewApi(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., OpenRouter, Binance"
                    className="bg-card/20 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    value={newApi.provider}
                    onChange={(e) => setNewApi(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., openrouter, binance"
                    className="bg-card/20 border-white/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="api-key">API Key *</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newApi.apiKey}
                  onChange={(e) => setNewApi(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Your API key"
                  className="bg-card/20 border-white/20"
                />
              </div>

              <div>
                <Label htmlFor="base-url">Base URL (Optional)</Label>
                <Input
                  id="base-url"
                  value={newApi.baseUrl}
                  onChange={(e) => setNewApi(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                  className="bg-card/20 border-white/20"
                />
              </div>

              <Button onClick={addAPI} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add API Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
