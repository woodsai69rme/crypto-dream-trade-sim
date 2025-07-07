
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotManagement } from "./BotManagement";
import { ComprehensiveAPISettings } from "../ComprehensiveAPISettings";
import { MCPSettings } from "./MCPSettings";
import { ComprehensiveTestingSuite } from "./ComprehensiveTestingSuite";
import { TradeFollowingSettings } from "../trading/TradeFollowingSettings";
import { GlobalAccountSettings } from "./GlobalAccountSettings";
import { Settings, Bot, Key, TestTube, Users, Globe, Cog } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export const EnhancedSettingsPanel = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  const [tradeFollowingSettings, setTradeFollowingSettings] = useState({
    minConfidence: 75,
    maxPositionSize: 2500,
    autoExecute: false,
  });

  // Load settings on mount
  useEffect(() => {
    if (!isLoading && settings.tradeFollowingSettings) {
      setTradeFollowingSettings(settings.tradeFollowingSettings);
    }
  }, [isLoading, settings]);

  // Update function that saves to database
  const handleTradeFollowingChange = async (newSettings: any) => {
    setTradeFollowingSettings(newSettings);
    const success = await updateSetting('tradeFollowingSettings', newSettings);
    if (!success) {
      console.error('Failed to save trade following settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Enhanced Settings</h1>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Bots
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Settings
          </TabsTrigger>
          <TabsTrigger value="mcp" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            MCP
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <GlobalAccountSettings />
        </TabsContent>

        <TabsContent value="bots">
          <BotManagement />
        </TabsContent>

        <TabsContent value="following">
          <TradeFollowingSettings 
            settings={tradeFollowingSettings}
            onSettingsChange={handleTradeFollowingChange}
          />
        </TabsContent>

        <TabsContent value="api">
          <ComprehensiveAPISettings />
        </TabsContent>

        <TabsContent value="mcp">
          <MCPSettings />
        </TabsContent>

        <TabsContent value="testing">
          <ComprehensiveTestingSuite />
        </TabsContent>
      </Tabs>
    </div>
  );
};
