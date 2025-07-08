
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Database,
  Wifi,
  Server,
  Shield
} from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: number;
  unit?: string;
  icon: React.ElementType;
}

export const SystemHealthIndicator = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { name: 'Database', status: 'healthy', value: 99.9, unit: '%', icon: Database },
    { name: 'API Response', status: 'healthy', value: 45, unit: 'ms', icon: Activity },
    { name: 'WebSocket', status: 'healthy', value: 100, unit: '%', icon: Wifi },
    { name: 'Server Load', status: 'warning', value: 75, unit: '%', icon: Server },
    { name: 'Security', status: 'healthy', value: 100, unit: '%', icon: Shield }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthChecks(prev => prev.map(check => ({
        ...check,
        value: check.name === 'API Response' 
          ? Math.random() * 100 + 20
          : check.value + (Math.random() - 0.5) * 2
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const overallHealth = healthChecks.every(check => check.status === 'healthy') 
    ? 'healthy' 
    : healthChecks.some(check => check.status === 'error') 
    ? 'error' 
    : 'warning';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">System Health</h3>
        <div className="flex items-center gap-2">
          {getStatusIcon(overallHealth)}
          <Badge variant={overallHealth === 'healthy' ? 'default' : 'destructive'}>
            {overallHealth === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3">
        {healthChecks.map((check, index) => {
          const IconComponent = check.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{check.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">
                  {check.value.toFixed(check.unit === 'ms' ? 0 : 1)}{check.unit}
                </span>
                {getStatusIcon(check.status)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
