
import { supabase } from '@/integrations/supabase/client';
import { marketDataService } from './marketDataService';

export interface SimulationConfig {
  duration: number; // minutes
  accounts: string[];
  strategies: string[];
  initialBalance: number;
}

export interface SimulationResult {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalPnL: number;
  averageLatency: number;
  trades: SimulationTrade[];
}

export interface SimulationTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  executionPrice: number;
  pnl: number;
  latency: number;
  success: boolean;
  errorMessage?: string;
  decisionLogic: any;
  timestamp: string;
}

export class SimulatedTradingEngine {
  private auditRunId: string;
  private userId: string;
  private isRunning = false;
  private trades: SimulationTrade[] = [];

  constructor(auditRunId: string, userId: string) {
    this.auditRunId = auditRunId;
    this.userId = userId;
  }

  async runSimulation(config: SimulationConfig): Promise<SimulationResult> {
    this.isRunning = true;
    this.trades = [];

    const endTime = Date.now() + (config.duration * 60 * 1000);
    let tradeCount = 0;

    console.log(`🚀 Starting ${config.duration}-minute trading simulation`);

    while (Date.now() < endTime && this.isRunning) {
      try {
        // Get current market data
        const marketData = await marketDataService.getCurrentPrices(['BTC', 'ETH', 'SOL']);
        
        if (!marketData || Object.keys(marketData).length === 0) {
          console.warn('No market data available, skipping trade cycle');
          await this.sleep(5000); // Wait 5 seconds before next attempt
          continue;
        }

        // Simulate trading decisions for each configured strategy
        for (const accountId of config.accounts) {
          const account = await this.getAccount(accountId);
          if (!account) continue;

          // Simulate 1-3 trades per account per cycle
          const tradesThisCycle = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < tradesThisCycle; i++) {
            const trade = await this.simulateTrade(account, marketData);
            if (trade) {
              this.trades.push(trade);
              await this.logSimulationTrade(trade);
              tradeCount++;
            }
          }
        }

        // Wait 10-30 seconds between trade cycles
        const waitTime = Math.random() * 20000 + 10000;
        await this.sleep(waitTime);

      } catch (error: any) {
        console.error('Simulation cycle error:', error);
        await this.sleep(5000);
      }
    }

    this.isRunning = false;

    return this.calculateResults();
  }

  private async simulateTrade(account: any, marketData: any): Promise<SimulationTrade | null> {
    const startTime = Date.now();
    
    try {
      // Select random symbol from available market data
      const symbols = Object.keys(marketData);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const currentPrice = marketData[symbol].price;

      // Simulate trading decision logic
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const maxTradeValue = account.balance * 0.1; // Max 10% of balance per trade
      const amount = (Math.random() * maxTradeValue) / currentPrice;

      // Simulate slippage (0-0.5%)
      const slippage = (Math.random() * 0.005);
      const executionPrice = currentPrice * (1 + (side === 'buy' ? slippage : -slippage));

      // Simulate some trades failing (5% failure rate)
      const success = Math.random() > 0.05;

      const latency = Date.now() - startTime;

      // Calculate simulated PnL (simplified)
      const pnl = success ? (Math.random() - 0.48) * amount * executionPrice : 0;

      const trade: SimulationTrade = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        amount: Number(amount.toFixed(8)),
        price: currentPrice,
        executionPrice: success ? executionPrice : 0,
        pnl: Number(pnl.toFixed(2)),
        latency,
        success,
        errorMessage: success ? undefined : 'Simulated execution failure',
        decisionLogic: {
          strategy: 'simulated_random',
          accountBalance: account.balance,
          marketPrice: currentPrice,
          slippage: slippage * 100,
          confidence: Math.random() * 100
        },
        timestamp: new Date().toISOString()
      };

      return trade;

    } catch (error: any) {
      return {
        id: `sim_error_${Date.now()}`,
        symbol: 'UNKNOWN',
        side: 'buy',
        amount: 0,
        price: 0,
        executionPrice: 0,
        pnl: 0,
        latency: Date.now() - startTime,
        success: false,
        errorMessage: error.message,
        decisionLogic: { error: true },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getAccount(accountId: string) {
    try {
      const { data, error } = await supabase
        .from('paper_trading_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  private async logSimulationTrade(trade: SimulationTrade) {
    try {
      // For now, just log to console since we can't save to database
      console.log('Simulation Trade:', {
        audit_run_id: this.auditRunId,
        user_id: this.userId,
        symbol: trade.symbol,
        side: trade.side,
        amount: trade.amount,
        price: trade.price,
        execution_price: trade.executionPrice,
        total_value: trade.amount * trade.price,
        pnl: trade.pnl,
        execution_latency_ms: trade.latency,
        decision_logic: trade.decisionLogic,
        success: trade.success,
        error_message: trade.errorMessage,
        timestamp: trade.timestamp
      });
    } catch (error) {
      console.warn('Failed to log simulation trade:', error);
      // Continue without logging to database
    }
  }

  private calculateResults(): SimulationResult {
    const totalTrades = this.trades.length;
    const successfulTrades = this.trades.filter(t => t.success).length;
    const failedTrades = totalTrades - successfulTrades;
    const totalPnL = this.trades.reduce((sum, t) => sum + t.pnl, 0);
    const averageLatency = this.trades.reduce((sum, t) => sum + t.latency, 0) / totalTrades || 0;

    return {
      totalTrades,
      successfulTrades,
      failedTrades,
      totalPnL: Number(totalPnL.toFixed(2)),
      averageLatency: Number(averageLatency.toFixed(0)),
      trades: this.trades
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
  }
}
