
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Bot, 
  UserCheck, 
  Wallet,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AccountCardProps {
  account: any;
  onSwitchAccount: (accountId: string) => void;
  isActive: boolean;
}

export const AccountCard = ({ account, onSwitchAccount, isActive }: AccountCardProps) => {
  const [aiBotsEnabled, setAiBotsEnabled] = useState(false);
  const [followingEnabled, setFollowingEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, updateSetting, isLoading } = useSettings();

  // Load settings when they change
  useEffect(() => {
    console.log('Loading settings for account:', account.id);
    console.log('Current settings:', settings);
    
    const aiBotsSetting = settings[`ai_bots_${account.id}`];
    const followingSetting = settings[`following_${account.id}`];
    
    console.log('AI Bots setting:', aiBotsSetting);
    console.log('Following setting:', followingSetting);
    
    setAiBotsEnabled(Boolean(aiBotsSetting));
    setFollowingEnabled(Boolean(followingSetting));
  }, [account.id, settings]);

  // Mock performance data for mini chart
  const performanceData = Array.from({ length: 7 }, (_, i) => ({
    value: account.balance * (1 + (Math.random() - 0.5) * 0.1)
  }));

  const toggleAIBots = async (enabled: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update settings",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    console.log('Toggling AI bots for account:', account.id, 'to:', enabled);
    
    try {
      const success = await updateSetting(`ai_bots_${account.id}`, enabled);
      
      if (success) {
        setAiBotsEnabled(enabled);
        toast({
          title: enabled ? "AI Bots Enabled" : "AI Bots Disabled",
          description: `AI trading bots ${enabled ? 'activated' : 'deactivated'} for ${account.account_name}`,
        });
      } else {
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      console.error('Error toggling AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to update AI bot settings",
        variant: "destructive",
      });
      // Revert the state
      setAiBotsEnabled(!enabled);
    } finally {
      setSaving(false);
    }
  };

  const toggleFollowing = async (enabled: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update settings",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    console.log('Toggling following for account:', account.id, 'to:', enabled);
    
    try {
      const success = await updateSetting(`following_${account.id}`, enabled);
      
      if (success) {
        setFollowingEnabled(enabled);
        toast({
          title: enabled ? "Following Enabled" : "Following Disabled",
          description: `Trade following ${enabled ? 'activated' : 'deactivated'} for ${account.account_name}`,
        });
      } else {
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      console.error('Error toggling following:', error);
      toast({
        title: "Error",
        description: "Failed to update following settings",
        variant: "destructive",
      });
      // Revert the state
      setFollowingEnabled(!enabled);
    } finally {
      setSaving(false);
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

        {/* Controls - FIXED */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-crypto-info" />
              <span className="text-sm">AI Bots</span>
            </div>
            <div className="flex items-center gap-2">
              {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
              <Switch
                checked={aiBotsEnabled}
                onCheckedChange={toggleAIBots}
                disabled={saving || isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-crypto-warning" />
              <span className="text-sm">Following</span>
            </div>
            <div className="flex items-center gap-2">
              {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
              <Switch
                checked={followingEnabled}
                onCheckedChange={toggleFollowing}
                disabled={saving || isLoading}
              />
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${aiBotsEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span>AI Bots {aiBotsEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${followingEnabled ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
            <span>Following {followingEnabled ? 'ON' : 'OFF'}</span>
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
