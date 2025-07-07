
import { supabase } from '@/integrations/supabase/client';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  timestamp: number;
}

export interface OrderUpdate {
  orderId: string;
  status: 'filled' | 'partial' | 'cancelled' | 'pending';
  filledAmount: number;
  remainingAmount: number;
  avgPrice: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private priceCallbacks: ((data: PriceUpdate) => void)[] = [];
  private orderCallbacks: ((data: OrderUpdate) => void)[] = [];

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    // Using a mock WebSocket endpoint - in production this would be your exchange's WebSocket
    this.ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,cardano,ripple');
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlePriceUpdate(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handlePriceUpdate(data: any) {
    // Convert incoming data to our PriceUpdate format
    Object.entries(data).forEach(([symbol, price]) => {
      const priceUpdate: PriceUpdate = {
        symbol: symbol.toUpperCase(),
        price: parseFloat(price as string),
        change_24h: Math.random() * 10 - 5, // Mock data
        volume_24h: Math.random() * 1000000,
        timestamp: Date.now()
      };
      
      this.priceCallbacks.forEach(callback => callback(priceUpdate));
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  subscribeToPrices(callback: (data: PriceUpdate) => void) {
    this.priceCallbacks.push(callback);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter(cb => cb !== callback);
    };
  }

  subscribeToOrders(callback: (data: OrderUpdate) => void) {
    this.orderCallbacks.push(callback);
    return () => {
      this.orderCallbacks = this.orderCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();
