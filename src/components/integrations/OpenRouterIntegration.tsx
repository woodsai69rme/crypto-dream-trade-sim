
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Settings, Key, Activity } from "lucide-react";

export const OpenRouterIntegration = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const availableModels = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', cost: '$0.03/1K tokens' },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', cost: '$0.015/1K tokens' },
    { id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'Meta', cost: '$0.0007/1K tokens' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral', cost: '$0.0005/1K tokens' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-foreground">
            <Bot className="w-5 h-5" />
            OpenRouter Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-primary-foreground">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="sk-or-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white"
              />
              <Button onClick={() => setIsConnected(true)} className="bg-purple-600 hover:bg-purple-700">
                <Key className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-primary-foreground">Connection Status</span>
            <Badge className={isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card className="bg-card/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-800/30">
                  <div>
                    <div className="font-medium text-white">{model.name}</div>
                    <div className="text-sm text-muted-foreground">{model.provider}</div>
                    <div className="text-xs text-muted-foreground">{model.cost}</div>
                  </div>
                  <Switch
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedModels([...selectedModels, model.id]);
                      } else {
                        setSelectedModels(selectedModels.filter(id => id !== model.id));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
