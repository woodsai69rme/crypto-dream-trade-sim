
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemAudit } from "../testing/SystemAudit";
import { ProjectHealthCheck } from "../testing/ProjectHealthCheck";
import { DocumentationStatus } from "../testing/DocumentationStatus";
import { FeatureCompletionStatus } from "../testing/FeatureCompletionStatus";
import { ProjectStatusSummary } from "../testing/ProjectStatusSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, TrendingUp, Settings, BarChart } from 'lucide-react';

export const ComprehensiveTestingSuite = () => {
  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Comprehensive Testing & Status Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Complete project health monitoring, feature tracking, documentation status, and business metrics.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 bg-white/10 h-auto p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 p-2">
            <BarChart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="health-check" className="data-[state=active]:bg-purple-600 p-2">
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger value="system-audit" className="data-[state=active]:bg-purple-600 p-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-purple-600 p-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="documentation" className="data-[state=active]:bg-purple-600 p-2">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectStatusSummary />
        </TabsContent>

        <TabsContent value="health-check" className="space-y-4">
          <ProjectHealthCheck />
        </TabsContent>

        <TabsContent value="system-audit" className="space-y-4">
          <SystemAudit />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureCompletionStatus />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <DocumentationStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};
