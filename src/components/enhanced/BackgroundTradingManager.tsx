import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBackgroundTrading } from "@/hooks/useBackgroundTrading";
import { 
  Activity, 
  Bot, 
  Users, 
  TrendingUp, 
  Play, 
  Pause, 
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

export const BackgroundTradingManager = () => {
  const {
    status,
    isRunning,
    startTradeFollowing,
    stopTradeFollowing,
    startAIBots,
    stopAIBots,
    startAll,
    stopAll,
  } = useBackgroundTrading();

  const formatLastTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Background Trading Manager</h2>
          <Badge className={isRunning ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {isRunning ? 'Running' : 'Stopped'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={startAll}
            disabled={status.tradeFollowing.active && status.aiBots.active}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start All
          </Button>
          <Button
            onClick={stopAll}
            disabled={!status.tradeFollowing.active && !status.aiBots.active}
            variant="destructive"
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop All
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trade Following Status */}
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Trade Following
              </div>
              <Switch
                checked={status.tradeFollowing.active}
                onCheckedChange={(checked) => {
                  if (checked) {
                    startTradeFollowing();
                  } else {
                    stopTradeFollowing();
                  }
                }}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/60">Active Accounts</span>
                </div>
                <div className="text-xl font-bold">{status.tradeFollowing.accountsActive}</div>
              </div>
              
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white/60">Signals Generated</span>
                </div>
                <div className="text-xl font-bold">{status.tradeFollowing.signalsGenerated}</div>
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/60">Last Signal:</span>
                <span className="text-sm font-medium">
                  {formatLastTime(status.tradeFollowing.lastSignal)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {status.tradeFollowing.active ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Running in background</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Inactive</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Bots Status */}
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Trading Bots
              </div>
              <Switch
                checked={status.aiBots.active}
                onCheckedChange={(checked) => {
                  if (checked) {
                    startAIBots();
                  } else {
                    stopAIBots();
                  }
                }}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/60">Active Bots</span>
                </div>
                <div className="text-xl font-bold">{status.aiBots.botsActive}</div>
              </div>
              
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-white/60">Trades Executed</span>
                </div>
                <div className="text-xl font-bold">{status.aiBots.tradesExecuted}</div>
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/60">Last Trade:</span>
                <span className="text-sm font-medium">
                  {formatLastTime(status.aiBots.lastTrade)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {status.aiBots.active ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Running in background</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Inactive</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Panel */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            Background Trading Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-white">✅ What continues in background:</h4>
              <ul className="space-y-1 text-white/70">
                <li>• Trade signal generation and processing</li>
                <li>• AI bot trading across accounts</li>
                <li>• Performance tracking and analytics</li>
                <li>• Risk management monitoring</li>
                <li>• Audit trail logging</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-white">🔄 How it works:</h4>
              <ul className="space-y-1 text-white/70">
                <li>• Services run independently of UI</li>
                <li>• State persisted across browser sessions</li>
                <li>• Automatic reconnection on page refresh</li>
                <li>• Works even when tab is minimized</li>
                <li>• Safe to navigate between pages</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Background Trading Active</p>
                <p className="text-white/70">
                  Your trading systems will continue operating even when you navigate to other pages, 
                  close the tab, or minimize the browser. State is automatically saved and restored.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};