
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComprehensiveAPISettings } from "@/components/ComprehensiveAPISettings";
import { GlobalAccountSettings } from "@/components/settings/GlobalAccountSettings";
import { EnhancedAccountResetManager } from "@/components/EnhancedAccountResetManager";
import { ComprehensiveSystemAudit } from "@/components/audit/ComprehensiveSystemAudit";
import { ActiveSystemMonitor } from "@/components/monitoring/ActiveSystemMonitor";
import { Settings, Database, Shield, Activity, Bot } from "lucide-react";

export const SettingsPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Settings & System Management</h1>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            API Settings
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account Settings
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            System Monitor
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Audit
          </TabsTrigger>
          <TabsTrigger value="reset" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Reset Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <ComprehensiveAPISettings />
        </TabsContent>

        <TabsContent value="accounts">
          <GlobalAccountSettings />
        </TabsContent>

        <TabsContent value="monitor">
          <ActiveSystemMonitor />
        </TabsContent>

        <TabsContent value="audit">
          <ComprehensiveSystemAudit />
        </TabsContent>

        <TabsContent value="reset">
          <EnhancedAccountResetManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
