// Multiple free API sources for real market data
export class MarketDataService {
  private static instance: MarketDataService;
  private cache = new Map<string, any>();
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance() {
    if (!this.instance) {
      this.instance = new MarketDataService();
    }
    return this.instance;
  }

  async getCurrentPrices(symbols: string[] = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP']) {
    const now = Date.now();
    if (now - this.lastUpdate < this.CACHE_DURATION && this.cache.has('prices')) {
      return this.cache.get('prices');
    }

    try {
      // Try multiple free APIs in order of preference
      const data = await this.fetchFromMultipleAPIs(symbols);
      this.cache.set('prices', data);
      this.lastUpdate = now;
      return data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      return this.cache.get('prices') || {};
    }
  }

  private async fetchFromMultipleAPIs(symbols: string[]) {
    const apis = [
      () => this.fetchFromCoinGecko(symbols),
      () => this.fetchFromCoinCap(symbols),
      () => this.fetchFromBinance(symbols),
      () => this.fetchFromKraken(symbols)
    ];

    for (const apiCall of apis) {
      try {
        const data = await apiCall();
        if (data && Object.keys(data).length > 0) {
          console.log('✅ Market data fetched successfully');
          return data;
        }
      } catch (error) {
        console.warn('API call failed, trying next:', error.message);
      }
    }

    throw new Error('All market data APIs failed');
  }

  private async fetchFromCoinGecko(symbols: string[]) {
    const symbolsParam = symbols.map(s => s.toLowerCase()).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );

    if (!response.ok) throw new Error('CoinGecko API failed');
    
    const data = await response.json();
    return this.transformCoinGeckoData(data);
  }

  private async fetchFromCoinCap(symbols: string[]) {
    const response = await fetch('https://api.coincap.io/v2/assets?limit=20');
    if (!response.ok) throw new Error('CoinCap API failed');
    
    const { data } = await response.json();
    return this.transformCoinCapData(data, symbols);
  }

  private async fetchFromBinance(symbols: string[]) {
    // Binance public API - no auth required
    const promises = symbols.map(async (symbol) => {
      const pair = `${symbol}USDT`;
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`
      );
      if (response.ok) {
        return await response.json();
      }
      return null;
    });

    const results = await Promise.allSettled(promises);
    return this.transformBinanceData(results, symbols);
  }

  private async fetchFromKraken(symbols: string[]) {
    const krakenPairs = {
      'BTC': 'XBTUSD',
      'ETH': 'ETHUSD',
      'SOL': 'SOLUSD',
      'BNB': 'BNBUSD',
      'XRP': 'XRPUSD'
    };

    const pairs = symbols
      .filter(s => krakenPairs[s])
      .map(s => krakenPairs[s])
      .join(',');

    const response = await fetch(
      `https://api.kraken.com/0/public/Ticker?pair=${pairs}`
    );

    if (!response.ok) throw new Error('Kraken API failed');
    
    const data = await response.json();
    return this.transformKrakenData(data.result, symbols);
  }

  private transformCoinGeckoData(data: any) {
    const result: any = {};
    const mapping = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'binancecoin': 'BNB',
      'ripple': 'XRP'
    };

    Object.entries(data).forEach(([key, value]: [string, any]) => {
      const symbol = mapping[key];
      if (symbol) {
        result[symbol] = {
          symbol,
          price: value.usd,
          change24h: value.usd_24h_change || 0,
          volume: value.usd_24h_vol || 0,
          marketCap: value.usd_market_cap || 0,
          timestamp: Date.now()
        };
      }
    });

    return result;
  }

  private transformCoinCapData(data: any[], symbols: string[]) {
    const result: any = {};
    const mapping = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'binance-coin': 'BNB',
      'ripple': 'XRP'
    };

    data.forEach((coin: any) => {
      const symbol = mapping[coin.id];
      if (symbol && symbols.includes(symbol)) {
        result[symbol] = {
          symbol,
          price: parseFloat(coin.priceUsd),
          change24h: parseFloat(coin.changePercent24Hr),
          volume: parseFloat(coin.volumeUsd24Hr),
          marketCap: parseFloat(coin.marketCapUsd),
          timestamp: Date.now()
        };
      }
    });

    return result;
  }

  private transformBinanceData(results: any[], symbols: string[]) {
    const result: any = {};
    
    results.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled' && promiseResult.value) {
        const data = promiseResult.value;
        const symbol = symbols[index];
        result[symbol] = {
          symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume: parseFloat(data.volume) * parseFloat(data.lastPrice),
          timestamp: Date.now()
        };
      }
    });

    return result;
  }

  private transformKrakenData(data: any, symbols: string[]) {
    const result: any = {};
    const mapping = {
      'XXBTZUSD': 'BTC',
      'XETHZUSD': 'ETH',
      'SOLUSD': 'SOL'
    };

    Object.entries(data).forEach(([key, value]: [string, any]) => {
      const symbol = mapping[key];
      if (symbol && symbols.includes(symbol)) {
        result[symbol] = {
          symbol,
          price: parseFloat(value.c[0]), // Last trade price
          change24h: ((parseFloat(value.c[0]) - parseFloat(value.o)) / parseFloat(value.o)) * 100,
          volume: parseFloat(value.v[1]), // 24h volume
          timestamp: Date.now()
        };
      }
    });

    return result;
  }

  // Real-time WebSocket connections for ultra-fast updates
  async setupWebSocketFeeds() {
    // Binance WebSocket
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.updateRealtimePrice('BTC', {
          symbol: 'BTC',
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume: parseFloat(data.v) * parseFloat(data.c),
          timestamp: Date.now()
        });
      };
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
    }
  }

  private updateRealtimePrice(symbol: string, data: any) {
    const currentPrices = this.cache.get('prices') || {};
    currentPrices[symbol] = data;
    this.cache.set('prices', currentPrices);
  }
}

export const marketDataService = MarketDataService.getInstance();