import { useState, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload,
  Music,
  Globe,
  Calendar as CalendarIcon,
  Clock,
  MonitorSpeaker,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Download,
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Link2,
  Star,
  X,
  Share2,
  Edit,
  Trash2,
  ExternalLink,
  Headphones,
  Music2,
  Disc,
  FileAudio,
  Copy,
  Settings,
  CreditCard,
  Banknote,
  PieChart,
  Target,
  Zap,
  Shield,
  Award,
  Crown,
  Sparkles,
} from 'lucide-react';
import {
  SiSpotify,
  SiApple,
  SiYoutube,
  SiAmazon,
  SiTidal,
  SiSoundcloud,
  SiTiktok,
  SiInstagram,
  SiFacebook,
} from 'react-icons/si';

// DistroKid Clone Interfaces
interface Release {
  id: string;
  title: string;
  artistName: string;
  releaseType: 'single' | 'album' | 'EP';
  primaryGenre: string;
  secondaryGenre?: string;
  language: string;
  releaseDate: string;
  scheduledDate?: string;
  isScheduled: boolean;
  status: 'pending' | 'live' | 'processing' | 'failed';
  platforms: Platform[];
  tracksData: Track[];
  upcCode: string;
  labelName?: string;
  copyrightYear: number;
  copyrightOwner: string;
  hyperFollowUrl?: string;
  preSaves: number;
  isExplicit: boolean;
  iTunesPricing?: string;
  earnings: number;
  totalStreams: number;
  totalDownloads: number;
  spotifyStreams: number;
  appleMusicStreams: number;
  youtubeStreams: number;
  leaveALegacy: boolean;
  legacyPrice?: number;
  albumArt?: string;
}

interface Track {
  id: string;
  trackNumber: number;
  title: string;
  duration: number;
  isrc?: string;
  audioFile: string;
  explicit: boolean;
  songwriters: Collaborator[];
  producers: Collaborator[];
  performers: Collaborator[];
  featuredArtists: Collaborator[];
  lyrics?: string;
  language: string;
  streams: number;
  downloads: number;
  earnings: number;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'songwriter' | 'producer' | 'performer' | 'manager' | 'featured_artist';
  percentage: number;
  inviteStatus: 'pending' | 'accepted' | 'declined';
  recoupment: number;
  recoupmentPaid: number;
}

interface Platform {
  id: string;
  name: string;
  category: 'streaming' | 'social' | 'store';
  region: string;
  isActive: boolean;
  processingTime: string;
  iconUrl?: string;
  websiteUrl?: string;
  streams?: number;
  earnings?: number;
}

interface DistributionAnalytics {
  totalEarnings: number;
  totalStreams: number;
  totalReleases: number;
  pendingReleases: number;
  platformBreakdown: {
    platform: string;
    streams: number;
    earnings: number;
  }[];
}

interface HyperFollowPage {
  id: string;
  releaseId: string;
  url: string;
  isActive: boolean;
  pageViews: number;
  preSaves: number;
  clicks: number;
  collectEmails: boolean;
  fanEmails: string[];
}

interface UploadForm {
  // Basic Info
  title: string;
  artistName: string;
  releaseType: 'single' | 'album' | 'EP';
  primaryGenre: string;
  secondaryGenre: string;
  language: string;

  // Release Settings
  releaseDate: Date | null;
  isScheduled: boolean;
  scheduledDate: Date | null;
  labelName: string;
  copyrightYear: number;
  copyrightOwner: string;
  publishingRights: string;

  // Audio Files
  audioFiles: File[];
  albumArt: File | null;

  // Tracks
  tracks: {
    title: string;
    explicit: boolean;
    songwriters: string;
    producers: string;
    performers: string;
    featuredArtists: string;
    lyrics: string;
  }[];

  // Platform Selection
  selectedPlatforms: string[];

  // Advanced Settings
  isExplicit: boolean;
  iTunesPricing: string;
  leaveALegacy: boolean;
  legacyPrice: number;

  // Collaborators & Splits
  collaborators: {
    name: string;
    email: string;
    role: string;
    percentage: number;
  }[];
}

