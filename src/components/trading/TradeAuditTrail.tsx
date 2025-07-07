
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'success' | 'failed' | 'pending';
  executionTime: number;
  slippage: number;
  fees: number;
  accountBalance: number;
  reasoning?: string;
  metadata: {
    orderId: string;
    marketPrice: number;
    requestedPrice: number;
    partialFill: boolean;
    source: 'manual' | 'bot' | 'api';
  };
}

export const TradeAuditTrail = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { currentAccount } = useMultipleAccounts();

  useEffect(() => {
    loadAuditTrail();
  }, [currentAccount]);

  useEffect(() => {
    filterEvents();
  }, [auditEvents, searchTerm, statusFilter]);

  const loadAuditTrail = async () => {
    if (!currentAccount) return;

    try {
      // In production, this would fetch from your audit logs table
      const mockAuditEvents: AuditEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          action: 'TRADE_EXECUTED',
          symbol: 'BTC',
          side: 'buy',
          amount: 0.1,
          price: 45250,
          status: 'success',
          executionTime: 150,
          slippage: 0.02,
          fees: 4.52,
          accountBalance: 95000,
          reasoning: 'Strong bullish momentum detected',
          metadata: {
            orderId: 'ord_123',
            marketPrice: 45275,
            requestedPrice: 45250,
            partialFill: false,
            source: 'manual'
          }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          action: 'ORDER_MODIFIED',
          symbol: 'ETH',
          side: 'sell',
          amount: 2,
          price: 3150,
          status: 'success',
          executionTime: 50,
          slippage: 0,
          fees: 0,
          accountBalance: 99547,
          metadata: {
            orderId: 'ord_124',
            marketPrice: 3145,
            requestedPrice: 3150,
            partialFill: false,
            source: 'manual'
          }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          action: 'TRADE_FAILED',
          symbol: 'SOL',
          side: 'buy',
          amount: 10,
          price: 125,
          status: 'failed',
          executionTime: 5000,
          slippage: 0,
          fees: 0,
          accountBalance: 99547,
          reasoning: 'Insufficient balance',
          metadata: {
            orderId: 'ord_125',
            marketPrice: 125.5,
            requestedPrice: 125,
            partialFill: false,
            source: 'bot'
          }
        }
      ];

      setAuditEvents(mockAuditEvents);
    } catch (error) {
      console.error('Error loading audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = auditEvents;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.reasoning?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('BUY') || action.includes('EXECUTED')) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const exportAuditTrail = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Symbol', 'Side', 'Amount', 'Price', 'Status', 'Execution Time', 'Slippage', 'Fees', 'Balance'].join(','),
      ...filteredEvents.map(event => [
        event.timestamp,
        event.action,
        event.symbol,
        event.side,
        event.amount,
        event.price,
        event.status,
        event.executionTime,
        event.slippage,
        event.fees,
        event.accountBalance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading audit trail...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Trade Audit Trail</h2>
        </div>
        <Button onClick={exportAuditTrail} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by symbol, action, or reasoning..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/20 border-white/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-card/20 border border-white/20 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="crypto-card-gradient text-primary-foreground">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No audit events found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="crypto-card-gradient text-primary-foreground">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getActionIcon(event.action)}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {event.action.replace('_', ' ')}
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {event.side.toUpperCase()} {event.amount} {event.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      at ${event.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Execution Time:</span>
                    <div className="font-medium">{event.executionTime}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slippage:</span>
                    <div className="font-medium">{event.slippage.toFixed(2)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fees:</span>
                    <div className="font-medium">${event.fees.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Balance After:</span>
                    <div className="font-medium">${event.accountBalance.toLocaleString()}</div>
                  </div>
                </div>

                {event.reasoning && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reasoning: </span>
                    <span className="italic">{event.reasoning}</span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order ID: {event.metadata.orderId}</span>
                    <span>Source: {event.metadata.source.toUpperCase()}</span>
                    <span>Market Price: ${event.metadata.marketPrice.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
