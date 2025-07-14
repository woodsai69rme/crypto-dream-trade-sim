
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Database, AlertTriangle, CheckCircle, RefreshCw, Activity } from 'lucide-react';

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'critical';
  connectionStatus: boolean;
  queryPerformance: number;
  errorCount: number;
  lastError: string | null;
  recentErrors: Array<{
    timestamp: string;
    error: string;
    query: string;
  }>;
}

export const DatabaseHealthMonitor = () => {
  const [health, setHealth] = useState<DatabaseHealth>({
    status: 'healthy',
    connectionStatus: true,
    queryPerformance: 0,
    errorCount: 0,
    lastError: null,
    recentErrors: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkDatabaseHealth = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const { data: connectionTest, error: connectionError } = await supabase
        .from('paper_trading_accounts')
        .select('id')
        .limit(1);

      const queryTime = Date.now() - startTime;
      
      if (connectionError) {
        setHealth(prev => ({
          ...prev,
          status: 'critical',
          connectionStatus: false,
          lastError: connectionError.message,
          errorCount: prev.errorCount + 1,
          recentErrors: [
            { timestamp: new Date().toISOString(), error: connectionError.message, query: 'paper_trading_accounts connectivity test' },
            ...prev.recentErrors.slice(0, 9)
          ]
        }));
        return;
      }

      // Check for problematic market data queries
      const { data: marketData, error: marketError } = await supabase
        .from('market_data_cache')
        .select('symbol, last_updated')
        .order('last_updated', { ascending: false })
        .limit(5);

      const status = queryTime > 2000 ? 'warning' : 'healthy';
      
      setHealth({
        status,
        connectionStatus: true,
        queryPerformance: queryTime,
        errorCount: marketError ? health.errorCount + 1 : health.errorCount,
        lastError: marketError?.message || null,
        recentErrors: marketError ? [
          { timestamp: new Date().toISOString(), error: marketError.message, query: 'market_data_cache query' },
          ...health.recentErrors.slice(0, 9)
        ] : health.recentErrors
      });

    } catch (error) {
      setHealth(prev => ({
        ...prev,
        status: 'critical',
        connectionStatus: false,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        errorCount: prev.errorCount + 1
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkDatabaseHealth();
    
    const interval = setInterval(() => {
      checkDatabaseHealth();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Health Monitor
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDatabaseHealth}
            disabled={isRefreshing}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(health.status)}
            <span className="font-medium">Database Status</span>
          </div>
          <Badge className={getStatusColor(health.status)}>
            {health.status.toUpperCase()}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-sm text-white/60">Connection</div>
            <div className={`font-bold ${health.connectionStatus ? 'text-green-400' : 'text-red-400'}`}>
              {health.connectionStatus ? 'Active' : 'Failed'}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-sm text-white/60">Query Time</div>
            <div className={`font-bold ${health.queryPerformance > 2000 ? 'text-yellow-400' : 'text-green-400'}`}>
              {health.queryPerformance}ms
            </div>
          </div>
        </div>

        {/* Error Information */}
        {health.lastError && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-400">
              <div className="font-medium">Latest Error:</div>
              <div className="text-sm mt-1">{health.lastError}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Errors */}
        {health.recentErrors.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80">Recent Errors ({health.errorCount} total)</div>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {health.recentErrors.slice(0, 3).map((error, index) => (
                <div key={index} className="bg-red-500/10 p-2 rounded text-xs">
                  <div className="text-red-400 font-medium">{new Date(error.timestamp).toLocaleTimeString()}</div>
                  <div className="text-white/80">{error.query}</div>
                  <div className="text-white/60 truncate">{error.error}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Recommendations */}
        {health.status !== 'healthy' && (
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <div className="text-sm font-medium text-blue-400 mb-2">Recommendations:</div>
            <ul className="text-xs text-white/80 space-y-1">
              {health.queryPerformance > 2000 && <li>• Query performance is slow - consider database optimization</li>}
              {health.errorCount > 5 && <li>• High error count detected - investigate data integrity issues</li>}
              {!health.connectionStatus && <li>• Database connection failed - check network and credentials</li>}
              {health.lastError?.includes('uuid') && <li>• UUID parsing errors detected - validate market data format</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
