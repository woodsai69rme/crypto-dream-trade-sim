
export interface AuditResult {
  id: string;
  component_type: string;
  component_name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  response_time_ms?: number;
  error_details: Record<string, any>;
  metadata: Record<string, any>;
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
  testDuration: number;
  completedAt: string;
}

export interface TradingAccuracy {
  totalSignals: number;
  correctSignals: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface ProfitabilityAnalysis {
  totalTrades: number;
  profitableTrades: number;
  lossTrades: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  sharpeRatio: number;
  maxDrawdown: number;
  realMoneyProjection: {
    wouldHaveMade: number;
    riskAdjusted: number;
    fees: number;
    netAfterFees: number;
    annualizedReturn: number;
  };
}

export interface ComprehensiveAuditReport {
  auditId: string;
  timestamp: string;
  duration: number;
  systemHealth: SystemAuditSummary;
  tradingAccuracy: TradingAccuracy;
  profitability: ProfitabilityAnalysis;
  securityAssessment: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  performanceMetrics: {
    averageLatency: number;
    throughput: number;
    reliability: number;
  };
  realMoneyReadiness: {
    ready: boolean;
    confidence: number;
    requirements: string[];
  };
}
