import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { type PaperAccount } from "@/hooks/useMultipleAccounts";
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, 
  Target, Award, AlertTriangle, Activity 
} from "lucide-react";

interface AccountComparisonProps {
  accountIds: string[];
  accounts: PaperAccount[];
  onClose: () => void;
}

export const AccountComparison = ({ accountIds, accounts, onClose }: AccountComparisonProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'balance' | 'pnl' | 'percentage'>('balance');
  
  const selectedAccounts = accounts.filter(acc => accountIds.includes(acc.id));
  
  if (selectedAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No accounts selected for comparison</p>
      </div>
    );
  }

  // Prepare data for charts
  const comparisonData = selectedAccounts.map(account => ({
    name: account.account_name,
    balance: account.balance,
    pnl: account.total_pnl,
    pnl_percentage: account.total_pnl_percentage,
    initial_balance: account.initial_balance,
    risk_level: account.risk_level,
    account_type: account.account_type,
    color: account.color_theme
  }));

  const totalValue = selectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPnL = selectedAccounts.reduce((sum, acc) => sum + acc.total_pnl, 0);
  const avgReturn = selectedAccounts.reduce((sum, acc) => sum + acc.total_pnl_percentage, 0) / selectedAccounts.length;

  const pieData = selectedAccounts.map(account => ({
    name: account.account_name,
    value: account.balance,
    color: account.color_theme
  }));

  const riskDistribution = selectedAccounts.reduce((acc, account) => {
    acc[account.risk_level] = (acc[account.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeDistribution = selectedAccounts.reduce((acc, account) => {
    acc[account.account_type] = (acc[account.account_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Return</p>
                <p className={`text-xl font-bold ${avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-muted-foreground">Accounts</p>
                <p className="text-xl font-bold">{selectedAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Account Performance Comparison
                  <div className="flex gap-2">
                    <Button
                      variant={selectedMetric === 'balance' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('balance')}
                    >
                      Balance
                    </Button>
                    <Button
                      variant={selectedMetric === 'pnl' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('pnl')}
                    >
                      P&L
                    </Button>
                    <Button
                      variant={selectedMetric === 'percentage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('percentage')}
                    >
                      %
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar 
                        dataKey={selectedMetric === 'percentage' ? 'pnl_percentage' : selectedMetric} 
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Account</th>
                      <th className="text-right p-2">Balance</th>
                      <th className="text-right p-2">P&L</th>
                      <th className="text-right p-2">Return %</th>
                      <th className="text-center p-2">Risk</th>
                      <th className="text-center p-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAccounts.map(account => (
                      <tr key={account.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: account.color_theme }}
                            />
                            {account.account_name}
                          </div>
                        </td>
                        <td className="text-right p-2 font-medium">
                          ${account.balance.toLocaleString()}
                        </td>
                        <td className={`text-right p-2 font-medium ${
                          account.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                        </td>
                        <td className={`text-right p-2 font-medium ${
                          account.total_pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {account.total_pnl_percentage >= 0 ? '+' : ''}{account.total_pnl_percentage.toFixed(2)}%
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" className="text-xs">
                            {account.risk_level.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" className="text-xs">
                            {account.account_type.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Balance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedAccounts.map(account => {
                    const percentage = (account.balance / totalValue) * 100;
                    return (
                      <div key={account.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{account.account_name}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: account.color_theme
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Highest Balance</span>
                    <span className="font-medium">
                      ${Math.max(...selectedAccounts.map(acc => acc.balance)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lowest Balance</span>
                    <span className="font-medium">
                      ${Math.min(...selectedAccounts.map(acc => acc.balance)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Balance</span>
                    <span className="font-medium">
                      ${(totalValue / selectedAccounts.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Performer</span>
                    <span className="font-medium text-green-600">
                      {selectedAccounts.reduce((best, acc) => 
                        acc.total_pnl_percentage > best.total_pnl_percentage ? acc : best
                      ).account_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Worst Performer</span>
                    <span className="font-medium text-red-600">
                      {selectedAccounts.reduce((worst, acc) => 
                        acc.total_pnl_percentage < worst.total_pnl_percentage ? acc : worst
                      ).account_name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(riskDistribution).map(([risk, count]) => (
                    <div key={risk} className="flex items-center justify-between">
                      <span className="capitalize">{risk.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${(count / selectedAccounts.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(typeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${(count / selectedAccounts.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-4">
            {selectedAccounts.map(account => (
              <Card key={account.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: account.color_theme }}
                    />
                    {account.account_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Balance</span>
                      <p className="font-medium">${account.balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P&L</span>
                      <p className={`font-medium ${account.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Daily Loss</span>
                      <p className="font-medium">${account.max_daily_loss.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Position</span>
                      <p className="font-medium">${account.max_position_size.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};