
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Workflow, Settings, Play, Pause, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  lastExecuted?: string;
  status: 'active' | 'inactive' | 'error';
}

export const N8NLocalConnection = () => {
  const { toast } = useToast();
  const [n8nUrl, setN8nUrl] = useState('http://localhost:5678');
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock workflows data
      const mockWorkflows: N8NWorkflow[] = [
        {
          id: '1',
          name: 'Crypto Price Monitor',
          active: true,
          tags: ['crypto', 'monitoring'],
          lastExecuted: new Date().toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Trade Signal Generator',
          active: false,
          tags: ['trading', 'signals'],
          status: 'inactive'
        },
        {
          id: '3',
          name: 'Social Media Sentiment',
          active: true,
          tags: ['social', 'sentiment'],
          lastExecuted: new Date(Date.now() - 300000).toISOString(),
          status: 'active'
        }
      ];

      setWorkflows(mockWorkflows);
      setIsConnected(true);
      
      toast({
        title: "N8N Connected",
        description: "Successfully connected to your N8N instance",
      });
    } catch (error) {
      toast({
        title: "Connection Failed", 
        description: "Could not connect to N8N instance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, active: boolean) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, active, status: active ? 'active' : 'inactive' }
        : w
    ));

    toast({
      title: active ? "Workflow Activated" : "Workflow Deactivated",
      description: `Workflow has been ${active ? 'started' : 'stopped'}`,
    });
  };

  const executeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    toast({
      title: "Workflow Executed",
      description: `${workflow.name} has been triggered manually`,
    });

    // Update last executed time
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, lastExecuted: new Date().toISOString() }
        : w
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            N8N Local Connection
            {isConnected && <Badge className="bg-green-500/20 text-green-400">Connected</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="n8n-url">N8N Instance URL</Label>
              <Input
                id="n8n-url"
                value={n8nUrl}
                onChange={(e) => setN8nUrl(e.target.value)}
                placeholder="http://localhost:5678"
                className="bg-card/20 border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="api-key">API Key (Optional)</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your N8N API key"
                className="bg-card/20 border-white/20"
              />
            </div>
          </div>
          
          <Button 
            onClick={testConnection} 
            disabled={loading || !n8nUrl}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isConnected && (
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Available Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {workflow.status === 'active' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium">{workflow.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {workflow.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.active}
                        onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={!workflow.active}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {workflow.lastExecuted && (
                    <p className="text-sm text-white/60">
                      Last executed: {new Date(workflow.lastExecuted).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
