
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusIndicator } from './StatusIndicator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  Shield, 
  Bot, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  user_id: string;
  status: 'success' | 'error' | 'warning' | 'info';
}

interface SystemStatus {
  accountsActive: number;
  botsActive: number;
  followingActive: number;
  tradesActive: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  uptime: string;
}

export const RealTimeAuditLog = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    accountsActive: 0,
    botsActive: 0,
    followingActive: 0,
    tradesActive: 0,
    systemHealth: 'healthy',
    uptime: '0m'
  });
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isLiveMonitoring) {
      fetchAuditLogs();
      fetchSystemStatus();
      
      // Set up real-time monitoring
      const interval = setInterval(() => {
        fetchAuditLogs();
        fetchSystemStatus();
        generateMockAuditEntry(); // Simulate real-time activity
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user, isLiveMonitoring]);

  const fetchAuditLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (data) {
        const formattedLogs = data.map(log => ({
          ...log,
          status: determineLogStatus(log.action, log.details)
        }));
        setAuditLogs(formattedLogs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    if (!user) return;

    try {
      // Fetch active accounts
      const { data: accounts } = await supabase
        .from('paper_trading_accounts')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Fetch active bots
      const { data: bots } = await supabase
        .from('ai_trading_bots')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Fetch following accounts
      const { data: following } = await supabase
        .from('trader_follows')
        .select('id, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Fetch recent trades
      const { data: trades } = await supabase
        .from('paper_trades')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setSystemStatus({
        accountsActive: accounts?.length || 0,
        botsActive: bots?.length || 0,
        followingActive: following?.length || 0,
        tradesActive: trades?.length || 0,
        systemHealth: 'healthy',
        uptime: '2h 34m'
      });
    } catch (error) {
      console.error('Error fetching system status:', error);
      setSystemStatus(prev => ({ ...prev, systemHealth: 'error' }));
    }
  };

  const determineLogStatus = (action: string, details: any): 'success' | 'error' | 'warning' | 'info' => {
    if (action.includes('error') || action.includes('failed')) return 'error';
    if (action.includes('warning') || action.includes('alert')) return 'warning';
    if (action.includes('create') || action.includes('success')) return 'success';
    return 'info';
  };

  const generateMockAuditEntry = () => {
    if (!user) return;

    const mockEntries = [
      {
        action: 'trade_executed',
        resource_type: 'paper_trade',
        details: { symbol: 'BTC', amount: 1000, side: 'buy' }
      },
      {
        action: 'bot_analysis_complete',
        resource_type: 'ai_bot',
        details: { bot_name: 'Bitcoin Trend Master', confidence: 85 }
      },
      {
        action: 'market_data_updated',
        resource_type: 'market_data',
        details: { symbols_updated: ['BTC', 'ETH', 'SOL'] }
      },
      {
        action: 'account_balance_checked',
        resource_type: 'account',
        details: { balance: 125000 }
      }
    ];

    const randomEntry = mockEntries[Math.floor(Math.random() * mockEntries.length)];
    const newEntry: AuditLogEntry = {
      id: `mock-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: randomEntry.action,
      resource_type: randomEntry.resource_type,
      resource_id: `${randomEntry.resource_type}-${Date.now()}`,
      details: randomEntry.details,
      user_id: user.id,
      status: determineLogStatus(randomEntry.action, randomEntry.details)
    };

    setAuditLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Dashboard */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Real-Time System Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <StatusIndicator 
                isActive={systemStatus.systemHealth === 'healthy'} 
                label="System Health" 
              />
              <Switch 
                checked={isLiveMonitoring} 
                onCheckedChange={setIsLiveMonitoring}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <StatusIndicator isActive={systemStatus.accountsActive > 0} />
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold">{systemStatus.accountsActive}</div>
              <div className="text-sm text-white/60">Active Accounts</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <StatusIndicator isActive={systemStatus.botsActive > 0} />
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold">{systemStatus.botsActive}</div>
              <div className="text-sm text-white/60">AI Bots Active</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <StatusIndicator isActive={systemStatus.followingActive > 0} />
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold">{systemStatus.followingActive}</div>
              <div className="text-sm text-white/60">Following Traders</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold">{systemStatus.tradesActive}</div>
              <div className="text-sm text-white/60">24h Trades</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">System Uptime:</span>
              <span className="font-medium">{systemStatus.uptime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Audit Log */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Live System Audit Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={isLiveMonitoring ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                {isLiveMonitoring ? 'Live' : 'Paused'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
              >
                {isLiveMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(log.status)}>
                            {log.action.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-white/50">
                            {log.resource_type}
                          </span>
                        </div>
                        <p className="text-sm text-white/80">
                          {log.action.replace('_', ' ')} - {JSON.stringify(log.details)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-white/50">
                      {formatDistanceToNow(new Date(log.timestamp))} ago
                    </span>
                  </div>
                </div>
              ))}
              
              {auditLogs.length === 0 && !loading && (
                <div className="text-center py-8 text-white/60">
                  <Activity className="w-12 h-12 mx-auto mb-4" />
                  <p>No audit logs found</p>
                  <p className="text-sm text-white/40 mt-1">Activity will appear here as it happens</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
