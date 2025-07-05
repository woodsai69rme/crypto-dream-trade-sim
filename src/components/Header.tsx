
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, User, Settings, BarChart3, Users, Clock } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "history", label: "History", icon: Clock },
    { id: "traders", label: "Top Traders", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">CryptoTrader Pro</h1>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Paper Trading
            </Badge>
            <div className="text-white/60 text-sm ml-4">
              Welcome, {user?.email}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </nav>
            
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
