
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  LogOut,
  BarChart3,
  Wallet,
  Users,
  Settings,
  Activity
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const { user } = useAuth();
  const { currentAccount, accounts } = useMultipleAccounts();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { id: "portfolio", label: "Portfolio", icon: BarChart3 },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "accounts", label: "Accounts", icon: Wallet },
    { id: "social", label: "Social", icon: Users },
    { id: "system", label: "System", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">CryptoTrader Pro</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 ${
                      activeTab === item.id 
                        ? "bg-white/20 text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.id === "accounts" && accounts.length > 1 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {accounts.length}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Current Account Display */}
            {currentAccount && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-white font-medium">
                  {currentAccount.account_name}
                </span>
                <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                  ${currentAccount.balance.toLocaleString()}
                </Badge>
              </div>
            )}

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/70 hidden sm:block">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="text-white/70 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-2 hidden sm:block">
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex overflow-x-auto space-x-1 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 whitespace-nowrap ${
                  activeTab === item.id 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
