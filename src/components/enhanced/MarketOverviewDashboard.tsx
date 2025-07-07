
import { useMarketData } from '@/hooks/useMarketData';
import { MarketDataCard } from '@/components/market/MarketDataCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const MarketOverviewDashboard = () => {
  const { marketData, loading, lastUpdated, refreshMarketData } = useMarketData();

  const totalMarketCap = marketData.reduce((sum, coin) => sum + (coin.market_cap_usd || 0), 0);
  const positiveCoins = marketData.filter(coin => coin.change_percentage_24h >= 0);
  const negativeCoins = marketData.filter(coin => coin.change_percentage_24h < 0);

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  if (loading && marketData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-foreground">Market Overview</h2>
          <Button disabled size="sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="crypto-card-gradient animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-foreground">Market Overview</h2>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={refreshMarketData} 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-crypto-success" />
              <span className="text-xl font-bold">{formatCurrency(totalMarketCap)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-crypto-success" />
              <span className="text-xl font-bold">{positiveCoins.length}</span>
              <Badge className="bg-crypto-success/20 text-crypto-success">
                {((positiveCoins.length / marketData.length) * 100).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-crypto-danger" />
              <span className="text-xl font-bold">{negativeCoins.length}</span>
              <Badge className="bg-crypto-danger/20 text-crypto-danger">
                {((negativeCoins.length / marketData.length) * 100).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card-gradient text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tracked Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{marketData.length}</span>
              <Badge className="bg-crypto-info/20 text-crypto-info">Live</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {marketData.map((coin) => (
          <MarketDataCard
            key={coin.id}
            symbol={coin.symbol}
            name={coin.name}
            price_usd={coin.price_usd}
            change_percentage_24h={coin.change_percentage_24h}
            market_cap_usd={coin.market_cap_usd}
            volume_24h_usd={coin.volume_24h_usd}
            onTrade={(symbol) => {
              console.log(`Trading ${symbol}`);
              // TODO: Open trading modal
            }}
          />
        ))}
      </div>
    </div>
  );
};
