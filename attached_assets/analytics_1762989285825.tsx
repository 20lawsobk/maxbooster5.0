import { MobileLayout } from "@/components/layout/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, Eye, Bell, Activity, Zap, Target, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/summary"],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchInterval: 60000, // Reduced from 30s to 60s for better performance
  });

  const { data: contentPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/analytics/content-performance"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Reduced frequency
  });

  const { data: platformAnalytics, isLoading: platformLoading } = useQuery({
    queryKey: ["/api/analytics/platforms"],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchInterval: 10 * 60 * 1000, // Reduced frequency
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/analytics/alerts/unread"],
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 2 * 60 * 1000, // Check every 2 minutes
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/analytics/trends"],
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    refetchInterval: 15 * 60 * 1000, // Keep same frequency but with cache
  });

  const summaryData = summary || {
    totalContent: 0,
    published: 0,
    scheduled: 0,
    drafts: 0,
    recentContent: [],
    aiInsights: {
      avgOptimizationScore: 0,
      platformPerformance: { bestPlatform: "Not enough data", avgEngagement: 0, growthRate: "Not enough data" },
      recommendations: ["Connect your social media accounts to start collecting analytics"]
    }
  };

  const realAnalytics = analyticsData || {
    totalEngagement: 0,
    totalReach: 0,
    totalViews: 0,
    totalImpressions: 0,
    avgEngagementRate: 0,
    connectedPlatforms: 0,
    growthRate: "0%",
    topPlatform: "No data",
    totalPosts: 0,
    viralContent: 0
  };

  const platformData = platformAnalytics || [];
  const alertsData = alerts || [];
  const trendsData = trends || [];

  const performance = (contentPerformance as any)?.averages || {
    avgEngagementRate: 0,
    avgReach: 0,
    avgLikes: 0,
    avgShares: 0
  };

  const stats = [
    { 
      title: "Total Engagement", 
      value: (realAnalytics as any).totalEngagement?.toLocaleString() || "0", 
      icon: TrendingUp,
      change: (realAnalytics as any).growthRate || "0%",
      changeType: ((realAnalytics as any).growthRate || "").startsWith('+') ? "positive" as const : ((realAnalytics as any).growthRate || "").startsWith('-') ? "negative" as const : "neutral" as const
    },
    { 
      title: "Total Reach", 
      value: (realAnalytics as any).totalReach?.toLocaleString() || "0", 
      icon: Eye,
      change: (realAnalytics as any).totalViews > 0 ? `${(realAnalytics as any).totalViews?.toLocaleString()} views` : "No views yet",
      changeType: (realAnalytics as any).totalViews > 0 ? "positive" as const : "neutral" as const
    },
    { 
      title: "Connected Platforms", 
      value: (realAnalytics as any).connectedPlatforms || 0, 
      icon: Users,
      change: (realAnalytics as any).connectedPlatforms > 0 ? "Active" : "Setup needed",
      changeType: (realAnalytics as any).connectedPlatforms > 0 ? "positive" as const : "negative" as const
    },
    { 
      title: "Viral Content", 
      value: (realAnalytics as any).viralContent || 0, 
      icon: Zap,
      change: (realAnalytics as any).viralContent > 0 ? "High performing" : "None yet",
      changeType: (realAnalytics as any).viralContent > 0 ? "positive" as const : "neutral" as const
    },
  ];

  return (
    <MobileLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid={`stat-value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.value}
                    </div>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Insights Section */}
          {(summaryData as any).aiInsights && (
            <Card className="border-accent mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span>AI Performance Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {(summaryData as any).aiInsights.avgOptimizationScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Optimization Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {(summaryData as any).aiInsights.platformPerformance.bestPlatform}
                    </div>
                    <div className="text-sm text-muted-foreground">Top Performing Platform</div>
                    <div className="text-xs text-green-600">
                      {(summaryData as any).aiInsights.platformPerformance.growthRate} growth
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {(summaryData as any).aiInsights.platformPerformance.avgEngagement}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Engagement</div>
                  </div>
                </div>
                {((summaryData as any).aiInsights.recommendations?.length || 0) > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      {((summaryData as any).aiInsights.recommendations || []).map((rec: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
              <TabsTrigger value="platforms" data-testid="tab-platforms">Platforms</TabsTrigger>
              <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts">Alerts {(alertsData as any[]).length > 0 && <Badge variant="destructive" className="ml-1">{(alertsData as any[]).length}</Badge>}</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Content Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceLoading ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading performance data...
                      </div>
                    ) : performance.avgEngagementRate === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No performance data available yet.</p>
                        <p className="text-xs mt-2">Publish content to connected platforms to see analytics.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[
                          { name: "Avg Engagement Rate", value: performance.avgEngagementRate, suffix: "%", max: 10, color: "bg-blue-500" },
                          { name: "Avg Reach", value: performance.avgReach, suffix: "", max: Math.max(performance.avgReach * 1.5, 1000), color: "bg-green-500" },
                          { name: "Avg Likes", value: performance.avgLikes, suffix: "", max: Math.max(performance.avgLikes * 1.5, 100), color: "bg-pink-500" },
                          { name: "Avg Shares", value: performance.avgShares, suffix: "", max: Math.max(performance.avgShares * 1.5, 50), color: "bg-orange-500" }
                        ].map((metric) => {
                          const percentage = Math.min(100, (metric.value / metric.max) * 100);
                          return (
                            <div key={metric.name} className="space-y-2" data-testid={`metric-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{metric.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {typeof metric.value === 'number' ? metric.value.toFixed(metric.suffix === '%' ? 1 : 0) : metric.value}{metric.suffix}
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Performance Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">Total Posts</div>
                          <div className="text-sm text-muted-foreground">Published content</div>
                        </div>
                        <div className="text-2xl font-bold">{(realAnalytics as any).totalPosts}</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">Growth Rate</div>
                          <div className="text-sm text-muted-foreground">Weekly change</div>
                        </div>
                        <div className={`text-2xl font-bold ${
                          ((realAnalytics as any).growthRate || "").startsWith('+') ? 'text-green-600' : 
                          ((realAnalytics as any).growthRate || "").startsWith('-') ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {(realAnalytics as any).growthRate}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">Top Platform</div>
                          <div className="text-sm text-muted-foreground">Best performing</div>
                        </div>
                        <div className="text-lg font-bold capitalize">{(realAnalytics as any).topPlatform}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platformLoading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading platform analytics...
                  </div>
                ) : (platformData as any[]).length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>No platform analytics available yet.</p>
                    <p className="text-xs mt-2">Connect your social media accounts to see platform-specific data.</p>
                  </div>
                ) : (
                  (platformData as any[]).map((platform: any) => (
                    <Card key={platform.id} data-testid={`platform-card-${platform.platform}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="capitalize">{platform.platform}</span>
                          <Badge variant={platform.totalPosts > 0 ? "default" : "secondary"}>
                            {platform.totalPosts || 0} posts
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Followers</span>
                          <span className="font-medium">{(platform.totalFollowers || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Engagement Rate</span>
                          <span className="font-medium">{(platform.avgEngagementRate || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Reach</span>
                          <span className="font-medium">{(platform.totalReach || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Growth Rate</span>
                          <span className={`font-medium ${
                            (platform.growthRate || 0) > 0 ? 'text-green-600' : 
                            (platform.growthRate || 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
                          }`}>
                            {(platform.growthRate || 0) >= 0 ? '+' : ''}{(platform.growthRate || 0).toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Trending Topics & Hashtags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading trend analysis...
                    </div>
                  ) : (trendsData as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No trend data available yet.</p>
                      <p className="text-xs mt-2">Trends will appear as your content gains traction.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(trendsData as any[]).slice(0, 6).map((trend: any, index: number) => (
                        <div key={trend.id} className="p-4 border rounded-lg space-y-2" data-testid={`trend-${index}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{trend.hashtag || trend.topic}</span>
                            <Badge variant="outline">Score: {trend.trendScore.toFixed(1)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">{trend.platform}</div>
                          <div className="flex items-center space-x-4 text-xs">
                            <span>Volume: {(trend.volume || 0).toLocaleString()}</span>
                            <span className={`${
                              (trend.growth || 0) > 0 ? 'text-green-600' : 
                              (trend.growth || 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
                            }`}>
                              Growth: {(trend.growth || 0) >= 0 ? '+' : ''}{(trend.growth || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Performance Alerts</span>
                    {(alertsData as any[]).length > 0 && <Badge variant="destructive">{(alertsData as any[]).length} unread</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading alerts...
                    </div>
                  ) : (alertsData as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No alerts at this time.</p>
                      <p className="text-xs mt-2">You'll be notified of significant performance changes here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(alertsData as any[]).map((alert: any) => (
                        <div key={alert.id} className={`p-4 border rounded-lg flex items-start space-x-3 ${
                          alert.severity === 'error' ? 'border-red-200 bg-red-50' :
                          alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                          alert.severity === 'success' ? 'border-green-200 bg-green-50' :
                          'border-blue-200 bg-blue-50'
                        }`} data-testid={`alert-${alert.id}`}>
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                            alert.severity === 'error' ? 'text-red-600' :
                            alert.severity === 'warning' ? 'text-yellow-600' :
                            alert.severity === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {alert.platform} • {alert.alertType} • {new Date(alert.createdAt).toLocaleDateString()}
                            </div>
                            {alert.threshold && alert.actualValue && (
                              <div className="text-xs text-muted-foreground mt-2">
                                Expected: {alert.threshold} | Actual: {alert.actualValue}
                              </div>
                            )}
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
      </div>
    </MobileLayout>
  );
}
