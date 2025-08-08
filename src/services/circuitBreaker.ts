
import { supabase } from '@/integrations/supabase/client';

export interface CircuitBreakerConfig {
  priceChangeThreshold: number; // Percentage change that triggers circuit breaker
  timeWindow: number; // Time window in minutes to measure price change
  cooldownPeriod: number; // Minutes before trading can resume
  affectedSymbols: string[];
  marketWideBreaker: boolean;
}

export interface PriceAlert {
  symbol: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  timestamp: number;
  severity: 'warning' | 'critical' | 'emergency';
}

export class TradingCircuitBreaker {
  private priceHistory: Map<string, { price: number; timestamp: number }[]> = new Map();
  private circuitBreakerStatus: Map<string, { triggered: boolean; cooldownUntil: number }> = new Map();
  private marketWideBreaker: boolean = false;
  private marketCooldownUntil: number = 0;
  private isMonitoring: boolean = false;
  
  private readonly DEFAULT_CONFIG: CircuitBreakerConfig = {
    priceChangeThreshold: 20, // 20% price change
    timeWindow: 15, // 15 minutes
    cooldownPeriod: 30, // 30 minutes cooldown
    affectedSymbols: ['BTC', 'ETH', 'SOL', 'ADA'],
    marketWideBreaker: true
  };

  constructor(private config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Circuit breaker monitoring already running');
      return;
    }

    this.isMonitoring = true;
    
    // Initialize price history from recent market data
    await this.initializePriceHistory();
    
    // Start monitoring loop
    setInterval(() => this.checkCircuitBreakers(), 5000); // Check every 5 seconds
    
