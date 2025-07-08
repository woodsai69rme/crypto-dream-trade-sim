
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { useAITradingBots } from '@/hooks/useAITradingBots';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Bot, Users, TrendingUp } from 'lucide-react';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  accounts: {
    total: number;
    active: number;
    trading: number;
    lastActivity: string;
  };
  tradeFollowing: {
    status: 'active' | 'inactive';
    signalsProcessed: number;
    executionRate: number;
    avgLatency: number;
  };
  aiBots: {
    total: number;
    active: number;
    tradesExecuted: number;
    performance: number;
  };
  database: {
    connection: 'connected' | 'disconnected';
    lastSync: string;
    auditEntries: number;
  };
}

export const SystemHealthMonitor = () => {
  const { user } = useAuth();
  const { accounts } = useMultipleAccounts();
  const { isActive, stats, totalAccounts, activeAccounts } = useRealTimeTradeFollowing();
  const { bots, activeBots } = useAITradingBots();
  
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'healthy',
    accounts: { total: 0, active: 0, trading: 0, lastActivity: 'Never' },
    tradeFollowing: { status: 'inactive', signalsProcessed: 0, executionRate: 0, avgLatency: 0 },
    aiBots: { total: 0, active: 0, tradesExecuted: 0, performance: 0 },
    database: { connection: 'connected', lastSync: 'Never', auditEntries: 0 }
  });
  
  const [refreshing, setRefreshing] = useState(false);

  const assessSystemHealth = async () => {
    try {
      setRefreshing(true);

      // Check database connectivity and recent audit entries
      const { data: auditData, error: auditError } = await supabase
        .from('comprehensive_audit')
        .select('id, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Check recent trading activity
      const { data: recentTrades, error: tradesError } = await supabase
        .from('paper_trades')
        .select('id, created_at, account_id')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const tradingAccounts = accounts.filter(acc => {
        const hasRecentTrades = recentTrades?.some(trade => trade.account_id === acc.id);
        return hasRecentTrades;
      });

      // Calculate AI bot performance
      const activeBotCount = Array.from(activeBots).length;
      const totalBotTrades = bots.reduce((sum, bot) => sum + bot.performance.total_trades, 0);
      const avgBotPerformance = bots.length > 0 
        ? bots.reduce((sum, bot) => sum + bot.performance.total_return, 0) / bots.length 
        : 0;

      // Calculate execution rate
      const executionRate = stats.totalSignals > 0 ? (stats.executedTrades / stats.totalSignals) * 100 : 0;

      // Determine overall health
      let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (auditError || tradesError) {
        overallHealth = 'critical';
      } else if (
        !isActive || 
        tradingAccounts.length === 0 || 
        activeBotCount === 0 || 
        executionRate < 50
      ) {
        overallHealth = 'warning';
      }

      const newHealth: SystemHealth = {
        overall: overallHealth,
        accounts: {
          total: totalAccounts,
          active: activeAccounts,
          trading: tradingAccounts.length,
          lastActivity: recentTrades?.[0]?.created_at 
            ? new Date(recentTrades[0].created_at).toLocaleTimeString()
            : 'Never'
        },
        tradeFollowing: {
          status: isActive ? 'active' : 'inactive',
          signalsProcessed: stats.totalSignals,
          executionRate: Math.round(executionRate),
          avgLatency: stats.avgLatency
        },
        aiBots: {
          total: bots.length,
          active: activeBotCount,
          tradesExecuted: totalBotTrades,
          performance: Math.round(avgBotPerformance)
        },
        database: {
          connection: auditError ? 'disconnected' : 'connected',
          lastSync: auditData?.[0]?.created_at 
            ? new Date(auditData[0].created_at).toLocaleTimeString()
            : 'Never',
          auditEntries: auditData?.length || 0
        }
      };

      setHealth(newHealth);
      
      // Log health check to audit
      await supabase
        .from('comprehensive_audit')
        .insert({
          user_id: user?.id,
          action_type: 'system_health_check',
          entity_type: 'system_monitor',
          entity_id: 'health_check',
          metadata: {
            health_status: newHealth,
            timestamp: new Date().toISOString()
          } as any
        });

    } catch (error) {
      console.error('Error assessing system health:', error);
      setHealth(prev => ({ ...prev, overall: 'critical' }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    assessSystemHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(assessSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [user, accounts, isActive, stats, bots, activeBots]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return Activity;
    }
  };

  const HealthIcon = getHealthIcon(health.overall);

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HealthIcon className={`w-5 h-5 ${getHealthColor(health.overall)}`} />
          System Health Monitor
          <Badge className={`ml-auto ${
            health.overall === 'healthy' ? 'bg-green-500/20 text-green-400' :
            health.overall === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {health.overall.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium">System Status</h3>
            <p className="text-sm text-white/60">
              {health.overall === 'healthy' ? 'All systems operational' :
               health.overall === 'warning' ? 'Some issues detected' :
               'Critical issues require attention'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={assessSystemHealth}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Accounts */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium">Trading Accounts</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Total Accounts:</span>
                <span>{health.accounts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active:</span>
                <span className="text-green-400">{health.accounts.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Currently Trading:</span>
                <span className="text-purple-400">{health.accounts.trading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last Activity:</span>
                <span>{health.accounts.lastActivity}</span>
              </div>
            </div>
          </div>

          {/* Trade Following */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <h4 className="font-medium">Trade Following</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <Badge className={health.tradeFollowing.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
                }>
                  {health.tradeFollowing.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Signals Processed:</span>
                <span>{health.tradeFollowing.signalsProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Execution Rate:</span>
                <span>{health.tradeFollowing.executionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Avg Latency:</span>
                <span>{health.tradeFollowing.avgLatency}ms</span>
              </div>
            </div>
          </div>

          {/* AI Bots */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-purple-400" />
              <h4 className="font-medium">AI Trading Bots</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Total Bots:</span>
                <span>{health.aiBots.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active:</span>
                <span className="text-green-400">{health.aiBots.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Trades Executed:</span>
                <span>{health.aiBots.tradesExecuted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Avg Performance:</span>
                <span className={health.aiBots.performance >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {health.aiBots.performance >= 0 ? '+' : ''}{health.aiBots.performance}%
                </span>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="font-medium">Database</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Connection:</span>
                <Badge className={health.database.connection === 'connected' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
                }>
                  {health.database.connection}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last Sync:</span>
                <span>{health.database.lastSync}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Audit Entries:</span>
                <span>{health.database.auditEntries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Recommendations */}
        {health.overall !== 'healthy' && (
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <h4 className="font-medium text-yellow-200 mb-2">Recommendations</h4>
            <ul className="text-sm text-yellow-200/80 space-y-1">
              {!isActive && <li>• Activate trade following to start automated trading</li>}
              {health.accounts.trading === 0 && <li>• No accounts are currently trading - check account settings</li>}
              {health.aiBots.active === 0 && <li>• No AI bots are active - enable bots for automated trading</li>}
              {health.tradeFollowing.executionRate < 50 && <li>• Low execution rate - check account balances and settings</li>}
              {health.database.connection === 'disconnected' && <li>• Database connection issues - check network connectivity</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
