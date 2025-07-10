
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Portfolio } from "@/components/Portfolio";
import { TradingPanel } from "@/components/TradingPanel";
import { MarketOverview } from "@/components/MarketOverview";
import { TopTraders } from "@/components/TopTraders";
import { Settings } from "@/components/Settings";
import { AdvancedPortfolioAnalytics } from "@/components/analytics/AdvancedPortfolioAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { 
  Wallet, TrendingUp, BarChart3, Users, Settings as SettingsIcon,
  Activity, Trophy, Target
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("portfolio");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">CryptoTrader Pro</h1>
          <p className="text-xl text-gray-300">Please sign in to access the trading platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
          <div className="flex items-center gap-2">
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
          <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="traders" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
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

          <TabsContent value="portfolio">
            <Portfolio />
          </TabsContent>

          <TabsContent value="trading">
            <TradingPanel />
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
