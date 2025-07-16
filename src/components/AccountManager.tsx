
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, DollarSign, Settings, Bot, Play, Pause, CheckSquare, Square } from 'lucide-react';

export const AccountManager = () => {
  const { user } = useAuth();
  const { accounts, currentAccount, switchAccount } = useMultipleAccounts();
  const { toast } = useToast();
  const [aiBotsEnabled, setAiBotsEnabled] = useState<Record<string, boolean>>({});
  const [tradeFollowingEnabled, setTradeFollowingEnabled] = useState<Record<string, boolean>>({});
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load AI Bot and Trade Following settings for each account
  useEffect(() => {
    if (user && accounts.length > 0) {
      loadAccountSettings();
    }
  }, [user, accounts]);

  const loadAccountSettings = async () => {
    if (!user) return;

    try {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('setting_name, setting_value')
        .eq('user_id', user.id)
        .in('setting_name', accounts.flatMap(acc => [
          `ai_bots_${acc.id}`,
          `trade_following_${acc.id}`
        ]));

      if (error) throw error;

      const aiBots: Record<string, boolean> = {};
      const tradeFollowing: Record<string, boolean> = {};

      settings?.forEach(setting => {
        if (setting.setting_name.startsWith('ai_bots_')) {
          const accountId = setting.setting_name.replace('ai_bots_', '');
          aiBots[accountId] = Boolean(setting.setting_value);
        } else if (setting.setting_name.startsWith('trade_following_')) {
          const accountId = setting.setting_name.replace('trade_following_', '');
          tradeFollowing[accountId] = Boolean(setting.setting_value);
        }
      });

      setAiBotsEnabled(aiBots);
      setTradeFollowingEnabled(tradeFollowing);
    } catch (error) {
      console.error('Error loading account settings:', error);
    }
  };

  const toggleAIBots = async (accountId: string, enabled: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      // Update AI bots setting
      const { error: aiBotsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: `ai_bots_${accountId}`,
          setting_value: enabled,
          updated_at: new Date().toISOString()
        });

      if (aiBotsError) throw aiBotsError;

      // Sync trade following with AI bots
      const { error: tradeFollowingError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: `trade_following_${accountId}`,
          setting_value: enabled,
          updated_at: new Date().toISOString()
        });

      if (tradeFollowingError) throw tradeFollowingError;

      setAiBotsEnabled(prev => ({ ...prev, [accountId]: enabled }));
      setTradeFollowingEnabled(prev => ({ ...prev, [accountId]: enabled }));
      
      toast({
        title: enabled ? "AI Bots Enabled" : "AI Bots Disabled",
        description: `AI trading bots and trade following ${enabled ? 'activated' : 'deactivated'} for this account`,
      });
    } catch (error: any) {
      console.error('Error toggling AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to update AI bot settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTradeFollowing = async (accountId: string, enabled: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      // Update trade following setting
      const { error: tradeFollowingError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: `trade_following_${accountId}`,
          setting_value: enabled,
          updated_at: new Date().toISOString()
        });

      if (tradeFollowingError) throw tradeFollowingError;

      // Sync AI bots with trade following
      const { error: aiBotsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: `ai_bots_${accountId}`,
          setting_value: enabled,
          updated_at: new Date().toISOString()
        });

      if (aiBotsError) throw aiBotsError;

      setTradeFollowingEnabled(prev => ({ ...prev, [accountId]: enabled }));
      setAiBotsEnabled(prev => ({ ...prev, [accountId]: enabled }));
      
      toast({
        title: enabled ? "Trade Following Enabled" : "Trade Following Disabled",
        description: `Trade following and AI bots ${enabled ? 'activated' : 'deactivated'} for this account`,
      });
    } catch (error: any) {
      console.error('Error toggling trade following:', error);
      toast({
        title: "Error",
        description: "Failed to update trade following settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const selectAllAccounts = () => {
    setSelectedAccounts(new Set(accounts.map(acc => acc.id)));
  };

  const deselectAllAccounts = () => {
    setSelectedAccounts(new Set());
  };

  const bulkToggleAIBots = async (enabled: boolean) => {
    if (!user || selectedAccounts.size === 0) return;

    setLoading(true);
    try {
      const promises = Array.from(selectedAccounts).map(async (accountId) => {
        // Update AI bots setting
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            setting_name: `ai_bots_${accountId}`,
            setting_value: enabled,
            updated_at: new Date().toISOString()
          });

        // Sync trade following with AI bots
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            setting_name: `trade_following_${accountId}`,
            setting_value: enabled,
            updated_at: new Date().toISOString()
          });
      });

      await Promise.all(promises);

      // Update local state
      const updates = Array.from(selectedAccounts).reduce((acc, accountId) => {
        acc[accountId] = enabled;
        return acc;
      }, {} as Record<string, boolean>);

      setAiBotsEnabled(prev => ({ ...prev, ...updates }));
      setTradeFollowingEnabled(prev => ({ ...prev, ...updates }));

      toast({
        title: enabled ? "AI Bots Enabled" : "AI Bots Disabled",
        description: `AI trading bots and trade following ${enabled ? 'activated' : 'deactivated'} for ${selectedAccounts.size} accounts`,
      });

      setSelectedAccounts(new Set()); // Clear selection
    } catch (error: any) {
      console.error('Error bulk toggling AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to update AI bot settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Account Management
          <Badge className="bg-blue-500/20 text-blue-400">
            {accounts.length} Accounts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <Button
                onClick={selectAllAccounts}
                size="sm"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Select All
              </Button>
              <Button
                onClick={deselectAllAccounts}
                size="sm"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <Square className="w-4 h-4 mr-1" />
                Deselect All
              </Button>
            </div>
            
            {selectedAccounts.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge className="bg-blue-500/20 text-blue-400">
                  {selectedAccounts.size} selected
                </Badge>
                <Button
                  onClick={() => bulkToggleAIBots(true)}
                  size="sm"
                  variant="outline"
                  className="border-green-500/20 hover:bg-green-500/10 text-green-400"
                  disabled={loading}
                >
                  <Bot className="w-4 h-4 mr-1" />
                  Enable All
                </Button>
                <Button
                  onClick={() => bulkToggleAIBots(false)}
                  size="sm"
                  variant="outline"
                  className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                  disabled={loading}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Disable All
                </Button>
              </div>
            )}
          </div>
        )}
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No accounts found.</p>
            <p className="text-sm mt-2">Create your first paper trading account to get started.</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedAccounts.has(account.id)}
                    onCheckedChange={() => toggleAccountSelection(account.id)}
                    className="border-white/20"
                  />
                  <div className="p-2 bg-blue-500/20 rounded">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {account.account_name}
                      {account.is_default && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          Default
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-white/60">
                      {account.account_type} • {account.risk_level} risk
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold">${account.balance.toLocaleString()}</div>
                  <div className={`text-sm ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)} 
                    ({account.total_pnl_percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <Label className="text-sm">AI Bots</Label>
                  </div>
                  <Switch
                    checked={aiBotsEnabled[account.id] || false}
                    onCheckedChange={(checked) => toggleAIBots(account.id, checked)}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <Label className="text-sm">Trade Following</Label>
                  </div>
                  <Switch
                    checked={tradeFollowingEnabled[account.id] || false}
                    onCheckedChange={(checked) => toggleTradeFollowing(account.id, checked)}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-center">
                  {account.is_default ? (
                    <Badge className="bg-green-500/20 text-green-400">
                      <Play className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => switchAccount(account.id)}
                      size="sm"
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                    >
                      Switch To
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10">
                <span>Created: {new Date(account.created_at).toLocaleDateString()}</span>
                <span>Last accessed: {new Date(account.last_accessed).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
