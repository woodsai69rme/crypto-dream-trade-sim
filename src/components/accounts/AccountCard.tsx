
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccountControls } from './AccountControls';
import { AccountMetrics } from './AccountMetrics';
import { Wallet } from 'lucide-react';

interface AccountCardProps {
  account: any;
  onSwitchAccount: (accountId: string) => void;
  isActive: boolean;
}

export const AccountCard = ({ account, onSwitchAccount, isActive }: AccountCardProps) => {
  return (
    <Card className={`crypto-card-gradient text-primary-foreground transition-all duration-300 ${
      isActive ? 'ring-2 ring-primary crypto-glow' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-crypto-bitcoin to-crypto-ethereum flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{account.account_name}</CardTitle>
                {isActive && <Badge variant="secondary" className="text-xs bg-crypto-success/20 text-crypto-success">Active</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{account.account_type}</p>
              </div>
            </div>
          </div>
          
          <AccountMetrics account={account} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AccountControls accountId={account.id} />

        {/* Action Button */}
        {!isActive && (
          <Button
            onClick={() => onSwitchAccount(account.id)}
            className="w-full"
            variant="outline"
          >
            Switch to Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
