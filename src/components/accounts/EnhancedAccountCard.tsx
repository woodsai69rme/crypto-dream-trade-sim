
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Eye, Copy, Settings, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface EnhancedAccountCardProps {
  account: any;
  onSwitchAccount: (accountId: string) => void;
  isActive: boolean;
}

export const EnhancedAccountCard = ({ account, onSwitchAccount, isActive }: EnhancedAccountCardProps) => {
  const mockPerformanceData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    value: account.balance * (1 + (Math.random() - 0.5) * 0.1)
  }));

  const mockVolumeData = Array.from({ length: 12 }, (_, i) => Math.random() * 100);

  const winRate = 73.5 + Math.random() * 20;
  const totalTrades = Math.floor(Math.random() * 200) + 50;
  const dailyPnL = account.total_pnl * 0.05;

  return (
    <Card className={`bg-slate-900 border-slate-800 text-white relative overflow-hidden ${
      isActive ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
              <span className="text-xs font-bold">{account.account_name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{account.account_name}</h3>
                <Badge className={`px-2 py-0.5 text-xs ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                  {account.risk_level?.toUpperCase() || 'MEDIUM'}
                </Badge>
                <span className="text-xs text-slate-500">aggressive growth</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-xs text-slate-400 mb-1">Balance</div>
          <div className="text-2xl font-bold">${account.balance?.toLocaleString()}</div>
          <div className={`text-sm ${account.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {account.total_pnl >= 0 ? '+' : ''}${account.total_pnl?.toFixed(2)} ({account.total_pnl_percentage?.toFixed(2)}%)
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>30d Performance</span>
            <span>7 data points</span>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-xs text-slate-400 mb-1">Win Rate</div>
            <div className="text-lg font-bold text-blue-400">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Trades</div>
            <div className="text-lg font-bold text-green-400">{totalTrades}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Daily P&L</div>
            <div className={`text-lg font-bold ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? '+' : ''}${Math.abs(dailyPnL).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Volume</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <BarChart3 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-end gap-1 h-8">
            {mockVolumeData.map((height, i) => (
              <div 
                key={i} 
                className="bg-blue-500 rounded-sm flex-1"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Live Audit</span>
            <span className="text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Live
            </span>
          </div>
          <div className="text-xs text-slate-500">
            <div>Trade executed: BTC +0.01</div>
            <div>AI signal generated</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-600 hover:bg-slate-800"
            onClick={() => onSwitchAccount(account.id)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
