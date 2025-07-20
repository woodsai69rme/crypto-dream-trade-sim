import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Bitcoin,
  BarChart3,
  Zap,
  Database,
  Cloud,
  Smartphone,
  Mail,
  MessageSquare,
  Bell
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: 'exchange' | 'data' | 'ai' | 'notification' | 'social' | 'payment' | 'custom';
  category: string;
  description: string;
  icon: React.ReactNode;
  fields: IntegrationField[];
  freeFeatures: string[];
  paidFeatures?: string[];
  isConnected: boolean;
  isTestnet?: boolean;
  credentials?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSync?: string;
}

interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

interface CustomIntegration {
  name: string;
  type: string;
  description: string;
  fields: IntegrationField[];
}

export const ComprehensiveIntegrationsManager = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [activeTab, setActiveTab] = useState('exchanges');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [customIntegration, setCustomIntegration] = useState<CustomIntegration>({
    name: '',
    type: 'custom',
    description: '',
    fields: []
  });

  // Initialize integrations
  useEffect(() => {
    setIntegrations([
      // Free Cryptocurrency Exchanges
      {
        id: 'binance',
        name: 'Binance',
        type: 'exchange',
        category: 'Cryptocurrency Exchange',
        description: 'World\'s largest crypto exchange with free API access',
        icon: <Bitcoin className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your Binance API Key' },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'Your Binance Secret Key' },
          { key: 'testnet', label: 'Use Testnet', type: 'select', required: false, options: ['true', 'false'] }
        ],
        freeFeatures: ['Market Data', 'Account Info', 'Order History', 'Balance Check'],
        paidFeatures: ['Advanced Trading', 'Margin Trading'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Pro',
        type: 'exchange',
        category: 'Cryptocurrency Exchange',
        description: 'Professional trading platform with free API',
        icon: <TrendingUp className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'secret', label: 'API Secret', type: 'password', required: true },
          { key: 'passphrase', label: 'Passphrase', type: 'password', required: true },
          { key: 'sandbox', label: 'Sandbox Mode', type: 'select', required: false, options: ['true', 'false'] }
        ],
        freeFeatures: ['Market Data', 'Portfolio Management', 'Order Execution'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'kraken',
        name: 'Kraken',
        type: 'exchange',
        category: 'Cryptocurrency Exchange',
        description: 'Secure crypto exchange with robust API',
        icon: <Globe className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'privateKey', label: 'Private Key', type: 'password', required: true }
        ],
        freeFeatures: ['Market Data', 'Account Info', 'Trading'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'kucoin',
        name: 'KuCoin',
        type: 'exchange',
        category: 'Cryptocurrency Exchange',
        description: 'Global crypto exchange with free tier',
        icon: <DollarSign className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
          { key: 'passphrase', label: 'Passphrase', type: 'password', required: true }
        ],
        freeFeatures: ['Spot Trading', 'Market Data', 'Account Management'],
        isConnected: false,
        status: 'disconnected'
      },

      // Free Data APIs
      {
        id: 'coingecko',
        name: 'CoinGecko',
        type: 'data',
        category: 'Market Data',
        description: 'Free cryptocurrency data API',
        icon: <BarChart3 className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key (Optional)', type: 'password', required: false, description: 'Free tier available without API key' }
        ],
        freeFeatures: ['Price Data', 'Market Cap', 'Volume', 'Historical Data'],
        paidFeatures: ['Higher Rate Limits', 'Premium Endpoints'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'coinmarketcap',
        name: 'CoinMarketCap',
        type: 'data',
        category: 'Market Data',
        description: 'Cryptocurrency market data API',
        icon: <Database className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true, description: 'Free tier: 10,000 calls/month' }
        ],
        freeFeatures: ['Basic Market Data', 'Cryptocurrency Info', 'Price Conversion'],
        paidFeatures: ['Advanced Analytics', 'Higher Limits'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'cryptocompare',
        name: 'CryptoCompare',
        type: 'data',
        category: 'Market Data',
        description: 'Comprehensive crypto data API',
        icon: <Globe className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ],
        freeFeatures: ['Price Data', 'Historical Data', 'News'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'alphavantage',
        name: 'Alpha Vantage',
        type: 'data',
        category: 'Financial Data',
        description: 'Free stock and crypto API',
        icon: <TrendingUp className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ],
        freeFeatures: ['Stock Data', 'Crypto Data', 'Technical Indicators'],
        isConnected: false,
        status: 'disconnected'
      },

      // AI APIs
      {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'ai',
        category: 'AI Models',
        description: 'Access to multiple AI models',
        icon: <Zap className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ],
        freeFeatures: ['Multiple AI Models', 'Pay-per-use'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'huggingface',
        name: 'Hugging Face',
        type: 'ai',
        category: 'AI Models',
        description: 'Free AI model inference',
        icon: <Cloud className="w-5 h-5" />,
        fields: [
          { key: 'apiKey', label: 'API Token', type: 'password', required: true }
        ],
        freeFeatures: ['Model Inference', 'Text Generation', 'Sentiment Analysis'],
        isConnected: false,
        status: 'disconnected'
      },

      // Notification Services
      {
        id: 'discord',
        name: 'Discord Webhook',
        type: 'notification',
        category: 'Notifications',
        description: 'Send notifications to Discord',
        icon: <MessageSquare className="w-5 h-5" />,
        fields: [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true }
        ],
        freeFeatures: ['Message Sending', 'Embeds', 'File Uploads'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'slack',
        name: 'Slack Webhook',
        type: 'notification',
        category: 'Notifications',
        description: 'Send notifications to Slack',
        icon: <Bell className="w-5 h-5" />,
        fields: [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true }
        ],
        freeFeatures: ['Message Sending', 'Rich Formatting'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'telegram',
        name: 'Telegram Bot',
        type: 'notification',
        category: 'Notifications',
        description: 'Send messages via Telegram bot',
        icon: <Smartphone className="w-5 h-5" />,
        fields: [
          { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
          { key: 'chatId', label: 'Chat ID', type: 'text', required: true }
        ],
        freeFeatures: ['Message Sending', 'Media Support'],
        isConnected: false,
        status: 'disconnected'
      },

      // Social APIs
      {
        id: 'twitter',
        name: 'Twitter/X API',
        type: 'social',
        category: 'Social Media',
        description: 'Twitter API for social sentiment',
        icon: <Globe className="w-5 h-5" />,
        fields: [
          { key: 'bearerToken', label: 'Bearer Token', type: 'password', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: false }
        ],
        freeFeatures: ['Tweet Search', 'User Data', 'Basic Analytics'],
        isConnected: false,
        status: 'disconnected'
      },
      {
        id: 'reddit',
        name: 'Reddit API',
        type: 'social',
        category: 'Social Media',
        description: 'Reddit API for sentiment analysis',
        icon: <MessageSquare className="w-5 h-5" />,
        fields: [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'userAgent', label: 'User Agent', type: 'text', required: true }
        ],
        freeFeatures: ['Post Data', 'Comment Analysis', 'Subreddit Stats'],
        isConnected: false,
        status: 'disconnected'
      }
    ]);
  }, []);

  const togglePasswordVisibility = (integrationId: string, fieldKey: string) => {
    const key = `${integrationId}-${fieldKey}`;
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateIntegrationField = (integrationId: string, fieldKey: string, value: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? {
            ...integration,
            credentials: {
              ...integration.credentials,
              [fieldKey]: value
            }
          }
        : integration
    ));
  };

  const testConnection = async (integration: Integration) => {
    setTestingIntegration(integration.id);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: 'connected', isConnected: true, lastSync: new Date().toISOString() }
          : int
      ));
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${integration.name}`,
      });
    } catch (error) {
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: 'error', isConnected: false }
          : int
      ));
      
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${integration.name}`,
        variant: "destructive",
      });
    } finally {
      setTestingIntegration(null);
    }
  };

  const disconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: 'disconnected', 
            isConnected: false, 
            credentials: {},
            lastSync: undefined 
          }
        : integration
    ));
    
    toast({
      title: "Disconnected",
      description: "Integration disconnected successfully",
    });
  };

  const addCustomField = () => {
    setCustomIntegration(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          key: `field${prev.fields.length + 1}`,
          label: '',
          type: 'text',
          required: false
        }
      ]
    }));
  };

  const updateCustomField = (index: number, field: Partial<IntegrationField>) => {
    setCustomIntegration(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...field } : f)
    }));
  };

  const removeCustomField = (index: number) => {
    setCustomIntegration(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const saveCustomIntegration = () => {
    if (!customIntegration.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the custom integration",
        variant: "destructive",
      });
      return;
    }

    const newIntegration: Integration = {
      id: `custom-${Date.now()}`,
      name: customIntegration.name,
      type: 'custom',
      category: 'Custom Integration',
      description: customIntegration.description || 'Custom integration',
      icon: <Key className="w-5 h-5" />,
      fields: customIntegration.fields,
      freeFeatures: ['Custom Integration'],
      isConnected: false,
      status: 'disconnected'
    };

    setIntegrations(prev => [...prev, newIntegration]);
    setCustomIntegration({ name: '', type: 'custom', description: '', fields: [] });
    
    toast({
      title: "Success",
      description: "Custom integration added successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    switch (activeTab) {
      case 'exchanges':
        return integration.type === 'exchange';
      case 'data':
        return integration.type === 'data';
      case 'ai':
        return integration.type === 'ai';
      case 'notifications':
        return integration.type === 'notification';
      case 'social':
        return integration.type === 'social';
      case 'custom':
        return integration.type === 'custom';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Comprehensive Integrations Manager
              <Badge className="bg-blue-500/20 text-blue-400">
                {integrations.filter(i => i.isConnected).length} Connected
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 p-2 bg-blue-600/20 rounded-lg text-blue-400" />
              <div>
                <p className="text-sm font-medium">Exchanges</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.type === 'exchange').length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 p-2 bg-green-600/20 rounded-lg text-green-400" />
              <div>
                <p className="text-sm font-medium">Data APIs</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.type === 'data').length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 p-2 bg-purple-600/20 rounded-lg text-purple-400" />
              <div>
                <p className="text-sm font-medium">AI Services</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.type === 'ai').length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-8 h-8 p-2 bg-orange-600/20 rounded-lg text-orange-400" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.type === 'notification').length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-white/10">
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="data">Data APIs</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="add-custom">Add Custom</TabsTrigger>
        </TabsList>

        {['exchanges', 'data', 'ai', 'notifications', 'social', 'custom'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {integration.icon}
                        <div>
                          <h3 className="font-medium text-white">{integration.name}</h3>
                          <p className="text-sm text-white/60">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                        {integration.isConnected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => disconnect(integration.id)}
                            className="border-white/20"
                          >
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p className="font-medium text-green-400 mb-1">Free Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.freeFeatures.map((feature, index) => (
                          <Badge key={index} className="bg-green-500/20 text-green-400 text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      {integration.paidFeatures && (
                        <>
                          <p className="font-medium text-orange-400 mb-1 mt-2">Paid Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.paidFeatures.map((feature, index) => (
                              <Badge key={index} className="bg-orange-500/20 text-orange-400 text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {!integration.isConnected && (
                      <div className="space-y-3">
                        {integration.fields.map((field) => (
                          <div key={field.key} className="space-y-1">
                            <Label className="text-white">{field.label}</Label>
                            {field.description && (
                              <p className="text-xs text-white/60">{field.description}</p>
                            )}
                            <div className="flex gap-2">
                              {field.type === 'select' ? (
                                <Select
                                  value={integration.credentials?.[field.key] || ''}
                                  onValueChange={(value) => updateIntegrationField(integration.id, field.key, value)}
                                >
                                  <SelectTrigger className="bg-white/10 border-white/20">
                                    <SelectValue placeholder={field.placeholder} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === 'textarea' ? (
                                <Textarea
                                  placeholder={field.placeholder}
                                  value={integration.credentials?.[field.key] || ''}
                                  onChange={(e) => updateIntegrationField(integration.id, field.key, e.target.value)}
                                  className="bg-white/10 border-white/20"
                                />
                              ) : (
                                <Input
                                  type={field.type === 'password' && !showPasswords[`${integration.id}-${field.key}`] ? 'password' : 'text'}
                                  placeholder={field.placeholder}
                                  value={integration.credentials?.[field.key] || ''}
                                  onChange={(e) => updateIntegrationField(integration.id, field.key, e.target.value)}
                                  className="bg-white/10 border-white/20"
                                />
                              )}
                              {field.type === 'password' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20"
                                  onClick={() => togglePasswordVisibility(integration.id, field.key)}
                                >
                                  {showPasswords[`${integration.id}-${field.key}`] ? 
                                    <EyeOff className="w-4 h-4" /> : 
                                    <Eye className="w-4 h-4" />
                                  }
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={() => testConnection(integration)}
                          disabled={testingIntegration === integration.id}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {testingIntegration === integration.id ? "Testing..." : "Test Connection"}
                        </Button>
                      </div>
                    )}

                    {integration.isConnected && integration.lastSync && (
                      <div className="text-sm text-white/60">
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="add-custom" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Add Custom Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Integration Name</Label>
                <Input
                  placeholder="e.g., My Custom API"
                  value={customIntegration.name}
                  onChange={(e) => setCustomIntegration(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  placeholder="Describe what this integration does..."
                  value={customIntegration.description}
                  onChange={(e) => setCustomIntegration(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Fields</Label>
                  <Button size="sm" onClick={addCustomField} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </Button>
                </div>
                
                {customIntegration.fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-white/5 rounded-lg">
                    <Input
                      placeholder="Field Label"
                      value={field.label}
                      onChange={(e) => updateCustomField(index, { label: e.target.value })}
                      className="bg-white/10 border-white/20"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateCustomField(index, { type: value as any })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="password">Password</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateCustomField(index, { required: checked })}
                      />
                      <Label className="text-white text-sm">Required</Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCustomField(index)}
                      className="border-white/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={saveCustomIntegration}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Save Custom Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};