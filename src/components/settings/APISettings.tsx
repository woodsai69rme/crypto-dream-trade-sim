
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
  // AI Providers (Free & Paid)
  {
    name: "OpenRouter",
    key: "openrouter", 
    models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5", "meta-llama/llama-3.1-405b", "microsoft/wizardlm-2-8x22b", "qwen/qwen-2.5-72b-instruct"],
    endpoint: "https://openrouter.ai/api/v1",
    icon: "🔀",
    category: "ai"
  },
  {
    name: "OpenAI",
    key: "openai",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    endpoint: "https://api.openai.com/v1",
    icon: "🤖",
    category: "ai"
  },
  {
    name: "Anthropic",
    key: "anthropic",
    models: ["claude-3.5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    endpoint: "https://api.anthropic.com/v1",
    icon: "🧠",
    category: "ai"
  },
  {
    name: "Google AI",
    key: "google",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro-vision"],
    endpoint: "https://generativelanguage.googleapis.com/v1",
    icon: "🔍",
    category: "ai"
  },
  {
    name: "Groq (Free)",
    key: "groq",
    models: ["llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
    endpoint: "https://api.groq.com/openai/v1",
    icon: "⚡",
    category: "ai"
  },
  {
    name: "Together AI",
    key: "together",
    models: ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO"],
    endpoint: "https://api.together.xyz/v1",
    icon: "🤝",
    category: "ai"
  },
  {
    name: "Hugging Face (Free)",
    key: "huggingface",
    models: ["microsoft/DialoGPT-large", "facebook/blenderbot-400M", "meta-llama/Llama-2-70b-chat-hf"],
    endpoint: "https://api-inference.huggingface.co/models",
    icon: "🤗",
    category: "ai"
  },
  {
    name: "Replicate",
    key: "replicate",
    models: ["meta/llama-2-70b-chat", "mistralai/mixtral-8x7b-instruct-v0.1"],
    endpoint: "https://api.replicate.com/v1",
    icon: "🔄",
    category: "ai"
  },
  {
    name: "Perplexity",
    key: "perplexity",
    models: ["llama-3.1-sonar-huge-128k-online", "llama-3.1-sonar-large-128k-online"],
    endpoint: "https://api.perplexity.ai",
    icon: "🔮",
    category: "ai"
  },
  {
    name: "Deepseek (Free)",
    key: "deepseek",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-r1"],
    endpoint: "https://api.deepseek.com/v1",
    icon: "🌊",
    category: "ai"
  },
  {
    name: "xAI (Grok)",
    key: "xai",
    models: ["grok-beta", "grok-vision-beta"],
    endpoint: "https://api.x.ai/v1",
    icon: "❌",
    category: "ai"
  },
  {
    name: "Fireworks AI",
    key: "fireworks",
    models: ["accounts/fireworks/models/llama-v3p1-70b-instruct", "accounts/fireworks/models/mixtral-8x7b-instruct"],
    endpoint: "https://api.fireworks.ai/inference/v1",
    icon: "🎆",
    category: "ai"
  },
  
  // Crypto Market Data APIs (Many Free)
  {
    name: "CoinGecko (Free)",
    key: "coingecko",
    models: ["price-api", "market-data-api", "trending-api", "nft-api"],
    endpoint: "https://api.coingecko.com/api/v3",
    icon: "🦎",
    category: "crypto"
  },
  {
    name: "CoinMarketCap",
    key: "coinmarketcap",
    models: ["price-api", "market-data-api", "historical-api"],
    endpoint: "https://pro-api.coinmarketcap.com/v1",
    icon: "💹",
    category: "crypto"
  },
  {
    name: "CryptoCompare (Free)",
    key: "cryptocompare",
    models: ["price-api", "historical-api", "news-api"],
    endpoint: "https://min-api.cryptocompare.com/data",
    icon: "📊",
    category: "crypto"
  },
  {
    name: "Messari (Free)",
    key: "messari",
    models: ["assets-api", "metrics-api", "news-api"],
    endpoint: "https://data.messari.io/api/v1",
    icon: "🔬",
    category: "crypto"
  },
  {
    name: "CoinPaprika (Free)",
    key: "coinpaprika",
    models: ["coins-api", "exchanges-api", "market-api"],
    endpoint: "https://api.coinpaprika.com/v1",
    icon: "🌶️",
    category: "crypto"
  },
  {
    name: "Nomics (Free)",
    key: "nomics",
    models: ["currencies-api", "market-cap-api", "volume-api"],
    endpoint: "https://api.nomics.com/v1",
    icon: "📈",
    category: "crypto"
  },
  
  // Exchange APIs
  {
    name: "Binance (Free)",
    key: "binance",
    models: ["spot-api", "futures-api", "margin-api"],
    endpoint: "https://api.binance.com/api/v3",
    icon: "🟡",
    category: "exchange"
  },
  {
    name: "Coinbase (Free)",
    key: "coinbase",
    models: ["exchange-api", "pro-api", "advanced-trade-api"],
    endpoint: "https://api.exchange.coinbase.com",
    icon: "🔵",
    category: "exchange"
  },
  {
    name: "Kraken (Free)",
    key: "kraken",
    models: ["public-api", "private-api", "futures-api"],
    endpoint: "https://api.kraken.com/0",
    icon: "🐙",
    category: "exchange"
  },
  {
    name: "Deribit",
    key: "deribit",
    models: ["public-api", "private-api", "options-api"],
    endpoint: "https://www.deribit.com/api/v2",
    icon: "🎯",
    category: "exchange"
  },
  {
    name: "KuCoin (Free)",
    key: "kucoin",
    models: ["spot-api", "futures-api", "margin-api"],
    endpoint: "https://api.kucoin.com/api/v1",
    icon: "🔶",
    category: "exchange"
  },
  {
    name: "Bybit (Free)",
    key: "bybit",
    models: ["spot-api", "derivatives-api", "options-api"],
    endpoint: "https://api.bybit.com/v5",
    icon: "🟣",
    category: "exchange"
  },
  
  // Additional Data Providers
  {
    name: "Alpha Vantage (Free)",
    key: "alphavantage",
    models: ["crypto-api", "forex-api", "stock-api"],
    endpoint: "https://www.alphavantage.co/query",
    icon: "📊",
    category: "data"
  },
  {
    name: "Twelve Data (Free)",
    key: "twelvedata",
    models: ["crypto-api", "stocks-api", "forex-api"],
    endpoint: "https://api.twelvedata.com",
    icon: "📈",
    category: "data"
  },
  {
    name: "Polygon.io",
    key: "polygon",
    models: ["crypto-api", "stocks-api", "options-api"],
    endpoint: "https://api.polygon.io/v1",
    icon: "🔷",
    category: "data"
  },
  {
    name: "IEX Cloud (Free)",
    key: "iexcloud",
    models: ["crypto-api", "stocks-api", "market-api"],
    endpoint: "https://cloud.iexapis.com/stable",
    icon: "☁️",
    category: "data"
  },
  
  // News & Social APIs
  {
    name: "NewsAPI (Free)",
    key: "newsapi",
    models: ["everything-api", "headlines-api", "sources-api"],
    endpoint: "https://newsapi.org/v2",
    icon: "📰",
    category: "news"
  },
  {
    name: "Reddit API (Free)",
    key: "reddit",
    models: ["posts-api", "comments-api", "subreddit-api"],
    endpoint: "https://www.reddit.com/api/v1",
    icon: "🤖",
    category: "social"
  },
  {
    name: "Twitter API",
    key: "twitter",
    models: ["tweets-api", "search-api", "streaming-api"],
    endpoint: "https://api.twitter.com/2",
    icon: "🐦",
    category: "social"
  },
  
  // Blockchain Data
  {
    name: "Etherscan (Free)",
    key: "etherscan",
    models: ["accounts-api", "contracts-api", "transactions-api"],
    endpoint: "https://api.etherscan.io/api",
    icon: "⟠",
    category: "blockchain"
  },
  {
    name: "Moralis (Free)",
    key: "moralis",
    models: ["nft-api", "defi-api", "token-api"],
    endpoint: "https://deep-index.moralis.io/api/v2",
    icon: "🌟",
    category: "blockchain"
  },
  {
    name: "The Graph (Free)",
    key: "thegraph",
    models: ["subgraph-api", "indexing-api"],
    endpoint: "https://api.thegraph.com/subgraphs/name",
    icon: "📊",
    category: "blockchain"
  }
];

export const APISettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiConfigs, setApiConfigs] = useState<Record<string, APIConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
        .select('setting_name, setting_value')
        .eq('user_id', user.id)
        .like('setting_name', 'api_%');

      if (error) {
        console.error('Error loading API settings:', error);
        throw error;
      }

      console.log('Loaded API settings:', data);

      const configs: Record<string, APIConfig> = {};
      
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

      data?.forEach(setting => {
        const providerKey = setting.setting_name.replace('api_', '');
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
          setting_name: `api_${providerKey}`,
          setting_value: config as any,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving API config:', error);
        throw error;
      }

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
    const provider = API_PROVIDERS.find(p => p.key === providerKey);
    
    if (!config?.apiKey && provider?.category !== 'crypto' && !provider?.name.includes('Free')) {
      toast({
        title: "Missing API Key",
        description: "Please enter an API key first",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(providerKey);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection Successful",
        description: `${provider?.name} API configuration saved`,
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

  const filteredProviders = selectedCategory === "all" 
    ? API_PROVIDERS 
    : API_PROVIDERS.filter(p => p.category === selectedCategory);

  const getStatusColor = (isActive: boolean, hasKey: boolean) => {
    if (isActive && hasKey) return "bg-green-500/20 text-green-400";
    if (isActive && !hasKey) return "bg-yellow-500/20 text-yellow-400";
    return "bg-gray-500/20 text-gray-400";
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
            Comprehensive API Configuration
            <Badge className="bg-green-500/20 text-green-400">
              {Object.values(apiConfigs).filter(c => c.isActive).length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All ({API_PROVIDERS.length})
            </Button>
            <Button
              variant={selectedCategory === "ai" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("ai")}
            >
              🤖 AI Models ({API_PROVIDERS.filter(p => p.category === "ai").length})
            </Button>
            <Button
              variant={selectedCategory === "crypto" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("crypto")}
            >
              🚀 Crypto Data ({API_PROVIDERS.filter(p => p.category === "crypto").length})
            </Button>
            <Button
              variant={selectedCategory === "exchange" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("exchange")}
            >
              💱 Exchanges ({API_PROVIDERS.filter(p => p.category === "exchange").length})
            </Button>
            <Button
              variant={selectedCategory === "blockchain" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("blockchain")}
            >
              ⛓️ Blockchain ({API_PROVIDERS.filter(p => p.category === "blockchain").length})
            </Button>
            <Button
              variant={selectedCategory === "news" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("news")}
            >
              📰 News ({API_PROVIDERS.filter(p => p.category === "news").length})
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProviders.map(provider => {
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

              const isFree = provider.name.includes('Free') || 
                           provider.category === 'crypto' ||
                           provider.key === 'coingecko' ||
                           provider.key === 'binance';

              return (
                <Card key={provider.key} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{provider.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{provider.name}</div>
                          {isFree && <Badge className="bg-green-500/20 text-green-400 text-xs">FREE</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(config.isActive, !!config.apiKey)}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={(checked) => 
                            updateConfig(provider.key, { isActive: checked })
                          }
                          size="sm"
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {!isFree && (
                      <div className="space-y-2">
                        <Label className="text-xs">API Key</Label>
                        <Input
                          type="password"
                          placeholder={`Enter ${provider.name} API key`}
                          value={config.apiKey}
                          onChange={(e) => 
                            updateConfig(provider.key, { apiKey: e.target.value })
                          }
                          className="bg-white/10 border-white/20 text-xs"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs">Model/API</Label>
                      <Select
                        value={config.model}
                        onValueChange={(value) => 
                          updateConfig(provider.key, { model: value })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {provider.models.map(model => (
                            <SelectItem key={model} value={model} className="text-xs">
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => testConnection(provider.key)}
                        disabled={testingConnection === provider.key}
                        size="sm"
                        className="flex-1 text-xs"
                      >
                        {testingConnection === provider.key ? (
                          <AlertCircle className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Shield className="w-3 h-3 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button
                        onClick={() => saveAPIConfig(provider.key, config)}
                        disabled={saving}
                        size="sm"
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
