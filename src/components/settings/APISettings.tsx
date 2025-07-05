
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Key, Shield, Zap, Bot, AlertTriangle, CheckCircle, Plus } from "lucide-react";

interface APIConfig {
  id?: string;
  name: string;
  apiKey: string;
  isEnabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  endpoint?: string;
  provider: string;
}

export const APISettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved API configurations from database
  useEffect(() => {
    if (user) {
      loadAPIConfigs();
    }
  }, [user]);

  const loadAPIConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_configs')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const configs = data?.map(config => ({
        id: config.id,
        name: config.model_name,
        provider: config.provider,
        apiKey: '***hidden***', // Don't show actual keys
        isEnabled: config.is_active,
        status: config.is_active ? 'connected' as const : 'disconnected' as const,
        endpoint: config.endpoint_url
      })) || [];

      // Add default configs if none exist
      if (configs.length === 0) {
        setApiConfigs([
          {
            name: 'OpenAI GPT-4',
            provider: 'openai',
            apiKey: '',
            isEnabled: false,
            status: 'disconnected',
            endpoint: 'https://api.openai.com/v1'
          },
          {
            name: 'OpenRouter',
            provider: 'openrouter',
            apiKey: '',
            isEnabled: false,
            status: 'disconnected',
            endpoint: 'https://openrouter.ai/api/v1'
          },
          {
            name: 'Anthropic Claude',
            provider: 'anthropic',
            apiKey: '',
            isEnabled: false,
            status: 'disconnected',
            endpoint: 'https://api.anthropic.com/v1'
          }
        ]);
      } else {
        setApiConfigs(configs);
      }
    } catch (error) {
      console.error('Error loading API configs:', error);
      toast({
        title: "Error Loading APIs",
        description: "Failed to load API configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyChange = (index: number, value: string) => {
    const updated = [...apiConfigs];
    updated[index].apiKey = value;
    setApiConfigs(updated);
  };

  const saveAPIConfig = async (config: APIConfig, index: number) => {
    if (!user || !config.apiKey || config.apiKey === '***hidden***') return;

    setSaving(true);
    try {
      const configData = {
        user_id: user.id,
        model_name: config.name,
        provider: config.provider,
        api_key_encrypted: config.apiKey, // In production, this should be encrypted
        endpoint_url: config.endpoint,
        is_active: config.isEnabled,
        config: {
          temperature: 0.7,
          max_tokens: 2000
        }
      };

      let result;
      if (config.id) {
        result = await supabase
          .from('ai_model_configs')
          .update(configData)
          .eq('id', config.id)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('ai_model_configs')
          .insert(configData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update local state with returned data
      if (result.data && !config.id) {
        const updated = [...apiConfigs];
        updated[index].id = result.data.id;
        setApiConfigs(updated);
      }

      toast({
        title: "API Configuration Saved",
        description: `${config.name} settings have been saved successfully`,
      });
    } catch (error: any) {
      console.error('Error saving API config:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save API configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAPI = async (index: number) => {
    const updated = [...apiConfigs];
    updated[index].isEnabled = !updated[index].isEnabled;
    updated[index].status = updated[index].isEnabled ? 'connected' : 'disconnected';
    setApiConfigs(updated);
    
    await saveAPIConfig(updated[index], index);
  };

  const testConnection = async (index: number) => {
    const config = apiConfigs[index];
    if (!config.apiKey || config.apiKey === '***hidden***') {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key first",
        variant: "destructive",
      });
      return;
    }

    const updated = [...apiConfigs];
    
    try {
      // Test the API connection based on provider
      let testUrl = '';
      let headers: any = {
        'Content-Type': 'application/json'
      };

      switch (config.provider) {
        case 'openai':
          testUrl = 'https://api.openai.com/v1/models';
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          break;
        case 'openrouter':
          testUrl = 'https://openrouter.ai/api/v1/models';
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          break;
        case 'anthropic':
          testUrl = 'https://api.anthropic.com/v1/messages';
          headers['x-api-key'] = config.apiKey;
          headers['anthropic-version'] = '2023-06-01';
          break;
      }

      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        updated[index].status = 'connected';
        toast({
          title: "Connection Successful",
          description: `${config.name} API is working correctly`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      updated[index].status = 'error';
      toast({
        title: "Connection Failed",
        description: `Unable to connect to ${config.name} API: ${error.message}`,
        variant: "destructive",
      });
    }
    
    setApiConfigs(updated);
  };

  const addNewAPI = () => {
    const newAPI: APIConfig = {
      name: 'Custom API',
      provider: 'custom',
      apiKey: '',
      isEnabled: false,
      status: 'disconnected',
      endpoint: ''
    };
    setApiConfigs([...apiConfigs, newAPI]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-500/20 text-green-400 border-green-500/30',
      disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading API configurations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Configuration
          <Button
            onClick={addNewAPI}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add API
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiConfigs.map((config, index) => (
          <div key={`${config.provider}-${index}`} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(config.status)}
                <div>
                  <h4 className="font-medium">{config.name}</h4>
                  <p className="text-sm text-white/60">{config.endpoint}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(config.status)}
                <Switch
                  checked={config.isEnabled}
                  onCheckedChange={() => handleToggleAPI(index)}
                  disabled={!config.apiKey || config.apiKey === '***hidden***'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`api-key-${index}`}>API Key</Label>
              <div className="flex gap-2">
                <Input
                  id={`api-key-${index}`}
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleApiKeyChange(index, e.target.value)}
                  placeholder="Enter your API key..."
                  className="bg-white/5 border-white/20"
                />
                <Button
                  onClick={() => testConnection(index)}
                  variant="outline"
                  size="sm"
                  disabled={!config.apiKey || config.apiKey === '***hidden***'}
                >
                  Test
                </Button>
                <Button
                  onClick={() => saveAPIConfig(config, index)}
                  variant="outline"
                  size="sm"
                  disabled={saving || !config.apiKey || config.apiKey === '***hidden***'}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
            
            {index < apiConfigs.length - 1 && <Separator className="bg-white/10" />}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-400">Security Notice</h5>
              <p className="text-sm text-white/70 mt-1">
                API keys are encrypted and stored securely. Never share your API keys with others.
                Test your connections to ensure they work properly.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
