
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyAccounts } from "./MyAccounts";
import { FollowingTab } from "./FollowingTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { AccountControlPanel } from "./AccountControlPanel";
import { LiveTradingIntegration } from "./LiveTradingIntegration";
import { AdvancedTickerSystem } from "../market/AdvancedTickerSystem";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { Users, Activity, BarChart3, Settings, Wallet, TrendingUp } from "lucide-react";

export const EnhancedAccountManager = () => {
  const { currentAccount } = useMultipleAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Account Manager</h1>
        <div className="ml-auto text-sm text-muted-foreground">
          Manage your 5 paper trading accounts with live audit & following
        </div>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Accounts
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="live-trading" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Live Trading
          </TabsTrigger>
          <TabsTrigger value="ticker" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ticker
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
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

        <TabsContent value="live-trading">
          <LiveTradingIntegration />
        </TabsContent>

        <TabsContent value="ticker">
          <AdvancedTickerSystem />
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
