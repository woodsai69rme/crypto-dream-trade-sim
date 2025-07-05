import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts, type PaperAccount } from "@/hooks/useMultipleAccounts";
import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { useAccountReset } from "@/hooks/useAccountReset";
import { useFollowingAccounts } from "@/hooks/useFollowingAccounts";
import { AccountTemplateSelector } from "./AccountTemplateSelector";
import { AccountComparison } from "./AccountComparison";
import { AccountSharing } from "./AccountSharing";
import { CreateCustomAccountForm } from "./CreateCustomAccountForm";
import { PerformanceMetrics } from "./analytics/PerformanceMetrics";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { PortfolioChart } from "./portfolio/PortfolioChart";
import { 
  Plus, Settings, Eye, TrendingUp, TrendingDown, DollarSign, 
  Users, Bell, Star, Copy, Share2, MoreHorizontal, AlertTriangle,
  Zap, Shield, BarChart3, BookOpen, Bitcoin, Bot, Trophy, Target,
  ExternalLink, Maximize2, Activity, PieChart, LineChart, Monitor,
  Play, Pause, StopCircle, RefreshCw, Download, Upload, Calendar,
  Wallet, History, ChevronUp, ChevronDown, Minimize2, RotateCcw,
  UserCheck, Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACCOUNT_TYPE_ICONS = {
  aggressive_growth: Zap,
  conservative: Shield,
  balanced: BarChart3,
  day_trading: TrendingUp,
  swing_trading: Target,
  long_term: Star,
  experimental: Bot,
  educational: BookOpen,
  competition: Trophy,
  copy_trading: Copy
};

const RISK_LEVEL_COLORS = {
  very_low: 'bg-green-500/20 text-green-400 border-green-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  very_high: 'bg-red-500/20 text-red-400 border-red-500/30',
  extreme: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

const MarketTicker = ({ symbol, price, change }: { symbol: string; price: number; change: number }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded">
    <span className="font-mono text-sm">{symbol}</span>
    <span className="font-bold">${price.toLocaleString()}</span>
    <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
    </span>
  </div>
);

const LiveAuditPanel = ({ account }: { account: PaperAccount }) => {
  const { trades } = useRealTimePortfolio();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const recentTrades = trades.slice(0, 5);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Live Trading Audit</h4>
        <div className="flex items-center gap-2">
          <Badge className={isFollowing ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {isFollowing ? 'Following' : 'Paused'}
          </Badge>
          <Switch checked={isFollowing} onCheckedChange={setIsFollowing} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/5 rounded">
          <div className="text-lg font-bold text-green-400">{recentTrades.length}</div>
          <div className="text-xs text-white/60">Recent Trades</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded">
          <div className="text-lg font-bold text-blue-400">73.2%</div>
          <div className="text-xs text-white/60">Success Rate</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded">
          <div className="text-lg font-bold text-purple-400">+2.4%</div>
          <div className="text-xs text-white/60">Daily Return</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h5 className="text-sm text-white/70">Recent Activity</h5>
        <ScrollArea className="h-32">
          {recentTrades.map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded mb-1">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-400" />
                <span className="text-sm">{trade.symbol}</span>
                <Badge className={trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {trade.side.toUpperCase()}
                </Badge>
              </div>
              <span className="text-xs text-white/60">
                {formatDistanceToNow(new Date(trade.created_at))} ago
              </span>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

const PopOutDashboard = ({ account, onClose }: { account: PaperAccount; onClose: () => void }) => {
  // Mock data for portfolio chart
  const portfolioData = [
    { name: 'BTC', value: 45, percentage: 45, color: '#f7931a' },
    { name: 'ETH', value: 30, percentage: 30, color: '#627eea' },
    { name: 'SOL', value: 15, percentage: 15, color: '#9945ff' },
    { name: 'Others', value: 10, percentage: 10, color: '#64748b' },
  ];

  // Mock performance data
  const performanceData = [
    { date: '2024-01-01', value: 10000, return: 0 },
    { date: '2024-01-02', value: 10500, return: 5 },
    { date: '2024-01-03', value: 11200, return: 12 },
    { date: '2024-01-04', value: 10800, return: 8 },
    { date: '2024-01-05', value: 12000, return: 20 },
  ];

  const performanceMetrics = {
    totalReturn: 15.4,
    sharpeRatio: 1.8,
    maxDrawdown: 8.2,
    winRate: 73.5,
    volatility: 12.1
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Dashboard - {account.account_name}</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PortfolioChart data={portfolioData} />
              <PerformanceMetrics data={performanceData} metrics={performanceMetrics} />
            </div>
            <div className="space-y-6">
              <LiveAuditPanel account={account} />
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FollowingAccountsTab = () => {
  const { followingAccounts, loading } = useFollowingAccounts();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="crypto-card-gradient text-white animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Following Accounts ({followingAccounts.length})</h3>
        <Badge className="bg-green-500/20 text-green-400">
          <Activity className="w-3 h-3 mr-1" />
          Live Updates
        </Badge>
      </div>

      {followingAccounts.length === 0 ? (
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-8 text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-white/60" />
            <p className="text-white/60">You're not following any traders yet.</p>
            <p className="text-sm text-white/40 mt-1">Visit the Top Traders section to start following.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {followingAccounts.map((account) => (
            <Card key={account.id} className="crypto-card-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-white">
                        {account.trader_name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg">{account.trader_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {account.trader_category}
                        </Badge>
                        <span className="text-sm text-white/60">
                          Following since {formatDistanceToNow(new Date(account.followed_at))} ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {account.live_data && (
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        ${account.live_data.current_balance.toLocaleString()}
                      </div>
                      <div className={`text-sm ${
                        account.live_data.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {account.live_data.total_pnl >= 0 ? '+' : ''}${account.live_data.total_pnl.toFixed(2)} 
                        ({account.live_data.total_pnl_percentage >= 0 ? '+' : ''}{account.live_data.total_pnl_percentage.toFixed(2)}%)
                      </div>
                    </div>
                  )}
                </div>

                {account.live_data && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-lg font-bold text-green-400">{account.live_data.win_rate.toFixed(1)}%</div>
                      <div className="text-xs text-white/60">Win Rate</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-lg font-bold">{account.live_data.total_trades}</div>
                      <div className="text-xs text-white/60">Total Trades</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-lg font-bold text-blue-400">{account.live_data.recent_trades.length}</div>
                      <div className="text-xs text-white/60">Recent Trades</div>
                    </div>
                  </div>
                )}

                {account.live_data && account.live_data.recent_trades.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Recent Activity</h5>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {account.live_data.recent_trades.map((trade, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                            <div className="flex items-center gap-2">
                              <Badge className={trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {trade.side.toUpperCase()}
                              </Badge>
                              <span>{trade.symbol}</span>
                              <span>${trade.price.toLocaleString()}</span>
                            </div>
                            <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const AccountManager = () => {
  const {
    accounts,
    currentAccount,
    accountTemplates,
    notifications,
    loading,
    creating,
    switchAccount,
    updateAccount,
    deleteAccount,
    markNotificationRead
  } = useMultipleAccounts();

  const { resetAccount, resetAllAccounts, resetting } = useAccountReset();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);
  const [popOutAccount, setPopOutAccount] = useState<PaperAccount | null>(null);
  const [showTopTicker, setShowTopTicker] = useState(true);
  const [showBottomTicker, setShowBottomTicker] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [accountToReset, setAccountToReset] = useState<string | null>(null);

  // Mock market data for tickers
  const topTickers = [
    { symbol: 'BTC', price: 67432, change: 2.4 },
    { symbol: 'ETH', price: 3678, change: -1.2 },
    { symbol: 'SOL', price: 156, change: 5.7 },
    { symbol: 'ADA', price: 0.52, change: 3.1 },
  ];

  const bottomTickers = [
    { symbol: 'DOT', price: 8.43, change: -0.8 },
    { symbol: 'LINK', price: 18.76, change: 4.2 },
    { symbol: 'UNI', price: 7.89, change: 1.9 },
    { symbol: 'AVAX', price: 42.1, change: -2.3 },
  ];

  const handleAccountClick = async (accountId: string) => {
    if (currentAccount?.id !== accountId) {
      await switchAccount(accountId);
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleResetAccount = async (accountId: string) => {
    const success = await resetAccount(accountId);
    if (success) {
      setAccountToReset(null);
      setShowResetDialog(false);
    }
  };

  const handleResetAllAccounts = async () => {
    const success = await resetAllAccounts();
    if (success) {
      setShowResetDialog(false);
    }
  };

  const renderAccountCard = (account: PaperAccount) => {
    const TypeIcon = ACCOUNT_TYPE_ICONS[account.account_type as keyof typeof ACCOUNT_TYPE_ICONS] || BarChart3;
    const isSelected = selectedAccounts.includes(account.id);
    const isCurrentAccount = currentAccount?.id === account.id;

    return (
      <Card 
        key={account.id}
        className={`crypto-card-gradient text-white cursor-pointer transition-all duration-200 hover:scale-105 ${
          isCurrentAccount ? 'ring-2 ring-blue-400' : ''
        } ${isSelected ? 'ring-2 ring-purple-400' : ''}`}
        onClick={() => handleAccountClick(account.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: account.color_theme + '33', border: `1px solid ${account.color_theme}66` }}
              >
                <TypeIcon className="w-5 h-5" style={{ color: account.color_theme }} />
              </div>
              <div>
                <CardTitle className="text-lg">{account.account_name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={RISK_LEVEL_COLORS[account.risk_level as keyof typeof RISK_LEVEL_COLORS]}>
                    {account.risk_level.replace('_', ' ')}
                  </Badge>
                  {isCurrentAccount && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopOutAccount(account);
                }}
                className="hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountSelect(account.id);
                }}
                className={`${isSelected ? 'bg-purple-500/20' : ''}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Balance</p>
              <p className="text-xl font-bold">${account.balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">P&L</p>
              <p className={`text-xl font-bold ${
                account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                <span className="text-sm ml-1">
                  ({account.total_pnl_percentage >= 0 ? '+' : ''}{account.total_pnl_percentage.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>

          {/* Live Performance Chart */}
          <div className="h-24 bg-white/5 rounded p-2">
            <div className="text-xs text-white/60 mb-1">24h Performance</div>
            <div className="h-16 flex items-end justify-between">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-400 w-1 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Trading Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="font-bold text-green-400">73.2%</div>
              <div className="text-white/60">Win Rate</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="font-bold">156</div>
              <div className="text-white/60">Trades</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="font-bold text-blue-400">+2.4%</div>
              <div className="text-white/60">Daily</div>
            </div>
          </div>

          {/* Live Audit Status */}
          <div className="p-3 bg-white/5 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Live Audit</span>
              <Badge className="bg-green-500/20 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="text-xs text-white/60">
              Last trade: BTC BUY $67,432 • 2m ago
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Strategy</span>
              <span className="capitalize">{account.trading_strategy.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Max Daily Loss</span>
              <span>${account.max_daily_loss.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Last Active</span>
              <span>{formatDistanceToNow(new Date(account.last_accessed))} ago</span>
            </div>
          </div>

          {account.tags && account.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {account.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {account.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{account.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="crypto-card-gradient text-white animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-white/10 rounded mb-4"></div>
                <div className="h-8 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Market Ticker */}
      {showTopTicker && (
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Market Overview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTopTicker(false)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto">
              {topTickers.map((ticker, index) => (
                <MarketTicker key={index} {...ticker} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Account Manager</h2>
          <p className="text-white/60 mt-1">
            Manage your {accounts.length} paper trading accounts with live audit & following
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!showTopTicker && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTopTicker(true)}
              className="text-white/60"
            >
              Show Market Data
            </Button>
          )}
          
          {selectedAccounts.length > 0 && (
            <>
              <Button
                onClick={() => setShowComparisonDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={selectedAccounts.length < 2}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare ({selectedAccounts.length})
              </Button>
              <Button
                onClick={() => setShowSharingDialog(true)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </>
          )}

          {/* Reset Actions */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-400">Reset Account Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all trades, analytics, and history. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {accountToReset && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="text-sm">
                      Reset: {accounts.find(a => a.id === accountToReset)?.account_name}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  {accountToReset ? (
                    <Button
                      onClick={() => handleResetAccount(accountToReset)}
                      disabled={resetting}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {resetting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Reset Account
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResetAllAccounts}
                      disabled={resetting}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {resetting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Reset All Accounts
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setShowResetDialog(false);
                      setAccountToReset(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Trading Account</DialogTitle>
                <DialogDescription>
                  Choose from templates or create a custom account
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">From Template</TabsTrigger>
                  <TabsTrigger value="custom">Custom Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="templates" className="space-y-4">
                  <AccountTemplateSelector 
                    templates={accountTemplates}
                    onClose={() => setShowCreateDialog(false)}
                  />
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  <CreateCustomAccountForm 
                    onClose={() => setShowCreateDialog(false)}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <Card className="crypto-card-gradient text-white border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <h4 className="font-medium">Account Notifications</h4>
                <p className="text-sm text-white/60">
                  You have {notifications.length} unread notifications
                </p>
              </div>
              <ScrollArea className="max-h-20">
                <div className="space-y-1">
                  {notifications.slice(0, 3).map(notification => (
                    <div key={notification.id} className="text-sm">
                      <span className="font-medium">{notification.title}</span>
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="ml-2 text-yellow-400 hover:text-yellow-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content with Tabs */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">My Accounts</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          {/* Accounts Grid/List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/60">View:</span>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
              
              <div className="text-sm text-white/60">
                {selectedAccounts.length > 0 && `${selectedAccounts.length} selected • `}
                {accounts.length} total accounts
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(account => (
                  <div key={account.id} className="relative">
                    {renderAccountCard(account)}
                    <Button
                      onClick={() => {
                        setAccountToReset(account.id);
                        setShowResetDialog(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(account => (
                  <div key={account.id} className="relative">
                    {/* List view implementation similar to grid but horizontal layout */}
                    <Card 
                      className={`crypto-card-gradient text-white cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                        currentAccount?.id === account.id ? 'ring-2 ring-blue-400' : ''
                      }`}
                      onClick={() => handleAccountClick(account.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: account.color_theme + '33' }}
                            >
                              <span className="font-bold text-white">
                                {account.account_name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">{account.account_name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={RISK_LEVEL_COLORS[account.risk_level as keyof typeof RISK_LEVEL_COLORS]}>
                                  {account.risk_level.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-white/60">
                                  {account.trading_strategy.replace('_', ' ')}
                                </span>
                                {currentAccount?.id === account.id && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-xl font-bold">${account.balance.toLocaleString()}</p>
                              <p className={`text-sm ${
                                account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)} 
                                ({account.total_pnl_percentage >= 0 ? '+' : ''}{account.total_pnl_percentage.toFixed(2)}%)
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopOutAccount(account);
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccountSelect(account.id);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAccountToReset(account.id);
                                  setShowResetDialog(true);
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="following" className="space-y-4">
          <FollowingAccountsTab />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/60">
                  <LineChart className="w-12 h-12 mb-4" />
                  <p>Portfolio analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/60">
                  <PieChart className="w-12 h-12 mb-4" />
                  <p>Risk analysis will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Market Ticker */}
      {showBottomTicker && (
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Additional Markets</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBottomTicker(false)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto">
              {bottomTickers.map((ticker, index) => (
                <MarketTicker key={index} {...ticker} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Dialogs */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Comparison</DialogTitle>
            <DialogDescription>
              Compare performance across {selectedAccounts.length} selected accounts
            </DialogDescription>
          </DialogHeader>
          <AccountComparison 
            accountIds={selectedAccounts}
            accounts={accounts}
            onClose={() => setShowComparisonDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showSharingDialog} onOpenChange={setShowSharingDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Share Accounts</DialogTitle>
            <DialogDescription>
              Share selected accounts with other users
            </DialogDescription>
          </DialogHeader>
          <AccountSharing 
            accountIds={selectedAccounts}
            accounts={accounts}
            onClose={() => setShowSharingDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Pop-out Dashboard */}
      {popOutAccount && (
        <PopOutDashboard 
          account={popOutAccount} 
          onClose={() => setPopOutAccount(null)} 
        />
      )}
    </div>
  );
};
