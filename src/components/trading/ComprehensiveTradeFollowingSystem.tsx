
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveTradingDashboard } from "./LiveTradingDashboard";
import { ComprehensiveAuditViewer } from "./ComprehensiveAuditViewer";
import { RealTimeSignalProcessor } from "./RealTimeSignalProcessor";
import { AdvancedRiskManager } from "./AdvancedRiskManager";
import { PerformanceAnalyticsDashboard } from "./PerformanceAnalyticsDashboard";
import { SystemOptimizer } from "./SystemOptimizer";
import { Activity, FileText, Settings, Users, Bot, BarChart3, Brain, Shield } from "lucide-react";

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

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-card/50 backdrop-blur-sm">
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
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            System Info
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Trader Following</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• 20 Top crypto traders followed</div>
                <div>• Real-time signal copying with AI ensemble</div>
                <div>• Configurable allocation percentages</div>
                <div>• Risk-based execution thresholds</div>
                <div>• Cross-account correlation analysis</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">AI Bot Network</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• 20 AI trading bots active</div>
                <div>• Strategic distribution across 3 accounts</div>
                <div>• Ensemble decision making with voting</div>
                <div>• Dynamic market condition adaptation</div>
                <div>• Real-time performance optimization</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Performance Tracking</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Real-time P&L monitoring across accounts</div>
                <div>• Advanced risk management with auto-stops</div>
                <div>• Cross-account correlation analysis</div>
                <div>• Comprehensive audit trails</div>
                <div>• Export capabilities for analysis</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Risk Management</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Advanced drawdown protection</div>
                <div>• Dynamic position sizing</div>
                <div>• Correlation-based risk assessment</div>
                <div>• Emergency stop mechanisms</div>
                <div>• Real-time alert system</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-green-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">AI Signal Processing</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Ensemble bot voting system</div>
                <div>• Market condition adaptation</div>
                <div>• Confidence-based filtering</div>
                <div>• Cross-signal validation</div>
                <div>• Sentiment integration ready</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">System Optimization</h3>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div>• AI-powered parameter optimization</div>
                <div>• Performance projection modeling</div>
                <div>• Dynamic rebalancing strategies</div>
                <div>• Multi-objective optimization</div>
                <div>• Continuous learning algorithms</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">System Status & Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Active Components</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white/80">3 Paper trading accounts (woods1, angry, handjob)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white/80">20 AI trading bots with strategic distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white/80">20 Top crypto traders being followed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white/80">Real-time signal processing with ensemble voting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white/80">Advanced risk management system</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Advanced Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Cross-account trade copying and correlation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Dynamic position sizing with volatility scaling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">AI-powered system optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Comprehensive audit trail with export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Real-time performance analytics</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg">
              <div className="text-center">
                <h4 className="font-bold text-white text-lg mb-2">🚀 COMPLETE SYSTEM OPERATIONAL 🚀</h4>
                <p className="text-white/80 text-sm">
                  All phases implemented: Advanced AI ensemble trading across 3 accounts with 20 bots 
                  following 20 top crypto traders, real-time risk management, performance analytics, 
                  system optimization, and comprehensive audit trails.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
