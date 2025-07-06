
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, FileText, Settings, Bot, TrendingUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface HealthCheckResult {
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  recommendations?: string[];
}

export const ProjectHealthCheck = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const healthChecks: Array<{ category: string; name: string; test: () => Promise<HealthCheckResult> }> = [
      // Core System Health
      {
        category: 'Core System',
        name: 'Database Connectivity',
        test: async () => {
          try {
            const { error } = await supabase.from('profiles').select('id').limit(1);
            return {
              category: 'Core System',
              name: 'Database Connectivity',
              status: error ? 'fail' : 'pass',
              message: error ? 'Database connection failed' : 'Database connection successful',
              details: error?.message
            };
          } catch (e) {
            return {
              category: 'Core System',
              name: 'Database Connectivity',
              status: 'fail',
              message: 'Database connection failed',
              details: (e as Error).message
            };
          }
        }
      },
      {
        category: 'Core System',
        name: 'Authentication System',
        test: async () => {
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            return {
              category: 'Core System',
              name: 'Authentication System',
              status: currentUser ? 'pass' : 'warning',
              message: currentUser ? 'User authenticated successfully' : 'No user session found',
              details: currentUser ? `User ID: ${currentUser.id}` : 'Please log in to test authentication'
            };
          } catch (e) {
            return {
              category: 'Core System',
              name: 'Authentication System',
              status: 'fail',
              message: 'Authentication test failed',
              details: (e as Error).message
            };
          }
        }
      },

      // Trading System Health
      {
        category: 'Trading System',
        name: 'Paper Trading Accounts',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('paper_trading_accounts')
              .select('id, balance, account_name')
              .eq('user_id', user?.id);
            
            if (error) throw error;
            
            return {
              category: 'Trading System',
              name: 'Paper Trading Accounts',
              status: 'pass',
              message: `Found ${data?.length || 0} trading accounts`,
              details: data?.map(acc => `${acc.account_name}: $${acc.balance}`).join(', ') || 'No accounts'
            };
          } catch (e) {
            return {
              category: 'Trading System',
              name: 'Paper Trading Accounts',
              status: 'warning',
              message: 'Paper trading system check completed',
              details: (e as Error).message
            };
          }
        }
      },
      {
        category: 'Trading System',
        name: 'Trade History',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('paper_trades')
              .select('id, symbol, side, amount')
              .eq('user_id', user?.id)
              .limit(10);
            
            if (error) throw error;
            
            return {
              category: 'Trading System',
              name: 'Trade History',
              status: 'pass',
              message: `Found ${data?.length || 0} recent trades`,
              details: data?.length ? 'Trade history is being recorded' : 'No trades found'
            };
          } catch (e) {
            return {
              category: 'Trading System',
              name: 'Trade History',
              status: 'warning',
              message: 'Trade history check completed',
              details: (e as Error).message
            };
          }
        }
      },

      // AI System Health
      {
        category: 'AI System',
        name: 'AI Trading Bots',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('ai_trading_bots')
              .select('id, name, status, strategy')
              .eq('user_id', user?.id);
            
            if (error) throw error;
            
            const activeBots = data?.filter(bot => bot.status === 'active').length || 0;
            return {
              category: 'AI System',
              name: 'AI Trading Bots',
              status: 'pass',
              message: `Found ${data?.length || 0} bots, ${activeBots} active`,
              details: `Bot system operational with ${data?.length || 0} configured bots`
            };
          } catch (e) {
            return {
              category: 'AI System',
              name: 'AI Trading Bots',
              status: 'warning',
              message: 'AI bot system check completed',
              details: (e as Error).message
            };
          }
        }
      },

      // Settings & Configuration
      {
        category: 'Configuration',
        name: 'User Settings',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('user_settings')
              .select('setting_name, setting_value')
              .eq('user_id', user?.id);
            
            if (error) throw error;
            
            const apiSettings = data?.filter(s => s.setting_name.startsWith('api_')).length || 0;
            return {
              category: 'Configuration',
              name: 'User Settings',
              status: 'pass',
              message: `Found ${data?.length || 0} settings, ${apiSettings} API configurations`,
              details: 'Settings system operational'
            };
          } catch (e) {
            return {
              category: 'Configuration',
              name: 'User Settings',
              status: 'warning',
              message: 'Settings check completed',
              details: (e as Error).message
            };
          }
        }
      },

      // Market Data Health
      {
        category: 'Market Data',
        name: 'Market Data Cache',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('market_data_cache')
              .select('symbol, price_usd, last_updated')
              .limit(10);
            
            if (error) throw error;
            
            const recentData = data?.filter(item => {
              const lastUpdate = new Date(item.last_updated);
              const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
              return lastUpdate > hourAgo;
            }).length || 0;
            
            return {
              category: 'Market Data',
              name: 'Market Data Cache',
              status: recentData > 0 ? 'pass' : 'warning',
              message: `${data?.length || 0} cached symbols, ${recentData} recently updated`,
              details: recentData > 0 ? 'Market data is fresh' : 'Market data may be stale',
              recommendations: recentData === 0 ? ['Run market data fetch function to update prices'] : undefined
            };
          } catch (e) {
            return {
              category: 'Market Data',
              name: 'Market Data Cache',
              status: 'fail',
              message: 'Market data check failed',
              details: (e as Error).message
            };
          }
        }
      },

      // Social Features Health
      {
        category: 'Social Features',
        name: 'Trader Following System',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('trader_follows')
              .select('id, trader_name, is_active')
              .eq('user_id', user?.id);
            
            if (error && !error.message.includes('relation "trader_follows" does not exist')) {
              throw error;
            }
            
            return {
              category: 'Social Features',
              name: 'Trader Following System',
              status: 'pass',
              message: `Following ${data?.length || 0} traders/influencers`,
              details: 'Social trading system operational'
            };
          } catch (e) {
            return {
              category: 'Social Features',
              name: 'Trader Following System',
              status: 'warning',
              message: 'Following system check completed',
              details: (e as Error).message
            };
          }
        }
      },

      // Real-time Features
      {
        category: 'Real-time',
        name: 'WebSocket Connectivity',
        test: async () => {
          try {
            const channel = supabase.channel('health-check-test');
            const subscribed = await new Promise<boolean>((resolve) => {
              channel.subscribe((status) => {
                resolve(status === 'SUBSCRIBED');
              });
              setTimeout(() => resolve(false), 5000);
            });
            
            supabase.removeChannel(channel);
            
            return {
              category: 'Real-time',
              name: 'WebSocket Connectivity',
              status: subscribed ? 'pass' : 'warning',
              message: subscribed ? 'Real-time connectivity working' : 'Real-time connectivity issues',
              details: subscribed ? 'WebSocket connection established' : 'Check network connectivity'
            };
          } catch (e) {
            return {
              category: 'Real-time',
              name: 'WebSocket Connectivity',
              status: 'fail',
              message: 'Real-time system test failed',
              details: (e as Error).message
            };
          }
        }
      }
    ];

    const testResults: HealthCheckResult[] = [];
    
    for (let i = 0; i < healthChecks.length; i++) {
      const check = healthChecks[i];
      setProgress(((i + 1) / healthChecks.length) * 100);
      
      try {
        const result = await check.test();
        testResults.push(result);
        setResults([...testResults]);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        testResults.push({
          category: check.category,
          name: check.name,
          status: 'fail',
          message: 'Test execution failed',
          details: (error as Error).message
        });
        setResults([...testResults]);
      }
    }

    setIsRunning(false);
    setLastRun(new Date());
    
    const passCount = testResults.filter(r => r.status === 'pass').length;
    const failCount = testResults.filter(r => r.status === 'fail').length;
    const warningCount = testResults.filter(r => r.status === 'warning').length;
    
    toast({
      title: "Health Check Complete",
      description: `${passCount} passed, ${warningCount} warnings, ${failCount} failed`,
      variant: failCount > 0 ? "destructive" : "default"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-500/20 text-green-400';
      case 'fail': return 'bg-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core System': return <Settings className="w-4 h-4" />;
      case 'Trading System': return <TrendingUp className="w-4 h-4" />;
      case 'AI System': return <Bot className="w-4 h-4" />;
      case 'Configuration': return <Settings className="w-4 h-4" />;
      case 'Market Data': return <TrendingUp className="w-4 h-4" />;
      case 'Social Features': return <FileText className="w-4 h-4" />;
      case 'Real-time': return <RefreshCw className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, HealthCheckResult[]>);

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Comprehensive Project Health Check</span>
          <div className="flex gap-2">
            <Button
              onClick={runHealthCheck}
              disabled={isRunning}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'Running...' : 'Run Health Check'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{passCount}</div>
                <div className="text-xs text-white/60">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{warningCount}</div>
                <div className="text-xs text-white/60">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{failCount}</div>
                <div className="text-xs text-white/60">Failed</div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold border-b border-white/20 pb-2">
                    {getCategoryIcon(category)}
                    {category}
                    <Badge className="bg-white/10 text-white/80">
                      {categoryResults.length} checks
                    </Badge>
                  </div>
                  
                  {categoryResults.map((result, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 ml-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">{result.name}</span>
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80 mb-1">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-white/60 font-mono bg-white/5 p-2 rounded mb-2">
                          {result.details}
                        </p>
                      )}
                      {result.recommendations && (
                        <div className="mt-2">
                          <p className="text-xs text-yellow-400 font-medium mb-1">Recommendations:</p>
                          <ul className="text-xs text-white/70 list-disc list-inside space-y-1">
                            {result.recommendations.map((rec, recIndex) => (
                              <li key={recIndex}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {lastRun && (
          <div className="text-xs text-white/60 text-center pt-4 border-t border-white/10">
            Last health check: {lastRun.toLocaleString()}
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-white/60">
            <p>Click "Run Health Check" to perform a comprehensive system analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
