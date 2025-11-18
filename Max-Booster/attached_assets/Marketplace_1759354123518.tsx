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
  Tongue,
  Wink2,
  Grin,
  Grin2,
  GrinBeam,
  GrinBeam2,
  GrinHearts,
  GrinHearts2,
  GrinSquint,
  GrinSquint2,
  GrinSquintTears,
  GrinSquintTears2,
  GrinStars,
  GrinStars2,
  GrinTears,
  GrinTears2,
  GrinTongue,
  GrinTongue2,
  GrinTongueSquint,
  GrinTongueSquint2,
  GrinTongueWink,
  GrinTongueWink2,
  GrinWink,
  GrinWink2,
  KissBeam,
  KissBeam2,
  KissWinkHeart,
  KissWinkHeart2,
  LaughBeam,
  LaughBeam2,
  LaughSquint,
  LaughSquint2,
  LaughWink,
  LaughWink2,
  SadCry,
  SadCry2,
  SadTear,
  SadTear2,
  SmileBeam,
  SmileBeam2,
  SmileWink,
  SmileWink2,
  Tired,
  Tired2,
  Wink2 as Wink2Icon,
  Dizzy,
  Dizzy2,
  Expressionless,
  Expressionless2,
  FrownOpen,
  FrownOpen2,
  Grimace,
  Grimace2,
  Hushed,
  Hushed2,
  MehBlank,
  MehBlank2,
  MehRollingEyes,
  MehRollingEyes2,
  OpenMouth,
  OpenMouth2,
  RollingEyes,
  RollingEyes2,
  StuckOutTongue,
  StuckOutTongue2,
  StuckOutTongueClosedEyes,
  StuckOutTongueClosedEyes2,
  StuckOutTongueWinkingEye,
  StuckOutTongueWinkingEye2,
  Squint,
  Squint2,
  Surprised2,
  Surprised2 as Surprised2Icon,
  Surprised2 as Surprised2Icon2,
  Surprised2 as Surprised2Icon3,
  Surprised2 as Surprised2Icon4,
  Surprised2 as Surprised2Icon5,
  Surprised2 as Surprised2Icon6,
  Surprised2 as Surprised2Icon7,
  Surprised2 as Surprised2Icon8,
  Surprised2 as Surprised2Icon9,
  Surprised2 as Surprised2Icon10,
  Surprised2 as Surprised2Icon11,
  Surprised2 as Surprised2Icon12,
  Surprised2 as Surprised2Icon13,
  Surprised2 as Surprised2Icon14,
  Surprised2 as Surprised2Icon15,
  Surprised2 as Surprised2Icon16,
  Surprised2 as Surprised2Icon17,
  Surprised2 as Surprised2Icon18,
  Surprised2 as Surprised2Icon19,
  Surprised2 as Surprised2Icon20,
  Surprised2 as Surprised2Icon21,
  Surprised2 as Surprised2Icon22,
  Surprised2 as Surprised2Icon23,
  Surprised2 as Surprised2Icon24,
  Surprised2 as Surprised2Icon25,
  Surprised2 as Surprised2Icon26,
  Surprised2 as Surprised2Icon27,
  Surprised2 as Surprised2Icon28,
  Surprised2 as Surprised2Icon29,
  Surprised2 as Surprised2Icon30,
  Surprised2 as Surprised2Icon31,
  Surprised2 as Surprised2Icon32,
  Surprised2 as Surprised2Icon33,
  Surprised2 as Surprised2Icon34,
  Surprised2 as Surprised2Icon35,
  Surprised2 as Surprised2Icon36,
  Surprised2 as Surprised2Icon37,
  Surprised2 as Surprised2Icon38,
  Surprised2 as Surprised2Icon39,
  Surprised2 as Surprised2Icon40,
  Surprised2 as Surprised2Icon41,
  Surprised2 as Surprised2Icon42,
  Surprised2 as Surprised2Icon43,
  Surprised2 as Surprised2Icon44,
  Surprised2 as Surprised2Icon45,
  Surprised2 as Surprised2Icon46,
  Surprised2 as Surprised2Icon47,
  Surprised2 as Surprised2Icon48,
  Surprised2 as Surprised2Icon49,
  Surprised2 as Surprised2Icon50,
  Surprised2 as Surprised2Icon51,
  Surprised2 as Surprised2Icon52,
  Surprised2 as Surprised2Icon53,
  Surprised2 as Surprised2Icon54,
  Surprised2 as Surprised2Icon55,
  Surprised2 as Surprised2Icon56,
  Surprised2 as Surprised2Icon57,
  Surprised2 as Surprised2Icon58,
  Surprised2 as Surprised2Icon59,
  Surprised2 as Surprised2Icon60,
  Surprised2 as Surprised2Icon61,
  Surprised2 as Surprised2Icon62,
  Surprised2 as Surprised2Icon63,
  Surprised2 as Surprised2Icon64,
  Surprised2 as Surprised2Icon65,
  Surprised2 as Surprised2Icon66,
  Surprised2 as Surprised2Icon67,
  Surprised2 as Surprised2Icon68,
  Surprised2 as Surprised2Icon69,
  Surprised2 as Surprised2Icon70,
  Surprised2 as Surprised2Icon71,
  Surprised2 as Surprised2Icon72,
  Surprised2 as Surprised2Icon73,
  Surprised2 as Surprised2Icon74,
  Surprised2 as Surprised2Icon75,
  Surprised2 as Surprised2Icon76,
  Surprised2 as Surprised2Icon77,
  Surprised2 as Surprised2Icon78,
  Surprised2 as Surprised2Icon79,
  Surprised2 as Surprised2Icon80,
  Surprised2 as Surprised2Icon81,
  Surprised2 as Surprised2Icon82,
  Surprised2 as Surprised2Icon83,
  Surprised2 as Surprised2Icon84,
  Surprised2 as Surprised2Icon85,
  Surprised2 as Surprised2Icon86,
  Surprised2 as Surprised2Icon87,
  Surprised2 as Surprised2Icon88,
  Surprised2 as Surprised2Icon89,
  Surprised2 as Surprised2Icon90,
  Surprised2 as Surprised2Icon91,
  Surprised2 as Surprised2Icon92,
  Surprised2 as Surprised2Icon93,
  Surprised2 as Surprised2Icon94,
  Surprised2 as Surprised2Icon95,
  Surprised2 as Surprised2Icon96,
  Surprised2 as Surprised2Icon97,
  Surprised2 as Surprised2Icon98,
  Surprised2 as Surprised2Icon99,
  Surprised2 as Surprised2Icon100,
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
  'Hip-Hop',
  'Trap',
  'R&B',
  'Pop',
  'Rock',
  'Electronic',
  'Jazz',
  'Blues',
  'Country',
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
];

