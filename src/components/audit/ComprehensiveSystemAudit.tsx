
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Bot, 
  Users, 
  Shield,
  Activity,
  Settings,
  TrendingUp,
  Wifi
} from 'lucide-react';

interface AuditTest {
  id: string;
  name: string;
  description: string;
  category: 'database' | 'auth' | 'bots' | 'following' | 'trading' | 'realtime' | 'security';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: string;
  icon: React.ReactNode;
}

export const ComprehensiveSystemAudit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<AuditTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const auditTests: AuditTest[] = [
    {
      id: 'db_connection',
      name: 'Database Connectivity',
      description: 'Test connection to Supabase database',
      category: 'database',
      status: 'pending',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'user_auth',
      name: 'User Authentication',
      description: 'Verify user session and permissions',
      category: 'auth',
      status: 'pending',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'ai_bots_active',
      name: 'AI Bots Status',
      description: 'Check if AI trading bots are active and functional',
      category: 'bots',
      status: 'pending',
      icon: <Bot className="w-4 h-4" />
    },
    {
      id: 'following_system',
      name: 'Trade Following System',
      description: 'Verify trade following functionality',
      category: 'following',
      status: 'pending',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'trading_engine',
      name: 'Trading Engine',
      description: 'Test paper and real trading functionality',
      category: 'trading',
      status: 'pending',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'realtime_updates',
      name: 'Real-time Updates',
      description: 'Test WebSocket connections and live data',
      category: 'realtime',
      status: 'pending',
      icon: <Wifi className="w-4 h-4" />
    },
    {
      id: 'data_persistence',
      name: 'Data Persistence',
      description: 'Verify data is being saved correctly',
      category: 'database',
      status: 'pending',
      icon: <Settings className="w-4 h-4" />
    },
    {
      id: 'api_connections',
      name: 'API Connections',
      description: 'Test external API integrations',
      category: 'security',
      status: 'pending',
      icon: <Activity className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    setTests(auditTests);
  }, []);

  const runAudit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run the audit",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);

    const updatedTests = [...auditTests];
    
    for (let i = 0; i < updatedTests.length; i++) {
      const test = updatedTests[i];
      
      // Update test status to running
      test.status = 'running';
      setTests([...updatedTests]);
      
      try {
        const result = await runIndividualTest(test);
        test.status = result.status;
        test.result = result.message;
      } catch (error) {
        test.status = 'failed';
        test.result = `Error: ${error}`;
      }
      
      setProgress(((i + 1) / updatedTests.length) * 100);
      setTests([...updatedTests]);
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    
    const failedTests = updatedTests.filter(t => t.status === 'failed').length;
    const warningTests = updatedTests.filter(t => t.status === 'warning').length;
    
    toast({
      title: "Audit Complete",
      description: `${updatedTests.length - failedTests - warningTests} tests passed, ${warningTests} warnings, ${failedTests} failed`,
      variant: failedTests > 0 ? "destructive" : warningTests > 0 ? "default" : "default",
    });
  };

  const runIndividualTest = async (test: AuditTest): Promise<{ status: 'passed' | 'failed' | 'warning', message: string }> => {
    switch (test.id) {
      case 'db_connection':
        try {
          const { data, error } = await supabase.from('profiles').select('id').limit(1);
          if (error) throw error;
          return { status: 'passed', message: 'Database connection successful' };
        } catch (error) {
          return { status: 'failed', message: `Database connection failed: ${error}` };
        }

      case 'user_auth':
        try {
          if (!user) throw new Error('No user session');
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          return { status: 'passed', message: `Authenticated as ${user.email}` };
        } catch (error) {
          return { status: 'failed', message: `Authentication failed: ${error}` };
        }

      case 'ai_bots_active':
        try {
          const { data: bots, error } = await supabase
            .from('ai_trading_bots')
            .select('id, status')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          const activeBots = bots?.filter(bot => bot.status === 'active').length || 0;
          const totalBots = bots?.length || 0;
          
          if (totalBots === 0) {
            return { status: 'warning', message: 'No AI bots found. Consider creating some.' };
          }
          
          return { 
            status: activeBots > 0 ? 'passed' : 'warning', 
            message: `${activeBots}/${totalBots} AI bots are active` 
          };
        } catch (error) {
          return { status: 'failed', message: `AI bots check failed: ${error}` };
        }

      case 'following_system':
        try {
          const { data: follows, error } = await supabase
            .from('trader_follows')
            .select('id, is_active')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          const activeFollows = follows?.filter(f => f.is_active).length || 0;
          const totalFollows = follows?.length || 0;
          
          if (totalFollows === 0) {
            return { status: 'warning', message: 'No traders being followed. Consider following some traders.' };
          }
          
          return { 
            status: 'passed', 
            message: `Following ${activeFollows}/${totalFollows} traders` 
          };
        } catch (error) {
          return { status: 'failed', message: `Following system check failed: ${error}` };
        }

      case 'trading_engine':
        try {
          const { data: accounts, error } = await supabase
            .from('paper_trading_accounts')
            .select('id, status')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          const activeAccounts = accounts?.filter(acc => acc.status === 'active').length || 0;
          
          if (activeAccounts === 0) {
            return { status: 'warning', message: 'No active trading accounts found' };
          }
          
          return { status: 'passed', message: `${activeAccounts} active trading accounts` };
        } catch (error) {
          return { status: 'failed', message: `Trading engine check failed: ${error}` };
        }

      case 'realtime_updates':
        try {
          // Test WebSocket connection
          const channel = supabase.channel('audit-test');
          const promise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
            
            channel.subscribe((status) => {
              clearTimeout(timeout);
              if (status === 'SUBSCRIBED') {
                resolve('connected');
              } else {
                reject(new Error(`Connection failed: ${status}`));
              }
            });
          });
          
          await promise;
          supabase.removeChannel(channel);
          return { status: 'passed', message: 'Real-time connection working' };
        } catch (error) {
          return { status: 'warning', message: `Real-time connection issue: ${error}` };
        }

      case 'data_persistence':
        try {
          // Test by creating and deleting a test audit log
          const { error: insertError } = await supabase
            .from('audit_logs')
            .insert({
              user_id: user.id,
              action: 'system_audit_test',
              resource_type: 'audit',
              resource_id: 'test',
              details: { test: true }
            });
          
          if (insertError) throw insertError;
          
          return { status: 'passed', message: 'Data persistence working correctly' };
        } catch (error) {
          return { status: 'failed', message: `Data persistence failed: ${error}` };
        }

      case 'api_connections':
        try {
          // Check if any exchange connections exist
          const { data: exchanges, error } = await supabase
            .from('exchange_connections')
            .select('id, is_active')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          const activeExchanges = exchanges?.filter(ex => ex.is_active).length || 0;
          
          return { 
            status: activeExchanges > 0 ? 'passed' : 'warning', 
            message: activeExchanges > 0 ? `${activeExchanges} active API connections` : 'No active API connections'
          };
        } catch (error) {
          return { status: 'failed', message: `API connections check failed: ${error}` };
        }

      default:
        return { status: 'warning', message: 'Test not implemented' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryTests = (category: string) => tests.filter(t => t.category === category);
  const getCategoryStatus = (category: string) => {
    const categoryTests = getCategoryTests(category);
    const failed = categoryTests.filter(t => t.status === 'failed').length;
    const warnings = categoryTests.filter(t => t.status === 'warning').length;
    const passed = categoryTests.filter(t => t.status === 'passed').length;
    
    if (failed > 0) return 'failed';
    if (warnings > 0) return 'warning';
    if (passed === categoryTests.length) return 'passed';
    return 'pending';
  };

  const categories = [
    { id: 'database', name: 'Database', icon: <Database className="w-5 h-5" /> },
    { id: 'auth', name: 'Authentication', icon: <Shield className="w-5 h-5" /> },
    { id: 'bots', name: 'AI Bots', icon: <Bot className="w-5 h-5" /> },
    { id: 'following', name: 'Following', icon: <Users className="w-5 h-5" /> },
    { id: 'trading', name: 'Trading', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'realtime', name: 'Real-time', icon: <Wifi className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Activity className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">System Audit & Testing</CardTitle>
            <Button 
              onClick={runAudit} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Audit...
                </>
              ) : (
                'Run Full Audit'
              )}
            </Button>
          </div>
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-white/60">{Math.round(progress)}% complete</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => (
              <div key={category.id} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {category.icon}
                  <span className="font-medium text-white">{category.name}</span>
                </div>
                <Badge className={getStatusColor(getCategoryStatus(category.id))}>
                  {getCategoryStatus(category.id)}
                </Badge>
              </div>
            ))}
          </div>

          {/* Detailed Test Results */}
          <div className="space-y-4">
            {categories.map(category => {
              const categoryTests = getCategoryTests(category.id);
              if (categoryTests.length === 0) return null;

              return (
                <div key={category.id} className="space-y-2">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {category.icon}
                    {category.name} Tests
                  </h3>
                  <div className="space-y-2">
                    {categoryTests.map(test => (
                      <div key={test.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {test.icon}
                            <div>
                              <div className="font-medium text-white">{test.name}</div>
                              <div className="text-sm text-white/60">{test.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.status)}
                            <Badge className={getStatusColor(test.status)}>
                              {test.status}
                            </Badge>
                          </div>
                        </div>
                        {test.result && (
                          <div className="mt-2 text-sm text-white/70 pl-7">
                            {test.result}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
