
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

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "trading":
        return <TradingPanel />;
      case "traders":
        return <TopTraders />;
      case "settings":
        return <PaperAccountSettings />;
      case "history":
        return <TradingHistory />;
      default:
        return (
          <div className="space-y-6">
            <PortfolioDashboard />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <MarketOverview />
                <Portfolio />
              </div>
              <div className="space-y-6">
                <TradingHistory />
              </div>
            </div>
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
