import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Share2,
  Plus,
  Calendar,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Eye,
  ExternalLink,
  Settings,
  RefreshCw,
  Upload,
  Image,
  Video,
  Music,
  Link,
  Hash,
  AtSign,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Brain,
  Sparkles,
  Wand2,
  Bot,
  Send,
  Edit,
  Trash2,
  Copy,
  Download,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Flag,
  Share,
  Reply,
  Retweet,
  Like,
  Comment,
  View,
  Follow,
  Unfollow,
  Bell,
  BellOff,
  Star,
  Award,
  Trophy,
  Crown,
  Flame,
  Rocket,
  Megaphone,
  Newspaper,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Headphones,
  Speaker,
  Mic2,
  Video2,
  Image2,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Folder,
  FolderOpen,
  Save,
  Download2,
  Upload2,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryHigh,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  Power,
  PowerOff,
  Wifi2,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  BluetoothDisabled,
  Airplay,
  Cast,
  Chromecast,
  AppleTv,
  Roku,
  FireTv,
  AndroidTv,
  SmartTv,
  Tv2,
  Radio2,
  Podcast,
  Music2,
  Headphones2,
  Speaker2,
  Volume1,
  Volume3,
  Volume4,
  Volume5,
  Volume6,
  Volume7,
  Volume8,
  Volume9,
  Volume10,
  Volume11,
  Volume12,
  Volume13,
  Volume14,
  Volume15,
  Volume16,
  Volume17,
  Volume18,
  Volume19,
  Volume20,
  Volume21,
  Volume22,
  Volume23,
  Volume24,
  Volume25,
  Volume26,
  Volume27,
  Volume28,
  Volume29,
  Volume30,
  Volume31,
  Volume32,
  Volume33,
  Volume34,
  Volume35,
  Volume36,
  Volume37,
  Volume38,
  Volume39,
  Volume40,
  Volume41,
  Volume42,
  Volume43,
  Volume44,
  Volume45,
  Volume46,
  Volume47,
  Volume48,
  Volume49,
  Volume50,
  Volume51,
  Volume52,
  Volume53,
  Volume54,
  Volume55,
  Volume56,
  Volume57,
  Volume58,
  Volume59,
  Volume60,
  Volume61,
  Volume62,
  Volume63,
  Volume64,
  Volume65,
  Volume66,
  Volume67,
  Volume68,
  Volume69,
  Volume70,
  Volume71,
  Volume72,
  Volume73,
  Volume74,
  Volume75,
  Volume76,
  Volume77,
  Volume78,
  Volume79,
  Volume80,
  Volume81,
  Volume82,
  Volume83,
  Volume84,
  Volume85,
  Volume86,
  Volume87,
  Volume88,
  Volume89,
  Volume90,
  Volume91,
  Volume92,
  Volume93,
  Volume94,
  Volume95,
  Volume96,
  Volume97,
  Volume98,
  Volume99,
  Volume100,
} from 'lucide-react';
import {
  SiFacebook,
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiLinkedin,
  SiThreads,
  SiGoogle,
} from 'react-icons/si';

// Social Media Platform Interfaces
interface SocialPlatform {
  id: string;
  name: string;
  icon: any;
  color: string;
  isConnected: boolean;
  followers: number;
  engagement: number;
  lastSync: string;
  status: 'active' | 'inactive' | 'error';
}

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  media: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  }[];
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    reach: number;
    engagement: number;
  };
  createdAt: string;
  publishedAt?: string;
}

interface AIContent {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  mentions: string[];
  media: string[];
  tone: 'professional' | 'casual' | 'funny' | 'inspirational' | 'promotional';
  engagement: number;
  virality: number;
}

// Social Media Platforms
const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: SiFacebook,
    color: '#1877F2',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: SiInstagram,
    color: '#E4405F',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    icon: MessageCircle,
    color: '#000000',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: SiYoutube,
    color: '#FF0000',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: '#000000',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: SiLinkedin,
    color: '#0077B5',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: SiThreads,
    color: '#000000',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
  {
    id: 'google-business',
    name: 'Google Business',
    icon: SiGoogle,
    color: '#4285F4',
    isConnected: false,
    followers: 0,
    engagement: 0,
    lastSync: '',
    status: 'inactive',
  },
];