    console.log('⚡ Circuit breaker monitoring started');
    console.log(`📊 Monitoring ${this.config.affectedSymbols.length} symbols for >${this.config.priceChangeThreshold}% moves`);
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('⏹️ Circuit breaker monitoring stopped');
  }

  private async initializePriceHistory(): Promise<void> {
    try {
      for (const symbol of this.config.affectedSymbols) {
        const { data: marketData, error } = await supabase
          .from('market_data')
          .select('price, last_updated')
          .eq('symbol', symbol.toLowerCase())
          .order('last_updated', { ascending: false })
          .limit(100);

        if (error) {
          console.error(`Failed to load price history for ${symbol}:`, error);
          continue;
        }

        if (marketData && marketData.length > 0) {
          const history = marketData.map(data => ({
            price: data.price,
            timestamp: new Date(data.last_updated).getTime()
          }));
          
          this.priceHistory.set(symbol, history);
        }
      }

      console.log(`Initialized price history for ${this.priceHistory.size} symbols`);
    } catch (error) {
      console.error('Failed to initialize price history:', error);
    }
  }

  async updatePrice(symbol: string, price: number): Promise<void> {
    const now = Date.now();
    const history = this.priceHistory.get(symbol) || [];
    
    // Add new price point
    history.unshift({ price, timestamp: now });
    
    // Keep only data within time window + some buffer
    const cutoffTime = now - (this.config.timeWindow * 60 * 1000 * 2);
    const filteredHistory = history.filter(point => point.timestamp > cutoffTime);
    
    this.priceHistory.set(symbol, filteredHistory.slice(0, 1000)); // Keep max 1000 points
    
    // Check for circuit breaker triggers
    await this.checkSymbolVolatility(symbol, price, now);
  }

  private async checkSymbolVolatility(symbol: string, currentPrice: number, timestamp: number): Promise<void> {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 2) return;

    const timeWindowMs = this.config.timeWindow * 60 * 1000;
    const referenceTime = timestamp - timeWindowMs;
    
    // Find price from time window ago
    let referencePricePoint = history.find(point => point.timestamp <= referenceTime);
    
    if (!referencePricePoint) {
      // If no exact reference point, use oldest available
      referencePricePoint = history[history.length - 1];
    }

    const referencePrice = referencePricePoint.price;
    const changePercent = Math.abs((currentPrice - referencePrice) / referencePrice * 100);
    
    if (changePercent >= this.config.priceChangeThreshold) {
      await this.triggerCircuitBreaker(symbol, {
        symbol,
        currentPrice,
        previousPrice: referencePrice,
        changePercent,
        timestamp,
        severity: this.getSeverityLevel(changePercent)
      });
    }
  }

  private async checkCircuitBreakers(): Promise<void> {
    if (!this.isMonitoring) return;

    const now = Date.now();
    
    // Check if market-wide breaker cooldown has expired
    if (this.marketWideBreaker && this.marketCooldownUntil > 0 && now > this.marketCooldownUntil) {
      await this.resumeMarketTrading();
    }
    
    // Check individual symbol cooldowns
    for (const [symbol, status] of this.circuitBreakerStatus) {
      if (status.triggered && now > status.cooldownUntil) {
        await this.resumeSymbolTrading(symbol);
      }
    }
  }

  private async triggerCircuitBreaker(symbol: string, alert: PriceAlert): Promise<void> {
    const cooldownUntil = Date.now() + (this.config.cooldownPeriod * 60 * 1000);
    
    console.error(`🚨 CIRCUIT BREAKER TRIGGERED: ${symbol}`);
    console.error(`📈 Price change: ${alert.changePercent.toFixed(2)}% in ${this.config.timeWindow} minutes`);
    console.error(`💰 ${alert.previousPrice} → ${alert.currentPrice}`);
    
    // Set circuit breaker status
    this.circuitBreakerStatus.set(symbol, {
      triggered: true,
      cooldownUntil
    });
    
    // Trigger market-wide breaker if configured
    if (this.config.marketWideBreaker && alert.severity === 'emergency') {
      this.marketWideBreaker = true;
      this.marketCooldownUntil = cooldownUntil;
      console.error('🚨 MARKET-WIDE CIRCUIT BREAKER ACTIVATED');
    }
    
    // Emergency stop all trading for affected accounts
    await this.emergencyStopTrading(symbol, alert);
    
    // Log circuit breaker event
    await this.logCircuitBreakerEvent(symbol, alert, cooldownUntil);
    
    // Send alerts to users
    await this.sendEmergencyAlerts(symbol, alert);
  }

  private async emergencyStopTrading(symbol: string, alert: PriceAlert): Promise<void> {
    try {
      if (this.marketWideBreaker) {
        // Stop all trading accounts
        await supabase
          .from('paper_trading_accounts')
          .update({ emergency_stop: true })
          .neq('emergency_stop', true);
        
        console.log('🛑 All trading accounts emergency stopped');
      } else {
        // Stop trading for specific symbol only
        console.log(`🛑 Trading halted for ${symbol}`);
      }
    } catch (error) {
      console.error('Failed to trigger emergency stop:', error);
    }
  }

  private async resumeMarketTrading(): Promise<void> {
    this.marketWideBreaker = false;
    this.marketCooldownUntil = 0;
    
    console.log('✅ Market-wide circuit breaker CLEARED - Trading resumed');
    
    // Log resumption
    await supabase.from('risk_monitoring').insert({
      user_id: null,
      account_id: null,
      risk_type: 'circuit_breaker_cleared',
      current_value: 0,
      threshold_value: this.config.priceChangeThreshold,
      risk_level: 'info',
      alert_message: 'Market-wide circuit breaker cleared - Trading resumed'
    });
  }

  private async resumeSymbolTrading(symbol: string): Promise<void> {
    this.circuitBreakerStatus.delete(symbol);
    
    console.log(`✅ Circuit breaker CLEARED for ${symbol} - Trading resumed`);
    
    await supabase.from('risk_monitoring').insert({
      user_id: null,
      account_id: null,
      risk_type: 'circuit_breaker_cleared',
      current_value: 0,
      threshold_value: this.config.priceChangeThreshold,
      risk_level: 'info',
      alert_message: `Circuit breaker cleared for ${symbol} - Trading resumed`
    });
  }

  private getSeverityLevel(changePercent: number): 'warning' | 'critical' | 'emergency' {
    if (changePercent >= 50) return 'emergency';
    if (changePercent >= 30) return 'critical';
    return 'warning';
  }

  private async logCircuitBreakerEvent(symbol: string, alert: PriceAlert, cooldownUntil: number): Promise<void> {
    try {
      await supabase.from('risk_monitoring').insert({
        user_id: null,
        account_id: null,
        risk_type: 'circuit_breaker_triggered',
        current_value: alert.currentPrice,
        threshold_value: this.config.priceChangeThreshold,
        risk_level: alert.severity,
        alert_message: `Circuit breaker triggered: ${symbol} moved ${alert.changePercent.toFixed(2)}% to ${alert.currentPrice}`,
        metadata: {
          symbol,
          changePercent: alert.changePercent,
          previousPrice: alert.previousPrice,
          currentPrice: alert.currentPrice,
          timeWindow: this.config.timeWindow,
          cooldownUntil: new Date(cooldownUntil).toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log circuit breaker event:', error);
    }
  }

  private async sendEmergencyAlerts(symbol: string, alert: PriceAlert): Promise<void> {
    // This would integrate with notification system
    console.log(`📢 EMERGENCY ALERT: ${symbol} circuit breaker triggered`);
    console.log(`📊 ${alert.changePercent.toFixed(2)}% change detected`);
  }

  // Public methods
  isSymbolHalted(symbol: string): boolean {
    const status = this.circuitBreakerStatus.get(symbol);
    return status?.triggered || false;
  }

  isMarketHalted(): boolean {
    return this.marketWideBreaker;
  }

  getHaltedSymbols(): string[] {
    return Array.from(this.circuitBreakerStatus.keys()).filter(symbol => 
      this.circuitBreakerStatus.get(symbol)?.triggered
    );
  }

  getRemainingCooldown(symbol: string): number {
    const status = this.circuitBreakerStatus.get(symbol);
    if (!status?.triggered) return 0;
    
    const remaining = Math.max(0, status.cooldownUntil - Date.now());
    return Math.ceil(remaining / 1000 / 60); // Return minutes
  }

  async forceResumeTrading(symbol?: string): Promise<void> {
    if (symbol) {
      this.circuitBreakerStatus.delete(symbol);
      console.log(`🔓 Manually resumed trading for ${symbol}`);
    } else {
      this.marketWideBreaker = false;
      this.marketCooldownUntil = 0;
      this.circuitBreakerStatus.clear();
      console.log('🔓 Manually resumed ALL trading');
    }
  }
}

// Global circuit breaker instance
export const tradingCircuitBreaker = new TradingCircuitBreaker();
