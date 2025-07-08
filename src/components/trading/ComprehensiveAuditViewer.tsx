
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useComprehensiveAudit } from "@/hooks/useComprehensiveAudit";
import { Activity, Search, Download, Filter, Clock, User, TrendingUp } from "lucide-react";

export const ComprehensiveAuditViewer = () => {
  const { auditEntries, accountSummaries, loading, fetchAuditEntries, exportAuditData } = useComprehensiveAudit();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('');

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.metadata?.symbol && entry.metadata.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = selectedActionType === '' || entry.action_type === selectedActionType;
    
    return matchesSearch && matchesAction;
  });

  const actionTypes = [...new Set(auditEntries.map(entry => entry.action_type))];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'trade_executed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'trade_followed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'bot_action': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'system_initialization': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  useEffect(() => {
    fetchAuditEntries();
  }, [fetchAuditEntries]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Audit Entries</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{auditEntries.length}</div>
            <p className="text-xs text-white/60">All system activities logged</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Trade Executions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {auditEntries.filter(e => e.action_type === 'trade_executed').length}
            </div>
            <p className="text-xs text-white/60">Successful trade executions</p>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">System Events</CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {auditEntries.filter(e => e.action_type === 'system_initialization').length}
            </div>
            <p className="text-xs text-white/60">System initialization events</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Summaries */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accountSummaries.map((account) => (
              <div key={account.account_id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{account.account_name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {account.total_trades} trades
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Balance:</span>
                    <div className="font-medium text-white">{formatCurrency(account.current_balance)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Total P&L:</span>
                    <div className={`font-medium ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(account.total_pnl)}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Volume:</span>
                    <div className="font-medium text-white">{formatCurrency(account.total_volume)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Holdings:</span>
                    <div className="font-medium text-white">{account.holdings.length} positions</div>
                  </div>
                </div>

                {account.holdings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60 mb-2">Top Holdings:</div>
                    <div className="flex flex-wrap gap-2">
                      {account.holdings.slice(0, 5).map((holding, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {holding.symbol}: {holding.total_amount.toFixed(4)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Viewer */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Complete Audit Log ({filteredEntries.length} entries)
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                onClick={() => exportAuditData('json')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Download className="w-4 h-4 mr-1" />
                Export JSON
              </Button>
              <Button
                onClick={() => exportAuditData('csv')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by action, entity, or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white"
              />
            </div>
            
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm min-w-[150px]"
            >
              <option value="">All Actions</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-white/60">Loading audit entries...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-white/60">No audit entries found</div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${getActionColor(entry.action_type)}`}>
                        {entry.action_type}
                      </Badge>
                      <span className="text-sm font-medium text-white">{entry.entity_type}</span>
                      {entry.metadata?.symbol && (
                        <Badge variant="outline" className="text-xs">
                          {entry.metadata.symbol}
                        </Badge>
                      )}
                    </div>
                    
                    <span className="text-xs text-white/60">{formatTime(entry.created_at)}</span>
                  </div>
                  
                  {entry.metadata && (
                    <div className="text-xs text-white/60 space-y-1">
                      {entry.metadata.side && entry.metadata.amount && (
                        <div>
                          Trade: {entry.metadata.side.toUpperCase()} {entry.metadata.amount} 
                          {entry.metadata.price && ` @ $${entry.metadata.price}`}
                          {entry.metadata.confidence && ` (${entry.metadata.confidence}% confidence)`}
                        </div>
                      )}
                      {entry.metadata.reasoning && (
                        <div className="italic">Reasoning: {entry.metadata.reasoning}</div>
                      )}
                      {entry.metadata.trader_name && (
                        <div>Trader: {entry.metadata.trader_name}</div>
                      )}
                      {entry.metadata.execution_latency && (
                        <div>Execution time: {entry.metadata.execution_latency}ms</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
