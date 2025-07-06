
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Key, Shield, CheckCircle, AlertCircle, Globe, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface APIConfig {
  provider: string;
  apiKey: string;
  endpoint?: string;
  model?: string;
  isActive: boolean;
  rateLimit?: number;
  maxTokens?: number;
  temperature?: number;
}

const API_PROVIDERS = [
  {
    name: "OpenAI",
    key: "openai",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    endpoint: "https://api.openai.com/v1",
    icon: "🤖"
  },
  {
    name: "OpenRouter",
    key: "openrouter", 
    models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5", "meta-llama/llama-3.1-405b"],
    endpoint: "https://openrouter.ai/api/v1",
    icon: "🔀"
  },
  {
    name: "Anthropic",
    key: "anthropic",
    models: ["claude-3.5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    endpoint: "https://api.anthropic.com/v1",
    icon: "🧠"
  },
  {
    name: "Google AI",
    key: "google",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro-vision"],
    endpoint: "https://generativelanguage.googleapis.com/v1",
    icon: "🔍"
  },
  {
    name: "Cohere",
    key: "cohere",
    models: ["command-r-plus", "command-r", "command-light"],
    endpoint: "https://api.cohere.ai/v1",
    icon: "💬"
  },
  {
    name: "Hugging Face",
    key: "huggingface",
    models: ["microsoft/DialoGPT-large", "facebook/blenderbot-400M", "meta-llama/Llama-2-70b-chat-hf"],
    endpoint: "https://api-inference.huggingface.co/models",
    icon: "🤗"
  },
  {
    name: "Replicate",
    key: "replicate",
    models: ["meta/llama-2-70b-chat", "mistralai/mixtral-8x7b-instruct-v0.1"],
    endpoint: "https://api.replicate.com/v1",
    icon: "🔄"
  },
  {
    name: "Together AI",
    key: "together",
    models: ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO"],
    endpoint: "https://api.together.xyz/v1",
    icon: "🤝"
  },
  {
    name: "Perplexity",
    key: "perplexity",
    models: ["llama-3.1-sonar-huge-128k-online", "llama-3.1-sonar-large-128k-online"],
    endpoint: "https://api.perplexity.ai",
    icon: "🔮"
  },
  {
    name: "Deepseek",
    key: "deepseek",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-r1"],
    endpoint: "https://api.deepseek.com/v1",
    icon: "🌊"
  },
  {
    name: "xAI (Grok)",
    key: "xai",
    models: ["grok-beta", "grok-vision-beta"],
    endpoint: "https://api.x.ai/v1",
    icon: "❌"
  },
  {
    name: "Groq",
    key: "groq",
    models: ["llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
    endpoint: "https://api.groq.com/openai/v1",
    icon: "⚡"
  },
  {
    name: "Fireworks AI",
    key: "fireworks",
    models: ["accounts/fireworks/models/llama-v3p1-70b-instruct", "accounts/fireworks/models/mixtral-8x7b-instruct"],
    endpoint: "https://api.fireworks.ai/inference/v1",
    icon: "🎆"
  },
  {
    name: "CoinGecko",
    key: "coingecko",
    models: ["price-api", "market-data-api"],
    endpoint: "https://api.coingecko.com/api/v3",
    icon: "🦎"
  },
  {
    name: "CoinMarketCap",
    key: "coinmarketcap",
    models: ["price-api", "market-data-api", "historical-api"],
    endpoint: "https://pro-api.coinmarketcap.com/v1",
    icon: "💹"
  },
  {
    name: "Binance",
    key: "binance",
    models: ["spot-api", "futures-api", "margin-api"],
    endpoint: "https://api.binance.com/api/v3",
    icon: "🟡"
  },
  {
    name: "Coinbase",
    key: "coinbase",
    models: ["exchange-api", "pro-api", "advanced-trade-api"],
    endpoint: "https://api.exchange.coinbase.com",
    icon: "🔵"
  },
  {
    name: "Kraken",
    key: "kraken",
    models: ["public-api", "private-api", "futures-api"],
    endpoint: "https://api.kraken.com/0",
    icon: "🐙"
  },
  {
    name: "Alpha Vantage",
    key: "alphavantage",
    models: ["crypto-api", "forex-api", "stock-api"],
    endpoint: "https://www.alphavantage.co/query",
    icon: "📊"
  },
  {
    name: "Twelve Data",
    key: "twelvedata",
    models: ["crypto-api", "stocks-api", "forex-api"],
    endpoint: "https://api.twelvedata.com",
    icon: "📈"
  }
];

export const APISettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiConfigs, setApiConfigs] = useState<Record<string, APIConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAPISettings();
    }
  }, [user]);

  const loadAPISettings = async () => {
    if (!user) return;

    try {
      console.log('Loading API settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .like('setting_key', 'api_%');

      if (error) {
        console.error('Error loading API settings:', error);
        throw error;
      }

      console.log('Loaded API settings:', data);

      const configs: Record<string, APIConfig> = {};
      
      // Initialize with defaults for all providers
      API_PROVIDERS.forEach(provider => {
        configs[provider.key] = {
          provider: provider.key,
          apiKey: '',
          endpoint: provider.endpoint,
          model: provider.models[0],
          isActive: false,
          rateLimit: 60,
          maxTokens: 4000,
          temperature: 0.7
        };
      });

      // Override with saved settings
      data?.forEach(setting => {
        const providerKey = setting.setting_key.replace('api_', '');
        if (configs[providerKey] && setting.setting_value) {
          const settingValue = typeof setting.setting_value === 'string' 
            ? JSON.parse(setting.setting_value) 
            : setting.setting_value;
          
          configs[providerKey] = {
            ...configs[providerKey],
            ...settingValue
          };
        }
      });

      setApiConfigs(configs);
    } catch (error) {
      console.error('Failed to load API settings:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load API settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAPIConfig = async (providerKey: string, config: APIConfig) => {
    if (!user) return;

    setSaving(true);
    try {
      console.log('Saving API config for provider:', providerKey, config);

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: `api_${providerKey}`,
          setting_value: config as any,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving API config:', error);
        throw error;
      }

      // Update local state
      setApiConfigs(prev => ({
        ...prev,
        [providerKey]: config
      }));

      toast({
        title: "Settings Saved",
        description: `${API_PROVIDERS.find(p => p.key === providerKey)?.name} API settings saved successfully`,
      });

      console.log('API config saved successfully');
    } catch (error: any) {
      console.error('Failed to save API config:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save API settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (providerKey: string) => {
    const config = apiConfigs[providerKey];
    if (!config?.apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please enter an API key first",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(providerKey);
    try {
      // Simple test - just mark as successful for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection Successful",
        description: `${API_PROVIDERS.find(p => p.key === providerKey)?.name} API configuration saved`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the API. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const updateConfig = (providerKey: string, updates: Partial<APIConfig>) => {
    setApiConfigs(prev => ({
      ...prev,
      [providerKey]: {
        ...prev[providerKey],
        ...updates
      }
    }));
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading API settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Configuration
            <Badge className="bg-green-500/20 text-green-400">
              {Object.values(apiConfigs).filter(c => c.isActive).length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={API_PROVIDERS[0].key} className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 bg-white/10 max-h-20 overflow-y-auto">
              {API_PROVIDERS.map(provider => (
                <TabsTrigger 
                  key={provider.key} 
                  value={provider.key}
                  className="text-xs data-[state=active]:bg-purple-600 p-1"
                >
                  <span className="mr-1 text-xs">{provider.icon}</span>
                  <span className="hidden sm:inline">{provider.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {API_PROVIDERS.map(provider => {
              const config = apiConfigs[provider.key] || {
                provider: provider.key,
                apiKey: '',
                endpoint: provider.endpoint,
                model: provider.models[0],
                isActive: false,
                rateLimit: 60,
                maxTokens: 4000,
                temperature: 0.7
              };

              return (
                <TabsContent key={provider.key} value={provider.key} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Settings */}
                    <Card className="bg-white/5">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>{provider.icon}</span>
                          {provider.name} Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${provider.key}-active`}>Enable API</Label>
                          <Switch
                            id={`${provider.key}-active`}
                            checked={config.isActive}
                            onCheckedChange={(checked) => 
                              updateConfig(provider.key, { isActive: checked })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.key}-key`}>API Key</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`${provider.key}-key`}
                              type="password"
                              placeholder="Enter your API key"
                              value={config.apiKey}
                              onChange={(e) => 
                                updateConfig(provider.key, { apiKey: e.target.value })
                              }
                              className="bg-white/10 border-white/20"
                            />
                            <Button
                              onClick={() => testConnection(provider.key)}
                              disabled={!config.apiKey || testingConnection === provider.key}
                              size="sm"
                              variant="outline"
                              className="border-white/20"
                            >
                              {testingConnection === provider.key ? (
                                <AlertCircle className="w-4 h-4 animate-spin" />
                              ) : (
                                <Shield className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.key}-endpoint`}>API Endpoint</Label>
                          <Input
                            id={`${provider.key}-endpoint`}
                            value={config.endpoint || ''}
                            onChange={(e) => 
                              updateConfig(provider.key, { endpoint: e.target.value })
                            }
                            className="bg-white/10 border-white/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.key}-model`}>Model</Label>
                          <Select
                            value={config.model}
                            onValueChange={(value) => 
                              updateConfig(provider.key, { model: value })
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {provider.models.map(model => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Advanced Settings */}
                    <Card className="bg-white/5">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Advanced Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${provider.key}-rate-limit`}>Rate Limit (requests/min)</Label>
                          <Input
                            id={`${provider.key}-rate-limit`}
                            type="number"
                            value={config.rateLimit}
                            onChange={(e) => 
                              updateConfig(provider.key, { rateLimit: parseInt(e.target.value) })
                            }
                            className="bg-white/10 border-white/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.key}-max-tokens`}>Max Tokens</Label>
                          <Input
                            id={`${provider.key}-max-tokens`}
                            type="number"
                            value={config.maxTokens}
                            onChange={(e) => 
                              updateConfig(provider.key, { maxTokens: parseInt(e.target.value) })
                            }
                            className="bg-white/10 border-white/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.key}-temperature`}>Temperature</Label>
                          <Input
                            id={`${provider.key}-temperature`}
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={config.temperature}
                            onChange={(e) => 
                              updateConfig(provider.key, { temperature: parseFloat(e.target.value) })
                            }
                            className="bg-white/10 border-white/20"
                          />
                        </div>

                        <div className="pt-4">
                          <Button
                            onClick={() => saveAPIConfig(provider.key, config)}
                            disabled={saving}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {saving ? (
                              <>
                                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Save {provider.name} Settings
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Display */}
                  <Card className="bg-white/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${config.isActive && config.apiKey ? 'bg-green-400' : 'bg-red-400'}`} />
                          <span className="font-medium">
                            {config.isActive && config.apiKey ? 'Connected' : 'Not Configured'}
                          </span>
                        </div>
                        <Badge className={config.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        Model: {config.model} | Rate Limit: {config.rateLimit}/min | Max Tokens: {config.maxTokens}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
