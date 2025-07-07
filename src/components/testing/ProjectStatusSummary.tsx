import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign,
  BarChart3,
  Zap
} from "lucide-react";

export const ProjectStatusSummary = () => {
  const projectMetrics = {
    overall_health: 92,
    features_complete: 85,
    tests_passing: 78,
    documentation: 65,
    performance_score: 88,
    user_satisfaction: 94,
    revenue_growth: 23.5,
    active_users: 1247
  };

  const statusItems = [
    {
      label: "Core Features",
      status: "complete",
      icon: CheckCircle,
      count: "18/20",
      color: "text-crypto-success"
    },
    {
      label: "Bug Reports",
      status: "warning",
      icon: AlertTriangle,
      count: "3 open",
      color: "text-crypto-warning"
    },
    {
      label: "Pending Tasks",
      status: "in-progress",
      icon: Clock,
      count: "5 items",
      color: "text-crypto-info"
    },
    {
      label: "Security Audit",
      status: "complete",
      icon: CheckCircle,
      count: "Passed",
      color: "text-crypto-success"
    }
  ];

  const performanceMetrics = [
    {
      label: "Revenue Growth",
      value: `+${projectMetrics.revenue_growth}%`,
      icon: DollarSign,
      trend: "up"
    },
    {
      label: "Active Users",
      value: projectMetrics.active_users.toLocaleString(),
      icon: Users,
      trend: "up"
    },
    {
      label: "Performance Score",
      value: `${projectMetrics.performance_score}/100`,
      icon: Zap,
      trend: "up"
    },
    {
      label: "User Satisfaction",
      value: `${projectMetrics.user_satisfaction}%`,
      icon: TrendingUp,
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Health Overview</span>
            <Badge className="bg-crypto-success/20 text-crypto-success text-lg px-3 py-1">
              {projectMetrics.overall_health}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Health Score</span>
                <span>{projectMetrics.overall_health}%</span>
              </div>
              <Progress value={projectMetrics.overall_health} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Features</span>
                  <span>{projectMetrics.features_complete}%</span>
                </div>
                <Progress value={projectMetrics.features_complete} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Tests</span>
                  <span>{projectMetrics.tests_passing}%</span>
                </div>
                <Progress value={projectMetrics.tests_passing} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Docs</span>
                  <span>{projectMetrics.documentation}%</span>
                </div>
                <Progress value={projectMetrics.documentation} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Performance</span>
                  <span>{projectMetrics.performance_score}%</span>
                </div>
                <Progress value={projectMetrics.performance_score} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="crypto-card-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold">{item.count}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-crypto-info" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="w-3 h-3 text-crypto-success mr-1" />
                    <span className="text-xs text-crypto-success">Trending up</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <span className="text-sm">Trading system integration completed</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-crypto-warning" />
                <span className="text-sm">Performance optimization needed</span>
              </div>
              <span className="text-xs text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <span className="text-sm">Security audit passed</span>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};