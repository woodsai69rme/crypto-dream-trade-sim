
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickTradePanel } from "@/components/trading/QuickTradePanel";
import { MarketOverviewDashboard } from "@/components/enhanced/MarketOverviewDashboard";
import { AITradingBot } from "@/components/ai/AITradingBot";
import { TradeFollower } from "@/components/trading/TradeFollower";
import { TradingHistoryDashboard } from "@/components/TradingHistoryDashboard";
import { BarChart3, Bot, Users, History, TrendingUp } from "lucide-react";

export const TradingPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Advanced Trading Hub</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="quick-trade" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Quick Trade
          </TabsTrigger>
          <TabsTrigger value="ai-bots" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Bots
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MarketOverviewDashboard />
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

        <TabsContent value="ai-bots">
          <AITradingBot />
        </TabsContent>

        <TabsContent value="following">
          <TradeFollower />
        </TabsContent>

        <TabsContent value="history">
          <TradingHistoryDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