// DistroKid Supported Platforms (150+ platforms)
const DISTRO_PLATFORMS = [
  // Major Streaming
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'streaming',
    region: 'global',
    processingTime: '1-5 days',
    icon: SiSpotify,
    color: '#1DB954',
    earnings: 0.00318,
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    category: 'streaming',
    region: 'global',
    processingTime: '1-3 days',
    icon: SiApple,
    color: '#FA243C',
    earnings: 0.00735,
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    category: 'streaming',
    region: 'global',
    processingTime: '1-2 days',
    icon: SiYoutube,
    color: '#FF0000',
    earnings: 0.00069,
  },
  {
    id: 'amazon-music',
    name: 'Amazon Music',
    category: 'streaming',
    region: 'global',
    processingTime: '1-2 days',
    icon: SiAmazon,
    color: '#FF9900',
    earnings: 0.00402,
  },
  {
    id: 'tidal',
    name: 'Tidal',
    category: 'streaming',
    region: 'global',
    processingTime: '2-7 days',
    icon: SiTidal,
    color: '#000000',
    earnings: 0.0125,
  },
  {
    id: 'deezer',
    name: 'Deezer',
    category: 'streaming',
    region: 'global',
    processingTime: '1-5 days',
    icon: Music,
    color: '#FEAA2D',
    earnings: 0.0019,
  },

  // Social Media Platforms
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    region: 'global',
    processingTime: '1-3 days',
    icon: SiTiktok,
    color: '#000000',
    earnings: 0.0005,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    region: 'global',
    processingTime: '1-2 days',
    icon: SiInstagram,
    color: '#E4405F',
    earnings: 0.0005,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    region: 'global',
    processingTime: '1-2 days',
    icon: SiFacebook,
    color: '#1877F2',
    earnings: 0.0005,
  },

  // Additional platforms (150+ total)
  {
    id: 'pandora',
    name: 'Pandora',
    category: 'streaming',
    region: 'US',
    processingTime: '3-7 days',
    icon: Music,
    color: '#005483',
    earnings: 0.00133,
  },
  {
    id: 'iheartradio',
    name: 'iHeartRadio',
    category: 'streaming',
    region: 'US',
    processingTime: '2-5 days',
    icon: Music,
    color: '#C6002B',
    earnings: 0.0005,
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    category: 'streaming',
    region: 'global',
    processingTime: '1-3 days',
    icon: SiSoundcloud,
    color: '#FF3300',
    earnings: 0.0025,
  },
  {
    id: 'napster',
    name: 'Napster',
    category: 'streaming',
    region: 'global',
    processingTime: '2-5 days',
    icon: Music,
    color: '#000000',
    earnings: 0.019,
  },
  {
    id: 'qobuz',
    name: 'Qobuz',
    category: 'streaming',
    region: 'global',
    processingTime: '3-7 days',
    icon: Music,
    color: '#000000',
    earnings: 0.043,
  },
  {
    id: 'audiomack',
    name: 'Audiomack',
    category: 'streaming',
    region: 'global',
    processingTime: '1-3 days',
    icon: Music,
    color: '#FFA500',
    earnings: 0.0005,
  },
  {
    id: 'jiosaavn',
    name: 'JioSaavn',
    category: 'streaming',
    region: 'India',
    processingTime: '2-5 days',
    icon: Music,
    color: '#FF6B35',
    earnings: 0.0005,
  },
  {
    id: 'gaana',
    name: 'Gaana',
    category: 'streaming',
    region: 'India',
    processingTime: '2-5 days',
    icon: Music,
    color: '#FF6B35',
    earnings: 0.0005,
  },
  {
    id: 'melon',
    name: 'Melon',
    category: 'streaming',
    region: 'South Korea',
    processingTime: '3-7 days',
    icon: Music,
    color: '#00C73C',
    earnings: 0.0005,
  },
  {
    id: 'kkbox',
    name: 'KKBOX',
    category: 'streaming',
    region: 'Asia',
    processingTime: '2-5 days',
    icon: Music,
    color: '#FF6B35',
    earnings: 0.0005,
  },
  {
    id: 'boomplay',
    name: 'Boomplay',
    category: 'streaming',
    region: 'Africa',
    processingTime: '2-5 days',
    icon: Music,
    color: '#FF6B35',
    earnings: 0.0005,
  },
  {
    id: 'yandex-music',
    name: 'Yandex Music',
    category: 'streaming',
    region: 'Russia',
    processingTime: '2-5 days',
    icon: Music,
    color: '#FF6B35',
    earnings: 0.0005,
  },
  {
    id: 'netease',
    name: 'NetEase Cloud Music',
    category: 'streaming',
    region: 'China',
    processingTime: '3-7 days',
    icon: Music,
    color: '#FF6B35',
    earnings: 0.0005,
  },
  {
    id: 'itunes',
    name: 'iTunes Store',
    category: 'store',
    region: 'global',
    processingTime: '1-3 days',
    icon: SiApple,
    color: '#000000',
    earnings: 0.7,
  },
  {
    id: 'amazon-mp3',
    name: 'Amazon MP3',
    category: 'store',
    region: 'global',
    processingTime: '1-2 days',
    icon: SiAmazon,
    color: '#FF9900',
    earnings: 0.7,
  },
  {
    id: 'google-play',
    name: 'Google Play Music',
    category: 'store',
    region: 'global',
    processingTime: '1-3 days',
    icon: Music,
    color: '#4285F4',
    earnings: 0.7,
  },
  {
    id: 'beatport',
    name: 'Beatport',
    category: 'store',
    region: 'global',
    processingTime: '2-5 days',
    icon: Music,
    color: '#FF6900',
    earnings: 0.7,
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    category: 'store',
    region: 'global',
    processingTime: '1-2 days',
    icon: Music,
    color: '#629aa0',
    earnings: 0.85,
  },
  {
    id: 'siriusxm',
    name: 'SiriusXM',
    category: 'radio',
    region: 'US',
    processingTime: '5-10 days',
    icon: Music,
    color: '#000000',
    earnings: 0.0005,
  },
  {
    id: 'tunein',
    name: 'TuneIn',
    category: 'radio',
    region: 'global',
    processingTime: '3-7 days',
    icon: Music,
    color: '#14B8A6',
    earnings: 0.0005,
  },
  {
    id: 'peloton',
    name: 'Peloton',
    category: 'fitness',
    region: 'global',
    processingTime: '3-7 days',
    icon: Music,
    color: '#000000',
    earnings: 0.0005,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    category: 'gaming',
    region: 'global',
    processingTime: '1-3 days',
    icon: Music,
    color: '#9146FF',
    earnings: 0.0005,
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'gaming',
    region: 'global',
    processingTime: '1-3 days',
    icon: Music,
    color: '#5865F2',
    earnings: 0.0005,
  },
];

const GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'R&B',
  'Country',
  'Electronic',
  'Jazz',
  'Classical',
  'Blues',
  'Reggae',
  'Folk',
  'Alternative',
  'Indie',
  'Punk',
  'Metal',
  'Funk',
  'Soul',
  'Gospel',
  'World',
  'Latin',
  'Ambient',
  'Experimental',
  'Lo-Fi',
];

export default function Distribution() {
  const user = useRequireSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumArtRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isHyperFollowOpen, setIsHyperFollowOpen] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    title: '',
    artistName: '',
    releaseType: 'single',
    primaryGenre: '',
    secondaryGenre: '',
    language: 'English',
    releaseDate: null,
    isScheduled: false,
    scheduledDate: null,
    labelName: '',
    copyrightYear: new Date().getFullYear(),
    copyrightOwner: '',
    publishingRights: 'Independent',
    audioFiles: [],
    albumArt: null,
    tracks: [],
    selectedPlatforms: ['spotify', 'apple-music', 'youtube-music', 'amazon-music'],
    isExplicit: false,
    iTunesPricing: 'standard',
    leaveALegacy: false,
    legacyPrice: 29,
    collaborators: [],
  });

  // Data Queries
  const { data: releases = [], isLoading: releasesLoading } = useQuery<Release[]>({
    queryKey: ['/api/distribution/releases'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<DistributionAnalytics>({
    queryKey: ['/api/distribution/analytics'],
  });

  const { data: hyperFollowPages = [], isLoading: hyperFollowLoading } = useQuery<
    HyperFollowPage[]
  >({
    queryKey: ['/api/distribution/hyperfollow'],
  });

  // Mutations
  const uploadReleaseMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/distribution/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Release uploaded successfully!',
        description: 'Your music is now being processed for distribution.',
      });
      setIsUploadOpen(false);
      setCurrentStep(1);
      setUploadForm({
        title: '',
        artistName: '',
        releaseType: 'single',
        primaryGenre: '',
        secondaryGenre: '',
        language: 'English',
        releaseDate: null,
        isScheduled: false,
        scheduledDate: null,
        labelName: '',
        copyrightYear: new Date().getFullYear(),
        copyrightOwner: '',
        publishingRights: 'Independent',
        audioFiles: [],
        albumArt: null,
        tracks: [],
        selectedPlatforms: ['spotify', 'apple-music', 'youtube-music', 'amazon-music'],
        isExplicit: false,
        iTunesPricing: 'standard',
        leaveALegacy: false,
        legacyPrice: 29,
        collaborators: [],
      });
      queryClient.invalidateQueries({ queryKey: ['/api/distribution/releases'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createHyperFollowMutation = useMutation({
    mutationFn: async (releaseId: string) => {
      const response = await apiRequest('POST', '/api/distribution/hyperfollow', { releaseId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'HyperFollow page created!',
        description: `Your pre-save page is live at ${data.url}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/distribution/hyperfollow'] });
    },
  });

  // Handler Functions
  const handleFileUpload = (files: FileList | null, type: 'audio' | 'artwork') => {
    if (!files) return;

    if (type === 'audio') {
      const audioFiles = Array.from(files).filter(
        (file) => file.type.includes('audio') || file.name.match(/\.(mp3|wav|flac|aac|ogg)$/i)
      );

      setUploadForm((prev) => ({
        ...prev,
        audioFiles: [...prev.audioFiles, ...audioFiles],
        tracks: audioFiles.map((file, index) => ({
          title: file.name.replace(/\.[^/.]+$/, ''),
          explicit: false,
          songwriters: '',
          producers: '',
          performers: '',
          featuredArtists: '',
          lyrics: '',
        })),
      }));
    } else {
      const imageFile = files[0];
      if (imageFile && imageFile.type.includes('image')) {
        setUploadForm((prev) => ({ ...prev, albumArt: imageFile }));
      }
    }
  };

  const handleUploadSubmit = async () => {
    const formData = new FormData();

    // Add form data
    formData.append('title', uploadForm.title);
    formData.append('artistName', uploadForm.artistName);
    formData.append('releaseType', uploadForm.releaseType);
    formData.append('primaryGenre', uploadForm.primaryGenre);
    formData.append('secondaryGenre', uploadForm.secondaryGenre);
    formData.append('language', uploadForm.language);
    formData.append('releaseDate', uploadForm.releaseDate?.toISOString() || '');
    formData.append('isScheduled', uploadForm.isScheduled.toString());
    formData.append('scheduledDate', uploadForm.scheduledDate?.toISOString() || '');
    formData.append('labelName', uploadForm.labelName);
    formData.append('copyrightYear', uploadForm.copyrightYear.toString());
    formData.append('copyrightOwner', uploadForm.copyrightOwner);
    formData.append('publishingRights', uploadForm.publishingRights);
    formData.append('selectedPlatforms', JSON.stringify(uploadForm.selectedPlatforms));
    formData.append('isExplicit', uploadForm.isExplicit.toString());
    formData.append('iTunesPricing', uploadForm.iTunesPricing);
    formData.append('leaveALegacy', uploadForm.leaveALegacy.toString());
    formData.append('legacyPrice', uploadForm.legacyPrice.toString());
    formData.append('tracks', JSON.stringify(uploadForm.tracks));
    formData.append('collaborators', JSON.stringify(uploadForm.collaborators));

    // Add files
    uploadForm.audioFiles.forEach((file, index) => {
      formData.append(`audioFile_${index}`, file);
    });

    if (uploadForm.albumArt) {
      formData.append('albumArt', uploadForm.albumArt);
    }

    uploadReleaseMutation.mutate(formData);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <TopBar title="Distribution" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/60 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Music Distribution
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                    Get your music on 150+ platforms including Spotify, Apple Music, and TikTok
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      No annual fees
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Zap className="w-3 h-3 mr-1" />
                      Keep 100% royalties
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-purple-50"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      HyperFollow pre-saves
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Music
                </Button>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Total Earnings
                      </p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                        ${(analytics?.totalEarnings ?? 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +12.5% this month
                      </p>
                    </div>
                    <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-700 dark:text-green-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Total Streams
                      </p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {(analytics?.totalStreams ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        +8.3% this month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                      <Play className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Live Releases
                      </p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {analytics?.totalReleases ?? 0}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        2 processing
                      </p>
                    </div>
                    <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
                      <Music className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Platforms
                      </p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        150+
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        All connected
                      </p>
                    </div>
                    <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-full">
                      <Globe className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="releases"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  My Releases
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="earnings"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Earnings
                </TabsTrigger>
                <TabsTrigger
                  value="hyperfollow"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  HyperFollow
                </TabsTrigger>
                <TabsTrigger
                  value="platforms"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Platforms
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Releases */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <Music className="w-5 h-5 mr-2 text-blue-600" />
                        Recent Releases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {releasesLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : releases.length === 0 ? (
                        <div className="text-center py-8">
                          <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 mb-4">No releases yet</p>
                          <Button
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Upload Your First Release
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {releases.slice(0, 5).map((release: any) => (
                            <div
                              key={release.id}
                              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {release.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {release.artistName}
                                </p>
                              </div>
                              <Badge variant={release.status === 'live' ? 'default' : 'secondary'}>
                                {release.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                        Platform Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {DISTRO_PLATFORMS.slice(0, 6).map((platform) => {
                          const IconComponent = platform.icon;
                          return (
                            <div
                              key={platform.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {platform.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {platform.processingTime}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Connected
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Releases Tab */}
              <TabsContent value="releases" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      My Releases
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage and track your distributed music
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Release
                  </Button>
                </div>

                {releasesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : releases.length === 0 ? (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Music className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Releases Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Start your music distribution journey by uploading your first release to
                        150+ platforms worldwide.
                      </p>
                      <Button
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Your First Release
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {releases.map((release: any) => (
                      <Card
                        key={release.id}
                        className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                      >
                        <CardContent className="p-0">
                          {/* Album Art */}
                          <div className="relative">
                            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                              {release.albumArt ? (
                                <img
                                  src={release.albumArt}
                                  alt={release.title}
                                  className="w-full h-full object-cover rounded-t-lg"
                                />
                              ) : (
                                <Music className="w-16 h-16 text-white opacity-50" />
                              )}
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge
                                variant={
                                  release.status === 'live'
                                    ? 'default'
                                    : release.status === 'processing'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                                className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
                              >
                                {release.status}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center space-x-2">
                                  <Play className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {release.totalStreams?.toLocaleString() || '0'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    ${release.earnings?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Release Info */}
                          <div className="p-6">
                            <div className="mb-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
                                {release.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                {release.artistName}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {release.releaseType}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {release.primaryGenre}
                                </Badge>
                                {release.isExplicit && (
                                  <Badge variant="destructive" className="text-xs">
                                    Explicit
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">
                                  {release.tracksData?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500">Tracks</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">
                                  {release.platforms?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500">Platforms</p>
                              </div>
                            </div>

                            {/* Release Date */}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Globe className="w-4 h-4" />
                                <span>{release.upcCode}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  // View release details
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Edit release
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Share release
                                }}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* HyperFollow */}
                            {release.hyperFollowUrl && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Link2 className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      HyperFollow
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(release.hyperFollowUrl, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {release.preSaves || 0} pre-saves
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Detailed analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="earnings" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Earnings & Royalties
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track your revenue across all platforms
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Payment Settings
                    </Button>
                  </div>
                </div>

                {/* Earnings Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            Total Earnings
                          </p>
                          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                            ${(analytics?.totalEarnings ?? 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            +12.5% this month
                          </p>
                        </div>
                        <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
                          <DollarSign className="w-6 h-6 text-green-700 dark:text-green-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            This Month
                          </p>
                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            ${((analytics?.totalEarnings ?? 0) * 0.3).toFixed(2)}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            +8.3% from last month
                          </p>
                        </div>
                        <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                          <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Pending Payout
                          </p>
                          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                            ${((analytics?.totalEarnings ?? 0) * 0.1).toFixed(2)}
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            Next payout: Dec 15
                          </p>
                        </div>
                        <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
                          <Clock className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Avg. per Stream
                          </p>
                          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                            $
                            {(
                              ((analytics?.totalEarnings ?? 0) / (analytics?.totalStreams ?? 1)) *
                              1000
                            ).toFixed(3)}
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Per 1,000 streams
                          </p>
                        </div>
                        <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-full">
                          <BarChart3 className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Earnings Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Platform Earnings Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {DISTRO_PLATFORMS.slice(0, 10).map((platform, index) => {
                        const IconComponent = platform.icon;
                        const earnings =
                          (analytics?.totalEarnings ?? 0) * (platform.earnings || 0.001);
                        const streams = Math.floor(earnings / (platform.earnings || 0.001));

                        return (
                          <div
                            key={platform.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                                <IconComponent
                                  className="w-5 h-5"
                                  style={{ color: platform.color }}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {platform.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {streams.toLocaleString()} streams • $
                                  {platform.earnings?.toFixed(4)} per stream
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ${earnings.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {((earnings / (analytics?.totalEarnings ?? 1)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Payouts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Recent Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          date: '2024-11-15',
                          amount: 125.5,
                          status: 'completed',
                          method: 'Bank Transfer',
                        },
                        {
                          date: '2024-10-15',
                          amount: 98.75,
                          status: 'completed',
                          method: 'Bank Transfer',
                        },
                        {
                          date: '2024-09-15',
                          amount: 156.25,
                          status: 'completed',
                          method: 'Bank Transfer',
                        },
                        {
                          date: '2024-08-15',
                          amount: 87.3,
                          status: 'completed',
                          method: 'Bank Transfer',
                        },
                      ].map((payout, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(payout.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {payout.method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">${payout.amount}</p>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              {payout.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Payment Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium">Payout Threshold</Label>
                          <Select defaultValue="50">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">$25</SelectItem>
                              <SelectItem value="50">$50</SelectItem>
                              <SelectItem value="100">$100</SelectItem>
                              <SelectItem value="200">$200</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum amount before automatic payout
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Payout Frequency</Label>
                          <Select defaultValue="monthly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            How often you receive payments
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">
                              Secure Payments
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              All payments are processed securely through Stripe. Your banking
                              information is encrypted and never stored on our servers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hyperfollow" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      HyperFollow Pre-Save Pages
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create landing pages to collect pre-saves and build your fanbase
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsHyperFollowOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create HyperFollow Page
                  </Button>
                </div>

                {/* HyperFollow Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Total Pre-Saves
                          </p>
                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            {hyperFollowPages
                              .reduce((sum, page) => sum + page.preSaves, 0)
                              .toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            +15.2% this month
                          </p>
                        </div>
                        <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                          <Users className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            Page Views
                          </p>
                          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                            {hyperFollowPages
                              .reduce((sum, page) => sum + page.pageViews, 0)
                              .toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            +22.8% this month
                          </p>
                        </div>
                        <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
                          <Eye className="w-6 h-6 text-green-700 dark:text-green-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Conversion Rate
                          </p>
                          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                            12.5%
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            +3.2% this month
                          </p>
                        </div>
                        <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
                          <Target className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Active Pages
                          </p>
                          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                            {hyperFollowPages.filter((page) => page.isActive).length}
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Live campaigns
                          </p>
                        </div>
                        <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-full">
                          <Link2 className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* HyperFollow Pages List */}
                {hyperFollowLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : hyperFollowPages.length === 0 ? (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Link2 className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No HyperFollow Pages Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Create your first HyperFollow page to start collecting pre-saves and
                        building your fanbase before your release goes live.
                      </p>
                      <Button
                        onClick={() => setIsHyperFollowOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First HyperFollow Page
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">HyperFollow pages will appear here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="platforms">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution Platforms</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your music will be distributed to 150+ platforms automatically
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {DISTRO_PLATFORMS.map((platform) => {
                        const IconComponent = platform.icon;
                        return (
                          <div
                            key={platform.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {platform.name}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {platform.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Processing:</span>
                                <span className="font-medium">{platform.processingTime}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Region:</span>
                                <span className="font-medium">{platform.region}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Upload Your Music
                  </DialogTitle>
                  <DialogDescription>
                    Distribute your music to 150+ platforms including Spotify, Apple Music, and
                    TikTok
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep >= step
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          }`}
                        >
                          {step}
                        </div>
                        {step < 5 && (
                          <div
                            className={`w-16 h-0.5 mx-2 ${
                              currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step Content */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Release Title *</Label>
                          <Input
                            id="title"
                            placeholder="Enter release title"
                            value={uploadForm.title}
                            onChange={(e) =>
                              setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="artistName">Artist Name *</Label>
                          <Input
                            id="artistName"
                            placeholder="Enter artist name"
                            value={uploadForm.artistName}
                            onChange={(e) =>
                              setUploadForm((prev) => ({ ...prev, artistName: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="releaseType">Release Type *</Label>
                          <Select
                            value={uploadForm.releaseType}
                            onValueChange={(value: 'single' | 'album' | 'EP') =>
                              setUploadForm((prev) => ({ ...prev, releaseType: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="EP">EP</SelectItem>
                              <SelectItem value="album">Album</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="primaryGenre">Primary Genre *</Label>
                          <Select
                            value={uploadForm.primaryGenre}
                            onValueChange={(value) =>
                              setUploadForm((prev) => ({ ...prev, primaryGenre: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent>
                              {GENRES.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={uploadForm.language}
                            onValueChange={(value) =>
                              setUploadForm((prev) => ({ ...prev, language: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                              <SelectItem value="Italian">Italian</SelectItem>
                              <SelectItem value="Portuguese">Portuguese</SelectItem>
                              <SelectItem value="Japanese">Japanese</SelectItem>
                              <SelectItem value="Korean">Korean</SelectItem>
                              <SelectItem value="Mandarin">Mandarin</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="copyrightOwner">Copyright Owner *</Label>
                          <Input
                            id="copyrightOwner"
                            placeholder="Enter copyright owner"
                            value={uploadForm.copyrightOwner}
                            onChange={(e) =>
                              setUploadForm((prev) => ({ ...prev, copyrightOwner: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="explicit"
                          checked={uploadForm.isExplicit}
                          onCheckedChange={(checked) =>
                            setUploadForm((prev) => ({ ...prev, isExplicit: checked as boolean }))
                          }
                        />
                        <Label htmlFor="explicit">This release contains explicit content</Label>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Upload Audio & Artwork</h3>

                      {/* Audio Upload */}
                      <div className="space-y-4">
                        <Label>Audio Files *</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept=".mp3,.wav,.flac,.aac,.ogg"
                            onChange={(e) => handleFileUpload(e.target.files, 'audio')}
                            className="hidden"
                          />
                          <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Drop your audio files here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Supported formats: MP3, WAV, FLAC, AAC, OGG (Max 100MB each)
                          </p>
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Audio Files
                          </Button>
                        </div>

                        {uploadForm.audioFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Uploaded Files ({uploadForm.audioFiles.length})</Label>
                            {uploadForm.audioFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <FileAudio className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFiles = uploadForm.audioFiles.filter(
                                      (_, i) => i !== index
                                    );
                                    const newTracks = uploadForm.tracks.filter(
                                      (_, i) => i !== index
                                    );
                                    setUploadForm((prev) => ({
                                      ...prev,
                                      audioFiles: newFiles,
                                      tracks: newTracks,
                                    }));
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Album Art Upload */}
                      <div className="space-y-4">
                        <Label>Album Artwork *</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                          <input
                            type="file"
                            ref={albumArtRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files, 'artwork')}
                            className="hidden"
                          />
                          {uploadForm.albumArt ? (
                            <div className="flex items-center space-x-4">
                              <img
                                src={URL.createObjectURL(uploadForm.albumArt)}
                                alt="Album artwork"
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{uploadForm.albumArt.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(uploadForm.albumArt.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setUploadForm((prev) => ({ ...prev, albumArt: null }))
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Disc className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Upload album artwork
                              </p>
                              <p className="text-sm text-gray-500 mb-4">
                                3000x3000 pixels recommended (JPG, PNG)
                              </p>
                              <Button
                                type="button"
                                onClick={() => albumArtRef.current?.click()}
                                variant="outline"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Artwork
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Track Details</h3>
                      {uploadForm.tracks.map((track, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Track {index + 1}</h4>
                            <Badge variant="secondary">{uploadForm.audioFiles[index]?.name}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Track Title *</Label>
                              <Input
                                value={track.title}
                                onChange={(e) => {
                                  const newTracks = [...uploadForm.tracks];
                                  newTracks[index] = { ...track, title: e.target.value };
                                  setUploadForm((prev) => ({ ...prev, tracks: newTracks }));
                                }}
                                placeholder="Enter track title"
                              />
                            </div>
                            <div>
                              <Label>Featured Artists</Label>
                              <Input
                                value={track.featuredArtists}
                                onChange={(e) => {
                                  const newTracks = [...uploadForm.tracks];
                                  newTracks[index] = { ...track, featuredArtists: e.target.value };
                                  setUploadForm((prev) => ({ ...prev, tracks: newTracks }));
                                }}
                                placeholder="ft. Artist Name"
                              />
                            </div>
                            <div>
                              <Label>Songwriters</Label>
                              <Input
                                value={track.songwriters}
                                onChange={(e) => {
                                  const newTracks = [...uploadForm.tracks];
                                  newTracks[index] = { ...track, songwriters: e.target.value };
                                  setUploadForm((prev) => ({ ...prev, tracks: newTracks }));
                                }}
                                placeholder="Writer 1, Writer 2"
                              />
                            </div>
                            <div>
                              <Label>Producers</Label>
                              <Input
                                value={track.producers}
                                onChange={(e) => {
                                  const newTracks = [...uploadForm.tracks];
                                  newTracks[index] = { ...track, producers: e.target.value };
                                  setUploadForm((prev) => ({ ...prev, tracks: newTracks }));
                                }}
                                placeholder="Producer 1, Producer 2"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Lyrics (Optional)</Label>
                            <Textarea
                              value={track.lyrics}
                              onChange={(e) => {
                                const newTracks = [...uploadForm.tracks];
                                newTracks[index] = { ...track, lyrics: e.target.value };
                                setUploadForm((prev) => ({ ...prev, tracks: newTracks }));
                              }}
                              placeholder="Enter lyrics here..."
                              rows={6}
                            />
                          </div>
                          <div className="flex items-center space-x-2 mt-4">
                            <Checkbox
                              checked={track.explicit}
                              onCheckedChange={(checked) => {
                                const newTracks = [...uploadForm.tracks];
                                newTracks[index] = { ...track, explicit: checked as boolean };
                                setUploadForm((prev) => ({ ...prev, tracks: newTracks }));
                              }}
                            />
                            <Label>This track contains explicit content</Label>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Platform Selection & Settings</h3>

                      <div className="space-y-4">
                        <Label>Select Distribution Platforms</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {DISTRO_PLATFORMS.map((platform) => (
                            <div
                              key={platform.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg"
                            >
                              <Checkbox
                                checked={uploadForm.selectedPlatforms.includes(platform.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setUploadForm((prev) => ({
                                      ...prev,
                                      selectedPlatforms: [...prev.selectedPlatforms, platform.id],
                                    }));
                                  } else {
                                    setUploadForm((prev) => ({
                                      ...prev,
                                      selectedPlatforms: prev.selectedPlatforms.filter(
                                        (id) => id !== platform.id
                                      ),
                                    }));
                                  }
                                }}
                              />
                              <platform.icon
                                className="w-5 h-5"
                                style={{ color: platform.color }}
                              />
                              <span className="font-medium">{platform.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Release Date</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={uploadForm.isScheduled}
                              onCheckedChange={(checked) =>
                                setUploadForm((prev) => ({
                                  ...prev,
                                  isScheduled: checked as boolean,
                                }))
                              }
                            />
                            <span>Schedule for later release</span>
                          </div>
                          {uploadForm.isScheduled && (
                            <Input
                              type="date"
                              value={
                                uploadForm.scheduledDate
                                  ? uploadForm.scheduledDate.toISOString().split('T')[0]
                                  : ''
                              }
                              onChange={(e) =>
                                setUploadForm((prev) => ({
                                  ...prev,
                                  scheduledDate: new Date(e.target.value),
                                }))
                              }
                              className="mt-2"
                              min={new Date().toISOString().split('T')[0]}
                            />
                          )}
                        </div>
                        <div>
                          <Label>iTunes Pricing</Label>
                          <Select
                            value={uploadForm.iTunesPricing}
                            onValueChange={(value) =>
                              setUploadForm((prev) => ({ ...prev, iTunesPricing: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard Pricing</SelectItem>
                              <SelectItem value="premium">Premium Pricing (+30%)</SelectItem>
                              <SelectItem value="budget">Budget Pricing (-20%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={uploadForm.leaveALegacy}
                            onCheckedChange={(checked) =>
                              setUploadForm((prev) => ({
                                ...prev,
                                leaveALegacy: checked as boolean,
                              }))
                            }
                          />
                          <Label>Enable Leave a Legacy ($29 one-time fee)</Label>
                        </div>
                        {uploadForm.leaveALegacy && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Leave a Legacy keeps your music online forever, even if you stop
                              paying for DistroKid. Your music will never be taken down from stores.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Review & Submit</h3>

                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Release Title
                            </Label>
                            <p className="font-medium">{uploadForm.title}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Artist Name</Label>
                            <p className="font-medium">{uploadForm.artistName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Release Type
                            </Label>
                            <p className="font-medium capitalize">{uploadForm.releaseType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Genre</Label>
                            <p className="font-medium">{uploadForm.primaryGenre}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Tracks ({uploadForm.audioFiles.length})
                          </Label>
                          <div className="space-y-2 mt-2">
                            {uploadForm.tracks.map((track, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-700 rounded"
                              >
                                <span className="text-sm font-mono text-gray-500">
                                  {index + 1}.
                                </span>
                                <span className="font-medium">{track.title}</span>
                                {track.explicit && (
                                  <Badge variant="destructive" className="text-xs">
                                    Explicit
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Platforms ({uploadForm.selectedPlatforms.length})
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {uploadForm.selectedPlatforms.map((platformId) => {
                              const platform = DISTRO_PLATFORMS.find((p) => p.id === platformId);
                              return platform ? (
                                <Badge
                                  key={platformId}
                                  variant="secondary"
                                  className="flex items-center space-x-1"
                                >
                                  <platform.icon className="w-3 h-3" />
                                  <span>{platform.name}</span>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>

                        {uploadForm.leaveALegacy && (
                          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Leave a Legacy Enabled (+$29)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                              Before You Submit
                            </p>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                              <li>
                                • Make sure all track titles and artist names are spelled correctly
                              </li>
                              <li>
                                • Verify your album artwork meets platform requirements
                                (3000x3000px)
                              </li>
                              <li>• Double-check that all collaborators are properly credited</li>
                              <li>
                                • Review your platform selection - you can't change this after
                                submission
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                      Previous
                    </Button>
                    <Button
                      onClick={currentStep === 5 ? handleUploadSubmit : nextStep}
                      disabled={uploadReleaseMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploadReleaseMutation.isPending
                        ? 'Uploading...'
                        : currentStep === 5
                          ? 'Submit Release'
                          : 'Next'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
