
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Network, Play, Pause, Settings, Plus } from "lucide-react";

export const N8NIntegration = () => {
  const [workflows] = useState([
    {
      id: '1',
      name: 'Crypto Price Monitor',
      status: 'running',
      executions: 1247,
      lastRun: '2 minutes ago',
      success: 98.5
    },
    {
      id: '2',
      name: 'Trading Signal Processor',
      status: 'paused',
      executions: 892,
      lastRun: '1 hour ago',
      success: 95.2
    },
    {
      id: '3',
      name: 'Portfolio Rebalancer',
      status: 'running',
      executions: 156,
      lastRun: '15 minutes ago',
      success: 99.1
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">N8N Workflows</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {workflow.executions} executions • Last run: {workflow.lastRun}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge 
                      className={workflow.status === 'running' 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {workflow.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {workflow.success}% success rate
                    </div>
                    <Progress value={workflow.success} className="w-16 h-1 mt-1" />
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      {workflow.status === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
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
