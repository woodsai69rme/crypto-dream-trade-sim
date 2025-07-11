
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
import { useAuth } from "@/hooks/useAuth";
import { useAccountInitialization } from "@/hooks/useAccountInitialization";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Wallet, TrendingUp, BarChart3, Users, Settings as SettingsIcon,
  Activity, Trophy, Target
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
      <div className="container mx-auto px-4 py-6">
        {/* Header with Phase 2 Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">CryptoTrader Pro</h1>
            <Badge className="bg-green-500/20 text-green-400 px-3 py-1">
              <Trophy className="w-4 h-4 mr-2" />
              Phase 2 Complete
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">
              Enterprise Ready
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <SystemHealthIndicator />
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("analytics")}
              className="bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
            >
              <Target className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-card/50 backdrop-blur-sm">
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
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Following
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
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

          <TabsContent value="following">
            <ComprehensiveTradeFollowingSystem />
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

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
