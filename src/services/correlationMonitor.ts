import { supabase } from '@/integrations/supabase/client';

export interface CorrelationMatrix {
  [symbol: string]: { [symbol: string]: number };
}

export interface PortfolioCorrelation {
  averageCorrelation: number;
  maxCorrelation: number;
  riskScore: number;
  correlationMatrix: CorrelationMatrix;
  recommendations: string[];
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

export class PortfolioCorrelationMonitor {
  private priceHistory: Map<string, PriceData[]> = new Map();
  private correlationCache: Map<string, number> = new Map();
  private lastCorrelationUpdate: number = 0;
  private readonly UPDATE_INTERVAL = 300000; // 5 minutes
  private readonly HISTORY_PERIOD = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MIN_DATA_POINTS = 50;

  async initializeMonitoring(symbols: string[]): Promise<void> {
    console.log(`📊 Initializing correlation monitoring for ${symbols.length} symbols`);
    
    // Load historical price data
    for (const symbol of symbols) {
      await this.loadHistoricalPrices(symbol);
    }
    
    // Calculate initial correlations
    await this.updateCorrelations();
    
    console.log('✅ Correlation monitoring initialized');
  }

  private async loadHistoricalPrices(symbol: string): Promise<void> {
    try {
      const { data: priceData, error } = await supabase
        .from('market_data')
        .select('price, last_updated')
        .eq('symbol', symbol.toLowerCase())
        .order('last_updated', { ascending: false })
        .limit(1000);

      if (error) {
        console.error(`Failed to load price history for ${symbol}:`, error);
        return;
      }

      if (priceData && priceData.length > 0) {
        const history = priceData.map(data => ({
          symbol: symbol,
          price: data.price,
          timestamp: new Date(data.last_updated).getTime()
        }));
        
        this.priceHistory.set(symbol, history);
        console.log(`📈 Loaded ${history.length} price points for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error loading historical prices for ${symbol}:`, error);
    }
  }

  async updatePrice(symbol: string, price: number, timestamp: number = Date.now()): Promise<void> {
    const history = this.priceHistory.get(symbol) || [];
    
    // Add new price point
    history.unshift({ symbol, price, timestamp });
    
    // Keep only recent data within the history period
    const cutoffTime = timestamp - this.HISTORY_PERIOD;
    const filteredHistory = history.filter(point => point.timestamp > cutoffTime);
    
    this.priceHistory.set(symbol, filteredHistory.slice(0, 1000)); // Keep max 1000 points
    
    // Update correlations periodically
    if (timestamp - this.lastCorrelationUpdate > this.UPDATE_INTERVAL) {
      await this.updateCorrelations();
    }
  }

  private async updateCorrelations(): Promise<void> {
    try {
      const symbols = Array.from(this.priceHistory.keys());
      
      // Calculate correlations between all symbol pairs
      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          const correlation = this.calculateCorrelation(symbols[i], symbols[j]);
          const pairKey = `${symbols[i]}-${symbols[j]}`;
          this.correlationCache.set(pairKey, correlation);
        }
      }
      
      this.lastCorrelationUpdate = Date.now();
      console.log(`🔄 Updated correlations for ${symbols.length} symbols`);
    } catch (error) {
      console.error('Failed to update correlations:', error);
    }
  }

  private calculateCorrelation(symbol1: string, symbol2: string): number {
    const history1 = this.priceHistory.get(symbol1) || [];
    const history2 = this.priceHistory.get(symbol2) || [];
    
    if (history1.length < this.MIN_DATA_POINTS || history2.length < this.MIN_DATA_POINTS) {
      return 0; // Not enough data
    }
    
    // Align timestamps and calculate returns
    const returns1 = this.calculateReturns(history1);
    const returns2 = this.calculateReturns(history2);
    
    const alignedReturns = this.alignReturns(returns1, returns2);
    
    if (alignedReturns.length < this.MIN_DATA_POINTS) {
      return 0;
    }
    
    // Calculate Pearson correlation coefficient
    return this.pearsonCorrelation(
      alignedReturns.map(pair => pair.return1),
      alignedReturns.map(pair => pair.return2)
    );
  }

  private calculateReturns(priceHistory: PriceData[]): Array<{ timestamp: number; return: number }> {
    const returns: Array<{ timestamp: number; return: number }> = [];
    
    for (let i = 1; i < priceHistory.length; i++) {
      const currentPrice = priceHistory[i - 1].price;
      const previousPrice = priceHistory[i].price;
      const returnValue = (currentPrice - previousPrice) / previousPrice;
      
      returns.push({
        timestamp: priceHistory[i - 1].timestamp,
        return: returnValue
      });
    }
    
    return returns;
  }

