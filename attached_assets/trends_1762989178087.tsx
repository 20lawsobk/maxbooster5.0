import { useState } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Lightbulb, Hash, Target, Zap, Activity, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Trends() {
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [timeframe, setTimeframe] = useState("month");

  const trendsQuery = useQuery({
    queryKey: ["/api/ai/trends", selectedPlatform, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/ai/trends/${selectedPlatform}?timeframe=${timeframe}`);
      const data = await response.json();
      
      // Ensure we always return an array, even on error
      if (!response.ok || !Array.isArray(data)) {
        console.warn('Trends API error:', data);
        return [];
      }
      
      return data;
    },
  });

  const formatConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatPriorityVariant = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 60) return "default";
    return "secondary";
  };

  return (
    <MobileLayout>
      <div className="flex-1 min-h-0">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Trend Insights
            </h1>
            <p className="text-muted-foreground">
              Stay ahead with AI-powered trend forecasting and content recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger data-testid="select-trends-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Timeframe</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger data-testid="select-timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {(trendsQuery.data && Array.isArray(trendsQuery.data)) ? trendsQuery.data.length : 0}
                </div>
                <p className="text-xs text-muted-foreground">Forecasted trends</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(trendsQuery.data && Array.isArray(trendsQuery.data) && trendsQuery.data.length > 0)
                    ? Math.round(trendsQuery.data.reduce((acc: number, trend: any) => acc + trend.confidenceScore, 0) / trendsQuery.data.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Prediction accuracy</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trend Forecast
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Content Ideas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(trendsQuery.data && Array.isArray(trendsQuery.data) && trendsQuery.data.length > 0) ? (
                  trendsQuery.data.map((trend: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{trend.trend}</CardTitle>
                          <Badge variant={formatPriorityVariant(trend.confidenceScore)}>
                            {trend.confidenceScore}% confidence
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Peak: {format(new Date(trend.predictedPeak), "MMM dd, yyyy")}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Confidence Score</span>
                          </div>
                          <Progress value={trend.confidenceScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Suggested Action</span>
                          </div>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {trend.suggestedAction}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Related Hashtags</span>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {trend.relatedHashtags.map((hashtag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    {trendsQuery.isLoading ? (
                      <div className="space-y-2">
                        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                        <p className="text-muted-foreground">Analyzing trends...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Trend forecasts will appear here
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Quick Wins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Content recommendations will appear here based on trend analysis
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Optimal Timing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Optimal posting times will be shown based on your audience data
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-orange-500" />
                      Content Mix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Content mix recommendations will appear based on your performance analytics
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}