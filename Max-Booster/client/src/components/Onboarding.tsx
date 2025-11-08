import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Music, 
  Mic, 
  BarChart3, 
  Share2, 
  DollarSign, 
  ShoppingBag, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Upload,
  User,
  Bell,
  CreditCard,
  Sparkles,
  Rocket,
  Trophy,
  Star,
  X,
  Info,
  Zap,
  Globe,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Settings
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

interface TourStep {
  target: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'dashboard',
    title: 'Your Command Center',
    content: 'The Dashboard gives you a complete overview of your music career metrics, revenue, and recent activity.',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    target: 'studio',
    title: 'Create and Produce Music',
    content: 'Our professional Studio features advanced DAW capabilities, AI-powered mixing, and virtual instruments.',
    icon: <Music className="w-5 h-5" />
  },
  {
    target: 'distribution',
    title: 'Share Your Music Worldwide',
    content: 'Distribute your music to 150+ platforms including Spotify, Apple Music, and YouTube with just a few clicks.',
    icon: <Globe className="w-5 h-5" />
  },
  {
    target: 'analytics',
    title: 'Track Your Performance',
    content: 'Get detailed insights about your listeners, streaming performance, and revenue across all platforms.',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    target: 'social-media',
    title: 'Grow Your Audience',
    content: 'Connect all your social platforms and use AI to generate engaging content and schedule posts.',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    target: 'royalties',
    title: 'Manage Your Earnings',
    content: 'Track royalties, view payment history, and manage your revenue streams all in one place.',
    icon: <DollarSign className="w-5 h-5" />
  },
  {
    target: 'marketplace',
    title: 'Connect with Producers',
    content: 'Buy and sell beats, collaborate with other artists, and expand your creative network.',
    icon: <ShoppingBag className="w-5 h-5" />
  }
];

const GENRE_OPTIONS = [
  'Hip Hop', 'Pop', 'Rock', 'Electronic', 'R&B', 'Country',
  'Jazz', 'Classical', 'Reggae', 'Latin', 'Alternative', 'Indie'
];

const USER_TYPES = [
  { value: 'artist', label: 'Artist', icon: <Mic className="w-4 h-4" /> },
  { value: 'producer', label: 'Producer', icon: <Music className="w-4 h-4" /> },
  { value: 'marketer', label: 'Marketer', icon: <Share2 className="w-4 h-4" /> }
];

