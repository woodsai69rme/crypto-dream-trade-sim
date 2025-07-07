
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TradingPanel } from "@/components/TradingPanel";
import { MultiAccountTradingPanel } from "@/components/trading/MultiAccountTradingPanel";
import { EnhancedAccountManager } from "@/components/accounts/EnhancedAccountManager";
import { TopTraders } from "@/components/TopTraders";
import { TradingHistoryDashboard } from "@/components/TradingHistoryDashboard";
import { RiskManagementDashboard } from "@/components/RiskManagementDashboard";
import { EnhancedSettingsPanel } from "@/components/settings/EnhancedSettingsPanel";
import { CryptoNewsResearch } from "@/components/ai/CryptoNewsResearch";
import { N8NWorkflowIntegration } from "@/components/ai/N8NWorkflowIntegration";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/AdvancedAnalyticsDashboard";
import { RealTimeMarketIntegration } from "@/components/realtime/RealTimeMarketIntegration";
import { EnhancedAITradingBots } from "@/components/ai/EnhancedAITradingBots";
import { EnhancedSocialTradingSystem } from "@/components/social/EnhancedSocialTradingSystem";

const IndexPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "trading":
        return (
          <div className="space-y-6">
            <TradingPanel />
            <MultiAccountTradingPanel />
          </div>
        );
      case "accounts":
        return <EnhancedAccountManager />;
      case "traders":
        return <EnhancedSocialTradingSystem />;
      case "news":
        return <CryptoNewsResearch />;
      case "workflows":
        return <N8NWorkflowIntegration />;
      case "history":
        return <TradingHistoryDashboard />;
      case "risk":
        return <RiskManagementDashboard />;
      case "settings":
        return <EnhancedSettingsPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default IndexPage;
