import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AutonomousDashboard } from '@/components/autonomous/autonomous-dashboard';
import {
  Target,
  DollarSign,
  TrendingUp,
  Users,
  Play,
  Eye,
  MousePointerClick,
  BarChart3,
  Plus,
  Settings,
  MapPin,
  Calendar,
  Music,
  Headphones,
  Radio,
  Tv,
  Zap,
  Shield,
  Brain,
  Rocket,
  Crown,
  Star,
  Award,
  Sparkles,
  Activity,
  Globe,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Megaphone,
  Filter,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Clock,
  Upload,
  X,
  Bot,
  RefreshCw,
  MessageCircle
} from 'lucide-react';

interface AdCampaign {
  id: string;
  name: string;
  objective: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  platforms: string[];
  connectedPlatforms?: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
    threads: string;
    googleBusiness: string;
  };
  personalAdNetwork?: {
    connectedAccounts: number;
    totalPlatforms: number;
    networkStrength: number;
    personalizedReach: string;
    organicAmplification: string;
  };
  aiOptimizations?: {
    performanceBoost: string;
    costReduction: string;
    viralityScore: number;
    algorithmicAdvantage: string;
    realTimeOptimization: boolean;
  };
}

interface SocialConnections {
  [platform: string]: {
    connected: boolean;
    username?: string;
    followers?: number;
  };
}

interface AutopilotStatus {
  isRunning: boolean;
  status: {
    activeCampaigns: number;
    performanceMetrics?: {
      conversions: number;
      reach: number;
      engagement: number;
      revenue: number;
    };
    recentActions?: Array<{
      action: string;
      campaign: string;
      status: string;
      timestamp?: string;
    }>;
  };
  config: {
    campaignMode?: string;
    objective?: string;
    budgetOptimization?: boolean;
    targetAudience?: {
      ageMin: number;
      ageMax: number;
      interests: string[];
      locations: string[];
    };
    optimizationSettings?: {
      autoAdjustBudget: boolean;
      viralOptimization: boolean;
      algorithmicTargeting: boolean;
    };
  };
}

interface AIInsights {
  recommendations: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
  }>;
  performancePredictions?: {
    expectedReach: number;
    expectedEngagement: number;
    viralPotential: number;
  };
  audienceInsights?: {
    topInterests: string[];
    bestPostingTimes: string[];
    optimalPlatforms: string[];
  };
}

