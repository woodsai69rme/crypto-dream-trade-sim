import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Book,
  Code,
  Users,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export const DocumentationStatus = () => {
  const documentationSections = [
    {
      name: "API Documentation",
      icon: Code,
      progress: 92,
      status: "excellent",
      pages: 15,
      lastUpdated: "2 days ago",
      items: [
        { name: "Authentication API", status: "complete", coverage: 100 },
        { name: "Trading API", status: "complete", coverage: 95 },
        { name: "Market Data API", status: "complete", coverage: 90 },
        { name: "WebSocket API", status: "needs-update", coverage: 85 },
        { name: "Error Codes", status: "complete", coverage: 100 }
      ]
    },
    {
      name: "User Guides",
      icon: Book,
      progress: 78,
      status: "good",
      pages: 12,
      lastUpdated: "1 week ago",
      items: [
        { name: "Getting Started", status: "complete", coverage: 100 },
        { name: "Trading Guide", status: "complete", coverage: 90 },
        { name: "Portfolio Management", status: "needs-update", coverage: 75 },
        { name: "Risk Management", status: "incomplete", coverage: 60 },
        { name: "Advanced Features", status: "incomplete", coverage: 45 }
      ]
    },
    {
      name: "Developer Docs",
      icon: Code,
      progress: 85,
      status: "good",
      pages: 8,
      lastUpdated: "3 days ago",
      items: [
        { name: "Setup Guide", status: "complete", coverage: 100 },
        { name: "Architecture", status: "complete", coverage: 95 },
        { name: "Code Examples", status: "needs-update", coverage: 80 },
        { name: "Testing Guide", status: "incomplete", coverage: 65 },
        { name: "Deployment", status: "complete", coverage: 90 }
      ]
    },
    {
      name: "Admin Documentation",
      icon: Users,
      progress: 65,
      status: "needs-improvement",
      pages: 6,
      lastUpdated: "2 weeks ago",
      items: [
        { name: "User Management", status: "complete", coverage: 85 },
        { name: "System Monitoring", status: "needs-update", coverage: 70 },
        { name: "Backup Procedures", status: "incomplete", coverage: 50 },
        { name: "Security Protocols", status: "incomplete", coverage: 45 },
        { name: "Troubleshooting", status: "incomplete", coverage: 40 }
      ]
    },
    {
      name: "FAQ & Support",
      icon: HelpCircle,
      progress: 70,
      status: "good",
      pages: 10,
      lastUpdated: "5 days ago",
      items: [
        { name: "Common Questions", status: "complete", coverage: 90 },
        { name: "Trading FAQ", status: "complete", coverage: 85 },
        { name: "Technical Issues", status: "needs-update", coverage: 65 },
        { name: "Account Issues", status: "needs-update", coverage: 60 },
        { name: "Feature Requests", status: "incomplete", coverage: 50 }
      ]
    },
    {
      name: "Legal & Compliance",
      icon: FileText,
      progress: 88,
      status: "excellent",
      pages: 5,
      lastUpdated: "1 month ago",
      items: [
        { name: "Terms of Service", status: "complete", coverage: 100 },
        { name: "Privacy Policy", status: "complete", coverage: 100 },
        { name: "Risk Disclosure", status: "complete", coverage: 95 },
        { name: "Compliance Guide", status: "complete", coverage: 90 },
        { name: "Data Protection", status: "needs-update", coverage: 80 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-crypto-success';
      case 'good':
        return 'text-crypto-info';
      case 'needs-improvement':
        return 'text-crypto-warning';
      case 'poor':
        return 'text-crypto-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-crypto-success/20 text-crypto-success border-crypto-success/30';
      case 'good':
        return 'bg-crypto-info/20 text-crypto-info border-crypto-info/30';
      case 'needs-improvement':
        return 'bg-crypto-warning/20 text-crypto-warning border-crypto-warning/30';
      case 'poor':
        return 'bg-crypto-danger/20 text-crypto-danger border-crypto-danger/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-crypto-success';
      case 'needs-update':
        return 'text-crypto-warning';
      case 'incomplete':
        return 'text-crypto-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return CheckCircle;
      case 'needs-update':
        return AlertTriangle;
      case 'incomplete':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const overallProgress = Math.round(
    documentationSections.reduce((sum, section) => sum + section.progress, 0) / documentationSections.length
  );

  const totalPages = documentationSections.reduce((sum, section) => sum + section.pages, 0);
  const completeItems = documentationSections.reduce((sum, section) => 
    sum + section.items.filter(item => item.status === 'complete').length, 0
  );
  const needsUpdateItems = documentationSections.reduce((sum, section) => 
    sum + section.items.filter(item => item.status === 'needs-update').length, 0
  );
  const incompleteItems = documentationSections.reduce((sum, section) => 
    sum + section.items.filter(item => item.status === 'incomplete').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Documentation Overview */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentation Status Overview
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={`text-lg px-3 py-1 ${getStatusBadge(overallProgress >= 90 ? 'excellent' : overallProgress >= 75 ? 'good' : overallProgress >= 60 ? 'needs-improvement' : 'poor')}`}>
                {overallProgress}%
              </Badge>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Documentation Coverage</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-success">{completeItems}</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-warning">{needsUpdateItems}</div>
                <div className="text-sm text-muted-foreground">Needs Update</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-danger">{incompleteItems}</div>
                <div className="text-sm text-muted-foreground">Incomplete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalPages}</div>
                <div className="text-sm text-muted-foreground">Total Pages</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentationSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.name} className="crypto-card-gradient text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-crypto-info" />
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                  </div>
                  <Badge className={getStatusBadge(section.status)}>
                    {section.progress}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{section.pages} pages</span>
                  <span>Updated {section.lastUpdated}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <Progress value={section.progress} className="h-2" />
                </div>

                {/* Documentation Items */}
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const StatusIcon = getItemStatusIcon(item.status);
                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-3 h-3 ${getItemStatusColor(item.status)}`} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-xs">{item.coverage}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Documentation Activity */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Recent Documentation Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <div>
                  <span className="text-sm">API Documentation updated</span>
                  <p className="text-xs text-muted-foreground">Added new trading endpoints</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-crypto-warning" />
                <div>
                  <span className="text-sm">User Guide needs review</span>
                  <p className="text-xs text-muted-foreground">Portfolio section outdated</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">1 week ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-crypto-success" />
                <div>
                  <span className="text-sm">FAQ section expanded</span>
                  <p className="text-xs text-muted-foreground">Added common trading questions</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">5 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Metrics */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle>Documentation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Page Views (Monthly)</span>
                <span>12,847</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Search Success Rate</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground">Users finding answers</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>User Feedback Score</span>
                <span>4.2/5</span>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-muted-foreground">Based on 234 reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};