
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickTradePanel } from "@/components/trading/QuickTradePanel";
import { MarketOverviewDashboard } from "@/components/enhanced/MarketOverviewDashboard";
import { AITradingBot } from "@/components/ai/AITradingBot";
import { TradeFollower } from "@/components/trading/TradeFollower";
import { TradingHistoryDashboard } from "@/components/TradingHistoryDashboard";
import { EnhancedOrderManager } from "@/components/trading/EnhancedOrderManager";
import { TradeAuditTrail } from "@/components/trading/TradeAuditTrail";
import { PortfolioRebalancingSystem } from "@/components/portfolio/PortfolioRebalancingSystem";
import { AdvancedPortfolioAnalytics } from "@/components/analytics/AdvancedPortfolioAnalytics";
import { BacktestingEngine } from "@/components/backtesting/BacktestingEngine";
import { MobilePWA } from "@/components/mobile/MobilePWA";
import { BarChart3, Bot, Users, History, TrendingUp, Activity, Edit, FileText, Scale, Brain, TestTube, Smartphone } from "lucide-react";
import { AIChatAssistant } from "@/components/ai/AIChatAssistant";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { PortfolioRebalancer } from "@/components/portfolio/PortfolioRebalancer";
import { RiskManagementDashboard } from "@/components/risk/RiskManagementDashboard";
import { LiveMonitoringDashboard } from "@/components/dashboard/LiveMonitoringDashboard";
import { RealTimeAuditLog } from "@/components/RealTimeAuditLog";

export const TradingPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Advanced Trading Hub</h1>
        <div className="ml-auto">
          <LiveMonitoringDashboard />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-12 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="quick-trade" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trade
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="rebalance" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Rebalance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Backtest
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="ai-bots" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Bots
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Risk
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <MarketOverviewDashboard />
            <RealTimeAuditLog />
          </div>
        </TabsContent>

        <TabsContent value="quick-trade">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <QuickTradePanel />
            </div>
            <div className="lg:col-span-2">
              <Card className="crypto-card-gradient text-primary-foreground">
                <CardHeader>
                  <CardTitle>Live Market Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketOverviewDashboard />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <EnhancedOrderManager />
        </TabsContent>

        <TabsContent value="rebalance">
          <PortfolioRebalancingSystem />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedPortfolioAnalytics />
        </TabsContent>

        <TabsContent value="backtest">
          <BacktestingEngine />
        </TabsContent>

        <TabsContent value="ai-chat">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AIChatAssistant />
            <div className="space-y-6">
              <TradingViewChart symbol="BTCUSD" height={300} />
              <PortfolioRebalancer />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-bots">
          <AITradingBot />
        </TabsContent>

        <TabsContent value="following">
          <TradeFollower />
        </TabsContent>

        <TabsContent value="audit">
          <TradeAuditTrail />
        </TabsContent>

        <TabsContent value="risk">
          <RiskManagementDashboard />
        </TabsContent>

        <TabsContent value="mobile">
          <MobilePWA />
        </TabsContent>
      </Tabs>
    </div>
  );
};
