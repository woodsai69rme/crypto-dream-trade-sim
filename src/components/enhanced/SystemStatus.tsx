
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useSettings } from "@/hooks/useSettings";
import { Activity, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

export const SystemStatus = () => {
  const { accounts } = useMultipleAccounts();
  const { settings } = useSettings();
  const [systemHealth, setSystemHealth] = useState(85);

  const activeAIBots = accounts.filter(acc => settings[`ai_bots_${acc.id}`]).length;
  const activeFollowing = accounts.filter(acc => settings[`following_${acc.id}`]).length;
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPnL = accounts.reduce((sum, acc) => sum + acc.total_pnl, 0);

  const systemStatus = [
    {
      name: "Trading Accounts",
      value: accounts.length,
      status: accounts.length > 0 ? "operational" : "warning",
      description: `${accounts.length} accounts active`
    },
    {
      name: "AI Bots",
      value: activeAIBots,
      status: activeAIBots > 0 ? "operational" : "inactive",
      description: `${activeAIBots}/${accounts.length} bots running`
    },
    {
      name: "Trade Following",
      value: activeFollowing,
      status: activeFollowing > 0 ? "operational" : "inactive",
      description: `${activeFollowing}/${accounts.length} following enabled`
    },
    {
      name: "Total Portfolio",
      value: `$${totalBalance.toLocaleString()}`,
      status: totalPnL >= 0 ? "operational" : "warning",
      description: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)} P&L`
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "inactive":
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-400 border-green-500/30";
      case "warning":
        return "text-yellow-400 border-yellow-500/30";
      case "inactive":
        return "text-gray-400 border-gray-500/30";
      default:
        return "text-blue-400 border-blue-500/30";
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Status
          <Badge className="bg-green-500/20 text-green-400">
            All Systems Operational
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Health */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall System Health</span>
            <span className="text-green-400 font-semibold">{systemHealth}%</span>
          </div>
          <Progress value={systemHealth} className="h-2" />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemStatus.map((item, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                  {item.status}
                </Badge>
              </div>
              <div className="text-lg font-bold text-white mb-1">{item.value}</div>
              <div className="text-xs text-white/60">{item.description}</div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{accounts.length}</div>
            <div className="text-xs text-white/60">Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{activeAIBots + activeFollowing}</div>
            <div className="text-xs text-white/60">Active Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              <Zap className="w-6 h-6 mx-auto" />
            </div>
            <div className="text-xs text-white/60">All Systems Go</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
