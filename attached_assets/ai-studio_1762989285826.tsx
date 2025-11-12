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
import { Separator } from "@/components/ui/separator";
import { Zap, Video, Image, Palette, Wand2, Sparkles, Target } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIStudio() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("professional");
  const [videoDuration, setVideoDuration] = useState("short");

  const videoGenerationMutation = useMutation({
    mutationFn: async (data: { topic: string; platform: string; duration: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-video", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Video Content Generated!",
        description: `Created ${videoDuration} video script for ${selectedPlatform}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate video content",
        variant: "destructive",
      });
    },
  });

  const imageGenerationMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string; style: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-image", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image Concept Created!",
        description: `Generated ${style} style concept for ${selectedPlatform}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate image concept",
        variant: "destructive",
      });
    },
  });

  const formatOptimizationMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/optimize-format", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Format Optimized!",
        description: `Recommended ${data.recommendedFormat} for better performance`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to optimize content format",
        variant: "destructive",
      });
    },
  });

  const handleVideoGeneration = () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for video generation",
        variant: "destructive",
      });
      return;
    }
    videoGenerationMutation.mutate({
      topic,
      platform: selectedPlatform,
      duration: videoDuration,
    });
  };

  const handleImageGeneration = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for image generation",
        variant: "destructive",
      });
      return;
    }
    imageGenerationMutation.mutate({
      content,
      platform: selectedPlatform,
      style,
    });
  };

  const handleFormatOptimization = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for format optimization",
        variant: "destructive",
      });
      return;
    }
    formatOptimizationMutation.mutate({
      content,
      platform: selectedPlatform,
    });
  };

  return (
    <MobileLayout>
      <div className="flex-1 min-h-0">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              AI Studio
            </h1>
            <p className="text-muted-foreground">
              Create stunning content with AI-powered video scripts, image concepts, and format optimization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger data-testid="select-platform">
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
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground">AI Tools Available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">--</div>
                <p className="text-xs text-muted-foreground">Generate content to see performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">0</div>
                <p className="text-xs text-muted-foreground">AI-Generated Assets</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="video" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Scripts
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image Concepts
              </TabsTrigger>
              <TabsTrigger value="format" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Format Optimization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      AI Video Script Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="topic">Video Topic</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Social media marketing tips"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        data-testid="input-video-topic"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Video Duration</Label>
                      <Select value={videoDuration} onValueChange={setVideoDuration}>
                        <SelectTrigger data-testid="select-video-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (30s)</SelectItem>
                          <SelectItem value="medium">Medium (1-2 min)</SelectItem>
                          <SelectItem value="long">Long (3+ min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleVideoGeneration}
                      disabled={videoGenerationMutation.isPending}
                      className="w-full"
                      data-testid="button-generate-video"
                    >
                      {videoGenerationMutation.isPending ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Video Script
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Generated Script</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {videoGenerationMutation.data ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Script</Label>
                          <div className="bg-muted p-3 rounded-md mt-1">
                            <p className="text-sm whitespace-pre-line">
                              {videoGenerationMutation.data.script}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-semibold">Scenes</Label>
                          <div className="space-y-2 mt-1">
                            {videoGenerationMutation.data.scenes.map((scene: any, index: number) => (
                              <div key={index} className="bg-muted p-2 rounded-md">
                                <p className="text-xs font-medium">{scene.description}</p>
                                <p className="text-xs text-muted-foreground">{scene.duration}s</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">
                            Music: {videoGenerationMutation.data.suggestedMusic}
                          </Badge>
                          <Badge variant="outline">
                            Estimated Engagement: {videoGenerationMutation.data.estimatedEngagement}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Generate a video script to see the results here
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="image">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      AI Image Concept Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="image-content">Content Description</Label>
                      <Textarea
                        id="image-content"
                        placeholder="Describe what your image should convey..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        data-testid="textarea-image-content"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image-style">Visual Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger data-testid="select-image-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleImageGeneration}
                      disabled={imageGenerationMutation.isPending}
                      className="w-full"
                      data-testid="button-generate-image"
                    >
                      {imageGenerationMutation.isPending ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Image className="mr-2 h-4 w-4" />
                          Generate Image Concept
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Generated Concept</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {imageGenerationMutation.data ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Concept</Label>
                          <p className="text-sm bg-muted p-3 rounded-md mt-1">
                            {imageGenerationMutation.data.concept}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-semibold">Color Scheme</Label>
                          <div className="flex gap-2 mt-1">
                            {imageGenerationMutation.data.colorScheme.map((color: string, index: number) => (
                              <div
                                key={index}
                                className="w-8 h-8 rounded-full border-2 border-border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Typography & Layout</Label>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{imageGenerationMutation.data.typography}</Badge>
                            <Badge variant="outline">{imageGenerationMutation.data.layout}</Badge>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Elements</Label>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {imageGenerationMutation.data.elements.map((element: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-center">
                          <Badge variant="default" className="text-lg px-3 py-1">
                            Performance Score: {imageGenerationMutation.data.estimatedPerformance}%
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Generate an image concept to see the results here
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="format">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Platform Format Optimizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="format-content">Content to Optimize</Label>
                      <Textarea
                        id="format-content"
                        placeholder="Enter your content to get platform-specific optimization recommendations..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        data-testid="textarea-format-content"
                      />
                    </div>

                    <Button
                      onClick={handleFormatOptimization}
                      disabled={formatOptimizationMutation.isPending}
                      className="w-full"
                      data-testid="button-optimize-format"
                    >
                      {formatOptimizationMutation.isPending ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Target className="mr-2 h-4 w-4" />
                          Optimize Format
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formatOptimizationMutation.data ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Recommended Format</Label>
                          <Badge variant="default" className="mt-1 block w-fit">
                            {formatOptimizationMutation.data.recommendedFormat}
                          </Badge>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-semibold">Performance Boost</Label>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            +{formatOptimizationMutation.data.performanceBoost}%
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-sm font-semibold">Modifications</Label>
                          <ul className="mt-2 space-y-1">
                            {formatOptimizationMutation.data.modifications.map((mod: string, index: number) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {mod}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Alternative Formats</Label>
                          <div className="space-y-2 mt-2">
                            {formatOptimizationMutation.data.alternativeFormats.map((alt: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                <span className="text-sm">{alt.format}</span>
                                <Badge variant="outline">{alt.score}% score</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Optimize your content format to see recommendations here
                      </p>
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