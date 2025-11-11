import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  DollarSign,
  Activity,
  Brain,
  Zap,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield
} from 'lucide-react';

interface MetricPrediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  forecast: Array<{ date: string; value: number; confidence_low: number; confidence_high: number }>;
}

interface ChurnPrediction {
  userId: string;
  username: string;
  email: string;
  churnProbability: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  recommendedActions: string[];
}

interface RevenueScenario {
  name: string;
  probability: number;
  mrr: number;
  arr: number;
  growth: number;
}

interface Anomaly {
  id: string;
  metric: string;
  severity: 'critical' | 'warning' | 'info';
  detected_at: string;
  deviation: number;
  root_cause: string;
  impact: string;
  recommendation: string;
}

interface AIInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actions: string[];
}

export default function AIDashboard() {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [timeRange, setTimeRange] = useState('30d');

  const { data: predictions, isLoading: loadingPredictions } = useQuery<MetricPrediction[]>({
    queryKey: ['/api/analytics/ai/predict-metric', selectedMetric, timeRange],
    queryFn: async () => {
      const mockPredictions: MetricPrediction[] = [
        {
          metric: 'Active Users',
          current: 1250,
          predicted: 1580,
          confidence: 87,
          trend: 'up',
          forecast: [
            { date: '2025-11-15', value: 1290, confidence_low: 1250, confidence_high: 1330 },
            { date: '2025-11-22', value: 1380, confidence_low: 1320, confidence_high: 1440 },
            { date: '2025-11-29', value: 1480, confidence_low: 1400, confidence_high: 1560 },
            { date: '2025-12-06', value: 1580, confidence_low: 1480, confidence_high: 1680 },
          ],
        },
      ];
      return mockPredictions;
    },
  });

  const { data: churnPredictions, isLoading: loadingChurn } = useQuery<ChurnPrediction[]>({
    queryKey: ['/api/analytics/ai/predict-churn'],
    queryFn: async () => {
      const mockChurn: ChurnPrediction[] = [
        {
          userId: '1',
          username: 'DJ_Producer',
          email: 'dj@example.com',
          churnProbability: 78,
          riskLevel: 'high',
          riskFactors: [
            'No login in 14 days',
            'Decreased engagement (-45%)',
            'No project activity',
          ],
          recommendedActions: [
            'Send re-engagement email',
            'Offer premium feature trial',
            'Schedule check-in call',
          ],
        },
        {
          userId: '2',
          username: 'BeatMaker_Pro',
          email: 'beats@example.com',
          churnProbability: 52,
          riskLevel: 'medium',
          riskFactors: ['Reduced studio sessions', 'Low feature adoption'],
          recommendedActions: ['Send tutorial content', 'Highlight new features'],
        },
      ];
      return mockChurn;
    },
  });

  const { data: revenueForecasts, isLoading: loadingRevenue } = useQuery<RevenueScenario[]>({
    queryKey: ['/api/analytics/ai/forecast-revenue'],
    queryFn: async () => {
      const mockRevenue: RevenueScenario[] = [
        {
          name: 'Conservative',
          probability: 70,
          mrr: 12500,
          arr: 150000,
          growth: 15,
        },
        {
          name: 'Expected',
          probability: 60,
          mrr: 18750,
          arr: 225000,
          growth: 35,
        },
        {
          name: 'Optimistic',
          probability: 30,
          mrr: 25000,
          arr: 300000,
          growth: 55,
        },
      ];
      return mockRevenue;
    },
  });

  const { data: anomalies, isLoading: loadingAnomalies } = useQuery<Anomaly[]>({
    queryKey: ['/api/analytics/ai/detect-anomalies'],
    queryFn: async () => {
      const mockAnomalies: Anomaly[] = [
        {
          id: '1',
          metric: 'API Response Time',
          severity: 'warning',
          detected_at: '2 hours ago',
          deviation: 45,
          root_cause: 'Database query optimization needed',
          impact: 'User experience degradation',
          recommendation: 'Add caching layer for frequent queries',
        },
        {
          id: '2',
          metric: 'User Signups',
          severity: 'info',
          detected_at: '1 day ago',
          deviation: 32,
          root_cause: 'Social media campaign launch',
          impact: 'Positive growth spike',
          recommendation: 'Maintain current marketing efforts',
        },
      ];
      return mockAnomalies;
    },
  });

  const { data: insights, isLoading: loadingInsights } = useQuery<AIInsight[]>({
    queryKey: ['/api/analytics/ai/insights'],
    queryFn: async () => {
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          category: 'Growth',
          title: 'Studio feature driving 40% of conversions',
          description:
            'Users who interact with the AI Studio within first 7 days have 3.2x higher conversion rate to paid plans.',
          impact: 'high',
          confidence: 92,
          actions: [
            'Promote studio in onboarding',
            'Create studio tutorial series',
            'Add studio to trial emails',
          ],
        },
        {
          id: '2',
          category: 'Retention',
          title: 'Distribution feature reduces churn by 28%',
          description:
            'Users who publish at least one release have significantly lower churn rates.',
          impact: 'high',
          confidence: 88,
          actions: [
            'Gamify first distribution',
            'Send distribution guides',
            'Offer distribution incentives',
          ],
        },
        {
          id: '3',
          category: 'Revenue',
          title: 'Yearly plans show 2.5x LTV',
          description:
            'Users on yearly subscriptions have higher lifetime value and lower support costs.',
          impact: 'medium',
          confidence: 85,
          actions: ['Offer yearly plan discount', 'Highlight savings in pricing'],
        },
      ];
      return mockInsights;
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'medium':
        return <Activity className="w-4 h-4 text-blue-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access AI Analytics</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              AI Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Powered by AI Insights Engine - Predictive analytics and intelligent recommendations
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>

        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="predictions">
              <TrendingUp className="w-4 h-4 mr-1" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="churn">
              <Users className="w-4 h-4 mr-1" />
              Churn Risk
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="w-4 h-4 mr-1" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="anomalies">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Sparkles className="w-4 h-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Predictive Analytics</CardTitle>
                    <CardDescription>Forecasted metrics with confidence intervals</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Active Users</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPredictions ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Analyzing data...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {predictions?.map((prediction) => (
                      <div key={prediction.metric} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground">Current</p>
                              <p className="text-2xl font-bold">{prediction.current.toLocaleString()}</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-primary/10 border-primary">
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground">Predicted</p>
                              <p className="text-2xl font-bold flex items-center gap-2">
                                {prediction.predicted.toLocaleString()}
                                {prediction.trend === 'up' ? (
                                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                                )}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground">Confidence</p>
                              <div className="space-y-2">
                                <p className="text-2xl font-bold">{prediction.confidence}%</p>
                                <Progress value={prediction.confidence} className="h-2" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="text-sm font-medium mb-3">Forecast Timeline</h4>
                          <div className="space-y-2">
                            {prediction.forecast.map((point, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{point.date}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-muted-foreground">
                                    {point.confidence_low} - {point.confidence_high}
                                  </span>
                                  <span className="font-semibold">{point.value.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="churn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Churn Prediction</CardTitle>
                <CardDescription>Users at risk of churning with recommended actions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingChurn ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Analyzing user behavior...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {churnPredictions?.map((user) => (
                      <Card key={user.userId} className="border-l-4 border-l-primary">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{user.username}</h4>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={getRiskColor(user.riskLevel)}>
                                {user.riskLevel} risk
                              </Badge>
                              <p className="text-sm mt-1 font-semibold text-primary">
                                {user.churnProbability}% churn probability
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Risk Factors:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {user.riskFactors.map((factor, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Recommended Actions:
                              </p>
                              <div className="space-y-1">
                                {user.recommendedActions.map((action, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span>{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Button size="sm" className="w-full">
                            Take Action
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecasting</CardTitle>
                <CardDescription>MRR/ARR projections with 3-scenario analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRevenue ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Calculating scenarios...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {revenueForecasts?.map((scenario) => (
                      <Card
                        key={scenario.name}
                        className={
                          scenario.name === 'Expected'
                            ? 'border-primary bg-primary/5'
                            : ''
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {scenario.name} Scenario
                                {scenario.name === 'Expected' && (
                                  <Badge variant="default">Most Likely</Badge>
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {scenario.probability}% probability
                              </p>
                            </div>
                            <Badge
                              variant={scenario.growth > 40 ? 'default' : 'secondary'}
                            >
                              +{scenario.growth}% growth
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
                              <p className="text-2xl font-bold">
                                ${scenario.mrr.toLocaleString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
                              <p className="text-2xl font-bold">
                                ${scenario.arr.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <Progress
                            value={scenario.probability}
                            className="h-2 mt-3"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>Detected anomalies with root cause analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnomalies ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Scanning for anomalies...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anomalies?.map((anomaly) => (
                      <Alert
                        key={anomaly.id}
                        className={getSeverityColor(anomaly.severity)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <h4 className="font-semibold">{anomaly.metric}</h4>
                                <Badge variant="outline">{anomaly.deviation}% deviation</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Detected {anomaly.detected_at}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs font-medium mb-1">Root Cause:</p>
                              <p>{anomaly.root_cause}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Impact:</p>
                              <p>{anomaly.impact}</p>
                            </div>
                          </div>

                          <Alert variant="default" className="bg-white">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              <span className="font-medium">Recommendation: </span>
                              {anomaly.recommendation}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Natural language insights with actionable recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInsights ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Generating insights...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights?.map((insight) => (
                      <Card key={insight.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              {getImpactIcon(insight.impact)}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {insight.category}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {insight.impact} impact
                                  </Badge>
                                </div>
                                <h4 className="font-semibold">{insight.title}</h4>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">
                                {insight.confidence}% confidence
                              </p>
                              <Progress value={insight.confidence} className="h-1 w-20 mt-1" />
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">{insight.description}</p>

                          <div>
                            <p className="text-xs font-medium mb-2">Recommended Actions:</p>
                            <div className="space-y-1">
                              {insight.actions.map((action, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-primary">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
