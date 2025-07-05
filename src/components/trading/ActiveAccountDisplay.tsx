import { Settings } from "lucide-react";
import { PaperAccount } from "@/hooks/useMultipleAccounts";

interface ActiveAccountDisplayProps {
  account: PaperAccount | null;
}

export const ActiveAccountDisplay = ({ account }: ActiveAccountDisplayProps) => {
  if (!account) return null;

  return (
    <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
      <div className="flex items-center gap-2 text-sm">
        <Settings className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400">Active Account:</span>
        <span className="font-medium">{account.account_name}</span>
        <span className="text-white/60">• Balance: ${account.balance.toLocaleString()}</span>
      </div>
    </div>
  );
};