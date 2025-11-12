import { useState, useRef, useEffect } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Download, Settings, Palette, Clock, Film, Sparkles, Video, Eye } from "lucide-react";

// Video rendering engine using Canvas API
class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  constructor(width: number = 1080, height: number = 1080) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  async renderScene(scene: any, animations: any): Promise<void> {
    const { type, content, duration, style } = scene;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set background
    this.ctx.fillStyle = style.backgroundColor || "#1DA1F2";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Configure text
    this.ctx.fillStyle = style.color || "#ffffff";
    this.ctx.font = `${style.fontSize || 48}px ${style.fontFamily || "Arial"}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    
    // Add text shadows for better readability
    this.ctx.shadowColor = "rgba(0,0,0,0.5)";
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    // Render text with word wrapping
    this.renderWrappedText(content, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width - 100);
  }

  private renderWrappedText(text: string, x: number, y: number, maxWidth: number): void {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    const lineHeight = parseInt(this.ctx.font) * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = y - totalHeight / 2;

    lines.forEach((line, index) => {
      this.ctx.fillText(line, x, startY + (index * lineHeight));
    });
  }

  async startRecording(): Promise<void> {
    const stream = this.canvas.captureStream(30); // 30 FPS
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    this.chunks = [];
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start();
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: 'video/webm' });
          resolve(blob);
        };
        this.mediaRecorder.stop();
      }
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch video templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/video/templates"],
  });

  // Video generation mutation
  const generateVideoMutation = useMutation({
    mutationFn: async ({ prompt, templateId }: { prompt: string; templateId?: string }) => {
      const response = await apiRequest("POST", "/api/video/generate", { prompt, templateId });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedVideo(data);
      toast({
        title: "Video Generated!",
        description: "Your video is ready for rendering",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Please try again with a different prompt",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your video",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      await generateVideoMutation.mutateAsync({
        prompt: prompt.trim(),
        templateId: selectedTemplate === "custom" ? undefined : selectedTemplate,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderVideo = async () => {
    if (!generatedVideo || !canvasRef.current) return;

    setIsRendering(true);
    setProgress(0);

    try {
      const { video, exportInstructions, animations } = generatedVideo;
      const renderer = new VideoRenderer(video.width, video.height);
      rendererRef.current = renderer;

      // Show preview canvas
      const canvas = renderer.getCanvas();
      const container = canvasRef.current.parentElement!;
      container.appendChild(canvas);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.borderRadius = "8px";
      canvas.style.border = "2px solid #e2e8f0";

      await renderer.startRecording();

      let currentTime = 0;
      const totalDuration = video.duration * 1000; // Convert to milliseconds
      
      for (let i = 0; i < video.scenes.length; i++) {
        const scene = video.scenes[i];
        const sceneDuration = scene.duration * 1000;
        
        // Render scene
        await renderer.renderScene(scene, animations);
        
        // Simulate animation duration
        const animationFrames = Math.floor((sceneDuration / 1000) * 30); // 30 FPS
        for (let frame = 0; frame < animationFrames; frame++) {
          await new Promise(resolve => setTimeout(resolve, 33)); // ~30 FPS
          
          currentTime += 33;
          setProgress((currentTime / totalDuration) * 100);
        }
      }

      const videoBlob = await renderer.stopRecording();
      setVideoBlob(videoBlob);
      
      // Create preview URL
      const url = URL.createObjectURL(videoBlob);
      setPreviewUrl(url);

      toast({
        title: "Video Rendered!",
        description: "Your video is ready for download",
      });

    } catch (error) {
      console.error("Video rendering error:", error);
      toast({
        title: "Rendering Failed",
        description: "Please try generating a new video",
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
      setProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!videoBlob || !generatedVideo) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedVideo.video.title.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Video Downloaded",
      description: "Your video has been saved to your device",
    });
  };

  return (
    <MobileLayout>
      <div className="flex-1 min-h-0">
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Video className="h-8 w-8 text-primary" />
              AI Video Generator
            </h1>
            <p className="text-muted-foreground">
              Create professional videos for social media using AI-powered generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Creation Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Choose Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue placeholder="Select a template or create custom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom (No Template)</SelectItem>
                      {(templates as any[]).map((template: any) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.duration}s
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Video Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Video Description</Label>
                  <Textarea
                    id="prompt"
                    data-testid="input-prompt"
                    placeholder="Describe your video... e.g., 'Exciting product launch announcement for our new app with modern blue theme'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Selected Template Info */}
                {selectedTemplate && selectedTemplate !== "custom" && (
                  <div className="p-4 bg-muted rounded-lg">
                    {(() => {
                      const template = (templates as any[]).find((t: any) => t.id === selectedTemplate);
                      return template ? (
                        <div>
                          <h4 className="font-semibold mb-2">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant="outline">{template.duration}s</Badge>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  data-testid="button-generate"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>

                {/* Video Info */}
                {generatedVideo && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Generated Video</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Title:</strong> {generatedVideo.video.title}</p>
                      <p><strong>Duration:</strong> {generatedVideo.video.duration}s</p>
                      <p><strong>Resolution:</strong> {generatedVideo.video.width}x{generatedVideo.video.height}</p>
                      <p><strong>Scenes:</strong> {generatedVideo.video.scenes.length}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview and Rendering Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview & Render
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Canvas Preview */}
                <div className="relative bg-muted rounded-lg aspect-square flex items-center justify-center min-h-[300px]">
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {!generatedVideo ? (
                    <div className="text-center text-muted-foreground">
                      <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Generate a video to see preview</p>
                    </div>
                  ) : !previewUrl ? (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">Ready to render video</p>
                      <Button
                        onClick={renderVideo}
                        disabled={isRendering}
                        data-testid="button-render"
                      >
                        {isRendering ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Rendering...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Render Video
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-auto rounded-lg"
                      data-testid="video-preview"
                    />
                  )}
                </div>

                {/* Progress Bar */}
                {(isGenerating || isRendering) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{isGenerating ? "Generating..." : "Rendering..."}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {/* Download Button */}
                {videoBlob && (
                  <Button
                    onClick={downloadVideo}
                    className="w-full"
                    variant="outline"
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                )}

                {/* Video Stats */}
                {generatedVideo && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{generatedVideo.video.duration}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span>{generatedVideo.video.fps} FPS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <span>Custom Styled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-muted-foreground" />
                      <span>WebM Format</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Template Gallery */}
          {!templatesLoading && (templates as any[]).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(templates as any[]).map((template: any) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      data-testid={`template-${template.id}`}
                    >
                      <h4 className="font-semibold mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge variant="outline">{template.duration}s</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}