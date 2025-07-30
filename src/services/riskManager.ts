import { supabase } from '@/integrations/supabase/client';
import { ExchangeConnector } from './exchangeConnector';

export interface RiskParameters {
  maxDailyLoss: number;
  maxPositionSize: number;
  maxDrawdown: number;
  volatilityThreshold: number;
  correlationLimit: number;
}

export interface PortfolioRisk {
  totalValue: number;
  totalRisk: number;
  concentration: Record<string, number>;
  correlation: number;
  volatility: number;
}

export class RiskManager {
  private userId: string;
  private parameters: RiskParameters;
  
  constructor(userId: string, parameters: RiskParameters) {
    this.userId = userId;
    this.parameters = parameters;
  }
  
  // Real-time portfolio risk assessment
  async assessPortfolioRisk(accountId: string): Promise<PortfolioRisk> {
    try {
      // Fetch current positions from portfolios table
      const { data: holdings, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('portfolio_id', accountId);
        
      if (error) throw error;
      
      let totalValue = 0;
      let totalRisk = 0;
      const concentration: Record<string, number> = {};
      
      // Calculate portfolio metrics using actual table structure
      for (const holding of holdings || []) {
        const value = holding.current_value;
        totalValue += value;
        concentration[holding.asset_symbol] = (concentration[holding.asset_symbol] || 0) + value;
      }
      
      // Calculate concentration risk
      for (const [symbol, value] of Object.entries(concentration)) {
        const weightage = totalValue > 0 ? value / totalValue : 0;
        if (weightage > 0.3) { // More than 30% in single asset
          totalRisk += weightage * 0.5; // High concentration penalty
        }
        concentration[symbol] = weightage;
      }
      
      return {
        totalValue,
        totalRisk,
        concentration,
        correlation: 0.7, // Placeholder - would calculate actual correlation
        volatility: 0.15 // Placeholder - would calculate from price history
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    }
  }
  
  // Pre-trade risk validation
  async validateTradeRisk(
    accountId: string,
    symbol: string,
    amount: number,
    price: number,
    side: 'buy' | 'sell'
  ): Promise<{ valid: boolean; reason?: string; riskScore: number }> {
    try {
      const tradeValue = amount * price;
      
      // Get current portfolio risk
      const portfolioRisk = await this.assessPortfolioRisk(accountId);
      
      // Check position size limit
      if (tradeValue > this.parameters.maxPositionSize) {
        return {
          valid: false,
          reason: `Trade value ${tradeValue} exceeds max position size ${this.parameters.maxPositionSize}`,
          riskScore: 10
        };
      }
      
      // Check concentration after trade
      const newConcentration = { ...portfolioRisk.concentration };
      if (side === 'buy') {
        const currentWeight = newConcentration[symbol] || 0;
        const newWeight = (currentWeight * portfolioRisk.totalValue + tradeValue) / (portfolioRisk.totalValue + tradeValue);
        
        if (newWeight > 0.4) { // Max 40% in single asset
          return {
            valid: false,
            reason: `Trade would increase ${symbol} concentration to ${(newWeight * 100).toFixed(1)}%`,
            riskScore: 8
          };
        }
      }
      
      // Check daily loss limits
      const { data: dailyTrades } = await supabase
        .from('real_trades')
        .select('total_value')
        .eq('account_id', accountId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
      const dailyVolume = (dailyTrades || []).reduce((sum, trade) => sum + Math.abs(trade.total_value), 0);
      
      if (dailyVolume + tradeValue > this.parameters.maxDailyLoss) {
        return {
          valid: false,
          reason: `Daily volume limit exceeded: ${dailyVolume + tradeValue} > ${this.parameters.maxDailyLoss}`,
          riskScore: 9
        };
      }
      
      // Calculate risk score (0-10, where 10 is highest risk)
      let riskScore = 0;
      riskScore += Math.min((tradeValue / this.parameters.maxPositionSize) * 5, 5);
      riskScore += Math.min(portfolioRisk.volatility * 10, 3);
      riskScore += Math.min(portfolioRisk.correlation * 2, 2);
      
      return {
        valid: true,
        riskScore: Math.round(riskScore)
      };
    } catch (error) {
      console.error('Trade risk validation failed:', error);
      return {
        valid: false,
        reason: 'Risk validation system error',
        riskScore: 10
      };
    }
  }
  
  // Automated stop-loss monitoring
  async monitorStopLosses(accountId: string): Promise<void> {
    try {
      // Monitor paper trades with stop losses for this account
      const { data: trades, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('account_id', accountId)
        .not('stop_loss', 'is', null)
        .eq('status', 'completed');
        
      if (error) throw error;
      
      for (const trade of trades || []) {
        // Get current market price for the symbol
        const { data: marketData } = await supabase
          .from('market_data')
          .select('price')
          .eq('symbol', trade.symbol.toLowerCase())
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();
          
        if (marketData) {
          // Check if current price has hit stop-loss
          if (trade.side === 'buy' && marketData.price <= trade.stop_loss) {
            await this.triggerStopLoss(accountId, trade, marketData.price);
          } else if (trade.side === 'sell' && marketData.price >= trade.stop_loss) {
            await this.triggerStopLoss(accountId, trade, marketData.price);
          }
        }
      }
    } catch (error) {
      console.error('Stop-loss monitoring failed:', error);
    }
  }
  
  // Trigger automated stop-loss
  private async triggerStopLoss(accountId: string, trade: any, currentPrice: number): Promise<void> {
    try {
      console.warn(`🚨 Stop-loss triggered for ${trade.symbol} at ${currentPrice}`);
      
      // Create opposing order to close position
      const { data, error } = await supabase.rpc('execute_paper_trade', {
        p_user_id: this.userId,
        p_account_id: accountId,
        p_symbol: trade.symbol,
        p_side: trade.side === 'buy' ? 'sell' : 'buy',
        p_amount: trade.amount,
        p_price: currentPrice,
        p_trade_type: 'market',
        p_order_type: 'stop_loss'
      });
      
      if (error) {
        console.error('Stop-loss order failed:', error);
        return;
      }
      
      // Log stop-loss execution
      await supabase.from('risk_monitoring').insert({
        user_id: this.userId,
        account_id: accountId,
        risk_type: 'stop_loss_triggered',
        current_value: currentPrice,
        threshold_value: trade.stop_loss,
        risk_level: 'critical',
        alert_message: `Stop-loss executed for ${trade.symbol} at ${currentPrice}`
      });
      
    } catch (error) {
      console.error('Stop-loss execution failed:', error);
    }
  }
  
  // Dynamic position sizing based on volatility
  calculateOptimalPositionSize(
    accountBalance: number,
    symbolVolatility: number,
    riskPercentage: number = 2
  ): number {
    // Kelly Criterion-based position sizing
    const winRate = 0.6; // Assumed 60% win rate
    const avgWin = 0.05; // Assumed 5% average win
    const avgLoss = 0.03; // Assumed 3% average loss
    
    const kellyFraction = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
    const volatilityAdjustment = Math.max(0.1, 1 - symbolVolatility);
    
    const optimalRisk = Math.min(kellyFraction * volatilityAdjustment, riskPercentage / 100);
    
    return accountBalance * optimalRisk;
  }
  
  // Real-time correlation monitoring
  async monitorCorrelation(holdings: string[]): Promise<number> {
    try {
      // This would calculate real correlation between holdings
      // For now, return estimated correlation
      if (holdings.length <= 1) return 0;
      
      // Crypto assets generally have high correlation (0.7-0.9)
      // Would implement actual correlation calculation with price data
      return 0.75;
    } catch (error) {
      console.error('Correlation monitoring failed:', error);
      return 1; // Assume worst case
    }
  }
  
  // Emergency portfolio liquidation
  async emergencyLiquidate(accountId: string, reason: string): Promise<boolean> {
    try {
      console.error(`🚨 EMERGENCY LIQUIDATION TRIGGERED: ${reason}`);
      
      // Get all open positions from paper trades
      const { data: openTrades } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'completed');
        
      // Create closing trades for all positions
      for (const trade of openTrades || []) {
        // Get current market price
        const { data: marketData } = await supabase
          .from('market_data')
          .select('price')
          .eq('symbol', trade.symbol.toLowerCase())
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();
          
        const currentPrice = marketData?.price || trade.price;
        
        // Execute opposing order
        await supabase.rpc('execute_paper_trade', {
          p_user_id: this.userId,
          p_account_id: accountId,
          p_symbol: trade.symbol,
          p_side: trade.side === 'buy' ? 'sell' : 'buy',
          p_amount: trade.amount,
          p_price: currentPrice,
          p_trade_type: 'market',
          p_order_type: 'emergency_liquidation'
        });
      }
      
      // Activate emergency stop
      await supabase
        .from('paper_trading_accounts')
        .update({ emergency_stop: true })
        .eq('id', accountId);
      
      // Log emergency liquidation
      await supabase.from('risk_monitoring').insert({
        user_id: this.userId,
        account_id: accountId,
        risk_type: 'emergency_liquidation',
        current_value: 0,
        threshold_value: 0,
        risk_level: 'critical',
        alert_message: `Emergency liquidation: ${reason}`
      });
      
      return true;
    } catch (error) {
      console.error('Emergency liquidation failed:', error);
      return false;
    }
  }
}