
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LazyComponentLoader, LazyTradingPanel, LazyAccountManager, LazySettingsPanel, LazyAITradingBot } from "@/components/performance/LazyComponentLoader";
import { ComprehensiveTradeFollowingSystem } from "@/components/trading/ComprehensiveTradeFollowingSystem";
import { ResizableLayout } from "@/components/layout/ResizableLayout";
import { TopInfoBar } from "@/components/dashboard/TopInfoBar";
import { BottomAccountSummary } from "@/components/dashboard/BottomAccountSummary";
import { RealTimeAnalytics } from "@/components/analytics/RealTimeAnalytics";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { RealTimeNotifications } from "@/components/realtime/RealTimeNotifications";
import { 
  Home, 
  TrendingUp, 
  Settings, 
  Wallet,
  Activity,
  Users,
  Bot,
  BarChart3
} from 'lucide-react';

const Index = () => {
  console.log('Index page rendering');
  
  const topContent = <TopInfoBar />;
  
  const mainContent = (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          CryptoTrader Pro Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <GlobalSearch />
          <RealTimeNotifications />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm border border-border/50 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trading</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Following</span>
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Bots</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <RealTimeAnalytics />
          
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Market Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p>Real-time market data will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading">
          <LazyComponentLoader component={LazyTradingPanel} />
        </TabsContent>

        <TabsContent value="accounts">
          <LazyComponentLoader component={LazyAccountManager} />
        </TabsContent>

        <TabsContent value="following">
          <ComprehensiveTradeFollowingSystem />
        </TabsContent>

        <TabsContent value="bots">
          <LazyComponentLoader component={LazyAITradingBot} />
        </TabsContent>

        <TabsContent value="settings">
          <LazyComponentLoader component={LazySettingsPanel} />
        </TabsContent>
      </Tabs>
    </div>
  );
  
  const bottomContent = <BottomAccountSummary />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <ResizableLayout
        topContent={topContent}
        mainContent={mainContent}
        bottomContent={bottomContent}
        defaultTopSize={25}
        defaultBottomSize={25}
      />
    </div>
  );
};

export default Index;
