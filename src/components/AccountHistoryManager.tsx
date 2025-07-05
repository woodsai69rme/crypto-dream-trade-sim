
import { useState } from 'react';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Trash2, History, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AccountHistoryManager = () => {
  const { currentAccount, updateAccount, deleteAccount, accounts } = useMultipleAccounts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleResetPerformance = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      await updateAccount(currentAccount.id, {
        total_pnl: 0,
        total_pnl_percentage: 0,
        balance: currentAccount.initial_balance
      });
      
      toast({
        title: "Performance Reset",
        description: "Account performance has been reset to initial state",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset performance metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAccount = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      await updateAccount(currentAccount.id, {
        balance: currentAccount.initial_balance,
        total_pnl: 0,
        total_pnl_percentage: 0
      });
      
      toast({
        title: "Account Reset",
        description: "Account has been completely reset",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      await deleteAccount(currentAccount.id);
      toast({
        title: "Account Deleted",
        description: "Account has been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Delete Failed", 
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-white/60">No account selected. Please select an account first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Account History & Management
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Shield className="w-3 h-3 mr-1" />
            PAPER ONLY
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-medium mb-2">Current Balance</h3>
            <p className="text-2xl font-bold text-green-400">${currentAccount.balance.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-medium mb-2">Total P&L</h3>
            <p className={`text-2xl font-bold ${currentAccount.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${currentAccount.total_pnl.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="font-medium mb-2">P&L %</h3>
            <p className={`text-2xl font-bold ${currentAccount.total_pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentAccount.total_pnl_percentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <Tabs defaultValue="reset" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="reset" className="data-[state=active]:bg-white/20">
              Reset Options
            </TabsTrigger>
            <TabsTrigger value="danger" className="data-[state=active]:bg-red-600">
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reset" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset Performance History
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  Reset all P&L metrics and performance data while keeping trade history
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={loading}>
                      Reset Performance
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="crypto-card-gradient">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Performance Metrics?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset your P&L, returns, and performance metrics to zero.
                        Your trade history will be preserved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetPerformance}>
                        Reset Performance
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Full Account Reset
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  Reset account to initial balance and clear all history
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={loading}>
                      Full Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="crypto-card-gradient">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Full Account Reset?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset your account to the initial balance and clear all trading history.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetAccount}>
                        Reset Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-red-400">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Permanently delete this paper trading account. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading || accounts.length <= 1}>
                    {accounts.length <= 1 ? "Cannot Delete Last Account" : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="crypto-card-gradient">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{currentAccount.account_name}" and all associated data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 bg-blue-500/10 rounded border border-blue-500/20">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Shield className="w-4 h-4" />
            <span>All operations are performed on paper trading accounts only - no real money is involved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
