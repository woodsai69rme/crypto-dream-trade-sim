
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download,
  FileText,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Zap,
  Target
} from 'lucide-react';
import { useComprehensiveAudit } from '@/hooks/useComprehensiveAudit';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'critical':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Activity className="w-4 h-4 text-blue-500" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const EnhancedComprehensiveTestSuite = () => {
  const { loading, report, runComprehensiveAudit, exportReport, saveToDocumentation } = useComprehensiveAudit();

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enhanced Comprehensive System Audit</h1>
          <p className="text-white/70">Full system analysis, trading simulation, and readiness assessment</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runComprehensiveAudit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {loading ? 'Running Audit...' : 'Start Full Audit'}
          </Button>
          {report && (
            <div className="flex gap-2">
              <Button
                onClick={() => exportReport('json')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={() => exportReport('md')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export MD
              </Button>
              <Button
                onClick={saveToDocumentation}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save to Docs
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="crypto-card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Running comprehensive audit...</p>
                <p className="text-white/60 text-sm">Testing infrastructure, security, trading performance, and real money readiness</p>
                <Progress value={30} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">System Status</p>
                  <p className="text-xl font-bold text-white">{report.systemHealth.goNoGoDecision}</p>
                  <p className="text-sm text-white/60">{report.systemHealth.overallStatus}</p>
                </div>
                {getStatusIcon(report.systemHealth.overallStatus)}
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Security Score</p>
                  <p className="text-xl font-bold text-white">{report.securityAssessment.score}/100</p>
                  <Progress value={report.securityAssessment.score} className="mt-1" />
                </div>
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Win Rate</p>
                  <p className="text-xl font-bold text-white">{formatPercentage(report.profitability.winRate)}</p>
                  <p className="text-sm text-white/60">{report.profitability.totalTrades} trades</p>
                </div>
                <Target className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Real Money Net</p>
                  <p className={`text-xl font-bold ${
                    report.profitability.realMoneyProjection.netAfterFees >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(report.profitability.realMoneyProjection.netAfterFees)}
                  </p>
                  <p className="text-sm text-white/60">After fees</p>
                </div>
                <DollarSign className={`w-6 h-6 ${
                  report.profitability.realMoneyProjection.netAfterFees >= 0 ? 'text-green-400' : 'text-red-400'
                }`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real Money Readiness Alert */}
      {report && (
        <Alert className={`${
          report.realMoneyReadiness.ready 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-red-500/30 bg-red-500/10'
        }`}>
          <Zap className={`h-4 w-4 ${
            report.realMoneyReadiness.ready ? 'text-green-400' : 'text-red-400'
          }`} />
          <AlertTitle className={
            report.realMoneyReadiness.ready ? 'text-green-400' : 'text-red-400'
          }>
            Real Money Trading: {report.realMoneyReadiness.ready ? 'APPROVED ✅' : 'NOT READY ❌'}
          </AlertTitle>
          <AlertDescription className="text-white/70">
            <div className="mt-2">
              <p className="font-medium">Confidence Level: {report.realMoneyReadiness.confidence}%</p>
              {report.realMoneyReadiness.requirements.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Requirements to meet:</p>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {report.realMoneyReadiness.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Report Tabs */}
      {report && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="trading">Trading Analysis</TabsTrigger>
            <TabsTrigger value="security">Security Report</TabsTrigger>
            <TabsTrigger value="projections">Money Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">Audit Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Audit ID:</span>
                      <span className="text-white font-mono text-sm">{report.auditId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Duration:</span>
                      <span className="text-white">{report.duration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Components Tested:</span>
                      <span className="text-white">{report.systemHealth.totalComponents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Trades Simulated:</span>
                      <span className="text-white">{report.profitability.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Completed:</span>
                      <span className="text-white">{new Date(report.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-white/60">System Reliability</span>
                        <span className="text-white">{formatPercentage(report.performanceMetrics.reliability)}</span>
                      </div>
                      <Progress value={report.performanceMetrics.reliability} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-white/60">Trading Accuracy</span>
                        <span className="text-white">{formatPercentage(report.tradingAccuracy.accuracy)}</span>
                      </div>
                      <Progress value={report.tradingAccuracy.accuracy} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-white/60">Security Score</span>
                        <span className="text-white">{report.securityAssessment.score}/100</span>
                      </div>
                      <Progress value={report.securityAssessment.score} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="crypto-card-gradient">
              <CardHeader>
                <CardTitle className="text-white">Component Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{report.systemHealth.healthyCount}</div>
                    <div className="text-sm text-white/60">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{report.systemHealth.warningCount}</div>
                    <div className="text-sm text-white/60">Warning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{report.systemHealth.criticalCount}</div>
                    <div className="text-sm text-white/60">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{report.systemHealth.offlineCount}</div>
                    <div className="text-sm text-white/60">Offline</div>
                  </div>
                </div>

                {report.systemHealth.mainIssues.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Critical Issues</h4>
                    <div className="space-y-2">
                      {report.systemHealth.mainIssues.map((issue, index) => (
                        <div key={index} className="flex items-center gap-2 text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">Trading Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Win Rate</p>
                      <p className="text-white font-bold">{formatPercentage(report.profitability.winRate)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Profit Factor</p>
                      <p className="text-white font-bold">{report.profitability.profitFactor.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Sharpe Ratio</p>
                      <p className="text-white font-bold">{report.profitability.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Max Drawdown</p>
                      <p className="text-red-400 font-bold">{formatPercentage(report.profitability.maxDrawdown)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">Accuracy Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Accuracy</p>
                      <p className="text-white font-bold">{formatPercentage(report.tradingAccuracy.accuracy)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Precision</p>
                      <p className="text-white font-bold">{formatPercentage(report.tradingAccuracy.precision)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">F1 Score</p>
                      <p className="text-white font-bold">{report.tradingAccuracy.f1Score.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Total Signals</p>
                      <p className="text-white font-bold">{report.tradingAccuracy.totalSignals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="crypto-card-gradient">
              <CardHeader>
                <CardTitle className="text-white">Security Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Overall Security Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={report.securityAssessment.score} className="w-32" />
                    <span className="text-white font-bold">{report.securityAssessment.score}/100</span>
                  </div>
                </div>

                {report.securityAssessment.vulnerabilities.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Critical Vulnerabilities</h4>
                    <div className="space-y-2">
                      {report.securityAssessment.vulnerabilities.map((vuln, index) => (
                        <div key={index} className="flex items-center gap-2 text-red-400">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">{vuln}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-white font-medium mb-2">Security Recommendations</h4>
                  <div className="space-y-1">
                    {report.securityAssessment.recommendations.slice(0, 5).map((rec, index) => (
                      <div key={index} className="text-sm text-white/70">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <Card className="crypto-card-gradient">
              <CardHeader>
                <CardTitle className="text-white">Real Money Trading Projections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Paper Trading Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Gross P&L:</span>
                        <span className="text-white">{formatCurrency(report.profitability.realMoneyProjection.wouldHaveMade)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Risk Adjusted (70%):</span>
                        <span className="text-white">{formatCurrency(report.profitability.realMoneyProjection.riskAdjusted)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Fees & Slippage:</span>
                        <span className="text-red-400">-{formatCurrency(report.profitability.realMoneyProjection.fees)}</span>
                      </div>
                      <hr className="border-white/20" />
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Net Real Money:</span>
                        <span className={
                          report.profitability.realMoneyProjection.netAfterFees >= 0 ? 'text-green-400' : 'text-red-400'
                        }>
                          {formatCurrency(report.profitability.realMoneyProjection.netAfterFees)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Annual Projections</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Annualized Return:</span>
                        <span className="text-green-400 font-bold">
                          {formatCurrency(report.profitability.realMoneyProjection.annualizedReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">ROI on $100K:</span>
                        <span className="text-white">
                          {formatPercentage((report.profitability.realMoneyProjection.annualizedReturn / 100000) * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Monthly Income:</span>
                        <span className="text-white">
                          {formatCurrency(report.profitability.realMoneyProjection.annualizedReturn / 12)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className={`${
                  report.profitability.realMoneyProjection.netAfterFees > 10000
                    ? 'border-green-500/30 bg-green-500/10'
                    : report.profitability.realMoneyProjection.netAfterFees > 0
                    ? 'border-yellow-500/30 bg-yellow-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${
                    report.profitability.realMoneyProjection.netAfterFees > 10000 ? 'text-green-400' :
                    report.profitability.realMoneyProjection.netAfterFees > 0 ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                  <AlertTitle className={
                    report.profitability.realMoneyProjection.netAfterFees > 10000 ? 'text-green-400' :
                    report.profitability.realMoneyProjection.netAfterFees > 0 ? 'text-yellow-400' : 'text-red-400'
                  }>
                    Investment Recommendation
                  </AlertTitle>
                  <AlertDescription className="text-white/70">
                    {report.profitability.realMoneyProjection.netAfterFees > 10000 ? (
                      <p>🚀 <strong>HIGHLY RECOMMENDED</strong> - System shows excellent profit potential with strong risk-adjusted returns. Consider starting with conservative position sizing.</p>
                    ) : report.profitability.realMoneyProjection.netAfterFees > 0 ? (
                      <p>⚠️ <strong>CAUTIOUSLY OPTIMISTIC</strong> - Positive returns indicated but monitor performance closely. Start with minimal capital allocation.</p>
                    ) : (
                      <p>❌ <strong>NOT RECOMMENDED</strong> - System shows negative expected returns. Focus on strategy improvement before real money deployment.</p>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
