
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  Users, Settings, Activity, BarChart3, Bot, Network, 
  TrendingUp, TrendingDown, DollarSign, Target, Shield,
  Zap, Eye, EyeOff, Copy, ExternalLink, RefreshCw
} from "lucide-react";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { OpenRouterIntegration } from "@/components/integrations/OpenRouterIntegration";
import { N8NIntegration } from "@/components/integrations/N8NIntegration";
import { Context7Integration } from "@/components/integrations/Context7Integration";

// Enhanced Account Card Component
const EnhancedAccountCard = ({ account, isActive }: { account: any, isActive: boolean }) => {
  const [showBalance, setShowBalance] = useState(true);
  
  // Mock performance data
  const performanceData = [
    { day: 'Mon', value: account.balance * 0.98 },
    { day: 'Tue', value: account.balance * 1.02 },
    { day: 'Wed', value: account.balance * 0.99 },
    { day: 'Thu', value: account.balance * 1.05 },
    { day: 'Fri', value: account.balance * 1.03 },
    { day: 'Sat', value: account.balance * 1.07 },
    { day: 'Sun', value: account.balance },
  ];

  const volumeData = [
    { day: 'Mon', volume: 2500 },
    { day: 'Tue', volume: 3200 },
    { day: 'Wed', volume: 1800 },
    { day: 'Thu', volume: 4100 },
    { day: 'Fri', volume: 2900 },
    { day: 'Sat', volume: 3600 },
    { day: 'Sun', volume: 2200 },
  ];

  const winRate = 73.2 + Math.random() * 15;
  const totalTrades = Math.floor(Math.random() * 50) + 100;
  const dailyPnL = account.total_pnl * 0.1;

  return (
    <Card className={`bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 border-slate-700/50 text-white transition-all duration-300 backdrop-blur-sm ${
      isActive ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-white">{account.account_name}</CardTitle>
                {isActive && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  {account.risk_level?.toUpperCase() || 'MEDIUM'}
                </Badge>
                <span className="text-xs text-slate-400">{account.account_type}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance Section */}
        <div className="text-center p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
          <div className="text-sm text-slate-400 mb-1">Balance</div>
          <div className="text-2xl font-bold text-white">
            {showBalance ? `$${account.balance?.toLocaleString()}` : '••••••'}
          </div>
          <div className={`text-sm flex items-center justify-center gap-1 mt-1 ${
            account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {account.total_pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl?.toFixed(2)} ({account.total_pnl_percentage >= 0 ? '+' : ''}{account.total_pnl_percentage?.toFixed(2)}%)
          </div>
        </div>

        {/* Performance Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">30d Performance</span>
            <span className="text-xs text-slate-400">{performanceData.length} data points</span>
          </div>
          <div className="h-24 bg-slate-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-slate-800/30 rounded backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400">Win Rate</span>
            </div>
            <div className="text-sm font-bold text-white">{winRate.toFixed(1)}%</div>
            <Progress value={winRate} className="h-1 mt-1" />
          </div>
          
          <div className="text-center p-2 bg-slate-800/30 rounded backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-400">Trades</span>
            </div>
            <div className="text-sm font-bold text-white">{totalTrades}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          
          <div className="text-center p-2 bg-slate-800/30 rounded backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-slate-400">Daily P&L</span>
            </div>
            <div className={`text-sm font-bold ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Volume</span>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
          <div className="h-16 bg-slate-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            <Settings className="w-3 h-3 mr-1" />
            Manage
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-white hover:bg-slate-800">
            <ExternalLink className="w-3 h-3 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ComprehensiveAccountManager = () => {
  const { accounts, currentAccount } = useMultipleAccounts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* Header with Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-300">BTC</div>
                <div className="text-xl font-bold text-white">$67,442</div>
                <div className="text-sm text-green-400">+2.3%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-300">ETH</div>
                <div className="text-xl font-bold text-white">$3,678</div>
                <div className="text-sm text-red-400">-1.2%</div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border-yellow-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-300">SOL</div>
                <div className="text-xl font-bold text-white">$156</div>
                <div className="text-sm text-green-400">+4.7%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-300">ADA</div>
                <div className="text-xl font-bold text-white">$0.52</div>
                <div className="text-sm text-green-400">+1.3%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-purple-400" />
        <h1 className="text-3xl font-bold text-primary-foreground">Account Manager</h1>
        <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30">
          Manage your trading accounts with live monitoring
        </Badge>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-purple-500/20">
          <TabsTrigger value="accounts" className="flex items-center gap-2 text-primary-foreground">
            <Users className="w-4 h-4" />
            My Accounts
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2 text-primary-foreground">
            <Activity className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2 text-primary-foreground">
            <Network className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 text-primary-foreground">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-primary-foreground">My Accounts</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <Activity className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  <Bot className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {accounts.map((account) => (
                <EnhancedAccountCard
                  key={account.id}
                  account={account}
                  isActive={currentAccount?.id === account.id}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="following">
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2 text-primary-foreground">Following Feature</h3>
            <p className="text-muted-foreground">Copy trading and following functionality will be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-foreground">API Integrations</h2>
            
            <Tabs defaultValue="openrouter" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-purple-500/20">
                <TabsTrigger value="openrouter" className="flex items-center gap-2 text-primary-foreground">
                  <Bot className="w-4 h-4" />
                  OpenRouter
                </TabsTrigger>
                <TabsTrigger value="n8n" className="flex items-center gap-2 text-primary-foreground">
                  <Network className="w-4 h-4" />
                  N8N
                </TabsTrigger>
                <TabsTrigger value="context7" className="flex items-center gap-2 text-primary-foreground">
                  <Bot className="w-4 h-4" />
                  Context7
                </TabsTrigger>
              </TabsList>

              <TabsContent value="openrouter">
                <OpenRouterIntegration />
              </TabsContent>

              <TabsContent value="n8n">
                <N8NIntegration />
              </TabsContent>

              <TabsContent value="context7">
                <Context7Integration />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2 text-primary-foreground">Analytics Dashboard</h3>
            <p className="text-muted-foreground">Comprehensive analytics and reporting will be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
