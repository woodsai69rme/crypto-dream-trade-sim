import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bot, Settings, Zap, Brain, MessageSquare, Code } from "lucide-react";

interface MCPConfig {
  id: string;
  name: string;
  protocol: 'stdio' | 'sse' | 'websocket';
  endpoint: string;
  isEnabled: boolean;
  capabilities: string[];
  status: 'connected' | 'disconnected' | 'error';
}

export const MCPSettings = () => {
  const { toast } = useToast();
  const [mcpConfigs, setMcpConfigs] = useState<MCPConfig[]>([
    {
      id: 'claude-desktop',
      name: 'Claude Desktop Integration',
      protocol: 'stdio',
      endpoint: 'claude-desktop://mcp',
      isEnabled: true,
      capabilities: ['reasoning', 'analysis', 'coding'],
      status: 'connected'
    },
    {
      id: 'trading-assistant',
      name: 'Trading Assistant MCP',
      protocol: 'websocket',
      endpoint: 'ws://localhost:8080/mcp',
      isEnabled: false,
      capabilities: ['market-data', 'trading', 'analysis'],
      status: 'disconnected'
    },
    {
      id: 'portfolio-manager',
      name: 'Portfolio Manager MCP',
      protocol: 'sse',
      endpoint: 'http://localhost:3001/mcp/events',
      isEnabled: false,
      capabilities: ['portfolio', 'risk-management', 'reporting'],
      status: 'disconnected'
    }
  ]);

  const [newMCP, setNewMCP] = useState({
    name: '',
    protocol: 'websocket' as const,
    endpoint: '',
    capabilities: [] as string[]
  });

  const handleToggleMCP = (id: string) => {
    const updated = mcpConfigs.map(config => 
      config.id === id 
        ? { 
            ...config, 
            isEnabled: !config.isEnabled,
            status: !config.isEnabled ? 'connected' : 'disconnected' as const
          }
        : config
    );
    setMcpConfigs(updated);
    
    const config = updated.find(c => c.id === id);
    toast({
      title: `${config?.name} ${config?.isEnabled ? 'Enabled' : 'Disabled'}`,
      description: `MCP server has been ${config?.isEnabled ? 'activated' : 'deactivated'}`,
    });
  };

  const addNewMCP = () => {
    if (!newMCP.name || !newMCP.endpoint) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const mcpConfig: MCPConfig = {
      id: `mcp-${Date.now()}`,
      name: newMCP.name,
      protocol: newMCP.protocol,
      endpoint: newMCP.endpoint,
      isEnabled: false,
      capabilities: newMCP.capabilities,
      status: 'disconnected'
    };

    setMcpConfigs([...mcpConfigs, mcpConfig]);
    setNewMCP({ name: '', protocol: 'websocket', endpoint: '', capabilities: [] });
    
    toast({
      title: "MCP Server Added",
      description: `${newMCP.name} has been configured successfully`,
    });
  };

  const testMCPConnection = async (id: string) => {
    const updated = mcpConfigs.map(config => 
      config.id === id ? { ...config, status: 'connected' as const } : config
    );
    setMcpConfigs(updated);
    
    const config = updated.find(c => c.id === id);
    toast({
      title: "Connection Test",
      description: `Testing connection to ${config?.name}...`,
    });
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'stdio':
        return <Code className="w-4 h-4" />;
      case 'sse':
        return <Zap className="w-4 h-4" />;
      case 'websocket':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          MCP (Model Context Protocol) Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing MCP Configurations */}
        <div className="space-y-4">
          <h4 className="font-medium text-white/80">Configured MCP Servers</h4>
          {mcpConfigs.map((config) => (
            <div key={config.id} className="p-4 bg-white/5 rounded border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getProtocolIcon(config.protocol)}
                  <div>
                    <h5 className="font-medium">{config.name}</h5>
                    <p className="text-sm text-white/60">{config.endpoint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(config.status)}>
                    {config.status.toUpperCase()}
                  </Badge>
                  <Switch
                    checked={config.isEnabled}
                    onCheckedChange={() => handleToggleMCP(config.id)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {config.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {config.protocol.toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testMCPConnection(config.id)}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New MCP Server */}
        <div className="space-y-4 p-4 bg-white/5 rounded border border-white/10">
          <h4 className="font-medium text-white/80">Add New MCP Server</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mcp-name">Server Name</Label>
              <Input
                id="mcp-name"
                value={newMCP.name}
                onChange={(e) => setNewMCP({ ...newMCP, name: e.target.value })}
                placeholder="My MCP Server"
                className="bg-white/5 border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mcp-protocol">Protocol</Label>
              <Select
                value={newMCP.protocol}
                onValueChange={(value: 'stdio' | 'sse' | 'websocket') => 
                  setNewMCP({ ...newMCP, protocol: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="websocket">WebSocket</SelectItem>
                  <SelectItem value="sse">Server-Sent Events</SelectItem>
                  <SelectItem value="stdio">Standard I/O</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mcp-endpoint">Endpoint URL</Label>
            <Input
              id="mcp-endpoint"
              value={newMCP.endpoint}
              onChange={(e) => setNewMCP({ ...newMCP, endpoint: e.target.value })}
              placeholder="ws://localhost:8080/mcp or http://localhost:3001/mcp"
              className="bg-white/5 border-white/20"
            />
          </div>
          
          <Button onClick={addNewMCP} className="w-full">
            <Bot className="w-4 h-4 mr-2" />
            Add MCP Server
          </Button>
        </div>

        {/* Information Panel */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-400">About MCP</h5>
              <p className="text-sm text-white/70 mt-1">
                Model Context Protocol enables seamless integration with AI assistants like Claude Desktop, 
                allowing for enhanced trading capabilities and portfolio management.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
