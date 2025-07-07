import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Workflow, Play, Pause, Settings, Plus, Trash2, Link, Zap, Clock, CheckCircle } from 'lucide-react';

interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  webhook_url: string;
  trigger_type: 'price_change' | 'news_sentiment' | 'bot_action' | 'portfolio_threshold' | 'manual';
  trigger_config: any;
  is_active: boolean;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
  created_at: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  config_template: any;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'price-alert-email',
    name: 'Price Alert Email',
    description: 'Send email when crypto price reaches threshold',
    category: 'Alerts',
    trigger_type: 'price_change',
    config_template: { threshold: 5, direction: 'up', symbol: 'BTC' }
  },
  {
    id: 'news-to-slack',
    name: 'News to Slack',
    description: 'Post crypto news with negative sentiment to Slack',
    category: 'Communications',
    trigger_type: 'news_sentiment',
    config_template: { sentiment_threshold: -0.5, channel: '#crypto-alerts' }
  },
  {
    id: 'bot-performance-report',
    name: 'Daily Bot Report',
    description: 'Generate daily performance report for all bots',
    category: 'Reporting',
    trigger_type: 'manual',
    config_template: { frequency: 'daily', include_charts: true }
  },
  {
    id: 'portfolio-rebalance',
    name: 'Auto Rebalance',
    description: 'Trigger portfolio rebalancing when allocation drifts',
    category: 'Trading',
    trigger_type: 'portfolio_threshold',
    config_template: { max_drift: 10, rebalance_method: 'proportional' }
  },
  {
    id: 'risk-management',
    name: 'Risk Alert System',
    description: 'Multiple alerts for various risk thresholds',
    category: 'Risk Management',
    trigger_type: 'bot_action',
    config_template: { max_drawdown: 15, stop_all: true }
  }
];

