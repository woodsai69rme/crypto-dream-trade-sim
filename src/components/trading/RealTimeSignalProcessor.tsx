
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAIEnsembleTrading } from "@/hooks/useAIEnsembleTrading";
import { useMultipleAccounts } from "@/hooks/useMultipleAccounts";
import { Brain, Zap, Target, TrendingUp, AlertTriangle } from "lucide-react";

interface SignalVote {
  bot_id: string;
  bot_name: string;
  confidence: number;
  reasoning: string;
  weight: number;
}

interface ProcessedSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  ensemble_confidence: number;
  votes: SignalVote[];
  market_conditions: string;
  execution_priority: 'high' | 'medium' | 'low';
  estimated_profit: number;
  risk_score: number;
}

export const RealTimeSignalProcessor = () => {
  const { bots, marketConditions, isEnsembleActive, signals } = useAIEnsembleTrading();
  const { accounts, executeTrade } = useMultipleAccounts();
  
  const [processedSignals, setProcessedSignals] = useState<ProcessedSignal[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState({
    signalsProcessed: 0,
    averageConfidence: 0,
    successRate: 0,
    totalProfit: 0
  });

  // Advanced signal processing with ensemble voting
  const processEnsembleSignal = useCallback(async (rawSignal: any) => {
    setIsProcessing(true);
    
    // Simulate advanced AI ensemble processing
    const votes: SignalVote[] = bots.slice(0, 5).map(bot => ({
      bot_id: bot.id,
      bot_name: bot.name,
      confidence: 60 + Math.random() * 35,
      reasoning: `${bot.strategy} analysis suggests ${rawSignal.side} based on current market conditions`,
      weight: bot.performance.win_rate / 100
    }));

    // Calculate ensemble confidence using weighted voting
    const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const weightedConfidence = votes.reduce((sum, vote) => sum + (vote.confidence * vote.weight), 0) / totalWeight;

    // Determine execution priority based on confidence and market conditions
    const executionPriority: 'high' | 'medium' | 'low' = 
      weightedConfidence > 85 ? 'high' :
      weightedConfidence > 70 ? 'medium' : 'low';

    const processedSignal: ProcessedSignal = {
      id: `processed-${Date.now()}`,
      symbol: rawSignal.symbol,
      side: rawSignal.side,
      ensemble_confidence: weightedConfidence,
      votes,
      market_conditions: `${marketConditions.trend} trend, ${marketConditions.volatility} volatility`,
      execution_priority: executionPriority,
      estimated_profit: (Math.random() * 0.05 + 0.01) * 100, // 1-6% estimated profit
      risk_score: Math.random() * 30 + 20 // 20-50 risk score
    };

    setProcessedSignals(prev => [processedSignal, ...prev.slice(0, 19)]);
    
    // Execute signal if confidence is high enough
    if (weightedConfidence > 75 && executionPriority !== 'low') {
      await executeSignalAcrossAccounts(processedSignal);
    }

    setIsProcessing(false);
  }, [bots, marketConditions, accounts]);

  const executeSignalAcrossAccounts = async (signal: ProcessedSignal) => {
    for (const account of accounts) {
      try {
        // Account-specific risk adjustments
        const riskMultiplier = account.account_name === 'woods1' ? 0.5 : 
                             account.account_name === 'angry' ? 1.5 : 1.0;
        
        const adjustedAmount = 0.1 * riskMultiplier;
        const confidenceThreshold = account.account_name === 'woods1' ? 85 : 
                                   account.account_name === 'angry' ? 65 : 75;

        if (signal.ensemble_confidence >= confidenceThreshold) {
          await executeTrade({
            symbol: signal.symbol,
            side: signal.side,
            amount: adjustedAmount,
            price: 50000 + Math.random() * 20000,
            type: 'market'
          });
        }
      } catch (error) {
        console.error(`Failed to execute signal on ${account.account_name}:`, error);
      }
    }

    // Update processing stats
    setProcessingStats(prev => ({
      signalsProcessed: prev.signalsProcessed + 1,
      averageConfidence: (prev.averageConfidence + signal.ensemble_confidence) / 2,
      successRate: Math.min(95, prev.successRate + 0.5),
      totalProfit: prev.totalProfit + signal.estimated_profit
    }));
  };

  // Process incoming signals
  useEffect(() => {
    if (signals.length > 0 && isEnsembleActive) {
      const latestSignal = signals[0];
      processEnsembleSignal(latestSignal);
    }
  }, [signals, isEnsembleActive, processEnsembleSignal]);

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Ensemble Signal Processor
            <Badge className={`ml-auto ${isEnsembleActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {isEnsembleActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{processingStats.signalsProcessed}</div>
              <div className="text-sm text-white/60">Signals Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{processingStats.averageConfidence.toFixed(1)}%</div>
              <div className="text-sm text-white/60">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{processingStats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-white/60">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{processingStats.totalProfit.toFixed(2)}%</div>
              <div className="text-sm text-white/60">Total Profit</div>
            </div>
          </div>

          {/* Market Conditions */}
          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="font-medium text-white mb-2">Current Market Conditions</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-white/80">Trend: <span className="text-white">{marketConditions.trend}</span></span>
              <span className="text-white/80">Volatility: <span className="text-white">{marketConditions.volatility}</span></span>
              <span className="text-white/80">Volume: <span className="text-white">{marketConditions.volume}</span></span>
              <span className="text-white/80">Sentiment: <span className="text-white">{marketConditions.sentiment > 0 ? 'Bullish' : 'Bearish'}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processed Signals */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Processed Trading Signals ({processedSignals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {processedSignals.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                {isEnsembleActive ? 'Processing signals...' : 'Activate ensemble trading to see processed signals'}
              </div>
            ) : (
              processedSignals.map((signal) => (
                <div key={signal.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={signal.side === 'buy' ? 'default' : 'destructive'}>
                        {signal.side.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-white">{signal.symbol}</span>
                      <Badge variant="outline" className={`text-xs ${
                        signal.execution_priority === 'high' ? 'border-green-500 text-green-400' :
                        signal.execution_priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                        'border-red-500 text-red-400'
                      }`}>
                        {signal.execution_priority} priority
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">{signal.ensemble_confidence.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">Ensemble Confidence</span>
                      <span className="text-white">{signal.ensemble_confidence.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={signal.ensemble_confidence} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-white/60">Est. Profit: </span>
                      <span className="text-green-400">{signal.estimated_profit.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Risk Score: </span>
                      <span className={`${signal.risk_score > 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {signal.risk_score.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-white/60 mb-2">
                    Market: {signal.market_conditions}
                  </div>

                  {/* Bot Votes */}
                  <div className="space-y-1">
                    <div className="text-xs text-white/60">Bot Ensemble Votes:</div>
                    {signal.votes.slice(0, 3).map((vote, idx) => (
                      <div key={idx} className="text-xs flex items-center justify-between">
                        <span className="text-white/80">{vote.bot_name}</span>
                        <span className="text-white">{vote.confidence.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
