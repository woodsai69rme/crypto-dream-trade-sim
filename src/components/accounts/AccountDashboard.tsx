import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { MyAccounts } from './MyAccounts';
import { AccountTemplateSelector } from '../AccountTemplateSelector';
import { AccountSharing } from '../AccountSharing';
import { AccountComparison } from '../AccountComparison';
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  Settings,
  Plus,
  BarChart3,
  Share,
  GitCompare
} from 'lucide-react';

export const AccountDashboard = () => {
  const { accountSummary, accounts, loading } = useMultipleAccounts();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground">Account Management</h1>
          <p className="text-muted-foreground">Manage your paper trading accounts and strategies</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {accounts.length} Accounts
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            ${accountSummary.totalValue.toLocaleString()}
          </Badge>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground">
              Total Portfolio Value
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">
              ${accountSummary.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground">
              Total P&L
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${accountSummary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {accountSummary.totalPnL >= 0 ? '+' : ''}${accountSummary.totalPnL.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {accountSummary.totalPnLPercentage.toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground">
              Active Accounts
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">
              {accountSummary.activeAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {accounts.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground">
              Best Performer
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {accountSummary.bestPerformingAccount?.total_pnl_percentage.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {accountSummary.bestPerformingAccount?.account_name || 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            My Accounts
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Sharing
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <MyAccounts />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Account Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Choose from pre-configured account templates to get started quickly.
              </p>
              <Button onClick={() => setActiveTab('overview')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Account from Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Account Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Compare performance across multiple accounts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts.slice(0, 3).map((account) => (
                  <Card key={account.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-primary-foreground">{account.account_name}</h4>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="text-primary-foreground">${account.balance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">P&L:</span>
                          <span className={account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="mt-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Account Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Share your account performance with others or collaborate on trading strategies.
              </p>
              <div className="space-y-4">
                <Button variant="outline" className="justify-start w-full">
                  <Share className="w-4 h-4 mr-2" />
                  Generate Share Link
                </Button>
                <Button variant="outline" className="justify-start w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Collaborate with Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button variant="outline" className="justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Global Account Preferences
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Account Operations
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance Analytics Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};