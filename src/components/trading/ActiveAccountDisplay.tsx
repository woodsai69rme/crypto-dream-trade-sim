
import { Settings, Activity, TrendingUp, DollarSign, Target } from "lucide-react";
import { PaperAccount } from "@/hooks/useMultipleAccounts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ActiveAccountDisplayProps {
  account: PaperAccount | null;
}

export const ActiveAccountDisplay = ({ account }: ActiveAccountDisplayProps) => {
  if (!account) return null;

  const winRate = 67.5 + Math.random() * 20; // Mock win rate
  const dailyChange = account.total_pnl * 0.1; // Mock daily change

  return (
    <Card className="mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-medium">Active Account:</span>
                <span className="font-semibold">{account.account_name}</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  LIVE
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Balance: ${account.balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    Daily: {dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>Win Rate: {winRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-white/60">Total P&L</div>
            <div className={`text-lg font-bold ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl.toFixed(2)}
            </div>
            <div className={`text-sm ${account.total_pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({account.total_pnl_percentage >= 0 ? '+' : ''}{account.total_pnl_percentage.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
