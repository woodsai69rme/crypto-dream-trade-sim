import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { Users, Save } from "lucide-react";
import { useEffect, useState } from "react";

interface TradeFollowingSettingsProps {
  settings: {
    minConfidence: number;
    maxPositionSize: number;
    autoExecute: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const TradeFollowingSettings = ({ settings, onSettingsChange }: TradeFollowingSettingsProps) => {
  const { updateSetting } = useSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    const success = await updateSetting('tradeFollowingSettings', localSettings);
    if (success) {
      onSettingsChange(localSettings);
      toast({
        title: "Settings Saved",
        description: "Trade following settings updated successfully",
      });
    }
  };

  const updateLocalSetting = async (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Auto-save on change
    const success = await updateSetting('tradeFollowingSettings', newSettings);
    if (success) {
      onSettingsChange(newSettings);
    }
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Trade Following Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Min Confidence:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="95"
              value={localSettings.minConfidence}
              onChange={(e) => updateLocalSetting('minConfidence', parseInt(e.target.value))}
              className="w-20"
            />
            <span className="font-medium w-10">{localSettings.minConfidence}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Max Position Size:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={localSettings.maxPositionSize}
              onChange={(e) => updateLocalSetting('maxPositionSize', parseInt(e.target.value))}
              className="w-20"
            />
            <span className="font-medium">${localSettings.maxPositionSize}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Auto Execute:</span>
          <Switch 
            checked={localSettings.autoExecute} 
            onCheckedChange={(checked) => updateLocalSetting('autoExecute', checked)} 
          />
        </div>
        
        <Button onClick={handleSave} className="w-full mt-4">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};