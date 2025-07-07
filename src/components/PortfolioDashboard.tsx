import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { MarketOverviewDashboard } from "@/components/enhanced/MarketOverviewDashboard";
import { QuickTradePanel } from "@/components/trading/QuickTradePanel";

export const PortfolioDashboard = () => {
  const { user } = useAuth();
  const { accounts, currentAccount, switchAccount } = useMultipleAccounts();

  const data = [
    { date: subDays(new Date(), 6), value: 4000 },
    { date: subDays(new Date(), 5), value: 3000 },
    { date: subDays(new Date(), 4), value: 2000 },
    { date: subDays(new Date(), 3), value: 2780 },
    { date: subDays(new Date(), 2), value: 1890 },
    { date: subDays(new Date(), 1), value: 2390 },
    { date: new Date(), value: 3490 },
  ];

  const formatXAxis = (tick: Date) => format(tick, "MMM dd");

  const SafePortfolioDashboard = () => {
    return (
      <Card className="crypto-card-gradient text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${currentAccount?.balance.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total portfolio value
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Account Type</div>
              <div className="font-medium">{currentAccount?.account_type}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Risk Level</div>
              <div className="font-medium">{currentAccount?.risk_level}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created At</div>
              <div className="font-medium">
                {new Date(currentAccount?.created_at || "").toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Accessed</div>
              <div className="font-medium">
                {new Date(currentAccount?.last_accessed || "").toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-primary-foreground">Portfolio Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio Summary - Left Side */}
        <div className="lg:col-span-3 space-y-6">
          <SafePortfolioDashboard />
          <MarketOverviewDashboard />
        </div>

        {/* Quick Actions - Right Side */}
        <div className="lg:col-span-1 space-y-6">
          <QuickTradePanel />
          
          {/* Account Switcher */}
          <Card className="crypto-card-gradient text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-sm">Quick Account Switch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accounts.slice(0, 3).map((account) => (
                  <Button
                    key={account.id}
                    variant={account.is_default ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => switchAccount(account.id)}
                    className="w-full justify-start"
                  >
                    {account.account_name}
                    <Badge className="ml-auto">
                      ${account.balance.toLocaleString()}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
