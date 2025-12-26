// CCXT Exchange Wrapper for Real Trading
// Provides unified interface for all supported exchanges

// Note: In Deno, we use dynamic imports for ccxt
// This wrapper provides exchange-specific implementations

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet?: boolean;
}

export interface OrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  amount: number;
  price?: number;
  stopPrice?: number;
  params?: Record<string, any>;
}

export interface OrderResult {
  id: string;
  symbol: string;
  side: string;
  type: string;
  status: string;
  amount: number;
  filled: number;
  remaining: number;
  price: number;
  average: number;
  cost: number;
  fee?: { cost: number; currency: string };
  timestamp: number;
  raw?: any;
}

export interface Balance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  contracts: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
  marginType: string;
}

// Binance Implementation
export async function createBinanceOrder(
  credentials: ExchangeCredentials,
  order: OrderParams
): Promise<OrderResult> {
  const baseUrl = credentials.isTestnet 
    ? 'https://testnet.binancefuture.com' 
    : 'https://fapi.binance.com';
  
  const timestamp = Date.now();
  const encoder = new TextEncoder();
  
  // Build query string
  const params: Record<string, string> = {
    symbol: order.symbol.replace('/', ''),
    side: order.side.toUpperCase(),
    type: order.type.toUpperCase(),
    quantity: order.amount.toString(),
    timestamp: timestamp.toString(),
  };
  
  if (order.type === 'limit' && order.price) {
    params.price = order.price.toString();
    params.timeInForce = 'GTC';
  }
  
  if (order.stopPrice) {
    params.stopPrice = order.stopPrice.toString();
  }
  
  const queryString = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  // Create HMAC signature
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentials.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(queryString)
  );
  
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const response = await fetch(`${baseUrl}/fapi/v1/order?${queryString}&signature=${signatureHex}`, {
    method: 'POST',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  const data = await response.json();
  
  if (data.code && data.code < 0) {
    throw new Error(`Binance error: ${data.msg}`);
  }
  
  return {
    id: data.orderId?.toString() || data.clientOrderId,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    status: mapBinanceStatus(data.status),
    amount: parseFloat(data.origQty || order.amount.toString()),
    filled: parseFloat(data.executedQty || '0'),
    remaining: parseFloat(data.origQty || order.amount.toString()) - parseFloat(data.executedQty || '0'),
    price: parseFloat(data.price || order.price?.toString() || '0'),
    average: parseFloat(data.avgPrice || '0'),
    cost: parseFloat(data.cumQuote || '0'),
    fee: data.commission ? { cost: parseFloat(data.commission), currency: data.commissionAsset } : undefined,
    timestamp: data.updateTime || Date.now(),
    raw: data
  };
}

// Deribit Implementation
export async function createDeribitOrder(
  credentials: ExchangeCredentials,
  order: OrderParams
): Promise<OrderResult> {
  const baseUrl = credentials.isTestnet 
    ? 'https://test.deribit.com' 
    : 'https://www.deribit.com';
  
  // Authenticate first
  const authResponse = await fetch(`${baseUrl}/api/v2/public/auth`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Get auth params
  const authParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.apiKey,
    client_secret: credentials.apiSecret
  });
  
  const tokenResponse = await fetch(`${baseUrl}/api/v2/public/auth?${authParams}`, {
    method: 'GET'
  });
  
  const tokenData = await tokenResponse.json();
  
  if (!tokenData.result?.access_token) {
    throw new Error('Deribit authentication failed: ' + JSON.stringify(tokenData));
  }
  
  const accessToken = tokenData.result.access_token;
  
  // Map symbol to Deribit instrument
  const instrument = mapToDeribitInstrument(order.symbol);
  
  // Determine endpoint based on side and type
  let endpoint = order.side === 'buy' ? 'buy' : 'sell';
  
  const orderParams: Record<string, any> = {
    instrument_name: instrument,
    amount: order.amount,
    type: order.type === 'market' ? 'market' : 'limit',
  };
  
  if (order.type !== 'market' && order.price) {
    orderParams.price = order.price;
  }
  
  const queryString = Object.entries(orderParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  
  const orderResponse = await fetch(`${baseUrl}/api/v2/private/${endpoint}?${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const orderData = await orderResponse.json();
  
  if (orderData.error) {
    throw new Error(`Deribit error: ${orderData.error.message}`);
  }
  
  const result = orderData.result?.order || orderData.result;
  
  return {
    id: result.order_id,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    status: mapDeribitStatus(result.order_state),
    amount: result.amount,
    filled: result.filled_amount || 0,
    remaining: result.amount - (result.filled_amount || 0),
    price: result.price || 0,
    average: result.average_price || 0,
    cost: (result.filled_amount || 0) * (result.average_price || 0),
    timestamp: result.creation_timestamp || Date.now(),
    raw: result
  };
}

// Kraken Implementation
export async function createKrakenOrder(
  credentials: ExchangeCredentials,
  order: OrderParams
): Promise<OrderResult> {
  const baseUrl = 'https://api.kraken.com';
  const path = '/0/private/AddOrder';
  const nonce = Date.now() * 1000;
  
  const postData = new URLSearchParams({
    nonce: nonce.toString(),
    ordertype: order.type,
    type: order.side,
    volume: order.amount.toString(),
    pair: mapToKrakenPair(order.symbol),
  });
  
  if (order.price && order.type !== 'market') {
    postData.append('price', order.price.toString());
  }
  
  // Create signature
  const encoder = new TextEncoder();
  const message = nonce.toString() + postData.toString();
  const sha256 = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  const sha256Array = new Uint8Array(sha256);
  
  const pathBytes = encoder.encode(path);
  const combined = new Uint8Array(pathBytes.length + sha256Array.length);
  combined.set(pathBytes);
  combined.set(sha256Array, pathBytes.length);
  
  // Decode base64 secret
  const secretBytes = Uint8Array.from(atob(credentials.apiSecret), c => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, combined);
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'API-Key': credentials.apiKey,
      'API-Sign': signatureBase64,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: postData
  });
  
  const data = await response.json();
  
  if (data.error && data.error.length > 0) {
    throw new Error(`Kraken error: ${data.error.join(', ')}`);
  }
  
  const txid = Object.keys(data.result?.txid || {})[0] || data.result?.txid?.[0];
  
  return {
    id: txid || `kraken_${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    status: 'open',
    amount: order.amount,
    filled: 0,
    remaining: order.amount,
    price: order.price || 0,
    average: 0,
    cost: 0,
    timestamp: Date.now(),
    raw: data.result
  };
}

// KuCoin Implementation
export async function createKuCoinOrder(
  credentials: ExchangeCredentials,
  order: OrderParams
): Promise<OrderResult> {
  const baseUrl = credentials.isTestnet 
    ? 'https://openapi-sandbox.kucoin.com' 
    : 'https://api.kucoin.com';
  
  const timestamp = Date.now().toString();
  const endpoint = '/api/v1/orders';
  const method = 'POST';
  
  const body = JSON.stringify({
    clientOid: `order_${Date.now()}`,
    side: order.side,
    symbol: order.symbol.replace('/', '-'),
    type: order.type,
    size: order.amount.toString(),
    ...(order.price && { price: order.price.toString() })
  });
  
  const encoder = new TextEncoder();
  const signatureString = timestamp + method + endpoint + body;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentials.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureString));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  // Sign passphrase
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentials.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const passphraseSign = await crypto.subtle.sign(
    'HMAC',
    passphraseKey,
    encoder.encode(credentials.passphrase || '')
  );
  const passphraseBase64 = btoa(String.fromCharCode(...new Uint8Array(passphraseSign)));
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'KC-API-KEY': credentials.apiKey,
      'KC-API-SIGN': signatureBase64,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': passphraseBase64,
      'KC-API-KEY-VERSION': '2',
      'Content-Type': 'application/json'
    },
    body
  });
  
  const data = await response.json();
  
  if (data.code !== '200000') {
    throw new Error(`KuCoin error: ${data.msg}`);
  }
  
  return {
    id: data.data?.orderId || `kucoin_${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    status: 'open',
    amount: order.amount,
    filled: 0,
    remaining: order.amount,
    price: order.price || 0,
    average: 0,
    cost: 0,
    timestamp: Date.now(),
    raw: data.data
  };
}

// OKX Implementation
export async function createOKXOrder(
  credentials: ExchangeCredentials,
  order: OrderParams
): Promise<OrderResult> {
  const baseUrl = 'https://www.okx.com';
  const timestamp = new Date().toISOString();
  const endpoint = '/api/v5/trade/order';
  const method = 'POST';
  
  const body = JSON.stringify({
    instId: order.symbol.replace('/', '-'),
    tdMode: 'cash',
    side: order.side,
    ordType: order.type,
    sz: order.amount.toString(),
    ...(order.price && { px: order.price.toString() })
  });
  
  const encoder = new TextEncoder();
  const signatureString = timestamp + method + endpoint + body;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentials.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureString));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  const headers: Record<string, string> = {
    'OK-ACCESS-KEY': credentials.apiKey,
    'OK-ACCESS-SIGN': signatureBase64,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': credentials.passphrase || '',
    'Content-Type': 'application/json'
  };
  
  if (credentials.isTestnet) {
    headers['x-simulated-trading'] = '1';
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body
  });
  
  const data = await response.json();
  
  if (data.code !== '0') {
    throw new Error(`OKX error: ${data.msg || data.data?.[0]?.sMsg}`);
  }
  
  const orderData = data.data?.[0];
  
  return {
    id: orderData?.ordId || `okx_${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    status: 'open',
    amount: order.amount,
    filled: 0,
    remaining: order.amount,
    price: order.price || 0,
    average: 0,
    cost: 0,
    timestamp: Date.now(),
    raw: orderData
  };
}

