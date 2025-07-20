
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { StatusIndicator } from "@/components/StatusIndicator";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { ModernNavigationMenu } from "@/components/navigation/ModernNavigationMenu";
import { SystemHealthIndicator } from "@/components/enhanced/SystemHealthIndicator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Activity,
  Shield
} from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const [showHealthPanel, setShowHealthPanel] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <MobileNavigation />
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              CryptoTrader Pro
            </h1>
            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Beta
            </Badge>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <ModernNavigationMenu />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          <StatusIndicator isActive={true} label="Live" />
          
          {/* Health Status */}
          <DropdownMenu open={showHealthPanel} onOpenChange={setShowHealthPanel}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover:bg-accent">
                <Activity className="w-4 h-4 text-green-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover/95 backdrop-blur-sm border border-border/50">
              <SystemHealthIndicator />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative hover:bg-accent">
            <Bell className="w-4 h-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-accent border border-border/50">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-popover/95 backdrop-blur-sm border border-border/50" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-3 border-b border-border/50">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{user.email}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Premium Account
                  </p>
                </div>
              </div>
              <DropdownMenuItem className="hover:bg-accent">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="hover:bg-accent">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent">
                <Shield className="mr-2 h-4 w-4" />
                <span>Security</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="hover:bg-destructive hover:text-destructive-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
