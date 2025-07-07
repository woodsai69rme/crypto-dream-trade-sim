import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotManagement } from "./BotManagement";
import { ComprehensiveAPISettings } from "../ComprehensiveAPISettings";
import { MCPSettings } from "./MCPSettings";
import { ComprehensiveTestingSuite } from "./ComprehensiveTestingSuite";
import { TradeFollowingSettings } from "../trading/TradeFollowingSettings";
import { Settings, Bot, Key, TestTube, Users } from "lucide-react";
import { useState } from "react";

export const SettingsPanel = () => {
  const [tradeFollowingSettings, setTradeFollowingSettings] = useState({
    minConfidence: 75,
    maxPositionSize: 2500,
    autoExecute: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Settings</h1>
      </div>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
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
            <Settings className="w-4 h-4" />
            MCP
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bots">
          <BotManagement />
        </TabsContent>

        <TabsContent value="following">
          <TradeFollowingSettings 
            settings={tradeFollowingSettings}
            onSettingsChange={setTradeFollowingSettings}
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