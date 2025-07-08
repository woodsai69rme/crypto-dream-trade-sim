import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaperAccount } from "@/hooks/useMultipleAccounts";
import { 
  Settings, 
  DollarSign, 
  RefreshCw, 
  Trash2, 
  TrendingUp,
  Shield,
  AlertTriangle,
  Info
} from "lucide-react";

interface AccountManagementModalProps {
  account: PaperAccount;
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdated: () => void;
}

export const AccountManagementModal = ({ account, isOpen, onClose, onAccountUpdated }: AccountManagementModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  // Form states
  const [accountName, setAccountName] = useState(account.account_name);
  const [description, setDescription] = useState(account.description || '');
  const [riskLevel, setRiskLevel] = useState(account.risk_level as string);
  const [maxDailyLoss, setMaxDailyLoss] = useState(account.max_daily_loss?.toString() || '1000');
  const [maxPositionSize, setMaxPositionSize] = useState(account.max_position_size?.toString() || '5000');
  const [tradingStrategy, setTradingStrategy] = useState(account.trading_strategy);
  const [newBalance, setNewBalance] = useState(account.balance.toString());
  const [resetBalance, setResetBalance] = useState(account.initial_balance.toString());

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({
          account_name: accountName,
          description: description,
          risk_level: riskLevel as any,
          max_daily_loss: parseFloat(maxDailyLoss),
          max_position_size: parseFloat(maxPositionSize),
          trading_strategy: tradingStrategy,
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Account settings have been updated successfully",
      });
      onAccountUpdated();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('adjust_paper_balance', {
        account_id_param: account.id,
        new_balance_param: parseFloat(newBalance),
        reason_param: 'Manual balance adjustment'
      });

      if (error) throw error;

      toast({
        title: "Balance Adjusted",
        description: `Account balance updated to $${parseFloat(newBalance).toLocaleString()}`,
      });
      onAccountUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Balance Adjustment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAccount = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('reset_paper_account', {
        account_id_param: account.id,
        reset_balance_param: parseFloat(resetBalance)
      });

      if (error) throw error;

      toast({
        title: "Account Reset",
        description: `Account has been reset with balance $${parseFloat(resetBalance).toLocaleString()}`,
      });
      onAccountUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(`Are you sure you want to delete "${account.account_name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .delete()
        .eq('id', account.id);

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Account has been deleted successfully",
      });
      onAccountUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto crypto-card-gradient text-primary-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5" />
            Manage Account: {account.account_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-background/10">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-background/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Name</Label>
                    <Input 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="bg-background/10 border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Risk Level</Label>
                    <Select value={riskLevel} onValueChange={setRiskLevel}>
                      <SelectTrigger className="bg-background/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your trading strategy or notes..."
                    className="bg-background/10 border-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Daily Loss ($)</Label>
                    <Input 
                      type="number"
                      value={maxDailyLoss}
                      onChange={(e) => setMaxDailyLoss(e.target.value)}
                      className="bg-background/10 border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Max Position Size ($)</Label>
                    <Input 
                      type="number"
                      value={maxPositionSize}
                      onChange={(e) => setMaxPositionSize(e.target.value)}
                      className="bg-background/10 border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <Label>Trading Strategy</Label>
                  <Select value={tradingStrategy} onValueChange={setTradingStrategy}>
                    <SelectTrigger className="bg-background/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Trading</SelectItem>
                      <SelectItem value="trend-following">Trend Following</SelectItem>
                      <SelectItem value="grid-trading">Grid Trading</SelectItem>
                      <SelectItem value="dca">Dollar Cost Averaging</SelectItem>
                      <SelectItem value="scalping">Scalping</SelectItem>
                      <SelectItem value="swing">Swing Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleUpdateSettings} disabled={loading} className="w-full">
                  {loading ? "Updating..." : "Update Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance" className="space-y-4">
            <Card className="bg-background/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Balance Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-background/5 rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Balance</Label>
                    <div className="text-2xl font-bold text-green-400">
                      ${account.balance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Total P&L</Label>
                    <div className={`text-2xl font-bold ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Adjust Balance ($)</Label>
                  <Input 
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="bg-background/10 border-white/20"
                    placeholder="Enter new balance amount"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will adjust the account balance and update P&L calculations.
                  </p>
                </div>

                <Button onClick={handleAdjustBalance} disabled={loading} className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {loading ? "Adjusting..." : "Adjust Balance"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reset" className="space-y-4">
            <Card className="bg-background/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Reset Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border-yellow-500/20 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium text-yellow-400">Warning</span>
                  </div>
                  <p className="text-sm">
                    Resetting will clear all trading history and reset the account to its initial state.
                    This action cannot be undone.
                  </p>
                </div>

                <div>
                  <Label>Reset Balance ($)</Label>
                  <Input 
                    type="number"
                    value={resetBalance}
                    onChange={(e) => setResetBalance(e.target.value)}
                    className="bg-background/10 border-white/20"
                    placeholder="Enter reset balance amount"
                  />
                </div>

                <Button 
                  onClick={handleResetAccount} 
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {loading ? "Resetting..." : "Reset Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-500/10 border-red-500/20 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-red-400">Permanent Action</span>
                  </div>
                  <p className="text-sm">
                    Deleting an account will permanently remove all associated data, including:
                    trade history, performance metrics, and account settings. This cannot be undone.
                  </p>
                </div>

                <Button 
                  onClick={handleDeleteAccount} 
                  disabled={loading}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading ? "Deleting..." : "Delete Account Permanently"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};