  private alignReturns(
    returns1: Array<{ timestamp: number; return: number }>, 
    returns2: Array<{ timestamp: number; return: number }>
  ): Array<{ return1: number; return2: number; timestamp: number }> {
    const aligned: Array<{ return1: number; return2: number; timestamp: number }> = [];
    
    let i = 0, j = 0;
    const tolerance = 60000; // 1 minute tolerance
    
    while (i < returns1.length && j < returns2.length) {
      const time1 = returns1[i].timestamp;
      const time2 = returns2[j].timestamp;
      
      if (Math.abs(time1 - time2) <= tolerance) {
        aligned.push({
          return1: returns1[i].return,
          return2: returns2[j].return,
          timestamp: Math.min(time1, time2)
        });
        i++;
        j++;
      } else if (time1 > time2) {
        j++;
      } else {
        i++;
      }
    }
    
    return aligned;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    
    if (n !== y.length || n === 0) return 0;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }

  async analyzePortfolioCorrelation(accountId: string): Promise<PortfolioCorrelation> {
    try {
      // Get portfolio holdings from paper_trades (since portfolio_holdings doesn't exist)
      const { data: trades, error } = await supabase
        .from('paper_trades')
        .select('symbol, amount, price')
        .eq('account_id', accountId)
        .eq('status', 'completed');
      
      if (error) throw error;
      
      if (!trades || trades.length === 0) {
        return {
          averageCorrelation: 0,
          maxCorrelation: 0,
          riskScore: 0,
          correlationMatrix: {},
          recommendations: ['No holdings found in portfolio']
        };
      }
      
      // Calculate portfolio composition from trades
      const holdings: { [symbol: string]: { amount: number; value: number } } = {};
      
      trades.forEach(trade => {
        if (!holdings[trade.symbol]) {
          holdings[trade.symbol] = { amount: 0, value: 0 };
        }
        if (trade.side === 'buy') {
          holdings[trade.symbol].amount += trade.amount;
          holdings[trade.symbol].value += trade.amount * trade.price;
        } else {
          holdings[trade.symbol].amount -= trade.amount;
          holdings[trade.symbol].value -= trade.amount * trade.price;
        }
      });
      
      // Filter out zero/negative positions
      const activeHoldings = Object.entries(holdings).filter(([_, data]) => data.amount > 0);
      
      if (activeHoldings.length === 0) {
        return {
          averageCorrelation: 0,
          maxCorrelation: 0,
          riskScore: 0,
          correlationMatrix: {},
          recommendations: ['No active positions in portfolio']
        };
      }
      
      const symbols = activeHoldings.map(([symbol]) => symbol);
      const weights = this.calculateWeightsFromHoldings(activeHoldings);
      
      // Build correlation matrix
      const correlationMatrix: CorrelationMatrix = {};
      let totalCorrelation = 0;
      let correlationCount = 0;
      let maxCorrelation = 0;
      
      for (const symbol1 of symbols) {
        correlationMatrix[symbol1] = {};
        for (const symbol2 of symbols) {
          if (symbol1 === symbol2) {
            correlationMatrix[symbol1][symbol2] = 1;
          } else {
            const pairKey = symbol1 < symbol2 ? `${symbol1}-${symbol2}` : `${symbol2}-${symbol1}`;
            const correlation = this.correlationCache.get(pairKey) || 0;
            correlationMatrix[symbol1][symbol2] = correlation;
            
            if (symbol1 < symbol2) { // Count each pair only once
              totalCorrelation += Math.abs(correlation);
              correlationCount++;
              maxCorrelation = Math.max(maxCorrelation, Math.abs(correlation));
            }
          }
        }
      }
      
      const averageCorrelation = correlationCount > 0 ? totalCorrelation / correlationCount : 0;
      
      // Calculate weighted correlation risk score
      let weightedRisk = 0;
      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          const correlation = Math.abs(correlationMatrix[symbols[i]][symbols[j]]);
          const combinedWeight = weights[symbols[i]] * weights[symbols[j]];
          weightedRisk += correlation * combinedWeight;
        }
      }
      
