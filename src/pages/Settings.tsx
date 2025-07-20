import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Plug, Bot, Activity } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { DeribitIntegration } from "@/components/integrations/DeribitIntegration";
import { OpenRouterManagement } from "@/components/integrations/OpenRouterManagement";
import { LiveTradingIntegration } from "@/components/accounts/LiveTradingIntegration";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Settings & Integrations</h1>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="live-trading" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Trading
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <DeribitIntegration />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <OpenRouterManagement />
        </TabsContent>

        <TabsContent value="live-trading" className="space-y-6">
          <LiveTradingIntegration />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;