// Bybit Implementation
export async function createBybitOrder(
  credentials: ExchangeCredentials,
  order: OrderParams
): Promise<OrderResult> {
  const baseUrl = credentials.isTestnet 
    ? 'https://api-testnet.bybit.com' 
    : 'https://api.bybit.com';
  
  const timestamp = Date.now().toString();
  const recvWindow = '5000';
  const endpoint = '/v5/order/create';
  
  const body = {
    category: 'spot',
    symbol: order.symbol.replace('/', ''),
    side: order.side.charAt(0).toUpperCase() + order.side.slice(1),
    orderType: order.type.charAt(0).toUpperCase() + order.type.slice(1),
    qty: order.amount.toString(),
    ...(order.price && { price: order.price.toString() })
  };
  
  const bodyString = JSON.stringify(body);
  const encoder = new TextEncoder();
  const signatureString = timestamp + credentials.apiKey + recvWindow + bodyString;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentials.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureString));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'X-BAPI-API-KEY': credentials.apiKey,
      'X-BAPI-SIGN': signatureHex,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': recvWindow,
      'Content-Type': 'application/json'
    },
    body: bodyString
  });
  
  const data = await response.json();
  
  if (data.retCode !== 0) {
    throw new Error(`Bybit error: ${data.retMsg}`);
  }
  
  return {
    id: data.result?.orderId || `bybit_${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    status: 'open',
    amount: order.amount,
    filled: 0,
    remaining: order.amount,
    price: order.price || 0,
    average: 0,
    cost: 0,
    timestamp: Date.now(),
    raw: data.result
  };
}

// Helper functions
function mapBinanceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    NEW: 'open',
    PARTIALLY_FILLED: 'partially_filled',
    FILLED: 'filled',
    CANCELED: 'cancelled',
    REJECTED: 'rejected',
    EXPIRED: 'expired'
  };
  return statusMap[status] || 'unknown';
}

function mapDeribitStatus(state: string): string {
  const statusMap: Record<string, string> = {
    open: 'open',
    filled: 'filled',
    rejected: 'rejected',
    cancelled: 'cancelled',
    untriggered: 'pending'
  };
  return statusMap[state] || 'unknown';
}

function mapToDeribitInstrument(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BTC/USD': 'BTC-PERPETUAL',
    'ETH/USD': 'ETH-PERPETUAL',
    'BTC/USDT': 'BTC-PERPETUAL',
    'ETH/USDT': 'ETH-PERPETUAL',
    'SOL/USD': 'SOL-PERPETUAL',
    'SOL/USDT': 'SOL-PERPETUAL'
  };
  return symbolMap[symbol] || symbol.replace('/', '-') + '-PERPETUAL';
}

function mapToKrakenPair(symbol: string): string {
  const parts = symbol.split('/');
  const base = parts[0] === 'BTC' ? 'XBT' : parts[0];
  const quote = parts[1] === 'USD' ? 'USD' : parts[1];
  return base + quote;
}

// Get balances from exchange
export async function getBalances(
  exchange: string,
  credentials: ExchangeCredentials
): Promise<Balance[]> {
  // Implementation for each exchange
  switch (exchange.toLowerCase()) {
    case 'binance':
      return getBinanceBalances(credentials);
    case 'deribit':
      return getDeribitBalances(credentials);
    default:
      throw new Error(`Balance fetch not implemented for ${exchange}`);
  }
}

async function getBinanceBalances(credentials: ExchangeCredentials): Promise<Balance[]> {
  const baseUrl = credentials.isTestnet 
    ? 'https://testnet.binancefuture.com' 
    : 'https://fapi.binance.com';
  
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentials.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(queryString));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const response = await fetch(`${baseUrl}/fapi/v2/balance?${queryString}&signature=${signatureHex}`, {
    headers: { 'X-MBX-APIKEY': credentials.apiKey }
  });
  
  const data = await response.json();
  
  if (!Array.isArray(data)) {
    throw new Error('Failed to fetch Binance balances');
  }
  
  return data.map((b: any) => ({
    currency: b.asset,
    free: parseFloat(b.availableBalance || b.balance),
    used: parseFloat(b.balance) - parseFloat(b.availableBalance || b.balance),
    total: parseFloat(b.balance)
  })).filter((b: Balance) => b.total > 0);
}

async function getDeribitBalances(credentials: ExchangeCredentials): Promise<Balance[]> {
  const baseUrl = credentials.isTestnet 
    ? 'https://test.deribit.com' 
    : 'https://www.deribit.com';
  
  // Authenticate
  const authParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.apiKey,
    client_secret: credentials.apiSecret
  });
  
  const tokenResponse = await fetch(`${baseUrl}/api/v2/public/auth?${authParams}`);
  const tokenData = await tokenResponse.json();
  
  if (!tokenData.result?.access_token) {
    throw new Error('Deribit authentication failed');
  }
  
  const balanceResponse = await fetch(`${baseUrl}/api/v2/private/get_account_summary?currency=BTC`, {
    headers: { 'Authorization': `Bearer ${tokenData.result.access_token}` }
  });
  
  const balanceData = await balanceResponse.json();
  const btcBalance = balanceData.result;
  
  const balances: Balance[] = [];
  
  if (btcBalance) {
    balances.push({
      currency: 'BTC',
      free: btcBalance.available_funds || 0,
      used: btcBalance.initial_margin || 0,
      total: btcBalance.equity || 0
    });
  }
  
  return balances;
}
