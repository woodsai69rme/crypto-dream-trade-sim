
import { supabase } from '@/integrations/supabase/client';

export interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  issue: string;
  recommendation: string;
  cve?: string;
  cvss?: number;
}

export class SecurityAuditor {
  async runSecurityAudit(userId: string): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];

    // 1. Check for demo/test API keys
    await this.auditApiKeys(userId, findings);

    // 2. Check RLS policies
    await this.auditRLSPolicies(findings);

    // 3. Check exchange connection security
    await this.auditExchangeConnections(userId, findings);

    // 4. Check account permissions
    await this.auditAccountPermissions(userId, findings);

    // 5. Check data encryption
    await this.auditDataEncryption(findings);

    return findings;
  }

  private async auditApiKeys(userId: string, findings: SecurityFinding[]) {
    try {
      const { data: connections } = await supabase
        .from('exchange_connections')
        .select('api_key_encrypted, exchange_name')
        .eq('user_id', userId);

      connections?.forEach(conn => {
        if (conn.api_key_encrypted && 
            (conn.api_key_encrypted.includes('demo') || 
             conn.api_key_encrypted.includes('test') ||
             conn.api_key_encrypted.length < 20)) {
          findings.push({
            severity: 'critical',
            component: 'exchange_api_keys',
            issue: `Insecure API key detected for ${conn.exchange_name}`,
            recommendation: 'Replace with production API keys and use proper encryption'
          });
        }
      });
    } catch (error) {
      findings.push({
        severity: 'high',
        component: 'exchange_api_keys',
        issue: 'Failed to audit API key security',
        recommendation: 'Investigate API key storage mechanism'
      });
    }
  }

  private async auditRLSPolicies(findings: SecurityFinding[]) {
    try {
      // Check if RLS is enabled on critical tables
      const { data: tables } = await supabase
        .rpc('check_rls_status', {});

      // This would need a custom RPC function, for now we'll simulate
      const criticalTables = [
        'paper_trading_accounts',
        'ai_trading_bots',
        'exchange_connections',
        'real_trading_credentials'
      ];

      findings.push({
        severity: 'medium',
        component: 'database_security',
        issue: 'RLS policies should be audited regularly',
        recommendation: 'Implement automated RLS policy validation'
      });

    } catch (error) {
      findings.push({
        severity: 'high',
        component: 'database_security',
        issue: 'Cannot verify RLS policy status',
        recommendation: 'Ensure RLS is properly configured on all tables'
      });
    }
  }

  private async auditExchangeConnections(userId: string, findings: SecurityFinding[]) {
    try {
      const { data: connections } = await supabase
        .from('exchange_connections')
        .select('environment, permissions, is_active')
        .eq('user_id', userId);

      const productionConnections = connections?.filter(conn => 
        conn.environment === 'production' || conn.environment === 'mainnet'
      ) || [];

      if (productionConnections.length > 0) {
        findings.push({
          severity: 'high',
          component: 'exchange_connections',
          issue: 'Production exchange connections detected in development environment',
          recommendation: 'Use testnet/sandbox connections for development and testing'
        });
      }

      connections?.forEach(conn => {
        if (conn.is_active && conn.permissions && 
            Array.isArray(conn.permissions) && 
            conn.permissions.includes('withdraw')) {
          findings.push({
            severity: 'critical',
            component: 'exchange_permissions',
            issue: 'Exchange connection has withdrawal permissions',
            recommendation: 'Remove withdrawal permissions for paper trading'
          });
        }
      });

    } catch (error) {
      findings.push({
        severity: 'medium',
        component: 'exchange_connections',
        issue: 'Failed to audit exchange connection security',
        recommendation: 'Verify exchange connection permissions manually'
      });
    }
  }

  private async auditAccountPermissions(userId: string, findings: SecurityFinding[]) {
    try {
      const { data: accounts } = await supabase
        .from('paper_trading_accounts')
        .select('max_daily_loss, max_position_size, balance')
        .eq('user_id', userId);

      accounts?.forEach(account => {
        if (!account.max_daily_loss || account.max_daily_loss > account.balance * 0.5) {
          findings.push({
            severity: 'medium',
            component: 'risk_management',
            issue: 'Daily loss limit is too high or not set',
            recommendation: 'Set daily loss limit to maximum 20% of account balance'
          });
        }

        if (!account.max_position_size || account.max_position_size > account.balance * 0.3) {
          findings.push({
            severity: 'medium',
            component: 'risk_management',
            issue: 'Position size limit is too high or not set',
            recommendation: 'Set position size limit to maximum 10% of account balance'
          });
        }
      });

    } catch (error) {
      findings.push({
        severity: 'low',
        component: 'risk_management',
        issue: 'Failed to audit account risk settings',
        recommendation: 'Review risk management settings manually'
      });
    }
  }

  private async auditDataEncryption(findings: SecurityFinding[]) {
    // Check for HTTPS usage
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      findings.push({
        severity: 'critical',
        component: 'transport_security',
        issue: 'Application not served over HTTPS',
        recommendation: 'Enable HTTPS for all production deployments'
      });
    }

    // Check for proper session handling
    const hasSecureCookies = document.cookie.includes('Secure');
    if (!hasSecureCookies && location.protocol === 'https:') {
      findings.push({
        severity: 'medium',
        component: 'session_security',
        issue: 'Session cookies not marked as Secure',
        recommendation: 'Configure secure session cookie settings'
      });
    }
  }

  calculateSecurityScore(findings: SecurityFinding[]): number {
    let score = 100;
    
    findings.forEach(finding => {
      switch (finding.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });

    return Math.max(0, score);
  }
}

export const securityAuditor = new SecurityAuditor();