export default function Onboarding({ onComplete, onSkip, isOpen }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [profileData, setProfileData] = useState({
    artistName: '',
    userType: '',
    genres: [] as string[],
    emailNotifications: true,
    browserNotifications: true,
    profileImage: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const saveProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/auth/onboarding', data);
    },
    onSuccess: () => {
      localStorage.setItem('onboardingProgress', JSON.stringify({ step, tourStep }));
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/auth/complete-onboarding', {
        ...data,
        hasCompletedOnboarding: true
      });
    },
    onSuccess: () => {
      localStorage.removeItem('onboardingProgress');
      toast({
        title: '🎉 Welcome to Max Booster!',
        description: 'Your account setup is complete. Let\'s make some music!',
      });
      onComplete();
    }
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem('onboardingProgress');
    if (savedProgress) {
      const { step: savedStep, tourStep: savedTourStep } = JSON.parse(savedProgress);
      setStep(savedStep);
      setTourStep(savedTourStep);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      saveProgressMutation.mutate({ step: 1, tourStep: 0 });
    } else if (step === 1) {
      if (tourStep < TOUR_STEPS.length - 1) {
        setTourStep(tourStep + 1);
        saveProgressMutation.mutate({ step: 1, tourStep: tourStep + 1 });
      } else {
        setStep(2);
        saveProgressMutation.mutate({ step: 2, tourStep: 0 });
      }
    } else if (step === 2) {
      setStep(3);
      saveProgressMutation.mutate({ step: 3, tourStep: 0 });
    } else if (step === 3) {
      completeOnboardingMutation.mutate(profileData);
    }
  };

  const handlePrevious = () => {
    if (step === 1 && tourStep > 0) {
      setTourStep(tourStep - 1);
      saveProgressMutation.mutate({ step: 1, tourStep: tourStep - 1 });
    } else if (step > 0) {
      setStep(step - 1);
      if (step === 1) {
        saveProgressMutation.mutate({ step: 0, tourStep: 0 });
      } else {
        saveProgressMutation.mutate({ step: step - 1, tourStep: 0 });
      }
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('onboardingProgress');
    onSkip();
  };

  const getFirstActionByUserType = () => {
    switch (profileData.userType) {
      case 'artist':
        return {
          title: 'Upload Your First Track',
          description: 'Start by uploading your music to our platform',
          icon: <Upload className="w-6 h-6" />,
          action: () => navigate('/studio')
        };
      case 'producer':
        return {
          title: 'List Your First Beat',
          description: 'Add your beats to the marketplace and start earning',
          icon: <Music className="w-6 h-6" />,
          action: () => navigate('/marketplace')
        };
      case 'marketer':
        return {
          title: 'Create Your First Campaign',
          description: 'Launch a marketing campaign to promote music',
          icon: <Rocket className="w-6 h-6" />,
          action: () => navigate('/advertising')
        };
      default:
        return {
          title: 'Explore the Platform',
          description: 'Discover all the features Max Booster has to offer',
          icon: <Sparkles className="w-6 h-6" />,
          action: () => navigate('/dashboard')
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="absolute right-4 top-4"
                  data-testid="skip-onboarding"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Progress Bar */}
                {step > 0 && (
                  <div className="mb-4">
                    <Progress 
                      value={step === 1 ? 
                        (25 + ((tourStep + 1) / TOUR_STEPS.length) * 25) : 
                        (step / 3) * 100
                      } 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Step 0: Welcome */}
                {step === 0 && (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                        <Music className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl text-center">
                      Welcome to Max Booster!
                    </CardTitle>
                    <CardDescription className="text-center text-lg mt-2">
                      Your all-in-one platform for music creation, distribution, and career management
                    </CardDescription>
                  </>
                )}

                {/* Step 1: Guided Tour */}
                {step === 1 && (
                  <>
                    <CardTitle className="flex items-center gap-2">
                      {TOUR_STEPS[tourStep].icon}
                      {TOUR_STEPS[tourStep].title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Step {tourStep + 1} of {TOUR_STEPS.length}
                    </CardDescription>
                  </>
                )}

                {/* Step 2: Profile Setup */}
                {step === 2 && (
                  <>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Complete Your Profile
                    </CardTitle>
                    <CardDescription>
                      Let's personalize your experience
                    </CardDescription>
                  </>
                )}

                {/* Step 3: First Actions */}
                {step === 3 && (
                  <>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      You're All Set!
                    </CardTitle>
                    <CardDescription>
                      Let's get started with your first action
                    </CardDescription>
                  </>
                )}
              </CardHeader>

              <CardContent>
                {/* Step 0: Welcome Content */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <Music className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Studio Production</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Global Distribution</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Analytics & Insights</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">100% Royalties</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Social Media Tools</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">AI-Powered Features</p>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                      <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
                        Start Guided Tour
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={handleSkip} 
                        className="w-full sm:w-auto ml-0 sm:ml-2"
                      >
                        Skip for Now
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 1: Tour Content */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-muted">
                      <p className="text-base leading-relaxed">
                        {TOUR_STEPS[tourStep].content}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {TOUR_STEPS.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index <= tourStep ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handlePrevious}
                        disabled={tourStep === 0 && step === 1}
                      >
                        <ChevronLeft className="mr-2 w-4 h-4" />
                        Previous
                      </Button>
                      <Button onClick={handleNext}>
                        {tourStep === TOUR_STEPS.length - 1 ? 'Continue Setup' : 'Next'}
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Profile Setup */}
                {step === 2 && (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <Label htmlFor="profile-image" className="cursor-pointer">
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </span>
                        </Button>
                      </Label>
                    </div>

                    {/* Artist Name */}
                    <div className="space-y-2">
                      <Label htmlFor="artist-name">Artist/Producer Name</Label>
                      <Input
                        id="artist-name"
                        placeholder="Enter your stage name"
                        value={profileData.artistName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, artistName: e.target.value }))}
                      />
                    </div>

                    {/* User Type */}
                    <div className="space-y-2">
                      <Label>I am a...</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {USER_TYPES.map((type) => (
                          <Button
                            key={type.value}
                            variant={profileData.userType === type.value ? 'default' : 'outline'}
                            onClick={() => setProfileData(prev => ({ ...prev, userType: type.value }))}
                            className="justify-start"
                          >
                            {type.icon}
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="space-y-2">
                      <Label>Select Your Genres (Choose up to 3)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {GENRE_OPTIONS.map((genre) => (
                          <Button
                            key={genre}
                            size="sm"
                            variant={profileData.genres.includes(genre) ? 'default' : 'outline'}
                            onClick={() => {
                              setProfileData(prev => {
                                const newGenres = prev.genres.includes(genre)
                                  ? prev.genres.filter(g => g !== genre)
                                  : prev.genres.length < 3
                                    ? [...prev.genres, genre]
                                    : prev.genres;
                                return { ...prev, genres: newGenres };
                              });
                            }}
                            disabled={!profileData.genres.includes(genre) && profileData.genres.length >= 3}
                          >
                            {genre}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="space-y-4 p-4 rounded-lg bg-muted">
                      <h3 className="font-medium flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notification Preferences
                      </h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notif">Email Notifications</Label>
                        <Switch
                          id="email-notif"
                          checked={profileData.emailNotifications}
                          onCheckedChange={(checked) => 
                            setProfileData(prev => ({ ...prev, emailNotifications: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="browser-notif">Browser Notifications</Label>
                        <Switch
                          id="browser-notif"
                          checked={profileData.browserNotifications}
                          onCheckedChange={(checked) => 
                            setProfileData(prev => ({ ...prev, browserNotifications: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handlePrevious}>
                        <ChevronLeft className="mr-2 w-4 h-4" />
                        Back
                      </Button>
                      <Button onClick={handleNext}>
                        Continue
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  </ScrollArea>
                )}

                {/* Step 3: First Actions */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">
                        Congratulations, {profileData.artistName || user?.firstName || 'Artist'}!
                      </h3>
                      <p className="text-muted-foreground">
                        Your profile is all set up. Let's start your journey!
                      </p>
                    </div>

                    {profileData.userType && (
                      <div className="p-6 rounded-lg border-2 border-primary/20 bg-card">
                        <div className="flex items-start gap-4">
                          {getFirstActionByUserType().icon}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {getFirstActionByUserType().title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {getFirstActionByUserType().description}
                            </p>
                            <Button 
                              onClick={() => {
                                completeOnboardingMutation.mutate(profileData);
                                getFirstActionByUserType().action();
                              }}
                            >
                              Get Started
                              <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                            onClick={() => {
                              completeOnboardingMutation.mutate(profileData);
                              navigate('/studio');
                            }}>
                        <Music className="w-8 h-8 mb-2 text-primary" />
                        <h4 className="font-medium mb-1">Open Studio</h4>
                        <p className="text-xs text-muted-foreground">Create your next hit</p>
                      </Card>
                      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              completeOnboardingMutation.mutate(profileData);
                              navigate('/dashboard');
                            }}>
                        <BarChart3 className="w-8 h-8 mb-2 text-primary" />
                        <h4 className="font-medium mb-1">View Dashboard</h4>
                        <p className="text-xs text-muted-foreground">Check your stats</p>
                      </Card>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handlePrevious}>
                        <ChevronLeft className="mr-2 w-4 h-4" />
                        Back
                      </Button>
                      <Button onClick={() => completeOnboardingMutation.mutate(profileData)}>
                        Complete Setup
                        <Check className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}