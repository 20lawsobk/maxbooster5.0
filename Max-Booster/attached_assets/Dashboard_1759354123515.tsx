import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import SimplifiedDashboard from '@/components/onboarding/SimplifiedDashboard';
import FeatureDiscovery from '@/components/feature-discovery/FeatureDiscovery';
import FeatureSpotlight from '@/components/feature-discovery/FeatureSpotlight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Play,
  DollarSign,
  Music,
  Users,
  TrendingUp,
  Clock,
  Upload,
  Sparkles,
  Activity,
  BarChart3,
  Share2,
  Megaphone,
  Zap,
  Brain,
  Rocket,
  Crown,
  Target,
  Eye,
  MousePointerClick,
  Globe,
  Calendar,
  Award,
  Star,
  Heart,
  Headphones,
  Radio,
  Tv,
  Smartphone,
  Laptop,
  Monitor,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';
import { Link } from 'wouter';

interface DashboardStats {
  totalStreams: number;
  totalRevenue: number;
  totalProjects: number;
  totalFollowers: number;
  monthlyGrowth: {
    streams: number;
    revenue: number;
    projects: number;
    followers: number;
  };
  topPlatforms: Array<{
    name: string;
    streams: number;
    revenue: number;
    growth: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error' | 'info';
  }>;
  aiInsights: {
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
    }>;
    predictions: {
      nextMonthStreams: number;
      nextMonthRevenue: number;
      viralPotential: number;
      growthTrend: 'up' | 'down' | 'stable';
    };
    performanceScore: number;
  };
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useRequireSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Early return for loading state to prevent hooks order issues
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Early return if no user (useRequireSubscription should handle redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <DashboardContent user={user} />;
}

