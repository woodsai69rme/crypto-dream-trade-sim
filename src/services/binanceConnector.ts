
import CryptoJS from 'crypto-js';
import { ProductionSecureStorage } from '@/utils/productionEncryption';

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
}

export interface BinanceOrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  avgPrice?: string;
  transactTime: number;
}

export class BinanceConnector {
  private credentials: BinanceCredentials | null = null;
  private baseUrl: string = '';
  private rateLimiter: Map<string, number[]> = new Map();
  
  // Rate limits per endpoint (requests per minute)
  private readonly RATE_LIMITS = {
    'account': 12,           // GET /api/v3/account
    'order': 10,            // POST /api/v3/order  
    'order_status': 60,     // GET /api/v3/order
    'ticker_price': 1200,   // GET /api/v3/ticker/price
    'exchange_info': 10     // GET /api/v3/exchangeInfo
  };

  constructor(testnet: boolean = true) {
    this.baseUrl = testnet 
      ? 'https://testnet.binance.vision/api/v3'
      : 'https://api.binance.com/api/v3';
  }

  async loadCredentials(encryptedApiKey: string, encryptedSecret: string, masterKey: string): Promise<boolean> {
    try {
      const apiKey = await ProductionSecureStorage.decryptCredentials(encryptedApiKey, masterKey);
      const apiSecret = await ProductionSecureStorage.decryptCredentials(encryptedSecret, masterKey);
      
      this.credentials = {
        apiKey,
        apiSecret,
        testnet: this.baseUrl.includes('testnet')
      };

      // Test connection
      return await this.validateConnection();
    } catch (error) {
      console.error('Failed to load Binance credentials:', error);
      return false;
    }
  }

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    const key = `binance_${endpoint}`;
    
    const requests = this.rateLimiter.get(key) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    const limit = this.RATE_LIMITS[endpoint as keyof typeof this.RATE_LIMITS] || 60;
    
    if (recentRequests.length >= limit) {
      console.warn(`⚠️ Rate limit exceeded for ${endpoint}: ${recentRequests.length}/${limit}`);
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimiter.set(key, recentRequests);
    return true;
  }

  private createSignature(queryString: string, secret: string): string {
    return CryptoJS.HmacSHA256(queryString, secret).toString();
  }

  private async makeSignedRequest(
    endpoint: string, 
    params: Record<string, any> = {}, 
    method: 'GET' | 'POST' = 'GET'
  ): Promise<any> {
    if (!this.credentials) {
      throw new Error('Binance credentials not loaded');
    }

    if (!this.checkRateLimit(endpoint.split('/').pop() || 'default')) {
      throw new Error(`Rate limit exceeded for ${endpoint}`);
    }

    const timestamp = Date.now();
    const queryParams = { ...params, timestamp };
    
    // Create query string
    const queryString = new URLSearchParams();
    Object.keys(queryParams).forEach(key => {
      queryString.append(key, queryParams[key].toString());
    });
    
    // Generate signature
    const signature = this.createSignature(queryString.toString(), this.credentials.apiSecret);
    queryString.append('signature', signature);

    const url = `${this.baseUrl}${endpoint}?${queryString.toString()}`;
    
    const headers = {
      'X-MBX-APIKEY': this.credentials.apiKey,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, { method, headers });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Binance API error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Binance ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.makeSignedRequest('/account');
      console.log('✅ Binance connection validated successfully');
      return true;
    } catch (error) {
      console.error('❌ Binance connection validation failed:', error);
      return false;
    }
  }

  async getAccountBalance(): Promise<Record<string, number>> {
    try {
      const accountInfo = await this.makeSignedRequest('/account');
      const balances: Record<string, number> = {};
      
      accountInfo.balances.forEach((balance: any) => {
        const free = parseFloat(balance.free);
        const locked = parseFloat(balance.locked);
        const total = free + locked;
        
        if (total > 0) {
          balances[balance.asset] = total;
        }
      });
      
      return balances;
    } catch (error) {
      console.error('Failed to fetch Binance account balance:', error);
      throw error;
    }
  }

  async placeOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_LOSS_LIMIT';
    quantity: number;
    price?: number;
    stopPrice?: number;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
  }): Promise<BinanceOrderResponse> {
    try {
      const orderParams: any = {
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        quantity: params.quantity
      };

      if (params.type === 'LIMIT') {
        orderParams.price = params.price;
        orderParams.timeInForce = params.timeInForce || 'GTC';
      }

      if (params.type === 'STOP_LOSS_LIMIT') {
        orderParams.price = params.price;
        orderParams.stopPrice = params.stopPrice;
        orderParams.timeInForce = params.timeInForce || 'GTC';
      }

      const response = await this.makeSignedRequest('/order', orderParams, 'POST');
      
      console.log('✅ Binance order placed successfully:', response.orderId);
      return response as BinanceOrderResponse;
    } catch (error) {
      console.error('❌ Binance order placement failed:', error);
      throw error;
    }
  }

  async getOrderStatus(symbol: string, orderId: number): Promise<any> {
    try {
      return await this.makeSignedRequest('/order', { symbol, orderId });
    } catch (error) {
      console.error('Failed to get Binance order status:', error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<{ symbol: string; price: string }> {
    try {
      if (!this.checkRateLimit('ticker_price')) {
        throw new Error('Rate limit exceeded for ticker price');
      }

      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ticker: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get Binance ticker:', error);
      throw error;
    }
  }
}
