
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyAccounts } from "./MyAccounts";
import { FollowingTab } from "./FollowingTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { AccountControlPanel } from "./AccountControlPanel";
import { OpenRouterIntegration } from "@/components/integrations/OpenRouterIntegration";
import { N8NIntegration } from "@/components/integrations/N8NIntegration";
import { Context7Integration } from "@/components/integrations/Context7Integration";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { Users, Activity, BarChart3, Settings, Network, Bot } from "lucide-react";

export const EnhancedAccountManager = () => {
  const { currentAccount } = useMultipleAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Enhanced Account Manager</h1>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="openrouter" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            OpenRouter
          </TabsTrigger>
          <TabsTrigger value="n8n" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            N8N
          </TabsTrigger>
          <TabsTrigger value="context7" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Context7
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <MyAccounts />
        </TabsContent>

        <TabsContent value="controls">
          {currentAccount ? (
            <AccountControlPanel account={currentAccount} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4" />
              <p>No account selected. Please select an account to manage.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="following">
          <FollowingTab />
        </TabsContent>

        <TabsContent value="openrouter">
          <OpenRouterIntegration />
        </TabsContent>

        <TabsContent value="n8n">
          <N8NIntegration />
        </TabsContent>

        <TabsContent value="context7">
          <Context7Integration />
        </TabsContent>
      </Tabs>
    </div>
  );
};
