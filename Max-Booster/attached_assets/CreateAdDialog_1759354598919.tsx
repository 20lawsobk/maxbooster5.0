import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdvertisement } from '@/hooks/use-advertisement';
import {
  Eye,
  MousePointerClick,
  Users,
  Play,
  TrendingUp,
  Music,
  Tv,
  Radio,
  Brain,
  Rocket,
} from 'lucide-react';

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function CreateAdDialog({ open, onOpenChange }: CreateAdDialogProps) {
  const { toast } = useToast();
  const { createCampaign, isCreating } = useAdvertisement();

  const [formData, setFormData] = useState({
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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Campaign Name Required',
        description: 'Please enter a name for your campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.objective) {
      toast({
        title: 'Objective Required',
        description: 'Please select a campaign objective.',
        variant: 'destructive',
      });
      return;
    }

    createCampaign(formData);
    onOpenChange(false);

    // Reset form
    setFormData({
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
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        interests: prev.targetAudience.interests.includes(interest)
          ? prev.targetAudience.interests.filter((i) => i !== interest)
          : [...prev.targetAudience.interests, interest],
      },
    }));
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        platforms: prev.targetAudience.platforms.includes(platform)
          ? prev.targetAudience.platforms.filter((p) => p !== platform)
          : [...prev.targetAudience.platforms, platform],
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <Label>Campaign Objective</Label>
            <div className="grid grid-cols-2 gap-3">
              {adObjectives.map(({ value, label, icon: Icon }) => (
                <div
                  key={value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.objective === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-border hover:border-blue-400'
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, objective: value }))}
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
                    ${formData.budget}
                  </div>
                  <div className="text-lg font-bold text-green-600">$0 (AI Elimination)</div>
                  <div className="text-xs text-muted-foreground">
                    AI completely eliminates all advertising costs through organic domination
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration (Days)</Label>
              <div className="space-y-3">
                <Slider
                  value={[formData.duration]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, duration: value[0] }))
                  }
                  max={30}
                  min={1}
                  step={1}
                />
                <div className="text-center font-semibold">{formData.duration} days</div>
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
                    formData.targetAudience.platforms.includes(value)
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-border hover:border-green-400'
                  }`}
                  onClick={() => togglePlatform(value)}
                >
                  <Icon className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                  {formData.targetAudience.platforms.includes(value) && (
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
                <Label className="text-sm">Min Age: {formData.targetAudience.ageMin}</Label>
                <Slider
                  value={[formData.targetAudience.ageMin]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
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
                <Label className="text-sm">Max Age: {formData.targetAudience.ageMax}</Label>
                <Slider
                  value={[formData.targetAudience.ageMax]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
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
                    formData.targetAudience.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-border hover:border-blue-400'
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              {isCreating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Activating AI...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Activate AI Domination
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
