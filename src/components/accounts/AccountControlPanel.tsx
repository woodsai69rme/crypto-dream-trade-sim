
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/useSettings";
import { useAccountReset } from "@/hooks/useAccountReset";
import { useToast } from "@/hooks/use-toast";
import { Settings, RefreshCw, Bot, Users, AlertTriangle } from "lucide-react";

interface AccountControlPanelProps {
  account: any;
}

export const AccountControlPanel = ({ account }: AccountControlPanelProps) => {
  const { settings, updateSetting } = useSettings();
  const { resetAccount, resetAllAccounts, resetting } = useAccountReset();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState({
    aiBotsEnabled: settings[`ai_bots_${account.id}`] || false,
    followingEnabled: settings[`following_${account.id}`] || false,
  });

  const handleToggleAIBots = async (enabled: boolean) => {
    console.log('Toggling AI bots for account:', account.id, enabled);
    
    try {
      const success = await updateSetting(`ai_bots_${account.id}`, enabled);
      if (success) {
        setLocalSettings(prev => ({ ...prev, aiBotsEnabled: enabled }));
        toast({
          title: enabled ? "AI Bots Enabled" : "AI Bots Disabled",
          description: `AI trading bots ${enabled ? 'activated' : 'deactivated'} for ${account.account_name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to save AI bot settings",
        variant: "destructive",
      });
    }
  };

  const handleToggleFollowing = async (enabled: boolean) => {
    console.log('Toggling following for account:', account.id, enabled);
    
    try {
      const success = await updateSetting(`following_${account.id}`, enabled);
      if (success) {
        setLocalSettings(prev => ({ ...prev, followingEnabled: enabled }));
        toast({
          title: enabled ? "Following Enabled" : "Following Disabled",
          description: `Trade following ${enabled ? 'activated' : 'deactivated'} for ${account.account_name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling following:', error);
      toast({
        title: "Error",
        description: "Failed to save following settings",
        variant: "destructive",
      });
    }
  };

  const handleResetAccount = async () => {
    if (window.confirm(`Are you sure you want to reset ${account.account_name}? This will clear all trades and reset the balance.`)) {
      const success = await resetAccount(account.id);
      if (success) {
        window.location.reload(); // Refresh to show updated data
      }
    }
  };

  const handleFullReset = async () => {
    if (window.confirm('Are you sure you want to reset ALL accounts? This will clear all trades and reset all balances. This action cannot be undone.')) {
      const success = await resetAllAccounts();
      if (success) {
        window.location.reload(); // Refresh to show updated data
      }
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Account Controls - {account.account_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Bots Control */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <Label className="text-sm font-medium">AI Trading Bots</Label>
          </div>
          <Switch
            checked={localSettings.aiBotsEnabled}
            onCheckedChange={handleToggleAIBots}
          />
        </div>

        {/* Following Control */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <Label className="text-sm font-medium">Trade Following</Label>
          </div>
          <Switch
            checked={localSettings.followingEnabled}
            onCheckedChange={handleToggleFollowing}
          />
        </div>

        {/* Reset Controls */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Reset Options</h4>
          
          <Button
            onClick={handleResetAccount}
            disabled={resetting}
            variant="outline"
            className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
            Reset This Account
          </Button>

          <Button
            onClick={handleFullReset}
            disabled={resetting}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {resetting ? 'Resetting...' : 'Reset ALL Accounts'}
          </Button>
        </div>

        {/* Status Info */}
        <div className="text-xs text-white/60 space-y-1">
          <div>Balance: ${account.balance.toLocaleString()}</div>
          <div>P&L: {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)} ({account.total_pnl_percentage.toFixed(1)}%)</div>
          <div>Created: {new Date(account.created_at).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};
