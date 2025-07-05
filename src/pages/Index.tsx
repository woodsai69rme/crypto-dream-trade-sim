
import { useState } from "react";
import { Header } from "@/components/Header";
import { Portfolio } from "@/components/Portfolio";
import { TradingPanel } from "@/components/TradingPanel";
import { TopTraders } from "@/components/TopTraders";
import { MarketOverview } from "@/components/MarketOverview";
import { PaperAccountSettings } from "@/components/PaperAccountSettings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "trading":
        return <TradingPanel />;
      case "traders":
        return <TopTraders />;
      case "settings":
        return <PaperAccountSettings />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <MarketOverview />
              <Portfolio />
            </div>
            <div className="space-y-6">
              <TopTraders />
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
