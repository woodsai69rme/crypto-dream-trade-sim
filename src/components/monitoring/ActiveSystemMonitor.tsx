
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Users, Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface SystemStatus {
  aiBots: {
    total: number;
    active: number;
    paused: number;
    lastCheck: string;
  };
  following: {
    total: number;
    active: number;
    inactive: number;
    lastCheck: string;
  };
  autoRestart: boolean;
}

export const ActiveSystemMonitor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<SystemStatus>({
    aiBots: { total: 0, active: 0, paused: 0, lastCheck: '' },
    following: { total: 0, active: 0, inactive: 0, lastCheck: '' },
    autoRestart: false
  });
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (user) {
      checkSystemStatus();
      
      // Set up monitoring interval
      const interval = setInterval(() => {
        if (monitoring) {
          checkSystemStatus();
          maintainActiveStatus();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, monitoring]);

  const checkSystemStatus = async () => {
    if (!user) return;

    try {
      // Check AI Bots
      const { data: bots, error: botsError } = await supabase
        .from('ai_trading_bots')
        .select('id, status')
        .eq('user_id', user.id);

      if (botsError) throw botsError;

      const botStatus = {
        total: bots?.length || 0,
        active: bots?.filter(bot => bot.status === 'active').length || 0,
        paused: bots?.filter(bot => bot.status === 'paused').length || 0,
        lastCheck: new Date().toLocaleTimeString()
      };

      // Check Following System
      const { data: follows, error: followsError } = await supabase
        .from('trader_follows')
        .select('id, is_active')
        .eq('user_id', user.id);

      if (followsError) throw followsError;

      const followStatus = {
        total: follows?.length || 0,
        active: follows?.filter(f => f.is_active).length || 0,
        inactive: follows?.filter(f => !f.is_active).length || 0,
        lastCheck: new Date().toLocaleTimeString()
      };

      setStatus(prev => ({
        ...prev,
        aiBots: botStatus,
        following: followStatus
      }));

    } catch (error) {
      console.error('Error checking system status:', error);
      toast({
        title: "Monitoring Error",
        description: "Failed to check system status",
        variant: "destructive",
      });
    }
  };

  const maintainActiveStatus = async () => {
    if (!user || !status.autoRestart) return;

    try {
      // Reactivate paused AI bots
      if (status.aiBots.paused > 0) {
        const { error: botError } = await supabase
          .from('ai_trading_bots')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('status', 'paused');

        if (botError) throw botError;

        toast({
          title: "AI Bots Reactivated",
          description: `${status.aiBots.paused} AI bots have been reactivated`,
        });
      }

      // Reactivate inactive following
      if (status.following.inactive > 0) {
        const { error: followError } = await supabase
          .from('trader_follows')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('is_active', false);

        if (followError) throw followError;

        toast({
          title: "Following Reactivated",
          description: `${status.following.inactive} trader follows have been reactivated`,
        });
      }

      // Refresh status after reactivation
      await checkSystemStatus();

    } catch (error) {
      console.error('Error maintaining active status:', error);
      toast({
        title: "Auto-Restart Failed",
        description: "Could not maintain active status automatically",
        variant: "destructive",
      });
    }
  };

  const toggleAutoRestart = (enabled: boolean) => {
    setStatus(prev => ({ ...prev, autoRestart: enabled }));
    
    toast({
      title: enabled ? "Auto-Restart Enabled" : "Auto-Restart Disabled",
      description: enabled 
        ? "System will automatically keep AI bots and following active"
        : "Auto-restart has been disabled",
    });
  };

  const manualRestart = async () => {
    await maintainActiveStatus();
  };

  const startMonitoring = () => {
    setMonitoring(true);
    checkSystemStatus();
    toast({
      title: "Monitoring Started",
      description: "System monitoring is now active",
    });
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "System monitoring has been disabled",
    });
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Active System Monitor
          <Badge className={monitoring ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {monitoring ? 'Monitoring' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monitor Controls */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium">System Monitoring</h3>
            <p className="text-sm text-white/60">
              Continuously monitor and maintain AI bots and following systems
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={monitoring}
              onCheckedChange={monitoring ? stopMonitoring : startMonitoring}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={checkSystemStatus}
              className="border-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Auto-Restart Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium">Auto-Restart Systems</h3>
            <p className="text-sm text-white/60">
              Automatically reactivate paused bots and inactive following
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={status.autoRestart}
              onCheckedChange={toggleAutoRestart}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={manualRestart}
              className="border-white/20"
            >
              Restart Now
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">System Status</h3>
          
          {/* AI Bots Status */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium">AI Trading Bots</h4>
              </div>
              <div className="flex items-center gap-2">
                {status.aiBots.active === status.aiBots.total && status.aiBots.total > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-white/60">
                  Last check: {status.aiBots.lastCheck}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{status.aiBots.total}</div>
                <div className="text-xs text-white/60">Total Bots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{status.aiBots.active}</div>
                <div className="text-xs text-white/60">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{status.aiBots.paused}</div>
                <div className="text-xs text-white/60">Paused</div>
              </div>
            </div>
          </div>

          {/* Following Status */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                <h4 className="font-medium">Trade Following</h4>
              </div>
              <div className="flex items-center gap-2">
                {status.following.active === status.following.total && status.following.total > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-white/60">
                  Last check: {status.following.lastCheck}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{status.following.total}</div>
                <div className="text-xs text-white/60">Total Follows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{status.following.active}</div>
                <div className="text-xs text-white/60">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{status.following.inactive}</div>
                <div className="text-xs text-white/60">Inactive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-200">
            <strong>Auto-Monitor:</strong> Keep this monitor active to ensure your AI bots and 
            trade following systems stay operational. The system will automatically restart 
            any paused or inactive components when enabled.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
