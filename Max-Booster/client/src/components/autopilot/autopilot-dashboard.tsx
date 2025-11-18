import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Pause,
  Settings as SettingsIcon,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';

/**
 * TODO: Add function documentation
 */
export function AutopilotDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfiguring, setIsConfiguring] = useState(false);

  const { data: autopilotStatus } = useQuery({
    queryKey: ['/api/autopilot/status'],
    refetchInterval: 30000,
  });

  const toggleAutopilotMutation = useMutation({
    mutationFn: async (shouldStart: boolean) => {
      const endpoint = shouldStart ? '/api/autopilot/start' : '/api/autopilot/stop';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to ${shouldStart ? 'start' : 'stop'} autopilot`);
      return response.json();
    },
    onSuccess: (_, shouldStart) => {
      queryClient.invalidateQueries({ queryKey: ['/api/autopilot/status'] });
      toast({
        title: 'Autopilot Updated',
        description: shouldStart ? 'Autopilot activated' : 'Autopilot paused',
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: unknown) => {
      const response = await fetch('/api/autopilot/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to update config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/autopilot/status'] });
      toast({
        title: 'Configuration Updated',
        description: 'Autopilot settings saved successfully',
      });
      setIsConfiguring(false);
    },
  });

  const isRunning = autopilotStatus?.isRunning || false;
  const config = autopilotStatus?.config || {
    enabled: false,
    platforms: [],
    postingFrequency: 'daily',
    brandVoice: 'professional',
    contentTypes: ['tips', 'insights'],
    autoPublish: false,
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Social Media Autopilot
              </CardTitle>
              <CardDescription>
                Automated content creation, optimization, and scheduling
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isRunning ? 'default' : 'secondary'}>
                {isRunning ? 'Active' : 'Paused'}
              </Badge>
              <Button
                onClick={() => toggleAutopilotMutation.mutate(!isRunning)}
                variant={isRunning ? 'destructive' : 'default'}
                disabled={toggleAutopilotMutation.isPending}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{autopilotStatus?.totalJobs || 0}</div>
                <p className="text-xs text-muted-foreground">Scheduled tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {autopilotStatus?.completedJobs || 0}
                </div>
                <p className="text-xs text-muted-foreground">Successfully executed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Next Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {autopilotStatus?.nextScheduledJob
                    ? new Date(autopilotStatus.nextScheduledJob).toLocaleString()
                    : 'No jobs scheduled'}
                </div>
                <p className="text-xs text-muted-foreground">Upcoming task</p>
              </CardContent>
            </Card>
          </div>

          {isConfiguring ? (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Posting Frequency</Label>
                  <Select
                    defaultValue={config.postingFrequency}
                    onValueChange={(value) =>
                      updateConfigMutation.mutate({ ...config, postingFrequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand Voice</Label>
                  <Select
                    defaultValue={config.brandVoice}
                    onValueChange={(value) =>
                      updateConfigMutation.mutate({ ...config, brandVoice: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-publish">Auto-Publish Content</Label>
                  <Switch
                    id="auto-publish"
                    checked={config.autoPublish}
                    onCheckedChange={(checked) =>
                      updateConfigMutation.mutate({ ...config, autoPublish: checked })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setIsConfiguring(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={() => setIsConfiguring(false)}>Done</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Autopilot Configuration</p>
                <p className="text-sm text-muted-foreground">
                  Frequency: {config.postingFrequency} • Voice: {config.brandVoice} • Auto-publish:{' '}
                  {config.autoPublish ? 'On' : 'Off'}
                </p>
              </div>
              <Button onClick={() => setIsConfiguring(true)} variant="outline">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {autopilotStatus?.pendingJobs > 0 || autopilotStatus?.completedJobs > 0 ? (
                <div className="space-y-3">
                  {[
                    ...Array(
                      Math.min(
                        3,
                        (autopilotStatus?.completedJobs || 0) + (autopilotStatus?.pendingJobs || 0)
                      )
                    ),
                  ].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Content generated and scheduled</p>
                        <p className="text-xs text-muted-foreground">
                          Platform optimization completed
                        </p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No activity yet. Start the autopilot to begin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
