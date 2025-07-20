
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradingPanel } from "@/components/TradingPanel";
import { EnhancedAccountManager } from "@/components/accounts/EnhancedAccountManager";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { ComprehensiveTradeFollowingSystem } from "@/components/trading/ComprehensiveTradeFollowingSystem";
import { QuickActionsSidebar } from "@/components/navigation/QuickActionsSidebar";
import { TopInfoBar } from "@/components/dashboard/TopInfoBar";
import { BottomAccountSummary } from "@/components/dashboard/BottomAccountSummary";
import { 
  Home, 
  TrendingUp, 
  Settings, 
  User,
  BarChart3,
  Bot,
  Wallet,
  Activity,
  Users
} from 'lucide-react';

const Index = () => {
  console.log('Index page rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Top Info Bar */}
      <TopInfoBar />
      
      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          {/* Quick Actions Sidebar */}
          <div className="hidden lg:block w-64 space-y-6">
            <QuickActionsSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
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
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
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
                  </div>
                  
                  <div className="lg:block xl:hidden">
                    <QuickActionsSidebar />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trading">
                <TradingPanel />
              </TabsContent>

              <TabsContent value="accounts">
                <EnhancedAccountManager />
              </TabsContent>

              <TabsContent value="following">
                <ComprehensiveTradeFollowingSystem />
              </TabsContent>

              <TabsContent value="bots">
                <Card className="crypto-card-gradient">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      AI Trading Bots
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="w-16 h-16 mx-auto mb-4" />
                      <p>AI trading bots configuration will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Bottom Account Summary */}
      <BottomAccountSummary />
    </div>
  );
};

export default Index;
