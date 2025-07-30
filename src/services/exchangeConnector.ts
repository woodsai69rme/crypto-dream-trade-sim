
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/encryption';
import * as ccxt from 'ccxt';

export interface ExchangeConfig {
  id: string;
  name: string;
  apiUrl: string;
  testnetUrl: string;
  supportedOrderTypes: string[];
  minTradeAmount: number;
  maxTradeAmount: number;
  tradingFee: number;
}

export const SUPPORTED_EXCHANGES: Record<string, ExchangeConfig> = {
  binance: {
    id: 'binance',
    name: 'Binance',
    apiUrl: 'https://api.binance.com',
    testnetUrl: 'https://testnet.binance.vision',
    supportedOrderTypes: ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT'],
    minTradeAmount: 0.001,
    maxTradeAmount: 100000,
    tradingFee: 0.001
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Pro',
    apiUrl: 'https://api.pro.coinbase.com',
    testnetUrl: 'https://api-public.sandbox.pro.coinbase.com',
    supportedOrderTypes: ['market', 'limit', 'stop'],
    minTradeAmount: 0.001,
    maxTradeAmount: 50000,
    tradingFee: 0.005
  },
  kraken: {
    id: 'kraken',
    name: 'Kraken',
    apiUrl: 'https://api.kraken.com',
    testnetUrl: 'https://api.kraken.com', // Kraken doesn't have separate testnet
    supportedOrderTypes: ['market', 'limit', 'stop-loss', 'take-profit'],
    minTradeAmount: 0.001,
    maxTradeAmount: 25000,
    tradingFee: 0.0026
  }
};

export class ExchangeConnector {
  private config: ExchangeConfig;
  private credentials: {
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
  } | null = null;
  private exchange: ccxt.Exchange | null = null;
  private isTestnet: boolean = true;
  private rateLimiter: Map<string, number> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  constructor(exchangeName: string, isTestnet: boolean = true) {
    this.config = SUPPORTED_EXCHANGES[exchangeName.toLowerCase()];
    this.isTestnet = isTestnet;
    
    if (!this.config) {
      throw new Error(`Unsupported exchange: ${exchangeName}`);
    }
  }
  
