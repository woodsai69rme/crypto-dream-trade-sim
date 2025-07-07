
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bot, Users, RefreshCw } from 'lucide-react';

interface AccountControlsProps {
  accountId: string;
}

export const AccountControls = ({ accountId }: AccountControlsProps) => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, updateSetting, isLoading } = useSettings();

  const aiBotsEnabled = Boolean(settings[`ai_bots_${accountId}`]);
  const followingEnabled = Boolean(settings[`following_${accountId}`]);

  const toggleAIBots = async (enabled: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update settings",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const success = await updateSetting(`ai_bots_${accountId}`, enabled);
      
      if (success) {
        toast({
          title: enabled ? "AI Bots Enabled" : "AI Bots Disabled",
          description: `AI trading bots ${enabled ? 'activated' : 'deactivated'}`,
        });
      }
    } catch (error) {
      console.error('Error toggling AI bots:', error);
      toast({
        title: "Error",
        description: "Failed to update AI bot settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFollowing = async (enabled: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update settings",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const success = await updateSetting(`following_${accountId}`, enabled);
      
      if (success) {
        toast({
          title: enabled ? "Following Enabled" : "Following Disabled",
          description: `Trade following ${enabled ? 'activated' : 'deactivated'}`,
        });
      }
    } catch (error) {
      console.error('Error toggling following:', error);
      toast({
        title: "Error",
        description: "Failed to update following settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-crypto-info" />
          <Label className="text-sm">AI Bots</Label>
        </div>
        <div className="flex items-center gap-2">
          {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
          <Switch
            checked={aiBotsEnabled}
            onCheckedChange={toggleAIBots}
            disabled={saving || isLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-crypto-warning" />
          <Label className="text-sm">Following</Label>
        </div>
        <div className="flex items-center gap-2">
          {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
          <Switch
            checked={followingEnabled}
            onCheckedChange={toggleFollowing}
            disabled={saving || isLoading}
          />
        </div>
      </div>
    </div>
  );
};
