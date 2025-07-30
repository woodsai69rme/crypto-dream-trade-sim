
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/encryption';

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
    supportedOrderTypes: ['MARKET', 'LIMIT', 'STOP_LOSS'],
    minTradeAmount: 0.001,
    maxTradeAmount: 100000,
    tradingFee: 0.001
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Advanced',
    apiUrl: 'https://api.coinbase.com',
    testnetUrl: 'https://api-public.sandbox.coinbase.com',
    supportedOrderTypes: ['market', 'limit', 'stop'],
    minTradeAmount: 0.001,
    maxTradeAmount: 50000,
    tradingFee: 0.005
  },
  kraken: {
    id: 'kraken',
    name: 'Kraken',
    apiUrl: 'https://api.kraken.com',
    testnetUrl: 'https://api.kraken.com',
    supportedOrderTypes: ['market', 'limit', 'stop-loss'],
    minTradeAmount: 0.001,
    maxTradeAmount: 25000,
    tradingFee: 0.0026
  }
};

export class BrowserExchangeConnector {
  private config: ExchangeConfig;
  private credentials: {
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
  } | null = null;
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

  async loadCredentials(credentialId: string): Promise<boolean> {
    this.credentials = await SecureStorage.getDecryptedCredentials(credentialId);
    return this.credentials !== null;
  }

  async validateConnection(): Promise<boolean> {
    if (!this.credentials) return false;

    try {
      this.checkRateLimit('validate_connection');
      
      const baseUrl = this.isTestnet ? this.config.testnetUrl : this.config.apiUrl;
      
      // Simulate API validation for browser environment
      console.log(`✅ Simulating connection validation for ${this.config.name}...`);
      
      // In a real implementation, this would make actual REST API calls
      // For now, we'll simulate the validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      console.log('Simulating account balance fetch...');
      
      // Simulate balance data for testing
      const mockBalance = {
        'BTC': 0.5,
        'ETH': 2.5,
        'USDT': 10000,
        'BNB': 50
      };
      
      return mockBalance;
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
      
      console.log('🔄 Simulating trade execution:', tradeRequest);
      
      // Simulate trade execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const executedPrice = tradeRequest.price || (Math.random() * 50000 + 45000); // Mock BTC price
      const fee = tradeRequest.amount * executedPrice * this.config.tradingFee;
      
      console.log('✅ Trade executed successfully');
      
      return {
        success: true,
        orderId: `mock-order-${Date.now()}`,
        executedPrice,
        executedAmount: tradeRequest.amount,
        fee
      };
    } catch (error: any) {
      console.error('❌ Trade execution failed:', error);
      return {
        success: false,
        error: error.message
      };
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
      
      console.log('🔍 Checking order status:', orderId);
      
      // Simulate order being filled
      return {
        status: 'filled',
        executedAmount: 0.1,
        remainingAmount: 0,
        averagePrice: 48500
      };
    } catch (error: any) {
      console.error('❌ Failed to get order status:', error);
      return {
        status: 'rejected',
        error: error.message
      };
    }
  }
  
  async checkVolatilityCircuitBreaker(symbol: string): Promise<boolean> {
    try {
      console.log('⚠️ Checking volatility circuit breaker for', symbol);
      
      // Simulate volatility check - in reality would fetch from API
      const mockVolatility = Math.random() * 30; // 0-30% change
      
      if (mockVolatility > 20) {
        console.warn(`⚠️ Circuit breaker activated: ${symbol} volatility ${mockVolatility.toFixed(2)}%`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Circuit breaker check failed:', error);
      return false;
    }
  }
}
