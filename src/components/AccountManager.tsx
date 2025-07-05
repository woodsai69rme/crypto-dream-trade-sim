import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMultipleAccounts, type PaperAccount } from "@/hooks/useMultipleAccounts";
import { AccountTemplateSelector } from "./AccountTemplateSelector";
import { AccountComparison } from "./AccountComparison";
import { AccountSharing } from "./AccountSharing";
import { CreateCustomAccountForm } from "./CreateCustomAccountForm";
import { 
  Plus, Settings, Eye, TrendingUp, TrendingDown, DollarSign, 
  Users, Bell, Star, Copy, Share2, MoreHorizontal, AlertTriangle,
  Zap, Shield, BarChart3, BookOpen, Bitcoin, Bot, Trophy, Target
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);

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
                  handleAccountSelect(account.id);
                }}
                className={`${isSelected ? 'bg-purple-500/20' : ''}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div className="flex flex-wrap gap-1 mt-3">
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
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Account Manager</h2>
          <p className="text-white/60 mt-1">
            Manage your {accounts.length} paper trading accounts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
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
            {accounts.map(renderAccountCard)}
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map(account => (
              <Card 
                key={account.id}
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
                        {React.createElement(ACCOUNT_TYPE_ICONS[account.account_type as keyof typeof ACCOUNT_TYPE_ICONS] || BarChart3, {
                          className: "w-6 h-6",
                          style: { color: account.color_theme }
                        })}
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
                        {currentAccount?.id === account.id && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Active
                          </Badge>
                        )}
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Dialog */}
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

      {/* Sharing Dialog */}
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
    </div>
  );
};