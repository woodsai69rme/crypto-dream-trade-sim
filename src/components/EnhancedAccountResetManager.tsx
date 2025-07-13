import { useState } from 'react';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useAccountReset } from '@/hooks/useAccountReset';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { 
  RotateCcw, Trash2, History, Shield, AlertTriangle, 
  Database, Bot, LineChart, Download, Upload,
  CheckCircle, Clock, Users, Zap
} from 'lucide-react';

export const EnhancedAccountResetManager = () => {
  const { user } = useAuth();
  const { currentAccount, accounts } = useMultipleAccounts();
  const { resetAccount, resetAllAccounts, resetting } = useAccountReset();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preserveStats, setPreserveStats] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [resetProgress, setResetProgress] = useState(0);
  const [eliteBotsCreated, setEliteBotsCreated] = useState(false);

  const handleEnhancedReset = async (accountId: string, preserveHistory: boolean = false) => {
    if (!user) return;
    
    setLoading(true);
    setResetProgress(0);
    
    try {
      setResetProgress(25);
      
      // Call enhanced reset function
      const { data, error } = await supabase.rpc('reset_account_with_stats', {
        account_id_param: accountId,
        preserve_stats: preserveHistory
      });

      if (error) throw error;

      setResetProgress(75);
      
      if ((data as any)?.success) {
        setResetProgress(100);
        toast({
          title: "Enhanced Reset Complete",
          description: `Account reset successfully. ${preserveHistory ? 'Statistics preserved.' : 'Full reset performed.'}`,
        });
      } else {
        throw new Error((data as any)?.error || 'Reset failed');
      }
    } catch (error: any) {
      console.error('Enhanced reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setResetProgress(0);
    }
  };

  const handleMultipleAccountReset = async () => {
    if (!user || selectedAccounts.length === 0) return;
    
    setLoading(true);
    setResetProgress(0);
    
    try {
      setResetProgress(20);
      
      const { data, error } = await supabase.rpc('reset_multiple_accounts', {
        account_ids: selectedAccounts,
        preserve_stats: preserveStats
      });

      if (error) throw error;

      setResetProgress(80);
      
      if ((data as any)?.success) {
        setResetProgress(100);
        toast({
          title: "Multi-Account Reset Complete",
          description: `Successfully reset ${(data as any).successful_resets} of ${(data as any).total_accounts} accounts.`,
        });
        setSelectedAccounts([]);
      } else {
        toast({
          title: "Partial Reset",
          description: `Reset ${(data as any).successful_resets} accounts, ${(data as any).failed_resets} failed.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Multi-account reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setResetProgress(0);
    }
  };

  const create50EliteBots = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_50_elite_bot_configs', {
        user_id_param: user.id
      });

      if (error) throw error;

      setEliteBotsCreated(true);
      toast({
        title: "Elite Bots Created",
        description: "50 elite trading bot configurations have been created successfully!",
      });
    } catch (error: any) {
      console.error('Elite bots creation error:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAccountData = async () => {
    if (!currentAccount) return;
    
    try {
      const { data: trades } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('account_id', currentAccount.id);

      const { data: audit } = await supabase
        .from('comprehensive_audit')
        .select('*')
        .eq('account_id', currentAccount.id);

      const exportData = {
        account: currentAccount,
        trades: trades || [],
        audit: audit || [],
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account-${currentAccount.account_name}-backup.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Account data exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Enhanced Account Management & Reset System
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Shield className="w-3 h-3 mr-1" />
              ENTERPRISE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Advanced account management with statistics preservation, multi-account operations, and elite bot configurations.
          </p>
        </CardContent>
      </Card>

      {loading && resetProgress > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Operation Progress</span>
                <span>{resetProgress}%</span>
              </div>
              <Progress value={resetProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

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
          <h3 className="font-medium mb-2">Account Status</h3>
          <Badge className={`${currentAccount.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {currentAccount.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="single" className="data-[state=active]:bg-purple-600">
            Single Account
          </TabsTrigger>
          <TabsTrigger value="multiple" className="data-[state=active]:bg-purple-600">
            Multi-Account
          </TabsTrigger>
          <TabsTrigger value="elite-bots" className="data-[state=active]:bg-purple-600">
            Elite Bots
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-purple-600">
            Backup/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Enhanced Performance Reset
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Reset performance metrics with optional statistics preservation
              </p>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox 
                  id="preserve-stats" 
                  checked={preserveStats}
                  onCheckedChange={(checked) => setPreserveStats(checked === true)}
                />
                <label htmlFor="preserve-stats" className="text-sm">
                  Preserve historical statistics for analysis
                </label>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={loading}>
                    <LineChart className="w-4 h-4 mr-2" />
                    Enhanced Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="crypto-card-gradient">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Enhanced Account Reset</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset your account with advanced options. 
                      {preserveStats ? 'Statistics will be preserved for historical analysis.' : 'All data will be reset.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleEnhancedReset(currentAccount.id, preserveStats)}>
                      Confirm Enhanced Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Complete History Reset
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Archive all trades and reset to initial state (preserves data for audit)
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={loading}>
                    <History className="w-4 h-4 mr-2" />
                    Archive & Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="crypto-card-gradient">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive & Reset Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive all current trades and reset the account. 
                      Archived data can be restored if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleEnhancedReset(currentAccount.id, true)}>
                      Archive & Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="multiple" className="space-y-4">
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Multi-Account Operations
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/60 mb-2">Select accounts to reset:</p>
                <ScrollArea className="h-40 bg-white/5 rounded p-2">
                  {accounts.map(account => (
                    <div key={account.id} className="flex items-center gap-2 mb-2">
                      <Checkbox 
                        id={account.id}
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAccounts([...selectedAccounts, account.id]);
                          } else {
                            setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                          }
                        }}
                      />
                      <label htmlFor={account.id} className="text-sm flex-1">
                        {account.account_name} - ${account.balance.toLocaleString()}
                      </label>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox 
                  id="preserve-multi-stats" 
                  checked={preserveStats}
                  onCheckedChange={(checked) => setPreserveStats(checked === true)}
                />
                <label htmlFor="preserve-multi-stats" className="text-sm">
                  Preserve statistics for all selected accounts
                </label>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAccounts(accounts.map(a => a.id))}
                  size="sm"
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAccounts([])}
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={loading || selectedAccounts.length === 0}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Reset {selectedAccounts.length} Selected Accounts
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="crypto-card-gradient">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Multi-Account Reset</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset {selectedAccounts.length} selected accounts.
                      {preserveStats ? ' Statistics will be preserved.' : ' All data will be reset.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleMultipleAccountReset}>
                      Reset Selected Accounts
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="elite-bots" className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Elite Trading Bot Configurations
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-2xl font-bold text-purple-400">50</p>
                  <p className="text-xs text-white/60">Elite Strategies</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-2xl font-bold text-blue-400">5</p>
                  <p className="text-xs text-white/60">AI Models</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-2xl font-bold text-green-400">25+</p>
                  <p className="text-xs text-white/60">Asset Pairs</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-2xl font-bold text-yellow-400">$500K+</p>
                  <p className="text-xs text-white/60">Total Capital</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Create 50 elite trading bot configurations including:
                </p>
                <ul className="text-xs text-white/60 space-y-1 ml-4">
                  <li>• Advanced momentum and trend-following strategies</li>
                  <li>• Cross-exchange arbitrage and market-making bots</li>
                  <li>• AI-powered sentiment and pattern recognition</li>
                  <li>• DeFi yield optimization and liquidity mining</li>
                  <li>• Risk management and portfolio rebalancing</li>
                </ul>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={loading || eliteBotsCreated}
                    className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {eliteBotsCreated ? 'Elite Bots Created' : 'Create 50 Elite Bot Configs'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="crypto-card-gradient">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create Elite Bot Configurations</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create 50 advanced trading bot configurations with various strategies,
                      AI models, and risk levels. This will replace any existing bot configurations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={create50EliteBots}>
                      Create Elite Bots
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Account Data
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Download complete account data including trades and audit logs
              </p>
              <Button variant="outline" onClick={exportAccountData} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Account Data
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Restore account from previously exported backup
              </p>
              <Button variant="outline" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Import Data (Coming Soon)
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-3 bg-blue-500/10 rounded border border-blue-500/20">
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <Shield className="w-4 h-4" />
          <span>All operations are performed on paper trading accounts with comprehensive audit trails</span>
        </div>
      </div>
    </div>
  );
};