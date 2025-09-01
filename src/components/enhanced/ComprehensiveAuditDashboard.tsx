
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComprehensiveAudit, type AccountSummary, type AuditEntry, type AuditFilters } from '@/hooks/useComprehensiveAudit';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Shield, Zap } from 'lucide-react';

export const ComprehensiveAuditDashboard = () => {
  const { 
    loading, 
    report, 
    auditEntries, 
    accountSummaries, 
    filters,
    runComprehensiveAudit, 
    exportReport, 
    saveToDocumentation 
  } = useComprehensiveAudit();

  const [activeTab, setActiveTab] = useState('overview');

  const handleRunAudit = async () => {
    try {
      await runComprehensiveAudit();
    } catch (error) {
      console.error('Audit failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-500 text-white'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-semibold mt-4">Running Comprehensive System Audit</h2>
          <p className="text-gray-600 mt-2">This may take several minutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Comprehensive Audit Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleRunAudit} disabled={loading}>
            <Activity className="w-4 h-4 mr-2" />
            Run Full Audit
          </Button>
          {report && (
            <>
              <Button variant="outline" onClick={() => exportReport('json')}>
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => exportReport('csv')}>
                Export CSV
              </Button>
              <Button variant="outline" onClick={saveToDocumentation}>
                Save to Docs
              </Button>
            </>
          )}
        </div>
      </div>

      {report && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <CheckCircle className={`h-4 w-4 ${getStatusColor(report.systemHealth.overallStatus)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.systemHealth.overallStatus.toUpperCase()}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.systemHealth.healthyCount}/{report.systemHealth.totalComponents} components healthy
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trading Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.tradingAccuracy.accuracy.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {report.tradingAccuracy.correctSignals}/{report.tradingAccuracy.totalSignals} successful trades
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profitability</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${report.profitability.netPnL.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.profitability.winRate.toFixed(1)}% win rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                  <Shield className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.securityAssessment.score}/100</div>
                  <p className="text-xs text-muted-foreground">
                    {report.securityAssessment.vulnerabilities.length} critical issues
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Real Money Readiness Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Readiness</span>
                    <Badge className={report.realMoneyReadiness.ready ? 'bg-green-500' : 'bg-red-500'}>
                      {report.realMoneyReadiness.ready ? 'READY' : 'NOT READY'}
                    </Badge>
                  </div>
                  <Progress value={report.realMoneyReadiness.confidence} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Confidence: {report.realMoneyReadiness.confidence}%
                  </p>
                  {report.realMoneyReadiness.requirements.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Requirements to meet:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {report.realMoneyReadiness.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-600">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trading Accuracy Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Accuracy</p>
                      <p className="text-2xl font-bold">{report.tradingAccuracy.accuracy.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Precision</p>
                      <p className="text-2xl font-bold">{report.tradingAccuracy.precision.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recall</p>
                      <p className="text-2xl font-bold">{report.tradingAccuracy.recall.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">F1 Score</p>
                      <p className="text-2xl font-bold">{report.tradingAccuracy.f1Score.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profitability Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total P&L</p>
                      <p className={`text-2xl font-bold ${report.profitability.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${report.profitability.netPnL.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Win Rate</p>
                      <p className="text-2xl font-bold">{report.profitability.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sharpe Ratio</p>
                      <p className="text-2xl font-bold">{report.profitability.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Max Drawdown</p>
                      <p className="text-2xl font-bold text-red-600">{report.profitability.maxDrawdown.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Real Money Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Paper P&L</p>
                    <p className="text-lg font-semibold">${report.profitability.realMoneyProjection.wouldHaveMade.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Risk Adjusted</p>
                    <p className="text-lg font-semibold">${report.profitability.realMoneyProjection.riskAdjusted.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">After Fees</p>
                    <p className="text-lg font-semibold">${report.profitability.realMoneyProjection.netAfterFees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Annual Projection</p>
                    <p className="text-lg font-semibold">${report.profitability.realMoneyProjection.annualizedReturn.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Security Score</span>
                    <span className="text-2xl font-bold">{report.securityAssessment.score}/100</span>
                  </div>
                  <Progress value={report.securityAssessment.score} className="w-full" />
                  
                  {report.securityAssessment.vulnerabilities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Critical Vulnerabilities</h4>
                      <ul className="space-y-1">
                        {report.securityAssessment.vulnerabilities.map((vuln, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                            {vuln}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Security Recommendations</h4>
                    <ul className="space-y-1">
                      {report.securityAssessment.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountSummaries.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <Badge variant="outline">{account.status}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Balance</p>
                        <p>${account.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">P&L</p>
                        <p className={account.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${account.pnl.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Total Value</p>
                        <p>${account.totalValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Holdings</p>
                        <p>{account.holdings?.length || 0} assets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityBadge(entry.severity)}>
                          {entry.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{entry.component}</p>
                          <p className="text-sm text-gray-600">{entry.message}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
