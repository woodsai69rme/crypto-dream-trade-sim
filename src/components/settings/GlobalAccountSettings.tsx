
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/useSettings";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useAccountReset } from "@/hooks/useAccountReset";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bot, Users, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export const GlobalAccountSettings = () => {
  const { settings, updateSetting } = useSettings();
  const { accounts } = useMultipleAccounts();
  const { resetAllAccounts, resetting } = useAccountReset();
  const { toast } = useToast();
  
  const [globalSettings, setGlobalSettings] = useState({
    enableAIBotsForAll: false,
    enableFollowingForAll: false,
  });

  const [operationInProgress, setOperationInProgress] = useState(false);

  const handleToggleAllAIBots = async (enabled: boolean) => {
    if (accounts.length === 0) return;
    
    setOperationInProgress(true);
    console.log('Toggling AI bots for all accounts:', enabled);

    try {
      let successCount = 0;
      
      for (const account of accounts) {
        const success = await updateSetting(`ai_bots_${account.id}`, enabled);
        if (success) successCount++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setGlobalSettings(prev => ({ ...prev, enableAIBotsForAll: enabled }));
      
      toast({
        title: enabled ? "AI Bots Enabled Globally" : "AI Bots Disabled Globally",
        description: `AI trading bots ${enabled ? 'activated' : 'deactivated'} for ${successCount}/${accounts.length} accounts`,
      });
    } catch (error) {
      console.error('Error toggling AI bots globally:', error);
      toast({
        title: "Error",
        description: "Failed to update AI bot settings for all accounts",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleToggleAllFollowing = async (enabled: boolean) => {
    if (accounts.length === 0) return;
    
    setOperationInProgress(true);
    console.log('Toggling following for all accounts:', enabled);

    try {
      let successCount = 0;
      
      for (const account of accounts) {
        const success = await updateSetting(`following_${account.id}`, enabled);
        if (success) successCount++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setGlobalSettings(prev => ({ ...prev, enableFollowingForAll: enabled }));
      
      toast({
        title: enabled ? "Following Enabled Globally" : "Following Disabled Globally",
        description: `Trade following ${enabled ? 'activated' : 'deactivated'} for ${successCount}/${accounts.length} accounts`,
      });
    } catch (error) {
      console.error('Error toggling following globally:', error);
      toast({
        title: "Error",
        description: "Failed to update following settings for all accounts",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleFullReset = async () => {
    if (window.confirm('⚠️ DANGER: This will reset ALL accounts, clear ALL trades, and reset ALL balances. This action cannot be undone. Are you absolutely sure?')) {
      const success = await resetAllAccounts();
      if (success) {
        // Reset global settings too
        setGlobalSettings({
          enableAIBotsForAll: false,
          enableFollowingForAll: false,
        });
        
        toast({
          title: "Complete Reset Successful",
          description: "All accounts have been reset to their initial state",
        });
        
        // Refresh the page to show updated data
        setTimeout(() => window.location.reload(), 2000);
      }
    }
  };

  // Check current state of all accounts
  useEffect(() => {
    if (accounts.length === 0) return;
    
    const aiBotsEnabled = accounts.every(account => settings[`ai_bots_${account.id}`]);
    const followingEnabled = accounts.every(account => settings[`following_${account.id}`]);
    
    setGlobalSettings({
      enableAIBotsForAll: aiBotsEnabled,
      enableFollowingForAll: followingEnabled,
    });
  }, [accounts, settings]);

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Global Account Settings
          <span className="text-sm font-normal text-white/60">
            ({accounts.length} accounts)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Settings className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No accounts found to configure.</p>
          </div>
        ) : (
          <>
            {/* Global Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Global Controls</h3>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-sm font-medium">Enable AI Bots for All Accounts</Label>
                    <p className="text-xs text-white/60 mt-1">
                      Activate AI trading bots across all {accounts.length} accounts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={globalSettings.enableAIBotsForAll}
                  onCheckedChange={handleToggleAllAIBots}
                  disabled={operationInProgress}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <div>
                    <Label className="text-sm font-medium">Enable Following for All Accounts</Label>
                    <p className="text-xs text-white/60 mt-1">
                      Activate trade following across all {accounts.length} accounts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={globalSettings.enableFollowingForAll}
                  onCheckedChange={handleToggleAllFollowing}
                  disabled={operationInProgress}
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-red-300">Complete System Reset</h4>
                    <p className="text-sm text-red-200/80 mt-1">
                      This will reset ALL accounts to their initial balance, clear ALL trade history, 
                      and disable all bots and following. This action cannot be undone.
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleFullReset}
                    disabled={resetting || operationInProgress}
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <AlertTriangle className={`w-4 h-4 mr-2 ${resetting ? 'animate-pulse' : ''}`} />
                    {resetting ? 'Resetting All Accounts...' : 'RESET ALL ACCOUNTS'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80">Current Status</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>AI Bots Active: {accounts.filter(a => settings[`ai_bots_${a.id}`]).length}/{accounts.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Following Active: {accounts.filter(a => settings[`following_${a.id}`]).length}/{accounts.length}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {operationInProgress && (
          <div className="text-center text-sm text-white/60">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
            Updating account settings...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
