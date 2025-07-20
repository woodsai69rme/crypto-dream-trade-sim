
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Filter, Search, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  compliance_status: 'compliant' | 'flagged' | 'under_review';
}

interface TradeAuditEntry {
  id: string;
  trade_id: string;
  exchange_name: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  fee: number;
  execution_time: string;
  confirmation_token?: string;
  risk_score: number;
  compliance_flags: string[];
  regulatory_data: any;
  created_at: string;
}

export const EnhancedTradeAuditSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tradeAudits, setTradeAudits] = useState<TradeAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '7d',
    riskLevel: 'all',
    complianceStatus: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    if (user) {
      fetchAuditData();
    }
  }, [user, filters]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      // Fetch general audit logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Transform audit logs with risk assessment
      const enhancedLogs: AuditLog[] = (logs || []).map(log => ({
        ...log,
        risk_level: assessRiskLevel(log.action, log.details),
        compliance_status: assessComplianceStatus(log.action, log.details)
      }));

      setAuditLogs(enhancedLogs);

      // Simulate trade audit data (in production, this would come from a dedicated table)
      const mockTradeAudits: TradeAuditEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `audit_${i + 1}`,
        trade_id: `trade_${i + 1}`,
        exchange_name: ['deribit', 'binance', 'coinbase'][Math.floor(Math.random() * 3)],
        symbol: ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)],
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.random() * 10,
        price: Math.random() * 50000 + 20000,
        total_value: Math.random() * 100000,
        fee: Math.random() * 100,
        execution_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        confirmation_token: `conf_${Math.random().toString(36).substr(2, 9)}`,
        risk_score: Math.random() * 100,
        compliance_flags: getRandomComplianceFlags(),
        regulatory_data: {
          jurisdiction: 'US',
          tax_implications: true,
          aml_check: 'passed',
          kyc_verified: true
        },
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setTradeAudits(mockTradeAudits);

    } catch (error: any) {
      console.error('Error fetching audit data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assessRiskLevel = (action: string, details: any): 'low' | 'medium' | 'high' | 'critical' => {
    if (action.includes('trade') && details?.amount > 10000) return 'critical';
    if (action.includes('credential')) return 'high';
    if (action.includes('login') || action.includes('access')) return 'medium';
    return 'low';
  };

  const assessComplianceStatus = (action: string, details: any): 'compliant' | 'flagged' | 'under_review' => {
    if (details?.amount > 50000) return 'under_review';
    if (details?.suspicious_activity) return 'flagged';
    return 'compliant';
  };

  const getRandomComplianceFlags = (): string[] => {
    const flags = ['large_transaction', 'unusual_pattern', 'cross_border', 'high_frequency'];
    return flags.filter(() => Math.random() > 0.7);
  };

  const exportAuditData = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const data = {
        audit_logs: auditLogs,
        trade_audits: tradeAudits,
        export_timestamp: new Date().toISOString(),
        user_id: user?.id
      };

      let content: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'csv':
          content = convertToCSV(data);
          mimeType = 'text/csv';
          filename = `audit_export_${Date.now()}.csv`;
          break;
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          filename = `audit_export_${Date.now()}.json`;
          break;
        case 'pdf':
          // In a real implementation, generate PDF
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          filename = `audit_export_${Date.now()}.json`;
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Audit data exported as ${format.toUpperCase()}`,
      });

    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export audit data",
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: any): string => {
    const headers = ['Timestamp', 'Action', 'Resource Type', 'Resource ID', 'Risk Level', 'Compliance Status', 'Details'];
    const rows = data.audit_logs.map((log: AuditLog) => [
      log.timestamp,
      log.action,
      log.resource_type,
      log.resource_id,
      log.risk_level,
      log.compliance_status,
      JSON.stringify(log.details)
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400';
      case 'flagged': return 'bg-red-500/20 text-red-400';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'flagged': return <AlertCircle className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filters.riskLevel !== 'all' && log.risk_level !== filters.riskLevel) return false;
    if (filters.complianceStatus !== 'all' && log.compliance_status !== filters.complianceStatus) return false;
    if (filters.searchTerm && !log.action.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Enhanced Trade Audit System
            <Badge className="bg-blue-500/20 text-blue-400">Compliance Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search actions..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="bg-white/5 border-white/20"
              />
            </div>
            <Select
              value={filters.riskLevel}
              onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}
            >
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.complianceStatus}
              onValueChange={(value) => setFilters(prev => ({ ...prev, complianceStatus: value }))}
            >
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={() => exportAuditData('csv')}
                size="sm"
                variant="outline"
                className="border-white/20"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                onClick={() => exportAuditData('json')}
                size="sm"
                variant="outline"
                className="border-white/20"
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">System Audit Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskLevelColor(log.risk_level)}>
                      {log.risk_level.toUpperCase()}
                    </Badge>
                    <Badge className={getComplianceStatusColor(log.compliance_status)}>
                      {getComplianceIcon(log.compliance_status)}
                      <span className="ml-1">{log.compliance_status.replace('_', ' ').toUpperCase()}</span>
                    </Badge>
                  </div>
                  <span className="text-xs text-white/60">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-white mb-1">
                  <strong>{log.action}</strong> on {log.resource_type}
                </div>
                <div className="text-xs text-white/70">
                  Resource ID: {log.resource_id}
                </div>
                {log.ip_address && (
                  <div className="text-xs text-white/50 mt-1">
                    IP: {log.ip_address}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trade Audit Trail */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Trade Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tradeAudits.map(audit => (
              <div key={audit.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {audit.exchange_name.toUpperCase()}
                    </Badge>
                    <Badge className={audit.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {audit.side.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium">{audit.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">${audit.total_value.toFixed(2)}</div>
                    <div className="text-xs text-white/60">{new Date(audit.execution_time).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Amount:</span>
                    <div className="text-white">{audit.amount.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Price:</span>
                    <div className="text-white">${audit.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Fee:</span>
                    <div className="text-white">${audit.fee.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Risk Score:</span>
                    <div className="text-white">{audit.risk_score.toFixed(0)}/100</div>
                  </div>
                </div>

                {audit.compliance_flags.length > 0 && (
                  <div className="mt-3">
                    <span className="text-white/60 text-xs">Compliance Flags:</span>
                    <div className="flex gap-1 mt-1">
                      {audit.compliance_flags.map(flag => (
                        <Badge key={flag} className="bg-yellow-500/20 text-yellow-400 text-xs">
                          {flag.replace('_', ' ')}
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
    </div>
  );
};
