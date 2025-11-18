import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
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

export default function Advertising() {
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
      platforms: [] as string[],
    },
  });

  // Fetch ad campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/advertising/campaigns'],
    enabled: !!user,
  });

  // Fetch AI insights
  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/advertising/ai-insights'],
    enabled: !!user,
  });

  // Fetch social media connection status
  const { data: socialConnections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/social/platform-status'],
    enabled: !!user,
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
        description: 'Your advertising campaign has been created successfully.',
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
          platforms: [],
        },
      });
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
    { value: 'followers', label: 'Grow Following', icon: TrendingUp },
  ];

  const platforms = [
    {
      value: 'spotify',
      label: 'Spotify Personal Network',
      icon: Music,
      description: 'Use your Spotify for Artists profile for organic promotion',
    },
    {
      value: 'youtube',
      label: 'YouTube Channel Network',
      icon: Tv,
      description: 'Leverage your YouTube channel for cross-promotion',
    },
    {
      value: 'instagram',
      label: 'Instagram Profile Power',
      icon: Users,
      description: 'Transform your Instagram into a promotional hub',
    },
    {
      value: 'facebook',
      label: 'Facebook Profile Amplification',
      icon: Users,
      description: 'Use your Facebook profile and connections',
    },
    {
      value: 'tiktok',
      label: 'TikTok Personal Brand',
      icon: Play,
      description: 'Amplify through your TikTok presence',
    },
    {
      value: 'twitter',
      label: 'Twitter Personal Network',
      icon: Radio,
      description: 'Leverage your Twitter following and engagement',
    },
  ];

  const musicInterests = [
    'Hip Hop',
    'Pop',
    'R&B',
    'Rock',
    'Electronic',
    'Country',
    'Jazz',
    'Classical',
    'Reggae',
    'Alternative',
    'Indie',
    'Folk',
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

  const totalSpent = campaigns.reduce(
    (acc: number, campaign: AdCampaign) => acc + campaign.spent,
    0
  );
  const totalImpressions = campaigns.reduce(
    (acc: number, campaign: AdCampaign) => acc + campaign.impressions,
    0
  );
  const totalClicks = campaigns.reduce(
    (acc: number, campaign: AdCampaign) => acc + campaign.clicks,
    0
  );
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Music Advertising</h1>
                <p className="text-muted-foreground">
                  Promote your music and grow your fanbase with targeted ads
                </p>
              </div>
              <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-bg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create AI-Powered Campaign</DialogTitle>
                    <DialogDescription>
                      Set up an organic campaign that bypasses all native advertising platforms
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        placeholder="e.g., Summer Single Promotion"
                        value={campaignForm.name}
                        onChange={(e) =>
                          setCampaignForm((prev) => ({ ...prev, name: e.target.value }))
                        }
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
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() =>
                              setCampaignForm((prev) => ({ ...prev, objective: value }))
                            }
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Traditional Budget (Replaced by AI)</Label>
                        <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 line-through opacity-50">
                              ${campaignForm.budget}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              $0 (AI Replacement)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              AI eliminates all advertising costs through organic domination
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (Days)</Label>
                        <div className="space-y-3">
                          <Slider
                            value={[campaignForm.duration]}
                            onValueChange={(value) =>
                              setCampaignForm((prev) => ({ ...prev, duration: value[0] }))
                            }
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
                        Select your connected social media profiles to use as personal advertising
                        channels
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
                              setCampaignForm((prev) => ({
                                ...prev,
                                targetAudience: {
                                  ...prev.targetAudience,
                                  platforms: prev.targetAudience.platforms.includes(value)
                                    ? prev.targetAudience.platforms.filter((p) => p !== value)
                                    : [...prev.targetAudience.platforms, value],
                                },
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
                          <Label className="text-sm">
                            Min Age: {campaignForm.targetAudience.ageMin}
                          </Label>
                          <Slider
                            value={[campaignForm.targetAudience.ageMin]}
                            onValueChange={(value) =>
                              setCampaignForm((prev) => ({
                                ...prev,
                                targetAudience: { ...prev.targetAudience, ageMin: value[0] },
                              }))
                            }
                            max={65}
                            min={13}
                            step={1}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            Max Age: {campaignForm.targetAudience.ageMax}
                          </Label>
                          <Slider
                            value={[campaignForm.targetAudience.ageMax]}
                            onValueChange={(value) =>
                              setCampaignForm((prev) => ({
                                ...prev,
                                targetAudience: { ...prev.targetAudience, ageMax: value[0] },
                              }))
                            }
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
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setCampaignForm((prev) => ({
                                ...prev,
                                targetAudience: {
                                  ...prev.targetAudience,
                                  interests: prev.targetAudience.interests.includes(interest)
                                    ? prev.targetAudience.interests.filter((i) => i !== interest)
                                    : [...prev.targetAudience.interests, interest],
                                },
                              }));
                            }}
                          >
                            {interest}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCampaign}
                        disabled={createCampaignMutation.isPending}
                        className="gradient-bg"
                      >
                        {createCampaignMutation.isPending
                          ? 'Activating AI...'
                          : 'Activate AI Campaign'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Revolutionary AI Features Banner */}
            {!insightsLoading && aiInsights && (
              <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold gradient-text">
                      🚀 Personal Ad Network System
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Transform your connected social media profiles into a powerful personal
                      advertising network
                    </p>

                    {/* Personal Ad Network Status */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Your Personal Ad Network</h3>
                        <Link
                          to="/social-media"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Manage Connections →
                        </Link>
                      </div>

                      {socialConnections && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(socialConnections).map(([platform, status]) => (
                            <div
                              key={platform}
                              className={`p-3 rounded-lg border text-center ${
                                status.connected
                                  ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                                  : 'border-gray-200 bg-gray-50 dark:bg-gray-900'
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full mx-auto mb-2 ${status.connected ? 'bg-green-500' : 'bg-gray-400'}`}
                              />
                              <div className="text-xs font-medium capitalize">{platform}</div>
                              <div
                                className={`text-xs ${status.connected ? 'text-green-600' : 'text-gray-500'}`}
                              >
                                {status.connected ? 'Active' : 'Not Connected'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {connectionsLoading && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900 animate-pulse"
                            >
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
                        <div className="text-sm">Cost Reduction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {socialConnections
                            ? Object.values(socialConnections).filter((s) => s.connected).length
                            : 0}
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
            )}

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Revolution</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="audiences">Audiences</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-insights" className="space-y-6">
                {!insightsLoading && aiInsights && (
                  <>
                    {/* Revolutionary Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(aiInsights.revolutionaryFeatures).map(
                        ([key, feature]: [string, any]) => (
                          <Card key={key} className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                            <CardHeader className="relative">
                              <CardTitle className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                <span>{feature.title}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="relative space-y-3">
                              <p className="text-muted-foreground">{feature.description}</p>
                              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                                <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                                  {feature.savings ||
                                    feature.improvement ||
                                    feature.viralRate ||
                                    feature.advantage}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground italic">
                                {feature.howItWorks}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>

                    {/* Platform Replacement */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Native Platform Replacement Status</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Complete replacement of all traditional advertising platforms
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(aiInsights.platformReplacement?.replacedPlatforms &&
                            Object.entries(aiInsights.platformReplacement.replacedPlatforms).map(
                              ([platform, status]) => (
                                <div
                                  key={platform}
                                  className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 p-4 rounded-lg border-l-4 border-green-500"
                                >
                                  <div className="font-semibold text-lg flex items-center">
                                    <span className="line-through text-red-500 mr-2">
                                      {platform}
                                    </span>
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      REPLACED
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                                    {status}
                                  </div>
                                </div>
                              )
                            )) || (
                            <div className="col-span-2 text-center text-muted-foreground">
                              Loading platform replacement status...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Real-time Optimizations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Real-Time AI Optimizations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Optimization Status</span>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 border-green-300"
                              >
                                Active
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Update Interval</span>
                              <span className="font-semibold">
                                {aiInsights.realTimeOptimizations.optimizationInterval}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Performance Tracking</span>
                              <span className="font-semibold">
                                {aiInsights.realTimeOptimizations.performanceTracking}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Auto Adjustments</span>
                              <span className="font-semibold">
                                {aiInsights.realTimeOptimizations.automaticAdjustments}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>ROI Guarantee</span>
                              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                {aiInsights.realTimeOptimizations.guaranteedROI}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revolutionary Capabilities */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Revolutionary Replacement Capabilities</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Advanced capabilities that make all native advertising platforms obsolete
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {aiInsights.platformReplacement?.revolutionaryCapabilities?.map(
                            (capability: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
                              >
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-sm font-medium">{capability}</span>
                              </div>
                            )
                          ) || (
                            <div className="col-span-2 text-center text-muted-foreground">
                              Loading replacement capabilities...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
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
                        <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">This month</div>
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
                        <div className="text-2xl font-bold">
                          {totalImpressions.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">+15.3% vs last month</div>
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
                        <div className="text-sm text-green-600">+8.7% vs last month</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">CTR</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">{avgCTR.toFixed(2)}%</div>
                        <div className="text-sm text-green-600">+0.3% vs last month</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Campaign Setup</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Get started with pre-configured campaign templates
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3 mb-3">
                          <Music className="w-6 h-6 text-blue-500" />
                          <h4 className="font-semibold">New Release Promotion</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Promote your latest single or album across streaming platforms
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Set Up Campaign
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3 mb-3">
                          <Users className="w-6 h-6 text-green-500" />
                          <h4 className="font-semibold">Grow Following</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Increase your social media followers and fan engagement
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Set Up Campaign
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3 mb-3">
                          <Play className="w-6 h-6 text-purple-500" />
                          <h4 className="font-semibold">Increase Streams</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drive more plays and streams on Spotify, Apple Music, and more
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Set Up Campaign
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
                        <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Create your first advertising campaign to start promoting your music
                        </p>
                        <Button
                          onClick={() => setIsCreateCampaignOpen(true)}
                          className="gradient-bg"
                        >
                          Create Your First Campaign
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    campaigns.map((campaign: AdCampaign) => (
                      <Card key={campaign.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{campaign.name}</h3>
                              <p className="text-sm text-muted-foreground">{campaign.objective}</p>
                            </div>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>

                          {/* Personal Ad Network Display */}
                          {campaign.personalAdNetwork && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                  PERSONAL AD NETWORK
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3">
                                <div>
                                  <span className="text-muted-foreground">Connected:</span>
                                  <div className="font-semibold text-blue-600">
                                    {campaign.personalAdNetwork.connectedAccounts}/
                                    {campaign.personalAdNetwork.totalPlatforms} Platforms
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Network Strength:</span>
                                  <div className="font-semibold text-green-600">
                                    {campaign.personalAdNetwork.networkStrength}%
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Cost:</span>
                                  <div className="font-semibold text-green-600">
                                    $0 (Personal Network)
                                  </div>
                                </div>
                              </div>

                              <div className="text-xs text-muted-foreground">
                                <div>{campaign.personalAdNetwork.personalizedReach}</div>
                                <div className="mt-1">
                                  {campaign.personalAdNetwork.organicAmplification}
                                </div>
                              </div>

                              {/* Connected Platforms Status */}
                              {campaign.connectedPlatforms && (
                                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                  <div className="grid grid-cols-4 gap-2">
                                    {Object.entries(campaign.connectedPlatforms).map(
                                      ([platform, status]) => (
                                        <div key={platform} className="flex items-center space-x-1">
                                          <div
                                            className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-gray-400'}`}
                                          />
                                          <span className="text-xs capitalize">{platform}</span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* AI Optimization Badge */}
                          {campaign.aiOptimizations && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                                  AI ENHANCED
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Performance:</span>
                                  <div className="font-semibold text-green-600">
                                    {campaign.aiOptimizations.performanceBoost}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Cost:</span>
                                  <div className="font-semibold text-green-600">
                                    {campaign.aiOptimizations.costReduction}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Viral Score:</span>
                                  <div className="font-semibold text-purple-600">
                                    {(campaign.aiOptimizations.viralityScore * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">AI Status:</span>
                                  <div className="font-semibold text-blue-600">Active</div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Budget</div>
                              <div className="font-semibold">
                                {campaign.budget === 0 ? (
                                  <span className="text-green-600">$0 (AI Optimized)</span>
                                ) : (
                                  `$${campaign.budget}`
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Spent</div>
                              <div className="font-semibold">
                                {campaign.spent === 0 ? (
                                  <span className="text-green-600">$0 (Zero Cost)</span>
                                ) : (
                                  `$${campaign.spent}`
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Impressions</div>
                              <div className="font-semibold">
                                {campaign.impressions.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Clicks</div>
                              <div className="font-semibold">
                                {campaign.clicks.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Used</span>
                              <span>
                                {campaign.budget === 0 ? (
                                  <span className="text-green-600">0% (AI Eliminates Spend)</span>
                                ) : (
                                  `${((campaign.spent / campaign.budget) * 100).toFixed(1)}%`
                                )}
                              </span>
                            </div>
                            <Progress
                              value={
                                campaign.budget === 0 ? 0 : (campaign.spent / campaign.budget) * 100
                              }
                              className="h-2"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button
                              variant={campaign.status === 'active' ? 'destructive' : 'default'}
                              size="sm"
                            >
                              {campaign.status === 'active' ? 'Pause' : 'Resume'}
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
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Detailed analytics will be available once you connect your advertising
                      accounts
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audiences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Target Audiences</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and manage custom audiences for your campaigns
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No custom audiences yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Create targeted audiences based on demographics, interests, and behaviors
                      </p>
                      <Button className="gradient-bg">Create Audience</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
