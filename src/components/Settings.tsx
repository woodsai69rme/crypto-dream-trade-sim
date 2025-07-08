
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, FileText, Activity, Shield } from "lucide-react";

import { ComprehensiveAPISettings } from './ComprehensiveAPISettings';
import { BotManagement } from './settings/BotManagement';
import { NotificationCenter } from './notifications/NotificationCenter';
import { FullSystemAudit } from './audit/FullSystemAudit';

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-primary-foreground">System Settings & Management</h2>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            API Settings
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Bot Management
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            System Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <ComprehensiveAPISettings />
        </TabsContent>

        <TabsContent value="bots">
          <BotManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="audit">
          <FullSystemAudit />
        </TabsContent>
      </Tabs>
    </div>
  );
};
