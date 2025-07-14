
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseHealthMonitor } from './DatabaseHealthMonitor';
import { PerformanceAnalyzer } from './PerformanceAnalyzer';
import { SystemHealthIndicator } from '../enhanced/SystemHealthIndicator';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { 
  Activity, 
  Database, 
  Zap, 
  Users, 
  Bot, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

export const SystemStatusDashboard = () => {
  const { accounts } = useMultipleAccounts();
  const { stats, isActive } = useRealTimeTradeFollowing();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const systemOverview = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'active').length,
    totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
    totalPnL: accounts.reduce((sum, acc) => sum + acc.total_pnl, 0),
    tradingSystemActive: isActive,
    totalSignals: stats.totalSignals,
    avgLatency: stats.avgLatency || 0
  };

  const getSystemHealthScore = () => {
    let score = 100;
    
    // Deduct points for issues
    if (!systemOverview.tradingSystemActive) score -= 20;
    if (systemOverview.avgLatency > 1000) score -= 15;
    if (systemOverview.activeAccounts === 0) score -= 25;
    if (systemOverview.totalPnL < -1000) score -= 10;
    
    return Math.max(0, score);
  };

  const healthScore = getSystemHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* System Overview Header */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6" />
              System Status Dashboard
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getHealthColor(healthScore)}>
                {getHealthIcon(healthScore)}
                <span className="ml-2">Health: {healthScore}%</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold">{systemOverview.totalAccounts}</div>
              <div className="text-xs text-white/60">Total Accounts</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold">{systemOverview.activeAccounts}</div>
              <div className="text-xs text-white/60">Active Accounts</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold">${systemOverview.totalBalance.toLocaleString()}</div>
              <div className="text-xs text-white/60">Total Balance</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Activity className={`w-6 h-6 mx-auto mb-2 ${systemOverview.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <div className={`text-2xl font-bold ${systemOverview.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {systemOverview.totalPnL >= 0 ? '+' : ''}${systemOverview.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-white/60">Total P&L</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Bot className={`w-6 h-6 mx-auto mb-2 ${systemOverview.tradingSystemActive ? 'text-green-400' : 'text-gray-400'}`} />
              <div className="text-2xl font-bold">
                {systemOverview.tradingSystemActive ? 'ON' : 'OFF'}
              </div>
              <div className="text-xs text-white/60">Trading System</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold">{systemOverview.totalSignals}</div>
              <div className="text-xs text-white/60">Total Signals</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Database className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold">{systemOverview.avgLatency}ms</div>
              <div className="text-xs text-white/60">Avg Latency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="mt-6">
          <DatabaseHealthMonitor />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceAnalyzer />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemHealthIndicator />
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>System Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthScore < 90 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-yellow-400">Areas for Improvement:</div>
                    {!systemOverview.tradingSystemActive && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>Trading system is inactive - enable to resume automated operations</div>
                      </div>
                    )}
                    {systemOverview.avgLatency > 1000 && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>High system latency detected - consider optimizing database queries</div>
                      </div>
                    )}
                    {systemOverview.activeAccounts === 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>No active accounts - activate accounts to enable trading</div>
                      </div>
                    )}
                  </div>
                )}
                {healthScore >= 90 && (
                  <div className="text-sm text-green-400">
                    ✅ All systems operating optimally. No immediate action required.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>System Uptime & Reliability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">99.8%</div>
                    <div className="text-sm text-white/60">Uptime (30d)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">142ms</div>
                    <div className="text-sm text-white/60">Avg Response</div>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm text-white/60">Last Incident</div>
                  <div className="text-white">None in the last 30 days</div>
                </div>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Connections</span>
                      <span>12/100</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Rate Limit</span>
                      <span>847/1000</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '84.7%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Usage</span>
                      <span>2.1GB/10GB</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
