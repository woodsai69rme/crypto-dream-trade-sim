import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealTrading } from '@/hooks/useRealTrading';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { RealTradingPanel } from '@/components/RealTradingPanel';
import { 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Activity, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

export const RealTradingDashboard = () => {
  const { accounts, currentAccount } = useMultipleAccounts();
  const { credentials, riskAlerts, fetchCredentials, fetchRiskAlerts } = useRealTrading();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCredentials();
    fetchRiskAlerts();
  }, [fetchCredentials, fetchRiskAlerts]);

  // Calculate trading readiness score
  const calculateReadinessScore = () => {
    let score = 0;
    const factors = [];

    // Has active mainnet credentials (40 points)
    const hasMainnetCreds = credentials.some(c => c.is_active && !c.is_testnet);
    if (hasMainnetCreds) {
      score += 40;
      factors.push('✓ Active mainnet credentials');
    } else {
      factors.push('✗ No active mainnet credentials');
    }

    // Account configured for live trading (30 points)
    const hasLiveAccount = currentAccount?.trading_mode === 'live';
    if (hasLiveAccount) {
      score += 30;
      factors.push('✓ Live trading account configured');
    } else {
      factors.push('✗ No live trading account');
    }

    // No critical risk alerts (20 points)
    const hasCriticalAlerts = riskAlerts.some(alert => 
      alert.risk_level === 'critical' && alert.alert_triggered
    );
    if (!hasCriticalAlerts) {
      score += 20;
      factors.push('✓ No critical risk alerts');
    } else {
      factors.push('✗ Critical risk alerts present');
    }

    // Emergency stop not active (10 points)
    const emergencyStopActive = currentAccount?.emergency_stop;
    if (!emergencyStopActive) {
      score += 10;
      factors.push('✓ Emergency stop not active');
    } else {
      factors.push('✗ Emergency stop is active');
    }

    return { score, factors };
  };

  const { score: readinessScore, factors: readinessFactors } = calculateReadinessScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  // Live trading statistics
  const liveAccounts = accounts.filter(acc => acc.trading_mode === 'live');
  const activeLiveAccounts = liveAccounts.filter(acc => !acc.emergency_stop);
  const totalLiveBalance = liveAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header with Readiness Score */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Real Trading Dashboard
            <Badge className={`${readinessScore >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {readinessScore >= 80 ? 'Ready' : 'Not Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Readiness Score */}
            <div className={`p-4 rounded-lg ${getScoreBackground(readinessScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Trading Readiness</span>
                <span className={`text-2xl font-bold ${getScoreColor(readinessScore)}`}>
                  {readinessScore}%
                </span>
              </div>
              <Progress value={readinessScore} className="mb-3" />
              <div className="space-y-1">
                {readinessFactors.map((factor, index) => (
                  <div key={index} className="text-xs text-white/70">
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Accounts Summary */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/80">Live Accounts</span>
              </div>
              <div className="text-2xl font-bold mb-1">{liveAccounts.length}</div>
              <div className="text-xs text-white/60">
                {activeLiveAccounts.length} active • {liveAccounts.length - activeLiveAccounts.length} stopped
              </div>
              <div className="text-xs text-green-400 mt-1">
                Total Value: ${totalLiveBalance.toLocaleString()}
              </div>
            </div>

            {/* Risk Status */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white/80">Risk Alerts</span>
              </div>
              <div className="text-2xl font-bold mb-1">{riskAlerts.length}</div>
              <div className="text-xs text-white/60">
                {riskAlerts.filter(a => a.risk_level === 'critical').length} critical • 
                {riskAlerts.filter(a => a.risk_level === 'high').length} high
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Status */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Exchange Credentials Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['deribit', 'binance', 'coinbase', 'okx'].map(exchange => {
              const testnetCred = credentials.find(c => 
                c.exchange_name === exchange && c.is_testnet && c.is_active
              );
              const mainnetCred = credentials.find(c => 
                c.exchange_name === exchange && !c.is_testnet && c.is_active
              );

              return (
                <div key={exchange} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium capitalize">{exchange}</span>
                    <div className="flex gap-1">
                      {testnetCred ? (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      {mainnetCred ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Testnet:</span>
                      <span className={testnetCred ? 'text-blue-400' : 'text-gray-400'}>
                        {testnetCred ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Mainnet:</span>
                      <span className={mainnetCred ? 'text-green-400' : 'text-red-400'}>
                        {mainnetCred ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {mainnetCred && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Daily Limit:</span>
                        <span className="text-white">${mainnetCred.daily_limit}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {credentials.slice(0, 5).map(cred => (
                    <div key={cred.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="font-medium">{cred.exchange_name}</div>
                        <div className="text-xs text-white/60">
                          {cred.is_testnet ? 'Testnet' : 'Mainnet'} • 
                          {cred.is_active ? ' Active' : ' Inactive'}
                        </div>
                      </div>
                      <div className="text-xs text-white/60">
                        {cred.last_used ? new Date(cred.last_used).toLocaleDateString() : 'Never used'}
                      </div>
                    </div>
                  ))}
                  {credentials.length === 0 && (
                    <div className="text-center text-white/60 py-8">
                      No credentials configured yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Risk Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['critical', 'high', 'medium', 'low'].map(level => {
                    const count = riskAlerts.filter(alert => alert.risk_level === level).length;
                    const color = level === 'critical' ? 'text-red-400' : 
                                 level === 'high' ? 'text-orange-400' :
                                 level === 'medium' ? 'text-yellow-400' : 'text-green-400';
                    
                    return (
                      <div key={level} className="flex items-center justify-between">
                        <span className="capitalize text-white/80">{level} Risk</span>
                        <Badge className={`${level === 'critical' ? 'bg-red-500/20 text-red-400' :
                                          level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                          level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                          'bg-green-500/20 text-green-400'}`}>
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading">
          <RealTradingPanel />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Risk Management Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">Account Risk Limits</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Daily Loss Limit:</span>
                      <span className="ml-2">${currentAccount?.daily_loss_limit || 1000}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Max Position %:</span>
                      <span className="ml-2">{currentAccount?.max_position_percentage || 10}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">Safety Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Two-Factor Auth:</span>
                      <span className={currentAccount?.two_factor_enabled ? 'text-green-400' : 'text-red-400'}>
                        {currentAccount?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Emergency Stop:</span>
                      <span className={currentAccount?.emergency_stop ? 'text-red-400' : 'text-green-400'}>
                        {currentAccount?.emergency_stop ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-4">Paper vs Live Trading Comparison</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-white/80 mb-2">Paper Trading</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Accounts:</span>
                          <span>{accounts.filter(acc => acc.trading_mode !== 'live').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Value:</span>
                          <span>${accounts.filter(acc => acc.trading_mode !== 'live').reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Avg P&L:</span>
                          <span className="text-green-400">+{accounts.filter(acc => acc.trading_mode !== 'live').reduce((sum, acc) => sum + acc.total_pnl_percentage, 0) / Math.max(1, accounts.filter(acc => acc.trading_mode !== 'live').length)}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-white/80 mb-2">Live Trading</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Accounts:</span>
                          <span>{liveAccounts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Value:</span>
                          <span>${totalLiveBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Avg P&L:</span>
                          <span className={liveAccounts.length > 0 ? 'text-green-400' : 'text-white/60'}>
                            {liveAccounts.length > 0 
                              ? `+${liveAccounts.reduce((sum, acc) => sum + acc.total_pnl_percentage, 0) / liveAccounts.length}%`
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};