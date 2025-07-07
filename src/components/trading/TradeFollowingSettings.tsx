import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TradeFollowingSettingsProps {
  settings: {
    minConfidence: number;
    maxPositionSize: number;
    autoExecute: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const TradeFollowingSettings = ({ settings, onSettingsChange }: TradeFollowingSettingsProps) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
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
              value={settings.minConfidence}
              onChange={(e) => updateSetting('minConfidence', parseInt(e.target.value))}
              className="w-20"
            />
            <span className="font-medium w-10">{settings.minConfidence}%</span>
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
              value={settings.maxPositionSize}
              onChange={(e) => updateSetting('maxPositionSize', parseInt(e.target.value))}
              className="w-20"
            />
            <span className="font-medium">${settings.maxPositionSize}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Auto Execute:</span>
          <Switch 
            checked={settings.autoExecute} 
            onCheckedChange={(checked) => updateSetting('autoExecute', checked)} 
          />
        </div>
      </CardContent>
    </Card>
  );
};