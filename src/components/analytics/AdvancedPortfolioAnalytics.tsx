
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, Tooltip, Legend } from "recharts";
import { TrendingUp, BarChart3, Target, Zap, Brain, AlertTriangle } from "lucide-react";

interface CorrelationData {
  asset1: string;
  asset2: string;
  correlation: number;
  risk: 'low' | 'medium' | 'high';
}

interface AISignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  timestamp: string;
  status: 'active' | 'executed' | 'expired';
}

export const AdvancedPortfolioAnalytics = () => {
  const { currentAccount } = useMultipleAccounts();
  const { performanceData, metrics } = usePerformanceAnalytics(currentAccount?.id);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [aiSignals, setAiSignals] = useState<AISignal[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    generateCorrelationData();
    generateAISignals();
  }, [currentAccount]);

  const generateCorrelationData = () => {
    const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    const correlations: CorrelationData[] = [];
    
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const correlation = Math.random() * 2 - 1; // -1 to 1
        correlations.push({
          asset1: assets[i],
          asset2: assets[j],
          correlation: Math.round(correlation * 100) / 100,
          risk: Math.abs(correlation) > 0.7 ? 'high' : Math.abs(correlation) > 0.4 ? 'medium' : 'low'
        });
      }
    }
    setCorrelationData(correlations);
  };

  const generateAISignals = () => {
    const signals: AISignal[] = [
      {
        id: '1',
        symbol: 'BTC',
        action: 'buy',
        confidence: 85,
        reasoning: 'Strong bullish momentum detected with RSI oversold conditions',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'active'
      },
      {
        id: '2',
        symbol: 'ETH',
        action: 'sell',
        confidence: 72,
        reasoning: 'Resistance level reached, potential reversal pattern forming',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'executed'
      },
      {
        id: '3',
        symbol: 'SOL',
        action: 'hold',
        confidence: 65,
        reasoning: 'Consolidation phase, waiting for breakout confirmation',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'active'
      }
    ];
    setAiSignals(signals);
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.5) return 'text-red-400';
    if (correlation > 0.2) return 'text-yellow-400';
    if (correlation > -0.2) return 'text-green-400';
    if (correlation > -0.5) return 'text-blue-400';
    return 'text-purple-400';
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-500/20 text-green-400';
      case 'sell': return 'bg-red-500/20 text-red-400';
      case 'hold': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const riskMetrics = [
    { name: 'Value at Risk (95%)', value: '$2,450', change: -5.2 },
    { name: 'Expected Shortfall', value: '$3,780', change: -3.1 },
    { name: 'Beta vs Market', value: '1.23', change: 0.08 },
    { name: 'Treynor Ratio', value: '0.145', change: 0.02 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Advanced Analytics & AI</h2>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="correlation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
          <TabsTrigger value="ai-signals">AI Signals</TabsTrigger>
          <TabsTrigger value="risk-metrics">Risk Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="correlation" className="space-y-4">
          <Card className="crypto-card-gradient text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Asset Correlation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {correlationData.map((corr, index) => (
                  <div key={index} className="p-4 rounded-lg bg-card/20 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{corr.asset1} / {corr.asset2}</span>
                      <Badge className={
                        corr.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                        corr.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {corr.risk}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getCorrelationColor(corr.correlation)}`}>
                      {corr.correlation > 0 ? '+' : ''}{corr.correlation}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {corr.correlation > 0.5 ? 'High positive correlation' :
                       corr.correlation > 0.2 ? 'Moderate positive correlation' :
                       corr.correlation > -0.2 ? 'Low correlation' :
                       corr.correlation > -0.5 ? 'Moderate negative correlation' :
                       'High negative correlation'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-signals" className="space-y-4">
          <Card className="crypto-card-gradient text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI-Generated Trading Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiSignals.map((signal) => (
                  <div key={signal.id} className="p-4 rounded-lg bg-card/20 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-lg">{signal.symbol}</div>
                        <Badge className={getSignalColor(signal.action)}>
                          {signal.action.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {signal.confidence}% confidence
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm mb-3">{signal.reasoning}</div>
                    <div className="flex justify-between items-center">
                      <Badge variant={signal.status === 'active' ? 'default' : 'secondary'}>
                        {signal.status.toUpperCase()}
                      </Badge>
                      {signal.status === 'active' && (
                        <Button size="sm" className="ml-auto">
                          Execute Signal
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riskMetrics.map((metric, index) => (
              <Card key={index} className="crypto-card-gradient text-primary-foreground">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className={`text-sm flex items-center ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="crypto-card-gradient text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="font-medium text-red-400 mb-2">High Risk Alert</div>
                  <div className="text-sm">
                    BTC and ETH show high correlation (0.85). Consider diversifying to reduce portfolio risk.
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="font-medium text-yellow-400 mb-2">Medium Risk Warning</div>
                  <div className="text-sm">
                    Portfolio beta is above 1.2, indicating higher volatility than market average.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="crypto-card-gradient text-primary-foreground">
            <CardHeader>
              <CardTitle>Performance vs Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Portfolio" />
                    <Line type="monotone" dataKey="benchmark" stroke="#ef4444" strokeWidth={2} name="Benchmark" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
