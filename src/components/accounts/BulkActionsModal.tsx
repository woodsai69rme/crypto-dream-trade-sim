import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  TrendingUp,
  Play,
  Pause,
  BarChart3,
  Users
} from "lucide-react";

interface BulkActionsModalProps {
  accounts: PaperAccount[];
  isOpen: boolean;
  onClose: () => void;
  onAccountsUpdated: () => void;
}

export const BulkActionsModal = ({ accounts, isOpen, onClose, onAccountsUpdated }: BulkActionsModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('balance');
  const [bulkBalance, setBulkBalance] = useState('100000');
  const [bulkRiskLevel, setBulkRiskLevel] = useState('medium');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(accounts.map(acc => acc.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts(prev => [...prev, accountId]);
    } else {
      setSelectedAccounts(prev => prev.filter(id => id !== accountId));
    }
  };

  const handleBulkBalanceUpdate = async () => {
    if (selectedAccounts.length === 0) {
      toast({
        title: "No Accounts Selected",
        description: "Please select at least one account to update",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      for (const accountId of selectedAccounts) {
        await supabase.rpc('adjust_paper_balance', {
          account_id_param: accountId,
          new_balance_param: parseFloat(bulkBalance),
          reason_param: 'Bulk balance adjustment'
        });
      }

      toast({
        title: "Bulk Update Complete",
        description: `Updated ${selectedAccounts.length} accounts to $${parseFloat(bulkBalance).toLocaleString()}`,
      });
      onAccountsUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Bulk Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReset = async () => {
    if (selectedAccounts.length === 0) {
      toast({
        title: "No Accounts Selected",
        description: "Please select at least one account to reset",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to reset ${selectedAccounts.length} accounts? This will clear all trading history.`)) {
      return;
    }

    setLoading(true);
    try {
      for (const accountId of selectedAccounts) {
        await supabase.rpc('reset_paper_account', {
          account_id_param: accountId,
          reset_balance_param: parseFloat(bulkBalance)
        });
      }

      toast({
        title: "Bulk Reset Complete",
        description: `Reset ${selectedAccounts.length} accounts successfully`,
      });
      onAccountsUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Bulk Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedAccounts.length === 0) {
      toast({
        title: "No Accounts Selected",
        description: "Please select at least one account to update",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('paper_trading_accounts')
        .update({ 
          status: status as any,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedAccounts);

      if (error) throw error;

      const statusLabel = status === 'active' ? 'activated' : 'paused';
      toast({
        title: "Bulk Status Update",
        description: `${selectedAccounts.length} accounts ${statusLabel}`,
      });
      onAccountsUpdated();
    } catch (error: any) {
      toast({
        title: "Status Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedAccountsData = accounts.filter(acc => selectedAccounts.includes(acc.id));
  const totalValue = selectedAccountsData.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPnL = selectedAccountsData.reduce((sum, acc) => sum + acc.total_pnl, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto crypto-card-gradient text-primary-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5" />
            Bulk Account Actions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Selection */}
          <Card className="bg-background/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Select Accounts</CardTitle>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAll(selectedAccounts.length !== accounts.length)}
                >
                  {selectedAccounts.length === accounts.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedAccounts.length} of {accounts.length} selected
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center space-x-3 p-2 bg-background/5 rounded">
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) => handleSelectAccount(account.id, !!checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{account.account_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {account.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${account.balance.toLocaleString()} • {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Accounts Summary */}
          {selectedAccounts.length > 0 && (
            <Card className="bg-background/5 border-white/10">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{selectedAccounts.length}</div>
                    <div className="text-sm text-muted-foreground">Selected Accounts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">${totalValue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk Actions */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background/10">
              <TabsTrigger value="balance">Balance Actions</TabsTrigger>
              <TabsTrigger value="status">Status Control</TabsTrigger>
              <TabsTrigger value="reset">Reset Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="space-y-4">
              <Card className="bg-background/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Bulk Balance Update
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>New Balance ($)</Label>
                    <Input 
                      type="number"
                      value={bulkBalance}
                      onChange={(e) => setBulkBalance(e.target.value)}
                      className="bg-background/10 border-white/20"
                      placeholder="Enter balance amount"
                    />
                  </div>
                  <Button 
                    onClick={handleBulkBalanceUpdate} 
                    disabled={loading || selectedAccounts.length === 0}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {loading ? "Updating..." : `Update ${selectedAccounts.length} Account Balances`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <Card className="bg-background/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Status Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleBulkStatusUpdate('active')} 
                      disabled={loading || selectedAccounts.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Activate Selected
                    </Button>
                    <Button 
                      onClick={() => handleBulkStatusUpdate('paused')} 
                      disabled={loading || selectedAccounts.length === 0}
                      variant="outline"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Selected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              <Card className="bg-background/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Bulk Reset Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-500/10 border-yellow-500/20 border rounded-lg">
                    <p className="text-sm">
                      ⚠️ Resetting accounts will clear all trading history and reset balances.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Button 
                    onClick={handleBulkReset} 
                    disabled={loading || selectedAccounts.length === 0}
                    variant="destructive"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {loading ? "Resetting..." : `Reset ${selectedAccounts.length} Accounts`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};