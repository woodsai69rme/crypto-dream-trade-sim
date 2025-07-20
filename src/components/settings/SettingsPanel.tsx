
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalAccountSettings } from "./GlobalAccountSettings";
import { ActiveSystemMonitor } from "../monitoring/ActiveSystemMonitor";
import { SystemHealthMonitor } from "../monitoring/SystemHealthMonitor";
import { ComprehensiveAudit } from "../audit/ComprehensiveAudit";
import { ComprehensiveSystemAudit } from "../audit/ComprehensiveSystemAudit";
import { MultiAccountBotManager } from "../bots/MultiAccountBotManager";
import { Settings, Activity, FileText, Bot, Shield, BarChart3 } from "lucide-react";

export const SettingsPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">System Control Center</h1>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Bots
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="system-audit" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            System Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <GlobalAccountSettings />
        </TabsContent>

        <TabsContent value="monitor">
          <ActiveSystemMonitor />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealthMonitor />
        </TabsContent>

        <TabsContent value="bots">
          <MultiAccountBotManager />
        </TabsContent>

        <TabsContent value="audit">
          <ComprehensiveAudit />
        </TabsContent>

        <TabsContent value="system-audit">
          <ComprehensiveSystemAudit />
        </TabsContent>
      </Tabs>
    </div>
  );
};
