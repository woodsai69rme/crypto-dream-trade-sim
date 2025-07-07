
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AccountMetricsProps {
  account: any;
}

export const AccountMetrics = ({ account }: AccountMetricsProps) => {
  // Mock performance data for mini chart
  const performanceData = Array.from({ length: 7 }, (_, i) => ({
    value: account.balance * (1 + (Math.random() - 0.5) * 0.1)
  }));

  return (
    <>
      {/* Balance and P&L */}
      <div className="text-right">
        <div className="text-2xl font-bold">${account.balance.toLocaleString()}</div>
        <div className={`text-sm flex items-center gap-1 ${
          account.total_pnl >= 0 ? 'text-crypto-success' : 'text-crypto-danger'
        }`}>
          {account.total_pnl >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)} 
          ({account.total_pnl_percentage.toFixed(1)}%)
        </div>
      </div>

      {/* 24h Performance Chart */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={account.total_pnl >= 0 ? "hsl(var(--crypto-success))" : "hsl(var(--crypto-danger))"}
              fill={account.total_pnl >= 0 ? "hsl(var(--crypto-success))" : "hsl(var(--crypto-danger))"}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account Type Badges */}
      <div className="flex items-center gap-2">
        <Badge className="text-xs bg-crypto-info/20 text-crypto-info border-crypto-info/30">
          Live
        </Badge>
        <Badge variant="outline" className="text-xs border-crypto-warning/30 text-crypto-warning">
          {account.risk_level}
        </Badge>
        <Badge className="text-xs bg-purple-500/20 text-purple-400">
          Day Trading
        </Badge>
        <Badge className="text-xs bg-red-500/20 text-red-400">
          aggressive
        </Badge>
      </div>
    </>
  );
};
