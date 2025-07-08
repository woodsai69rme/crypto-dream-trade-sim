
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveTradingDashboard } from "./LiveTradingDashboard";
import { ComprehensiveAuditViewer } from "./ComprehensiveAuditViewer";
import { RealTimeSignalProcessor } from "./RealTimeSignalProcessor";
import { AdvancedRiskManager } from "./AdvancedRiskManager";
import { PerformanceAnalyticsDashboard } from "./PerformanceAnalyticsDashboard";
import { SystemOptimizer } from "./SystemOptimizer";
import { EnhancedTradeFollower } from "./EnhancedTradeFollower";
import { AccountTradingMonitor } from "./AccountTradingMonitor";
import { Activity, FileText, Settings, Users, Bot, BarChart3, Brain, Shield, Monitor } from "lucide-react";

export const ComprehensiveTradeFollowingSystem = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-green-400" />
        <h1 className="text-3xl font-bold text-white">Complete Trade Following System</h1>
        <div className="ml-auto text-sm text-white/60">
          Advanced AI-powered multi-account trading system
        </div>
      </div>

      <Tabs defaultValue="following" className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Trade Following
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Account Monitor
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Dashboard
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Signal Processor
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Risk Manager
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Optimizer
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          <EnhancedTradeFollower />
        </TabsContent>

        <TabsContent value="monitor">
          <AccountTradingMonitor />
        </TabsContent>

        <TabsContent value="dashboard">
          <LiveTradingDashboard />
        </TabsContent>

        <TabsContent value="signals">
          <RealTimeSignalProcessor />
        </TabsContent>

        <TabsContent value="risk">
          <AdvancedRiskManager />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="optimizer">
          <SystemOptimizer />
        </TabsContent>

        <TabsContent value="audit">
          <ComprehensiveAuditViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};