export default function SocialMedia() {
  const user = useRequireSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');

  // Data Queries
  const { data: platforms = [], isLoading: platformsLoading } = useQuery<SocialPlatform[]>({
    queryKey: ['/api/social/platform-status'],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<SocialPost[]>({
    queryKey: ['/api/social/posts'],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/social/metrics'],
  });

  // Mutations
  const connectPlatformMutation = useMutation({
    mutationFn: async (platformId: string) => {
      const response = await apiRequest('POST', `/api/social/connect/${platformId}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.oauthUrl) {
        // Redirect to OAuth URL
        window.location.href = data.oauthUrl;
      } else {
        toast({
          title: 'Platform Connected!',
          description: `Successfully connected to ${platformId}`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/social/platform-status'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to ${error.platform || 'platform'}. Please try again.`,
        variant: 'destructive',
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: { platforms: string[]; tone: string; topic?: string }) => {
      const response = await apiRequest('POST', '/api/social/generate-content', data);
      return response.json();
    },
    onSuccess: (data) => {
      setPostContent(data.content);
      toast({
        title: 'Content Generated!',
        description: 'AI has created optimized content for your selected platforms.',
      });
      setIsGeneratingContent(false);
    },
  });

  const schedulePostMutation = useMutation({
    mutationFn: async (postData: Partial<SocialPost>) => {
      const response = await apiRequest('POST', '/api/social/schedule-post', postData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post Scheduled!',
        description: 'Your post has been scheduled for the selected platforms.',
      });
      setPostContent('');
      setScheduledTime('');
      setSelectedPlatforms([]);
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
    },
  });

  // Handler Functions
  const handleConnectPlatform = (platformId: string) => {
    connectPlatformMutation.mutate(platformId);
  };

  const handleGenerateContent = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Select Platforms',
        description: 'Please select at least one platform to generate content for.',
        variant: 'destructive',
      });
      return;
    }
    setIsGeneratingContent(true);
    generateContentMutation.mutate({
      platforms: selectedPlatforms,
      tone: selectedTone,
    });
  };

  const handleSchedulePost = () => {
    if (!postContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please add content to your post.',
        variant: 'destructive',
      });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Select Platforms',
        description: 'Please select at least one platform.',
        variant: 'destructive',
      });
      return;
    }
    schedulePostMutation.mutate({
      content: postContent,
      platforms: selectedPlatforms,
      scheduledTime: scheduledTime || new Date().toISOString(),
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <TopBar title="Social Media Management" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/60 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Social Media Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                    AI-Powered Content Creation & Multi-Platform Publishing
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Content Generation
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-purple-50"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Multi-Platform Publishing
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50"
                    >
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Advanced Analytics
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateContent}
                  disabled={isGeneratingContent}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGeneratingContent ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Platform Connection Status */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Platform Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <div
                        key={platform.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          platform.isConnected
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                        onClick={() => !platform.isConnected && handleConnectPlatform(platform.id)}
                      >
                        <div className="text-center">
                          <div
                            className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: platform.color + '20' }}
                          >
                            <IconComponent className="w-6 h-6" style={{ color: platform.color }} />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {platform.name}
                          </p>
                          <div className="mt-2">
                            {platform.isConnected ? (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            ) : (
                              <Badge variant="outline">Connect</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Main Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Create
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="ai-insights"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  AI Insights
                </TabsTrigger>
              </TabsList>

              {/* Create Tab */}
              <TabsContent value="create" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Content Creation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Edit className="w-5 h-5 mr-2" />
                        Create Post
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Select Platforms</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {SOCIAL_PLATFORMS.filter((p) => p.isConnected).map((platform) => {
                            const IconComponent = platform.icon;
                            return (
                              <div
                                key={platform.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedPlatforms.includes(platform.id)
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                  if (selectedPlatforms.includes(platform.id)) {
                                    setSelectedPlatforms(
                                      selectedPlatforms.filter((id) => id !== platform.id)
                                    );
                                  } else {
                                    setSelectedPlatforms([...selectedPlatforms, platform.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: platform.color }}
                                  />
                                  <span className="text-sm font-medium">{platform.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label>Content Tone</Label>
                        <Select value={selectedTone} onValueChange={setSelectedTone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="funny">Funny</SelectItem>
                            <SelectItem value="inspirational">Inspirational</SelectItem>
                            <SelectItem value="promotional">Promotional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Post Content</Label>
                        <Textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Write your post content here... AI will optimize it for each platform."
                          rows={6}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={handleGenerateContent}
                          disabled={isGeneratingContent}
                          className="flex-1"
                        >
                          {isGeneratingContent ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleSchedulePost}
                          disabled={!postContent.trim() || selectedPlatforms.length === 0}
                          variant="outline"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Content Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="w-5 h-5 mr-2" />
                        AI Content Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Trending Topics
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {[
                              '#NewMusic',
                              '#MusicProduction',
                              '#ArtistLife',
                              '#StudioSession',
                              '#BehindTheScenes',
                            ].map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-100"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                            Optimal Posting Times
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Instagram:</span>
                              <span className="font-medium">6-9 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Twitter:</span>
                              <span className="font-medium">12-3 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Facebook:</span>
                              <span className="font-medium">1-3 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>TikTok:</span>
                              <span className="font-medium">6-10 PM</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                            Engagement Tips
                          </h4>
                          <ul className="text-sm space-y-1">
                            <li>• Use 1-2 hashtags for maximum reach</li>
                            <li>• Post videos for 3x more engagement</li>
                            <li>• Ask questions to boost comments</li>
                            <li>• Share behind-the-scenes content</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Other tabs content will be added here */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Social media overview coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Scheduled Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Post scheduling coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Social media analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-insights">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">AI-powered insights coming soon</p>
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
