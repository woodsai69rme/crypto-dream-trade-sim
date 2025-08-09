import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Play, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Shield,
  TrendingUp,
  Database,
  Bot,
  Zap
} from 'lucide-react';
import { useSystemAudit } from '@/hooks/useSystemAudit';
import { SimulatedTradingPanel } from './SimulatedTradingPanel';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'critical':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'offline':
      return <XCircle className="w-4 h-4 text-gray-500" />;
    default:
      return <Activity className="w-4 h-4 text-blue-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'offline':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

const getCategoryIcon = (type: string) => {
  switch (type) {
    case 'database':
      return <Database className="w-5 h-5" />;
    case 'market_data':
      return <TrendingUp className="w-5 h-5" />;
    case 'ai_bots':
      return <Bot className="w-5 h-5" />;
    case 'security':
      return <Shield className="w-5 h-5" />;
    case 'exchanges':
      return <Zap className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
  }
};

export const ComprehensiveSystemAudit = () => {
  const { loading, auditRun, results, summary, startAudit, exportAuditReport } = useSystemAudit();
  const [runningAudit, setRunningAudit] = useState(false);

  const handleStartAudit = async () => {
    setRunningAudit(true);
    await startAudit();
    setRunningAudit(false);
  };

  const groupedResults = results.reduce((groups, result) => {
    const type = result.component_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(result);
    return groups;
  }, {} as Record<string, typeof results>);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Infrastructure Audit</h1>
          <p className="text-white/70">Comprehensive crypto trading platform diagnostics</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleStartAudit}
            disabled={loading || runningAudit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {loading || runningAudit ? 'Running Audit...' : 'Start Full Audit'}
          </Button>
          {results.length > 0 && (
            <>
              <Button
                onClick={() => exportAuditReport('json')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button
                onClick={() => exportAuditReport('csv')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {(loading || runningAudit) && (
        <Card className="crypto-card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div>
                <p className="text-white font-medium">Running comprehensive system audit...</p>
                <p className="text-white/60 text-sm">Testing connectivity, security, and data integrity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Overall Status</p>
                  <p className={`text-lg font-bold ${
                    summary.overallStatus === 'healthy' ? 'text-green-400' :
                    summary.overallStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {summary.overallStatus.toUpperCase()}
                  </p>
                </div>
                {getStatusIcon(summary.overallStatus)}
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Security Score</p>
                  <p className="text-lg font-bold text-white">{summary.securityScore}/100</p>
                </div>
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <Progress value={summary.securityScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Components</p>
                  <p className="text-lg font-bold text-white">
                    {summary.healthyCount}/{summary.totalComponents}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Production Ready</p>
                  <Badge className={summary.goNoGoDecision === 'GO' ? 
                    'bg-green-500/20 text-green-400 border-green-500/30' : 
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {summary.goNoGoDecision}
                  </Badge>
                </div>
                {summary.readyForRealMoney ? 
                  <CheckCircle className="w-6 h-6 text-green-400" /> :
                  <XCircle className="w-6 h-6 text-red-400" />
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {summary && summary.mainIssues.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Critical Issues Detected</AlertTitle>
          <AlertDescription className="text-white/70">
            <ul className="mt-2 space-y-1">
              {summary.mainIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {summary && summary.recommendedFixes.length > 0 && (
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-yellow-400">Recommended Fixes</AlertTitle>
          <AlertDescription className="text-white/70">
            <ul className="mt-2 space-y-1">
              {summary.recommendedFixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnostics">System Diagnostics</TabsTrigger>
          <TabsTrigger value="simulation">Live Trading Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics">
          {results.length > 0 && (
            <Card className="crypto-card-gradient">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Detailed Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {Object.keys(groupedResults).map(type => (
                      <TabsTrigger key={type} value={type} className="capitalize">
                        {type.replace('_', ' ')}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(groupedResults).map(([type, items]) => {
                        const healthyCount = items.filter(item => item.status === 'healthy').length;
                        const totalCount = items.length;
                        const healthPercentage = (healthyCount / totalCount) * 100;

                        return (
                          <Card key={type} className="bg-white/5 border-white/10">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(type)}
                                  <h3 className="font-medium text-white capitalize">
                                    {type.replace('_', ' ')}
                                  </h3>
                                </div>
                                <Badge className="bg-white/10 text-white">
                                  {healthyCount}/{totalCount}
                                </Badge>
                              </div>
                              <Progress value={healthPercentage} className="mb-2" />
                              <p className="text-sm text-white/60">
                                {healthPercentage.toFixed(0)}% healthy components
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {Object.entries(groupedResults).map(([type, items]) => (
                    <TabsContent key={type} value={type} className="space-y-4">
                      <div className="space-y-3">
                        {items.map((result, index) => (
                          <Card key={index} className="bg-white/5 border-white/10">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(result.status)}
                                  <h4 className="font-medium text-white">{result.component_name}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  {result.response_time_ms && (
                                    <Badge variant="outline" className="text-white/70 border-white/20">
                                      {result.response_time_ms}ms
                                    </Badge>
                                  )}
                                  <Badge className={getStatusColor(result.status)}>
                                    {result.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              {result.error_details && Object.keys(result.error_details).length > 0 && (
                                <div className="text-sm text-red-300 bg-red-500/10 p-2 rounded mt-2">
                                  {result.error_details.error || JSON.stringify(result.error_details)}
                                </div>
                              )}
                              
                              {result.metadata && Object.keys(result.metadata).length > 0 && (
                                <div className="text-sm text-white/60 mt-2">
                                  <strong>Details:</strong>
                                  <pre className="mt-1 text-xs bg-white/5 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(result.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="simulation">
          <SimulatedTradingPanel auditRunId={auditRun?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
