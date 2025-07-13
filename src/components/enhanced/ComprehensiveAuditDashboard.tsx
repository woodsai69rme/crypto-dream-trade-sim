import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useComprehensiveAudit } from '@/hooks/useComprehensiveAudit';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { 
  Download, FileText, BarChart3, TrendingUp, TrendingDown, 
  DollarSign, Activity, Search, Filter, Calendar, Eye
} from 'lucide-react';
import { format } from 'date-fns';

export const ComprehensiveAuditDashboard = () => {
  const { 
    auditEntries, 
    accountSummaries, 
    loading, 
    filters, 
    setFilters,
    exportAuditData,
    getTotalPortfolioValue,
    getConsolidatedHoldings
  } = useComprehensiveAudit();
  
  const { accounts } = useMultipleAccounts();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const totalValue = getTotalPortfolioValue();
  const consolidatedHoldings = getConsolidatedHoldings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6" />
          <h1 className="text-3xl font-bold text-primary-foreground">Comprehensive Audit</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportAuditData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportAuditData('json')}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Portfolio Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Accounts</p>
                <p className="text-2xl font-bold">{accountSummaries.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Holdings</p>
                <p className="text-2xl font-bold">{consolidatedHoldings.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Audit Entries</p>
                <p className="text-2xl font-bold">{auditEntries.length}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Performance */}
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Account Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountSummaries.map((account) => (
                    <div key={account.account_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium">{account.account_name}</p>
                        <p className="text-sm text-white/60">{account.total_trades} trades</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${account.current_balance.toLocaleString()}</p>
                        <div className={`text-sm flex items-center ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {account.total_pnl >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="crypto-card-gradient text-white">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-sm font-medium">{entry.action_type.replace('_', ' ')}</p>
                        <p className="text-xs text-white/60">{entry.entity_type}: {entry.entity_id.substring(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">
                          {format(new Date(entry.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holdings">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle>Consolidated Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consolidatedHoldings.map((holding) => (
                  <div key={holding.symbol} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{holding.symbol.substring(0, 2)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{holding.symbol}</h3>
                          <p className="text-sm text-white/60">{holding.total_amount.toFixed(4)} tokens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${holding.current_value?.toLocaleString() || '0'}</p>
                        <div className={`text-sm ${(holding.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(holding.unrealized_pnl || 0) >= 0 ? '+' : ''}${(holding.unrealized_pnl || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Portfolio: {holding.percentage_of_portfolio.toFixed(1)}%</span>
                      <span>Avg: ${holding.average_price.toFixed(2)}</span>
                    </div>
                    <Progress value={holding.percentage_of_portfolio} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="space-y-6">
            {accountSummaries.map((account) => (
              <Card key={account.account_id} className="crypto-card-gradient text-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {account.account_name}
                    <Badge variant="outline" className="border-white/20">
                      {account.total_trades} trades
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Stats */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/60">Balance</p>
                          <p className="text-xl font-bold">${account.current_balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">P&L</p>
                          <p className={`text-xl font-bold ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Volume</p>
                          <p className="text-lg font-bold">${account.total_volume.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Holdings</p>
                          <p className="text-lg font-bold">{account.holdings.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Holdings */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Holdings</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {account.holdings.map((holding) => (
                          <div key={holding.symbol} className="flex items-center justify-between text-sm">
                            <span>{holding.symbol}</span>
                            <span>{holding.total_amount.toFixed(4)}</span>
                            <span className={(holding.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {(holding.unrealized_pnl || 0) >= 0 ? '+' : ''}${(holding.unrealized_pnl || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Audit Trail
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    className="w-64"
                    value={filters.actionType}
                    onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEntries.slice(0, 50).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {format(new Date(entry.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {accountSummaries.find(acc => acc.account_id === entry.account_id)?.account_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.action_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{entry.entity_type}</TableCell>
                      <TableCell className="text-sm">{entry.entity_id.substring(0, 12)}...</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};