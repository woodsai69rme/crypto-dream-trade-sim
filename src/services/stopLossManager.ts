
import { supabase } from '@/integrations/supabase/client';
import { BinanceConnector } from './binanceConnector';

export interface StopLossConfig {
  tradeId: string;
  symbol: string;
  stopPrice: number;
  trailingPercent?: number;
  isTrailing: boolean;
  accountId: string;
  exchangeName: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export class AutomatedStopLossManager {
  private wsConnection: WebSocket | null = null;
  private stopLossOrders: Map<string, StopLossConfig> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private exchangeConnectors: Map<string, any> = new Map();
  private isRunning: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    this.setupExchangeConnectors();
  }

  private async setupExchangeConnectors() {
    // Initialize exchange connectors for stop-loss execution
    // This would be expanded to include all supported exchanges
    console.log('Setting up exchange connectors for stop-loss execution...');
  }

  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log('Stop-loss monitoring already running');
      return;
    }

    this.isRunning = true;
    await this.loadActiveStopLosses();
    await this.connectWebSocket();
    
    // Start monitoring loop
    setInterval(() => this.checkStopLosses(), 1000); // Check every second
    
    console.log('✅ Automated stop-loss monitoring started');
  }

  async stopMonitoring(): Promise<void> {
    this.isRunning = false;
    
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    
    console.log('⏹️ Stop-loss monitoring stopped');
  }

  private async loadActiveStopLosses(): Promise<void> {
    try {
      const { data: trades, error } = await supabase
        .from('real_trades')
        .select('*')
        .eq('status', 'open')
        .not('stop_loss', 'is', null);

      if (error) {
        console.error('Failed to load active stop-losses:', error);
        return;
      }

      for (const trade of trades || []) {
        if (trade.stop_loss) {
          this.stopLossOrders.set(trade.id, {
            tradeId: trade.id,
            symbol: trade.symbol,
            stopPrice: trade.stop_loss,
            isTrailing: trade.trailing_stop || false,
            trailingPercent: trade.trailing_percent || 0,
            accountId: trade.account_id,
            exchangeName: trade.exchange_name
          });
        }
      }

      console.log(`Loaded ${this.stopLossOrders.size} active stop-loss orders`);
    } catch (error) {
      console.error('Error loading active stop-losses:', error);
    }
  }

  private async connectWebSocket(): Promise<void> {
    try {
      // Binance WebSocket for real-time prices
      const symbols = Array.from(new Set(
        Array.from(this.stopLossOrders.values()).map(order => order.symbol.toLowerCase())
      ));

      if (symbols.length === 0) return;

      const streams = symbols.map(symbol => `${symbol}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('✅ Stop-loss WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.data && data.data.c) {
            const symbol = data.data.s;
            const price = parseFloat(data.data.c);
            this.currentPrices.set(symbol, price);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        if (this.isRunning && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connectWebSocket();
          }, 1000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
        }
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private async checkStopLosses(): Promise<void> {
    if (!this.isRunning || this.stopLossOrders.size === 0) return;

    for (const [tradeId, config] of this.stopLossOrders) {
      try {
        const currentPrice = this.currentPrices.get(config.symbol);
        if (!currentPrice) continue;

        let shouldTrigger = false;
        let newStopPrice = config.stopPrice;

        if (config.isTrailing && config.trailingPercent) {
          // Update trailing stop price
          const { data: trade } = await supabase
            .from('real_trades')
            .select('side, entry_price')
            .eq('id', tradeId)
            .single();

          if (trade) {
            if (trade.side === 'buy') {
              // For long positions, trail up only
              const trailingStop = currentPrice * (1 - config.trailingPercent / 100);
              if (trailingStop > config.stopPrice) {
                newStopPrice = trailingStop;
                await this.updateStopLoss(tradeId, newStopPrice);
                config.stopPrice = newStopPrice;
              }
              shouldTrigger = currentPrice <= config.stopPrice;
            } else {
              // For short positions, trail down only
              const trailingStop = currentPrice * (1 + config.trailingPercent / 100);
              if (trailingStop < config.stopPrice) {
                newStopPrice = trailingStop;
                await this.updateStopLoss(tradeId, newStopPrice);
                config.stopPrice = newStopPrice;
              }
              shouldTrigger = currentPrice >= config.stopPrice;
            }
          }
        } else {
          // Regular stop-loss check
          const { data: trade } = await supabase
            .from('real_trades')
            .select('side')
            .eq('id', tradeId)
            .single();

          if (trade) {
            if (trade.side === 'buy') {
              shouldTrigger = currentPrice <= config.stopPrice;
            } else {
              shouldTrigger = currentPrice >= config.stopPrice;
            }
          }
        }

        if (shouldTrigger) {
          await this.executeStopLoss(tradeId, config, currentPrice);
        }
      } catch (error) {
        console.error(`Error checking stop-loss for trade ${tradeId}:`, error);
      }
    }
  }

  private async executeStopLoss(tradeId: string, config: StopLossConfig, currentPrice: number): Promise<void> {
    try {
      console.log(`🚨 EXECUTING STOP-LOSS: ${config.symbol} at ${currentPrice}`);
      
      // Get trade details
      const { data: trade, error } = await supabase
        .from('real_trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (error || !trade) {
        console.error('Failed to fetch trade for stop-loss execution:', error);
        return;
      }

      // Execute opposing order to close position
      const connector = this.exchangeConnectors.get(config.exchangeName);
      if (!connector) {
        console.error(`No connector available for exchange: ${config.exchangeName}`);
        return;
      }

      const stopLossOrder = await connector.placeOrder({
        symbol: config.symbol,
        side: trade.side === 'buy' ? 'SELL' : 'BUY',
        type: 'MARKET',
        quantity: trade.amount
      });

      // Update trade status
      await supabase
        .from('real_trades')
        .update({
          status: 'stopped_out',
          exit_price: currentPrice,
          stop_loss_triggered: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      // Remove from active monitoring
      this.stopLossOrders.delete(tradeId);

      // Log stop-loss execution
      await supabase.from('risk_monitoring').insert({
        user_id: trade.user_id,
        account_id: config.accountId,
        risk_type: 'stop_loss_executed',
        current_value: currentPrice,
        threshold_value: config.stopPrice,
        risk_level: 'critical',
        alert_message: `Stop-loss executed for ${config.symbol} at ${currentPrice}`
      });

      console.log(`✅ Stop-loss executed successfully for trade ${tradeId}`);
    } catch (error) {
      console.error(`❌ Failed to execute stop-loss for trade ${tradeId}:`, error);
    }
  }

  private async updateStopLoss(tradeId: string, newStopPrice: number): Promise<void> {
    try {
      await supabase
        .from('real_trades')
        .update({ stop_loss: newStopPrice })
        .eq('id', tradeId);
    } catch (error) {
      console.error(`Failed to update trailing stop for trade ${tradeId}:`, error);
    }
  }

  async addStopLoss(config: StopLossConfig): Promise<void> {
    this.stopLossOrders.set(config.tradeId, config);
    console.log(`Added stop-loss monitoring for trade ${config.tradeId}`);
  }

  async removeStopLoss(tradeId: string): Promise<void> {
    this.stopLossOrders.delete(tradeId);
    console.log(`Removed stop-loss monitoring for trade ${tradeId}`);
  }

  getActiveStopLosses(): StopLossConfig[] {
    return Array.from(this.stopLossOrders.values());
  }
}

// Global instance for stop-loss management
export const stopLossManager = new AutomatedStopLossManager();
