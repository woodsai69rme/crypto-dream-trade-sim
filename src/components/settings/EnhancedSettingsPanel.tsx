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
import { TradingAssistant } from "../ai/TradingAssistant";
import { Settings, Bot, Key, TestTube, Users, Globe, Cog, Star, Cpu, Workflow, MessageSquare, Wallet, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { N8NLocalConnection } from "../integrations/N8NLocalConnection";
import { APIManagement } from "../integrations/APIManagement";
import { TradingResearch } from "../research/TradingResearch";
import { ComprehensiveAudit } from "../audit/ComprehensiveAudit";
import { MultiAccountBotManager } from "../bots/MultiAccountBotManager";
import { EnhancedMultiAccountBotManager } from "../bots/EnhancedMultiAccountBotManager";
import { LiveTradingHub } from "../enhanced/LiveTradingHub";
import { ComprehensiveAuditDashboard } from "../enhanced/ComprehensiveAuditDashboard";
import { SocialSentimentMonitor } from "../SocialSentimentMonitor";
import { PriceAlertsManager } from "../PriceAlertsManager";
import { ComprehensiveTradeFollowingSystem } from "../trading/ComprehensiveTradeFollowingSystem";

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

      <Tabs defaultValue="complete-system" className="w-full">
        <TabsList className="grid w-full grid-cols-12 bg-card/50 backdrop-blur-sm text-xs">
          <TabsTrigger value="complete-system" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Complete System
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Global
          </TabsTrigger>
          <TabsTrigger value="live-trading" className="flex items-center gap-1">
            <Wallet className="w-3 h-3" />
            Live Trading
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Social
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="multi-bots" className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Multi-Bots
          </TabsTrigger>
          <TabsTrigger value="research" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Research
          </TabsTrigger>
          <TabsTrigger value="n8n" className="flex items-center gap-1">
            <Workflow className="w-3 h-3" />
            N8N
          </TabsTrigger>
          <TabsTrigger value="api-mgmt" className="flex items-center gap-1">
            <Key className="w-3 h-3" />
            APIs
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="traders" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Traders
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Bots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complete-system">
          <ComprehensiveTradeFollowingSystem />
        </TabsContent>

        <TabsContent value="global">
          <GlobalAccountSettings />
        </TabsContent>

        <TabsContent value="live-trading">
          <LiveTradingHub />
        </TabsContent>

        <TabsContent value="social">
          <SocialSentimentMonitor />
        </TabsContent>

        <TabsContent value="alerts">
          <PriceAlertsManager />
        </TabsContent>

        <TabsContent value="audit">
          <ComprehensiveAuditDashboard />
        </TabsContent>

        <TabsContent value="multi-bots">
          <EnhancedMultiAccountBotManager />
        </TabsContent>

        <TabsContent value="research">
          <TradingResearch />
        </TabsContent>

        <TabsContent value="n8n">
          <N8NLocalConnection />
        </TabsContent>

        <TabsContent value="api-mgmt">
          <APIManagement />
        </TabsContent>

        <TabsContent value="assistant">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradingAssistant />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-foreground">AI Assistant Features</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-card/20 rounded-lg">
                  <h4 className="font-medium mb-2">Market Analysis</h4>
                  <p className="text-sm text-muted-foreground">Get real-time insights on cryptocurrency markets and trends.</p>
                </div>
                <div className="p-4 bg-card/20 rounded-lg">
                  <h4 className="font-medium mb-2">Trading Strategies</h4>
                  <p className="text-sm text-muted-foreground">Learn about different trading approaches and risk management.</p>
                </div>
                <div className="p-4 bg-card/20 rounded-lg">
                  <h4 className="font-medium mb-2">Portfolio Advice</h4>
                  <p className="text-sm text-muted-foreground">Get personalized recommendations for your trading portfolio.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="traders">
          <ComprehensiveTopTraders />
        </TabsContent>

        <TabsContent value="bots">
          <BotManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
