import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Settings, Bell, Shield, Trash2, Download, Upload, Link as LinkIcon } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Get user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  // Get notification settings
  const { data: notificationSettings } = useQuery({
    queryKey: ["/api/notifications/settings"],
    enabled: !!user,
  });

  // Get social connections
  const { data: socialConnections } = useQuery({
    queryKey: ["/api/social/connections"],
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return await apiRequest("PUT", "/api/notifications/settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your notification settings have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  // Connect social platform mutation
  const connectPlatformMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await apiRequest("POST", `/api/social/connect/${platform}`);
      const data = await response.json();
      // Redirect to OAuth URL
      window.location.href = data.authUrl;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to platform",
        variant: "destructive",
      });
    },
  });

  // Disconnect social platform mutation
  const disconnectPlatformMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      return await apiRequest("DELETE", `/api/social/connections/${connectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections"] });
      toast({
        title: "Platform Disconnected",
        description: "Social platform has been disconnected from your account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect platform",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/profile/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `social-autopilot-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" data-testid="profile-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          data-testid="button-edit-profile"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social">Social Accounts</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">Privacy & Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Manage your personal details and profile settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.profileImageUrl || user.profileImageUrl} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0] || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" data-testid="button-change-photo">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={user.firstName || ""}
                    disabled={!isEditing}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={user.lastName || ""}
                    disabled={!isEditing}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  data-testid="input-email"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  defaultValue={profile?.bio || ""}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                  data-testid="textarea-bio"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    defaultValue={profile?.website || ""}
                    disabled={!isEditing}
                    data-testid="input-website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    defaultValue={profile?.location || ""}
                    disabled={!isEditing}
                    data-testid="input-location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  disabled
                  data-testid="input-timezone"
                />
                <p className="text-sm text-muted-foreground">
                  Automatically detected from your browser.
                </p>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Collect form data and update
                      const formData = new FormData();
                      const form = document.querySelector('form') as HTMLFormElement;
                      // Implementation would collect form data
                      updateProfileMutation.mutate({
                        firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
                        lastName: (document.getElementById('lastName') as HTMLInputElement)?.value,
                        bio: (document.getElementById('bio') as HTMLTextAreaElement)?.value,
                        website: (document.getElementById('website') as HTMLInputElement)?.value,
                        location: (document.getElementById('location') as HTMLInputElement)?.value,
                      });
                    }}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Connected Social Accounts
              </CardTitle>
              <CardDescription>
                Manage your social media platform connections for publishing content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok"].map((platform) => {
                  const connection = socialConnections?.find((c: any) => c.platform === platform);
                  const isConnected = !!connection;

                  return (
                    <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="font-semibold text-sm">{platform[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{platform}</h3>
                          {isConnected ? (
                            <p className="text-sm text-muted-foreground">
                              Connected as @{connection.username}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <Badge variant="secondary" data-testid={`badge-${platform}-connected`}>
                            Connected
                          </Badge>
                        )}
                        {isConnected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectPlatformMutation.mutate(connection.id)}
                            disabled={disconnectPlatformMutation.isPending}
                            data-testid={`button-disconnect-${platform}`}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => connectPlatformMutation.mutate(platform)}
                            disabled={connectPlatformMutation.isPending}
                            data-testid={`button-connect-${platform}`}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings?.pushNotifications !== false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({
                        ...notificationSettings,
                        pushNotifications: checked,
                      });
                    }}
                    data-testid="switch-push-notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings?.emailNotifications !== false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({
                        ...notificationSettings,
                        emailNotifications: checked,
                      });
                    }}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  
                  {[
                    { key: "contentPublished", label: "Content Published", description: "When your content is successfully published" },
                    { key: "engagementMilestones", label: "Engagement Milestones", description: "When your content reaches engagement goals" },
                    { key: "performanceAlerts", label: "Performance Alerts", description: "When there are significant changes in performance" },
                    { key: "weeklyReports", label: "Weekly Reports", description: "Weekly summary of your social media performance" },
                    { key: "systemUpdates", label: "System Updates", description: "Important updates and new features" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={item.key}>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        id={item.key}
                        checked={notificationSettings?.[item.key] !== false}
                        onCheckedChange={(checked) => {
                          updateNotificationsMutation.mutate({
                            ...notificationSettings,
                            [item.key]: checked,
                          });
                        }}
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data Management
              </CardTitle>
              <CardDescription>
                Control your data and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Member since:</span>
                      <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last login:</span>
                      <p>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Unknown"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account type:</span>
                      <p className="capitalize">{user.role || "user"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subscription:</span>
                      <p>{user.stripeSubscriptionId ? "Premium" : "Free"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Data Export & Management</h4>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Export Your Data</h5>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of all your data including content, analytics, and settings.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => exportDataMutation.mutate()}
                      disabled={exportDataMutation.isPending}
                      data-testid="button-export-data"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {exportDataMutation.isPending ? "Exporting..." : "Export Data"}
                    </Button>
                  </div>

                  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <h5 className="font-medium text-destructive mb-2">Danger Zone</h5>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      data-testid="button-delete-account"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}