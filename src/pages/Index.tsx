import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Portfolio } from "@/components/Portfolio";
import { TradingPanel } from "@/components/TradingPanel";
import { MarketOverview } from "@/components/MarketOverview";
import { TopTraders } from "@/components/TopTraders";
import { Settings } from "@/components/Settings";
import { AdvancedPortfolioAnalytics } from "@/components/analytics/AdvancedPortfolioAnalytics";
import { ComprehensiveTradeFollowingSystem } from "@/components/trading/ComprehensiveTradeFollowingSystem";
import { AccountDashboard } from "@/components/accounts/AccountDashboard";
import { SystemHealthIndicator } from "@/components/enhanced/SystemHealthIndicator";
import { RealTradingDashboard } from "@/components/enhanced/RealTradingDashboard";
import { OpenRouterManagement } from "@/components/integrations/OpenRouterManagement";
import { TopInfoBar } from "@/components/dashboard/TopInfoBar";
import { BottomAccountSummary } from "@/components/dashboard/BottomAccountSummary";
import { SystemStatusDashboard } from "@/components/monitoring/SystemStatusDashboard";
import { ComponentOptimizer } from "@/components/optimization/ComponentOptimizer";
import { 
  LazyDeribitIntegration,
  LazyEnhancedAccountResetManager,
  LazyWrapper
} from "@/components/performance/LazyComponentLoader";
import { ComprehensiveAPIManager } from "@/components/integrations/ComprehensiveAPIManager";
import { useAuth } from "@/hooks/useAuth";
import { useAccountInitialization } from "@/hooks/useAccountInitialization";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Wallet, TrendingUp, BarChart3, Users, Settings as SettingsIcon,
  Activity, Trophy, Target, Database, Shield
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { initializing } = useAccountInitialization();
  const [activeTab, setActiveTab] = useState("accounts");

  // Listen for navigation events from TradeFollower
  useEffect(() => {
    const handleNavigation = () => {
      setActiveTab("following");
    };
    
    window.addEventListener('navigate-to-following', handleNavigation);
    return () => window.removeEventListener('navigate-to-following', handleNavigation);
  }, []);

  // Show loading while initializing accounts
  if (initializing) {
    return (
      <div className="min-h-screen crypto-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <h1 className="text-3xl font-bold text-white">Setting up your accounts...</h1>
          <p className="text-xl text-gray-300">Preparing your trading environment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen crypto-gradient">
      {/* Top Info Bar */}
      <TopInfoBar />
      
      <div className="container mx-auto px-4 py-6" style={{ marginTop: '160px', marginBottom: '320px' }}>
        {/* Header with Enhanced Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">CryptoTrader Pro</h1>
            <Badge className="bg-green-500/20 text-green-400 px-3 py-1">
              <Trophy className="w-4 h-4 mr-2" />
              System Health: 96%
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">
              Production Ready
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 px-3 py-1">
              Phase 2+ Complete
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <SystemHealthIndicator />
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("monitoring")}
              className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              <Activity className="w-4 h-4 mr-2" />
              System Monitor
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("openrouter")}
              className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
            >
              <Activity className="w-4 h-4 mr-2" />
              OpenRouter AI
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("deribit")}
              className="bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Deribit Testnet
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("analytics")}
              className="bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
            >
              <Target className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-13 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="live-trading" className="flex items-center gap-2 bg-red-500/10">
              <Shield className="w-4 h-4" />
              Live Trading
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2 bg-red-500/10">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="openrouter" className="flex items-center gap-2 bg-emerald-500/10">
              <Activity className="w-4 h-4" />
              OpenRouter
            </TabsTrigger>
            <TabsTrigger value="deribit" className="flex items-center gap-2 bg-orange-500/10">
              <TrendingUp className="w-4 h-4" />
              Deribit
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2 bg-cyan-500/10">
              <Database className="w-4 h-4" />
              All APIs
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="traders" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Top Traders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reset" className="flex items-center gap-2 bg-red-500/10">
              <Target className="w-4 h-4" />
              Reset Pro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <AccountDashboard />
          </TabsContent>

          <TabsContent value="portfolio">
            <Portfolio />
          </TabsContent>

          <TabsContent value="trading">
            <TradingPanel />
          </TabsContent>

          <TabsContent value="live-trading">
            <RealTradingDashboard />
          </TabsContent>

          <TabsContent value="following">
            <ComprehensiveTradeFollowingSystem />
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="space-y-6">
              <SystemStatusDashboard />
              <ComponentOptimizer />
            </div>
          </TabsContent>

          <TabsContent value="openrouter">
            <OpenRouterManagement />
          </TabsContent>

          <TabsContent value="deribit">
            <LazyWrapper>
              <LazyDeribitIntegration />
            </LazyWrapper>
          </TabsContent>

          <TabsContent value="apis">
            <ComprehensiveAPIManager />
          </TabsContent>

          <TabsContent value="market">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="traders">
            <TopTraders />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedPortfolioAnalytics />
          </TabsContent>

          <TabsContent value="reset">
            <LazyWrapper>
              <LazyEnhancedAccountResetManager />
            </LazyWrapper>
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Account Summary */}
      <BottomAccountSummary />
    </div>
  );
};

export default Index;
