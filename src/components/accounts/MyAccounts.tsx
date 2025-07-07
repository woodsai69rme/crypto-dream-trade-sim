
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';
import { useToast } from '@/hooks/use-toast';
import { AccountCard } from './AccountCard';
import { 
  Wallet,
  Star,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';

export const MyAccounts = () => {
  const { accounts, currentAccount, switchAccount } = useMultipleAccounts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const handleCreateAccount = () => {
    toast({
      title: "Create Account",
      description: "Account creation functionality coming soon",
    });
  };

  const handleResetAccount = (accountId: string) => {
    toast({
      title: "Reset Account",
      description: "Account reset functionality coming soon",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary-foreground">My Trading Accounts</h2>
          <Badge variant="secondary" className="text-sm">
            {accounts.length} total account{accounts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-card/20 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3 py-1"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1"
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <Button variant="outline" onClick={handleCreateAccount}>
            <Star className="w-4 h-4 mr-2" />
            Create Account
          </Button>
          
          <Button variant="outline" onClick={() => handleResetAccount(currentAccount?.id || '')}>
            <Shield className="w-4 h-4 mr-2" />
            Reset Account
          </Button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardContent className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first paper trading account to get started
            </p>
            <Button>Create Account</Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onSwitchAccount={switchAccount}
              isActive={currentAccount?.id === account.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
