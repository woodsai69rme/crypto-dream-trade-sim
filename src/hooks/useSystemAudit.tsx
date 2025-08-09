
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { marketDataService } from '@/services/marketDataService';

export interface AuditResult {
  id: string;
  component_type: string;
  component_name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  response_time_ms?: number;
  error_details: any;
  metadata: any;
  checked_at: string;
}

export interface SystemAuditSummary {
  totalComponents: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  offlineCount: number;
  overallStatus: 'healthy' | 'warning' | 'critical';
  goNoGoDecision: 'GO' | 'NO-GO';
  securityScore: number;
  readyForRealMoney: boolean;
  mainIssues: string[];
  recommendedFixes: string[];
}

export const useSystemAudit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [auditRun, setAuditRun] = useState<any>(null);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [summary, setSummary] = useState<SystemAuditSummary | null>(null);

  const startAudit = useCallback(async (auditType = 'full_system') => {
    if (!user) return null;

    setLoading(true);
    try {
      // Create new audit run
      const { data: newRun, error: runError } = await supabase
        .from('audit_runs')
        .insert({
          user_id: user.id,
          audit_type: auditType,
          status: 'running'
        })
        .select()
        .single();

      if (runError) throw runError;
      setAuditRun(newRun);

      // Run comprehensive audit
      const auditResults = await runComprehensiveAudit(newRun.id);
      setResults(auditResults);

      // Generate summary
      const auditSummary = generateAuditSummary(auditResults);
      setSummary(auditSummary);

      // Update audit run with results
      await supabase
        .from('audit_runs')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          results: { components: auditResults },
          summary: auditSummary,
          go_no_go_decision: auditSummary.goNoGoDecision
        })
        .eq('id', newRun.id);

      toast({
        title: "System Audit Complete",
        description: `Status: ${auditSummary.overallStatus.toUpperCase()} | Decision: ${auditSummary.goNoGoDecision}`,
        variant: auditSummary.goNoGoDecision === 'GO' ? 'default' : 'destructive'
      });

      return { run: newRun, results: auditResults, summary: auditSummary };
    } catch (error: any) {
      console.error('Audit failed:', error);
      toast({
        title: "Audit Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const runComprehensiveAudit = async (auditRunId: string): Promise<AuditResult[]> => {
    const results: AuditResult[] = [];

    // 1. Database Connectivity Test
    await testComponent(results, auditRunId, 'database', 'supabase_connection', async () => {
      const start = Date.now();
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      return { response_time_ms: responseTime, metadata: { records_found: data?.length || 0 } };
    });

    // 2. Market Data APIs Test
    await testComponent(results, auditRunId, 'market_data', 'coingecko_api', async () => {
      const start = Date.now();
      const data = await marketDataService.getCurrentPrices(['BTC', 'ETH']);
      const responseTime = Date.now() - start;
      
      if (!data || Object.keys(data).length === 0) throw new Error('No market data received');
      return { response_time_ms: responseTime, metadata: { symbols_received: Object.keys(data) } };
    });

    // 3. Paper Trading Accounts Test
    await testComponent(results, auditRunId, 'accounts', 'paper_trading_accounts', async () => {
      const start = Date.now();
      const { data: accounts, error } = await supabase
        .from('paper_trading_accounts')
        .select('id, account_name, balance, status')
        .eq('user_id', user!.id);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      const activeAccounts = accounts?.filter(acc => acc.status === 'active') || [];
      
      return { 
        response_time_ms: responseTime, 
        metadata: { 
          total_accounts: accounts?.length || 0,
          active_accounts: activeAccounts.length,
          total_balance: accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0
        } 
      };
    });

    // 4. AI Trading Bots Test
    await testComponent(results, auditRunId, 'ai_bots', 'trading_bots', async () => {
      const start = Date.now();
      const { data: bots, error } = await supabase
        .from('ai_trading_bots')
        .select('id, name, status, paper_balance')
        .eq('user_id', user!.id);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      const activeBots = bots?.filter(bot => bot.status === 'active') || [];
      
      return { 
        response_time_ms: responseTime, 
        metadata: { 
          total_bots: bots?.length || 0,
          active_bots: activeBots.length,
          total_bot_balance: bots?.reduce((sum, bot) => sum + Number(bot.paper_balance), 0) || 0
        } 
      };
    });

    // 5. Exchange Connections Test
    await testComponent(results, auditRunId, 'exchanges', 'exchange_connections', async () => {
      const start = Date.now();
      const { data: connections, error } = await supabase
        .from('exchange_connections')
        .select('id, exchange_name, is_active, environment')
        .eq('user_id', user!.id);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      const activeConnections = connections?.filter(conn => conn.is_active) || [];
      const testnetConnections = connections?.filter(conn => conn.environment === 'testnet') || [];
      
      return { 
        response_time_ms: responseTime, 
        metadata: { 
          total_connections: connections?.length || 0,
          active_connections: activeConnections.length,
          testnet_connections: testnetConnections.length,
          exchanges: connections?.map(c => c.exchange_name) || []
        } 
      };
    });

    // 6. Market Data Cache Freshness Test
    await testComponent(results, auditRunId, 'market_data', 'data_freshness', async () => {
      const start = Date.now();
      const { data: latestData, error } = await supabase
        .from('market_data_cache')
        .select('symbol, last_updated')
        .order('last_updated', { ascending: false })
        .limit(10);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      
      const now = Date.now();
      const staleData = latestData?.filter(item => {
        const dataAge = now - new Date(item.last_updated).getTime();
        return dataAge > 5 * 60 * 1000; // 5 minutes
      }) || [];
      
      if (staleData.length > 0) {
        throw new Error(`${staleData.length} symbols have stale data (>5min old)`);
      }
      
      return { 
        response_time_ms: responseTime, 
        metadata: { 
          symbols_checked: latestData?.length || 0,
          freshest_update: latestData?.[0]?.last_updated,
          stale_count: staleData.length
        } 
      };
    });

    // 7. Security Check - Demo Keys Detection
    await testComponent(results, auditRunId, 'security', 'demo_keys_detection', async () => {
      const start = Date.now();
      const { data: connections, error } = await supabase
        .from('exchange_connections')
        .select('api_key_encrypted')
        .eq('user_id', user!.id);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      
      const demoKeys = connections?.filter(conn => 
        conn.api_key_encrypted && conn.api_key_encrypted.includes('demo')
      ) || [];
      
      if (demoKeys.length > 0) {
        throw new Error(`${demoKeys.length} demo/test API keys detected - not production ready`);
      }
      
      return { 
        response_time_ms: responseTime, 
        metadata: { 
          keys_checked: connections?.length || 0,
          demo_keys_found: demoKeys.length
        } 
      };
    });

    // 8. Risk Management Test
    await testComponent(results, auditRunId, 'risk_management', 'position_limits', async () => {
      const start = Date.now();
      const { data: accounts, error } = await supabase
        .from('paper_trading_accounts')
        .select('max_daily_loss, max_position_size, balance')
        .eq('user_id', user!.id);
      const responseTime = Date.now() - start;
      
      if (error) throw error;
      
      const accountsWithoutLimits = accounts?.filter(acc => 
        !acc.max_daily_loss || !acc.max_position_size
      ) || [];
      
      if (accountsWithoutLimits.length > 0) {
        throw new Error(`${accountsWithoutLimits.length} accounts missing risk limits`);
      }
      
      return { 
        response_time_ms: responseTime, 
        metadata: { 
          accounts_checked: accounts?.length || 0,
          accounts_without_limits: accountsWithoutLimits.length,
          average_risk_ratio: accounts?.reduce((sum, acc) => 
            sum + (Number(acc.max_daily_loss) / Number(acc.balance)), 0) / (accounts?.length || 1)
        } 
      };
    });

    return results;
  };

  const testComponent = async (
    results: AuditResult[],
    auditRunId: string,
    componentType: string,
    componentName: string,
    testFunction: () => Promise<any>
  ) => {
    try {
      const testResult = await testFunction();
      const result: AuditResult = {
        id: `${componentType}_${componentName}_${Date.now()}`,
        component_type: componentType,
        component_name: componentName,
        status: 'healthy',
        response_time_ms: testResult.response_time_ms,
        error_details: {},
        metadata: testResult.metadata || {},
        checked_at: new Date().toISOString()
      };

      // Determine status based on response time
      if (testResult.response_time_ms > 5000) {
        result.status = 'warning';
        result.error_details = { warning: 'High response time detected' };
      } else if (testResult.response_time_ms > 10000) {
        result.status = 'critical';
        result.error_details = { critical: 'Very high response time' };
      }

      results.push(result);
      
      // Save to database
      await supabase.from('system_diagnostics').insert({
        audit_run_id: auditRunId,
        user_id: user!.id,
        component_type: componentType,
        component_name: componentName,
        status: result.status,
        response_time_ms: result.response_time_ms,
        error_details: result.error_details,
        metadata: result.metadata
      });

    } catch (error: any) {
      const result: AuditResult = {
        id: `${componentType}_${componentName}_${Date.now()}_error`,
        component_type: componentType,
        component_name: componentName,
        status: 'critical',
        error_details: { error: error.message, stack: error.stack },
        metadata: {},
        checked_at: new Date().toISOString()
      };

      results.push(result);
      
      // Save error to database
      await supabase.from('system_diagnostics').insert({
        audit_run_id: auditRunId,
        user_id: user!.id,
        component_type: componentType,
        component_name: componentName,
        status: 'critical',
        error_details: result.error_details,
        metadata: result.metadata
      });
    }
  };

  const generateAuditSummary = (results: AuditResult[]): SystemAuditSummary => {
    const totalComponents = results.length;
    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const criticalCount = results.filter(r => r.status === 'critical').length;
    const offlineCount = results.filter(r => r.status === 'offline').length;

    const criticalIssues = results.filter(r => r.status === 'critical');
    const mainIssues = criticalIssues.map(issue => 
      `${issue.component_name}: ${issue.error_details.error || 'Critical issue detected'}`
    );

    // Calculate security score
    const securityIssues = results.filter(r => 
      r.component_type === 'security' && r.status !== 'healthy'
    ).length;
    const securityScore = Math.max(0, 100 - (securityIssues * 25));

    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalCount > 0) overallStatus = 'critical';
    else if (warningCount > 0) overallStatus = 'warning';

    // GO/NO-GO decision logic
    const readyForRealMoney = criticalCount === 0 && securityScore >= 80;
    const goNoGoDecision = readyForRealMoney ? 'GO' : 'NO-GO';

    const recommendedFixes = criticalIssues.map(issue => {
      switch (issue.component_name) {
        case 'demo_keys_detection':
          return 'Replace all demo API keys with real exchange API keys';
        case 'data_freshness':
          return 'Fix market data update mechanism to ensure fresh data';
        case 'position_limits':
          return 'Set proper risk limits on all trading accounts';
        default:
          return `Fix critical issue in ${issue.component_name}`;
      }
    });

    return {
      totalComponents,
      healthyCount,
      warningCount,
      criticalCount,
      offlineCount,
      overallStatus,
      goNoGoDecision,
      securityScore,
      readyForRealMoney,
      mainIssues,
      recommendedFixes
    };
  };

  const exportAuditReport = useCallback(async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    if (!summary || !results) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      const report = {
        audit_run: auditRun,
        summary,
        results,
        exported_at: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-audit-${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvData = results.map(r => ({
        Component: r.component_name,
        Type: r.component_type,
        Status: r.status,
        'Response Time (ms)': r.response_time_ms || 'N/A',
        Error: r.error_details.error || '',
        'Checked At': r.checked_at
      }));

      const csv = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-audit-${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Report Exported",
      description: `Audit report exported as ${format.toUpperCase()}`,
    });
  }, [summary, results, auditRun, toast]);

  return {
    loading,
    auditRun,
    results,
    summary,
    startAudit,
    exportAuditReport
  };
};
