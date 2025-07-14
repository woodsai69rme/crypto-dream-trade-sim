
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  bundleSize: number;
  renderTime: number;
  componentCount: number;
  apiCallsPerMinute: number;
}

interface PerformanceHistory {
  timestamp: string;
  responseTime: number;
  memoryUsage: number;
  renderTime: number;
}

export const PerformanceAnalyzer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    bundleSize: 0,
    renderTime: 0,
    componentCount: 0,
    apiCallsPerMinute: 0
  });
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    const startTime = performance.now();
    
    // Simulate performance analysis
    const mockMetrics: PerformanceMetrics = {
      responseTime: Math.random() * 500 + 100,
      memoryUsage: Math.random() * 40 + 30,
      cpuUsage: Math.random() * 30 + 10,
      bundleSize: 2.4, // MB
      renderTime: Math.random() * 20 + 5,
      componentCount: 156,
      apiCallsPerMinute: Math.random() * 50 + 20
    };

    // Add to history
    const newHistoryPoint: PerformanceHistory = {
      timestamp: new Date().toLocaleTimeString(),
      responseTime: mockMetrics.responseTime,
      memoryUsage: mockMetrics.memoryUsage,
      renderTime: mockMetrics.renderTime
    };

    setMetrics(mockMetrics);
    setHistory(prev => [...prev.slice(-19), newHistoryPoint]);
    
    setTimeout(() => setIsAnalyzing(false), 1000);
  };

  useEffect(() => {
    analyzePerformance();
    const interval = setInterval(analyzePerformance, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = () => {
    const responseScore = Math.max(0, 100 - (metrics.responseTime / 10));
    const memoryScore = Math.max(0, 100 - metrics.memoryUsage);
    const renderScore = Math.max(0, 100 - (metrics.renderTime * 2));
    return Math.round((responseScore + memoryScore + renderScore) / 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const performanceScore = getPerformanceScore();

  return (
    <Card className="crypto-card-gradient text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Analyzer
          <Badge className={`${getScoreColor(performanceScore)} bg-white/10`}>
            Score: {performanceScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Performance</span>
            <span className={`font-bold ${getScoreColor(performanceScore)}`}>{performanceScore}%</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60">Response Time</span>
            </div>
            <div className="text-lg font-bold">{metrics.responseTime.toFixed(0)}ms</div>
            <div className="text-xs text-white/50">
              {metrics.responseTime < 200 ? 'Excellent' : metrics.responseTime < 500 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/60">Memory Usage</span>
            </div>
            <div className="text-lg font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
            <div className="text-xs text-white/50">
              {metrics.memoryUsage < 50 ? 'Optimal' : metrics.memoryUsage < 80 ? 'Good' : 'High'}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/60">Render Time</span>
            </div>
            <div className="text-lg font-bold">{metrics.renderTime.toFixed(1)}ms</div>
            <div className="text-xs text-white/50">
              {metrics.renderTime < 16 ? 'Smooth' : metrics.renderTime < 33 ? 'Good' : 'Choppy'}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white/60">Bundle Size</span>
            </div>
            <div className="text-lg font-bold">{metrics.bundleSize}MB</div>
            <div className="text-xs text-white/50">
              {metrics.bundleSize < 3 ? 'Optimized' : 'Consider optimization'}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white/60">Components</span>
            </div>
            <div className="text-lg font-bold">{metrics.componentCount}</div>
            <div className="text-xs text-white/50">Active components</div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-white/60">API Calls/min</span>
            </div>
            <div className="text-lg font-bold">{metrics.apiCallsPerMinute.toFixed(0)}</div>
            <div className="text-xs text-white/50">
              {metrics.apiCallsPerMinute < 30 ? 'Efficient' : 'Consider caching'}
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        {history.length > 0 && (
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm font-medium mb-4">Performance Trends</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="memoryUsage" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Memory Usage (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="renderTime" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Render Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Optimization Recommendations */}
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
          <div className="text-sm font-medium text-blue-400 mb-3">Optimization Recommendations</div>
          <div className="space-y-2 text-xs text-white/80">
            {metrics.responseTime > 500 && (
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>Consider implementing request caching for frequently accessed data</div>
              </div>
            )}
            {metrics.memoryUsage > 70 && (
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>High memory usage detected - review component lifecycle and cleanup</div>
              </div>
            )}
            {metrics.bundleSize > 3 && (
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>Bundle size is large - consider code splitting and lazy loading</div>
              </div>
            )}
            {metrics.apiCallsPerMinute > 40 && (
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>High API call frequency - implement intelligent data fetching</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
