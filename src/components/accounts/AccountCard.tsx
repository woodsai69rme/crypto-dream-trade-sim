
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AccountControls } from './AccountControls';
import { AccountMetrics } from './AccountMetrics';
import { Wallet, TrendingUp, TrendingDown, Activity, Target, Shield, Zap } from 'lucide-react';

interface AccountCardProps {
  account: any;
  onSwitchAccount: (accountId: string) => void;
  isActive: boolean;
}

export const AccountCard = ({ account, onSwitchAccount, isActive }: AccountCardProps) => {
  const riskLevel = account.risk_level || 'medium';
  const winRate = 67.5 + Math.random() * 20; // Mock win rate
  const totalTrades = Math.floor(Math.random() * 100) + 20;
  const dailyPnL = account.total_pnl * 0.1;
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'aggressive': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <Card className={`crypto-card-gradient text-primary-foreground transition-all duration-300 ${
      isActive ? 'ring-2 ring-primary crypto-glow' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-crypto-bitcoin to-crypto-ethereum flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{account.account_name}</CardTitle>
                {isActive && <Badge variant="secondary" className="text-xs bg-crypto-success/20 text-crypto-success">Active</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRiskColor(riskLevel)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {riskLevel.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">{account.account_type}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-white/60">Balance</div>
            <div className="text-xl font-bold">${account.balance?.toLocaleString()}</div>
            <div className={`text-sm ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl?.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-white/60">Win Rate</span>
            </div>
            <div className="text-sm font-bold">{winRate.toFixed(1)}%</div>
            <Progress value={winRate} className="h-1 mt-1" />
          </div>
          
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-white/60">Trades</span>
            </div>
            <div className="text-sm font-bold">{totalTrades}</div>
            <div className="text-xs text-white/60">Total</div>
          </div>
          
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-white/60">Daily P&L</span>
            </div>
            <div className={`text-sm font-bold ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">ROI:</span>
            <span className={`font-semibold ${account.total_pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {account.total_pnl_percentage >= 0 ? '+' : ''}{account.total_pnl_percentage?.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Status:</span>
            <Badge className="bg-green-500/20 text-green-400">
              {account.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <AccountControls accountId={account.id} />

        {/* Action Button */}
        {!isActive && (
          <Button
            onClick={() => onSwitchAccount(account.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            variant="default"
          >
            Switch to Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