      const riskScore = Math.min(100, weightedRisk * 100);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        correlationMatrix,
        weights,
        averageCorrelation,
        maxCorrelation,
        riskScore
      );
      
      return {
        averageCorrelation,
        maxCorrelation,
        riskScore,
        correlationMatrix,
        recommendations
      };
    } catch (error) {
      console.error('Failed to analyze portfolio correlation:', error);
      return {
        averageCorrelation: 0,
        maxCorrelation: 0,
        riskScore: 100, // Assume high risk on error
        correlationMatrix: {},
        recommendations: ['Error analyzing portfolio correlation']
      };
    }
  }

  private calculateWeightsFromHoldings(holdings: [string, { amount: number; value: number }][]): { [symbol: string]: number } {
    const totalValue = holdings.reduce((sum, [_, data]) => sum + data.value, 0);
    const weights: { [symbol: string]: number } = {};
    
    holdings.forEach(([symbol, data]) => {
      weights[symbol] = totalValue > 0 ? data.value / totalValue : 0;
    });
    
    return weights;
  }

  private generateRecommendations(
    correlationMatrix: CorrelationMatrix,
    weights: { [symbol: string]: number },
    averageCorrelation: number,
    maxCorrelation: number,
    riskScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    // High correlation warning
    if (averageCorrelation > 0.8) {
      recommendations.push('⚠️ Very high average correlation (>80%) - Consider diversifying across different asset classes');
    } else if (averageCorrelation > 0.6) {
      recommendations.push('⚠️ High correlation detected - Portfolio may move together during market stress');
    }
    
    // Maximum correlation warning
    if (maxCorrelation > 0.9) {
      recommendations.push('🚨 Extremely correlated assets detected - These may behave identically during market events');
    }
    
    // Risk score recommendations
    if (riskScore > 80) {
      recommendations.push('🔴 High correlation risk - Consider rebalancing to reduce concentration');
    } else if (riskScore > 60) {
      recommendations.push('🟡 Moderate correlation risk - Monitor during volatile periods');
    } else if (riskScore < 30) {
      recommendations.push('✅ Good diversification - Low correlation risk detected');
    }
    
    // Specific pair recommendations
    const symbols = Object.keys(correlationMatrix);
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const correlation = correlationMatrix[symbols[i]][symbols[j]];
        const combinedWeight = weights[symbols[i]] + weights[symbols[j]];
        
        if (Math.abs(correlation) > 0.85 && combinedWeight > 0.5) {
          recommendations.push(
            `⚠️ ${symbols[i]} and ${symbols[j]} are highly correlated (${(correlation * 100).toFixed(1)}%) and represent ${(combinedWeight * 100).toFixed(1)}% of portfolio`
          );
        }
      }
    }
    
    // Concentration recommendations
    const sortedWeights = Object.entries(weights).sort((a, b) => b[1] - a[1]);
    if (sortedWeights[0] && sortedWeights[0][1] > 0.4) {
      recommendations.push(`⚠️ High concentration in ${sortedWeights[0][0]} (${(sortedWeights[0][1] * 100).toFixed(1)}%)`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Portfolio correlation analysis complete - No major concerns detected');
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  getCorrelation(symbol1: string, symbol2: string): number {
    const pairKey = symbol1 < symbol2 ? `${symbol1}-${symbol2}` : `${symbol2}-${symbol1}`;
    return this.correlationCache.get(pairKey) || 0;
  }

  getMonitoredSymbols(): string[] {
    return Array.from(this.priceHistory.keys());
  }

  async generateCorrelationReport(): Promise<any> {
    const symbols = this.getMonitoredSymbols();
    const report = {
      timestamp: new Date().toISOString(),
      symbolCount: symbols.length,
      dataPoints: {},
      averageCorrelations: {},
      highestCorrelations: [],
      summary: {
        overallRisk: 'low',
        recommendedAction: 'monitor'
      }
    };
    
    // Data points per symbol
    symbols.forEach(symbol => {
      const history = this.priceHistory.get(symbol) || [];
      (report.dataPoints as any)[symbol] = history.length;
    });
    
    // Find highest correlations
    const highCorrelations: Array<{ pair: string; correlation: number }> = [];
    
    for (const [pairKey, correlation] of this.correlationCache) {
      if (Math.abs(correlation) > 0.7) {
        highCorrelations.push({ pair: pairKey, correlation });
      }
    }
    
    report.highestCorrelations = highCorrelations
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 10);
    
    // Overall risk assessment
    const avgAbsCorrelation = Array.from(this.correlationCache.values())
      .reduce((sum, corr) => sum + Math.abs(corr), 0) / this.correlationCache.size;
    
    if (avgAbsCorrelation > 0.8) {
      report.summary.overallRisk = 'high';
      report.summary.recommendedAction = 'rebalance';
    } else if (avgAbsCorrelation > 0.6) {
      report.summary.overallRisk = 'medium';
      report.summary.recommendedAction = 'monitor closely';
    }
    
    return report;
  }
}

// Global correlation monitor instance
export const correlationMonitor = new PortfolioCorrelationMonitor();
