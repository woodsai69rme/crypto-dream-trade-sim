import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyAccounts } from "./MyAccounts";
import { FollowingTab } from "./FollowingTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { Users, BarChart, UserCheck } from "lucide-react";

export const EnhancedAccountManager = () => {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-foreground">Account Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Accounts
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <MyAccounts />
        </TabsContent>

        <TabsContent value="following">
          <FollowingTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};