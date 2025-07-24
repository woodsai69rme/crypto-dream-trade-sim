import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface RiskMetrics {
  totalExposure: number;
  dailyLoss: number;
  positionCount: number;
  maxDrawdown: number;
  volatility: number;
  correlation: number;
}

export const RiskManagementDashboard = () => {
  const { user } = useAuth();
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<RiskMetrics>({
    totalExposure: 0,
    dailyLoss: 0,
    positionCount: 0,
    maxDrawdown: 0,
    volatility: 0,
    correlation: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRiskData();
      const interval = setInterval(fetchRiskData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRiskData = async () => {
    try {
      // Fetch risk alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('risk_monitoring')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false});

      if (alertsError) {
        console.error('Risk alerts error:', alertsError);
        setRiskAlerts([]);
      } else {
        setRiskAlerts(alerts || []);
      }

      // Calculate risk metrics
      const { data: realTrades, error: tradesError } = await supabase
        .from('real_trades')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (tradesError) {
        console.error('Real trades error:', tradesError);
        setMetrics({
          totalExposure: 0,
          dailyLoss: 0,
          positionCount: 0,
          maxDrawdown: 0,
          volatility: 0,
          correlation: 0,
        });
      } else {
        const { data: accounts, error: accountsError } = await supabase
          .from('paper_trading_accounts')
          .select('*')
          .eq('trading_mode', 'live');

        if (accountsError) {
          console.error('Accounts error:', accountsError);
        }

        // Calculate metrics
        const totalExposure = (realTrades || []).reduce((sum: number, trade: any) => sum + (trade.total_value || 0), 0);
        const dailyLoss = (realTrades || []).filter((t: any) => t.total_value < 0).reduce((sum: number, trade: any) => sum + Math.abs(trade.total_value), 0);
        const positionCount = (realTrades || []).filter((t: any) => t.status === 'filled').length;

        setMetrics({
          totalExposure,
          dailyLoss,
          positionCount,
          maxDrawdown: Math.max(...(accounts || []).map((acc: any) => acc.total_pnl_percentage || 0)),
          volatility: 0, // Would need historical data for proper calculation
          correlation: 0, // Would need market data for proper calculation
        });
      }
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskProgress = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  const criticalAlerts = riskAlerts.filter((alert: any) => alert.risk_level === 'critical');

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Risk Alert:</strong> {criticalAlerts.length} critical risk{criticalAlerts.length > 1 ? 's' : ''} detected.
            Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalExposure.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              Across {metrics.positionCount} positions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4" />
              Daily Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${metrics.dailyLoss.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Last 24 hours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.maxDrawdown.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Portfolio peak to trough
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Risk Alerts
            <Badge variant="secondary">{riskAlerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading risk alerts...</div>
          ) : riskAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No active risk alerts. Your trading is within safe parameters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {riskAlerts.map((alert: any) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium capitalize">
                        {alert.risk_type?.replace('_', ' ')} Risk
                      </span>
                      <Badge className={getRiskLevelColor(alert.risk_level)}>
                        {alert.risk_level?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: ${alert.current_value?.toLocaleString()}</span>
                      <span>Threshold: ${alert.threshold_value?.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={getRiskProgress(alert.current_value || 0, alert.threshold_value || 1)}
                      className="h-2"
                    />
                    <div className="text-sm text-muted-foreground">
                      {(((alert.current_value || 0) / (alert.threshold_value || 1)) * 100).toFixed(1)}% of threshold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => {
                // TODO: Implement emergency stop
                console.log('Emergency stop triggered');
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Emergency Stop All Trading
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // TODO: Implement position closure
                console.log('Close all positions');
              }}
            >
              <Activity className="h-4 w-4 mr-2" />
              Close All Positions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};