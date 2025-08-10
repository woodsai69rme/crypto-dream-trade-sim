
import { useState } from 'react';
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Database,
  Download
} from 'lucide-react';
import { useComprehensiveSystemTest } from '@/hooks/useComprehensiveSystemTest';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'fail':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-blue-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pass':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'fail':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

export const ComprehensiveTestSuite = () => {
  const { 
    testResults, 
    profitabilityAnalysis, 
    fullReport, 
    testing, 
    runComprehensiveTest 
  } = useComprehensiveSystemTest();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const copyReportToClipboard = () => {
    navigator.clipboard.writeText(fullReport);
  };

  const downloadReport = () => {
    const blob = new Blob([fullReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive-audit-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Comprehensive System Test & Audit</h1>
          <p className="text-white/70">Full system analysis, profitability assessment, and recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runComprehensiveTest}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {testing ? 'Running Tests...' : 'Start Full Test'}
          </Button>
          {fullReport && (
            <>
              <Button
                onClick={downloadReport}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </>
          )}
        </div>
      </div>

      {testing && (
        <Card className="crypto-card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Running comprehensive system test...</p>
                <p className="text-white/60 text-sm">Testing infrastructure, trading accuracy, and profitability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Test Results</p>
                  <p className="text-xl font-bold text-white">{passedTests}/{totalTests}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <Progress value={passRate} className="mt-2" />
              <p className="text-sm text-white/60 mt-1">{passRate.toFixed(1)}% passed</p>
            </CardContent>
          </Card>

          {profitabilityAnalysis && (
            <>
              <Card className="crypto-card-gradient">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Win Rate</p>
                      <p className="text-xl font-bold text-white">{profitabilityAnalysis.winRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card-gradient">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Real Money P&L</p>
                      <p className={`text-xl font-bold ${
                        profitabilityAnalysis.realMoneyProjection.netAfterFees >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(profitabilityAnalysis.realMoneyProjection.netAfterFees)}
                      </p>
                    </div>
                    {profitabilityAnalysis.realMoneyProjection.netAfterFees >= 0 ? 
                      <TrendingUp className="w-6 h-6 text-green-400" /> :
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    }
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card-gradient">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Sharpe Ratio</p>
                      <p className="text-xl font-bold text-white">{profitabilityAnalysis.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {profitabilityAnalysis && (
        <Alert className={`${
          profitabilityAnalysis.realMoneyProjection.netAfterFees > 0 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-red-500/30 bg-red-500/10'
        }`}>
          <DollarSign className={`h-4 w-4 ${
            profitabilityAnalysis.realMoneyProjection.netAfterFees > 0 ? 'text-green-400' : 'text-red-400'
          }`} />
          <AlertTitle className={
            profitabilityAnalysis.realMoneyProjection.netAfterFees > 0 ? 'text-green-400' : 'text-red-400'
          }>
            Real Money Trading Projection
          </AlertTitle>
          <AlertDescription className="text-white/70">
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-70">Paper Trading</p>
                <p className="font-medium">{formatCurrency(profitabilityAnalysis.realMoneyProjection.wouldHaveMade)}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Risk Adjusted (70%)</p>
                <p className="font-medium">{formatCurrency(profitabilityAnalysis.realMoneyProjection.riskAdjusted)}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Fees & Slippage</p>
                <p className="font-medium text-red-400">-{formatCurrency(profitabilityAnalysis.realMoneyProjection.fees)}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Net Result</p>
                <p className={`font-bold ${
                  profitabilityAnalysis.realMoneyProjection.netAfterFees >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(profitabilityAnalysis.realMoneyProjection.netAfterFees)}
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="report">Full Report</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testResults.map((result, index) => (
            <Card key={index} className="crypto-card-gradient">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <h4 className="font-medium text-white">{result.component}</h4>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-white/70 text-sm mb-2">{result.details}</p>
                <p className="text-white/50 text-xs">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          {profitabilityAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">Trading Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Total Trades</p>
                      <p className="text-white font-bold">{profitabilityAnalysis.totalTrades.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Win Rate</p>
                      <p className="text-green-400 font-bold">{profitabilityAnalysis.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Profit Factor</p>
                      <p className="text-white font-bold">{profitabilityAnalysis.profitFactor.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Max Drawdown</p>
                      <p className="text-red-400 font-bold">{profitabilityAnalysis.maxDrawdown.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">Trade Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Average Win</p>
                      <p className="text-green-400 font-bold">{formatCurrency(profitabilityAnalysis.averageWin)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Average Loss</p>
                      <p className="text-red-400 font-bold">-{formatCurrency(profitabilityAnalysis.averageLoss)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Largest Win</p>
                      <p className="text-green-400 font-bold">{formatCurrency(profitabilityAnalysis.largestWin)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Largest Loss</p>
                      <p className="text-red-400 font-bold">-{formatCurrency(profitabilityAnalysis.largestLoss)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">System Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profitabilityAnalysis && (
                <div className="space-y-4">
                  <Alert className="border-blue-500/30 bg-blue-500/10">
                    <AlertTriangle className="h-4 w-4 text-blue-400" />
                    <AlertTitle className="text-blue-400">Performance Assessment</AlertTitle>
                    <AlertDescription className="text-white/70">
                      <div className="mt-2 space-y-2">
                        {profitabilityAnalysis.winRate >= 60 ? (
                          <p>✅ Win rate is excellent ({profitabilityAnalysis.winRate.toFixed(1)}%). Continue current strategies.</p>
                        ) : (
                          <p>⚠️ Win rate needs improvement ({profitabilityAnalysis.winRate.toFixed(1)}%). Consider strategy refinements.</p>
                        )}
                        
                        {profitabilityAnalysis.sharpeRatio >= 1.0 ? (
                          <p>✅ Risk-adjusted returns are good (Sharpe: {profitabilityAnalysis.sharpeRatio.toFixed(2)}).</p>
                        ) : (
                          <p>⚠️ Risk management needs improvement (Sharpe: {profitabilityAnalysis.sharpeRatio.toFixed(2)}). Implement better risk controls.</p>
                        )}
                        
                        {profitabilityAnalysis.maxDrawdown <= 20 ? (
                          <p>✅ Maximum drawdown is within acceptable limits ({profitabilityAnalysis.maxDrawdown.toFixed(1)}%).</p>
                        ) : (
                          <p>❌ Maximum drawdown is concerning ({profitabilityAnalysis.maxDrawdown.toFixed(1)}%). Implement stricter stop-losses.</p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className={`${
                    profitabilityAnalysis.realMoneyProjection.netAfterFees > 0
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-yellow-500/30 bg-yellow-500/10'
                  }`}>
                    <DollarSign className={`h-4 w-4 ${
                      profitabilityAnalysis.realMoneyProjection.netAfterFees > 0 ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                    <AlertTitle className={
                      profitabilityAnalysis.realMoneyProjection.netAfterFees > 0 ? 'text-green-400' : 'text-yellow-400'
                    }>
                      Real Money Trading Recommendation
                    </AlertTitle>
                    <AlertDescription className="text-white/70">
                      {profitabilityAnalysis.realMoneyProjection.netAfterFees > 5000 ? (
                        <p>🚀 <strong>HIGHLY PROFITABLE</strong> - System would have generated significant profits. Ready for real money trading with proper risk management.</p>
                      ) : profitabilityAnalysis.realMoneyProjection.netAfterFees > 0 ? (
                        <p>✅ <strong>PROFITABLE</strong> - System shows positive returns after fees. Start with small positions and scale up gradually.</p>
                      ) : (
                        <p>⚠️ <strong>MARGINAL</strong> - Consider strategy improvements before real money trading. Focus on reducing costs and improving win rate.</p>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Full Audit Report
                <div className="flex gap-2">
                  <Button
                    onClick={copyReportToClipboard}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={downloadReport}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fullReport ? (
                <div className="bg-black/20 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono">
                    {fullReport}
                  </pre>
                </div>
              ) : (
                <p className="text-white/60">Run the comprehensive test to generate a full report.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
