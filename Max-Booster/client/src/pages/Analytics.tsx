import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  BarChart3,
  TrendingUp,
  Play,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  Clock,
  Globe,
  Music,
  Target,
  Zap,
  Activity,
  PieChart,
  LineChart,
  MapPin,
  Smartphone,
  Monitor,
  Headphones,
  Radio,
  Mic,
  Volume2,
  Star,
  Award,
  Trophy,
  Crown,
  Flame,
  Sparkles,
  SkipForward,
  RotateCcw,
  Brain,
  Rocket,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Plus,
  Settings,
  Bell,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Megaphone,
  Tv,
  Laptop,
  Tablet,
  Gamepad2,
  Car,
  Plane,
  Train,
  Bus,
  Home,
  Building,
  School,
  Coffee,
  Utensils,
  ShoppingBag,
  Briefcase,
  Dumbbell,
  Gamepad,
  Book,
  Camera,
  Video,
  Image,
  FileText,
  Link,
  Mail,
  Phone,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalStreams: number;
    totalRevenue: number;
    totalListeners: number;
    totalPlays: number;
    avgListenTime: number;
    completionRate: number;
    skipRate: number;
    shareRate: number;
    likeRate: number;
    growthRate: number;
  };
  streams: {
    daily: Array<{ date: string; streams: number; revenue: number }>;
    weekly: Array<{ week: string; streams: number; revenue: number }>;
    monthly: Array<{ month: string; streams: number; revenue: number }>;
    yearly: Array<{ year: string; streams: number; revenue: number }>;
    byPlatform: Array<{ platform: string; streams: number; revenue: number; growth: number }>;
    byTrack: Array<{ track: string; streams: number; revenue: number; growth: number }>;
    byGenre: Array<{ genre: string; streams: number; revenue: number; growth: number }>;
    byCountry: Array<{ country: string; streams: number; revenue: number; growth: number }>;
    byCity: Array<{ city: string; country: string; streams: number; revenue: number }>;
    byDevice: Array<{ device: string; streams: number; percentage: number }>;
    byOS: Array<{ os: string; streams: number; percentage: number }>;
    byBrowser: Array<{ browser: string; streams: number; percentage: number }>;
    bySource: Array<{ source: string; streams: number; percentage: number }>;
    byTimeOfDay: Array<{ hour: number; streams: number; percentage: number }>;
    byDayOfWeek: Array<{ day: string; streams: number; percentage: number }>;
    bySeason: Array<{ season: string; streams: number; percentage: number }>;
    byWeather: Array<{ weather: string; streams: number; percentage: number }>;
    byMood: Array<{ mood: string; streams: number; percentage: number }>;
    byActivity: Array<{ activity: string; streams: number; percentage: number }>;
    byLocation: Array<{ location: string; streams: number; percentage: number }>;
    byDemographics: {
      age: Array<{ ageGroup: string; streams: number; percentage: number }>;
      gender: Array<{ gender: string; streams: number; percentage: number }>;
      income: Array<{ incomeGroup: string; streams: number; percentage: number }>;
      education: Array<{ education: string; streams: number; percentage: number }>;
      occupation: Array<{ occupation: string; streams: number; percentage: number }>;
      interests: Array<{ interest: string; streams: number; percentage: number }>;
    };
  };
  audience: {
    totalListeners: number;
    newListeners: number;
    returningListeners: number;
    listenerRetention: number;
    avgSessionDuration: number;
    sessionsPerListener: number;
    listenerGrowth: number;
    topListeners: Array<{ name: string; streams: number; revenue: number }>;
    listenerSegments: Array<{ segment: string; count: number; percentage: number }>;
    listenerJourney: Array<{ stage: string; count: number; conversion: number }>;
    listenerLifetime: Array<{ period: string; value: number; count: number }>;
    listenerChurn: Array<{ period: string; churnRate: number; retentionRate: number }>;
    listenerEngagement: Array<{ level: string; count: number; percentage: number }>;
    listenerFeedback: Array<{ type: string; count: number; sentiment: string }>;
    listenerSocial: Array<{ platform: string; followers: number; engagement: number }>;
    listenerInfluence: Array<{ level: string; count: number; reach: number }>;
    listenerValue: Array<{ tier: string; count: number; revenue: number }>;
    listenerPredictions: {
      nextMonthListeners: number;
      nextMonthRevenue: number;
      churnRisk: number;
      growthPotential: number;
    };
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenueGrowth: number;
    revenuePerStream: number;
    revenuePerListener: number;
    revenueByPlatform: Array<{ platform: string; revenue: number; percentage: number }>;
    revenueByTrack: Array<{ track: string; revenue: number; percentage: number }>;
    revenueByCountry: Array<{ country: string; revenue: number; percentage: number }>;
    revenueBySource: Array<{ source: string; revenue: number; percentage: number }>;
    revenueByTime: Array<{ period: string; revenue: number; percentage: number }>;
    revenueByDemographics: Array<{ demographic: string; revenue: number; percentage: number }>;
    revenuePredictions: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
      growthRate: number;
    };
    revenueOptimization: Array<{ strategy: string; potential: number; impact: string }>;
    revenueStreams: Array<{ stream: string; revenue: number; growth: number }>;
    revenueForecasting: Array<{
      period: string;
      predicted: number;
      actual: number;
      accuracy: number;
    }>;
  };
  aiInsights: {
    performanceScore: number;
    recommendations: Array<{
      title: string;
      description: string;
      priority: string;
      impact: string;
    }>;
    predictions: {
      nextMonthStreams: number;
      nextMonthRevenue: number;
      viralPotential: number;
      growthTrend: string;
      marketOpportunity: number;
      competitivePosition: number;
      contentGaps: Array<{ gap: string; opportunity: number }>;
      audienceExpansion: Array<{ segment: string; potential: number }>;
      platformOptimization: Array<{ platform: string; improvement: number }>;
      contentStrategy: Array<{ strategy: string; effectiveness: number }>;
      marketingOpportunities: Array<{ opportunity: string; potential: number }>;
      partnershipPotential: Array<{ partner: string; value: number }>;
      trendAnalysis: Array<{ trend: string; relevance: number; timeframe: string }>;
      riskAssessment: Array<{ risk: string; probability: number; impact: string }>;
      opportunityMatrix: Array<{ opportunity: string; effort: number; impact: number }>;
      successFactors: Array<{ factor: string; importance: number; current: number }>;
      improvementAreas: Array<{ area: string; current: number; potential: number }>;
      benchmarkComparison: Array<{
        metric: string;
        current: number;
        benchmark: number;
        gap: number;
      }>;
      marketPosition: Array<{ dimension: string; score: number; trend: string }>;
      competitiveAdvantage: Array<{ advantage: string; strength: number; sustainability: number }>;
      growthDrivers: Array<{ driver: string; impact: number; timeframe: string }>;
      performanceIndicators: Array<{
        indicator: string;
        value: number;
        trend: string;
        target: number;
      }>;
      optimizationOpportunities: Array<{
        area: string;
        current: number;
        optimized: number;
        improvement: number;
      }>;
      strategicRecommendations: Array<{
        recommendation: string;
        priority: string;
        timeframe: string;
        resources: string;
      }>;
      marketIntelligence: Array<{
        insight: string;
        source: string;
        confidence: number;
        relevance: number;
      }>;
      futureScenarios: Array<{
        scenario: string;
        probability: number;
        impact: string;
        preparation: string;
      }>;
    };
    realTimeOptimization: {
      active: boolean;
      optimizations: Array<{ type: string; status: string; impact: number }>;
      performance: Array<{
        metric: string;
        current: number;
        optimized: number;
        improvement: number;
      }>;
      recommendations: Array<{ recommendation: string; priority: string; implementation: string }>;
    };
  };
}

