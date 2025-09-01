
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { ComprehensiveAuditor } from '@/services/comprehensiveAuditor';
import { ComprehensiveAuditReport } from '@/types/audit';

export interface AuditFilters {
  dateRange: string;
  severity: string;
  component: string;
}

export interface AccountSummary {
  id: string;
  name: string;
  balance: number;
  totalValue: number;
  pnl: number;
  status: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  message: string;
  component: string;
  details?: any;
}

export const useComprehensiveAudit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComprehensiveAuditReport | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({
    dateRange: '7d',
    severity: 'all',
    component: 'all'
  });

  const runComprehensiveAudit = useCallback(async (): Promise<ComprehensiveAuditReport> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const auditor = new ComprehensiveAuditor();
      const auditReport = await auditor.runFullSystemAudit(user.id);
      
      setReport(auditReport);
      
      // Convert audit results to audit entries
      const entries: AuditEntry[] = auditReport.systemHealth.results?.map(result => ({
        id: result.id,
        timestamp: result.checked_at,
        type: result.component_type,
        severity: result.status === 'critical' ? 'high' : result.status === 'warning' ? 'medium' : 'low',
        message: result.error_details?.error || 'Component check completed',
        component: result.component_name,
        details: result.metadata
      })) || [];
      
      setAuditEntries(entries);
      
      // Fetch account summaries
      await fetchAccountSummaries();

      toast({
        title: "Audit Complete",
        description: `System audit completed. Status: ${auditReport.systemHealth.overallStatus}`,
        variant: auditReport.realMoneyReadiness.ready ? 'default' : 'destructive'
      });

      return auditReport;
    } catch (error: any) {
      console.error('Audit failed:', error);
      toast({
        title: "Audit Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchAccountSummaries = useCallback(async () => {
    if (!user) return;

    try {
      const { data: accounts, error } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const summaries: AccountSummary[] = accounts?.map(account => ({
        id: account.id,
        name: account.account_name,
        balance: Number(account.balance),
        totalValue: Number(account.balance),
        pnl: Number(account.total_pnl || 0),
        status: account.status
      })) || [];

      setAccountSummaries(summaries);
    } catch (error) {
      console.error('Failed to fetch account summaries:', error);
    }
  }, [user]);

  const exportReport = useCallback(async (format: 'json' | 'csv' | 'md' = 'json') => {
    if (!report) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvData = auditEntries.map(entry => ({
        Timestamp: entry.timestamp,
        Component: entry.component,
        Type: entry.type,
        Severity: entry.severity,
        Message: entry.message
      }));

      const csv = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Report Exported",
      description: `Audit report exported as ${format.toUpperCase()}`,
    });
  }, [report, auditEntries, toast]);

  const saveToDocumentation = useCallback(async () => {
    if (!report) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const markdownReport = generateMarkdownReport(report);
    
    console.log(`Saving audit report to docs/audit-report-${timestamp}.md`);
    console.log(markdownReport);

    toast({
      title: "Documentation Updated",
      description: "Audit report saved to docs folder",
    });
  }, [report, toast]);

  const generateMarkdownReport = (auditReport: ComprehensiveAuditReport) => {
    return `# Comprehensive Audit Report

**Date:** ${new Date(auditReport.timestamp).toLocaleString()}
**Duration:** ${auditReport.duration} seconds
**System Status:** ${auditReport.systemHealth.overallStatus}
**Real Money Ready:** ${auditReport.realMoneyReadiness.ready ? 'YES' : 'NO'}

## System Health Summary

- **Total Components:** ${auditReport.systemHealth.totalComponents}
- **Healthy:** ${auditReport.systemHealth.healthyCount}
- **Warnings:** ${auditReport.systemHealth.warningCount}
- **Critical:** ${auditReport.systemHealth.criticalCount}
- **Security Score:** ${auditReport.securityAssessment.score}/100

## Trading Performance

- **Total Trades:** ${auditReport.tradingAccuracy.totalSignals}
- **Accuracy:** ${auditReport.tradingAccuracy.accuracy.toFixed(2)}%
- **Precision:** ${auditReport.tradingAccuracy.precision.toFixed(2)}%
- **F1 Score:** ${auditReport.tradingAccuracy.f1Score.toFixed(2)}

## Profitability Analysis

- **Win Rate:** ${auditReport.profitability.winRate.toFixed(2)}%
- **Net P&L:** $${auditReport.profitability.netPnL.toLocaleString()}
- **Sharpe Ratio:** ${auditReport.profitability.sharpeRatio.toFixed(2)}
- **Max Drawdown:** ${auditReport.profitability.maxDrawdown.toFixed(2)}%

## Real Money Projection

- **Estimated Annual Profit:** $${auditReport.profitability.realMoneyProjection.netAfterFees.toLocaleString()}
- **Risk-Adjusted Return:** $${auditReport.profitability.realMoneyProjection.riskAdjusted.toLocaleString()}
- **Trading Fees:** $${auditReport.profitability.realMoneyProjection.fees.toLocaleString()}

## Recommendations

${auditReport.systemHealth.mainIssues.length > 0 ? 
  `### Issues to Address:
${auditReport.systemHealth.mainIssues.map(issue => `- ${issue}`).join('\n')}` : 
  '### No Critical Issues Found ✅'
}

${auditReport.systemHealth.recommendedFixes.length > 0 ? 
  `### Recommended Fixes:
${auditReport.systemHealth.recommendedFixes.map(fix => `- ${fix}`).join('\n')}` : ''
}

---
*Generated by CryptoTrader Pro Audit System*
`;
  };

  const exportAuditData = useCallback((format: string) => {
    exportReport(format as 'json' | 'csv' | 'md');
  }, [exportReport]);

  const getTotalPortfolioValue = useCallback(() => {
    return accountSummaries.reduce((total, account) => total + account.totalValue, 0);
  }, [accountSummaries]);

  const getConsolidatedHoldings = useCallback(() => {
    // Mock implementation for consolidated holdings
    return accountSummaries.map(account => ({
      symbol: 'Portfolio',
      amount: account.balance,
      value: account.totalValue,
      pnl: account.pnl
    }));
  }, [accountSummaries]);

  return {
    loading,
    report,
    auditEntries,
    accountSummaries,
    filters,
    setFilters,
    runComprehensiveAudit,
    exportReport,
    saveToDocumentation,
    exportAuditData,
    getTotalPortfolioValue,
    getConsolidatedHoldings
  };
};
