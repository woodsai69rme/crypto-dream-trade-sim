
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Zap, TrendingDown, Activity } from "lucide-react";

interface RiskMetrics {
  account_id: string;
  account_name: string;
  current_drawdown: number;
  max_drawdown_limit: number;
  daily_loss: number;
  daily_loss_limit: number;
  position_concentration: number;
  correlation_risk: number;
  volatility_exposure: number;
  risk_score: number;
}

interface RiskAlert {
  id: string;
  account_id: string;
  type: 'drawdown' | 'correlation' | 'volatility' | 'position_size';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  auto_action: string | null;
}

export const AdvancedRiskManager = () => {
  const { accounts } = useMultipleAccounts();
  const { toast } = useToast();
  
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [riskSettings, setRiskSettings] = useState({
    autoStopEnabled: true,
    maxDrawdownPercent: 15,
    maxDailyLossPercent: 5,
    maxCorrelation: 0.8,
    emergencyStopAll: false
  });
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Calculate real-time risk metrics for each account
  const calculateRiskMetrics = useCallback(() => {
    const metrics: RiskMetrics[] = accounts.map(account => {
      // Simulate realistic risk calculations
      const currentDrawdown = Math.abs(account.total_pnl) / account.initial_balance * 100;
      const dailyLoss = Math.random() * 3; // 0-3% daily loss simulation
      const positionConcentration = Math.random() * 40 + 20; // 20-60% concentration
      const correlationRisk = Math.random() * 0.9; // 0-0.9 correlation
      const volatilityExposure = Math.random() * 60 + 20; // 20-80% volatility exposure
      
      // Calculate overall risk score (0-100)
      const riskScore = Math.min(100, 
        (currentDrawdown / riskSettings.maxDrawdownPercent * 30) +
        (dailyLoss / riskSettings.maxDailyLossPercent * 25) +
        (positionConcentration / 60 * 20) +
        (correlationRisk / 0.9 * 15) +
        (volatilityExposure / 80 * 10)
      );

      return {
        account_id: account.id,
        account_name: account.account_name,
        current_drawdown: currentDrawdown,
        max_drawdown_limit: riskSettings.maxDrawdownPercent,
        daily_loss: dailyLoss,
        daily_loss_limit: riskSettings.maxDailyLossPercent,
        position_concentration: positionConcentration,
        correlation_risk: correlationRisk,
        volatility_exposure: volatilityExposure,
        risk_score: riskScore
      };
    });

    setRiskMetrics(metrics);

    // Generate risk alerts based on metrics
    const alerts: RiskAlert[] = [];
    metrics.forEach(metric => {
      if (metric.current_drawdown > metric.max_drawdown_limit * 0.8) {
        alerts.push({
          id: `alert-${Date.now()}-${metric.account_id}`,
          account_id: metric.account_id,
          type: 'drawdown',
          severity: metric.current_drawdown > metric.max_drawdown_limit ? 'critical' : 'high',
          message: `${metric.account_name}: Drawdown at ${metric.current_drawdown.toFixed(1)}% (limit: ${metric.max_drawdown_limit}%)`,
          timestamp: new Date().toISOString(),
          auto_action: metric.current_drawdown > metric.max_drawdown_limit ? 'stop_trading' : null
        });
      }

      if (metric.correlation_risk > riskSettings.maxCorrelation) {
        alerts.push({
          id: `alert-${Date.now()}-corr-${metric.account_id}`,
          account_id: metric.account_id,
          type: 'correlation',
          severity: 'medium',
          message: `${metric.account_name}: High correlation risk detected (${(metric.correlation_risk * 100).toFixed(0)}%)`,
          timestamp: new Date().toISOString(),
          auto_action: null
        });
      }

      if (metric.risk_score > 80) {
        alerts.push({
          id: `alert-${Date.now()}-risk-${metric.account_id}`,
          account_id: metric.account_id,
          type: 'position_size',
          severity: 'high',
          message: `${metric.account_name}: Overall risk score critical (${metric.risk_score.toFixed(0)}/100)`,
          timestamp: new Date().toISOString(),
          auto_action: riskSettings.autoStopEnabled ? 'reduce_positions' : null
        });
      }
    });

    setRiskAlerts(prev => [...alerts, ...prev.slice(0, 10)]);

    // Execute auto-actions
    alerts.forEach(alert => {
      if (alert.auto_action && riskSettings.autoStopEnabled) {
        executeAutoAction(alert);
      }
    });
  }, [accounts, riskSettings]);

  const executeAutoAction = async (alert: RiskAlert) => {
    switch (alert.auto_action) {
      case 'stop_trading':
        toast({
          title: "Auto-Stop Triggered",
          description: `Trading stopped for ${alert.account_id} due to drawdown limit`,
          variant: "destructive",
        });
        break;
      case 'reduce_positions':
        toast({
          title: "Position Reduction",
          description: `Reducing positions for ${alert.account_id} due to high risk`,
        });
        break;
    }
  };

  const handleEmergencyStop = async () => {
    setRiskSettings(prev => ({ ...prev, emergencyStopAll: true }));
    
    toast({
      title: "EMERGENCY STOP ACTIVATED",
      description: "All trading activities have been halted across all accounts",
      variant: "destructive",
    });

    // Log emergency stop
    console.log('EMERGENCY STOP: All trading halted at', new Date().toISOString());
  };

  const handleResumeTrading = () => {
    setRiskSettings(prev => ({ ...prev, emergencyStopAll: false }));
    
    toast({
      title: "Trading Resumed",
      description: "Normal trading operations have resumed",
    });
  };

  // Monitor risk metrics every 5 seconds
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(calculateRiskMetrics, 5000);
    return () => clearInterval(interval);
  }, [isMonitoring, calculateRiskMetrics]);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    if (score < 80) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/20 text-blue-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Management Controls */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced Risk Management
            <Badge className={`ml-auto ${isMonitoring ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Auto Risk Management</span>
              <Switch 
                checked={riskSettings.autoStopEnabled}
                onCheckedChange={(checked) => 
                  setRiskSettings(prev => ({ ...prev, autoStopEnabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/80">Risk Monitoring</span>
              <Switch 
                checked={isMonitoring}
                onCheckedChange={setIsMonitoring}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleEmergencyStop}
              disabled={riskSettings.emergencyStopAll}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Emergency Stop All
            </Button>

            {riskSettings.emergencyStopAll && (
              <Button
                onClick={handleResumeTrading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Resume Trading
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Risk Metrics */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Account Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetrics.map((metric) => (
              <div key={metric.account_id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{metric.account_name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Risk Score:</span>
                    <span className={`font-bold ${getRiskColor(metric.risk_score)}`}>
                      {metric.risk_score.toFixed(0)}/100
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <Progress 
                    value={metric.risk_score} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Drawdown:</span>
                    <div className={`font-medium ${metric.current_drawdown > metric.max_drawdown_limit * 0.8 ? 'text-red-400' : 'text-white'}`}>
                      {metric.current_drawdown.toFixed(1)}% / {metric.max_drawdown_limit}%
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-white/60">Daily Loss:</span>
                    <div className="font-medium text-white">
                      {metric.daily_loss.toFixed(1)}% / {metric.daily_loss_limit}%
                    </div>
                  </div>

                  <div>
                    <span className="text-white/60">Concentration:</span>
                    <div className="font-medium text-white">
                      {metric.position_concentration.toFixed(0)}%
                    </div>
                  </div>

                  <div>
                    <span className="text-white/60">Correlation:</span>
                    <div className={`font-medium ${metric.correlation_risk > riskSettings.maxCorrelation ? 'text-orange-400' : 'text-white'}`}>
                      {(metric.correlation_risk * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div>
                    <span className="text-white/60">Volatility:</span>
                    <div className="font-medium text-white">
                      {metric.volatility_exposure.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Alerts ({riskAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {riskAlerts.length === 0 ? (
              <div className="text-center py-4 text-white/60">
                No risk alerts - All systems operating within normal parameters
              </div>
            ) : (
              riskAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-white/60">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-white mb-1">{alert.message}</div>
                  {alert.auto_action && (
                    <div className="text-xs text-blue-400">
                      Auto-action: {alert.auto_action.replace('_', ' ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