export default function Analytics() {
  const { user, isLoading: authLoading } = useRequireSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [timeRange, setTimeRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [connectionLostTime, setConnectionLostTime] = useState<number | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch comprehensive analytics data (fallback polling)
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch,
  } = useQuery({
    queryKey: ['/api/analytics/dashboard', timeRange],
    enabled: !!user,
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 1 * 60 * 1000, // 1 minute - real-time data
  });

  // WebSocket connection for real-time analytics
  const { isConnected, sendMessage, connectionStatus } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'analytics_update') {
        setRealtimeData(message.data);
        setLastUpdate(message.timestamp);
        setConnectionLostTime(null); // Reset connection lost timer
      }
    },
    onConnect: () => {
      logger.info('📊 Analytics WebSocket connected');
      // Subscribe to analytics stream
      sendMessage({ type: 'subscribe_analytics' });
      setConnectionLostTime(null);
    },
    onDisconnect: () => {
      logger.info('📊 Analytics WebSocket disconnected');
      setConnectionLostTime(Date.now());

      // Start polling fallback
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(() => {
          refetch();
        }, 5000); // Poll every 5 seconds when WebSocket is down
      }
    },
    onError: (error) => {
      logger.error('Analytics WebSocket error:', error);
    },
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

  // Show error toast if connection lost for >30 seconds
  useEffect(() => {
    if (connectionLostTime) {
      const checkInterval = setInterval(() => {
        const timeLost = Date.now() - connectionLostTime;
        if (timeLost > 30000 && !isConnected) {
          toast({
            variant: 'destructive',
            title: 'Connection Lost',
            description: 'Real-time analytics updates are unavailable. Falling back to polling.',
          });
          clearInterval(checkInterval);
        }
      }, 5000);

      return () => clearInterval(checkInterval);
    }
  }, [connectionLostTime, isConnected, toast]);

  // Cleanup polling fallback when WebSocket reconnects
  useEffect(() => {
    if (isConnected && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [isConnected]);

  // Anomaly filters state
  const [anomalyMetricFilter, setAnomalyMetricFilter] = useState<string>('all');
  const [anomalySeverityFilter, setAnomalySeverityFilter] = useState<string>('all');

  // Fetch anomaly summary
  const { data: anomalySummary } = useQuery({
    queryKey: ['/api/analytics/anomalies/summary'],
    enabled: !!user,
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch anomalies with filters
  const {
    data: anomalyData,
    isLoading: anomaliesLoading,
    refetch: refetchAnomalies,
  } = useQuery({
    queryKey: ['/api/analytics/anomalies', anomalyMetricFilter, anomalySeverityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (anomalyMetricFilter !== 'all') params.append('metricType', anomalyMetricFilter);
      if (anomalySeverityFilter !== 'all') params.append('severity', anomalySeverityFilter);
      const response = await fetch(`/api/analytics/anomalies?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch anomalies');
      const result = await response.json();
      return { anomalies: result.data || [], summary: anomalySummary };
    },
    enabled: !!user && selectedTab === 'anomalies',
  });

  // Acknowledge anomaly mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (anomalyId: string) => {
      return await apiRequest(`/api/analytics/anomalies/${anomalyId}/acknowledge`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/anomalies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/anomalies/summary'] });
      toast({
        title: 'Anomaly Acknowledged',
        description: 'The anomaly has been marked as acknowledged.',
      });
    },
    onError: (error: unknown) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to acknowledge anomaly',
      });
    },
  });

  // WebSocket handler for new anomalies
  useEffect(() => {
    const handleAnomalyDetected = (message: unknown) => {
      if (message.type === 'anomaly_detected') {
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/anomalies'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/anomalies/summary'] });
        toast({
          variant: message.severity === 'critical' ? 'destructive' : 'default',
          title: 'New Anomaly Detected',
          description: `${message.metricType} ${message.anomalyType}: ${message.deviationPercentage}% deviation`,
        });
      }
    };
    return () => {};
  }, [queryClient, toast]);

  // Unsubscribe from analytics on unmount
  useEffect(() => {
    return () => {
      sendMessage({ type: 'unsubscribe_analytics' });
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sendMessage]);

  // Export analytics mutation
  const exportAnalyticsMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await apiRequest('POST', '/api/analytics/export', {
        format,
        filters: { timeRange },
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Analytics Exported',
        description: `Your analytics data has been exported successfully.`,
      });
      // Trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.${data.format}`;
      link.click();
    },
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Use real-time data if available, otherwise fall back to REST API data
  const data = analyticsData as AnalyticsData;
  const currentData = realtimeData || data?.overview;

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const overviewStats = [
    {
      title: 'Total Streams',
      value: (currentData?.totalStreams || 0).toLocaleString(),
      change: `+${currentData?.monthlyGrowth?.streams || data?.overview?.growthRate || 0}%`,
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Total Revenue',
      value: `$${(currentData?.totalRevenue || 0).toLocaleString()}`,
      change: `+${currentData?.monthlyGrowth?.revenue || data?.overview?.growthRate || 0}%`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Total Listeners',
      value: (currentData?.totalListeners || 0).toLocaleString(),
      change: `+${currentData?.monthlyGrowth?.listeners || data?.overview?.growthRate || 0}%`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Avg Listen Time',
      value: `${data?.overview?.avgListenTime || 0}m`,
      change: `+${data?.overview?.growthRate || 0}%`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      title: 'Completion Rate',
      value: `${data?.overview?.completionRate || 0}%`,
      change: `+${data?.overview?.growthRate || 0}%`,
      icon: Target,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
    },
    {
      title: 'Share Rate',
      value: `${data?.overview?.shareRate || 0}%`,
      change: `+${data?.overview?.growthRate || 0}%`,
      icon: Share2,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                📊 Analytics Dashboard
              </h1>
              {/* Live/Offline Badge */}
              <Badge
                variant="outline"
                className={`${
                  isConnected
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200 dark:border-green-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700'
                } flex items-center gap-1.5`}
                data-testid={isConnected ? 'badge-live' : 'badge-offline'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                ></span>
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {isConnected
                ? `Real-time updates • Updated ${getTimeSinceUpdate()}`
                : 'Start creating to see your comprehensive insights'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto Refresh
              </Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                data-testid="switch-auto-refresh"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={analyticsLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => exportAnalyticsMutation.mutate('csv')}
              disabled={exportAnalyticsMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Performance Banner */}
        {data?.aiInsights && (
          <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-full">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Performance Score
                    </h3>
                    <p className="text-muted-foreground">
                      Your music performance is optimized with AI insights
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {data?.aiInsights?.performanceScore !== undefined ? (
                    <>
                      <div className="text-4xl font-bold text-purple-600">
                        {data.aiInsights.performanceScore}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your current performance
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-gray-400">--</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload music to get your AI score
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
                  data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={stat.value}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className={`text-2xl font-bold ${stat.color}`}
                            data-testid={`stat-value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {stat.value}
                          </motion.p>
                        </AnimatePresence>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          {stat.change}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-full ${stat.bgColor} ${stat.borderColor} border-2`}
                      >
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="streams" data-testid="tab-streams">
              Streams
            </TabsTrigger>
            <TabsTrigger value="audience" data-testid="tab-audience">
              Audience
            </TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="ai-insights" data-testid="tab-ai-insights">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="anomalies" data-testid="tab-anomalies" className="relative">
              Anomalies
              {anomalyData?.summary?.unacknowledged > 0 && (
                <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
                  {anomalyData?.summary?.unacknowledged}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Streams Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    Streams Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : data?.streams?.daily && data.streams.daily.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-7 gap-2">
                        {data.streams.daily.slice(-7).map((day: unknown, index: number) => (
                          <div key={index} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div
                              className="h-32 bg-blue-100 dark:bg-blue-950/20 rounded-t flex items-end justify-center p-2"
                              style={{
                                height: `${Math.max(32, (day.streams / Math.max(...data.streams.daily.map((d: unknown) => d.streams))) * 128)}px`,
                              }}
                            >
                              <div className="text-xs font-semibold text-blue-600">
                                {day.streams}
                              </div>
                            </div>
                            <div className="text-xs text-green-600 mt-1">${day.revenue}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                        <p>No stream data available yet</p>
                        <p className="text-sm">Start uploading music to see your analytics</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Platforms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-600" />
                    Top Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : data?.streams?.byPlatform && data.streams.byPlatform.length > 0 ? (
                    <div className="space-y-4">
                      {data.streams.byPlatform.slice(0, 5).map((platform, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-semibold">{platform.platform}</div>
                              <div className="text-sm text-muted-foreground">
                                {platform.streams.toLocaleString()} streams
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              ${platform.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {platform.growth > 0 ? '+' : ''}
                              {platform.growth}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No platform data available yet</p>
                      <p className="text-sm text-muted-foreground">
                        Distribute your music to see platform analytics
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            {data?.aiInsights ? (
              <>
                {/* AI Predictions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      AI Predictions
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Forecast your music career growth with AI
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.aiInsights.predictions?.nextMonthStreams?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-muted-foreground">Predicted Streams</div>
                        <div className="text-xs text-green-600 mt-1">Next Month</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${data.aiInsights.predictions?.nextMonthRevenue?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-muted-foreground">Predicted Revenue</div>
                        <div className="text-xs text-green-600 mt-1">Next Month</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {(data.aiInsights.predictions?.viralPotential * 100 || 0).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Viral Potential</div>
                        <div className="text-xs text-green-600 mt-1">Current Content</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recommendations */}
                {data.aiInsights.recommendations && data.aiInsights.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.aiInsights.recommendations
                          .slice(0, 5)
                          .map((rec: unknown, index: number) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{rec.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {rec.description}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    rec.priority === 'high'
                                      ? 'destructive'
                                      : rec.priority === 'medium'
                                        ? 'default'
                                        : 'secondary'
                                  }
                                >
                                  {rec.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI Insights Available</h3>
                  <p className="text-muted-foreground">
                    Upload music and get streams to receive AI-powered insights
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-6">
            {/* Filters and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Anomalies</p>
                      <p className="text-2xl font-bold">{anomalySummary?.total || 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unacknowledged</p>
                      <p className="text-2xl font-bold text-red-600">
                        {anomalySummary?.unacknowledged || 0}
                      </p>
                    </div>
                    <Bell className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">By Severity</p>
                    <div className="flex gap-2 flex-wrap">
                      {anomalySummary?.bySeverity &&
                        Object.entries(anomalySummary.bySeverity).map(([severity, count]) => (
                          <Badge
                            key={severity}
                            variant={
                              severity === 'critical'
                                ? 'destructive'
                                : severity === 'high'
                                  ? 'default'
                                  : 'secondary'
                            }
                            data-testid={`severity-badge-${severity}`}
                          >
                            {severity}: {count as number}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 flex-wrap items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="metric-filter">Metric Type:</Label>
                    <Select value={anomalyMetricFilter} onValueChange={setAnomalyMetricFilter}>
                      <SelectTrigger
                        id="metric-filter"
                        className="w-40"
                        data-testid="select-metric-filter"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="streams">Streams</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="listeners">Listeners</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="severity-filter">Severity:</Label>
                    <Select value={anomalySeverityFilter} onValueChange={setAnomalySeverityFilter}>
                      <SelectTrigger
                        id="severity-filter"
                        className="w-40"
                        data-testid="select-severity-filter"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchAnomalies()}
                    data-testid="button-refresh-anomalies"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Anomaly Cards */}
            {anomaliesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : anomalyData?.anomalies && anomalyData.anomalies.length > 0 ? (
              <div className="space-y-4">
                {anomalyData.anomalies.map((anomaly: unknown) => {
                  const severityColors = {
                    critical: 'border-red-500 bg-red-50 dark:bg-red-950/20',
                    high: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                    medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                    low: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
                  };

                  const severityBadgeColors = {
                    critical: 'destructive',
                    high: 'default',
                    medium: 'secondary',
                    low: 'outline',
                  };

                  const anomalyIcons = {
                    spike: ArrowUp,
                    drop: ArrowDown,
                    unusual_pattern: Activity,
                  };

                  const AnomalyIcon =
                    anomalyIcons[anomaly.anomalyType as keyof typeof anomalyIcons] || Activity;

                  return (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className={`border-2 ${severityColors[anomaly.severity as keyof typeof severityColors]}`}
                        data-testid={`anomaly-card-${anomaly.id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={
                                    severityBadgeColors[
                                      anomaly.severity as keyof typeof severityBadgeColors
                                    ] as any
                                  }
                                >
                                  {anomaly.severity}
                                </Badge>
                                <Badge variant="outline">{anomaly.metricType}</Badge>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <AnomalyIcon className="w-4 h-4" />
                                  <span className="text-sm capitalize">
                                    {anomaly.anomalyType.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Baseline</p>
                                  <p className="text-lg font-semibold">
                                    {parseFloat(anomaly.baselineValue).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Actual</p>
                                  <p className="text-lg font-semibold">
                                    {parseFloat(anomaly.actualValue).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Deviation</p>
                                  <p
                                    className={`text-lg font-semibold ${parseFloat(anomaly.deviationPercentage) > 0 ? 'text-green-600' : 'text-red-600'}`}
                                  >
                                    {parseFloat(anomaly.deviationPercentage) > 0 ? '+' : ''}
                                    {parseFloat(anomaly.deviationPercentage).toFixed(1)}%
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(anomaly.detectedAt).toLocaleString()}
                                </div>
                                {anomaly.acknowledgedAt && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    Acknowledged
                                  </div>
                                )}
                              </div>
                            </div>

                            {!anomaly.acknowledgedAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeMutation.mutate(anomaly.id)}
                                disabled={acknowledgeMutation.isPending}
                                data-testid={`button-acknowledge-${anomaly.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Anomalies Detected</h3>
                  <p className="text-muted-foreground">
                    All metrics are within normal ranges. We'll alert you if any unusual patterns
                    are detected.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
