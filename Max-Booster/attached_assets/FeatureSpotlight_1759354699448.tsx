import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  Target,
  Music,
  TrendingUp,
  Share2,
  BarChart3,
  Crown,
  Play,
  ArrowRight,
  X,
  Lightbulb,
  Rocket,
  Award,
  CheckCircle,
  Star,
  Heart,
  MessageCircle,
  Download,
  Upload,
  Volume2,
  Headphones,
  Mic,
  Video,
  Image,
  Link,
} from 'lucide-react';

interface SpotlightFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  impact: 'high' | 'revolutionary';
  benefits: string[];
  stats: {
    timeSaved: string;
    costSaved: string;
    performanceBoost: string;
  };
  demoUrl?: string;
  tutorialUrl?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const spotlightFeatures: SpotlightFeature[] = [
  {
    id: 'ai-advertising',
    title: 'Revolutionary AI Advertising',
    description: 'Zero-cost advertising that outperforms paid campaigns by 1000%',
    icon: <Target className="w-8 h-8" />,
    category: 'Advertising',
    impact: 'revolutionary',
    benefits: [
      'Eliminate all ad spend',
      '15% viral success rate',
      'Algorithm domination',
      '1000% better performance than native ads',
    ],
    stats: {
      timeSaved: '10+ hours/week',
      costSaved: '$5000+/month',
      performanceBoost: '1000%',
    },
    isNew: true,
    isPopular: true,
  },
  {
    id: 'ai-mixing',
    title: 'AI-Powered Mixing',
    description: 'Professional-grade mixing with AI assistance',
    icon: <Volume2 className="w-8 h-8" />,
    category: 'Studio',
    impact: 'high',
    benefits: [
      'Studio-quality results',
      'Save $1000s in studio costs',
      'Learn from AI feedback',
      'Professional-grade output',
    ],
    stats: {
      timeSaved: '5+ hours/track',
      costSaved: '$2000+/track',
      performanceBoost: '95% quality',
    },
    isPopular: true,
  },
  {
    id: 'social-automation',
    title: 'Social Media Automation',
    description: 'AI-optimized content for 8 platforms with automated scheduling',
    icon: <Share2 className="w-8 h-8" />,
    category: 'Social Media',
    impact: 'high',
    benefits: [
      '10x engagement increase',
      'Save 5+ hours weekly',
      'Professional presence',
      'Automated scheduling',
    ],
    stats: {
      timeSaved: '5+ hours/week',
      costSaved: '$500+/month',
      performanceBoost: '1000% engagement',
    },
    isPopular: true,
  },
  {
    id: 'ai-content-generation',
    title: 'AI Content Generation',
    description: 'Generate images, videos, and audio for social media',
    icon: <Sparkles className="w-8 h-8" />,
    category: 'Content Creation',
    impact: 'high',
    benefits: [
      'Professional content creation',
      'Save hours of work',
      'Increase engagement',
      'Platform-optimized output',
    ],
    stats: {
      timeSaved: '3+ hours/post',
      costSaved: '$200+/post',
      performanceBoost: '500% engagement',
    },
    isNew: true,
    isPopular: true,
  },
];

interface FeatureSpotlightProps {
  onClose: () => void;
  onExploreFeature: (featureId: string) => void;
}

export default function FeatureSpotlight({ onClose, onExploreFeature }: FeatureSpotlightProps) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentFeature = spotlightFeatures[currentFeatureIndex];

  // Auto-advance spotlight
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % spotlightFeatures.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNext = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % spotlightFeatures.length);
  };

  const handlePrevious = () => {
    setCurrentFeatureIndex(
      (prev) => (prev - 1 + spotlightFeatures.length) % spotlightFeatures.length
    );
  };

  const handleExplore = () => {
    onExploreFeature(currentFeature.id);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'revolutionary':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Feature Spotlight</h2>
              <p className="text-gray-600">Discover the most powerful features</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Feature Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Info */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  {currentFeature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{currentFeature.title}</h3>
                    {currentFeature.isNew && (
                      <Badge className="bg-green-100 text-green-800">New</Badge>
                    )}
                    {currentFeature.isPopular && (
                      <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{currentFeature.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getImpactColor(currentFeature.impact)}>
                      {currentFeature.impact} impact
                    </Badge>
                    <Badge variant="outline">{currentFeature.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Key Benefits</h4>
                <div className="space-y-2">
                  {currentFeature.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Impact Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {currentFeature.stats.timeSaved}
                    </div>
                    <div className="text-xs text-gray-600">Time Saved</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentFeature.stats.costSaved}
                    </div>
                    <div className="text-xs text-gray-600">Cost Saved</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentFeature.stats.performanceBoost}
                    </div>
                    <div className="text-xs text-gray-600">Performance</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button onClick={handleExplore} className="flex-1">
                  <Rocket className="w-4 h-4 mr-2" />
                  Explore Feature
                </Button>
                {currentFeature.tutorialUrl && (
                  <Button variant="outline">
                    <Award className="w-4 h-4 mr-2" />
                    Tutorial
                  </Button>
                )}
                {currentFeature.demoUrl && (
                  <Button variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                )}
              </div>
            </div>

            {/* Visual/Preview */}
            <div className="space-y-6">
              {/* Feature Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="p-4 bg-white rounded-full inline-block mb-4 shadow-lg">
                    {currentFeature.icon}
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Feature Preview</h4>
                  <p className="text-gray-600 text-sm">
                    Interactive demo and preview of {currentFeature.title}
                  </p>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-4">
                <div className="flex justify-center space-x-2">
                  {spotlightFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeatureIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentFeatureIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentFeatureIndex === 0}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentFeatureIndex === spotlightFeatures.length - 1}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium">{currentFeature.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Impact Level</span>
                    <span className="text-sm font-medium capitalize">{currentFeature.impact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium">
                      {currentFeature.isNew ? 'New Feature' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
