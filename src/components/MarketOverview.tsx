
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const mockCryptoData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67432.15,
    change: 2.34,
    changePercent: 3.6,
    marketCap: "1.33T",
    volume: "28.5B",
    data: [65000, 66200, 67100, 66800, 67432]
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3678.92,
    change: -45.67,
    changePercent: -1.2,
    marketCap: "442.1B",
    volume: "15.2B",
    data: [3720, 3680, 3650, 3690, 3678]
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 634.21,
    change: 12.45,
    changePercent: 2.0,
    marketCap: "92.4B",
    volume: "1.8B",
    data: [620, 625, 630, 632, 634]
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 178.45,
    change: 8.92,
    changePercent: 5.3,
    marketCap: "84.2B",
    volume: "3.1B",
    data: [170, 172, 175, 176, 178]
  }
];

export const MarketOverview = () => {
  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCryptoData.map((crypto) => (
            <div key={crypto.symbol} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {crypto.symbol}
                  </div>
                  <div>
                    <div className="font-medium">{crypto.symbol}</div>
                    <div className="text-xs text-white/60">{crypto.name}</div>
                  </div>
                </div>
                <Badge
                  variant={crypto.changePercent > 0 ? "default" : "destructive"}
                  className={`${
                    crypto.changePercent > 0
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}
                >
                  {crypto.changePercent > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {crypto.changePercent.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="text-lg font-bold">${crypto.price.toLocaleString()}</div>
                <div className={`text-sm ${crypto.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {crypto.change > 0 ? '+' : ''}${crypto.change.toFixed(2)}
                </div>
              </div>

              <div className="h-12 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={crypto.data.map((value, index) => ({ value, index }))}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={crypto.changePercent > 0 ? "#10b981" : "#ef4444"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-white/60 space-y-1">
                <div>Vol: {crypto.volume}</div>
                <div>MCap: {crypto.marketCap}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
