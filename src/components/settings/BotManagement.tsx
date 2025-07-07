import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { Download, Upload, StopCircle, Play, Settings, Bot, Plus } from "lucide-react";

interface BotConfig {
  id: string;
  name: string;
  strategy: string;
  settings: any;
  status: 'active' | 'paused' | 'stopped';
}

export const BotManagement = () => {
  const { toast } = useToast();
  const { settings, updateSetting, isLoading } = useSettings();
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [monitoringSettings, setMonitoringSettings] = useState({
    apiCheckDaily: 'enabled',
    newsSources: 'all',
    resourceUrls: ''
  });

  // Load bot settings on mount
  useEffect(() => {
    if (!isLoading && settings.botConfigs) {
      setBots(settings.botConfigs);
    }
    if (!isLoading && settings.monitoringSettings) {
      setMonitoringSettings(settings.monitoringSettings);
    }
  }, [isLoading, settings]);

  const stopAllBots = async () => {
    console.log('STOPPING ALL BOTS');
    const updated = bots.map(bot => ({ ...bot, status: 'stopped' as const }));
    setBots(updated);
    await updateSetting('botConfigs', updated);
    toast({
      title: "All Bots Stopped",
      description: "All trading bots have been stopped successfully",
    });
  };

  const startAllBots = async () => {
    console.log('STARTING ALL BOTS');
    const updated = bots.map(bot => ({ ...bot, status: 'active' as const }));
    setBots(updated);
    await updateSetting('botConfigs', updated);
    toast({
      title: "All Bots Started",
      description: "All trading bots have been activated",
    });
  };

  const pauseAllBots = async () => {
    console.log('PAUSING ALL BOTS');
    const updated = bots.map(bot => ({ ...bot, status: 'paused' as const }));
    setBots(updated);
    await updateSetting('botConfigs', updated);
    toast({
      title: "All Bots Paused",
      description: "All trading bots have been paused",
    });
  };

  const exportBots = () => {
    setExporting(true);
    try {
      const exportData = {
        bots: bots,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `crypto-bots-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Bots Exported",
        description: "Bot configurations have been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export bot configurations",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const importBots = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.bots && Array.isArray(importData.bots)) {
          const updated = [...bots, ...importData.bots];
          setBots(updated);
          updateSetting('botConfigs', updated);
          toast({
            title: "Bots Imported",
            description: `Successfully imported ${importData.bots.length} bot configurations`,
          });
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format or corrupted data",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const saveMonitoringSettings = async () => {
    await updateSetting('monitoringSettings', monitoringSettings);
    toast({
      title: "Monitoring Settings Saved",
      description: "Daily resource monitoring settings have been updated",
    });
  };

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Bot Management & Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={stopAllBots} variant="destructive" className="bg-red-600 hover:bg-red-700">
            <StopCircle className="w-4 h-4 mr-2" />
            Stop All
          </Button>
          <Button onClick={startAllBots} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Start All
          </Button>
          <Button onClick={pauseAllBots} variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Pause All
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Bot
          </Button>
        </div>

        {/* Import/Export */}
        <div className="flex gap-4">
          <Button 
            onClick={exportBots} 
            disabled={exporting || bots.length === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Bots'}
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importBots}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            <Button variant="outline" disabled={importing}>
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'Importing...' : 'Import Bots'}
            </Button>
          </div>
        </div>

        {/* Bot List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Active Bots ({bots.length})</h3>
          {bots.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No bots configured. Import existing bots or create new ones.
            </div>
          ) : (
            bots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium">{bot.name}</div>
                    <div className="text-sm text-white/60">{bot.strategy}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${
                      bot.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      bot.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {bot.status.toUpperCase()}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Daily Resource Check */}
        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle className="text-base">Daily Resource Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check APIs Daily</Label>
                <Select 
                  value={monitoringSettings.apiCheckDaily}
                  onValueChange={(value) => setMonitoringSettings(prev => ({ ...prev, apiCheckDaily: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>News Sources</Label>
                <Select 
                  value={monitoringSettings.newsSources}
                  onValueChange={(value) => setMonitoringSettings(prev => ({ ...prev, newsSources: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="crypto">Crypto Only</SelectItem>
                    <SelectItem value="trading">Trading Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Resource URLs (one per line)</Label>
              <Textarea 
                value={monitoringSettings.resourceUrls}
                onChange={(e) => setMonitoringSettings(prev => ({ ...prev, resourceUrls: e.target.value }))}
                placeholder="Enter URLs to monitor daily...&#10;https://api.example.com/crypto&#10;https://news.example.com/feed"
                className="bg-white/10 border-white/20 min-h-20"
              />
            </div>
            <Button onClick={saveMonitoringSettings} className="w-full">
              Save Monitoring Settings
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};