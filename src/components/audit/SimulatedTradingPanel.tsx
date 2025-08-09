
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useSimulatedTrading } from '@/hooks/useSimulatedTrading';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';

interface SimulatedTradingPanelProps {
  auditRunId?: string;
}

export const SimulatedTradingPanel = ({ auditRunId }: SimulatedTradingPanelProps) => {
  const { accounts } = useMultipleAccounts();
  const { isRunning, results, startSimulation, stopSimulation, exportSimulationData } = useSimulatedTrading();
  const [duration, setDuration] = useState(5); // minutes
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const handleStartSimulation = async () => {
    if (!auditRunId) {
      console.warn('No audit run ID provided');
      return;
    }

    const accountsToUse = selectedAccounts.length > 0 
      ? selectedAccounts 
      : accounts.slice(0, 2).map(acc => acc.id); // Use first 2 accounts if none selected

    await startSimulation(auditRunId, {
      duration,
      accounts: accountsToUse,
      strategies: ['simulated_random'],
      initialBalance: 10000
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Simulated Live Trading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-white">Simulation Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={60}
                disabled={isRunning}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Accounts to Test ({accounts.length} available)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {accounts.slice(0, 3).map((account) => (
                  <Badge
                    key={account.id}
                    variant="outline"
                    className={`cursor-pointer transition-colors ${
                      selectedAccounts.includes(account.id)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'text-white/70 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (selectedAccounts.includes(account.id)) {
                        setSelectedAccounts(prev => prev.filter(id => id !== account.id));
                      } else {
                        setSelectedAccounts(prev => [...prev, account.id]);
                      }
                    }}
                  >
                    {account.account_name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleStartSimulation}
              disabled={isRunning || !auditRunId}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Simulation
            </Button>
            
            {isRunning && (
              <Button
                onClick={stopSimulation}
                variant="destructive"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}

            {results && (
              <Button
                onClick={exportSimulationData}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {!auditRunId && (
            <Alert className="border-yellow-500/30 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-white/70">
                Please start a system audit first to enable simulation tracking
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isRunning && (
        <Card className="crypto-card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Simulation Running...</p>
                <p className="text-white/60 text-sm">Executing real-time paper trades with live market data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card className="crypto-card-gradient">
          <CardHeader>
            <CardTitle className="text-white">Simulation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="trades">Trade Log</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Total Trades</p>
                          <p className="text-xl font-bold text-white">{results.totalTrades}</p>
                        </div>
                        <Target className="w-5 h-5 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Success Rate</p>
                          <p className="text-xl font-bold text-white">
                            {((results.successfulTrades / results.totalTrades) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Activity className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Total P&L</p>
                          <p className={`text-xl font-bold ${
                            results.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(results.totalPnL)}
                          </p>
                        </div>
                        {results.totalPnL >= 0 ? 
                          <TrendingUp className="w-5 h-5 text-green-400" /> :
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Avg Latency</p>
                          <p className="text-xl font-bold text-white">{results.averageLatency}ms</p>
                        </div>
                        <Clock className="w-5 h-5 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/70">Success Rate</span>
                      <span className="text-white font-medium">
                        {((results.successfulTrades / results.totalTrades) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(results.successfulTrades / results.totalTrades) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Profitable Trades</p>
                      <p className="text-green-400 font-medium">
                        {results.trades.filter(t => t.pnl > 0).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Loss Trades</p>
                      <p className="text-red-400 font-medium">
                        {results.trades.filter(t => t.pnl < 0).length}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trades" className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.trades.slice(-20).reverse().map((trade, index) => (
                    <Card key={index} className="bg-white/5 border-white/10">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={trade.success ? 
                              'bg-green-500/20 text-green-400' : 
                              'bg-red-500/20 text-red-400'
                            }>
                              {trade.success ? '✓' : '✗'}
                            </Badge>
                            <div>
                              <span className="text-white font-medium">{trade.symbol}</span>
                              <span className={`ml-2 text-sm ${
                                trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {trade.side.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(trade.pnl)}
                            </p>
                            <p className="text-white/60 text-xs">{trade.latency}ms</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
