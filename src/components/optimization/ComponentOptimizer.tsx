
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Zap, RefreshCw, AlertTriangle, CheckCircle, Code, Layers } from 'lucide-react';

interface ComponentAnalysis {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  optimizationSuggestions: string[];
  status: 'optimal' | 'needs-attention' | 'critical';
}

export const ComponentOptimizer = () => {
  const [components, setComponents] = useState<ComponentAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationEnabled, setOptimizationEnabled] = useState(false);

  // Mock component analysis data
  const mockComponentData: ComponentAnalysis[] = useMemo(() => [
    {
      name: 'TopInfoBar',
      renderCount: 47,
      averageRenderTime: 12.5,
      memoryUsage: 3.2,
      optimizationSuggestions: [
        'Implement React.memo to prevent unnecessary re-renders',
        'Use useMemo for expensive news filtering operations',
        'Consider virtualization for large news lists'
      ],
      status: 'needs-attention'
    },
    {
      name: 'BottomAccountSummary',
      renderCount: 23,
      averageRenderTime: 8.1,
      memoryUsage: 2.8,
      optimizationSuggestions: [
        'Cache account calculations using useMemo',
        'Implement lazy loading for account details',
        'Optimize chart rendering with React.memo'
      ],
      status: 'needs-attention'
    },
    {
      name: 'AccountDashboard',
      renderCount: 15,
      averageRenderTime: 4.2,
      memoryUsage: 1.9,
      optimizationSuggestions: [],
      status: 'optimal'
    },
    {
      name: 'SystemStatusDashboard',
      renderCount: 8,
      averageRenderTime: 2.1,
      memoryUsage: 1.1,
      optimizationSuggestions: [],
      status: 'optimal'
    },
    {
      name: 'DatabaseHealthMonitor',
      renderCount: 31,
      averageRenderTime: 18.7,
      memoryUsage: 5.1,
      optimizationSuggestions: [
        'Debounce database health checks',
        'Implement connection pooling',
        'Cache health status for 30 seconds'
      ],
      status: 'critical'
    }
  ], []);

  const analyzeComponents = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setComponents(mockComponentData);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    analyzeComponents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'needs-attention': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      case 'needs-attention': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const overallScore = Math.round(
    components.reduce((acc, comp) => {
      const score = comp.status === 'optimal' ? 100 : comp.status === 'needs-attention' ? 70 : 40;
      return acc + score;
    }, 0) / Math.max(components.length, 1)
  );

  const criticalComponents = components.filter(c => c.status === 'critical').length;
  const needsAttention = components.filter(c => c.status === 'needs-attention').length;

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Component Optimizer
            <Badge className={overallScore >= 80 ? 'bg-green-500/20 text-green-400' : overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
              Score: {overallScore}/100
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOptimizationEnabled(!optimizationEnabled)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Auto-optimize: {optimizationEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeComponents}
              disabled={isAnalyzing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Analyze
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{components.filter(c => c.status === 'optimal').length}</div>
            <div className="text-sm text-white/60">Optimal</div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{needsAttention}</div>
            <div className="text-sm text-white/60">Needs Attention</div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{criticalComponents}</div>
            <div className="text-sm text-white/60">Critical</div>
          </div>
        </div>

        {/* Overall Performance Score */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Performance Score</span>
            <span className="font-bold">{overallScore}/100</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>

        {/* Critical Alerts */}
        {criticalComponents > 0 && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-400">
              <div className="font-medium">Critical Performance Issues Detected</div>
              <div className="text-sm mt-1">
                {criticalComponents} component{criticalComponents > 1 ? 's require' : ' requires'} immediate optimization
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Component Analysis List */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-white/80">Component Analysis</div>
          {isAnalyzing ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <div className="text-white/60">Analyzing component performance...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{component.name}</span>
                    </div>
                    <Badge className={getStatusColor(component.status)}>
                      {getStatusIcon(component.status)}
                      <span className="ml-1 capitalize">{component.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold">{component.renderCount}</div>
                      <div className="text-xs text-white/60">Renders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{component.averageRenderTime}ms</div>
                      <div className="text-xs text-white/60">Avg Render Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{component.memoryUsage}MB</div>
                      <div className="text-xs text-white/60">Memory Usage</div>
                    </div>
                  </div>

                  {component.optimizationSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-white/80">Optimization Suggestions:</div>
                      <div className="space-y-1">
                        {component.optimizationSuggestions.map((suggestion, suggestionIndex) => (
                          <div key={suggestionIndex} className="flex items-start gap-2 text-xs text-white/70">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>{suggestion}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-optimization Status */}
        {optimizationEnabled && (
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Auto-optimization Enabled</span>
            </div>
            <div className="text-xs text-white/70">
              Components will be automatically optimized based on performance metrics. 
              Critical issues will be addressed first, followed by components needing attention.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
