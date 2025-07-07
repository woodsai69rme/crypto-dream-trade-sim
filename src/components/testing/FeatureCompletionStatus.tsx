import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Play,
  TrendingUp,
  Bot,
  Users,
  BarChart3,
  Shield,
  Settings,
  DollarSign
} from "lucide-react";

export const FeatureCompletionStatus = () => {
  const featureCategories = [
    {
      name: "Core Trading Features",
      icon: TrendingUp,
      progress: 95,
      status: "completed",
      features: [
        { name: "Paper Trading", status: "completed", priority: "high" },
        { name: "Real-time Market Data", status: "completed", priority: "high" },
        { name: "Portfolio Management", status: "completed", priority: "high" },
        { name: "Trade Execution", status: "completed", priority: "high" },
        { name: "Risk Management", status: "in-progress", priority: "medium" }
      ]
    },
    {
      name: "AI & Automation",
      icon: Bot,
      progress: 78,
      status: "in-progress",
      features: [
        { name: "AI Trading Bots", status: "completed", priority: "high" },
        { name: "Strategy Backtesting", status: "completed", priority: "medium" },
        { name: "Signal Generation", status: "in-progress", priority: "high" },
        { name: "Auto-trading", status: "in-progress", priority: "medium" },
        { name: "ML Predictions", status: "planned", priority: "low" }
      ]
    },
    {
      name: "Social Trading",
      icon: Users,
      progress: 65,
      status: "in-progress",
      features: [
        { name: "Follow Traders", status: "completed", priority: "medium" },
        { name: "Copy Trading", status: "in-progress", priority: "high" },
        { name: "Social Feed", status: "in-progress", priority: "low" },
        { name: "Leaderboards", status: "planned", priority: "medium" },
        { name: "Community Chat", status: "planned", priority: "low" }
      ]
    },
    {
      name: "Analytics & Reporting",
      icon: BarChart3,
      progress: 88,
      status: "completed",
      features: [
        { name: "Performance Analytics", status: "completed", priority: "high" },
        { name: "Trade History", status: "completed", priority: "high" },
        { name: "Portfolio Insights", status: "completed", priority: "medium" },
        { name: "Risk Metrics", status: "in-progress", priority: "medium" },
        { name: "Tax Reporting", status: "planned", priority: "low" }
      ]
    },
    {
      name: "Security & Compliance",
      icon: Shield,
      progress: 82,
      status: "in-progress",
      features: [
        { name: "User Authentication", status: "completed", priority: "high" },
        { name: "Data Encryption", status: "completed", priority: "high" },
        { name: "Audit Logging", status: "completed", priority: "medium" },
        { name: "2FA Implementation", status: "in-progress", priority: "high" },
        { name: "Compliance Tools", status: "planned", priority: "medium" }
      ]
    },
    {
      name: "Advanced Features",
      icon: Settings,
      progress: 45,
      status: "planned",
      features: [
        { name: "API Integration", status: "completed", priority: "high" },
        { name: "Mobile App", status: "planned", priority: "medium" },
        { name: "Advanced Charting", status: "in-progress", priority: "medium" },
        { name: "Custom Indicators", status: "planned", priority: "low" },
        { name: "Multi-Exchange", status: "planned", priority: "low" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-crypto-success';
      case 'in-progress':
        return 'text-crypto-warning';
      case 'planned':
        return 'text-crypto-info';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-crypto-success/20 text-crypto-success border-crypto-success/30';
      case 'in-progress':
        return 'bg-crypto-warning/20 text-crypto-warning border-crypto-warning/30';
      case 'planned':
        return 'bg-crypto-info/20 text-crypto-info border-crypto-info/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-progress':
        return Play;
      case 'planned':
        return Clock;
      default:
        return Clock;
    }
  };

  const overallProgress = Math.round(
    featureCategories.reduce((sum, category) => sum + category.progress, 0) / featureCategories.length
  );

  const totalFeatures = featureCategories.reduce((sum, category) => sum + category.features.length, 0);
  const completedFeatures = featureCategories.reduce((sum, category) => 
    sum + category.features.filter(f => f.status === 'completed').length, 0
  );
  const inProgressFeatures = featureCategories.reduce((sum, category) => 
    sum + category.features.filter(f => f.status === 'in-progress').length, 0
  );
  const plannedFeatures = featureCategories.reduce((sum, category) => 
    sum + category.features.filter(f => f.status === 'planned').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Feature Development Progress
            </CardTitle>
            <Badge className={`text-lg px-3 py-1 ${getStatusBadge(overallProgress >= 90 ? 'completed' : overallProgress >= 50 ? 'in-progress' : 'planned')}`}>
              {overallProgress}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Feature Completion</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-success">{completedFeatures}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-warning">{inProgressFeatures}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-info">{plannedFeatures}</div>
                <div className="text-sm text-muted-foreground">Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalFeatures}</div>
                <div className="text-sm text-muted-foreground">Total Features</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCategories.map((category) => {
          const Icon = category.icon;
          
          return (
            <Card key={category.name} className="crypto-card-gradient text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-crypto-info" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge className={getStatusBadge(category.status)}>
                    {category.progress}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <Progress value={category.progress} className="h-2" />
                </div>

                {/* Feature List */}
                <div className="space-y-2">
                  {category.features.map((feature) => {
                    const StatusIcon = getStatusIcon(feature.status);
                    return (
                      <div key={feature.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-3 h-3 ${getStatusColor(feature.status)}`} />
                          <span className="text-muted-foreground">{feature.name}</span>
                        </div>
                        <Badge className={`text-xs ${getPriorityBadge(feature.priority)}`}>
                          {feature.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button */}
                <Button variant="outline" size="sm" className="w-full">
                  View Roadmap
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Development Timeline */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Development Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <div>
                  <span className="text-sm font-medium">Core Trading Platform</span>
                  <p className="text-xs text-muted-foreground">Q1 2024 - Completed</p>
                </div>
              </div>
              <Badge className="bg-crypto-success/20 text-crypto-success">100%</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4 text-crypto-warning" />
                <div>
                  <span className="text-sm font-medium">AI & Social Features</span>
                  <p className="text-xs text-muted-foreground">Q2 2024 - In Progress</p>
                </div>
              </div>
              <Badge className="bg-crypto-warning/20 text-crypto-warning">65%</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-crypto-info" />
                <div>
                  <span className="text-sm font-medium">Advanced Analytics</span>
                  <p className="text-xs text-muted-foreground">Q3 2024 - Planned</p>
                </div>
              </div>
              <Badge className="bg-crypto-info/20 text-crypto-info">Planned</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-crypto-info" />
                <div>
                  <span className="text-sm font-medium">Mobile Application</span>
                  <p className="text-xs text-muted-foreground">Q4 2024 - Planned</p>
                </div>
              </div>
              <Badge className="bg-crypto-info/20 text-crypto-info">Planned</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};