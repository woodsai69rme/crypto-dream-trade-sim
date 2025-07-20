import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, TrendingUp, DollarSign, Settings } from 'lucide-react';

interface AccountModeToggleProps {
  accountId: string;
  currentMode: string;
  onModeChange?: (accountId: string, newMode: string) => void;
}

export const AccountModeToggle: React.FC<AccountModeToggleProps> = ({
  accountId,
  currentMode,
  onModeChange
}) => {
  const { user } = useAuth();
  const { accounts, refreshAccounts } = useMultipleAccounts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetMode, setTargetMode] = useState<'paper' | 'live'>('paper');

  const account = accounts.find(acc => acc.id === accountId);
  const isLiveMode = currentMode === 'live';

  const handleModeToggle = (newMode: 'paper' | 'live') => {
    setTargetMode(newMode);
    if (newMode === 'live') {
      setShowConfirmation(true);
    } else {
      updateAccountMode(newMode);
    }
  };

  const updateAccountMode = async (mode: 'paper' | 'live') => {
    if (!user || !account) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({ 
          trading_mode: mode,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: `Account Mode Updated`,
        description: `Account switched to ${mode === 'live' ? 'Live Trading' : 'Paper Trading'} mode`,
        variant: mode === 'live' ? 'destructive' : 'default'
      });

      // Refresh accounts to update the state
      await refreshAccounts();
      
      // Call the callback if provided
      if (onModeChange) {
        onModeChange(accountId, mode);
      }

      setShowConfirmation(false);
    } catch (error: any) {
      console.error('Error updating account mode:', error);
      toast({
        title: "Error",
        description: "Failed to update account mode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getModeColor = (mode: string) => {
    return mode === 'live' ? 'text-red-400' : 'text-green-400';
  };

  const getModeBadge = (mode: string) => {
    return mode === 'live' 
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  if (!account) return null;

  return (
    <>
      <Card className="crypto-card-gradient text-white border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Trading Mode Control
            <Badge className={`${getModeBadge(currentMode)} border`}>
              {currentMode === 'live' ? 'LIVE TRADING' : 'PAPER TRADING'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Account Info */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{account.account_name}</span>
              <Badge className={getModeBadge(currentMode)}>
                {currentMode.toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Balance:</span>
                <span className="ml-2 text-white">${account.balance.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-white/60">P&L:</span>
                <span className={`ml-2 ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-white/60">Risk Level:</span>
                <span className="ml-2 text-white capitalize">{account.risk_level}</span>
              </div>
              <div>
                <span className="text-white/60">Type:</span>
                <span className="ml-2 text-white capitalize">{account.account_type}</span>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-white">Select Trading Mode</h4>
            
            {/* Paper Trading Option */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <Label className="text-base font-medium text-white">Paper Trading</Label>
                  <p className="text-sm text-white/60 mt-1">
                    Safe simulation mode with virtual money
                  </p>
                </div>
              </div>
              <Switch
                checked={currentMode === 'paper'}
                onCheckedChange={() => handleModeToggle('paper')}
                disabled={loading || currentMode === 'paper'}
              />
            </div>

            {/* Live Trading Option */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded">
                  <DollarSign className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <Label className="text-base font-medium text-white">Live Trading</Label>
                  <p className="text-sm text-white/60 mt-1">
                    Real money trading with actual exchanges
                  </p>
                </div>
              </div>
              <Switch
                checked={currentMode === 'live'}
                onCheckedChange={() => handleModeToggle('live')}
                disabled={loading || currentMode === 'live'}
              />
            </div>
          </div>

          {/* Risk Information */}
          {currentMode === 'live' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Live Trading Active</span>
              </div>
              <div className="space-y-2 text-sm text-red-300">
                <p>• All trades will use real money</p>
                <p>• Losses cannot be recovered</p>
                <p>• Daily loss limit: ${account.daily_loss_limit || 1000}</p>
                <p>• Max position: {account.max_position_percentage || 10}% of balance</p>
              </div>
            </div>
          )}

          {/* Safety Features for Live Mode */}
          {currentMode === 'live' && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h5 className="font-medium text-white mb-3">Safety Features</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Emergency Stop:</span>
                  <span className={account.emergency_stop ? 'text-red-400' : 'text-green-400'}>
                    {account.emergency_stop ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">2FA Required:</span>
                  <span className={account.two_factor_enabled ? 'text-green-400' : 'text-red-400'}>
                    {account.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Risk Level:</span>
                  <span className="text-white capitalize">{account.risk_level}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Trading Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Enable Live Trading</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to enable LIVE TRADING mode for this account. This means:
              <br /><br />
              <strong>⚠️ REAL MONEY RISKS:</strong>
              <br />• All trades will use real money from your connected exchanges
              <br />• Losses are permanent and cannot be undone
              <br />• You could lose all money in connected accounts
              <br />• Market volatility can cause rapid losses
              <br /><br />
              <strong>Account: {account.account_name}</strong>
              <br />Current Balance: ${account.balance.toLocaleString()}
              <br />Risk Level: {account.risk_level}
              <br /><br />
              Are you absolutely sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel - Keep Paper Trading</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateAccountMode('live')}
              className="bg-red-500 hover:bg-red-600"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Enable Live Trading'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};