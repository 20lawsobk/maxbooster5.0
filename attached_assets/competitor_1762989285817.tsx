import { useState } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Users, Search, Eye, TrendingUp, Target, Hash, Clock, MessageCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Competitor() {
  const { toast } = useToast();
  const [competitorHandle, setCompetitorHandle] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");

  const competitorAnalysisMutation = useMutation({
    mutationFn: async (data: { competitorHandle: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/competitor-analysis", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete!",
        description: `Analyzed @${competitorHandle} on ${selectedPlatform}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze competitor",
        variant: "destructive",
      });
    },
  });

  const contentGapsQuery = useQuery({
    queryKey: ["/api/ai/content-gaps", selectedPlatform],
    queryFn: async () => {
      const response = await fetch(`/api/ai/content-gaps/${selectedPlatform}`);
      return response.json();
    },
  });

  const handleAnalyzeCompetitor = () => {
    if (!competitorHandle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a competitor handle",
        variant: "destructive",
      });
      return;
    }
    
    competitorAnalysisMutation.mutate({
      competitorHandle: competitorHandle.replace('@', ''),
      platform: selectedPlatform,
    });
  };

  return (
    <MobileLayout>
      <div className="flex-1 min-h-0">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Competitor Intelligence
            </h1>
            <p className="text-muted-foreground">
              Analyze competitors and discover content opportunities to stay ahead of the competition
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Competitors Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Content Gaps Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {(contentGapsQuery.data && Array.isArray(contentGapsQuery.data)) ? contentGapsQuery.data.length : 0}
                </div>
                <p className="text-xs text-muted-foreground">Opportunities identified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Strategy Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">--</div>
                <p className="text-xs text-muted-foreground">Analyze competitors to get score</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Competitor Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="competitor-handle">Competitor Handle</Label>
                    <Input
                      id="competitor-handle"
                      placeholder="@competitor_username"
                      value={competitorHandle}
                      onChange={(e) => setCompetitorHandle(e.target.value)}
                      data-testid="input-competitor-handle"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="analysis-platform">Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger data-testid="select-analysis-platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleAnalyzeCompetitor}
                    disabled={competitorAnalysisMutation.isPending}
                    className="w-full"
                    data-testid="button-analyze-competitor"
                  >
                    {competitorAnalysisMutation.isPending ? (
                      <>
                        <Eye className="mr-2 h-4 w-4 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Analyze Competitor
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Content Gap Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contentGapsQuery.data ? (
                    <div className="space-y-3">
                      {contentGapsQuery.data.slice(0, 5).map((gap: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{gap.topic}</h4>
                            <Badge 
                              variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {gap.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Gap Score: {Math.round(gap.gapScore)}/100
                          </div>
                          <Progress value={gap.gapScore} className="h-2" />
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {gap.suggestedContentTypes.slice(0, 2).map((type: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      {contentGapsQuery.isLoading ? "Loading content gaps..." : "Content gap analysis will appear here"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {competitorAnalysisMutation.data ? (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-semibold">Content Strategy</Label>
                        <p className="text-sm bg-muted p-3 rounded-md mt-1">
                          {competitorAnalysisMutation.data.contentStrategy}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-md">
                          <div className="text-lg font-bold text-primary">
                            {competitorAnalysisMutation.data.postingFrequency}
                          </div>
                          <div className="text-xs text-muted-foreground">Posts/Day</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-md">
                          <div className="text-lg font-bold text-green-600">
                            {competitorAnalysisMutation.data.averageEngagement}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Engagement</div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-1">
                          <Hash className="h-4 w-4" />
                          Top Hashtags
                        </Label>
                        <div className="flex gap-1 flex-wrap mt-2">
                          {competitorAnalysisMutation.data.topHashtags.map((hashtag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Content Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {competitorAnalysisMutation.data.contentTypes.map((type: string, index: number) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded text-center">
                              {type.replace('_', ' ')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Key Insights
                        </Label>
                        <ul className="mt-2 space-y-1">
                          {competitorAnalysisMutation.data.insights.map((insight: string, index: number) => (
                            <li key={index} className="text-xs flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Analyze a competitor to see detailed insights here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}