// Separate component to ensure hooks are only called when user is authenticated
function DashboardContent({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [showSimplified, setShowSimplified] = useState(false);
  const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(false);
  const [showFeatureSpotlight, setShowFeatureSpotlight] = useState(false);

  // Fetch comprehensive dashboard data - now only called when user is authenticated
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/dashboard/comprehensive'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
  });

  const { data: aiInsights, isLoading: aiInsightsLoading } = useQuery({
    queryKey: ['/api/ai/insights'],
  });

  // Quick action mutations
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/projects', {
        title: 'New Project',
        description: 'AI-generated project',
        genre: 'Electronic'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Project Created',
        description: 'New project created successfully with AI optimization.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  const optimizeContentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/optimize-content');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Content Optimized',
        description: 'AI has optimized your content for maximum reach.',
      });
    },
  });

  const stats = dashboardData?.stats || {
    totalStreams: 0,
    totalRevenue: 0,
    totalProjects: 0,
    totalFollowers: 0,
    monthlyGrowth: { streams: 0, revenue: 0, projects: 0, followers: 0 }
  };

  const statsCards = [
    {
      title: "Total Streams",
      value: stats.totalStreams.toLocaleString(),
      change: `+${stats.monthlyGrowth.streams}%`,
      icon: Play,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: `+${stats.monthlyGrowth.revenue}%`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Active Projects",
      value: stats.totalProjects.toString(),
      change: `+${stats.monthlyGrowth.projects}%`,
      icon: Music,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Total Followers",
      value: stats.totalFollowers.toLocaleString(),
      change: `+${stats.monthlyGrowth.followers}%`,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800"
    }
  ];

  const quickActions = [
    {
      title: "Create New Project",
      description: "Start a new music project with AI assistance",
      icon: Plus,
      action: () => createProjectMutation.mutate(),
      color: "bg-blue-600 hover:bg-blue-700",
      loading: createProjectMutation.isPending
    },
    {
      title: "AI Content Optimization",
      description: "Optimize your content for maximum reach",
      icon: Brain,
      action: () => optimizeContentMutation.mutate(),
      color: "bg-purple-600 hover:bg-purple-700",
      loading: optimizeContentMutation.isPending
    },
    {
      title: "Launch Campaign",
      description: "Start an AI-powered advertising campaign",
      icon: Rocket,
      action: () => window.location.href = '/advertising',
      color: "bg-green-600 hover:bg-green-700",
      loading: false
    },
    {
      title: "Distribute Music",
      description: "Release your music to all platforms",
      icon: Upload,
      action: () => window.location.href = '/distribution',
      color: "bg-cyan-600 hover:bg-cyan-700",
      loading: false
    }
  ];

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowSimplified(userLevel === 'beginner');
    // Update user onboarding status
    // This would typically be an API call
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setShowSimplified(false);
  };

  const handleUpgradeToFullMode = () => {
    setShowSimplified(false);
    setUserLevel('intermediate');
  };

  const handleExploreFeature = (featureId: string) => {
    setShowFeatureSpotlight(false);
    setShowFeatureDiscovery(false);
    // Navigate to specific feature
    // This would typically route to the specific feature page
    toast({
      title: "Feature Navigation",
      description: `Navigating to ${featureId} feature...`,
    });
  };

  // Show onboarding flow
  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show simplified dashboard for beginners
  if (showSimplified) {
    return (
      <SimplifiedDashboard 
        onUpgrade={handleUpgradeToFullMode}
        userLevel={userLevel}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  🎵 Max Booster Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.username}! Here's your music career overview
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFeatureSpotlight(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover Features
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowFeatureDiscovery(true)}
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  All Features
                </Button>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* AI Performance Banner */}
            {aiInsights && (
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
                          Your music career is optimized with AI assistance
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-green-600">
                        {aiInsights.performanceScore || 95}%
                      </div>
                      <div className="text-sm text-muted-foreground">Performance Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card 
                    key={index} 
                    className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {stat.title}
                          </p>
                          <p className={`text-2xl font-bold ${stat.color}`}>
                            {stat.value}
                          </p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            {stat.change} from last month
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor} ${stat.borderColor} border-2`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

            {/* Quick Actions */}
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered tools to accelerate your music career
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        onClick={action.action}
                        disabled={action.loading}
                        className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2`}
                      >
                        {action.loading ? (
                          <Brain className="w-6 h-6 animate-spin" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                        <div className="text-center">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-xs opacity-90">{action.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                  </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Platforms */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-blue-600" />
                        Top Performing Platforms
                      </CardTitle>
                </CardHeader>
                <CardContent>
                      {dashboardData?.topPlatforms ? (
                    <div className="space-y-4">
                          {dashboardData.topPlatforms.map((platform, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="font-semibold">{platform.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {platform.streams.toLocaleString()} streams
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">
                                  ${platform.revenue.toLocaleString()}
                                </div>
                                <div className={`text-sm flex items-center ${
                                  platform.growth > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {platform.growth > 0 ? (
                                    <ArrowUp className="w-3 h-3 mr-1" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3 mr-1" />
                                  )}
                                  {Math.abs(platform.growth)}%
                                </div>
                          </div>
                        </div>
                      ))}
                    </div>
                      ) : (
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Projects */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Music className="w-5 h-5 mr-2 text-purple-600" />
                        Recent Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : projects.length > 0 ? (
                        <div className="space-y-3">
                          {projects.slice(0, 5).map((project: any) => (
                            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                  <Music className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-semibold">{project.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {project.genre} • {project.streams?.toLocaleString() || 0} streams
                                  </div>
                    </div>
                          </div>
                              <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                                {project.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Create your first project to get started
                          </p>
                          <Button onClick={() => createProjectMutation.mutate()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                            </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-6">
                {aiInsightsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : aiInsights ? (
                  <>
                    {/* AI Recommendations */}
              <Card>
                <CardHeader>
                        <CardTitle className="flex items-center">
                          <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                          AI Recommendations
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Personalized suggestions to boost your music career
                        </p>
                </CardHeader>
                <CardContent>
                        <div className="space-y-4">
                          {aiInsights.recommendations?.map((rec, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${
                              rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                              rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                              'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{rec.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                                  <Badge variant="outline" className="mt-2">
                                    {rec.category}
                                  </Badge>
                                </div>
                                <Badge className={
                                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {rec.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                  </div>
                </CardContent>
              </Card>

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
                              {aiInsights.predictions?.nextMonthStreams?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-muted-foreground">Predicted Streams</div>
                            <div className="text-xs text-green-600 mt-1">Next Month</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              ${aiInsights.predictions?.nextMonthRevenue?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-muted-foreground">Predicted Revenue</div>
                            <div className="text-xs text-green-600 mt-1">Next Month</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {(aiInsights.predictions?.viralPotential * 100 || 0).toFixed(0)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Viral Potential</div>
                            <div className="text-xs text-green-600 mt-1">Current Content</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">AI Insights Loading</h3>
                      <p className="text-muted-foreground">
                        AI is analyzing your music career data...
                      </p>
                </CardContent>
              </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-green-600" />
                      Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                    {dashboardData?.recentActivity ? (
                      <div className="space-y-4">
                        {dashboardData.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.status === 'success' ? 'bg-green-100 dark:bg-green-900' :
                              activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                              activity.status === 'error' ? 'bg-red-100 dark:bg-red-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              {activity.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                               activity.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                               activity.status === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                               <Info className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{activity.title}</div>
                              <div className="text-sm text-muted-foreground">{activity.description}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                    )}
            </CardContent>
          </Card>
              </TabsContent>
            </Tabs>
        </div>
      </main>
      </div>

      {/* Feature Discovery Modals */}
      {showFeatureDiscovery && (
        <FeatureDiscovery
          onClose={() => setShowFeatureDiscovery(false)}
          userLevel={userLevel}
        />
      )}

      {showFeatureSpotlight && (
        <FeatureSpotlight
          onClose={() => setShowFeatureSpotlight(false)}
          onExploreFeature={handleExploreFeature}
        />
      )}
    </div>
  );
}