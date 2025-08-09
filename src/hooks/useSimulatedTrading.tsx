
import { useState, useCallback } from 'react';
import { SimulatedTradingEngine, SimulationConfig, SimulationResult } from '@/services/simulatedTrading';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSimulatedTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [engine, setEngine] = useState<SimulatedTradingEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);

  const startSimulation = useCallback(async (auditRunId: string, config: SimulationConfig) => {
    if (!user) return null;

    try {
      setIsRunning(true);
      const tradingEngine = new SimulatedTradingEngine(auditRunId, user.id);
      setEngine(tradingEngine);

      toast({
        title: "Starting Simulation",
        description: `Running ${config.duration}-minute paper trading simulation`,
      });

      const simulationResults = await tradingEngine.runSimulation(config);
      setResults(simulationResults);

      toast({
        title: "Simulation Complete",
        description: `Executed ${simulationResults.totalTrades} trades with ${simulationResults.totalPnL >= 0 ? '+' : ''}${simulationResults.totalPnL} PnL`,
        variant: simulationResults.totalPnL >= 0 ? 'default' : 'destructive'
      });

      return simulationResults;
    } catch (error: any) {
      console.error('Simulation failed:', error);
      toast({
        title: "Simulation Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRunning(false);
      setEngine(null);
    }
  }, [user, toast]);

  const stopSimulation = useCallback(() => {
    if (engine) {
      engine.stop();
      setIsRunning(false);
      toast({
        title: "Simulation Stopped",
        description: "Trading simulation has been manually stopped",
        variant: "default"
      });
    }
  }, [engine, toast]);

  const exportSimulationData = useCallback(async () => {
    if (!results) return;

    const csvData = results.trades.map(trade => ({
      Timestamp: trade.timestamp,
      Symbol: trade.symbol,
      Side: trade.side,
      Amount: trade.amount,
      Price: trade.price,
      'Execution Price': trade.executionPrice,
      PnL: trade.pnl,
      'Latency (ms)': trade.latency,
      Success: trade.success,
      Error: trade.errorMessage || ''
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Simulation trade data exported as CSV",
    });
  }, [results, toast]);

  return {
    isRunning,
    results,
    startSimulation,
    stopSimulation,
    exportSimulationData
  };
};
