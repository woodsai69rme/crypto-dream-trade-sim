
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
import { BotManagement } from "@/components/settings/BotManagement";
import { TradeFollowingSettings } from "@/components/trading/TradeFollowingSettings";
import { APISettings } from "@/components/settings/APISettings";
import { MCPSettings } from "@/components/settings/MCPSettings";
import { AccountHistoryManager } from "@/components/AccountHistoryManager";
import { ComprehensiveTestingSuite } from "@/components/settings/ComprehensiveTestingSuite";
import { AdvancedTradingInterface } from "@/components/AdvancedTradingInterface";
import { TradeFollower } from "@/components/trading/TradeFollower";
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
  Activity,
  Target,
  Zap,
} from "lucide-react";

const IndexPage = () => {
  const { user, loading } = useAuth();
  const { currentAccount } = useMultipleAccounts();
  const { portfolio, paperAccount } = useRealTimePortfolio();
  const { getPrice } = useRealtimeMarketData();
  const [chartData, setChartData] = useState([]);
  const [tradeFollowingSettings, setTradeFollowingSettings] = useState({
    minConfidence: 70,
    maxPositionSize: 1000,
    autoExecute: false
  });

  // Get current prices using the correct method
  const btcPrice = getPrice('BTC');
  const ethPrice = getPrice('ETH');
  const dogePrice = getPrice('DOGE');

  // Calculate portfolio value from available data
  const portfolioValue = paperAccount?.balance || portfolio?.total_value || 100000;

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

  if (loading) {
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
                <span>${btcPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Ethereum (ETH):</span>
                <span>${ethPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Dogecoin (DOGE):</span>
                <span>${dogePrice.toFixed(4)}</span>
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
            <div className="text-xl font-bold">{currentAccount?.account_name || 'No Account'}</div>
            <p className="text-sm text-white/60">
              {currentAccount?.account_type || 'Paper'} • {currentAccount?.risk_level || 'Medium'} risk
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="dashboard">
            <BarChart className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="trading">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="w-4 h-4 mr-2" />
            Advanced
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
            Social
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

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedTradingInterface />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AccountManager />
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <BotManagement />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradeFollower />
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Social Trading Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <span className="font-medium">@CryptoMaster</span>
                      <p className="text-sm text-white/60">Bought 0.5 BTC at $67,432</p>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <span className="font-medium">@ETHTrader</span>
                      <p className="text-sm text-white/60">Sold 10 ETH at $4,126</p>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <span className="font-medium">@AIBot</span>
                      <p className="text-sm text-white/60">Signal: BUY SOL (95% confidence)</p>
                    </div>
                    <Button size="sm" variant="outline">Copy</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Trading History & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded">
                  <div className="text-2xl font-bold text-green-400">73.2%</div>
                  <div className="text-sm text-white/60">Win Rate</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded">
                  <div className="text-2xl font-bold text-blue-400">2.4:1</div>
                  <div className="text-sm text-white/60">Risk/Reward</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded">
                  <div className="text-2xl font-bold text-purple-400">$12,456</div>
                  <div className="text-sm text-white/60">Total P&L</div>
                </div>
              </div>
              <p className="text-white/60">Detailed trading history and performance analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Management Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Portfolio Risk Score</span>
                    <span className="text-yellow-400 font-bold">Medium (6/10)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max Drawdown</span>
                    <span className="text-red-400 font-bold">-8.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Position Concentration</span>
                    <span className="text-green-400 font-bold">Well Diversified</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Daily Risk Limit</span>
                    <span className="text-blue-400 font-bold">$1,000 (Used: 15%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stop Loss Coverage</span>
                    <span className="text-green-400 font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Volatility Score</span>
                    <span className="text-yellow-400 font-bold">Moderate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BotManagement />
            <TradeFollowingSettings 
              settings={tradeFollowingSettings}
              onSettingsChange={setTradeFollowingSettings}
            />
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