export const N8NWorkflowIntegration = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    webhook_url: '',
    trigger_type: 'manual' as const,
    trigger_config: {}
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    // Simulate loading workflows from backend
    const mockWorkflows: N8NWorkflow[] = [
      {
        id: '1',
        name: 'BTC Price Alert',
        description: 'Email alert when BTC price changes by 5%',
        webhook_url: 'https://n8n.example.com/webhook/btc-alert',
        trigger_type: 'price_change',
        trigger_config: { symbol: 'BTC', threshold: 5, direction: 'both' },
        is_active: true,
        last_executed: new Date(Date.now() - 3600000).toISOString(),
        execution_count: 45,
        success_rate: 97.8,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: '2',
        name: 'Negative News Slack Alert',
        description: 'Post negative sentiment news to Slack channel',
        webhook_url: 'https://n8n.example.com/webhook/news-slack',
        trigger_type: 'news_sentiment',
        trigger_config: { sentiment_threshold: -0.3, sources: ['all'] },
        is_active: true,
        last_executed: new Date(Date.now() - 1800000).toISOString(),
        execution_count: 23,
        success_rate: 100,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: '3',
        name: 'Portfolio Risk Monitor',
        description: 'Alert when portfolio drawdown exceeds 10%',
        webhook_url: 'https://n8n.example.com/webhook/risk-monitor',
        trigger_type: 'portfolio_threshold',
        trigger_config: { max_drawdown: 10, check_frequency: 'hourly' },
        is_active: false,
        execution_count: 12,
        success_rate: 91.7,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];
    setWorkflows(mockWorkflows);
  };

  const createWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.webhook_url) {
      toast({
        title: "Validation Error",
        description: "Name and webhook URL are required",
        variant: "destructive",
      });
      return;
    }

    const workflow: N8NWorkflow = {
      id: Date.now().toString(),
      ...newWorkflow,
      is_active: false,
      execution_count: 0,
      success_rate: 0,
      created_at: new Date().toISOString()
    };

    setWorkflows(prev => [...prev, workflow]);
    setNewWorkflow({
      name: '',
      description: '',
      webhook_url: '',
      trigger_type: 'manual',
      trigger_config: {}
    });
    setShowCreateForm(false);
    setSelectedTemplate(null);

    toast({
      title: "Workflow Created",
      description: `${workflow.name} has been created successfully`,
    });
  };

  const toggleWorkflow = async (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, is_active: !w.is_active } : w
    ));

    const workflow = workflows.find(w => w.id === id);
    toast({
      title: workflow?.is_active ? "Workflow Paused" : "Workflow Activated",
      description: `${workflow?.name} is now ${workflow?.is_active ? 'paused' : 'active'}`,
    });
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    toast({
      title: "Workflow Deleted",
      description: "Workflow has been removed",
    });
  };

  const executeWorkflow = async (workflow: N8NWorkflow) => {
    try {
      // Simulate webhook execution
      const response = await fetch(workflow.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_type: workflow.trigger_type,
          config: workflow.trigger_config,
          timestamp: new Date().toISOString(),
          source: 'crypto-trader-pro'
        })
      });

      if (!response.ok) {
        throw new Error('Webhook execution failed');
      }

      // Update execution count
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id 
          ? { ...w, execution_count: w.execution_count + 1, last_executed: new Date().toISOString() }
          : w
      ));

      toast({
        title: "Workflow Executed",
        description: `${workflow.name} executed successfully`,
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
    }
  };

  const useTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setNewWorkflow({
      name: template.name,
      description: template.description,
      webhook_url: '',
      trigger_type: template.trigger_type as any,
      trigger_config: template.config_template
    });
    setShowCreateForm(true);
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'price_change': return <Zap className="w-4 h-4" />;
      case 'news_sentiment': return <Workflow className="w-4 h-4" />;
      case 'bot_action': return <Settings className="w-4 h-4" />;
      case 'portfolio_threshold': return <Link className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">N8N Workflow Integration</h2>
          <p className="text-white/60">Automate your trading workflows with N8N</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Templates */}
      {!showCreateForm && (
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowTemplates.map((template) => (
                <div key={template.id} className="border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-white/70">{template.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => useTemplate(template)}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Workflow Form */}
      {showCreateForm && (
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedTemplate ? `Create from: ${selectedTemplate.name}` : 'Create New Workflow'}
              </CardTitle>
              <Button variant="outline" onClick={() => {
                setShowCreateForm(false);
                setSelectedTemplate(null);
              }}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20"
                placeholder="Enter workflow name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/10 border-white/20"
                placeholder="Describe what this workflow does..."
              />
            </div>

            <div className="space-y-2">
              <Label>N8N Webhook URL</Label>
              <Input
                value={newWorkflow.webhook_url}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, webhook_url: e.target.value }))}
                className="bg-white/10 border-white/20"
                placeholder="https://your-n8n.com/webhook/your-workflow"
              />
            </div>

            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select 
                value={newWorkflow.trigger_type}
                onValueChange={(value: any) => setNewWorkflow(prev => ({ ...prev, trigger_type: value }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Trigger</SelectItem>
                  <SelectItem value="price_change">Price Change</SelectItem>
                  <SelectItem value="news_sentiment">News Sentiment</SelectItem>
                  <SelectItem value="bot_action">Bot Action</SelectItem>
                  <SelectItem value="portfolio_threshold">Portfolio Threshold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trigger Configuration (JSON)</Label>
              <Textarea
                value={JSON.stringify(newWorkflow.trigger_config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setNewWorkflow(prev => ({ ...prev, trigger_config: config }));
                  } catch (error) {
                    // Invalid JSON, keep current state
                  }
                }}
                className="bg-white/10 border-white/20 font-mono text-sm"
                placeholder='{"example": "configuration"}'
                rows={4}
              />
            </div>

            <Button onClick={createWorkflow} className="w-full">
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Workflows */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Active Workflows
            <Badge variant="outline">{workflows.filter(w => w.is_active).length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
              No workflows created yet. Use a template or create a custom workflow.
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTriggerIcon(workflow.trigger_type)}
                      <div>
                        <h3 className="font-medium">{workflow.name}</h3>
                        <p className="text-sm text-white/60">{workflow.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={workflow.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold">{workflow.execution_count}</div>
                      <div className="text-xs text-white/60">Executions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{workflow.success_rate}%</div>
                      <div className="text-xs text-white/60">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold capitalize">{workflow.trigger_type.replace('_', ' ')}</div>
                      <div className="text-xs text-white/60">Trigger Type</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {workflow.last_executed 
                          ? new Date(workflow.last_executed).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                      <div className="text-xs text-white/60">Last Run</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Clock className="w-4 h-4" />
                      Created {new Date(workflow.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeWorkflow(workflow)}
                        disabled={!workflow.is_active}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Execute
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
