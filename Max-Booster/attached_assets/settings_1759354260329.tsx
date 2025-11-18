import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Lock,
  Bell,
  Palette,
  Music,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: '',
    website: '',
    location: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    newCollaborations: true,
    salesAlerts: true,
    royaltyUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultBPM: 120,
    defaultKey: 'C',
    autoSave: true,
    betaFeatures: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
    // TODO: Save notification settings to backend
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // TODO: Save preferences to backend
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2" data-testid="text-settings-title">
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" data-testid="tab-account">
            <Lock className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" data-testid="tab-preferences">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" data-testid="button-upload-avatar">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="button-remove-avatar">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your music..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    data-testid="textarea-bio"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={profileData.website}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, website: e.target.value }))
                      }
                      data-testid="input-website"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      data-testid="input-location"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        data-testid="input-current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" data-testid="input-new-password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button data-testid="button-change-password">Change Password</Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app for additional security
                    </p>
                  </div>
                  <Button variant="outline" data-testid="button-setup-2fa">
                    Setup
                  </Button>
                </div>
              </div>

              {/* Connected Accounts */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm font-bold">G</span>
                      </div>
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-muted-foreground">Connected for login</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid="button-disconnect-google">
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    {
                      key: 'emailNotifications',
                      label: 'Email Notifications',
                      description: 'Receive notifications via email',
                    },
                    {
                      key: 'weeklyReports',
                      label: 'Weekly Reports',
                      description: 'Get weekly performance summaries',
                    },
                    {
                      key: 'royaltyUpdates',
                      label: 'Royalty Updates',
                      description: 'Notifications about new royalty payments',
                    },
                    {
                      key: 'salesAlerts',
                      label: 'Sales Alerts',
                      description: 'Instant notifications for beat sales',
                    },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={
                          notificationSettings[setting.key as keyof typeof notificationSettings]
                        }
                        onCheckedChange={(checked) =>
                          handleNotificationChange(setting.key, checked)
                        }
                        data-testid={`switch-${setting.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  {[
                    {
                      key: 'pushNotifications',
                      label: 'Push Notifications',
                      description: 'Receive push notifications on your devices',
                    },
                    {
                      key: 'newCollaborations',
                      label: 'Collaboration Requests',
                      description: 'Notifications for new collaboration invites',
                    },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={
                          notificationSettings[setting.key as keyof typeof notificationSettings]
                        }
                        onCheckedChange={(checked) =>
                          handleNotificationChange(setting.key, checked)
                        }
                        data-testid={`switch-${setting.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Studio Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => handlePreferenceChange('theme', value)}
                  >
                    <SelectTrigger className="w-32" data-testid="select-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Studio Defaults */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Studio Defaults</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Default BPM</p>
                      <p className="text-sm text-muted-foreground">
                        Default tempo for new projects
                      </p>
                    </div>
                    <Input
                      type="number"
                      className="w-24"
                      value={preferences.defaultBPM}
                      onChange={(e) =>
                        handlePreferenceChange('defaultBPM', parseInt(e.target.value))
                      }
                      data-testid="input-default-bpm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Default Key</p>
                      <p className="text-sm text-muted-foreground">
                        Default key signature for new projects
                      </p>
                    </div>
                    <Select
                      value={preferences.defaultKey}
                      onValueChange={(value) => handlePreferenceChange('defaultKey', value)}
                    >
                      <SelectTrigger className="w-32" data-testid="select-default-key">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">C Major</SelectItem>
                        <SelectItem value="G">G Major</SelectItem>
                        <SelectItem value="D">D Major</SelectItem>
                        <SelectItem value="A">A Major</SelectItem>
                        <SelectItem value="E">E Major</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Advanced</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-save Projects</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your work every few minutes
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
                      data-testid="switch-auto-save"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Beta Features</p>
                      <p className="text-sm text-muted-foreground">
                        Enable experimental features and early access
                      </p>
                    </div>
                    <Switch
                      checked={preferences.betaFeatures}
                      onCheckedChange={(checked) => handlePreferenceChange('betaFeatures', checked)}
                      data-testid="switch-beta-features"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">Max Booster Pro - Monthly</p>
                      <p className="text-sm text-muted-foreground">Full access to all features</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$49</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" data-testid="button-change-plan">
                      Change Plan
                    </Button>
                    <Button variant="ghost" data-testid="button-cancel-subscription">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 1234</p>
                        <p className="text-sm text-muted-foreground">Expires 12/27</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid="button-update-payment">
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Dec 1, 2024', amount: '$49.00', status: 'Paid', invoice: 'INV-001' },
                    { date: 'Nov 1, 2024', amount: '$49.00', status: 'Paid', invoice: 'INV-002' },
                    { date: 'Oct 1, 2024', amount: '$49.00', status: 'Paid', invoice: 'INV-003' },
                  ].map((billing, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded"
                      data-testid={`billing-${index}`}
                    >
                      <div>
                        <p className="font-medium">{billing.date}</p>
                        <p className="text-sm text-muted-foreground">{billing.invoice}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{billing.amount}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-download-invoice-${index}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Login Activity</h3>
                <div className="space-y-3">
                  {[
                    {
                      device: 'Chrome on Mac',
                      location: 'New York, US',
                      time: '2 hours ago',
                      current: true,
                    },
                    {
                      device: 'Safari on iPhone',
                      location: 'New York, US',
                      time: '1 day ago',
                      current: false,
                    },
                    {
                      device: 'Chrome on Windows',
                      location: 'Los Angeles, US',
                      time: '3 days ago',
                      current: false,
                    },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded"
                      data-testid={`session-${index}`}
                    >
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.current && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                        {!session.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-terminate-session-${index}`}
                          >
                            Terminate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Export */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <p className="font-medium mb-2">Export Your Data</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a copy of all your data including projects, tracks, and analytics.
                    </p>
                    <Button variant="outline" data-testid="button-export-data">
                      <Download className="w-4 h-4 mr-2" />
                      Request Data Export
                    </Button>
                  </div>

                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="font-medium mb-2 text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be
                      undone.
                    </p>
                    <Button variant="destructive" data-testid="button-delete-account">
                      <Trash2 className="w-4 h-4 mr-2" />
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
