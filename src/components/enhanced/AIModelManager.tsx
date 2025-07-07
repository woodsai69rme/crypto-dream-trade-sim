
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AI_MODELS, AI_PROVIDERS, AI_CATEGORIES, AIModel } from '@/data/aiModels';
import { Bot, Cpu, Eye, Zap, Code, Settings, Search } from 'lucide-react';

export const AIModelManager = () => {
  const [models, setModels] = useState<AIModel[]>(AI_MODELS);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>(AI_MODELS);
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModels, setActiveModels] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    let filtered = models;

    if (selectedProvider !== "All") {
      filtered = filtered.filter(model => model.provider === selectedProvider);
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(model => model.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.use_cases.some(useCase => useCase.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredModels(filtered);
  }, [models, selectedProvider, selectedCategory, searchTerm]);

  const handleToggleModel = async (model: AIModel) => {
    try {
      const newActive = new Set(activeModels);
      if (activeModels.has(model.id)) {
        newActive.delete(model.id);
        toast({
          title: "Model Deactivated",
          description: `${model.name} has been deactivated`,
        });
      } else {
        newActive.add(model.id);
        toast({
          title: "Model Activated",
          description: `${model.name} is now active for trading`,
        });
      }
      setActiveModels(newActive);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle model status",
        variant: "destructive",
      });
    }
  };

  const handleActivateAll = async () => {
    try {
      const allModelIds = new Set(filteredModels.map(m => m.id));
      setActiveModels(allModelIds);
      toast({
        title: "All Models Activated",
        description: `Activated ${filteredModels.length} AI models`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate all models",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            AI Model Management
            <Badge className="bg-green-500/20 text-green-400">
              {activeModels.size} Active
            </Badge>
          </CardTitle>
          <Button onClick={handleActivateAll} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Activate All Models
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20"
            />
          </div>
          
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="bg-white/10 border-white/20">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-white/10 border-white/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {AI_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Cpu className="w-4 h-4" />
            {filteredModels.length} models
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredModels.map((model) => (
            <Card key={model.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{model.name}</h3>
                      <Badge variant="outline" className="text-xs border-white/20">
                        {model.provider}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/60 mb-2">{model.category}</p>
                    <p className="text-sm text-white/80">{model.description}</p>
                  </div>
                  
                  <Switch
                    checked={activeModels.has(model.id)}
                    onCheckedChange={() => handleToggleModel(model)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-xs text-white/60">Pricing</div>
                    <div className="text-xs font-semibold text-green-400">{model.pricing}</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-xs text-white/60">Tokens</div>
                    <div className="text-xs font-semibold text-blue-400">
                      {model.max_tokens ? `${(model.max_tokens / 1000).toFixed(0)}K` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-xs text-white/60">Features</div>
                    <div className="flex justify-center gap-1">
                      {model.supports_vision && <Eye className="w-3 h-3 text-purple-400" />}
                      {model.supports_streaming && <Zap className="w-3 h-3 text-yellow-400" />}
                      {model.supports_function_calling && <Code className="w-3 h-3 text-green-400" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Capabilities</div>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.slice(0, 3).map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-white/60 mb-1">Use Cases</div>
                    <div className="flex flex-wrap gap-1">
                      {model.use_cases.slice(0, 2).map((useCase) => (
                        <Badge key={useCase} variant="outline" className="text-xs border-green-500/30 text-green-400">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className={activeModels.has(model.id) ? "text-green-400" : "text-red-400"}>
                    {activeModels.has(model.id) ? "Active" : "Inactive"}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Bot className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No AI models found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
