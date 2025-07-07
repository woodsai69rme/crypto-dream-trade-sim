import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyAccounts } from "./MyAccounts";
import { FollowingTab } from "./FollowingTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { AccountCryptoHoldings } from "./AccountCryptoHoldings";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { Users, BarChart, UserCheck, Wallet } from "lucide-react";

export const EnhancedAccountManager = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const { accounts } = useMultipleAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-foreground">Account Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Accounts
          </TabsTrigger>
          <TabsTrigger value="holdings" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Holdings
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

        <TabsContent value="holdings">
          <div className="space-y-6">
            {accounts.map((account) => (
              <AccountCryptoHoldings 
                key={account.id}
                accountId={account.id}
                accountName={account.account_name}
              />
            ))}
          </div>
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