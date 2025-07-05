
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, RotateCcw, History, AlertTriangle } from 'lucide-react';

export const AccountHistoryManager = () => {
  const { user } = useAuth();
  const { currentAccount, accounts, fetchAccounts } = useMultipleAccounts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleResetPerformanceHistory = async (accountId: string) => {
    if (!user || !accountId) return;

    setLoading(true);
    try {
      // Reset account performance metrics
      const { error: accountError } = await supabase
        .from('paper_trading_accounts')
        .update({
          total_pnl: 0,
          total_pnl_percentage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (accountError) throw accountError;

      // Clear analytics history
      const { error: analyticsError } = await supabase
        .from('account_analytics')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (analyticsError) throw analyticsError;

      // Create audit entry
      await supabase
        .from('paper_account_audit')
        .insert({
          user_id: user.id,
          account_id: accountId,
          action: 'performance_reset',
          reason: 'Performance history reset by user'
        });

      await fetchAccounts();
      
      toast({
        title: "Performance Reset",
        description: "Account performance history has been reset successfully.",
      });
    } catch (error: any) {
      console.error('Reset performance error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset performance history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetTradeHistory = async (accountId: string) => {
    if (!user || !accountId) return;

    setLoading(true);
    try {
      // Delete all trades for this account
      const { error: tradesError } = await supabase
        .from('paper_trades')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (tradesError) throw tradesError;

      // Create audit entry
      await supabase
        .from('paper_account_audit')
        .insert({
          user_id: user.id,
          account_id: accountId,
          action: 'trade_history_reset',
          reason: 'Trade history cleared by user'
        });

      toast({
        title: "Trade History Cleared",
        description: "All trade history has been permanently deleted.",
      });
    } catch (error: any) {
      console.error('Clear trades error:', error);
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear trade history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFullAccountReset = async (accountId: string) => {
    if (!user || !accountId) return;

    setLoading(true);
    try {
      // Reset account to initial state
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      const { error: resetError } = await supabase
        .rpc('reset_paper_account', {
          account_id_param: accountId,
          reset_balance_param: account.initial_balance
        });

      if (resetError) throw resetError;

      // Clear all related data
      await Promise.all([
        supabase.from('paper_trades').delete().eq('account_id', accountId).eq('user_id', user.id),
        supabase.from('account_analytics').delete().eq('account_id', accountId).eq('user_id', user.id)
      ]);

      await fetchAccounts();

      toast({
        title: "Account Reset Complete",
        description: "Account has been fully reset to initial state.",
      });
    } catch (error: any) {
      console.error('Full reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Card className="crypto-card-gradient text-white">
        <CardContent className="p-6 text-center">
          <p className="text-white/60">Please select an account to manage history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Account History Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Active Account: {currentAccount.account_name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Current Balance:</span>
              <div className="font-medium">${currentAccount.balance.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-white/60">Total P&L:</span>
              <div className={`font-medium ${currentAccount.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentAccount.total_pnl >= 0 ? '+' : ''}${currentAccount.total_pnl.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Performance History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Reset Performance History
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  This will reset all performance metrics (P&L, analytics) but keep your trade history and current balance. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleResetPerformanceHistory(currentAccount.id)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Reset Performance
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Trade History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Clear Trade History
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  This will permanently delete all trade records but keep your current balance and performance metrics. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleResetTradeHistory(currentAccount.id)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Full Account Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Full Account Reset
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  This will completely reset the account to its initial state: restore original balance, clear all trades, reset all performance metrics. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleFullAccountReset(currentAccount.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Full Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Important Notes</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• All reset actions are permanent and cannot be undone</li>
                <li>• Performance reset keeps trades but clears P&L calculations</li>
                <li>• Trade history clearing removes all transaction records</li>
                <li>• Full reset returns account to original initial balance</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
