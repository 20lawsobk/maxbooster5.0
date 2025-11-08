import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Star,
  Award,
  Trophy,
  Crown,
  Flame,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Shield,
  Zap,
  Sparkles,
  Brain,
  Bot,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  TrendingDown,
  Minus,
  PlusCircle,
  MinusCircle,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Settings,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  MessageCircle,
  Mail,
  Phone,
  Video,
  Camera,
  Image,
  File,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  Folder,
  FolderOpen,
  Save,
  SaveAs,
  Copy,
  Scissors,
  Paste,
  Undo,
  Redo,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  ExternalLink,
  Link,
  Link2,
  Unlink,
  Bookmark,
  BookmarkCheck,
  Flag,
  FlagOff,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprised,
  Wink,
  Kiss,
  Tongue
} from 'lucide-react';

// BeatStars Clone Interfaces
interface Beat {
  id: string;
  title: string;
  producer: string;
  producerId: string;
  price: number;
  currency: string;
  genre: string;
  mood: string;
  tempo: number;
  key: string;
  duration: number;
  previewUrl: string;
  fullUrl: string;
  coverArt: string;
  tags: string[];
  description: string;
  isExclusive: boolean;
  isLease: boolean;
  licenseType: 'basic' | 'premium' | 'unlimited' | 'exclusive';
  downloads: number;
  likes: number;
  plays: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

interface Producer {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  beats: number;
  sales: number;
  rating: number;
  verified: boolean;
  joinedAt: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProducersResponse {
  producers: Producer[];
  pagination: Pagination;
}

interface Purchase {
  id: string;
  beatId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  licenseType: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  licenseUrl?: string;
}

interface CartItem {
  beatId: string;
  licenseType: string;
  price: number;
}

// Beat Genres
const BEAT_GENRES = [
  'Hip-Hop', 'Trap', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Blues',
  'Country', 'Reggae', 'Folk', 'Alternative', 'Indie', 'Punk', 'Metal',
  'Funk', 'Soul', 'Gospel', 'World', 'Latin', 'Ambient', 'Experimental'
];

// Beat Moods
const BEAT_MOODS = [
  'Aggressive', 'Chill', 'Dark', 'Happy', 'Sad', 'Energetic', 'Relaxed',
  'Romantic', 'Mysterious', 'Uplifting', 'Melancholic', 'Confident',
  'Nostalgic', 'Futuristic', 'Vintage', 'Modern', 'Classic', 'Experimental'
];

export default function Marketplace() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    genre: '',
    mood: '',
    tempo: 120,
    key: 'C',
    price: 50,
    licenseType: 'basic',
    description: '',
    tags: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);

