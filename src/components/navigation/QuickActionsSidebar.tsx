
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Bot, 
  Activity, 
  DollarSign,
  AlertTriangle,
  Zap
} from 'lucide-react';

const quickActions = [
  {
    title: "Quick Trade",
    description: "Execute trades instantly",
    icon: TrendingUp,
    action: () => window.location.href = '/trading',
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    title: "AI Assistant",
    description: "Get trading insights",
    icon: Bot,
    action: () => console.log('AI Assistant'),
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    title: "Portfolio",
    description: "Check performance",
    icon: DollarSign,
    action: () => window.location.href = '/analytics',
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
  {
    title: "Risk Monitor",
    description: "Safety checks",
    icon: AlertTriangle,
    action: () => console.log('Risk Monitor'),
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  }
];

export const QuickActionsSidebar = () => {
  return (
    <Card className="crypto-card-gradient border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-accent/50"
            onClick={action.action}
          >
            <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
              <action.icon className={`w-4 h-4 ${action.color}`} />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">{action.title}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </div>
          </Button>
        ))}
        
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>System Status</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Online
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