// Beat Moods
const BEAT_MOODS = [
  'Aggressive',
  'Chill',
  'Dark',
  'Happy',
  'Sad',
  'Energetic',
  'Relaxed',
  'Romantic',
  'Mysterious',
  'Uplifting',
  'Melancholic',
  'Confident',
  'Nostalgic',
  'Futuristic',
  'Vintage',
  'Modern',
  'Classic',
  'Experimental',
];

export default function Marketplace() {
  const user = useRequireSubscription();
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

  // Data Queries
  const { data: beats = [], isLoading: beatsLoading } = useQuery<Beat[]>({
    queryKey: [
      '/api/marketplace/beats',
      { search: searchQuery, genre: selectedGenre, mood: selectedMood, sort: sortBy },
    ],
  });

  const { data: producers = [], isLoading: producersLoading } = useQuery<Producer[]>({
    queryKey: ['/api/marketplace/producers'],
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ['/api/marketplace/purchases'],
  });

  // Mutations
  const purchaseBeatMutation = useMutation({
    mutationFn: async (data: { beatId: string; licenseType: string }) => {
      const response = await apiRequest('POST', '/api/marketplace/purchase', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Purchase Successful!',
        description: `You've successfully purchased the beat. Download link sent to your email.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/purchases'] });
    },
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

  // Handler Functions
  const handlePlayPause = (beatId: string) => {
    if (isPlaying === beatId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(beatId);
    }
  };

  const handleAddToCart = (beat: Beat, licenseType: string) => {
    const existingItem = cart.find(
      (item) => item.beatId === beat.id && item.licenseType === licenseType
    );
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

  const getLicensePrice = (beat: Beat, licenseType: string): number => {
    const basePrice = beat.price;
    switch (licenseType) {
      case 'basic':
        return basePrice;
      case 'premium':
        return basePrice * 2;
      case 'unlimited':
        return basePrice * 5;
      case 'exclusive':
        return basePrice * 20;
      default:
        return basePrice;
    }
  };

  const getLicenseDescription = (licenseType: string): string => {
    switch (licenseType) {
      case 'basic':
        return 'Basic lease - 5,000 copies, 1 year';
      case 'premium':
        return 'Premium lease - 50,000 copies, 2 years';
      case 'unlimited':
        return 'Unlimited lease - Unlimited copies, 5 years';
      case 'exclusive':
        return 'Exclusive rights - Full ownership';
      default:
        return '';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <TopBar title="Max Booster Marketplace" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
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
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-purple-50"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Instant Downloads
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Global Community
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Beat
                  </Button>
                  <Button variant="outline">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({cart.length})
                  </Button>
                </div>
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
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {BEAT_GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedMood} onValueChange={setSelectedMood}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Moods</SelectItem>
                        {BEAT_MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
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
              <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="browse"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Browse Beats
                </TabsTrigger>
                <TabsTrigger
                  value="producers"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Producers
                </TabsTrigger>
                <TabsTrigger
                  value="my-beats"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  My Beats
                </TabsTrigger>
                <TabsTrigger
                  value="purchases"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  My Purchases
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Sales
                </TabsTrigger>
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
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Beats Found
                      </h3>
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
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
                  >
                    {beats.map((beat) => (
                      <Card
                        key={beat.id}
                        className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                      >
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
                              >
                                {isPlaying === beat.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge
                                variant="secondary"
                                className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
                              >
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
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                {beat.producer}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {beat.genre}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {beat.mood}
                                </Badge>
                                {beat.isExclusive && (
                                  <Badge variant="destructive" className="text-xs">
                                    Exclusive
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Play className="w-3 h-3" />
                                  <span>{beat.plays.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{beat.likes.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Download className="w-3 h-3" />
                                  <span>{beat.downloads.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  ${beat.price}
                                </p>
                                <p className="text-xs">Starting from</p>
                              </div>
                            </div>

                            {/* License Options */}
                            <div className="space-y-2 mb-4">
                              {['basic', 'premium', 'unlimited'].map((license) => (
                                <div
                                  key={license}
                                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                >
                                  <div>
                                    <p className="text-sm font-medium capitalize">{license}</p>
                                    <p className="text-xs text-gray-500">
                                      {getLicenseDescription(license)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-semibold">
                                      ${getLicensePrice(beat, license)}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToCart(beat, license)}
                                      className="h-8 px-3"
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
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Buy Now
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Share beat
                                }}
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
              <TabsContent value="producers">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Producers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Producer profiles coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-beats">
                <Card>
                  <CardHeader>
                    <CardTitle>My Beats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Your uploaded beats will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases">
                <Card>
                  <CardHeader>
                    <CardTitle>My Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Your purchased beats will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Sales analytics coming soon</p>
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
