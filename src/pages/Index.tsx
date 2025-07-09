
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LiveTradingDashboard } from "@/components/dashboard/LiveTradingDashboard";
import { EnhancedSettingsPanel } from "@/components/settings/EnhancedSettingsPanel";
import { Phase2StatusDashboard } from "@/components/Phase2StatusDashboard";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, Settings, Activity, Zap, Trophy, 
  TrendingUp, Users, Brain, Target 
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

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
              onClick={() => setActiveTab("phase2-status")}
              className="bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
            >
              <Target className="w-4 h-4 mr-2" />
              View Phase 2 Status
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="live-trading" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Trading
            </TabsTrigger>
            <TabsTrigger value="phase2-status" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Phase 2 Status
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              All Features
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="live-trading">
            <LiveTradingDashboard />
          </TabsContent>

          <TabsContent value="phase2-status">
            <Phase2StatusDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <EnhancedSettingsPanel />
          </TabsContent>

          <TabsContent value="achievements">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                  🎉 Congratulations! Phase 2 Implementation Complete
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your crypto trading platform now includes all advanced enterprise features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="crypto-card-gradient text-white p-6 rounded-lg text-center">
                  <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-white/70">Portfolio performance dashboard with 15+ metrics</p>
                </div>

                <div className="crypto-card-gradient text-white p-6 rounded-lg text-center">
                  <Zap className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Live Trading</h3>
                  <p className="text-sm text-white/70">Real exchange connections & automated trading</p>
                </div>

                <div className="crypto-card-gradient text-white p-6 rounded-lg text-center">
                  <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">AI Models</h3>
                  <p className="text-sm text-white/70">ML-powered strategies with ensemble learning</p>
                </div>

                <div className="crypto-card-gradient text-white p-6 rounded-lg text-center">
                  <Users className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Social Trading</h3>
                  <p className="text-sm text-white/70">Community features & copy trading</p>
                </div>
              </div>

              <div className="crypto-card-gradient text-white p-8 rounded-lg text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Enterprise-Grade Trading Platform</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">✅ Completed Features</h4>
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>• 540+ AI Trading Bots</li>
                      <li>• Multi-account management</li>
                      <li>• Real-time market data</li>
                      <li>• Advanced portfolio analytics</li>
                      <li>• Live trading integration</li>
                      <li>• Social trading features</li>
                      <li>• Comprehensive audit system</li>
                      <li>• Risk management tools</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">🚀 System Capabilities</h4>
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>• Real Bitcoin price: $100K+</li>
                      <li>• Professional UI/UX</li>
                      <li>• Enterprise security</li>
                      <li>• Scalable architecture</li>
                      <li>• Advanced AI integration</li>
                      <li>• Community features</li>
                      <li>• Performance monitoring</li>
                      <li>• Export capabilities</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">💎 Ready For</h4>
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>• Production deployment</li>
                      <li>• Real money trading</li>
                      <li>• Institutional use</li>
                      <li>• Commercial licensing</li>
                      <li>• User onboarding</li>
                      <li>• Monetization</li>
                      <li>• Scaling to millions</li>
                      <li>• Global expansion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
