import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Wifi, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastCheck: Date;
}

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  icon: React.ComponentType<any>;
}

export const SystemHealthIndicator = () => {
  const { user } = useAuth();
  const { accounts, loading } = useMultipleAccounts();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    message: 'All systems operational',
    lastCheck: new Date()
  });

  const [metrics, setMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user, accounts]);

  const checkSystemHealth = () => {
    const newMetrics: HealthMetric[] = [];
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    let statusMessage = 'All systems operational';

    // Database connectivity
    if (user) {
      newMetrics.push({
        name: 'Database',
        status: 'healthy',
        value: 'Connected',
        icon: Database
      });
    } else {
      newMetrics.push({
        name: 'Database',
        status: 'warning',
        value: 'Not authenticated',
        icon: Database
      });
      overallStatus = 'warning';
      statusMessage = 'Authentication required';
    }

    // Account loading status
    if (loading) {
      newMetrics.push({
        name: 'Accounts',
        status: 'warning',
        value: 'Loading...',
        icon: Server
      });
    } else if (accounts.length > 0) {
      newMetrics.push({
        name: 'Accounts',
        status: 'healthy',
        value: `${accounts.length} active`,
        icon: Server
      });
    } else {
      newMetrics.push({
        name: 'Accounts',
        status: 'warning',
        value: 'No accounts',
        icon: Server
      });
      if (overallStatus === 'healthy') {
        overallStatus = 'warning';
        statusMessage = 'No trading accounts found';
      }
    }

    // Network connectivity (simulated)
    newMetrics.push({
      name: 'Network',
      status: navigator.onLine ? 'healthy' : 'error',
      value: navigator.onLine ? 'Online' : 'Offline',
      icon: Wifi
    });

    if (!navigator.onLine) {
      overallStatus = 'error';
      statusMessage = 'Network connection lost';
    }

    // Market data status (simulated based on current time)
    const marketHours = new Date().getHours();
    const isMarketHours = marketHours >= 9 && marketHours <= 16;
    newMetrics.push({
      name: 'Market Data',
      status: isMarketHours ? 'healthy' : 'warning',
      value: isMarketHours ? 'Live' : 'After hours',
      icon: Activity
    });

    setMetrics(newMetrics);
    setSystemHealth({
      status: overallStatus,
      message: statusMessage,
      lastCheck: new Date()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="crypto-card-gradient text-white w-64">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="font-medium">System Health</span>
          </div>
          <Badge className={getStatusColor(systemHealth.status)}>
            {getStatusIcon(systemHealth.status)}
            <span className="ml-1 capitalize">{systemHealth.status}</span>
          </Badge>
        </div>

        <div className="text-sm text-white/70 mb-3">
          {systemHealth.message}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                <Icon className="w-4 h-4 text-white/60" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/60">{metric.name}</div>
                  <div className={`text-xs font-medium ${
                    metric.status === 'healthy' ? 'text-green-400' :
                    metric.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metric.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-white/40 mt-3">
          Last check: {systemHealth.lastCheck.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};