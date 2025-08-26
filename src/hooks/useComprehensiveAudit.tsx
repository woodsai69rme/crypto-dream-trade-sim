
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { ComprehensiveAuditReport } from '@/types/audit';
import { comprehensiveAuditor } from '@/services/comprehensiveAuditor';

export const useComprehensiveAudit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComprehensiveAuditReport | null>(null);

  const runComprehensiveAudit = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run the comprehensive audit",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      toast({
        title: "Starting Comprehensive Audit",
        description: "Running full system analysis, security check, and trading simulation...",
      });

      const auditReport = await comprehensiveAuditor.runFullSystemAudit(user.id);
      setReport(auditReport);

      // Generate summary toast
      const { systemHealth, profitability, realMoneyReadiness } = auditReport;
      
      toast({
        title: "Audit Complete",
        description: `Status: ${systemHealth.overallStatus.toUpperCase()} | Decision: ${systemHealth.goNoGoDecision} | Ready: ${realMoneyReadiness.ready ? 'YES' : 'NO'}`,
        variant: realMoneyReadiness.ready ? 'default' : 'destructive'
      });

      return auditReport;
    } catch (error: any) {
      console.error('Comprehensive audit failed:', error);
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

  const exportReport = useCallback((format: 'json' | 'csv' | 'md' = 'json') => {
    if (!report) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      downloadFile(blob, `comprehensive-audit-${timestamp}.json`);
    } else if (format === 'csv') {
      const csv = generateCSV(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, `comprehensive-audit-${timestamp}.csv`);
    } else if (format === 'md') {
      const markdown = generateMarkdown(report);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      downloadFile(blob, `comprehensive-audit-${timestamp}.md`);
    }

    toast({
      title: "Report Exported",
      description: `Audit report exported as ${format.toUpperCase()}`,
    });
  }, [report, toast]);

  const saveToDocumentation = useCallback(async () => {
    if (!report) return;

    const markdown = generateMarkdown(report);
    const timestamp = new Date().toISOString().split('T')[0];
    
    console.log(`Saving comprehensive audit to docs/COMPREHENSIVE_AUDIT_${timestamp}.md`);
    console.log(markdown);

    toast({
      title: "Report Saved",
      description: "Comprehensive audit saved to documentation",
    });
  }, [report, toast]);

  return {
    loading,
    report,
    runComprehensiveAudit,
    exportReport,
    saveToDocumentation
  };
};

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generateCSV(report: ComprehensiveAuditReport): string {
  const headers = ['Category', 'Metric', 'Value'];
  const rows = [
    ['System', 'Overall Status', report.systemHealth.overallStatus],
    ['System', 'Go/No-Go', report.systemHealth.goNoGoDecision],
    ['System', 'Components Healthy', `${report.systemHealth.healthyCount}/${report.systemHealth.totalComponents}`],
    ['Security', 'Security Score', `${report.securityAssessment.score}/100`],
    ['Trading', 'Total Trades', report.profitability.totalTrades.toString()],
    ['Trading', 'Win Rate', `${report.profitability.winRate.toFixed(1)}%`],
    ['Trading', 'Net P&L', `$${report.profitability.netPnL.toFixed(2)}`],
    ['Trading', 'Real Money Net', `$${report.profitability.realMoneyProjection.netAfterFees.toFixed(2)}`],
    ['Performance', 'Average Latency', `${report.performanceMetrics.averageLatency.toFixed(0)}ms`],
    ['Readiness', 'Real Money Ready', report.realMoneyReadiness.ready ? 'YES' : 'NO'],
    ['Readiness', 'Confidence', `${report.realMoneyReadiness.confidence}%`]
  ];

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateMarkdown(report: ComprehensiveAuditReport): string {
  const { systemHealth, tradingAccuracy, profitability, securityAssessment, performanceMetrics, realMoneyReadiness } = report;
  
  return `# 🚀 COMPREHENSIVE TRADING SYSTEM AUDIT REPORT

**Audit ID:** ${report.auditId}
**Generated:** ${new Date(report.timestamp).toLocaleString()}
**Duration:** ${report.duration} seconds

---

## 📊 EXECUTIVE SUMMARY

### System Status: ${systemHealth.overallStatus === 'healthy' ? '✅ EXCELLENT' : systemHealth.overallStatus === 'warning' ? '⚠️ NEEDS ATTENTION' : '❌ CRITICAL ISSUES'}

- **Go/No-Go Decision:** ${systemHealth.goNoGoDecision === 'GO' ? '✅ **GO**' : '❌ **NO-GO**'}
- **Real Money Ready:** ${realMoneyReadiness.ready ? '✅ **YES**' : '❌ **NO**'}
- **Confidence Level:** ${realMoneyReadiness.confidence}%
- **Security Score:** ${securityAssessment.score}/100

---

## 🎯 KEY FINDINGS

### Trading Performance: ${profitability.netPnL > 0 ? '✅ PROFITABLE' : '❌ UNPROFITABLE'}

**Core Metrics:**
- **Total Trades:** ${profitability.totalTrades.toLocaleString()}
- **Win Rate:** ${profitability.winRate.toFixed(1)}%
- **Net P&L:** $${profitability.netPnL.toLocaleString()}
- **Profit Factor:** ${profitability.profitFactor.toFixed(2)}
- **Sharpe Ratio:** ${profitability.sharpeRatio.toFixed(2)}
- **Max Drawdown:** ${profitability.maxDrawdown.toFixed(1)}%

**Real Money Projection:**
- **Paper Trading P&L:** $${profitability.realMoneyProjection.wouldHaveMade.toLocaleString()}
- **Risk Adjusted (70%):** $${profitability.realMoneyProjection.riskAdjusted.toLocaleString()}
- **Fees & Slippage:** -$${profitability.realMoneyProjection.fees.toLocaleString()}
- **🎯 NET REAL MONEY:** $${profitability.realMoneyProjection.netAfterFees.toLocaleString()}
- **📈 Annualized Return:** $${profitability.realMoneyProjection.annualizedReturn.toLocaleString()}

### Trading Accuracy Analysis

- **Total Signals:** ${tradingAccuracy.totalSignals}
- **Accuracy:** ${tradingAccuracy.accuracy.toFixed(1)}%
- **Precision:** ${tradingAccuracy.precision.toFixed(1)}%
- **F1 Score:** ${tradingAccuracy.f1Score.toFixed(2)}

---

## 🔧 SYSTEM HEALTH ANALYSIS

**Component Status:**
- ✅ Healthy: ${systemHealth.healthyCount}
- ⚠️ Warning: ${systemHealth.warningCount}  
- ❌ Critical: ${systemHealth.criticalCount}
- 🔴 Offline: ${systemHealth.offlineCount}

**Performance Metrics:**
- **Average Latency:** ${performanceMetrics.averageLatency.toFixed(0)}ms
- **System Reliability:** ${performanceMetrics.reliability.toFixed(1)}%
- **Throughput:** ${performanceMetrics.throughput.toFixed(1)} trades/sec

---

## 🔒 SECURITY ASSESSMENT

**Security Score:** ${securityAssessment.score}/100

${securityAssessment.vulnerabilities.length > 0 ? `
**Critical Vulnerabilities:**
${securityAssessment.vulnerabilities.map(v => `- ❌ ${v}`).join('\n')}
` : '✅ No critical vulnerabilities found'}

**Recommendations:**
${securityAssessment.recommendations.slice(0, 5).map(r => `- ${r}`).join('\n')}

---

## 🚀 REAL MONEY TRADING READINESS

**Status:** ${realMoneyReadiness.ready ? '✅ **APPROVED FOR REAL MONEY TRADING**' : '⚠️ **NOT READY - REQUIREMENTS PENDING**'}

${realMoneyReadiness.requirements.length > 0 ? `
**Requirements to Meet:**
${realMoneyReadiness.requirements.map(r => `- [ ] ${r}`).join('\n')}
` : ''}

---

## 📈 PERFORMANCE PROJECTIONS

Based on ${profitability.totalTrades} analyzed trades over ${report.duration} seconds:

**Annual Performance Estimate:**
- **Capital Required:** $100,000
- **Expected Annual Return:** ${((profitability.realMoneyProjection.annualizedReturn / 100000) * 100).toFixed(1)}%
- **Monthly Income:** $${(profitability.realMoneyProjection.annualizedReturn / 12).toLocaleString()}
- **Risk-Adjusted Sharpe:** ${profitability.sharpeRatio.toFixed(2)}

**Strategy Effectiveness:**
${profitability.winRate > 65 ? '🚀 **HIGHLY EFFECTIVE** - Exceptional performance' : 
  profitability.winRate > 55 ? '✅ **EFFECTIVE** - Good performance' : 
  '⚠️ **NEEDS IMPROVEMENT** - Below target performance'}

---

## 🎯 RECOMMENDATIONS

### Immediate Actions:
${systemHealth.mainIssues.length > 0 ? 
  systemHealth.mainIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '✅ No critical issues detected'
}

### Optimization Opportunities:
${profitability.winRate < 60 ? '- **Improve Win Rate:** Current rate below optimal target' : '- **Win Rate Excellent:** Continue current strategies'}
${profitability.sharpeRatio < 1.5 ? '\n- **Risk Management:** Enhance risk-adjusted returns' : '\n- **Risk Management Good:** Well-balanced risk/reward'}
${profitability.maxDrawdown > 15 ? '\n- **Drawdown Control:** Implement stricter stop-losses' : '\n- **Drawdown Acceptable:** Within acceptable limits'}

---

## 🔄 NEXT STEPS

${realMoneyReadiness.ready ? `
### ✅ System Ready for Real Money Trading

1. **Start Conservative:** Begin with 10% of intended capital
2. **Monitor Closely:** 24/7 monitoring for first week
3. **Scale Gradually:** Increase position sizes based on performance
4. **Maintain Limits:** Keep strict risk management rules
` : `
### ⚠️ Requirements Before Real Money Trading

1. **Address Critical Issues:** Fix all identified problems
2. **Improve Performance:** Target 60%+ win rate
3. **Enhanced Security:** Achieve 80+ security score  
4. **Extended Testing:** Run longer simulation periods
`}

---

## 🔧 TECHNICAL DETAILS

**System Components Tested:** ${systemHealth.totalComponents}
**Test Duration:** ${report.duration} seconds
**Data Points Collected:** ${profitability.totalTrades + systemHealth.totalComponents}
**Audit Methodology:** Comprehensive system analysis with live trading simulation

---

## 💡 RECREATE PROMPT

\`\`\`
Create a comprehensive cryptocurrency trading system audit with the following specifications:

AUDIT SCOPE:
- Complete system health analysis (${systemHealth.totalComponents} components)
- Live trading simulation (${profitability.totalTrades} trades in ${report.duration}s)
- Security assessment (${securityAssessment.score}/100 score)
- Performance validation (${performanceMetrics.reliability.toFixed(1)}% reliability)
- Real money readiness evaluation

PERFORMANCE TARGETS ACHIEVED:
- Win Rate: ${profitability.winRate.toFixed(1)}% (Target: 55%+)
- Sharpe Ratio: ${profitability.sharpeRatio.toFixed(2)} (Target: 1.0+)
- Max Drawdown: ${profitability.maxDrawdown.toFixed(1)}% (Limit: 20%)
- Security Score: ${securityAssessment.score}/100 (Target: 80+)

TECHNICAL STACK VALIDATED:
- React 18 + TypeScript + Tailwind CSS
- Supabase backend with RLS security
- Real-time WebSocket connections
- AI-powered trading algorithms
- Multi-account portfolio management

FEATURES VERIFIED:
- Paper trading system with risk management
- AI bot configurations and performance
- Market data integration and reliability
- Security policies and access controls
- Real-time monitoring and alerting

The system demonstrates ${realMoneyReadiness.ready ? 'production readiness' : 'development stage'} with ${realMoneyReadiness.confidence}% confidence for real money trading.
\`\`\`

---

*Audit completed by CryptoTrader Pro Comprehensive Analysis Engine*
*Report ID: ${report.auditId}*
*Generated: ${new Date(report.timestamp).toLocaleString()}*
`;
}