  // Data Queries
  const { data: beats = [], isLoading: beatsLoading } = useQuery<Beat[]>({
    queryKey: ['/api/marketplace/beats', searchQuery, selectedGenre, selectedMood, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedMood) params.append('mood', selectedMood);
      if (sortBy) params.append('sortBy', sortBy);
      
      const url = `/api/marketplace/beats${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: producersData, isLoading: producersLoading, error: producersError } = useQuery<ProducersResponse>({
    queryKey: ['/api/marketplace/producers'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - moderate freshness
  });
  
  const producers = producersData?.producers || [];

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ['/api/marketplace/purchases'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - moderate freshness
  });

  const { data: salesAnalytics, isLoading: salesAnalyticsLoading, error: salesAnalyticsError } = useQuery({
    queryKey: ['/api/marketplace/sales-analytics'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - moderate freshness
  });

  const { data: myBeats = [], isLoading: myBeatsLoading } = useQuery<Beat[]>({
    queryKey: ['/api/marketplace/my-beats'],
    enabled: !!user && activeTab === 'my-beats',
    staleTime: 5 * 60 * 1000, // 5 minutes - moderate freshness
  });

  // Mutations
  const purchaseBeatMutation = useMutation({
    mutationFn: async (data: { beatId: string, licenseType: string }) => {
      const response = await apiRequest('POST', '/api/marketplace/purchase', data);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: 'Purchase Successful!',
          description: `You've successfully purchased the beat. Download link sent to your email.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/marketplace/purchases'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to process purchase',
        variant: 'destructive'
      });
    }
  });

  const connectStripeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/marketplace/connect-stripe', {});
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect Stripe account',
        variant: 'destructive'
      });
    }
  });

  const uploadBeatMutation = useMutation({
    mutationFn: async (beatData: FormData) => {
      const response = await apiRequest('POST', '/api/marketplace/upload', beatData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Beat Uploaded!',
        description: 'Your beat has been uploaded and is pending approval.',
      });
      setShowUploadModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/beats'] });
    },
  });

  const followProducerMutation = useMutation({
    mutationFn: async (producerId: string) => {
      const response = await apiRequest('POST', `/api/marketplace/follow/${producerId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: 'Producer Followed!', 
        description: 'You will see updates from this producer' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/producers'] });
    },
  });

  // Handler Functions
  const handlePlayPause = (beatId: string) => {
    if (isPlaying === beatId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(beatId);
    }
  };

  const handleAddToCart = (beat: Beat, licenseType: string) => {
    const existingItem = cart.find(item => item.beatId === beat.id && item.licenseType === licenseType);
    if (existingItem) {
      toast({
        title: 'Already in Cart',
        description: 'This beat with this license type is already in your cart.',
        variant: 'destructive',
      });
      return;
    }

    const price = getLicensePrice(beat, licenseType);
    setCart([...cart, { beatId: beat.id, licenseType, price }]);
    toast({
      title: 'Added to Cart',
      description: `${beat.title} has been added to your cart.`,
    });
  };

  const handlePurchase = (beat: Beat, licenseType: string) => {
    purchaseBeatMutation.mutate({ beatId: beat.id, licenseType });
  };

  const handleShare = (beat: Beat) => {
    if (navigator.share) {
      navigator.share({
        title: beat.title,
        text: `Check out this beat: ${beat.title} by ${beat.producer}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'Beat link copied to clipboard',
      });
    }
  };

  const getLicensePrice = (beat: Beat, licenseType: string): number => {
    const basePrice = beat.price;
    switch (licenseType) {
      case 'basic': return basePrice;
      case 'premium': return basePrice * 2;
      case 'unlimited': return basePrice * 5;
      case 'exclusive': return basePrice * 20;
      default: return basePrice;
    }
  };

  const getLicenseDescription = (licenseType: string): string => {
    switch (licenseType) {
      case 'basic': return 'Basic lease - 5,000 copies, 1 year';
      case 'premium': return 'Premium lease - 50,000 copies, 2 years';
      case 'unlimited': return 'Unlimited lease - Unlimited copies, 5 years';
      case 'exclusive': return 'Exclusive rights - Full ownership';
      default: return '';
    }
  };

  return (
    <AppLayout>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/60 dark:border-gray-700">
              <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Max Booster Marketplace
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                    Buy & Sell Beats with Peer-to-Peer Transactions
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Shield className="w-3 h-3 mr-1" />
                      Secure Transactions
                    </Badge>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      <Zap className="w-3 h-3 mr-1" />
                      Instant Downloads
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      <Users className="w-3 h-3 mr-1" />
                      Global Community
                    </Badge>
                  </div>
              </div>
                {user && (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      data-testid="button-upload-beat"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Beat
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCartModal(true)}
                      data-testid="button-view-cart"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart ({cart.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Search & Filters */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search beats, producers, genres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-beats"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger className="w-40" data-testid="select-genre">
                        <SelectValue placeholder="Genre" />
                          </SelectTrigger>
                          <SelectContent>
                        <SelectItem value="all" data-testid="option-genre-all">All Genres</SelectItem>
                        {BEAT_GENRES.map((genre) => (
                              <SelectItem 
                                key={genre} 
                                value={genre}
                                data-testid={`option-genre-${genre.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    <Select value={selectedMood} onValueChange={setSelectedMood}>
                      <SelectTrigger className="w-40" data-testid="select-mood">
                        <SelectValue placeholder="Mood" />
                          </SelectTrigger>
                          <SelectContent>
                        <SelectItem value="all" data-testid="option-mood-all">All Moods</SelectItem>
                        {BEAT_MOODS.map((mood) => (
                          <SelectItem 
                            key={mood} 
                            value={mood}
                            data-testid={`option-mood-${mood.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {mood}
                          </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40" data-testid="select-sort-by">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest" data-testid="option-sort-newest">Newest</SelectItem>
                        <SelectItem value="oldest" data-testid="option-sort-oldest">Oldest</SelectItem>
                        <SelectItem value="price-low" data-testid="option-sort-price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high" data-testid="option-sort-price-high">Price: High to Low</SelectItem>
                        <SelectItem value="popular" data-testid="option-sort-popular">Most Popular</SelectItem>
                        <SelectItem value="trending" data-testid="option-sort-trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        data-testid="button-view-grid"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        data-testid="button-view-list"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
            </div>
              </CardContent>
            </Card>

            {/* Main Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className={`grid w-full ${user ? 'grid-cols-5' : 'grid-cols-2'} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}>
                <TabsTrigger value="browse" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-browse-beats">
                  Browse Beats
                </TabsTrigger>
                <TabsTrigger value="producers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-producers">
                  Producers
                </TabsTrigger>
                {user && (
                  <>
                    <TabsTrigger value="my-beats" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-my-beats">
                      My Beats
                    </TabsTrigger>
                    <TabsTrigger value="purchases" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-my-purchases">
                      My Purchases
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-sales">
                      Sales
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Browse Beats Tab */}
              <TabsContent value="browse" className="space-y-6">
                  {beatsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(12)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-0">
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  ) : beats.length === 0 ? (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Music className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Beats Found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Try adjusting your search criteria or browse different genres and moods.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedGenre('');
                          setSelectedMood('');
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                        data-testid="button-clear-filters"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {beats.map((beat) => (
                      <Card key={beat.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-0">
                          {/* Cover Art */}
                          <div className="relative">
                            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                              {beat.coverArt ? (
                                <img 
                                  src={beat.coverArt} 
                                  alt={beat.title}
                                  className="w-full h-full object-cover rounded-t-lg"
                                />
                              ) : (
                                <Music className="w-16 h-16 text-white opacity-50" />
                              )}
                    </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                          <Button
                                onClick={() => handlePlayPause(beat.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 hover:bg-white/30 text-white border-white/30"
                                size="sm"
                                data-testid={`button-play-pause-${beat.id}`}
                              >
                                {isPlaying === beat.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                            )}
                          </Button>
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
                                {beat.tempo} BPM
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Beat Info */}
                          <div className="p-4">
                            <div className="mb-3">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
                                {beat.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{beat.producer}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">{beat.genre}</Badge>
                                <Badge variant="outline" className="text-xs">{beat.mood}</Badge>
                                {beat.isExclusive && (
                                  <Badge variant="destructive" className="text-xs">Exclusive</Badge>
                                )}
                              </div>
                          </div>
                          
                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                <Play className="w-3 h-3" />
                                  <span>{(beat.plays ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                  <span>{(beat.likes ?? 0).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 dark:text-white">${beat.price}</p>
                                <p className="text-xs">Starting from</p>
                              </div>
                            </div>

                            {/* License Options */}
                            <div className="space-y-2 mb-4">
                              {['basic', 'premium', 'unlimited'].map((license) => (
                                <div key={license} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <div>
                                    <p className="text-sm font-medium capitalize">{license}</p>
                                    <p className="text-xs text-gray-500">{getLicenseDescription(license)}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-semibold">${getLicensePrice(beat, license)}</span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToCart(beat, license)}
                                      className="h-8 px-3"
                                      data-testid={`button-add-to-cart-${beat.id}-${license}`}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                          
                            {/* Actions */}
                            <div className="flex space-x-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handlePurchase(beat, 'basic')}
                                data-testid={`button-buy-now-${beat.id}`}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                              Buy Now
                            </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShare(beat)}
                                data-testid={`button-share-${beat.id}`}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  )}
              </TabsContent>

              {/* Other tabs content will be added here */}
              <TabsContent value="producers" className="space-y-6">
                {!user ? (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login to View Producers</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Sign in to discover talented producers and follow your favorites
                      </p>
                      <Button 
                        onClick={() => window.location.href = '/login'}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                        data-testid="button-login-to-view-producers"
                      >
                        <Lock className="w-5 h-5 mr-2" />
                        Login to Continue
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Top Producers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {producers.length > 0 ? producers.slice(0, 12).map((producer) => (
                    <Card key={producer.id} className="hover:shadow-xl transition group cursor-pointer border-2 hover:border-blue-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center space-y-4">
                          {/* Producer Avatar */}
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 transition">
                              {producer.displayName?.substring(0, 2)?.toUpperCase() || 'PR'}
                            </div>
                            {producer.verified && (
                              <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Producer Info */}
                          <div className="text-center w-full">
                            <h4 className="font-bold text-lg group-hover:text-blue-600 transition">{producer.displayName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{producer.username}</p>
                            {producer.location && (
                              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{producer.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 w-full">
                            <div className="text-center">
                              <p className="text-xl font-bold text-blue-600">{producer.beats}</p>
                              <p className="text-xs text-gray-500">Beats</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-green-600">{producer.sales}</p>
                              <p className="text-xs text-gray-500">Sales</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-purple-600">{producer.followers}</p>
                              <p className="text-xs text-gray-500">Followers</p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(producer.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-sm font-semibold ml-2">{producer.rating.toFixed(1)}</span>
                          </div>

                          {/* Bio */}
                          {producer.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-2">
                              {producer.bio}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex space-x-2 w-full">
                            <Button 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => window.location.href = `/marketplace/producer/${producer.id}`}
                              data-testid={`button-view-profile-${producer.id}`}
                            >
                              View Profile
                            </Button>
                            {user && (
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => followProducerMutation.mutate(producer.id)}
                                disabled={followProducerMutation.isPending}
                                data-testid={`button-follow-${producer.id}`}
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full">
                      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-12 text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Producers Yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {user ? 'Be the first producer on Max Booster Marketplace!' : 'Login to become a producer on Max Booster Marketplace!'}
                          </p>
                          {user && (
                            <Button 
                              onClick={() => setShowUploadModal(true)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                              data-testid="button-upload-first-beat-producers"
                            >
                              <Upload className="w-5 h-5 mr-2" />
                              Upload Your First Beat
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Producer Filters */}
                {producers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Filter className="w-5 h-5 mr-2" />
                          Filter Producers
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="outline" size="sm" data-testid="button-filter-top-rated">
                          <Trophy className="w-4 h-4 mr-2" />
                          Top Rated
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-filter-most-sales">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Most Sales
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-filter-most-followers">
                          <Users className="w-4 h-4 mr-2" />
                          Most Followers
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-filter-verified-only">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verified Only
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="my-beats">
                {myBeatsLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : myBeats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBeats.map((beat: Beat) => (
                      <Card key={beat.id} className="group hover:shadow-xl transition-shadow duration-200">
                        <CardContent className="p-0">
                          <div className="relative aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden group">
                            {beat.artwork ? (
                              <img 
                                src={beat.artwork} 
                                alt={beat.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-16 h-16 text-white opacity-50" />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">{beat.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{beat.genre}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">${beat.price}</span>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline" data-testid={`button-edit-beat-${beat.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" data-testid={`button-delete-beat-${beat.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Music className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold mb-2">No Beats Uploaded Yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Upload your first beat to get started</p>
                      <Button onClick={() => setShowUploadModal(true)} data-testid="button-upload-first-beat">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Beat
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="purchases">
                {purchasesLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase: any) => (
                      <Card key={purchase.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                {purchase.beat?.artwork ? (
                                  <img 
                                    src={purchase.beat.artwork} 
                                    alt={purchase.beat.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Music className="w-8 h-8 text-white" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{purchase.beat?.title || 'Unknown Beat'}</h3>
                                <p className="text-sm text-muted-foreground">{purchase.licenseType} License</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold">${purchase.price}</span>
                              <Button size="sm" variant="outline" data-testid={`button-download-purchase-${purchase.id}`}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold mb-2">No Purchases Yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Browse beats to make your first purchase</p>
                      <Button onClick={() => setActiveTab('browse')} data-testid="button-browse-beats">
                        <Music className="w-4 h-4 mr-2" />
                        Browse Beats
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="sales" className="space-y-6">
                {salesAnalyticsLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : salesAnalytics ? (
                  <>
                    {/* Stripe Connect Banner */}
                    {!user?.stripeConnectedAccountId && (
                      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <div>
                              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Connect Your Payment Account</h3>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Connect your Stripe account to start receiving payments for your beat sales
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => connectStripeMutation.mutate()}
                            disabled={connectStripeMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="button-connect-stripe"
                          >
                            {connectStripeMutation.isPending ? 'Connecting...' : 'Connect Stripe'}
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Sales Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</p>
                              <p className="text-3xl font-bold text-green-900 dark:text-green-100">${salesAnalytics.totalRevenue || 0}</p>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{salesAnalytics.revenueChange || 'No change'}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Sales</p>
                              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{salesAnalytics.totalSales || 0}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{salesAnalytics.salesChange || 'No change'}</p>
                            </div>
                            <ShoppingCart className="w-8 h-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg. Sale Price</p>
                              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">${salesAnalytics.avgSalePrice || 0}</p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{salesAnalytics.priceChange || 'No change'}</p>
                            </div>
                            <Target className="w-8 h-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Conversion Rate</p>
                              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{salesAnalytics.conversionRate || 0}%</p>
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{salesAnalytics.conversionStatus || 'Average'}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                {/* Sales Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Sales Performance (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(salesAnalytics?.weeklyData || []).map((week: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{week.week}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{week.sales} sales</p>
                            </div>
                          </div>
                          <div className="flex-1">
                            <Progress value={week.sales > 0 ? (week.revenue / Math.max(...(salesAnalytics?.weeklyData || []).map((w: any) => w.revenue))) * 100 : 0} className="h-2" />
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">${week.revenue?.toFixed(2) || '0.00'}</p>
                            <p className="text-xs text-gray-500">${week.sales > 0 ? (week.revenue / week.sales).toFixed(2) : '0.00'}/beat</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Beats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="w-5 h-5 mr-2" />
                        Top Selling Beats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(salesAnalytics?.topBeats && salesAnalytics.topBeats.length > 0) ? (
                          salesAnalytics.topBeats.map((beat: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{beat.title}</p>
                                  <p className="text-xs text-gray-500">{beat.sales} sales</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">${beat.revenue?.toFixed(2) || '0.00'}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4">No sales data yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Customer Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">License Distribution</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Basic</span>
                                <span className="font-semibold">{salesAnalytics?.licenseDistribution?.basic?.toFixed(0) || 0}%</span>
                              </div>
                              <Progress value={salesAnalytics?.licenseDistribution?.basic || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Premium</span>
                                <span className="font-semibold">{salesAnalytics?.licenseDistribution?.premium?.toFixed(0) || 0}%</span>
                              </div>
                              <Progress value={salesAnalytics?.licenseDistribution?.premium || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Unlimited</span>
                                <span className="font-semibold">{salesAnalytics?.licenseDistribution?.unlimited?.toFixed(0) || 0}%</span>
                              </div>
                              <Progress value={salesAnalytics?.licenseDistribution?.unlimited || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Exclusive</span>
                                <span className="font-semibold">{salesAnalytics?.licenseDistribution?.exclusive?.toFixed(0) || 0}%</span>
                              </div>
                              <Progress value={salesAnalytics?.licenseDistribution?.exclusive || 0} className="h-2" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-3">Peak Sales Times</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-blue-600 dark:text-blue-400">Best Day</p>
                              <p className="font-bold text-blue-900 dark:text-blue-100">{salesAnalytics?.peakSalesTimes?.bestDay || 'N/A'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                              <p className="text-xs text-purple-600 dark:text-purple-400">Best Hour</p>
                              <p className="font-bold text-purple-900 dark:text-purple-100">{salesAnalytics?.peakSalesTimes?.bestHour || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export & Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Reports & Analytics
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" data-testid="button-export-csv">
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-generate-pdf">
                          <FileText className="w-4 h-4 mr-2" />
                          Generate PDF
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Monthly Report', icon: Calendar, color: 'blue', testId: 'button-report-monthly' },
                        { label: 'Tax Summary', icon: FileText, color: 'green', testId: 'button-report-tax' },
                        { label: 'Customer Data', icon: Users, color: 'purple', testId: 'button-report-customer' },
                        { label: 'Financial Stats', icon: PieChart, color: 'orange', testId: 'button-report-financial' },
                      ].map((report, index) => (
                        <Button key={index} variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2" data-testid={report.testId}>
                          <report.icon className={`w-6 h-6 text-${report.color}-600`} />
                          <span className="text-sm">{report.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold mb-2">No Sales Data Yet</p>
                      <p className="text-sm text-muted-foreground">Sales analytics will appear once you make your first sale</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Upload Beat Dialog */}
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Your Beat</DialogTitle>
                <DialogDescription>
                  Fill in the details below to upload your beat to the marketplace
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Beat Title *</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      placeholder="Enter beat title"
                      data-testid="input-beat-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre *</Label>
                    <Select value={uploadForm.genre} onValueChange={(value) => setUploadForm({ ...uploadForm, genre: value })}>
                      <SelectTrigger data-testid="select-beat-genre">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {BEAT_GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood *</Label>
                    <Select value={uploadForm.mood} onValueChange={(value) => setUploadForm({ ...uploadForm, mood: value })}>
                      <SelectTrigger data-testid="select-beat-mood">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {BEAT_MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempo">Tempo (BPM) *</Label>
                    <Input
                      id="tempo"
                      type="number"
                      value={uploadForm.tempo}
                      onChange={(e) => setUploadForm({ ...uploadForm, tempo: parseInt(e.target.value) })}
                      min="60"
                      max="200"
                      data-testid="input-beat-tempo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Key *</Label>
                    <Select value={uploadForm.key} onValueChange={(value) => setUploadForm({ ...uploadForm, key: value })}>
                      <SelectTrigger data-testid="select-beat-key">
                        <SelectValue placeholder="Select key" />
                      </SelectTrigger>
                      <SelectContent>
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={uploadForm.price}
                      onChange={(e) => setUploadForm({ ...uploadForm, price: parseInt(e.target.value) })}
                      min="1"
                      data-testid="input-beat-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type *</Label>
                  <Select value={uploadForm.licenseType} onValueChange={(value) => setUploadForm({ ...uploadForm, licenseType: value })}>
                    <SelectTrigger data-testid="select-license-type">
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic License</SelectItem>
                      <SelectItem value="premium">Premium License</SelectItem>
                      <SelectItem value="unlimited">Unlimited License</SelectItem>
                      <SelectItem value="exclusive">Exclusive Rights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Describe your beat..."
                    rows={3}
                    data-testid="textarea-beat-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="e.g., dark, trap, heavy bass"
                    data-testid="input-beat-tags"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio">Audio File (MP3/WAV) *</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/mp3"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    data-testid="input-audio-file"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverArt">Cover Art (JPG/PNG)</Label>
                  <Input
                    id="coverArt"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => setCoverArtFile(e.target.files?.[0] || null)}
                    data-testid="input-cover-art"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadModal(false)}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (!uploadForm.title || !uploadForm.genre || !audioFile) {
                      toast({
                        title: 'Missing Information',
                        description: 'Please fill in all required fields and upload an audio file',
                        variant: 'destructive'
                      });
                      return;
                    }
                    
                    const formData = new FormData();
                    formData.append('title', uploadForm.title);
                    formData.append('genre', uploadForm.genre);
                    formData.append('mood', uploadForm.mood);
                    formData.append('tempo', uploadForm.tempo.toString());
                    formData.append('key', uploadForm.key);
                    formData.append('price', uploadForm.price.toString());
                    formData.append('licenseType', uploadForm.licenseType);
                    formData.append('description', uploadForm.description);
                    formData.append('tags', uploadForm.tags);
                    formData.append('audioFile', audioFile);
                    if (coverArtFile) {
                      formData.append('coverArt', coverArtFile);
                    }
                    
                    uploadBeatMutation.mutate(formData);
                  }}
                  disabled={uploadBeatMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  data-testid="button-submit-upload"
                >
                  {uploadBeatMutation.isPending ? 'Uploading...' : 'Upload Beat'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AppLayout>
  );
}