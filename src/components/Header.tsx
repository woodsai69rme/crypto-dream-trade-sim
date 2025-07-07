
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  LogOut
} from "lucide-react";

export const Header = () => {
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

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">CryptoTrader Pro</h1>
            </div>
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
      </div>
    </header>
  );
};
