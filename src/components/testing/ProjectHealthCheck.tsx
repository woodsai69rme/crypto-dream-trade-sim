import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Database,
  Server,
  Zap,
  Shield,
  Globe,
  Code
} from "lucide-react";

export const ProjectHealthCheck = () => {
  const healthChecks = [
    {
      category: "Database",
      icon: Database,
      status: "healthy",
      score: 98,
      message: "All database connections stable",
      lastCheck: "2 minutes ago",
      details: [
        { name: "Connection Pool", status: "healthy", value: "15/20 active" },
        { name: "Query Performance", status: "healthy", value: "avg 45ms" },
        { name: "Storage Usage", status: "warning", value: "78% used" }
      ]
    },
    {
      category: "API Services",
      icon: Server,
      status: "healthy",
      score: 95,
      message: "All endpoints responding normally",
      lastCheck: "1 minute ago",
      details: [
        { name: "Authentication", status: "healthy", value: "100% uptime" },
        { name: "Trading API", status: "healthy", value: "99.9% uptime" },
        { name: "Market Data", status: "healthy", value: "Real-time" }
      ]
    },
    {
      category: "Performance",
      icon: Zap,
      status: "warning",
      score: 82,
      message: "Some optimization opportunities detected",
      lastCheck: "5 minutes ago",
      details: [
        { name: "Load Time", status: "warning", value: "2.3s avg" },
        { name: "Memory Usage", status: "healthy", value: "65% used" },
        { name: "CPU Usage", status: "healthy", value: "42% avg" }
      ]
    },
    {
      category: "Security",
      icon: Shield,
      status: "healthy",
      score: 96,
      message: "All security checks passed",
      lastCheck: "30 minutes ago",
      details: [
        { name: "SSL Certificate", status: "healthy", value: "Valid until 2025" },
        { name: "Authentication", status: "healthy", value: "JWT secure" },
        { name: "Data Encryption", status: "healthy", value: "AES-256" }
      ]
    },
    {
      category: "Network",
      icon: Globe,
      status: "healthy",
      score: 99,
      message: "Network connectivity excellent",
      lastCheck: "1 minute ago",
      details: [
        { name: "CDN Status", status: "healthy", value: "All regions" },
        { name: "DNS Resolution", status: "healthy", value: "12ms avg" },
        { name: "Bandwidth", status: "healthy", value: "85% available" }
      ]
    },
    {
      category: "Code Quality",
      icon: Code,
      status: "warning",
      score: 88,
      message: "Minor code quality issues detected",
      lastCheck: "1 hour ago",
      details: [
        { name: "Test Coverage", status: "warning", value: "78%" },
        { name: "Code Complexity", status: "healthy", value: "Low" },
        { name: "Dependencies", status: "healthy", value: "Up to date" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-crypto-success';
      case 'warning':
        return 'text-crypto-warning';
      case 'error':
        return 'text-crypto-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-crypto-success/20 text-crypto-success border-crypto-success/30';
      case 'warning':
        return 'bg-crypto-warning/20 text-crypto-warning border-crypto-warning/30';
      case 'error':
        return 'bg-crypto-danger/20 text-crypto-danger border-crypto-danger/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const overallHealth = Math.round(
    healthChecks.reduce((sum, check) => sum + check.score, 0) / healthChecks.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Health Summary */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              System Health Overview
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={`text-lg px-3 py-1 ${getStatusBadge(overallHealth >= 90 ? 'healthy' : overallHealth >= 70 ? 'warning' : 'error')}`}>
                {overallHealth}%
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall System Health</span>
              <span>{overallHealth}%</span>
            </div>
            <Progress value={overallHealth} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {overallHealth >= 90 
                ? "All systems operating normally" 
                : overallHealth >= 70 
                ? "Some systems need attention" 
                : "Critical issues detected"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Health Check Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthChecks.map((check) => {
          const Icon = check.icon;
          const StatusIcon = getStatusIcon(check.status);
          
          return (
            <Card key={check.category} className="crypto-card-gradient text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-crypto-info" />
                    <CardTitle className="text-lg">{check.category}</CardTitle>
                  </div>
                  <Badge className={getStatusBadge(check.status)}>
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{check.score}%</div>
                  <Progress value={check.score} className="h-2" />
                </div>

                {/* Status Message */}
                <div className="flex items-start gap-2">
                  <StatusIcon className={`w-4 h-4 mt-0.5 ${getStatusColor(check.status)}`} />
                  <div>
                    <p className="text-sm">{check.message}</p>
                    <p className="text-xs text-muted-foreground">Last check: {check.lastCheck}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {check.details.map((detail) => {
                    const DetailIcon = getStatusIcon(detail.status);
                    return (
                      <div key={detail.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <DetailIcon className={`w-3 h-3 ${getStatusColor(detail.status)}`} />
                          <span className="text-muted-foreground">{detail.name}</span>
                        </div>
                        <span className="font-medium">{detail.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button */}
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Resources */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>42%</span>
              </div>
              <Progress value={42} className="h-2" />
              <p className="text-xs text-muted-foreground">8 cores available</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">16GB total</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground">500GB total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};