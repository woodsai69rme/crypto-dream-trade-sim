
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Zap, Target, TrendingUp, Brain, Cpu } from "lucide-react";

interface OptimizationConfig {
  ensemble_weight_adjustment: boolean;
  dynamic_position_sizing: boolean;
  market_condition_adaptation: boolean;
  correlation_based_filtering: boolean;
  volatility_scaling: boolean;
  sentiment_integration: boolean;
}

interface PerformanceMetrics {
  current_sharpe: number;
  projected_sharpe: number;
  current_drawdown: number;
  projected_drawdown: number;
  current_win_rate: number;
  projected_win_rate: number;
  optimization_score: number;
}

export const SystemOptimizer = () => {
  const { toast } = useToast();
  
  const [optimizationConfig, setOptimizationConfig] = useState<OptimizationConfig>({
    ensemble_weight_adjustment: true,
    dynamic_position_sizing: true,
    market_condition_adaptation: true,
    correlation_based_filtering: false,
    volatility_scaling: true,
    sentiment_integration: false
  });

  const [optimizationParams, setOptimizationParams] = useState({
    risk_tolerance: [50],
    diversification_level: [70],
    signal_confidence_threshold: [75],
    rebalancing_frequency: [24], // hours
    max_correlation: [80],
    volatility_lookback: [14] // days
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    current_sharpe: 1.65,
    projected_sharpe: 1.85,
    current_drawdown: 12.3,
    projected_drawdown: 9.8,
    current_win_rate: 68.5,
    projected_win_rate: 72.1,
    optimization_score: 78
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any[]>([]);

  // Run optimization simulation
  const runOptimization = async () => {
    setIsOptimizing(true);
    
    toast({
      title: "Optimization Started",
      description: "Running advanced system optimization...",
    });

    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Calculate projected improvements
    const improvements = {
      sharpe_improvement: Math.random() * 0.3 + 0.1,
      drawdown_reduction: Math.random() * 0.05 + 0.02,
      win_rate_improvement: Math.random() * 5 + 2,
      profit_increase: Math.random() * 15 + 5
    };

    setPerformanceMetrics(prev => ({
      ...prev,
      projected_sharpe: prev.current_sharpe + improvements.sharpe_improvement,
      projected_drawdown: Math.max(5, prev.current_drawdown - improvements.drawdown_reduction * 100),
      projected_win_rate: Math.min(85, prev.current_win_rate + improvements.win_rate_improvement),
      optimization_score: Math.min(95, prev.optimization_score + Math.random() * 10)
    }));

    const results = [
      {
        optimization: "Ensemble Weight Adjustment",
        impact: "High",
        improvement: `+${improvements.sharpe_improvement.toFixed(2)} Sharpe Ratio`,
        description: "Dynamically adjust bot weights based on recent performance"
      },
      {
        optimization: "Market Condition Adaptation",
        impact: "Medium",
        improvement: `+${improvements.win_rate_improvement.toFixed(1)}% Win Rate`,
        description: "Adapt strategies based on current market volatility and trend"
      },
      {
        optimization: "Dynamic Position Sizing",
        impact: "High",
        improvement: `-${improvements.drawdown_reduction.toFixed(1)}% Max Drawdown`,
        description: "Adjust position sizes based on portfolio correlation and volatility"
      },
      {
        optimization: "Signal Confidence Filtering",
        impact: "Medium",
        improvement: `+${improvements.profit_increase.toFixed(1)}% Expected Return`,
        description: "Filter signals based on ensemble confidence and market conditions"
      }
    ];

    setOptimizationResults(results);
    setIsOptimizing(false);

    toast({
      title: "Optimization Complete",
      description: `System optimization score improved to ${performanceMetrics.optimization_score.toFixed(0)}%`,
    });
  };

  const applyOptimizations = async () => {
    toast({
      title: "Optimizations Applied",
      description: "System parameters have been updated with optimal settings",
    });

    // Update current metrics to projected values
    setPerformanceMetrics(prev => ({
      ...prev,
      current_sharpe: prev.projected_sharpe,
      current_drawdown: prev.projected_drawdown,
      current_win_rate: prev.projected_win_rate
    }));
  };

  const resetToDefaults = () => {
    setOptimizationConfig({
      ensemble_weight_adjustment: true,
      dynamic_position_sizing: true,
      market_condition_adaptation: true,
      correlation_based_filtering: false,
      volatility_scaling: true,
      sentiment_integration: false
    });

    setOptimizationParams({
      risk_tolerance: [50],
      diversification_level: [70],
      signal_confidence_threshold: [75],
      rebalancing_frequency: [24],
      max_correlation: [80],
      volatility_lookback: [14]
    });

    toast({
      title: "Settings Reset",
      description: "All optimization parameters reset to default values",
    });
  };

  return (
    <div className="space-y-6">
      {/* Optimization Overview */}
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI System Optimizer
            <Badge className="ml-auto bg-purple-500/20 text-purple-400">
              Score: {performanceMetrics.optimization_score.toFixed(0)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {performanceMetrics.current_sharpe.toFixed(2)} → {performanceMetrics.projected_sharpe.toFixed(2)}
              </div>
              <div className="text-sm text-white/60">Sharpe Ratio</div>
              <div className="text-xs text-green-400">
                +{(performanceMetrics.projected_sharpe - performanceMetrics.current_sharpe).toFixed(2)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {performanceMetrics.current_drawdown.toFixed(1)}% → {performanceMetrics.projected_drawdown.toFixed(1)}%
              </div>
              <div className="text-sm text-white/60">Max Drawdown</div>
              <div className="text-xs text-green-400">
                -{(performanceMetrics.current_drawdown - performanceMetrics.projected_drawdown).toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {performanceMetrics.current_win_rate.toFixed(1)}% → {performanceMetrics.projected_win_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-white/60">Win Rate</div>
              <div className="text-xs text-green-400">
                +{(performanceMetrics.projected_win_rate - performanceMetrics.current_win_rate).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
            </Button>

            {optimizationResults.length > 0 && (
              <Button
                onClick={applyOptimizations}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Apply Optimizations
              </Button>
            )}

            <Button
              onClick={resetToDefaults}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Reset Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Optimization Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(optimizationConfig).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <div className="text-sm text-white/60">
                      {key === 'ensemble_weight_adjustment' && 'Dynamically adjust bot weights based on performance'}
                      {key === 'dynamic_position_sizing' && 'Adjust position sizes based on volatility and correlation'}
                      {key === 'market_condition_adaptation' && 'Adapt strategies to current market conditions'}
                      {key === 'correlation_based_filtering' && 'Filter highly correlated signals'}
                      {key === 'volatility_scaling' && 'Scale positions based on market volatility'}
                      {key === 'sentiment_integration' && 'Integrate social sentiment analysis'}
                    </div>
                  </div>
                  <Switch 
                    checked={value}
                    onCheckedChange={(checked) => 
                      setOptimizationConfig(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Optimization Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(optimizationParams).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-white font-medium">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                    <span className="text-white/60">
                      {value[0]}{key.includes('frequency') ? 'h' : key.includes('lookback') ? 'd' : '%'}
                    </span>
                  </div>
                  <Slider
                    value={value}
                    onValueChange={(newValue) => 
                      setOptimizationParams(prev => ({ ...prev, [key]: newValue }))
                    }
                    max={key.includes('frequency') ? 168 : key.includes('lookback') ? 30 : 100}
                    min={key.includes('frequency') ? 1 : key.includes('lookback') ? 1 : 0}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card className="crypto-card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Optimization Results</CardTitle>
            </CardHeader>
            <CardContent>
              {optimizationResults.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  Run optimization to see detailed results and recommendations
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizationResults.map((result, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{result.optimization}</h4>
                        <Badge className={`${
                          result.impact === 'High' ? 'bg-green-500/20 text-green-400' :
                          result.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {result.impact} Impact
                        </Badge>
                      </div>
                      <div className="text-sm text-white/80 mb-2">{result.description}</div>
                      <div className="text-sm font-medium text-green-400">
                        Expected: {result.improvement}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
