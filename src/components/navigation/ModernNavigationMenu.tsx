
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  Home, 
  TrendingUp, 
  Settings, 
  User,
  BarChart3,
  Bot,
  Wallet,
  Activity,
  Shield,
  Brain,
  Users
} from 'lucide-react';

const navigationGroups = [
  {
    title: "Trading",
    items: [
      { to: '/trading', icon: TrendingUp, label: 'Trading Hub', description: 'Advanced trading interface with AI assistance' },
      { to: '/accounts', icon: Wallet, label: 'Accounts', description: 'Manage your paper trading accounts' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics', description: 'Portfolio performance and insights' },
    ]
  },
  {
    title: "AI & Automation",
    items: [
      { to: '/bots', icon: Bot, label: 'AI Bots', description: 'Automated trading strategies' },
      { to: '/following', icon: Users, label: 'Trade Following', description: 'Copy successful traders' },
      { to: '/risk', icon: Shield, label: 'Risk Management', description: 'Advanced risk controls' },
    ]
  },
  {
    title: "System",
    items: [
      { to: '/settings', icon: Settings, label: 'Settings', description: 'Configure APIs and preferences' },
      { to: '/profile', icon: User, label: 'Profile', description: 'Account and security settings' },
      { to: '/monitoring', icon: Activity, label: 'System Health', description: 'Monitor system performance' },
    ]
  }
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon: React.ElementType }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
});
ListItem.displayName = "ListItem";

export const ModernNavigationMenu = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <NavLink to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {navigationGroups.map((group) => (
          <NavigationMenuItem key={group.title}>
            <NavigationMenuTrigger className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {group.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {group.items.map((item) => (
                  <ListItem
                    key={item.to}
                    title={item.label}
                    href={item.to}
                    icon={item.icon}
                  >
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
