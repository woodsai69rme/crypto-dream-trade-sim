
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const portfolioData = [
  { name: "Bitcoin", value: 45000, percentage: 42, color: "#f7931a" },
  { name: "Ethereum", value: 28000, percentage: 26, color: "#627eea" },
  { name: "BNB", value: 18000, percentage: 17, color: "#f3ba2f" },
  { name: "Solana", value: 12000, percentage: 11, color: "#9945ff" },
  { name: "Others", value: 4000, percentage: 4, color: "#64748b" }
];

const holdings = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.668,
    value: 45000,
    avgPrice: 65200,
    pnl: 1567.2,
    pnlPercent: 3.6
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 7.61,
    value: 28000,
    avgPrice: 3720,
    pnl: -342.8,
    pnlPercent: -1.2
  },
  {
    symbol: "BNB",
    name: "BNB",
    amount: 28.4,
    value: 18000,
    avgPrice: 620,
    pnl: 403.5,
    pnlPercent: 2.3
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: 67.2,
    value: 12000,
    avgPrice: 170,
    pnl: 567.4,
    pnlPercent: 5.0
  }
];

export const Portfolio = () => {
  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalPnL = holdings.reduce((sum, item) => sum + item.pnl, 0);
  const totalPnLPercent = (totalPnL / totalValue) * 100;

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Portfolio Overview
            </div>
            <Badge
              variant={totalPnL > 0 ? "default" : "destructive"}
              className={`${
                totalPnL > 0
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {totalPnL > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {totalPnLPercent.toFixed(2)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">${totalValue.toLocaleString()}</div>
              <div className={`text-lg mb-6 ${totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnLPercent.toFixed(2)}%)
              </div>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-3">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.value.toLocaleString()}</div>
                    <div className="text-sm text-white/60">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Holdings
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center font-bold">
                    {holding.symbol}
                  </div>
                  <div>
                    <div className="font-medium">{holding.name}</div>
                    <div className="text-sm text-white/60">{holding.amount} {holding.symbol}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold">${holding.value.toLocaleString()}</div>
                  <div className="text-sm text-white/60">Avg: ${holding.avgPrice}</div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${holding.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.pnl > 0 ? '+' : ''}${holding.pnl.toFixed(2)}
                  </div>
                  <div className={`text-sm ${holding.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.pnlPercent > 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
