import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Play, Square, Shield, Rocket, Cpu, Activity } from 'lucide-react';

export default function AdminAutonomy() {
  const user = useRequireAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autopilotKey = ['/api/autopilot/social/status'];
  const autonomousKey = ['/api/auto/social/status'];
  const updatesKey = ['/api/auto-updates/status'];
  const securityMetricsKey = ['/api/security/metrics'];
  const securityThreatsKey = ['/api/security/threats'];

  const { data: autopilotStatus } = useQuery({ queryKey: autopilotKey });
  const { data: autonomousStatus } = useQuery({ queryKey: autonomousKey });
  const { data: updatesStatus } = useQuery({ queryKey: updatesKey });
  const { data: securityMetrics } = useQuery({ queryKey: securityMetricsKey });
  const { data: securityThreats } = useQuery({ queryKey: securityThreatsKey });

  const startAutopilot = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/autopilot/social/start')).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: autopilotKey })
  });
  const stopAutopilot = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/autopilot/social/stop')).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: autopilotKey })
  });

  const startAutonomous = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/auto/social/start', {})).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: autonomousKey })
  });
  const stopAutonomous = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/auto/social/stop', {})).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: autonomousKey })
  });

  const startUpdates = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/auto-updates/start')).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: updatesKey })
  });
  const stopUpdates = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/auto-updates/stop')).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: updatesKey })
  });
  const runUpdatesOnce = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/auto-updates/run-once')).json(),
    onSuccess: (data) => {
      toast({ title: 'Auto-Updates Run Complete' });
      queryClient.invalidateQueries({ queryKey: updatesKey });
    }
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <TopBar title="Admin Autonomy Control" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Cpu className="w-5 h-5 mr-2"/>Scheduled Social Autopilot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">Status: <Badge>{autopilotStatus?.isRunning ? 'Running' : 'Stopped'}</Badge></div>
                {autopilotStatus?.nextScheduledJob && (
                  <div className="text-xs">Next: {new Date(autopilotStatus.nextScheduledJob).toLocaleString()}</div>
                )}
                <div className="flex space-x-2">
                  <Button onClick={() => startAutopilot.mutate()}><Play className="w-4 h-4 mr-2"/>Start</Button>
                  <Button variant="outline" onClick={() => stopAutopilot.mutate()}><Square className="w-4 h-4 mr-2"/>Stop</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Rocket className="w-5 h-5 mr-2"/>Autonomous Social Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">Status: <Badge>{autonomousStatus?.isRunning ? 'Running' : 'Stopped'}</Badge></div>
                <div className="text-xs">Published: {autonomousStatus?.totalContentPublished || 0}</div>
                <div className="flex space-x-2">
                  <Button onClick={() => startAutonomous.mutate()}><Play className="w-4 h-4 mr-2"/>Start</Button>
                  <Button variant="outline" onClick={() => stopAutonomous.mutate()}><Square className="w-4 h-4 mr-2"/>Stop</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-2"/>Autonomous Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">Status: <Badge>{updatesStatus?.isRunning ? 'Running' : 'Stopped'}</Badge></div>
                {updatesStatus?.nextRunAt && (<div className="text-xs">Next: {new Date(updatesStatus.nextRunAt).toLocaleString()}</div>)}
                <div className="flex space-x-2">
                  <Button onClick={() => startUpdates.mutate()}><Play className="w-4 h-4 mr-2"/>Start</Button>
                  <Button variant="outline" onClick={() => stopUpdates.mutate()}><Square className="w-4 h-4 mr-2"/>Stop</Button>
                  <Button variant="secondary" onClick={() => runUpdatesOnce.mutate()}>Run Once</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2"/>Security Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">Security Score: <Badge>{securityMetrics?.securityScore ?? 100}</Badge></div>
                <div className="text-xs">Active Threats: {securityMetrics?.activeThreats ?? 0}</div>
                <div className="text-xs">Total Threats: {securityMetrics?.totalThreats ?? 0}</div>
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Recent Threats</div>
                  <div className="max-h-40 overflow-auto space-y-1 text-xs">
                    {(securityThreats || []).slice(-10).map((t: any, i: number) => (
                      <div key={i} className="p-2 rounded border">
                        <div className="font-semibold">{t.type}</div>
                        <div>severity: {t.severity} • at {new Date(t.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}



