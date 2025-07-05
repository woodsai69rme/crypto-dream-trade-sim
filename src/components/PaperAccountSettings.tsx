
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, RefreshCw, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PaperAccountSettings = () => {
  const [startingBalance, setStartingBalance] = useState("100000");
  const [autoTrading, setAutoTrading] = useState(false);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [followTraders, setFollowTraders] = useState(true);
  const { toast } = useToast();

  const accountStats = {
    startingBalance: 100000,
    currentBalance: 107230.45,
    totalPnL: 7230.45,
    totalPnLPercent: 7.23,
    totalTrades: 47,
    winRate: 68.1,
    bestTrade: 1234.56,
    worstTrade: -456.78
  };

  const handleResetAccount = () => {
    toast({
      title: "Account Reset",
      description: "Your paper trading account has been reset successfully.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your paper trading settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paper Trading Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold">${accountStats.currentBalance.toLocaleString()}</div>
              <div className="text-sm text-white/60">Current Balance</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">
                +${accountStats.totalPnL.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">Total P&L</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{accountStats.totalTrades}</div>
              <div className="text-sm text-white/60">Total Trades</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-green-400">{accountStats.winRate}%</div>
              <div className="text-sm text-white/60">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="startingBalance">Starting Balance (USD)</Label>
              <Input
                id="startingBalance"
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="bg-white/10 border-white/20"
              />
              <p className="text-xs text-white/60">
                This will reset your account with the new starting balance
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto Trading</Label>
                <p className="text-xs text-white/60">
                  Automatically follow top traders' moves
                </p>
              </div>
              <Switch
                checked={autoTrading}
                onCheckedChange={setAutoTrading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Follow Top Traders</Label>
                <p className="text-xs text-white/60">
                  Mirror trades from followed traders
                </p>
              </div>
              <Switch
                checked={followTraders}
                onCheckedChange={setFollowTraders}
              />
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {["low", "medium", "high"].map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={riskLevel === level ? "default" : "outline"}
                    onClick={() => setRiskLevel(level)}
                    className={`${
                      riskLevel === level
                        ? level === "low" ? "bg-green-600" : level === "medium" ? "bg-yellow-600" : "bg-red-600"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveSettings}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Save Settings
              </Button>
              <Button
                onClick={handleResetAccount}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trading Performance */}
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Starting Balance</span>
                <span className="font-bold">${accountStats.startingBalance.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Current Balance</span>
                <span className="font-bold">${accountStats.currentBalance.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Total Return</span>
                <div className="text-right">
                  <div className="font-bold text-green-400">
                    +${accountStats.totalPnL.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-400">
                    +{accountStats.totalPnLPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Best Trade</span>
                <span className="font-bold text-green-400">
                  +${accountStats.bestTrade.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Worst Trade</span>
                <span className="font-bold text-red-400">
                  ${accountStats.worstTrade.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Win Rate</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {accountStats.winRate}%
                </Badge>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Paper Trading Notice</h4>
                  <p className="text-sm text-white/70">
                    This is a simulated trading environment. No real money is involved. 
                    Performance may not reflect real market conditions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
