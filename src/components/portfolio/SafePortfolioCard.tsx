
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, DollarSign } from "lucide-react";

interface SafePortfolioCardProps {
  title: string;
  value: number;
  isPaperTrading?: boolean;
  showWarning?: boolean;
  icon?: React.ReactNode;
}

export const SafePortfolioCard = ({ 
  title, 
  value, 
  isPaperTrading = true, 
  showWarning = false,
  icon 
}: SafePortfolioCardProps) => {
  // Ensure no real money amounts are displayed unless explicitly using real accounts
  const displayValue = isPaperTrading ? value : 0;
  
  return (
    <Card className="crypto-card-gradient text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white/60 text-sm">{title}</p>
              {isPaperTrading && (
                <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                  <Shield className="w-3 h-3 mr-1" />
                  PAPER
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">
              ${displayValue.toLocaleString()}
            </p>
            {showWarning && !isPaperTrading && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">Real Account - Use Caution</span>
              </div>
            )}
          </div>
          {icon || <DollarSign className="w-8 h-8 text-blue-400" />}
        </div>
      </CardContent>
    </Card>
  );
};
