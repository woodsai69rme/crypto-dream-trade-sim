
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Cpu, Zap, Settings, Play, Pause, BarChart3, 
  TrendingUp, Bot, Code, Database, Network, Sparkles,
  RefreshCw, Download, Upload, Eye, EyeOff
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'language' | 'trading' | 'analysis' | 'prediction';
  status: 'active' | 'training' | 'paused' | 'error';
  accuracy: number;
  performance: {
    trades: number;
    winRate: number;
    avgReturn: number;
    sharpeRatio: number;
  };
  config: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
  };
}

export const AdvancedAIModels = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isTraining, setIsTraining] = useState(false);

  // AI Models data
  const [aiModels, setAiModels] = useState<AIModel[]>([
    {
      id: '1',
      name: 'DeepSeek-R1 Trader',
      provider: 'DeepSeek',
      type: 'trading',
      status: 'active',
      accuracy: 87.3,
      performance: {
        trades: 1247,
        winRate: 73.5,
        avgReturn: 2.8,
        sharpeRatio: 1.92
      },
      config: {
        temperature: 0.3,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.1
      }
    },
    {
      id: '2',
      name: 'GPT-4 Market Analyst',
      provider: 'OpenAI',
      type: 'analysis',
      status: 'active',
      accuracy: 82.1,
      performance: {
        trades: 892,
        winRate: 68.2,
        avgReturn: 2.1,
        sharpeRatio: 1.64
      },
      config: {
        temperature: 0.2,
        maxTokens: 4096,
        topP: 0.8,
        frequencyPenalty: 0.2
      }
    },
    {
      id: '3',
      name: 'Claude Sonnet Predictor',
      provider: 'Anthropic',
      type: 'prediction',
      status: 'training',
      accuracy: 91.7,
      performance: {
        trades: 634,
        winRate: 78.9,
        avgReturn: 3.4,
        sharpeRatio: 2.15
      },
      config: {
        temperature: 0.1,
        maxTokens: 8192,
        topP: 0.95,
        frequencyPenalty: 0.0
      }
    },
    {
      id: '4',
      name: 'Gemini Pro Ensemble',
      provider: 'Google',
      type: 'trading',
      status: 'active',
      accuracy: 85.6,
      performance: {
        trades: 1056,
        winRate: 71.8,
        avgReturn: 2.6,
        sharpeRatio: 1.78
      },
      config: {
        temperature: 0.4,
        maxTokens: 1024,
        topP: 0.85,
        frequencyPenalty: 0.15
      }
    }
  ]);

  // Training datasets
  const trainingDatasets = [
    { id: '1', name: 'Bitcoin Historical Data', size: '2.5GB', type: 'OHLCV', status: 'ready' },
    { id: '2', name: 'News Sentiment Archive', size: '1.8GB', type: 'Text', status: 'processing' },
    { id: '3', name: 'Social Media Signals', size: '950MB', type: 'Social', status: 'ready' },
    { id: '4', name: 'On-Chain Metrics', size: '3.2GB', type: 'Blockchain', status: 'ready' }
  ];

  // Model performance metrics
  const performanceData = [
    { date: '2024-01', accuracy: 78.2, trades: 145, profit: 1250 },
    { date: '2024-02', accuracy: 82.1, trades: 167, profit: 1890 },
    { date: '2024-03', accuracy: 85.6, trades: 198, profit: 2340 },
    { date: '2024-04', accuracy: 87.3, trades: 223, profit: 2850 },
    { date: '2024-05', accuracy: 89.1, trades: 245, profit: 3200 },
    { date: '2024-06', accuracy: 91.7, trades: 267, profit: 3750 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'training': return 'bg-blue-500/20 text-blue-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'analysis': return <BarChart3 className="w-4 h-4" />;
      case 'prediction': return <Sparkles className="w-4 h-4" />;
      case 'language': return <Brain className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const handleModelToggle = (modelId: string) => {
    setAiModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: model.status === 'active' ? 'paused' : 'active' }
        : model
    ));
  };

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(true);
    
    // Simulate training process
    toast({
      title: "Training Started",
      description: "Model training initiated. This may take several hours.",
    });

    // Update model status
    setAiModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'training' as const }
        : model
    ));

    setTimeout(() => {
      setIsTraining(false);
      setAiModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'active' as const, accuracy: model.accuracy + Math.random() * 5 }
          : model
      ));
      
      toast({
        title: "Training Complete",
        description: "Model has been successfully retrained with improved accuracy.",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground">Advanced AI Models</h2>
          <p className="text-muted-foreground">Manage and optimize your AI trading models</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-400">
            {aiModels.filter(m => m.status === 'active').length} Active
          </Badge>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Model
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Models</p>
                <p className="text-2xl font-bold text-blue-400">{aiModels.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Avg Accuracy</p>
                <p className="text-2xl font-bold text-green-400">
                  {(aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Trades</p>
                <p className="text-2xl font-bold text-purple-400">
                  {aiModels.reduce((sum, m) => sum + m.performance.trades, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Avg Win Rate</p>
                <p className="text-2xl font-bold text-orange-400">
                  {(aiModels.reduce((sum, m) => sum + m.performance.winRate, 0) / aiModels.length).toFixed(1)}%
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiModels.map((model) => (
              <Card key={model.id} className="crypto-card-gradient text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        {getTypeIcon(model.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                          <Badge className={getStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Switch 
                      checked={model.status === 'active'}
                      onCheckedChange={() => handleModelToggle(model.id)}
                      disabled={model.status === 'training'}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Accuracy</p>
                      <p className="text-lg font-bold text-green-400">{model.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Win Rate</p>
                      <p className="text-lg font-bold text-blue-400">{model.performance.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Trades</p>
                      <p className="text-lg font-bold text-purple-400">{model.performance.trades}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Sharpe</p>
                      <p className="text-lg font-bold text-orange-400">{model.performance.sharpeRatio}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Model Configuration</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/60">Temperature:</span>
                        <span>{model.config.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Max Tokens:</span>
                        <span>{model.config.maxTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Top P:</span>
                        <span>{model.config.topP}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Frequency:</span>
                        <span>{model.config.frequencyPenalty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleTrainModel(model.id)}
                      disabled={isTraining || model.status === 'training'}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${model.status === 'training' ? 'animate-spin' : ''}`} />
                      {model.status === 'training' ? 'Training...' : 'Retrain'}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="space-y-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Training Datasets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainingDatasets.map((dataset) => (
                    <div key={dataset.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{dataset.name}</h4>
                        <Badge className={
                          dataset.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                          dataset.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {dataset.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>Size: {dataset.size}</span>
                        <span>Type: {dataset.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Training Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <Input
                      id="learning-rate"
                      type="number"
                      defaultValue="0.001"
                      step="0.0001"
                      className="bg-card/20 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Select>
                      <SelectTrigger className="bg-card/20 border-white/20">
                        <SelectValue placeholder="Select batch size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="64">64</SelectItem>
                        <SelectItem value="128">128</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epochs">Training Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      defaultValue="100"
                      className="bg-card/20 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validation-split">Validation Split (%)</Label>
                    <Slider
                      defaultValue={[20]}
                      max={30}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-objective">Training Objective</Label>
                  <Textarea
                    id="training-objective"
                    placeholder="Define the specific trading objectives and performance metrics for this training session..."
                    className="bg-card/20 border-white/20"
                    rows={3}
                  />
                </div>

                <Button className="w-full" disabled={isTraining}>
                  <Play className="w-4 h-4 mr-2" />
                  {isTraining ? 'Training in Progress...' : 'Start Training Session'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiModels.map((model) => (
                    <div key={model.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{model.name}</h4>
                        <Badge className="text-xs">{model.accuracy}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-white/60">Win Rate</p>
                          <p className="font-bold text-green-400">{model.performance.winRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/60">Avg Return</p>
                          <p className="font-bold text-blue-400">{model.performance.avgReturn}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/60">Sharpe</p>
                          <p className="font-bold text-purple-400">{model.performance.sharpeRatio}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">94.2%</p>
                    <p className="text-sm text-white/60">Ensemble Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-blue-400">2.85</p>
                    <p className="text-sm text-white/60">Avg Sharpe Ratio</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">3,829</p>
                    <p className="text-sm text-white/60">Total Trades</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-orange-400">$12.4K</p>
                    <p className="text-sm text-white/60">Total Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ensemble">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Ensemble Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Model Weights</Label>
                {aiModels.map((model) => (
                  <div key={model.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{model.name}</span>
                      <span className="text-sm">25%</span>
                    </div>
                    <Slider
                      defaultValue={[25]}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ensemble-strategy">Ensemble Strategy</Label>
                <Select>
                  <SelectTrigger className="bg-card/20 border-white/20">
                    <SelectValue placeholder="Select ensemble strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weighted">Weighted Average</SelectItem>
                    <SelectItem value="voting">Majority Voting</SelectItem>
                    <SelectItem value="stacking">Stacking</SelectItem>
                    <SelectItem value="boosting">Adaptive Boosting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <Network className="w-4 h-4 mr-2" />
                Deploy Ensemble Model
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Model Deployment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deployment-env">Deployment Environment</Label>
                  <Select>
                    <SelectTrigger className="bg-card/20 border-white/20">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scaling">Auto Scaling</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Enable auto scaling based on demand</span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monitoring">Performance Monitoring</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Real-time performance tracking</span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy to Production
                </Button>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">/api/v1/predict</span>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">/api/v1/analyze</span>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">/api/v1/trade</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">Staging</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key Management</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      value="sk-1234567890abcdef"
                      readOnly
                      className="bg-card/20 border-white/20 flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Code className="w-4 h-4 mr-2" />
                  View API Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