export default function Advertisement() {
  const { user, isLoading: authLoading } = useRequireSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    objective: '',
    budget: 100,
    duration: 7,
    targetAudience: {
      ageMin: 18,
      ageMax: 65,
      interests: [] as string[],
      locations: [] as string[],
      platforms: [] as string[]
    }
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch ad campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<AdCampaign[]>({
    queryKey: ['/api/advertising/campaigns'],
    enabled: !!user,
  });

  // Fetch AI insights
  const { data: aiInsights, isLoading: insightsLoading } = useQuery<AIInsights>({
    queryKey: ['/api/advertising/ai-insights'],
    enabled: !!user,
  });

  // Fetch social media connection status
  const { data: socialConnections, isLoading: connectionsLoading } = useQuery<SocialConnections>({
    queryKey: ['/api/social/platform-status'],
    enabled: !!user,
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiRequest('POST', '/api/advertising/upload-image', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Image Uploaded!',
        description: 'Your campaign image has been uploaded successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest('POST', '/api/advertising/campaigns', campaignData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Campaign Created',
        description: 'Your revolutionary AI advertising campaign has been activated successfully.',
      });
      setIsCreateCampaignOpen(false);
      setCampaignForm({
        name: '',
        objective: '',
        budget: 100,
        duration: 7,
        targetAudience: {
          ageMin: 18,
          ageMax: 65,
          interests: [],
          locations: [],
          platforms: []
        }
      });
      setUploadedImage(null);
      setImagePreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['/api/advertising/campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Create Campaign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Autonomous Autopilot Queries and Mutations
  const { data: autopilotStatus, isLoading: autopilotLoading } = useQuery<AutopilotStatus>({
    queryKey: ['/api/autopilot/status'],
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const configureAutopilotMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/autopilot/configure', config);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Autopilot Configured',
        description: 'Your autonomous ad autopilot settings have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autopilot/status'] });
    },
  });

  const startAutopilotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/autopilot/start', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Autopilot Started',
        description: 'Autonomous advertising autopilot is now managing your ad campaigns.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autopilot/status'] });
    },
  });

  const stopAutopilotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/autopilot/stop', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Autopilot Stopped',
        description: 'Autonomous advertising autopilot has been stopped.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autopilot/status'] });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const adObjectives = [
    { value: 'awareness', label: 'Brand Awareness', icon: Eye },
    { value: 'traffic', label: 'Drive Traffic', icon: MousePointerClick },
    { value: 'engagement', label: 'Increase Engagement', icon: Users },
    { value: 'conversions', label: 'Get More Streams', icon: Play },
    { value: 'followers', label: 'Grow Following', icon: TrendingUp }
  ];

  const platforms = [
    { value: 'spotify', label: 'Spotify Personal Network', icon: Music, description: 'Use your Spotify for Artists profile for organic promotion' },
    { value: 'youtube', label: 'YouTube Channel Network', icon: Tv, description: 'Leverage your YouTube channel for cross-promotion' },
    { value: 'instagram', label: 'Instagram Profile Power', icon: Users, description: 'Transform your Instagram into a promotional hub' },
    { value: 'facebook', label: 'Facebook Profile Amplification', icon: Users, description: 'Use your Facebook profile and connections' },
    { value: 'tiktok', label: 'TikTok Personal Brand', icon: Play, description: 'Amplify through your TikTok presence' },
    { value: 'twitter', label: 'Twitter Personal Network', icon: Radio, description: 'Leverage your Twitter following and engagement' }
  ];

  const musicInterests = [
    'Hip Hop', 'Pop', 'R&B', 'Rock', 'Electronic', 'Country',
    'Jazz', 'Classical', 'Reggae', 'Alternative', 'Indie', 'Folk'
  ];

  const handleCreateCampaign = () => {
    if (!campaignForm.name.trim()) {
      toast({
        title: 'Campaign Name Required',
        description: 'Please enter a name for your campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (!campaignForm.objective) {
      toast({
        title: 'Objective Required',
        description: 'Please select a campaign objective.',
        variant: 'destructive',
      });
      return;
    }

    createCampaignMutation.mutate(campaignForm);
  };

  const totalSpent = campaigns.reduce((acc: number, campaign: AdCampaign) => acc + campaign.spent, 0);
  const totalImpressions = campaigns.reduce((acc: number, campaign: AdCampaign) => acc + campaign.impressions, 0);
  const totalClicks = campaigns.reduce((acc: number, campaign: AdCampaign) => acc + campaign.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <AppLayout>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  🚀 Revolutionary AI Advertising
                </h1>
                <p className="text-muted-foreground">
                  Eliminate ad spend with AI-powered personal network domination
                </p>
              </div>
              <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    <Rocket className="w-4 h-4 mr-2" />
                    Activate AI Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-600" />
                      Create Revolutionary AI Campaign
                    </DialogTitle>
                    <DialogDescription>
                      Set up an organic campaign that completely bypasses all native advertising platforms
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        placeholder="e.g., Summer Single AI Domination"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Campaign Objective</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {adObjectives.map(({ value, label, icon: Icon }) => (
                          <div
                            key={value}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              campaignForm.objective === value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-border hover:border-blue-400'
                            }`}
                            onClick={() => setCampaignForm(prev => ({ ...prev, objective: value }))}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Traditional Budget (Eliminated by AI)</Label>
                        <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 line-through opacity-50">
                              ${campaignForm.budget}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              $0 (AI Elimination)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Zero ad spend through AI-optimized organic posting
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (Days)</Label>
                        <div className="space-y-3">
                          <Slider
                            value={[campaignForm.duration]}
                            onValueChange={(value) => setCampaignForm(prev => ({ ...prev, duration: value[0] }))}
                            max={30}
                            min={1}
                            step={1}
                          />
                          <div className="text-center font-semibold">
                            {campaignForm.duration} days
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Personal Ad Network Platforms</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Select your connected social media profiles to use as personal advertising channels
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {platforms.map(({ value, label, icon: Icon, description }) => (
                          <div
                            key={value}
                            className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                              campaignForm.targetAudience.platforms.includes(value)
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                : 'border-border hover:border-green-400'
                            }`}
                            onClick={() => {
                              setCampaignForm(prev => ({
                                ...prev,
                                targetAudience: {
                                  ...prev.targetAudience,
                                  platforms: prev.targetAudience.platforms.includes(value)
                                    ? prev.targetAudience.platforms.filter(p => p !== value)
                                    : [...prev.targetAudience.platforms, value]
                                }
                              }));
                            }}
                          >
                            <Icon className="w-5 h-5 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">{description}</div>
                            </div>
                            {campaignForm.targetAudience.platforms.includes(value) && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Target Age Range</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Min Age: {campaignForm.targetAudience.ageMin}</Label>
                          <Slider
                            value={[campaignForm.targetAudience.ageMin]}
                            onValueChange={(value) => setCampaignForm(prev => ({
                              ...prev,
                              targetAudience: { ...prev.targetAudience, ageMin: value[0] }
                            }))}
                            max={65}
                            min={13}
                            step={1}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Max Age: {campaignForm.targetAudience.ageMax}</Label>
                          <Slider
                            value={[campaignForm.targetAudience.ageMax]}
                            onValueChange={(value) => setCampaignForm(prev => ({
                              ...prev,
                              targetAudience: { ...prev.targetAudience, ageMax: value[0] }
                            }))}
                            max={65}
                            min={13}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Music Interests</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {musicInterests.map((interest) => (
                          <div
                            key={interest}
                            className={`p-2 text-center rounded-lg border cursor-pointer transition-colors text-sm ${
                              campaignForm.targetAudience.interests.includes(interest)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-border hover:border-blue-400'
                            }`}
                            onClick={() => {
                              setCampaignForm(prev => ({
                                ...prev,
                                targetAudience: {
                                  ...prev.targetAudience,
                                  interests: prev.targetAudience.interests.includes(interest)
                                    ? prev.targetAudience.interests.filter(i => i !== interest)
                                    : [...prev.targetAudience.interests, interest]
                                }
                              }));
                            }}
                          >
                            {interest}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Campaign Image (Optional)</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedImage(file);
                            const previewUrl = URL.createObjectURL(file);
                            setImagePreviewUrl(previewUrl);
                            uploadImageMutation.mutate(file);
                          }
                        }}
                        data-testid="input-file-upload"
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadImageMutation.isPending}
                          data-testid="button-upload-image"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Campaign Image'}
                        </Button>
                        {uploadedImage && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedImage(null);
                              setImagePreviewUrl(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            data-testid="button-remove-image"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                      {imagePreviewUrl && (
                        <div className="mt-2">
                          <img src={imagePreviewUrl} alt="Campaign preview" className="max-h-40 rounded-lg" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateCampaignOpen(false)}
                        data-testid="button-cancel-campaign"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCampaign}
                        disabled={createCampaignMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        data-testid="button-create-campaign"
                      >
                        {createCampaignMutation.isPending ? 'Activating AI...' : 'Activate AI Domination'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Revolutionary AI Features Banner */}
            <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    🚀 Personal Ad Network System
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Transform your connected social media profiles into a powerful personal advertising network for organic content distribution
                  </p>
                  
                  {/* Personal Ad Network Status */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Your Personal Ad Network</h3>
                    </div>
                    
                    {socialConnections && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(socialConnections).map(([platform, status]) => (
                          <div key={platform} className={`p-3 rounded-lg border text-center ${
                            status.connected ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-900'
                          }`}>
                            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${status.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div className="text-xs font-medium capitalize">{platform}</div>
                            <div className={`text-xs ${status.connected ? 'text-green-600' : 'text-gray-500'}`}>
                              {status.connected ? 'Active' : 'Not Connected'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {connectionsLoading && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="p-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900 animate-pulse">
                            <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-gray-400" />
                            <div className="h-3 bg-gray-300 rounded mb-1" />
                            <div className="h-2 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">100%</div>
                      <div className="text-sm">Cost Elimination</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {socialConnections ? Object.values(socialConnections).filter(s => s.connected).length : 0}
                      </div>
                      <div className="text-sm">Connected Profiles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">15%</div>
                      <div className="text-sm">Viral Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">8</div>
                      <div className="text-sm">Available Platforms</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-revolution">AI Revolution</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="audiences">Audiences</TabsTrigger>
                <TabsTrigger value="autopilot">
                  <Bot className="w-4 h-4 mr-1 inline" />
                  Autopilot
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-revolution" className="space-y-6">
                {/* Revolutionary Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span>Complete Native Platform Replacement</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <p className="text-muted-foreground">Organic posting to your social accounts - no paid ads required</p>
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                          100% Cost Reduction - $0 Ad Spend
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">AI transforms your personal profiles into powerful advertising networks</p>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10" />
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <span>Organic Reach Domination</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <p className="text-muted-foreground">Dominate organic reach across all platforms simultaneously</p>
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                          Powerful Organic Reach
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">Enhanced organic reach through AI-optimized content</p>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10" />
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                        <span>Viral Content Engineering</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <p className="text-muted-foreground">AI creates viral content that spreads organically across all platforms</p>
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                          15% Viral Success Rate vs 0.03% Industry Average
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">500x better viral potential through AI optimization</p>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10" />
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                        <span>Platform Algorithm Hijacking</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <p className="text-muted-foreground">Hijack recommendation algorithms for maximum visibility</p>
                      <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                          Complete Algorithmic Dominance
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">AI exploits platform algorithms for unlimited organic reach</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Replacement Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Native Platform Replacement Status
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      AI-enhanced organic marketing tools
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { platform: 'Facebook Ads', status: 'Replaced by Organic Group Infiltration + Viral Seeding' },
                        { platform: 'Google Ads', status: 'Replaced by SEO Domination + YouTube Algorithm Exploitation' },
                        { platform: 'TikTok Ads', status: 'Replaced by Trend Prediction + Algorithm Gaming' },
                        { platform: 'Instagram Ads', status: 'Replaced by Influencer Network + Story Cascade' },
                        { platform: 'YouTube Ads', status: 'Replaced by Playlist Placement + Recommendation Hijacking' },
                        { platform: 'Spotify Ads', status: 'Replaced by Playlist Infiltration + Algorithm Optimization' },
                        { platform: 'Twitter Ads', status: 'Replaced by Trend Hijacking + Community Building' },
                        { platform: 'Snapchat Ads', status: 'Replaced by Story Chain + Discovery Optimization' }
                      ].map((item, index) => (
                        <div key={index} className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
                          <div className="font-semibold text-lg flex items-center">
                            <span className="line-through text-red-500 mr-2">{item.platform}</span>
                            <Badge className="bg-green-100 text-green-800 text-xs">REPLACED</Badge>
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">{item.status}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revolutionary Capabilities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-purple-600" />
                      Revolutionary Replacement Capabilities
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI tools for organic social media marketing
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Zero-Cost Viral Amplification',
                        'Cross-Platform Algorithm Exploitation',
                        'Personal Network Domination',
                        'Organic Reach Multiplication',
                        'Viral Content Engineering',
                        'Trend Prediction & Hijacking',
                        'Community Building Automation',
                        'Influencer Network Creation',
                        'SEO Domination',
                        'Playlist Infiltration',
                        'Story Chain Amplification',
                        'Recommendation Hijacking'
                      ].map((capability, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                          <span className="text-sm font-medium">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Total Spent</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold text-green-600">$0</div>
                        <div className="text-sm text-muted-foreground">AI eliminates all costs</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Impressions</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
                        <div className="text-sm text-green-600">+1000% vs traditional ads</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <MousePointerClick className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">Clicks</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
                        <div className="text-sm text-green-600">+800% vs traditional ads</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">Viral Rate</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">15%</div>
                        <div className="text-sm text-green-600">500x industry average</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Rocket className="w-5 h-5 mr-2 text-blue-600" />
                      AI Campaign Templates
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Get started with pre-configured AI domination templates
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <Music className="w-6 h-6 text-blue-500" />
                          <h4 className="font-semibold">Viral Release Domination</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Dominate all platforms with AI-powered viral release strategy
                        </p>
                        <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                          Activate AI Domination
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:border-green-500 transition-colors cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <Users className="w-6 h-6 text-green-500" />
                          <h4 className="font-semibold">Fan Base Explosion</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Explode your fan base with AI-powered community building
                        </p>
                        <Button variant="outline" size="sm" className="w-full border-green-200 text-green-600 hover:bg-green-50">
                          Activate AI Growth
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <Play className="w-6 h-6 text-purple-500" />
                          <h4 className="font-semibold">Stream Domination</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Dominate streaming platforms with AI algorithm exploitation
                        </p>
                        <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                          Activate AI Streaming
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campaigns" className="space-y-6">
                <div className="space-y-4">
                  {campaignsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                          <div className="grid grid-cols-4 gap-4">
                            <div className="h-6 bg-muted rounded" />
                            <div className="h-6 bg-muted rounded" />
                            <div className="h-6 bg-muted rounded" />
                            <div className="h-6 bg-muted rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : campaigns.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Rocket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No AI campaigns yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Create your first revolutionary AI advertising campaign to eliminate ad spend
                        </p>
                        <Button 
                          onClick={() => setIsCreateCampaignOpen(true)}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Activate AI Domination
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    campaigns.map((campaign: AdCampaign) => (
                      <Card key={campaign.id} className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{campaign.name}</h3>
                              <p className="text-sm text-muted-foreground">{campaign.objective}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              AI Enhanced
                            </Badge>
                          </div>
                          
                          {/* AI Optimization Badge */}
                          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-sm font-semibold text-green-800 dark:text-green-200">AI DOMINATION ACTIVE</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Performance:</span>
                                <div className="font-semibold text-green-600">1000% Better</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Cost:</span>
                                <div className="font-semibold text-green-600">$0 (Eliminated)</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Viral Score:</span>
                                <div className="font-semibold text-purple-600">15%</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">AI Status:</span>
                                <div className="font-semibold text-blue-600">Dominating</div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Budget</div>
                              <div className="font-semibold text-green-600">$0 (AI Eliminated)</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Spent</div>
                              <div className="font-semibold text-green-600">$0 (Zero Cost)</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Impressions</div>
                              <div className="font-semibold">{campaign.impressions.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Clicks</div>
                              <div className="font-semibold">{campaign.clicks.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>AI Domination Progress</span>
                              <span className="text-green-600">100% (Complete)</span>
                            </div>
                            <Progress value={100} className="h-2" />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              View AI Analytics
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit Campaign
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                            >
                              Stop AI
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      AI Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <h3 className="text-lg font-semibold mb-2">AI Analytics Dashboard</h3>
                        <p className="text-sm">Real-time AI performance metrics will be available once you activate your first campaign</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audiences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-purple-600" />
                      AI Target Audiences
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and manage AI-optimized audiences for maximum viral potential
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No AI audiences yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Create AI-optimized audiences based on viral potential and engagement patterns
                      </p>
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                        <Brain className="w-4 h-4 mr-2" />
                        Create AI Audience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Autopilot Tab */}
              <TabsContent value="autopilot" className="space-y-6">
                <AutonomousDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </AppLayout>
  );
}
