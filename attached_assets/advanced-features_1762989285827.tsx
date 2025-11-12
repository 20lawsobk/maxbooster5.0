import { useState } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  TestTube, 
  Recycle, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Shield,
  RefreshCw,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdvancedFeatures() {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState("");
  const [testType, setTestType] = useState("content");
  const [sourcePlatform, setSourcePlatform] = useState("instagram");
  const [targetPlatform, setTargetPlatform] = useState("twitter");
  const [monitoringText, setMonitoringText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");

  // A/B Testing
  const createABTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await apiRequest("POST", "/api/ab-tests", testData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "A/B Test Created!",
        description: "Your test is now running and collecting data.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create A/B test",
        variant: "destructive",
      });
    },
  });

  const abTestsQuery = useQuery({
    queryKey: ["/api/ab-tests"],
    queryFn: async () => {
      const response = await fetch("/api/ab-tests");
      return response.json();
    },
  });

  // Content Recycling
  const recycleRecommendationsQuery = useQuery({
    queryKey: ["/api/content/recycle-recommendations"],
    queryFn: async () => {
      const response = await fetch("/api/content/recycle-recommendations");
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    retry: false
  });

  const recycleContentMutation = useMutation({
    mutationFn: async (data: { contentId: string; targetPlatforms: string[] }) => {
      const response = await apiRequest("POST", `/api/content/${data.contentId}/recycle`, {
        targetPlatforms: data.targetPlatforms
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Recycled!",
        description: `Created ${data?.length || 0} adapted versions.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to recycle content",
        variant: "destructive",
      });
    },
  });

  // Content Adaptation
  const adaptContentMutation = useMutation({
    mutationFn: async (data: { contentId: string; sourcePlatform: string; targetPlatform: string }) => {
      const response = await apiRequest("POST", "/api/content/adapt", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Adapted!",
        description: `Successfully adapted content for ${targetPlatform}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to adapt content",
        variant: "destructive",
      });
    },
  });

  // Sentiment Monitoring
  const analyzeSentimentMutation = useMutation({
    mutationFn: async (data: { text: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/sentiment/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sentiment Analyzed!",
        description: `Detected ${data.label} sentiment with ${Math.round(data.confidence * 100)}% confidence.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze sentiment",
        variant: "destructive",
      });
    },
  });

  const crisisAlertsQuery = useQuery({
    queryKey: ["/api/crisis/alerts", selectedPlatform],
    queryFn: async () => {
      const response = await fetch(`/api/crisis/alerts?platform=${selectedPlatform}`);
      return response.json();
    },
  });

  const handleCreateABTest = () => {
    if (!selectedContent.trim()) {
      toast({
        title: "Error",
        description: "Please select content to test",
        variant: "destructive",
      });
      return;
    }

    createABTestMutation.mutate({
      name: `${testType} Test - ${new Date().toLocaleDateString()}`,
      contentId: selectedContent,
      platform: selectedPlatform,
      testType,
      variants: [
        { content: "Original version", type: "control" },
        { content: "Variant version", type: "test" }
      ]
    });
  };

  const handleRecycleContent = (contentId: string, platforms: string[]) => {
    recycleContentMutation.mutate({
      contentId,
      targetPlatforms: platforms
    });
  };

  const handleAdaptContent = () => {
    if (!selectedContent.trim()) {
      toast({
        title: "Error",
        description: "Please select content to adapt",
        variant: "destructive",
      });
      return;
    }

    adaptContentMutation.mutate({
      contentId: selectedContent,
      sourcePlatform,
      targetPlatform
    });
  };

  const handleAnalyzeSentiment = () => {
    if (!monitoringText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    analyzeSentimentMutation.mutate({
      text: monitoringText,
      platform: selectedPlatform
    });
  };

  return (
    <MobileLayout>
      <div className="flex-1 min-h-0">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              Advanced AI Features
            </h1>
            <p className="text-muted-foreground">
              Powerful tools for A/B testing, content recycling, cross-platform adaptation, and sentiment monitoring
            </p>
          </div>

          <Tabs defaultValue="ab-testing" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ab-testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                A/B Testing
              </TabsTrigger>
              <TabsTrigger value="recycling" className="flex items-center gap-2">
                <Recycle className="h-4 w-4" />
                Content Recycling
              </TabsTrigger>
              <TabsTrigger value="adaptation" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Platform Adaptation
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sentiment Monitor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ab-testing">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-primary" />
                      Create A/B Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="content-select">Content to Test</Label>
                      <Input
                        id="content-select"
                        placeholder="Enter content ID or select from list"
                        value={selectedContent}
                        onChange={(e) => setSelectedContent(e.target.value)}
                        data-testid="input-ab-content"
                      />
                    </div>

                    <div>
                      <Label htmlFor="test-type">Test Type</Label>
                      <Select value={testType} onValueChange={setTestType}>
                        <SelectTrigger data-testid="select-test-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content">Content Variations</SelectItem>
                          <SelectItem value="hashtags">Hashtag Testing</SelectItem>
                          <SelectItem value="timing">Posting Time</SelectItem>
                          <SelectItem value="format">Format Testing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ab-platform">Platform</Label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger data-testid="select-ab-platform">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleCreateABTest}
                      disabled={createABTestMutation.isPending}
                      className="w-full"
                      data-testid="button-create-ab-test"
                    >
                      {createABTestMutation.isPending ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Creating Test...
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          Create A/B Test
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {abTestsQuery.data && abTestsQuery.data.length > 0 ? (
                      <div className="space-y-4">
                        {abTestsQuery.data.slice(0, 3).map((test: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{test.name}</h4>
                              <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                                {test.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Platform: {test.platform} • Type: {test.testType}
                            </div>
                            {test.winner && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Winner: Variant {test.winner}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TestTube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {abTestsQuery.isLoading ? "Loading tests..." : "No active A/B tests"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recycling">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Recycle className="h-5 w-5 text-primary" />
                      High-Performing Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recycleRecommendationsQuery.data?.highPerformers ? (
                      <div className="space-y-4">
                        {recycleRecommendationsQuery.data.highPerformers.slice(0, 3).map((content: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{content.title || "Untitled"}</h4>
                              <Badge variant="secondary">
                                {Math.round(content.engagementRate * 100)}% engagement
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {content.body?.substring(0, 100)}...
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleRecycleContent(content.id, ['twitter', 'linkedin'])}
                              disabled={recycleContentMutation.isPending}
                              data-testid={`button-recycle-${index}`}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Recycle Content
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Recycle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {recycleRecommendationsQuery.isLoading ? "Loading recommendations..." : "No content ready for recycling"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recycling Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recycleRecommendationsQuery.data?.recycleRecommendations ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted rounded-md">
                            <div className="text-lg font-bold text-primary">
                              {recycleRecommendationsQuery.data.recycleRecommendations.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Ready to Recycle</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-md">
                            <div className="text-lg font-bold text-green-600">
                              {recycleRecommendationsQuery.data.optimalRecycleInterval}
                            </div>
                            <div className="text-xs text-muted-foreground">Days Optimal Interval</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-medium mb-2">Top Recommendations</h4>
                          <div className="space-y-2">
                            {recycleRecommendationsQuery.data.recycleRecommendations.slice(0, 3).map((rec: any, index: number) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm">{rec.originalContent.substring(0, 30)}...</span>
                                <Badge variant="outline">{Math.round(rec.recycleScore * 100)}% score</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Recycling insights will appear here
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="adaptation">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      Cross-Platform Adapter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="adapt-content">Content to Adapt</Label>
                      <Input
                        id="adapt-content"
                        placeholder="Enter content ID"
                        value={selectedContent}
                        onChange={(e) => setSelectedContent(e.target.value)}
                        data-testid="input-adapt-content"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="source-platform">Source Platform</Label>
                        <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
                          <SelectTrigger data-testid="select-source-platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="target-platform">Target Platform</Label>
                        <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                          <SelectTrigger data-testid="select-target-platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleAdaptContent}
                      disabled={adaptContentMutation.isPending}
                      className="w-full"
                      data-testid="button-adapt-content"
                    >
                      {adaptContentMutation.isPending ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Adapting...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Adapt Content
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Adaptation Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adaptContentMutation.data ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Adapted Content</Label>
                          <div className="bg-muted p-3 rounded-md mt-1">
                            <p className="text-sm">{adaptContentMutation.data.adaptedContent}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Format Changes</Label>
                          <ul className="mt-2 space-y-1">
                            {adaptContentMutation.data.formatChanges.map((change: string, index: number) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Estimated Performance</Label>
                          <div className="mt-2">
                            <Progress value={adaptContentMutation.data.estimatedPerformance * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(adaptContentMutation.data.estimatedPerformance * 100)}% expected performance
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ArrowRight className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Adapt content to see results here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sentiment">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Sentiment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="monitoring-text">Text to Analyze</Label>
                      <Textarea
                        id="monitoring-text"
                        placeholder="Enter text, comments, or mentions to analyze sentiment..."
                        value={monitoringText}
                        onChange={(e) => setMonitoringText(e.target.value)}
                        rows={4}
                        data-testid="textarea-sentiment"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sentiment-platform">Platform Context</Label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger data-testid="select-sentiment-platform">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAnalyzeSentiment}
                      disabled={analyzeSentimentMutation.isPending}
                      className="w-full"
                      data-testid="button-analyze-sentiment"
                    >
                      {analyzeSentimentMutation.isPending ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Analyze Sentiment
                        </>
                      )}
                    </Button>

                    {analyzeSentimentMutation.data && (
                      <div className="mt-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Sentiment Result</span>
                          <Badge 
                            variant={
                              analyzeSentimentMutation.data.label === 'positive' ? 'default' :
                              analyzeSentimentMutation.data.label === 'negative' ? 'destructive' : 'secondary'
                            }
                          >
                            {analyzeSentimentMutation.data.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {Math.round(analyzeSentimentMutation.data.confidence * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {analyzeSentimentMutation.data.score.toFixed(2)} (-1 to 1 scale)
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Crisis Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {crisisAlertsQuery.data ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Risk Level</span>
                          <Badge 
                            variant={
                              crisisAlertsQuery.data.riskLevel === 'high' ? 'destructive' :
                              crisisAlertsQuery.data.riskLevel === 'medium' ? 'default' : 'secondary'
                            }
                          >
                            {crisisAlertsQuery.data.riskLevel}
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Impact Score</Label>
                          <div className="mt-2">
                            <Progress value={crisisAlertsQuery.data.impactScore} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {crisisAlertsQuery.data.impactScore}/100 impact severity
                            </p>
                          </div>
                        </div>

                        {crisisAlertsQuery.data.signals.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold">Warning Signals</Label>
                            <ul className="mt-2 space-y-1">
                              {crisisAlertsQuery.data.signals.map((signal: string, index: number) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                                  {signal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {crisisAlertsQuery.data.recommendations.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold">Recommended Actions</Label>
                            <ul className="mt-2 space-y-1">
                              {crisisAlertsQuery.data.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {crisisAlertsQuery.isLoading ? "Checking for alerts..." : "No crisis alerts detected"}
                        </p>
                      </div>
                    )}
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