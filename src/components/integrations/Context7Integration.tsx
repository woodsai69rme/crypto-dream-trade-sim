
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Brain, Activity, Plus, Settings } from "lucide-react";

export const Context7Integration = () => {
  const [agents] = useState([
    {
      id: '1',
      name: 'Market Analyzer',
      type: 'analysis',
      status: 'active',
      contextWindow: 8000,
      accuracy: 94.2,
      memory: 'long_term'
    },
    {
      id: '2',
      name: 'Risk Assessor',
      type: 'risk_management',
      status: 'learning',
      contextWindow: 4000,
      accuracy: 87.5,
      memory: 'short_term'
    },
    {
      id: '3',
      name: 'Signal Generator',
      type: 'signal_generation',
      status: 'active',
      contextWindow: 12000,
      accuracy: 91.8,
      memory: 'adaptive'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Context7 AI Agents</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {agent.type.replace('_', ' ')} • {agent.contextWindow.toLocaleString()} context window
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Memory: {agent.memory}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge 
                      className={
                        agent.status === 'active' 
                          ? "bg-green-500/20 text-green-400" 
                          : agent.status === 'learning'
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {agent.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {agent.accuracy}% accuracy
                    </div>
                    <Progress value={agent.accuracy} className="w-16 h-1 mt-1" />
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Activity className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
