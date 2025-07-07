
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Auth } from "./Auth";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { EnhancedAccountManager } from "@/components/accounts/EnhancedAccountManager";
import { EnhancedSettingsPanel } from "@/components/settings/EnhancedSettingsPanel";
import { SystemStatus } from "@/components/enhanced/SystemStatus";
import { TradingPanel } from "@/components/TradingPanel";
import { SocialTradingSystem } from "@/components/SocialTradingSystem";
import { Wallet, Users, Settings, BarChart3, Activity, TrendingUp } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("portfolio");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <SystemStatus />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <PortfolioDashboard />
          </TabsContent>

          <TabsContent value="trading">
            <TradingPanel />
          </TabsContent>

          <TabsContent value="accounts">
            <EnhancedAccountManager />
          </TabsContent>

          <TabsContent value="social">
            <SocialTradingSystem />
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 gap-6">
              <SystemStatus />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <EnhancedSettingsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
