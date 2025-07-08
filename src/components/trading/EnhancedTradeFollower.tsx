
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRealTimeTradeFollowing } from '@/hooks/useRealTimeTradeFollowing';
import { TradeSignalCard, TradeSignal } from './TradeSignal';
import { Users, Activity, TrendingUp, Settings, CheckCircle, XCircle } from 'lucide-react';

export const EnhancedTradeFollower = () => {
  const {
    signals,
    isActive,
    accountSettings,
    stats,
    startFollowing,
    stopFollowing,
    updateAccountSettings,
    getAccountStats,
    activeAccounts,
    totalAccounts
  } = useRealTimeTradeFollowing();

  const accountStats = getAccountStats();
  const [expandedSettings, setExpandedSettings] = useState<string | null>(null);

  const handleFollowTrade = async (signal: TradeSignal) => {
    console.log('Manual trade execution triggered:', signal);
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Enhanced Multi-Account Trade Following
          <Badge className={`ml-auto ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {isActive ? `Active on ${activeAccounts}/${totalAccounts}` : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Controls */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium">Multi-Account Trade Following</h3>
            <p className="text-sm text-white/60">
              Synchronized trading across {totalAccounts} accounts with staggered execution
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={isActive ? stopFollowing : startFollowing}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-blue-400">{stats.totalSignals}</div>
            <div className="text-xs text-white/60">Total Signals</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-green-400">{stats.executedTrades}</div>
            <div className="text-xs text-white/60">Executed Trades</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-purple-400">{activeAccounts}</div>
            <div className="text-xs text-white/60">Active Accounts</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-yellow-400">{Math.round(stats.avgLatency)}ms</div>
            <div className="text-xs text-white/60">Avg Latency</div>
          </div>
        </div>

        {/* Per-Account Configuration */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Account-Specific Settings
          </h3>
          
          {accountStats.map((account) => (
            <div key={account.accountId} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {account.settings?.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                  <Badge variant="outline">
                    ${account.balance.toFixed(0)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-white/60">Trades: {account.stats.trades}</div>
                    <div className="text-white/60">Last: {account.stats.lastTrade}</div>
                  </div>
                  <Switch
                    checked={account.settings?.isActive || false}
                    onCheckedChange={(checked) => 
                      updateAccountSettings(account.accountId, { isActive: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSettings(
                      expandedSettings === account.accountId ? null : account.accountId
                    )}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {expandedSettings === account.accountId && account.settings && (
                <div className="space-y-4 pt-3 border-t border-white/10">
                  <div>
                    <label className="text-sm text-white/80">Min Confidence: {account.settings.minConfidence}%</label>
                    <Slider
                      value={[account.settings.minConfidence]}
                      onValueChange={(value) => 
                        updateAccountSettings(account.accountId, { minConfidence: value[0] })
                      }
                      max={100}
                      min={50}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/80">Follow Ratio: {(account.settings.followRatio * 100).toFixed(0)}%</label>
                    <Slider
                      value={[account.settings.followRatio * 100]}
                      onValueChange={(value) => 
                        updateAccountSettings(account.accountId, { followRatio: value[0] / 100 })
                      }
                      max={100}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/80">Execution Delay: {account.settings.delayMs}ms</label>
                    <Slider
                      value={[account.settings.delayMs]}
                      onValueChange={(value) => 
                        updateAccountSettings(account.accountId, { delayMs: value[0] })
                      }
                      max={2000}
                      min={0}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Signals */}
        {isActive && (
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Trading Signals ({signals.length})
            </h3>
            
            {signals.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>Generating trading signals...</p>
                <p className="text-sm mt-2">Signals will execute across all active accounts</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {signals.slice(0, 10).map((signal) => (
                  <TradeSignalCard
                    key={signal.id}
                    signal={signal}
                    onExecute={handleFollowTrade}
                    autoExecute={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-200">
            <strong>Multi-Account Trading:</strong> Each account has individual settings for confidence thresholds, 
            follow ratios, and execution delays. This ensures diversified trading behavior across your portfolio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
