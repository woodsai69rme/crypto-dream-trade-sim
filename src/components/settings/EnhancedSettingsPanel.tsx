
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotManagement } from "./BotManagement";
import { ComprehensiveAPISettings } from "../ComprehensiveAPISettings";
import { MCPSettings } from "./MCPSettings";
import { ComprehensiveTestingSuite } from "./ComprehensiveTestingSuite";
import { TradeFollowingSettings } from "../trading/TradeFollowingSettings";
import { GlobalAccountSettings } from "./GlobalAccountSettings";
import { ComprehensiveTopTraders } from "../enhanced/ComprehensiveTopTraders";
import { AIModelManager } from "../enhanced/AIModelManager";
import { TradingWorkflowManager } from "../enhanced/TradingWorkflowManager";
import { Settings, Bot, Key, TestTube, Users, Globe, Cog, Star, Cpu, Workflow } from "lucide-react";
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
        <h1 className="text-3xl font-bold text-primary-foreground">Complete Trading System</h1>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-9 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="traders" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Top Traders
          </TabsTrigger>
          <TabsTrigger value="ai-models" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflows
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
            APIs
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

        <TabsContent value="traders">
          <ComprehensiveTopTraders />
        </TabsContent>

        <TabsContent value="ai-models">
          <AIModelManager />
        </TabsContent>

        <TabsContent value="workflows">
          <TradingWorkflowManager />
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
