
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComprehensiveAudit } from "@/hooks/useComprehensiveAudit";
import { FileText, Download, Filter, Search, Activity, BarChart3, Users, Bot } from "lucide-react";

export const ComprehensiveAuditViewer = () => {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState(auditEntries);

  // Filter audit entries based on search and filters
  useEffect(() => {
    let filtered = auditEntries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  }, [auditEntries, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'trade_executed': return 'bg-green-500/20 text-green-400';
      case 'bot_activated': return 'bg-blue-500/20 text-blue-400';
      case 'bot_paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'risk_alert': return 'bg-red-500/20 text-red-400';
      case 'balance_adjustment': return 'bg-purple-500/20 text-purple-400';
      case 'system_initialization': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalPortfolioValue = getTotalPortfolioValue();
  const consolidatedHoldings = getConsolidatedHoldings();

  return (
    <div className="space-y-6">
      {/* Audit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Portfolio</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalPortfolioValue)}</div>
            <p className="text-xs text-white/60">Across {accountSummaries.length} accounts</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {accountSummaries.reduce((sum, acc) => sum + acc.total_trades, 0)}
            </div>
            <p className="text-xs text-white/60">
              {formatCurrency(accountSummaries.reduce((sum, acc) => sum + acc.total_volume, 0))} volume
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Audit Entries</CardTitle>
            <FileText className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{auditEntries.length}</div>
            <p className="text-xs text-white/60">Complete transaction history</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Holdings</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{consolidatedHoldings.length}</div>
            <p className="text-xs text-white/60">Unique positions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="accounts">Account Summary</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="export">Export & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          {/* Filters and Search */}
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Audit Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Search audit entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Select value={filters.actionType} onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="trade_executed">Trade Executed</SelectItem>
                    <SelectItem value="bot_activated">Bot Activated</SelectItem>
                    <SelectItem value="bot_paused">Bot Paused</SelectItem>
                    <SelectItem value="risk_alert">Risk Alert</SelectItem>
                    <SelectItem value="balance_adjustment">Balance Adjustment</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.entityType} onValueChange={(value) => setFilters(prev => ({ ...prev, entityType: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Entities</SelectItem>
                    <SelectItem value="trade">Trade</SelectItem>
                    <SelectItem value="bot">Bot</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="trader_signal">Trader Signal</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setFilters({ accountId: '', actionType: '', entityType: '', dateFrom: '', dateTo: '' });
                    setSearchTerm('');
                  }}
                  variant="outline"
                  className="text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Entries */}
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">
                Audit Trail ({filteredEntries.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-white/60">Loading audit entries...</div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No audit entries found</div>
                ) : (
                  filteredEntries.map((entry) => (
                    <div key={entry.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className={getActionTypeColor(entry.action_type)}>
                            {entry.action_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-white font-medium">{entry.entity_type}</span>
                          <span className="text-white/60 text-sm">ID: {entry.entity_id}</span>
                        </div>
                        <span className="text-white/60 text-xs">{formatDate(entry.created_at)}</span>
                      </div>

                      {entry.metadata && (
                        <div className="mt-2 p-2 bg-white/5 rounded text-xs">
                          <div className="text-white/60 mb-1">Metadata:</div>
                          <pre className="text-white/80 whitespace-pre-wrap">
                            {JSON.stringify(entry.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {(entry.old_values || entry.new_values) && (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {entry.old_values && (
                            <div className="p-2 bg-red-500/10 rounded">
                              <div className="text-red-400 mb-1">Old Values:</div>
                              <pre className="text-white/80">{JSON.stringify(entry.old_values, null, 2)}</pre>
                            </div>
                          )}
                          {entry.new_values && (
                            <div className="p-2 bg-green-500/10 rounded">
                              <div className="text-green-400 mb-1">New Values:</div>
                              <pre className="text-white/80">{JSON.stringify(entry.new_values, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accountSummaries.map((account) => (
              <Card key={account.account_id} className="crypto-card-gradient">
                <CardHeader>
                  <CardTitle className="text-white">{account.account_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Balance:</span>
                      <div className="font-medium text-white">{formatCurrency(account.current_balance)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">P&L:</span>
                      <div className={`font-medium ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(account.total_pnl)}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/60">Trades:</span>
                      <div className="font-medium text-white">{account.total_trades}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Volume:</span>
                      <div className="font-medium text-white">{formatCurrency(account.total_volume)}</div>
                    </div>
                  </div>

                  {account.holdings.length > 0 && (
                    <div>
                      <h4 className="text-white/80 text-sm mb-2">Holdings:</h4>
                      <div className="space-y-1">
                        {account.holdings.slice(0, 3).map((holding) => (
                          <div key={holding.symbol} className="flex justify-between text-xs">
                            <span className="text-white/60">{holding.symbol}</span>
                            <span className="text-white">{holding.total_amount.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Consolidated Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {consolidatedHoldings.map((holding) => (
                  <div key={holding.symbol} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{holding.symbol}</h4>
                      <Badge variant="outline">
                        {holding.percentage_of_portfolio.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount:</span>
                        <span className="text-white">{holding.total_amount.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Avg Price:</span>
                        <span className="text-white">${holding.average_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Value:</span>
                        <span className="text-white">{formatCurrency(holding.current_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">P&L:</span>
                        <span className={`${(holding.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(holding.unrealized_pnl || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => exportAuditData('json')}
                  variant="outline"
                  className="text-white flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export JSON
                </Button>

                <Button
                  onClick={() => exportAuditData('csv')}
                  variant="outline"
                  className="text-white flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export CSV
                </Button>

                <Button
                  onClick={() => exportAuditData('pdf')}
                  variant="outline"
                  className="text-white flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Export Information</h4>
                <div className="text-sm text-white/80 space-y-1">
                  <div>• Complete audit trail with all transaction details</div>
                  <div>• Account summaries and performance metrics</div>
                  <div>• Holdings data with P&L calculations</div>
                  <div>• Timestamp and metadata for all entries</div>
                  <div>• Compatible with external analysis tools</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
