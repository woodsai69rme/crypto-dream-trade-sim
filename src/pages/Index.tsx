import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { useRealtimeMarketData } from "@/hooks/useRealtimeMarketData";
import { TradingPanel } from "@/components/TradingPanel";
import { AccountManager } from "@/components/AccountManager";
import { BotManagement } from "@/components/ai/BotManagement";
import { TradeFollowingSettings } from "@/components/trading/TradeFollowingSettings";
import { APISettings } from "@/components/settings/APISettings";
import { MCPSettings } from "@/components/settings/MCPSettings";
import { AccountHistoryManager } from "@/components/settings/AccountHistoryManager";
import { ComprehensiveTestingSuite } from "@/components/settings/ComprehensiveTestingSuite";
import {
  Settings,
  BarChart,
  LineChart as LineChartIcon,
  Wallet,
  Users,
  FileText,
  Shield,
  Bot,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const IndexPage = () => {
  const { user, isLoading } = useAuth();
  const { currentAccount } = useMultipleAccounts();
  const { portfolioValue } = useRealTimePortfolio();
  const { btcPrice, ethPrice, dogePrice } = useRealtimeMarketData();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Mock chart data for demonstration
    const generateMockData = () => {
      const data = [];
      for (let i = 0; i < 30; i++) {
        data.push({
          date: `Day ${i + 1}`,
          portfolio: Math.floor(Math.random() * 100) + 100,
          BTC: Math.floor(Math.random() * 50) + 50,
          ETH: Math.floor(Math.random() * 30) + 30,
        });
      }
      setChartData(data);
    };

    generateMockData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${portfolioValue.toLocaleString()}</div>
            <p className="text-sm text-white/60">Current value of your paper trading portfolio</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5" />
              Market Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Bitcoin (BTC):</span>
                <span>${btcPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Ethereum (ETH):</span>
                <span>${ethPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Dogecoin (DOGE):</span>
                <span>${dogePrice}</span>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-4">Real-time cryptocurrency prices</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{currentAccount?.account_name}</div>
            <p className="text-sm text-white/60">
              {currentAccount?.account_type} • {currentAccount?.risk_level} risk
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard">
            <BarChart className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="trading">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Users className="w-4 h-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="bots">
            <Bot className="w-4 h-4 mr-2" />
            AI Bots
          </TabsTrigger>
          <TabsTrigger value="social">
            <Users className="w-4 h-4 mr-2" />
            Social Trading
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="risk">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risk
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardContent>
                <p className="text-sm text-white/60">Historical performance of your portfolio</p>
              </CardContent>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="portfolio" stroke="#8884d8" name="Portfolio Value" />
                  <Line type="monotone" dataKey="BTC" stroke="#82ca9d" name="Bitcoin" />
                  <Line type="monotone" dataKey="ETH" stroke="#ffc658" name="Ethereum" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <TradingPanel />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AccountManager />
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <BotManagement />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div>Social Trading Content</div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div>Trading History Content</div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div>Risk Management Content</div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BotManagement />
            <TradeFollowingSettings />
          </div>
          <APISettings />
          <MCPSettings />
          <ComprehensiveTestingSuite />
          <AccountHistoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndexPage;