  // Enhanced rate limiting
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / 60000)}`;
    const count = this.rateLimiter.get(key) || 0;
    
    if (count >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new Error(`Rate limit exceeded for ${endpoint}. Try again in a minute.`);
    }
    
    this.rateLimiter.set(key, count + 1);
    return true;
  }
  
  // Initialize real exchange connection
  private async initializeExchange(): Promise<void> {
    if (!this.credentials) {
      throw new Error('Credentials not loaded');
    }
    
    try {
      const exchangeId = this.config.id;
      const ExchangeClass = ccxt[exchangeId as keyof typeof ccxt] as typeof ccxt.Exchange;
      
      if (!ExchangeClass) {
        throw new Error(`Exchange ${exchangeId} not supported by CCXT`);
      }
      
      const options: any = {
        apiKey: this.credentials.apiKey,
        secret: this.credentials.apiSecret,
        sandbox: this.isTestnet,
        enableRateLimit: true,
        rateLimit: 1000, // 1 second between requests
      };
      
      // Add passphrase for exchanges that require it (like Coinbase Pro)
      if (this.credentials.passphrase) {
        options.passphrase = this.credentials.passphrase;
      }
      
      // Set testnet URLs
      if (this.isTestnet) {
        if (exchangeId === 'binance') {
          options.urls = { api: { public: this.config.testnetUrl, private: this.config.testnetUrl } };
        }
      }
      
      this.exchange = new ExchangeClass(options);
      
    } catch (error) {
      console.error('Failed to initialize exchange:', error);
      throw new Error(`Failed to initialize ${this.config.name}: ${error}`);
    }
  }

  async loadCredentials(credentialId: string): Promise<boolean> {
    this.credentials = await SecureStorage.getDecryptedCredentials(credentialId);
    return this.credentials !== null;
  }

  async validateConnection(): Promise<boolean> {
    if (!this.credentials) return false;

    try {
      this.checkRateLimit('validate_connection');
      
      await this.initializeExchange();
      
      if (!this.exchange) {
        throw new Error('Exchange initialization failed');
      }
      
      // Test connection with actual API call
      console.log(`Validating connection to ${this.config.name}...`);
      
      // Fetch exchange status or balance to validate
      const markets = await this.exchange.loadMarkets();
      
      if (!markets || Object.keys(markets).length === 0) {
        throw new Error('Failed to load market data');
      }
      
      console.log(`✅ Connection validated for ${this.config.name}`);
      return true;
    } catch (error) {
      console.error('Connection validation failed:', error);
      return false;
    }
  }

  async getAccountBalance(): Promise<Record<string, number>> {
    if (!this.credentials) throw new Error('Credentials not loaded');

    try {
      this.checkRateLimit('get_balance');
      
      if (!this.exchange) {
        await this.initializeExchange();
      }
      
      if (!this.exchange) {
        throw new Error('Exchange not initialized');
      }
      
      // Fetch actual account balance
      console.log('Fetching account balance...');
      const balance = await this.exchange.fetchBalance();
      
      // Format balance data
      const formattedBalance: Record<string, number> = {};
      
      for (const [currency, balanceInfo] of Object.entries(balance)) {
        if (currency !== 'info' && currency !== 'free' && currency !== 'used' && currency !== 'total') {
          const info = balanceInfo as { free: number; used: number; total: number };
          if (info.total > 0) {
            formattedBalance[currency] = info.total;
          }
        }
      }
      
      console.log('✅ Balance fetched successfully');
      return formattedBalance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  }

  async executeTrade(tradeRequest: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
    orderType: 'market' | 'limit' | 'stop';
    stopLoss?: number;
    takeProfit?: number;
  }): Promise<{
    success: boolean;
    orderId?: string;
    executedPrice?: number;
    executedAmount?: number;
    fee?: number;
    error?: string;
  }> {
    if (!this.credentials) throw new Error('Credentials not loaded');

    try {
      this.checkRateLimit('execute_trade');
      
      // Enhanced validation
      if (tradeRequest.amount < this.config.minTradeAmount) {
        throw new Error(`Minimum trade amount is ${this.config.minTradeAmount}`);
      }

      if (tradeRequest.amount > this.config.maxTradeAmount) {
        throw new Error(`Maximum trade amount is ${this.config.maxTradeAmount}`);
      }
      
      // Additional safety checks
      if (tradeRequest.orderType === 'limit' && !tradeRequest.price) {
        throw new Error('Price is required for limit orders');
      }
      
      if (!this.exchange) {
        await this.initializeExchange();
      }
      
      if (!this.exchange) {
        throw new Error('Exchange not initialized');
      }
      
      console.log('🔄 Executing real trade:', tradeRequest);
      
      // Execute actual trade through CCXT
      let order;
      const symbol = this.normalizeSymbol(tradeRequest.symbol);
      
      if (tradeRequest.orderType === 'market') {
        order = await this.exchange.createMarketOrder(
          symbol,
          tradeRequest.side,
          tradeRequest.amount
        );
      } else if (tradeRequest.orderType === 'limit') {
        order = await this.exchange.createLimitOrder(
          symbol,
          tradeRequest.side,
          tradeRequest.amount,
          tradeRequest.price!
        );
      } else {
        throw new Error(`Order type ${tradeRequest.orderType} not supported yet`);
      }
      
      // Create stop-loss and take-profit orders if specified
      if (tradeRequest.stopLoss && order.id) {
        await this.createStopLossOrder(symbol, tradeRequest.side, tradeRequest.amount, tradeRequest.stopLoss);
      }
      
      if (tradeRequest.takeProfit && order.id) {
        await this.createTakeProfitOrder(symbol, tradeRequest.side, tradeRequest.amount, tradeRequest.takeProfit);
      }
      
      console.log('✅ Trade executed successfully:', order.id);
      
      return {
        success: true,
        orderId: order.id,
        executedPrice: order.average || order.price || tradeRequest.price,
        executedAmount: order.filled || tradeRequest.amount,
        fee: order.fee?.cost || (tradeRequest.amount * (order.average || tradeRequest.price || 0) * this.config.tradingFee)
      };
    } catch (error: any) {
      console.error('❌ Trade execution failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Normalize symbol format for each exchange
  private normalizeSymbol(symbol: string): string {
    // Convert BTC to BTC/USDT format
    if (!symbol.includes('/')) {
      return `${symbol}/USDT`;
    }
    return symbol;
  }
  
  // Create automated stop-loss order
  private async createStopLossOrder(symbol: string, originalSide: 'buy' | 'sell', amount: number, stopPrice: number): Promise<void> {
    try {
      if (!this.exchange) return;
      
      const oppositeSide = originalSide === 'buy' ? 'sell' : 'buy';
      
      // Create stop-loss order
      await this.exchange.createStopLimitOrder(symbol, oppositeSide, amount, stopPrice, stopPrice * 0.99);
      console.log(`✅ Stop-loss order created at ${stopPrice}`);
    } catch (error) {
      console.error('Failed to create stop-loss order:', error);
    }
  }
  
  // Create automated take-profit order
  private async createTakeProfitOrder(symbol: string, originalSide: 'buy' | 'sell', amount: number, targetPrice: number): Promise<void> {
    try {
      if (!this.exchange) return;
      
      const oppositeSide = originalSide === 'buy' ? 'sell' : 'buy';
      
      // Create take-profit order
      await this.exchange.createLimitOrder(symbol, oppositeSide, amount, targetPrice);
      console.log(`✅ Take-profit order created at ${targetPrice}`);
    } catch (error) {
      console.error('Failed to create take-profit order:', error);
    }
  }

  async getOrderStatus(orderId: string, symbol?: string): Promise<{
    status: 'pending' | 'filled' | 'cancelled' | 'rejected';
    executedAmount?: number;
    remainingAmount?: number;
    averagePrice?: number;
    error?: string;
  }> {
    if (!this.credentials) throw new Error('Credentials not loaded');

    try {
      this.checkRateLimit('get_order_status');
      
      if (!this.exchange) {
        await this.initializeExchange();
      }
      
      if (!this.exchange) {
        throw new Error('Exchange not initialized');
      }
      
      console.log('🔍 Checking order status:', orderId);
      
      // Fetch actual order status
      const order = await this.exchange.fetchOrder(orderId, symbol);
      
      // Map CCXT status to our status format
      let status: 'pending' | 'filled' | 'cancelled' | 'rejected';
      switch (order.status) {
        case 'open':
          status = 'pending';
          break;
        case 'closed':
          status = 'filled';
          break;
        case 'canceled':
          status = 'cancelled';
          break;
        case 'rejected':
          status = 'rejected';
          break;
        default:
          status = 'pending';
      }
      
      return {
        status,
        executedAmount: order.filled || 0,
        remainingAmount: order.remaining || 0,
        averagePrice: order.average
      };
    } catch (error: any) {
      console.error('❌ Failed to get order status:', error);
      return {
        status: 'rejected',
        error: error.message
      };
    }
  }
  
  // Add circuit breaker for extreme volatility
  async checkVolatilityCircuitBreaker(symbol: string): Promise<boolean> {
    try {
      if (!this.exchange) {
        await this.initializeExchange();
      }
      
      if (!this.exchange) {
        return false;
      }
      
      // Get recent price data
      const ticker = await this.exchange.fetchTicker(this.normalizeSymbol(symbol));
      const change24h = Math.abs(ticker.percentage || 0);
      
      // Circuit breaker: halt trading if 24h change > 20%
      if (change24h > 20) {
        console.warn(`⚠️ Circuit breaker activated: ${symbol} changed ${change24h}% in 24h`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Circuit breaker check failed:', error);
      return false;
    }
  }
  
  // Enhanced error handling and reconnection
  async handleConnectionError(): Promise<void> {
    console.log('🔄 Attempting to reconnect to exchange...');
    try {
      await this.initializeExchange();
      console.log('✅ Reconnection successful');
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
      throw new Error('Failed to reconnect to exchange');
    }
  }
}
