import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AuditEntry {
  id: string;
  account_id?: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface HoldingSummary {
  symbol: string;
  total_amount: number;
  average_price: number;
  current_value: number;
  unrealized_pnl: number;
  percentage_of_portfolio: number;
}

export interface AccountAuditSummary {
  account_id: string;
  account_name: string;
  total_trades: number;
  total_volume: number;
  current_balance: number;
  total_pnl: number;
  holdings: HoldingSummary[];
  recent_activities: AuditEntry[];
}

export const useComprehensiveAudit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [accountSummaries, setAccountSummaries] = useState<AccountAuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    accountId: '',
    actionType: '',
    entityType: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch audit entries
  const fetchAuditEntries = useCallback(async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('comprehensive_audit')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000);

      // Apply filters
      if (filters.accountId) {
        query = query.eq('account_id', filters.accountId);
      }
      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAuditEntries((data as AuditEntry[]) || []);
    } catch (error: any) {
      console.error('Error fetching audit entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit entries",
        variant: "destructive",
      });
    }
  }, [user, filters, toast]);

  // Fetch account summaries with holdings
  const fetchAccountSummaries = useCallback(async () => {
    if (!user) return;

    try {
      // Get all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;

      const summaries: AccountAuditSummary[] = [];

      for (const account of accounts || []) {
        // Get trades for this account
        const { data: trades, error: tradesError } = await supabase
          .from('paper_trades')
          .select('*')
          .eq('account_id', account.id)
          .order('created_at', { ascending: false });

        if (tradesError) {
          console.error('Error fetching trades for account:', account.id, tradesError);
          continue;
        }

        // Calculate holdings
        const holdingsMap = new Map<string, {
          total_amount: number;
          total_cost: number;
          trades: any[];
        }>();

        trades?.forEach(trade => {
          const symbol = trade.symbol;
          if (!holdingsMap.has(symbol)) {
            holdingsMap.set(symbol, {
              total_amount: 0,
              total_cost: 0,
              trades: []
            });
          }

          const holding = holdingsMap.get(symbol)!;
          holding.trades.push(trade);

          if (trade.side === 'buy') {
            holding.total_amount += trade.amount;
            holding.total_cost += trade.total_value;
          } else {
            holding.total_amount -= trade.amount;
            holding.total_cost -= trade.total_value;
          }
        });

        // Convert to holdings summary
        const holdings: HoldingSummary[] = Array.from(holdingsMap.entries())
          .filter(([_, holding]) => holding.total_amount > 0)
          .map(([symbol, holding]) => {
            const averagePrice = holding.total_cost / holding.total_amount;
            const currentPrice = 50000; // Mock current price - would be real in production
            const currentValue = holding.total_amount * currentPrice;
            const unrealizedPnl = currentValue - holding.total_cost;

            return {
              symbol,
              total_amount: holding.total_amount,
              average_price: averagePrice,
              current_value: currentValue,
              unrealized_pnl: unrealizedPnl,
              percentage_of_portfolio: (currentValue / account.balance) * 100
            };
          });

        // Get recent activities
        const { data: recentActivities } = await supabase
          .from('comprehensive_audit')
          .select('*')
          .eq('account_id', account.id)
          .order('created_at', { ascending: false })
          .limit(10);

        summaries.push({
          account_id: account.id,
          account_name: account.account_name,
          total_trades: trades?.length || 0,
          total_volume: trades?.reduce((sum, trade) => sum + trade.total_value, 0) || 0,
          current_balance: account.balance,
          total_pnl: account.total_pnl,
          holdings,
          recent_activities: (recentActivities as AuditEntry[]) || []
        });
      }

      setAccountSummaries(summaries);
    } catch (error: any) {
      console.error('Error fetching account summaries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch account summaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Export audit data
  const exportAuditData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const data = {
        audit_entries: auditEntries,
        account_summaries: accountSummaries,
        exported_at: new Date().toISOString(),
        user_id: user?.id
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvData = auditEntries.map(entry => ({
          Date: entry.created_at,
          Account: accountSummaries.find(acc => acc.account_id === entry.account_id)?.account_name || 'N/A',
          Action: entry.action_type,
          Entity: entry.entity_type,
          'Entity ID': entry.entity_id,
          'Old Values': JSON.stringify(entry.old_values || {}),
          'New Values': JSON.stringify(entry.new_values || {})
        }));

        const csv = [
          Object.keys(csvData[0] || {}).join(','),
          ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Audit data exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Error exporting audit data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export audit data",
        variant: "destructive",
      });
    }
  }, [auditEntries, accountSummaries, user, toast]);

  // Log custom audit entry
  const logAuditEntry = useCallback(async (
    accountId: string | undefined,
    actionType: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_comprehensive_audit', {
        p_account_id: accountId,
        p_action_type: actionType,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_old_values: oldValues,
        p_new_values: newValues,
        p_metadata: metadata
      });

      // Refresh audit entries
      await fetchAuditEntries();
    } catch (error: any) {
      console.error('Error logging audit entry:', error);
    }
  }, [user, fetchAuditEntries]);

  // Get portfolio total value
  const getTotalPortfolioValue = useCallback(() => {
    return accountSummaries.reduce((total, account) => total + account.current_balance, 0);
  }, [accountSummaries]);

  // Get total holdings across all accounts
  const getConsolidatedHoldings = useCallback(() => {
    const consolidated = new Map<string, HoldingSummary>();

    accountSummaries.forEach(account => {
      account.holdings.forEach(holding => {
        if (consolidated.has(holding.symbol)) {
          const existing = consolidated.get(holding.symbol)!;
          existing.total_amount += holding.total_amount;
          existing.current_value += holding.current_value;
          existing.unrealized_pnl += holding.unrealized_pnl;
          existing.average_price = (existing.average_price + holding.average_price) / 2; // Simplified average
        } else {
          consolidated.set(holding.symbol, { ...holding });
        }
      });
    });

    const totalValue = getTotalPortfolioValue();
    return Array.from(consolidated.values()).map(holding => ({
      ...holding,
      percentage_of_portfolio: (holding.current_value / totalValue) * 100
    }));
  }, [accountSummaries, getTotalPortfolioValue]);

  useEffect(() => {
    if (user) {
      fetchAuditEntries();
      fetchAccountSummaries();
    }
  }, [user, fetchAuditEntries, fetchAccountSummaries]);

  return {
    auditEntries,
    accountSummaries,
    loading,
    filters,
    setFilters,
    fetchAuditEntries,
    fetchAccountSummaries,
    exportAuditData,
    logAuditEntry,
    getTotalPortfolioValue,
    getConsolidatedHoldings
  };
};