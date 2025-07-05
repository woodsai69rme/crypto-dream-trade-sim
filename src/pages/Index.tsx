
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Portfolio } from "@/components/Portfolio";
import { TradingPanel } from "@/components/TradingPanel";
import { TopTraders } from "@/components/TopTraders";
import { MarketOverview } from "@/components/MarketOverview";
import { PaperAccountSettings } from "@/components/PaperAccountSettings";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { TradingHistory } from "@/components/TradingHistory";
import { RealTimeTracker } from "@/components/trading/RealTimeTracker";
import { TradeFollower } from "@/components/trading/TradeFollower";
import { AITradingBot } from "@/components/ai/AITradingBot";
import { AdvancedTradingInterface } from "@/components/AdvancedTradingInterface";
import { RiskManagementDashboard } from "@/components/RiskManagementDashboard";
import { AccountManager } from "@/components/AccountManager";
import { AccountHistoryManager } from "@/components/AccountHistoryManager";
import { BotManagement } from "@/components/settings/BotManagement";
import { APISettings } from "@/components/settings/APISettings";
import { MCPSettings } from "@/components/settings/MCPSettings";
import { SystemAudit } from "@/components/testing/SystemAudit";
import { LiveMonitoringDashboard } from "@/components/dashboard/LiveMonitoringDashboard";
import { RealTimeAuditLog } from "@/components/RealTimeAuditLog";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  console.log('Index render - loading:', loading, 'user:', user?.email);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case "trading":
          return (
            <div className="space-y-6">
              <div className="flex justify-end">
                <LiveMonitoringDashboard />
              </div>
              <AdvancedTradingInterface />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TradeFollower />
                <AITradingBot />
              </div>
            </div>
          );
        case "accounts":
          return <AccountManager />;
        case "traders":
          return <TopTraders />;
        case "settings":
          return (
            <div className="space-y-6">
              <SystemAudit />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <APISettings />
                <MCPSettings />
              </div>
              <BotManagement />
              <PaperAccountSettings />
              <AccountHistoryManager />
            </div>
          );
        case "history":
          return <TradingHistory />;
        case "risk":
          return <RiskManagementDashboard />;
        case "audit":
          return <RealTimeAuditLog />;
        default:
          return (
            <div className="space-y-6">
              <div className="flex justify-end">
                <LiveMonitoringDashboard />
              </div>
              <PortfolioDashboard />
              <RealTimeTracker />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <MarketOverview />
                  <Portfolio />
                </div>
                <div className="space-y-6">
                  <TradingHistory />
                  <AITradingBot />
                </div>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Error loading content. Please refresh.</div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
