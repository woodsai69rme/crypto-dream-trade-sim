
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useOpenRouterIntegration, OpenRouterModel } from '@/hooks/useOpenRouterIntegration';
import { Bot, Zap, DollarSign, TrendingUp, Eye, EyeOff, RefreshCw } from "lucide-react";

export const OpenRouterManagement = () => {
  const { toast } = useToast();
  const {
    models,
    usage,
    loading,
    fetchAvailableModels,
    generateTradingAnalysis,
    getTotalUsageCost,
  } = useOpenRouterIntegration();

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const popularModels = [
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4',
    'openai/gpt-4-turbo',
    'google/gemini-pro',
    'meta-llama/llama-3.1-8b-instruct',
    'mistralai/mistral-7b-instruct',
  ];

  const handleFetchModels = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key",
        variant: "destructive",
      });
      return;
    }
    await fetchAvailableModels(apiKey);
  };

  const handleGenerateAnalysis = async () => {
    if (!apiKey.trim() || !analysisPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter API key and analysis prompt",
        variant: "destructive",
      });
      return;
    }

    const result = await generateTradingAnalysis(analysisPrompt, selectedModel, apiKey);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const defaultPrompts = [
    "Analyze the current Bitcoin market trends and provide trading recommendations",
    "What are the key technical indicators for Ethereum right now?",
    "Analyze the correlation between major cryptocurrencies and traditional markets",
    "Provide a risk assessment for a diversified crypto portfolio",
    "What are the potential impact of recent regulatory news on crypto prices?",
  ];

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            OpenRouter AI Integration
            <Badge className="bg-blue-500/20 text-blue-400">
              Multi-Model Access
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OpenRouter API Key</Label>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="sk-or-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/10 border-white/20"
              />
              <Button
                size="sm"
                variant="outline"
                className="border-white/20"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                onClick={handleFetchModels}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 p-2 bg-blue-600/20 rounded-lg text-blue-400" />
              <div>
                <p className="text-sm font-medium">Available Models</p>
                <p className="text-2xl font-bold">{models.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 p-2 bg-yellow-600/20 rounded-lg text-yellow-400" />
              <div>
                <p className="text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold">{usage.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 p-2 bg-green-600/20 rounded-lg text-green-400" />
              <div>
                <p className="text-sm font-medium">Total Cost</p>
                <p className="text-2xl font-bold">${getTotalUsageCost().toFixed(4)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Select AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {popularModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Analysis Prompt</Label>
                <Textarea
                  placeholder="Enter your trading analysis request..."
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  className="bg-white/10 border-white/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Prompts</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-xs"
                      onClick={() => setAnalysisPrompt(prompt)}
                    >
                      {prompt.substring(0, 30)}...
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateAnalysis}
                disabled={loading || !apiKey.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate AI Analysis
                  </>
                )}
              </Button>

              {analysisResult && (
                <div className="space-y-2">
                  <Label>Analysis Result</Label>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <pre className="whitespace-pre-wrap text-sm">{analysisResult}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {models.slice(0, 10).map((model) => (
              <Card key={model.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{model.name}</h3>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {model.architecture.modality}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                    <div>
                      <span className="font-medium">Context Length:</span> {model.context_length.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Max Completion:</span> {model.top_provider.max_completion_tokens.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Prompt Cost:</span> ${model.pricing.prompt}
                    </div>
                    <div>
                      <span className="font-medium">Completion Cost:</span> ${model.pricing.completion}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4">
            {usage.slice(0, 20).map((entry, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {entry.model.split('/')[1] || entry.model}
                      </Badge>
                      <span className="text-sm text-white/60">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      ${entry.cost.toFixed(4)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-white/60">
                    <div>
                      <span className="font-medium">Prompt:</span> {entry.usage.prompt_tokens}
                    </div>
                    <div>
                      <span className="font-medium">Completion:</span> {entry.usage.completion_tokens}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> {entry.usage.total_tokens}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
