
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { FileText, TrendingUp, TrendingDown, DollarSign, Coins, Users, Download } from "lucide-react";

interface AccountAudit {
  accountId: string;
  accountName: string;
  currentBalance: number;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  topHolding: { symbol: string; value: number; percentage: number };
  lastActivity: string;
  riskLevel: string;
  status: 'active' | 'inactive' | 'restricted';
}

interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  totalValue: number;
  percentage: number;
  canSell: boolean;
  restrictions?: string[];
}

export const ComprehensiveAudit = () => {
  const { accounts } = useMultipleAccounts();
  const { toast } = useToast();
  const [accountAudits, setAccountAudits] = useState<AccountAudit[]>([]);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAuditData();
  }, [accounts]);

  const generateAuditData = async () => {
    setLoading(true);
    
    // Simulate audit data generation
    const mockAudits: AccountAudit[] = accounts.map(account => ({
      accountId: account.id,
      accountName: account.account_name,
      currentBalance: account.balance,
      totalPnL: account.total_pnl || 0,
      totalTrades: Math.floor(Math.random() * 100) + 10,
      winRate: Math.random() * 40 + 50,
      topHolding: {
        symbol: 'BTC',
        value: account.balance * 0.4,
        percentage: 40
      },
      lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      riskLevel: account.risk_level,
      status: account.status as 'active' | 'inactive' | 'restricted'
    }));

    // Generate crypto holdings data
    const mockHoldings: CryptoHolding[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 2.5,
        currentPrice: 45000,
        totalValue: 112500,
        percentage: 45,
        canSell: true
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 35,
        currentPrice: 3000,
        totalValue: 105000,
        percentage: 42,
        canSell: true
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        amount: 200,
        currentPrice: 100,
        totalValue: 20000,
        percentage: 8,
        canSell: false,
        restrictions: ['Staking lock', 'Cooling period']
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        amount: 10000,
        currentPrice: 1.25,
        totalValue: 12500,
        percentage: 5,
        canSell: true
      }
    ];

    setAccountAudits(mockAudits);
    setCryptoHoldings(mockHoldings);
    setLoading(false);
  };

  const exportAudit = () => {
    const auditData = {
      timestamp: new Date().toISOString(),
      accounts: accountAudits,
      holdings: cryptoHoldings,
      summary: {
        totalAccounts: accountAudits.length,
        totalValue: accountAudits.reduce((sum, acc) => sum + acc.currentBalance, 0),
        totalPnL: accountAudits.reduce((sum, acc) => sum + acc.totalPnL, 0),
        sellableAssets: cryptoHoldings.filter(h => h.canSell).length,
        restrictedAssets: cryptoHoldings.filter(h => !h.canSell).length
      }
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Audit Exported",
      description: "Complete audit report has been downloaded",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      case 'restricted': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Generating comprehensive audit...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Comprehensive Account Audit</h2>
        </div>
        <Button onClick={exportAudit} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Full Audit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">{accountAudits.length}</div>
            <div className="text-sm text-white/60">Total Accounts</div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold">
              ${accountAudits.reduce((sum, acc) => sum + acc.currentBalance, 0).toLocaleString()}
            </div>
            <div className="text-sm text-white/60">Total Value</div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold">
              ${accountAudits.reduce((sum, acc) => sum + acc.totalPnL, 0).toLocaleString()}
            </div>
            <div className="text-sm text-white/60">Total P&L</div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-white">
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">
              {cryptoHoldings.filter(h => h.canSell).length}/{cryptoHoldings.length}
            </div>
            <div className="text-sm text-white/60">Sellable Assets</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">Account Audit</TabsTrigger>
          <TabsTrigger value="holdings">Current Holdings</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="space-y-4">
            {accountAudits.map((audit) => (
              <Card key={audit.accountId} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{audit.accountName}</h3>
                      <p className="text-sm text-white/60">ID: {audit.accountId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(audit.status)}>
                        {audit.status.toUpperCase()}
                      </Badge>
                      <Badge className={getRiskColor(audit.riskLevel)}>
                        {audit.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-white/60">Current Balance</div>
                      <div className="font-medium">${audit.currentBalance.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Total P&L</div>
                      <div className={`font-medium ${audit.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {audit.totalPnL >= 0 ? '+' : ''}${audit.totalPnL.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Total Trades</div>
                      <div className="font-medium">{audit.totalTrades}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Win Rate</div>
                      <div className="font-medium">{audit.winRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-white/60">Top Holding</div>
                        <div className="font-medium">
                          {audit.topHolding.symbol} - ${audit.topHolding.value.toLocaleString()} ({audit.topHolding.percentage}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">Last Activity</div>
                        <div className="text-sm">{new Date(audit.lastActivity).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holdings">
          <div className="space-y-4">
            {cryptoHoldings.map((holding) => (
              <Card key={holding.symbol} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-sm">{holding.symbol}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{holding.name}</h3>
                        <p className="text-sm text-white/60">{holding.symbol}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">${holding.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-white/60">{holding.percentage}% of portfolio</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-white/60">Amount</div>
                      <div className="font-medium">{holding.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Current Price</div>
                      <div className="font-medium">${holding.currentPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Can Sell</div>
                      <div className="flex items-center gap-2">
                        {holding.canSell ? (
                          <Badge className="bg-green-500/20 text-green-400">✓ Yes</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400">✗ No</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {!holding.canSell && holding.restrictions && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-sm font-medium text-red-300 mb-1">Selling Restrictions:</div>
                      <div className="text-sm text-red-200">
                        {holding.restrictions.join(', ')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
