import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Copy, RefreshCw, Send, Sparkles, MessageSquare, Calendar, Hash } from "lucide-react";

interface GeneratedContent {
  content: string[];
}

export function ContentGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contentType: 'album_announcement',
    tone: 'excited',
    customPrompt: '',
    platform: 'twitter',
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/social/generate-content', data);
      return response.json();
    },
    onSuccess: (data: GeneratedContent) => {
      setGeneratedContent(data);
      setSelectedVersion(data.content[0]);
      toast({
        title: "Content Generated!",
        description: "AI has created multiple versions for you to choose from.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  });

  const postMutation = useMutation({
    mutationFn: async (data: { content: string; platforms: string[]; scheduledFor?: string }) => {
      const response = await apiRequest('POST', '/api/social/posts', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Scheduled!",
        description: "Your post has been scheduled successfully.",
      });
      setGeneratedContent(null);
      setSelectedVersion('');
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed", 
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const contentTypes = [
    { value: 'album_announcement', label: 'Album Announcement' },
    { value: 'behind_the_scenes', label: 'Behind the Scenes' },
    { value: 'fan_appreciation', label: 'Fan Appreciation' },
    { value: 'show_promotion', label: 'Show Promotion' },
    { value: 'milestone_celebration', label: 'Milestone Celebration' },
    { value: 'studio_update', label: 'Studio Update' },
    { value: 'custom', label: 'Custom Prompt' },
  ];

  const tones = [
    { value: 'excited', label: 'Excited', emoji: '🎉' },
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'casual', label: 'Casual', emoji: '😊' },
    { value: 'mysterious', label: 'Mysterious', emoji: '🔮' },
    { value: 'inspirational', label: 'Inspirational', emoji: '✨' },
    { value: 'humorous', label: 'Humorous', emoji: '😄' },
  ];

  const platforms = [
    { value: 'twitter', label: 'Twitter/X', maxLength: 280, features: ['hashtags', 'mentions'] },
    { value: 'instagram', label: 'Instagram', maxLength: 2200, features: ['hashtags', 'emojis'] },
    { value: 'youtube', label: 'YouTube', maxLength: 5000, features: ['long-form', 'timestamps'] },
    { value: 'tiktok', label: 'TikTok', maxLength: 300, features: ['hashtags', 'trending'] },
    { value: 'facebook', label: 'Facebook', maxLength: 63206, features: ['long-form', 'links'] },
    { value: 'linkedin', label: 'LinkedIn', maxLength: 1300, features: ['professional', 'articles'] },
  ];

  const handleGenerate = () => {
    generateMutation.mutate(formData);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const handleSchedulePost = () => {
    if (!selectedVersion) return;
    
    postMutation.mutate({
      content: selectedVersion,
      platforms: [formData.platform],
    });
  };

  const getCharacterCount = (content: string) => {
    const selectedPlatform = platforms.find(p => p.value === formData.platform);
    return {
      current: content.length,
      max: selectedPlatform?.maxLength || 280,
      isOverLimit: content.length > (selectedPlatform?.maxLength || 280)
    };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border" data-testid="card-content-generator">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-primary" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select 
                  value={formData.contentType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger data-testid="select-content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Target Platform</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Max {platforms.find(p => p.value === formData.platform)?.maxLength} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tone & Style</Label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => (
                    <Button
                      key={tone.value}
                      variant={formData.tone === tone.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, tone: tone.value }))}
                      className={formData.tone === tone.value ? "bg-primary/20 text-primary" : ""}
                      data-testid={`tone-${tone.value}`}
                    >
                      <span className="mr-1">{tone.emoji}</span>
                      {tone.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customPrompt">Custom Instructions</Label>
                <Textarea
                  id="customPrompt"
                  value={formData.customPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Add specific details, mentions, hashtags, or custom instructions..."
                  rows={6}
                  data-testid="textarea-custom-prompt"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
                data-testid="button-generate-content"
              >
                {generateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {generateMutation.isPending ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="space-y-4 pt-6 border-t border-border" data-testid="generated-content-section">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-accent" />
                  Generated Content
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  data-testid="button-regenerate"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <Tabs defaultValue="0" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {generatedContent.content.slice(0, 2).map((_, index) => (
                    <TabsTrigger key={index} value={index.toString()} data-testid={`tab-version-${index}`}>
                      Version {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {generatedContent.content.slice(0, 2).map((content, index) => {
                  const charCount = getCharacterCount(content);
                  return (
                    <TabsContent key={index} value={index.toString()}>
                      <Card className="bg-muted/20 border-border">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                {platforms.find(p => p.value === formData.platform)?.label}
                              </Badge>
                              <div className={`text-xs ${charCount.isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {charCount.current}/{charCount.max}
                              </div>
                            </div>

                            <div 
                              className="p-4 bg-background rounded-lg border border-border min-h-[120px] whitespace-pre-wrap"
                              data-testid={`content-preview-${index}`}
                            >
                              {content}
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyContent(content)}
                                data-testid={`button-copy-${index}`}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVersion(content)}
                                className={selectedVersion === content ? "bg-accent/20 text-accent" : ""}
                                data-testid={`button-select-${index}`}
                              >
                                <Hash className="h-4 w-4 mr-2" />
                                Use This
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>

              {/* Schedule Actions */}
              {selectedVersion && (
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-accent">Ready to Schedule</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Schedule for later')}
                      data-testid="button-schedule-later"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule for Later
                    </Button>
                    <Button
                      onClick={handleSchedulePost}
                      disabled={postMutation.isPending}
                      className="bg-secondary hover:bg-secondary/90"
                      data-testid="button-post-now"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
