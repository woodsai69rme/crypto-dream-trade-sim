import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, AlertTriangle, TrendingUp, TrendingDown, 
  Target, DollarSign, Percent, BarChart3, Activity,
  Zap, CheckCircle, Clock, Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  betaCoefficient: number;
  valueAtRisk: number;
  conditionalVaR: number;
  winRate: number;
  profitFactor: number;
  calmarRatio: number;
  sortinoRatio: number;
}

interface PortfolioAllocation {
  symbol: string;
  percentage: number;
  value: number;
  risk: 'low' | 'medium' | 'high';
  color: string;
}

export const RiskManagementDashboard = () => {
  const { accounts, currentAccount } = useMultipleAccounts();
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    sharpeRatio: 1.85,
    maxDrawdown: -8.3,
    volatility: 24.5,
    betaCoefficient: 1.12,
    valueAtRisk: -2.1,
    conditionalVaR: -3.8,
    winRate: 68.4,
    profitFactor: 2.3,
    calmarRatio: 0.95,
    sortinoRatio: 2.1
  });

  const [allocation, setAllocation] = useState<PortfolioAllocation[]>([
    { symbol: 'BTC', percentage: 40, value: 4000, risk: 'medium', color: '#f7931a' },
    { symbol: 'ETH', percentage: 30, value: 3000, risk: 'medium', color: '#627eea' },
    { symbol: 'SOL', percentage: 15, value: 1500, risk: 'high', color: '#9945ff' },
    { symbol: 'BNB', percentage: 10, value: 1000, risk: 'low', color: '#f3ba2f' },
    { symbol: 'ADA', percentage: 5, value: 500, risk: 'medium', color: '#0033ad' }
  ]);

  const [correlationMatrix, setCorrelationMatrix] = useState([
    { asset: 'BTC', btc: 1.00, eth: 0.85, sol: 0.72, bnb: 0.68, ada: 0.61 },
    { asset: 'ETH', btc: 0.85, eth: 1.00, sol: 0.79, bnb: 0.71, ada: 0.64 },
    { asset: 'SOL', btc: 0.72, eth: 0.79, sol: 1.00, bnb: 0.58, ada: 0.55 },
    { asset: 'BNB', btc: 0.68, eth: 0.71, sol: 0.58, bnb: 1.00, ada: 0.62 },
    { asset: 'ADA', btc: 0.61, eth: 0.64, sol: 0.55, bnb: 0.62, ada: 1.00 }
  ]);

  const drawdownData = [
    { date: '2024-01', drawdown: 0 },
    { date: '2024-02', drawdown: -2.1 },
    { date: '2024-03', drawdown: -1.5 },
    { date: '2024-04', drawdown: -5.8 },
    { date: '2024-05', drawdown: -3.2 },
    { date: '2024-06', drawdown: -8.3 },
    { date: '2024-07', drawdown: -4.1 }
  ];

  const getRiskColor = (value: number, type: 'sharpe' | 'drawdown' | 'volatility' | 'winrate') => {
    switch (type) {
      case 'sharpe':
        return value > 1.5 ? 'text-green-400' : value > 1 ? 'text-yellow-400' : 'text-red-400';
      case 'drawdown':
        return value > -5 ? 'text-green-400' : value > -10 ? 'text-yellow-400' : 'text-red-400';
      case 'volatility':
        return value < 20 ? 'text-green-400' : value < 30 ? 'text-yellow-400' : 'text-red-400';
      case 'winrate':
        return value > 60 ? 'text-green-400' : value > 50 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[risk];
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview Header */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <div>
                <CardTitle className="text-xl">Risk Management Dashboard</CardTitle>
                <p className="text-white/60 mt-1">
                  Portfolio: {currentAccount?.account_name || 'No Account Selected'} • 
                  Balance: ${currentAccount?.balance.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400">
              Risk Score: 7.2/10
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Key Risk Metrics */}
        <div className="lg:col-span-3 space-y-6">
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Sharpe Ratio</p>
                    <p className={`text-2xl font-bold ${getRiskColor(riskMetrics.sharpeRatio, 'sharpe')}`}>
                      {riskMetrics.sharpeRatio}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-xs text-white/40 mt-2">Risk-adjusted return</p>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Max Drawdown</p>
                    <p className={`text-2xl font-bold ${getRiskColor(riskMetrics.maxDrawdown, 'drawdown')}`}>
                      {riskMetrics.maxDrawdown}%
                    </p>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-xs text-white/40 mt-2">Peak-to-trough loss</p>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Win Rate</p>
                    <p className={`text-2xl font-bold ${getRiskColor(riskMetrics.winRate, 'winrate')}`}>
                      {riskMetrics.winRate}%
                    </p>
                  </div>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-white/40 mt-2">Successful trades</p>
              </CardContent>
            </Card>

            <Card className="crypto-card-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Volatility</p>
                    <p className={`text-2xl font-bold ${getRiskColor(riskMetrics.volatility, 'volatility')}`}>
                      {riskMetrics.volatility}%
                    </p>
                  </div>
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs text-white/40 mt-2">Price fluctuation</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics">Advanced Metrics</TabsTrigger>
              <TabsTrigger value="allocation">Portfolio Allocation</TabsTrigger>
              <TabsTrigger value="correlation">Correlation</TabsTrigger>
              <TabsTrigger value="scenarios">Stress Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-white/60">Value at Risk (5%)</p>
                      <p className="text-xl font-bold text-red-400">{riskMetrics.valueAtRisk}%</p>
                      <p className="text-xs text-white/40">Daily potential loss</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Conditional VaR</p>
                      <p className="text-xl font-bold text-red-400">{riskMetrics.conditionalVaR}%</p>
                      <p className="text-xs text-white/40">Expected tail loss</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Beta Coefficient</p>
                      <p className="text-xl font-bold text-blue-400">{riskMetrics.betaCoefficient}</p>
                      <p className="text-xs text-white/40">Market correlation</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Profit Factor</p>
                      <p className="text-xl font-bold text-green-400">{riskMetrics.profitFactor}</p>
                      <p className="text-xs text-white/40">Gross profit/loss ratio</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Calmar Ratio</p>
                      <p className="text-xl font-bold text-yellow-400">{riskMetrics.calmarRatio}</p>
                      <p className="text-xs text-white/40">Return/max drawdown</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Sortino Ratio</p>
                      <p className="text-xl font-bold text-green-400">{riskMetrics.sortinoRatio}</p>
                      <p className="text-xs text-white/40">Downside deviation</p>
                    </div>
                  </div>

                  {/* Drawdown Chart */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Drawdown Analysis</h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={drawdownData}>
                          <XAxis dataKey="date" stroke="#ffffff40" />
                          <YAxis stroke="#ffffff40" />
                          <Line 
                            type="monotone" 
                            dataKey="drawdown" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            fill="#ef444420"
                            fillOpacity={0.3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4">
              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Portfolio Allocation & Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Allocation Chart */}
                    <div>
                      <h4 className="font-semibold mb-4">Asset Allocation</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={allocation}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="percentage"
                            >
                              {allocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Asset Details */}
                    <div>
                      <h4 className="font-semibold mb-4">Asset Breakdown</h4>
                      <div className="space-y-3">
                        {allocation.map(asset => (
                          <div key={asset.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: asset.color }}
                              />
                              <div>
                                <p className="font-medium">{asset.symbol}</p>
                                <p className="text-xs text-white/60">${asset.value.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{asset.percentage}%</p>
                              <Badge className={getRiskBadge(asset.risk)}>
                                {asset.risk}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Asset Correlation Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Asset</th>
                          {correlationMatrix[0] && Object.keys(correlationMatrix[0]).slice(1).map(key => (
                            <th key={key} className="text-center p-2">{key.toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {correlationMatrix.map(row => (
                          <tr key={row.asset}>
                            <td className="p-2 font-medium">{row.asset}</td>
                             {Object.entries(row).slice(1).map(([key, value]) => {
                               const numValue = Number(value);
                               return (
                                 <td key={key} className="text-center p-2">
                                   <span className={`px-2 py-1 rounded text-xs ${
                                     numValue === 1.00 ? 'bg-blue-500/20 text-blue-400' :
                                     numValue > 0.8 ? 'bg-red-500/20 text-red-400' :
                                     numValue > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                                     'bg-green-500/20 text-green-400'
                                   }`}>
                                     {numValue.toFixed(2)}
                                   </span>
                                 </td>
                               );
                             })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-white/60 mt-4">
                    <strong>High correlation ({'>'}0.8)</strong> indicates assets move together, reducing diversification benefits.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              <Card className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Stress Test Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <h4 className="font-semibold text-red-400 mb-2">🐻 Bear Market (-50%)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Portfolio Impact:</span>
                          <span className="text-red-400">-$4,150</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recovery Time:</span>
                          <span>~8 months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Drawdown:</span>
                          <span className="text-red-400">-41.5%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="font-semibold text-yellow-400 mb-2">⚡ Flash Crash (-20%)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Portfolio Impact:</span>
                          <span className="text-yellow-400">-$1,660</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recovery Time:</span>
                          <span>~2 months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Drawdown:</span>
                          <span className="text-yellow-400">-16.6%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-2">🌪️ High Volatility</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>VaR Increase:</span>
                          <span className="text-purple-400">+150%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily Range:</span>
                          <span>±15-25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sharpe Ratio:</span>
                          <span className="text-purple-400">0.65</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">🏛️ Regulatory Event</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Portfolio Impact:</span>
                          <span className="text-blue-400">-$830</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Liquidity Risk:</span>
                          <span>High</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recovery Time:</span>
                          <span>~4 months</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">💡 Risk Mitigation Recommendations</h4>
                    <ul className="text-sm space-y-1 text-white/80">
                      <li>• Consider increasing stablecoin allocation to 20% for defensive positioning</li>
                      <li>• Implement trailing stops for positions showing {'>'}30% gains</li>
                      <li>• Reduce SOL allocation to 10% to lower portfolio volatility</li>
                      <li>• Set up correlation-based rebalancing triggers</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Risk Alerts & Controls */}
        <div className="space-y-4">
          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="text-xs text-yellow-400 font-medium">High Correlation Warning</p>
                <p className="text-xs text-white/60 mt-1">BTC-ETH correlation: 0.85</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-xs text-red-400 font-medium">Drawdown Alert</p>
                <p className="text-xs text-white/60 mt-1">SOL position down 12%</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <p className="text-xs text-blue-400 font-medium">Rebalancing Due</p>
                <p className="text-xs text-white/60 mt-1">Allocation drift detected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Risk Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Position Size Limit</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Daily Loss Limit</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Leverage Usage</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card-gradient text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                Emergency Stop Loss
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Auto Rebalance
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Export Risk Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};