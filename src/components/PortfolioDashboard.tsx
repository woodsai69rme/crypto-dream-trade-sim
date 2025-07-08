
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { ActiveAccountDisplay } from './trading/ActiveAccountDisplay';
import {
  Settings, Activity, TrendingUp, DollarSign, BarChart3,
  LineChart, Users, Globe2, AlertTriangle
} from "lucide-react";

const data = [
  { name: "Jan", Total: 1200 },
  { name: "Feb", Total: 2100 },
  { name: "Mar", Total: 800 },
  { name: "Apr", Total: 1600 },
  { name: "May", Total: 900 },
  { name: "Jun", Total: 1700 },
];

export const PortfolioDashboard = () => {
  const { accounts, currentAccount, accountSummary } = useMultipleAccounts();
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive view of your trading performance and market positions
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button>
            <Globe2 className="w-4 h-4 mr-2" />
            Connect Broker
          </Button>
        </div>
      </div>

      {/* Active Account Display */}
      {currentAccount && <ActiveAccountDisplay account={currentAccount} />}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountSummary.totalValue.toLocaleString()}</div>
            <p className="text-muted-foreground">
              <span className={accountSummary.totalPnLPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                {accountSummary.totalPnLPercentage >= 0 ? '+' : ''}{accountSummary.totalPnLPercentage.toFixed(2)}%
              </span>
              {' '}since last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${accountSummary.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {accountSummary.totalPnL >= 0 ? '+' : ''}${accountSummary.totalPnL.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              Compared to initial investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountSummary.activeAccounts}</div>
            <p className="text-muted-foreground">
              Trading accounts currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Daily Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">+1.42%</div>
            <p className="text-muted-foreground">
              Average across all active accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="Total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.slice(0, 5).map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: account.color_theme + '33' }}
                    >
                      <Activity className="w-4 h-4" style={{ color: account.color_theme }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{account.account_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(account.updated_at || account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${Number(account.balance).toLocaleString()}</p>
                    <p className={`text-xs ${Number(account.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(account.total_pnl) >= 0 ? '+' : ''}{Number(account.total_pnl_percentage).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                      <AvatarFallback>{account.account_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{account.account_name}</p>
                      <p className="text-xs text-muted-foreground">{account.account_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${Number(account.balance).toLocaleString()}</p>
                    <p className={`text-xs ${Number(account.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(account.total_pnl) >= 0 ? '+' : ''}${Number(account.total_pnl).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Conservative</span>
                <Progress value={35} />
              </div>
              <div className="flex items-center justify-between">
                <span>Moderate</span>
                <Progress value={55} />
              </div>
              <div className="flex items-center justify-between">
                <span>Aggressive</span>
                <Progress value={80} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
