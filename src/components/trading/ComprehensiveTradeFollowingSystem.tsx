
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveTradingDashboard } from "./LiveTradingDashboard";
import { ComprehensiveAuditViewer } from "./ComprehensiveAuditViewer";
import { Activity, FileText, Settings, Users, Bot, BarChart3 } from "lucide-react";

export const ComprehensiveTradeFollowingSystem = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-green-400" />
        <h1 className="text-3xl font-bold text-white">Complete Trade Following System</h1>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Dashboard
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit & Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <LiveTradingDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <ComprehensiveAuditViewer />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Trader Following</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• 20 Top crypto traders followed</div>
                <div>• Real-time signal copying</div>
                <div>• Configurable allocation percentages</div>
                <div>• Risk-based execution thresholds</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">AI Bot Network</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• 20 AI trading bots active</div>
                <div>• Strategic distribution across accounts</div>
                <div>• Ensemble decision making</div>
                <div>• Market condition adaptation</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Performance Tracking</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Real-time P&L monitoring</div>
                <div>• Cross-account correlation analysis</div>
                <div>• Risk management alerts</div>
                <div>• Comprehensive audit trails</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Active Components</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white/80">3 Paper trading accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white/80">20 AI trading bots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white/80">20 Followed traders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white/80">Real-time signal processing</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Safety Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Risk-based position sizing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Daily loss limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Execution delays for optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Comprehensive audit logging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
