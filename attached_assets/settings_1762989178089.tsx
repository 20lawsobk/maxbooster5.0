import { MobileLayout } from "@/components/layout/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformConnections } from "@/components/settings/platform-connections";
import { Settings as SettingsIcon, Link, Bell, Palette, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/layout/theme-provider";
import type { Platform } from "@shared/schema";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, isConnected }: { id: string; isConnected: boolean }) => {
      const response = await apiRequest("PATCH", `/api/platforms/${id}`, { isConnected });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Platform connection updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update platform connection",
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platform: Platform) => {
    updatePlatformMutation.mutate({
      id: platform.id,
      isConnected: !platform.isConnected
    });
  };

  return (
    <MobileLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings, platform connections, and preferences
            </p>
          </div>

          <Tabs defaultValue="connections" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connections">Platform Connections</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="connections">
              <PlatformConnections />
            </TabsContent>

            <TabsContent value="account">
              <div className="space-y-6">
                {/* Appearance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Appearance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
                        <div className="text-sm text-muted-foreground">
                          Toggle between light and dark themes
                        </div>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={theme === "dark"}
                        onCheckedChange={toggleTheme}
                        data-testid="switch-dark-mode"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* AI Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <SettingsIcon className="h-5 w-5" />
                      <span>AI Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-optimize" className="text-base font-medium">
                          Auto-optimize Content
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically optimize content for each platform
                        </div>
                      </div>
                      <Switch 
                        id="auto-optimize" 
                        defaultChecked 
                        data-testid="switch-auto-optimize"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-hashtags" className="text-base font-medium">
                          Auto-generate Hashtags
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically suggest relevant hashtags
                        </div>
                      </div>
                      <Switch 
                        id="auto-hashtags" 
                        defaultChecked 
                        data-testid="switch-auto-hashtags"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Publishing Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when content is published automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Performance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts about content performance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Connection Issues</Label>
                      <p className="text-sm text-muted-foreground">Get notified about platform connection problems</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Session Management</Label>
                        <p className="text-sm text-muted-foreground">View and manage active sessions</p>
                      </div>
                      <Button variant="outline">Manage Sessions</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">API Access</Label>
                        <p className="text-sm text-muted-foreground">Generate API keys for third-party integrations</p>
                      </div>
                      <Button variant="outline">Generate Key</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Disconnect All Platforms</Label>
                        <p className="text-sm text-muted-foreground">Remove all platform connections and stop autonomous posting</p>
                      </div>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        Disconnect All
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Delete Account</Label>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </Button>
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