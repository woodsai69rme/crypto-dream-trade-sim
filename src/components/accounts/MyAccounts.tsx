import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCryptoHoldings } from '@/hooks/useCryptoHoldings';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Bot, 
  UserCheck, 
  Activity,
  Wallet,
  Shield,
  Star,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AccountCardProps {
  account: any;
  onSwitchAccount: (accountId: string) => void;
  isActive: boolean;
  viewMode?: 'grid' | 'list';
}

const AccountCard = ({ account, onSwitchAccount, isActive, viewMode = 'grid' }: AccountCardProps) => {
  const [aiBotsEnabled, setAiBotsEnabled] = useState(false);
  const [followingEnabled, setFollowingEnabled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { holdings, loading: holdingsLoading, refreshHoldings } = useCryptoHoldings(account.id);

  // Mock performance data for mini chart
  const performanceData = Array.from({ length: 7 }, (_, i) => ({
    value: account.balance * (1 + (Math.random() - 0.5) * 0.1)
  }));

  const toggleAIBots = async (enabled: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: `ai_bots_${account.id}`,
          setting_value: enabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setAiBotsEnabled(enabled);
      
      toast({
        title: enabled ? "AI Bots Enabled" : "AI Bots Disabled",
        description: `AI trading bots ${enabled ? 'activated' : 'deactivated'} for ${account.account_name}`,
      });
    } catch (error) {
      console.error('Error toggling AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to update AI bot settings",
        variant: "destructive",
      });
    }
  };

  const toggleFollowing = async (enabled: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: `trade_following_${account.id}`,
          setting_value: enabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setFollowingEnabled(enabled);
      
      toast({
        title: enabled ? "Following Enabled" : "Following Disabled",
        description: `Trade following ${enabled ? 'activated' : 'deactivated'} for ${account.account_name}`,
      });
    } catch (error) {
      console.error('Error toggling following:', error);
      toast({
        title: "Error",
        description: "Failed to update following settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`crypto-card-gradient text-primary-foreground transition-all duration-300 ${
      isActive ? 'ring-2 ring-primary crypto-glow' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-crypto-bitcoin to-crypto-ethereum flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{account.account_name}</CardTitle>
                {isActive && <Badge variant="secondary" className="text-xs bg-crypto-success/20 text-crypto-success">Active</Badge>}
                <Badge className="text-xs bg-crypto-info/20 text-crypto-info border-crypto-info/30">
                  Live
                </Badge>
                <Badge variant="outline" className="text-xs border-crypto-warning/30 text-crypto-warning">
                  {account.risk_level}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{account.account_type}</p>
                <Badge className="text-xs bg-purple-500/20 text-purple-400">
                  Day Trading
                </Badge>
                <Badge className="text-xs bg-red-500/20 text-red-400">
                  aggressive
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">${account.balance.toLocaleString()}</div>
            <div className={`text-sm flex items-center gap-1 ${
              account.total_pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'
            }`}>
              {account.total_pnl >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)} 
              ({account.total_pnl_percentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 24h Performance Chart */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={account.total_pnl >= 0 ? "hsl(var(--crypto-success))" : "hsl(var(--crypto-danger))"}
                fill={account.total_pnl >= 0 ? "hsl(var(--crypto-success))" : "hsl(var(--crypto-danger))"}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Crypto Holdings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Holdings</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshHoldings}
              disabled={holdingsLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${holdingsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {holdings.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {holdings.slice(0, 3).map((holding) => (
                <div key={holding.symbol} className="bg-card/30 rounded-lg p-2">
                  <div className="text-xs font-medium">{holding.symbol}</div>
                  <div className="text-sm font-bold">${holding.value.toFixed(0)}</div>
                  <div className={`text-xs ${
                    holding.pnlPercentage >= 0 ? 'text-crypto-success' : 'text-crypto-danger'
                  }`}>
                    {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-2">
              No holdings yet
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-2 bg-card/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-crypto-info" />
              <span className="text-sm">AI Bots</span>
            </div>
            <Switch
              checked={aiBotsEnabled}
              onCheckedChange={toggleAIBots}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-card/20 rounded-lg">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-crypto-warning" />
              <span className="text-sm">Following</span>
            </div>
            <Switch
              checked={followingEnabled}
              onCheckedChange={toggleFollowing}
            />
          </div>
        </div>

        {/* Following Trades */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>BTC Buy Signal</span>
              <Badge variant="secondary" className="text-xs">+2.4%</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>ETH Position Closed</span>
              <Badge variant="destructive" className="text-xs">-0.8%</Badge>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-card/20 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-crypto-success">68%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">247</div>
            <div className="text-xs text-muted-foreground">Trades</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-crypto-success">+2.4%</div>
            <div className="text-xs text-muted-foreground">Daily</div>
          </div>
        </div>

        {/* Live Audit */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last trade: 2 hours ago</span>
            <span>Max daily loss: $1,000</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>Last active: 5 minutes ago</span>
            <span>Strategy: Manual</span>
          </div>
        </div>

        {/* Action Button */}
        {!isActive && (
          <Button
            onClick={() => onSwitchAccount(account.id)}
            className="w-full"
            variant="outline"
          >
            Switch to Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const MyAccounts = () => {
  const { accounts, currentAccount, switchAccount } = useMultipleAccounts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const handleCreateAccount = () => {
    toast({
      title: "Create Account",
      description: "Account creation functionality coming soon",
    });
  };

  const handleResetAccount = (accountId: string) => {
    toast({
      title: "Reset Account",
      description: "Account reset functionality coming soon",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary-foreground">My Trading Accounts</h2>
          <Badge variant="secondary" className="text-sm">
            {accounts.length} total account{accounts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-card/20 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3 py-1"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1"
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <Button variant="outline" onClick={handleCreateAccount}>
            <Star className="w-4 h-4 mr-2" />
            Create Account
          </Button>
          
          <Button variant="outline" onClick={() => handleResetAccount(currentAccount?.id || '')}>
            <Shield className="w-4 h-4 mr-2" />
            Reset Account
          </Button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardContent className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first paper trading account to get started
            </p>
            <Button>Create Account</Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onSwitchAccount={switchAccount}
              isActive={currentAccount?.id === account.id}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};