
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { Bot, Users, Play, Pause, Settings, CheckCircle, XCircle } from "lucide-react";

interface BotStatus {
  accountId: string;
  accountName: string;
  botId: string;
  botName: string;
  isActive: boolean;
  isFollowing: boolean;
  performance: {
    totalTrades: number;
    winRate: number;
    totalReturn: number;
  };
  lastActivity: string;
}

export const MultiAccountBotManager = () => {
  const { accounts } = useMultipleAccounts();
  const { toast } = useToast();
  const [botStatuses, setBotStatuses] = useState<BotStatus[]>([]);
  const [globalBotControl, setGlobalBotControl] = useState(false);
  const [globalFollowingControl, setGlobalFollowingControl] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateBotStatuses();
  }, [accounts]);

  const generateBotStatuses = () => {
    const mockBotTypes = [
      'Bitcoin Trend Master',
      'Ethereum Grid Bot',
      'Multi-Coin DCA',
      'Solana Breakout Hunter',
      'Arbitrage Scanner'
    ];

    const statuses: BotStatus[] = accounts.flatMap(account => 
      mockBotTypes.slice(0, Math.floor(Math.random() * 3) + 1).map((botName, index) => ({
        accountId: account.id,
        accountName: account.account_name,
        botId: `${account.id}-bot-${index}`,
        botName,
        isActive: Math.random() > 0.5,
        isFollowing: Math.random() > 0.6,
        performance: {
          totalTrades: Math.floor(Math.random() * 50) + 10,
          winRate: Math.random() * 30 + 60,
          totalReturn: (Math.random() - 0.5) * 20
        },
        lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }))
    );

    setBotStatuses(statuses);
  };

  const toggleAllBots = async (enabled: boolean) => {
    setLoading(true);
    setGlobalBotControl(enabled);
    
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBotStatuses(prev => prev.map(status => ({
        ...status,
        isActive: enabled
      })));

      toast({
        title: enabled ? "All Bots Activated" : "All Bots Deactivated",
        description: `AI trading bots ${enabled ? 'started' : 'stopped'} across all accounts`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot status for all accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAllFollowing = async (enabled: boolean) => {
    setLoading(true);
    setGlobalFollowingControl(enabled);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBotStatuses(prev => prev.map(status => ({
        ...status,
        isFollowing: enabled
      })));

      toast({
        title: enabled ? "Following Enabled on All Accounts" : "Following Disabled on All Accounts",
        description: `Trade following ${enabled ? 'activated' : 'deactivated'} across all accounts`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update following status for all accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBotForAccount = (botId: string) => {
    setBotStatuses(prev => prev.map(status => 
      status.botId === botId 
        ? { ...status, isActive: !status.isActive }
        : status
    ));
  };

  const toggleFollowingForAccount = (botId: string) => {
    setBotStatuses(prev => prev.map(status => 
      status.botId === botId 
        ? { ...status, isFollowing: !status.isFollowing }
        : status
    ));
  };

  const groupedStatuses = botStatuses.reduce((acc, status) => {
    if (!acc[status.accountId]) {
      acc[status.accountId] = {
        accountName: status.accountName,
        bots: []
      };
    }
    acc[status.accountId].bots.push(status);
    return acc;
  }, {} as {[key: string]: {accountName: string, bots: BotStatus[]}});

  const activeBots = botStatuses.filter(s => s.isActive).length;
  const activeFollowing = botStatuses.filter(s => s.isFollowing).length;
  const totalBots = botStatuses.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">Multi-Account AI Bot Manager</h2>
      </div>

      {/* Global Controls */}
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Global Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{accounts.length}</div>
              <div className="text-sm text-white/60">Total Accounts</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{activeBots}/{totalBots}</div>
              <div className="text-sm text-white/60">Active Bots</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{activeFollowing}/{totalBots}</div>
              <div className="text-sm text-white/60">Following Active</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable All AI Bots</div>
                  <div className="text-sm text-white/60">
                    Start/stop AI trading bots across all {accounts.length} accounts
                  </div>
                </div>
                <Switch
                  checked={globalBotControl}
                  onCheckedChange={toggleAllBots}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex-1 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable All Following</div>
                  <div className="text-sm text-white/60">
                    Activate trade following across all {accounts.length} accounts
                  </div>
                </div>
                <Switch
                  checked={globalFollowingControl}
                  onCheckedChange={toggleAllFollowing}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center text-sm text-white/60">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto mb-2"></div>
              Updating bot configurations across all accounts...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account-specific Bot Management */}
      <div className="space-y-4">
        {Object.entries(groupedStatuses).map(([accountId, data]) => (
          <Card key={accountId} className="crypto-card-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {data.accountName}
                </div>
                <Badge variant="outline">
                  {data.bots.filter(b => b.isActive).length}/{data.bots.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.bots.map((bot) => (
                  <div key={bot.botId} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {bot.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium">{bot.botName}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={bot.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                            {bot.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {bot.isFollowing && (
                            <Badge className="bg-blue-500/20 text-blue-400">Following</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="text-white/60">Win Rate</div>
                          <div className="font-medium">{bot.performance.winRate.toFixed(1)}%</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-white/60">Return</div>
                          <div className={`font-medium ${bot.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {bot.performance.totalReturn >= 0 ? '+' : ''}{bot.performance.totalReturn.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{bot.performance.totalTrades} trades</span>
                        <span>Last: {new Date(bot.lastActivity).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBotForAccount(bot.botId)}
                        >
                          {bot.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Switch
                          checked={bot.isFollowing}
                          onCheckedChange={() => toggleFollowingForAccount(bot.botId)}
                          disabled={!bot.isActive}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
