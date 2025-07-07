
import { ComprehensiveAccountManager } from "@/components/accounts/ComprehensiveAccountManager";
import { TradingPanel } from "@/components/TradingPanel";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Bot, BarChart3 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h1 className="text-2xl font-bold mb-2">Welcome to CryptoTrader Pro</h1>
            <p className="text-muted-foreground mb-4">
              Please sign in to access your trading dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm mb-6">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Account Manager
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading Hub
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <ComprehensiveAccountManager />
          </TabsContent>

          <TabsContent value="trading">
            <TradingPanel />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
