
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

interface DocStatus {
  name: string;
  path: string;
  status: 'complete' | 'partial' | 'missing';
  description: string;
  lastUpdated?: string;
  size?: string;
}

export const DocumentationStatus = () => {
  const documentationFiles: DocStatus[] = [
    {
      name: "Project README",
      path: "README.md",
      status: 'complete',
      description: "Comprehensive project overview, setup instructions, and feature documentation",
      size: "279 lines",
      lastUpdated: "Recently updated"
    },
    {
      name: "Testing Guide",
      path: "docs/TESTING_GUIDE.md",
      status: 'complete',
      description: "Manual and automated testing procedures, test cases, and QA guidelines",
      size: "260 lines",
      lastUpdated: "Recently updated"
    },
    {
      name: "Project Audit Report",
      path: "docs/PROJECT_AUDIT_REPORT.md",
      status: 'complete',
      description: "Comprehensive audit with valuation, monetization strategies, and roadmap",
      size: "284 lines",
      lastUpdated: "Recently updated"
    },
    {
      name: "API Documentation",
      path: "docs/API_DOCUMENTATION.md",
      status: 'complete',
      description: "Complete API endpoints, authentication, and integration guides",
      lastUpdated: "Up to date"
    },
    {
      name: "System Architecture",
      path: "docs/SYSTEM_ARCHITECTURE.md",
      status: 'complete',
      description: "Technical architecture, database schema, and system design",
      lastUpdated: "Up to date"
    },
    {
      name: "Deployment Checklist",
      path: "docs/DEPLOYMENT_CHECKLIST.md",
      status: 'complete',
      description: "Production deployment steps and environment configuration",
      lastUpdated: "Up to date"
    },
    {
      name: "Monetization Strategies",
      path: "docs/MONETIZATION_STRATEGIES.md",
      status: 'complete',
      description: "Business model analysis and revenue generation strategies",
      lastUpdated: "Up to date"
    },
    {
      name: "Project Valuation",
      path: "docs/PROJECT_VALUATION.md",
      status: 'complete',
      description: "Market analysis and project valuation assessment",
      lastUpdated: "Up to date"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'missing': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500/20 text-green-400';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400';
      case 'missing': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const completeCount = documentationFiles.filter(doc => doc.status === 'complete').length;
  const partialCount = documentationFiles.filter(doc => doc.status === 'partial').length;
  const missingCount = documentationFiles.filter(doc => doc.status === 'missing').length;

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documentation Status
          <Badge className="bg-green-500/20 text-green-400">
            {completeCount}/{documentationFiles.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{completeCount}</div>
            <div className="text-xs text-white/60">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{partialCount}</div>
            <div className="text-xs text-white/60">Partial</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{missingCount}</div>
            <div className="text-xs text-white/60">Missing</div>
          </div>
        </div>

        <div className="space-y-3">
          {documentationFiles.map((doc, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.status)}
                  <span className="font-medium">{doc.name}</span>
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </div>
                <Badge className={getStatusColor(doc.status)}>
                  {doc.status.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-white/80 mb-2">{doc.description}</p>
              
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="font-mono bg-white/5 px-2 py-1 rounded">{doc.path}</span>
                <div className="flex gap-4">
                  {doc.size && <span>{doc.size}</span>}
                  {doc.lastUpdated && <span>{doc.lastUpdated}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="font-medium text-green-400 mb-2">Documentation Summary</h4>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• All core documentation files are complete and up to date</li>
            <li>• README.md provides comprehensive project overview</li>
            <li>• Testing guide includes both manual and automated procedures</li>
            <li>• Project audit report includes valuation and monetization analysis</li>
            <li>• Technical documentation covers architecture and deployment</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
