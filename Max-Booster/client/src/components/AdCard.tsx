import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvertisement } from '@/hooks/use-advertisement';
import {
  Eye,
  MousePointerClick,
  Users,
  Play,
  TrendingUp,
  Edit2,
  Trash2,
  MoreHorizontal,
  Brain,
  Rocket,
  Shield,
  Crown
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

interface AdCardProps {
  ad: AdCampaign;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const objectiveIcons = {
  awareness: Eye,
  traffic: MousePointerClick,
  engagement: Users,
  conversions: Play,
  followers: TrendingUp
};

export default function AdCard({ ad, onEdit, onDelete, onView }: AdCardProps) {
  const { deleteAd, isDeleting } = useAdvertisement();
  
  const ObjectiveIcon = objectiveIcons[ad.objective as keyof typeof objectiveIcons] || Eye;
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteAd(ad.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ObjectiveIcon className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">{ad.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(ad.status)}>
            {ad.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {ad.objective.replace(/([A-Z])/g, ' $1').trim()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Optimization Badge */}
        {ad.aiOptimizations && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center">
                <Brain className="w-3 h-3 mr-1" />
                AI DOMINATION ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Performance:</span>
                <div className="font-semibold text-green-600">{ad.aiOptimizations.performanceBoost}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Cost:</span>
                <div className="font-semibold text-green-600">{ad.aiOptimizations.costReduction}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Viral Score:</span>
                <div className="font-semibold text-purple-600">
                  {(ad.aiOptimizations.viralityScore * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">AI Status:</span>
                <div className="font-semibold text-blue-600">Dominating</div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Ad Network Display */}
        {ad.personalAdNetwork && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                PERSONAL AD NETWORK
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-2">
              <div>
                <span className="text-muted-foreground">Connected:</span>
                <div className="font-semibold text-blue-600">
                  {ad.personalAdNetwork.connectedAccounts}/{ad.personalAdNetwork.totalPlatforms} Platforms
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Network Strength:</span>
                <div className="font-semibold text-green-600">{ad.personalAdNetwork.networkStrength}%</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <div>{ad.personalAdNetwork.personalizedReach}</div>
              <div className="mt-1">{ad.personalAdNetwork.organicAmplification}</div>
            </div>
          </div>
        )}

        {/* Campaign Metrics */}
        <div className="grid grid-cols-2 gap-4">
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
            <div className="font-semibold">{ad.impressions.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Clicks</div>
            <div className="font-semibold">{ad.clicks.toLocaleString()}</div>
          </div>
        </div>

        {/* AI Domination Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center">
              <Crown className="w-3 h-3 mr-1 text-purple-600" />
              AI Domination Progress
            </span>
            <span className="text-green-600">100% (Complete)</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Connected Platforms */}
        {ad.connectedPlatforms && (
          <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
            <div className="text-xs text-muted-foreground mb-2">Connected Platforms:</div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ad.connectedPlatforms).map(([platform, status]) => (
                <div key={platform} className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs capitalize">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-3 border-t border-blue-200 dark:border-blue-700">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(ad.id)}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(ad.id)}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? (
              <Brain className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3 mr-1" />
            )}
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
