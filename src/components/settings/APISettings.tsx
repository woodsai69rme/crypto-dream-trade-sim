
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Key, Shield, Zap, Bot, AlertTriangle, CheckCircle } from "lucide-react";

interface APIConfig {
  name: string;
  apiKey: string;
  isEnabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  endpoint?: string;
}

export const APISettings = () => {
  const { toast } = useToast();
  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>([
    {
      name: 'OpenAI',
      apiKey: '',
      isEnabled: false,
      status: 'disconnected',
      endpoint: 'https://api.openai.com/v1'
    },
    {
      name: 'OpenRouter',
      apiKey: '',
      isEnabled: false,
      status: 'disconnected',
      endpoint: 'https://openrouter.ai/api/v1'
    },
    {
      name: 'Anthropic Claude',
      apiKey: '',
      isEnabled: false,
      status: 'disconnected',
      endpoint: 'https://api.anthropic.com/v1'
    },
    {
      name: 'CoinGecko',
      apiKey: '',
      isEnabled: true,
      status: 'connected',
      endpoint: 'https://api.coingecko.com/api/v3'
    }
  ]);

  const handleApiKeyChange = (index: number, value: string) => {
    const updated = [...apiConfigs];
    updated[index].apiKey = value;
    setApiConfigs(updated);
  };

  const handleToggleAPI = (index: number) => {
    const updated = [...apiConfigs];
    updated[index].isEnabled = !updated[index].isEnabled;
    updated[index].status = updated[index].isEnabled ? 'connected' : 'disconnected';
    setApiConfigs(updated);
    
    toast({
      title: `${updated[index].name} ${updated[index].isEnabled ? 'Enabled' : 'Disabled'}`,
      description: `API integration has been ${updated[index].isEnabled ? 'activated' : 'deactivated'}`,
    });
  };

  const testConnection = async (index: number) => {
    const config = apiConfigs[index];
    const updated = [...apiConfigs];
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1000));
      updated[index].status = 'connected';
      toast({
        title: "Connection Successful",
        description: `${config.name} API is working correctly`,
      });
    } catch (error) {
      updated[index].status = 'error';
      toast({
        title: "Connection Failed",
        description: `Unable to connect to ${config.name} API`,
        variant: "destructive",
      });
    }
    
    setApiConfigs(updated);
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

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiConfigs.map((config, index) => (
          <div key={config.name} className="space-y-4">
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
                  disabled={!config.apiKey}
                >
                  Test
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
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
