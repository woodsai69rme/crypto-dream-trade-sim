import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Search,
  FileText,
  Lock,
  Database,
  Code,
  Users
} from "lucide-react";

export const SystemAudit = () => {
  const auditCategories = [
    {
      name: "Security Audit",
      icon: Lock,
      status: "passed",
      score: 96,
      total: 25,
      passed: 24,
      failed: 0,
      warnings: 1,
      lastRun: "2 hours ago",
      items: [
        { name: "Authentication Security", status: "passed", severity: "high" },
        { name: "Data Encryption", status: "passed", severity: "high" },
        { name: "API Security", status: "passed", severity: "high" },
        { name: "Session Management", status: "warning", severity: "medium" },
        { name: "Input Validation", status: "passed", severity: "high" }
      ]
    },
    {
      name: "Code Quality",
      icon: Code,
      status: "warning",
      score: 82,
      total: 18,
      passed: 14,
      failed: 1,
      warnings: 3,
      lastRun: "1 hour ago",
      items: [
        { name: "Code Coverage", status: "warning", severity: "medium" },
        { name: "Complexity Analysis", status: "passed", severity: "low" },
        { name: "Dependency Check", status: "passed", severity: "medium" },
        { name: "Code Duplication", status: "failed", severity: "low" },
        { name: "Documentation", status: "warning", severity: "medium" }
      ]
    },
    {
      name: "Performance Audit",
      icon: Search,
      status: "passed",
      score: 88,
      total: 15,
      passed: 13,
      failed: 0,
      warnings: 2,
      lastRun: "30 minutes ago",
      items: [
        { name: "Load Time Analysis", status: "warning", severity: "medium" },
        { name: "Memory Usage", status: "passed", severity: "medium" },
        { name: "Database Queries", status: "passed", severity: "high" },
        { name: "Asset Optimization", status: "warning", severity: "low" },
        { name: "Caching Strategy", status: "passed", severity: "medium" }
      ]
    },
    {
      name: "Database Audit",
      icon: Database,
      status: "passed",
      score: 94,
      total: 12,
      passed: 11,
      failed: 0,
      warnings: 1,
      lastRun: "45 minutes ago",
      items: [
        { name: "Data Integrity", status: "passed", severity: "high" },
        { name: "Backup Status", status: "passed", severity: "high" },
        { name: "Index Optimization", status: "warning", severity: "medium" },
        { name: "Query Performance", status: "passed", severity: "medium" },
        { name: "Schema Validation", status: "passed", severity: "high" }
      ]
    },
    {
      name: "Compliance Audit",
      icon: FileText,
      status: "passed",
      score: 91,
      total: 10,
      passed: 9,
      failed: 0,
      warnings: 1,
      lastRun: "3 hours ago",
      items: [
        { name: "GDPR Compliance", status: "passed", severity: "high" },
        { name: "Data Privacy", status: "passed", severity: "high" },
        { name: "Audit Logging", status: "warning", severity: "medium" },
        { name: "Access Controls", status: "passed", severity: "high" },
        { name: "Data Retention", status: "passed", severity: "medium" }
      ]
    },
    {
      name: "User Experience",
      icon: Users,
      status: "warning",
      score: 76,
      total: 8,
      passed: 5,
      failed: 1,
      warnings: 2,
      lastRun: "2 hours ago",
      items: [
        { name: "Accessibility", status: "warning", severity: "high" },
        { name: "Mobile Responsiveness", status: "passed", severity: "medium" },
        { name: "Navigation Flow", status: "passed", severity: "medium" },
        { name: "Error Handling", status: "failed", severity: "medium" },
        { name: "Loading States", status: "warning", severity: "low" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-crypto-success';
      case 'warning':
        return 'text-crypto-warning';
      case 'failed':
        return 'text-crypto-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'failed':
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-crypto-success/20 text-crypto-success border-crypto-success/30';
      case 'warning':
        return 'bg-crypto-warning/20 text-crypto-warning border-crypto-warning/30';
      case 'failed':
        return 'bg-crypto-danger/20 text-crypto-danger border-crypto-danger/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
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

  const overallScore = Math.round(
    auditCategories.reduce((sum, category) => sum + category.score, 0) / auditCategories.length
  );

  return (
    <div className="space-y-6">
      {/* Audit Summary */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              System Audit Summary
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={`text-lg px-3 py-1 ${getStatusBadge(overallScore >= 90 ? 'passed' : overallScore >= 70 ? 'warning' : 'failed')}`}>
                {overallScore}%
              </Badge>
              <Button variant="outline" size="sm">
                Run Full Audit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-crypto-success">{auditCategories.reduce((sum, cat) => sum + cat.passed, 0)}</div>
              <div className="text-sm text-muted-foreground">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crypto-warning">{auditCategories.reduce((sum, cat) => sum + cat.warnings, 0)}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crypto-danger">{auditCategories.reduce((sum, cat) => sum + cat.failed, 0)}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{auditCategories.reduce((sum, cat) => sum + cat.total, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auditCategories.map((category) => {
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
                    {category.score}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Last run: {category.lastRun}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-crypto-success">{category.passed}</div>
                    <div className="text-xs text-muted-foreground">Passed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-crypto-warning">{category.warnings}</div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-crypto-danger">{category.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>

                {/* Audit Items */}
                <div className="space-y-2">
                  {category.items.slice(0, 3).map((item) => {
                    const StatusIcon = getStatusIcon(item.status);
                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-3 h-3 ${getStatusColor(item.status)}`} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <Badge className={`text-xs ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </Badge>
                      </div>
                    );
                  })}
                  {category.items.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{category.items.length - 3} more items
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button variant="outline" size="sm" className="w-full">
                  View Full Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Audit Activity */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Recent Audit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <span className="text-sm">Security audit completed successfully</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-crypto-warning" />
                <span className="text-sm">Code quality issues detected</span>
              </div>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <span className="text-sm">Database audit passed</span>
              </div>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};