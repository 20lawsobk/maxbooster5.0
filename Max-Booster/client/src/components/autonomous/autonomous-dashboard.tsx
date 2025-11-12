import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, 
  Play, 
  Pause, 
  TrendingUp, 
  Users, 
  Target,
  Activity,
  Brain,
  Zap
} from "lucide-react";

export function AutonomousDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfiguring, setIsConfiguring] = useState(false);

  const { data: autonomousStatus } = useQuery({
    queryKey: ["/api/autopilot/autonomous/status"],
    refetchInterval: 30000,
  });

  const toggleAutonomousMutation = useMutation({
    mutationFn: async (shouldStart: boolean) => {
      const endpoint = shouldStart ? "/api/autopilot/autonomous/start" : "/api/autopilot/autonomous/stop";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Failed to ${shouldStart ? 'start' : 'stop'} autonomous mode`);
      return response.json();
    },
    onSuccess: (_, shouldStart) => {
      queryClient.invalidateQueries({ queryKey: ["/api/autopilot/autonomous/status"] });
      toast({
        title: "Autonomous Mode Updated",
        description: shouldStart ? "Autonomous mode activated - AI will handle everything" : "Autonomous mode paused",
      });
    },
  });

  const updateAutonomousConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch("/api/autopilot/autonomous/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Failed to update config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/autopilot/autonomous/status"] });
      toast({
        title: "Configuration Updated",
        description: "Autonomous settings saved successfully",
      });
      setIsConfiguring(false);
    },
  });

  const isRunning = autonomousStatus?.isRunning || false;
  const config = autonomousStatus?.config || {
    enabled: false,
    minPostsPerDay: 3,
    maxPostsPerDay: 8,
    businessVertical: "",
    targetAudience: "",
    brandPersonality: "professional",
    autoOptimization: true,
  };

  const stats = autonomousStatus || {
    totalContentPublished: 0,
    avgEngagementRate: 0,
    connectedPlatforms: 0,
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Fully Autonomous Social Media (24/7)
              </CardTitle>
              <CardDescription>
                Set it once and let AI handle everything - content creation, posting, optimization, and learning
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-purple-600" : ""}>
                {isRunning ? "🤖 Active" : "Paused"}
              </Badge>
              <Button
                onClick={() => toggleAutonomousMutation.mutate(!isRunning)}
                variant={isRunning ? "destructive" : "default"}
                disabled={toggleAutonomousMutation.isPending}
                className={!isRunning ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Autonomous Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Content Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalContentPublished}</div>
                <p className="text-xs text-muted-foreground">AI-generated posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Avg Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.avgEngagementRate ? (stats.avgEngagementRate * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Across all platforms</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Active Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.connectedPlatforms || 0}</div>
                <p className="text-xs text-muted-foreground">Connected & posting</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  Daily Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{config.minPostsPerDay}-{config.maxPostsPerDay}</div>
                <p className="text-xs text-muted-foreground">Adaptive posting</p>
              </CardContent>
            </Card>
          </div>

          {isConfiguring ? (
            <Card className="border-purple-500">
              <CardHeader>
                <CardTitle className="text-lg">Autonomous Configuration</CardTitle>
                <CardDescription>Configure how the AI manages your social media presence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Posts Per Day</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      defaultValue={config.minPostsPerDay}
                      onChange={(e) => updateAutonomousConfigMutation.mutate({ ...config, minPostsPerDay: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Posts Per Day</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      defaultValue={config.maxPostsPerDay}
                      onChange={(e) => updateAutonomousConfigMutation.mutate({ ...config, maxPostsPerDay: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business/Industry</Label>
                  <Input
                    placeholder="e.g., Music, Tech, Fashion"
                    defaultValue={config.businessVertical}
                    onChange={(e) => updateAutonomousConfigMutation.mutate({ ...config, businessVertical: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input
                    placeholder="e.g., Musicians, Producers, Music Lovers"
                    defaultValue={config.targetAudience}
                    onChange={(e) => updateAutonomousConfigMutation.mutate({ ...config, targetAudience: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-optimize">Auto-Optimization</Label>
                    <p className="text-xs text-muted-foreground">AI learns and adapts based on performance</p>
                  </div>
                  <Switch
                    id="auto-optimize"
                    checked={config.autoOptimization}
                    onCheckedChange={(checked) => updateAutonomousConfigMutation.mutate({ ...config, autoOptimization: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsConfiguring(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={() => setIsConfiguring(false)} className="bg-purple-600 hover:bg-purple-700">
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Autonomous Mode Configuration</p>
                    <p className="text-sm text-muted-foreground">
                      Posts: {config.minPostsPerDay}-{config.maxPostsPerDay}/day • 
                      Target: {config.targetAudience || "Not set"} • 
                      Industry: {config.businessVertical || "Not set"}
                    </p>
                  </div>
                  <Button onClick={() => setIsConfiguring(true)} variant="outline">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Learning & Adaptation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Content Quality Score</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Timing Optimization</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Audience Understanding</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {!isRunning && (
            <Card className="border-purple-500 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Brain className="h-10 w-10 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Ready for Fully Autonomous Operation</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once activated, the AI will autonomously:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Generate relevant content based on your industry and audience</li>
                      <li>• Post at optimal times learned from your audience's behavior</li>
                      <li>• Adapt content strategy based on performance metrics</li>
                      <li>• Maintain consistent brand voice across all platforms</li>
                      <li>• Continuously learn and improve engagement rates</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      No manual work required - the AI handles everything 24/7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
