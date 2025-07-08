
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TradingPanel } from "@/components/TradingPanel";
import { MyAccounts } from "@/components/accounts/MyAccounts";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { RealTimeMarketTicker } from "@/components/enhanced/RealTimeMarketTicker";
import { SystemHealthIndicator } from "@/components/enhanced/SystemHealthIndicator";
import { 
  TrendingUp, 
  Wallet, 
  Settings, 
  BarChart3, 
  Bot,
  Activity,
  DollarSign,
  Users,
  Zap
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const quickStats = [
    {
      title: "Total Portfolio Value",
      value: "$284,590.32",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign
    },
    {
      title: "Active Trading Bots",
      value: "8",
      change: "+2 this week",
      changeType: "positive" as const,
      icon: Bot
    },
    {
      title: "Open Positions",
      value: "24",
      change: "-3 today",
      changeType: "negative" as const,
      icon: Activity
    },
    {
      title: "Monthly P&L",
      value: "+$15,420",
      change: "+8.3%",
      changeType: "positive" as const,
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your crypto trading overview.
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          All systems operational
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Market Ticker */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <RealTimeMarketTicker />
            <SystemHealthIndicator />
          </div>
        </div>

        {/* Right Column - Main Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trading" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                    <CardDescription>
                      Your trading performance over the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Performance charts and analytics will be displayed here
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        Active Bots
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Bitcoin Trend Bot</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Ethereum Grid Bot</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">DCA Strategy Bot</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>BTC Buy Order</span>
                          <span className="text-green-600">+0.0123 BTC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ETH Sell Order</span>
                          <span className="text-red-600">-2.45 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SOL Buy Order</span>
                          <span className="text-green-600">+15.67 SOL</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trading">
              <TradingPanel />
            </TabsContent>

            <TabsContent value="accounts">
              <MyAccounts />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
