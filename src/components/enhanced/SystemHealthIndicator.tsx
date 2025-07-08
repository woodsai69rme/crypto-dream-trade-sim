
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: number;
  unit: string;
  icon: any;
}

export const SystemHealthIndicator = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'API Response', status: 'healthy', value: 98, unit: 'ms', icon: Activity },
    { name: 'Database', status: 'healthy', value: 99.9, unit: '%', icon: Database },
    { name: 'WebSocket', status: 'healthy', value: 100, unit: '%', icon: Wifi },
    { name: 'Server Load', status: 'warning', value: 75, unit: '%', icon: Server }
  ]);

  const [overallStatus, setOverallStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

  useEffect(() => {
    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        status: metric.value > 90 ? 'healthy' : metric.value > 70 ? 'warning' : 'error'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasError = metrics.some(m => m.status === 'error');
    const hasWarning = metrics.some(m => m.status === 'warning');
    
    if (hasError) setOverallStatus('error');
    else if (hasWarning) setOverallStatus('warning');
    else setOverallStatus('healthy');
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Healthy
        </Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Warning
        </Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Error
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                  <span>{metric.name}</span>
                </div>
                <span className="font-medium">
                  {metric.name === 'API Response' ? 
                    `${metric.value.toFixed(0)}${metric.unit}` :
                    `${metric.value.toFixed(1)}${metric.unit}`
                  }
                </span>
              </div>
              <Progress 
                value={metric.value} 
                className={`h-2 ${
                  metric.status === 'healthy' ? '' : 
                  metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
