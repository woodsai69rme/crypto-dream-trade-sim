
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { WORKFLOW_TEMPLATES, WORKFLOW_CATEGORIES, WorkflowTemplate } from '@/data/workflows';
import { Workflow, Play, Pause, Settings, Search, TrendingUp, AlertTriangle } from 'lucide-react';

export const TradingWorkflowManager = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(WORKFLOW_TEMPLATES);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowTemplate[]>(WORKFLOW_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkflows, setActiveWorkflows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    let filtered = workflows;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(workflow => workflow.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(workflow => 
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWorkflows(filtered);
  }, [workflows, selectedCategory, searchTerm]);

  const handleToggleWorkflow = async (workflow: WorkflowTemplate) => {
    try {
      const newActive = new Set(activeWorkflows);
      if (activeWorkflows.has(workflow.id)) {
        newActive.delete(workflow.id);
        toast({
          title: "Workflow Stopped",
          description: `${workflow.name} has been stopped`,
        });
      } else {
        newActive.add(workflow.id);
        toast({
          title: "Workflow Started",
          description: `${workflow.name} is now running`,
        });
      }
      setActiveWorkflows(newActive);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle workflow status",
        variant: "destructive",
      });
    }
  };

  const handleActivateAll = async () => {
    try {
      const allWorkflowIds = new Set(filteredWorkflows.map(w => w.id));
      setActiveWorkflows(allWorkflowIds);
      toast({
        title: "All Workflows Activated",
        description: `Started ${filteredWorkflows.length} trading workflows`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate all workflows",
        variant: "destructive",
      });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-400 border-green-500/30";
      case "Medium": return "text-yellow-400 border-yellow-500/30";
      case "High": return "text-orange-400 border-orange-500/30";
      case "Very High": return "text-red-400 border-red-500/30";
      default: return "text-gray-400 border-gray-500/30";
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Beginner": return "text-green-400";
      case "Intermediate": return "text-yellow-400";
      case "Advanced": return "text-orange-400";
      case "Expert": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-6 h-6" />
            Trading Workflow Manager
            <Badge className="bg-green-500/20 text-green-400">
              {activeWorkflows.size} Running
            </Badge>
          </CardTitle>
          <Button onClick={handleActivateAll} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Start All Workflows
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-white/10 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKFLOW_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Workflow className="w-4 h-4" />
            {filteredWorkflows.length} workflows
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                      <Badge variant="outline" className={getRiskColor(workflow.risk_level)}>
                        {workflow.risk_level} Risk
                      </Badge>
                      <Badge variant="outline" className={`${getComplexityColor(workflow.complexity)} border-current`}>
                        {workflow.complexity}
                      </Badge>
                    </div>
                    <p className="text-white/80 mb-3">{workflow.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-xs text-white/60">Expected Returns</div>
                        <div className="text-green-400 font-semibold">{workflow.estimated_returns}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-xs text-white/60">Success Rate</div>
                        <div className="text-blue-400 font-semibold">{workflow.success_rate}%</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-xs text-white/60">Monthly Performance</div>
                        <div className="text-purple-400 font-semibold">+{workflow.monthly_performance}%</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-xs text-white/60">Min Capital</div>
                        <div className="text-orange-400 font-semibold">${workflow.required_capital}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => handleToggleWorkflow(workflow)}
                      variant={activeWorkflows.has(workflow.id) ? "destructive" : "default"}
                      size="sm"
                    >
                      {activeWorkflows.has(workflow.id) ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="space-y-3 mb-4">
                  <div className="text-sm font-medium text-white/80">Workflow Steps:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="bg-white/5 p-2 rounded text-center">
                        <div className="text-xs text-white/60">Step {index + 1}</div>
                        <div className="text-xs font-medium text-white">{step.title}</div>
                        {step.ai_model && (
                          <Badge variant="outline" className="text-xs mt-1 border-blue-500/30 text-blue-400">
                            {step.ai_model}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Models and APIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-white/60 mb-2">AI Models Used:</div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.ai_models_used.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-2">APIs Required:</div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.apis_required.map((api) => (
                        <Badge key={api} variant="outline" className="text-xs border-green-500/30 text-green-400">
                          {api}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status and Progress */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className={activeWorkflows.has(workflow.id) ? "text-green-400" : "text-gray-400"}>
                      Status: {activeWorkflows.has(workflow.id) ? "Running" : "Stopped"}
                    </span>
                    <span className="text-white/60">Time: {workflow.time_commitment}</span>
                  </div>
                  
                  {activeWorkflows.has(workflow.id) && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <Progress value={75} className="w-20 h-2" />
                      <span className="text-xs text-white/60">75%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Workflow className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No workflows found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
