
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  Users, Settings, Activity, BarChart3, Bot, Network, 
  TrendingUp, TrendingDown, DollarSign, Target, Shield,
  Zap, Eye, EyeOff, Copy, ExternalLink, RefreshCw
} from "lucide-react";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";

// Account card component that matches the screenshot design
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
    <Card className={`bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-slate-700 text-white transition-all duration-300 ${
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
                <CardTitle className="text-lg font-bold">{account.account_name}</CardTitle>
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
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-sm text-slate-400 mb-1">Balance</div>
          <div className="text-2xl font-bold">
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
          <div className="h-24">
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
          <div className="text-center p-2 bg-slate-800/30 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400">Win Rate</span>
            </div>
            <div className="text-sm font-bold">{winRate.toFixed(1)}%</div>
            <Progress value={winRate} className="h-1 mt-1" />
          </div>
          
          <div className="text-center p-2 bg-slate-800/30 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-400">Trades</span>
            </div>
            <div className="text-sm font-bold">{totalTrades}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          
          <div className="text-center p-2 bg-slate-800/30 rounded">
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
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Audit Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Live Audit</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            <div className="text-xs p-2 bg-slate-800/30 rounded flex items-center justify-between">
              <span className="text-slate-300">Trade executed: BTC +0.01</span>
              <span className="text-slate-500">2m ago</span>
            </div>
            <div className="text-xs p-2 bg-slate-800/30 rounded flex items-center justify-between">
              <span className="text-slate-300">AI signal generated</span>
              <span className="text-slate-500">5m ago</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            <Settings className="w-3 h-3 mr-1" />
            Manage
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-slate-600">
            <ExternalLink className="w-3 h-3 mr-1" />
            View Details
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
        <Card className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-700">
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
        
        <Card className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-700">
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
        
        <Card className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border-yellow-700">
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
        
        <Card className="bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700">
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
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Account Manager</h1>
        <Badge variant="secondary" className="ml-auto">
          Manage your 5 paper trading accounts with live audit & following
        </Badge>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Accounts
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">My Accounts</h2>
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
                <Button variant="outline">
                  <Bot className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
                <Button>
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
            <h3 className="text-lg font-medium mb-2">Following Feature</h3>
            <p className="text-muted-foreground">Copy trading and following functionality will be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">API Integrations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* OpenRouter Integration */}
              <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-orange-400" />
                    OpenRouter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Access to multiple AI models through OpenRouter API
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              {/* Crypto APIs */}
              <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    Crypto APIs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Real-time market data and trading APIs
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage APIs
                  </Button>
                </CardContent>
              </Card>

              {/* Local AI Models */}
              <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Local AI Models
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    On-device AI models for privacy and speed
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">Configuring</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Setup Models
                  </Button>
                </CardContent>
              </Card>

              {/* N8N Integration */}
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-green-400" />
                    N8N Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automated trading workflows and integrations
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-green-500/20 text-green-400">Running</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    View Workflows
                  </Button>
                </CardContent>
              </Card>

              {/* Context7 Integration */}
              <Card className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    Context7 AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Advanced context-aware AI agents
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">Learning</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Agents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">Comprehensive analytics and reporting will be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
