
import React, { useState } from 'react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { RiskManagementDashboard } from '@/components/trading/RiskManagementDashboard';
import { ReportExporter } from '@/components/exports/ReportExporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';

const Analytics = () => {
  const { currentAccount } = useMultipleAccounts();
  const [analyticsData, setAnalyticsData] = useState({
    balance: currentAccount?.balance || 0,
    totalPnl: currentAccount?.total_pnl || 0,
    winRate: 0,
    totalTrades: 0
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <ReportExporter 
          data={analyticsData}
          reportType="analytics"
          accountName={currentAccount?.account_name}
        />
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskManagementDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
