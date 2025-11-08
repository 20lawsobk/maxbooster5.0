import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Pause,
  Volume2,
  Mic,
  Headphones,
  Video,
  Image,
  Link,
  Search,
  Filter,
  Star,
  Heart,
  MessageCircle,
  Download,
  Upload,
  Settings,
  HelpCircle,
  Lightbulb,
  Rocket,
  Award,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'studio' | 'distribution' | 'social' | 'analytics' | 'marketplace' | 'advertising';
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  impact: 'low' | 'medium' | 'high' | 'revolutionary';
  timeToLearn: string;
  benefits: string[];
  useCases: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isPro?: boolean;
  tutorialUrl?: string;
  demoUrl?: string;
}

const features: Feature[] = [
  {
    id: 'ai-advertising',
    title: 'Revolutionary AI Advertising',
    description: 'Zero-cost advertising that outperforms paid campaigns by 1000%',
    category: 'advertising',
    icon: <Target className="w-6 h-6" />,
    difficulty: 'advanced',
    impact: 'revolutionary',
    timeToLearn: '10 minutes',
    benefits: ['Eliminate ad spend', '15% viral success rate', 'Algorithm domination'],
    useCases: ['Promote new releases', 'Build fanbase', 'Increase streams'],
    isNew: true,
    isPopular: true,
    isPro: true
  },
  {
    id: 'ai-mixing',
    title: 'AI-Powered Mixing',
    description: 'Professional-grade mixing with AI assistance',
    category: 'studio',
    icon: <Volume2 className="w-6 h-6" />,
    difficulty: 'intermediate',
    impact: 'high',
    timeToLearn: '5 minutes',
    benefits: ['Studio-quality results', 'Save $1000s', 'Learn from AI'],
    useCases: ['Mix tracks', 'Master songs', 'Learn mixing'],
    isPopular: true
  },
  {
    id: 'ai-mastering',
    title: 'AI Mastering Engine',
    description: 'Automatic mastering that rivals professional engineers',
    category: 'studio',
    icon: <Headphones className="w-6 h-6" />,
    difficulty: 'beginner',
    impact: 'high',
    timeToLearn: '2 minutes',
    benefits: ['Professional mastering', 'Instant results', 'Cost savings'],
    useCases: ['Master tracks', 'Prepare for distribution', 'Optimize sound'],
    isPopular: true
  },
  {
    id: 'social-automation',
    title: 'Social Media Automation',
    description: 'AI-optimized content for 8 platforms with automated scheduling',
    category: 'social',
    icon: <Share2 className="w-6 h-6" />,
    difficulty: 'beginner',
    impact: 'high',
    timeToLearn: '3 minutes',
    benefits: ['10x engagement', 'Save 5+ hours weekly', 'Professional presence'],
    useCases: ['Promote music', 'Build audience', 'Increase engagement'],
    isPopular: true
  },
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics',
    description: '50+ metrics with AI predictions and growth optimization',
    category: 'analytics',
    icon: <BarChart3 className="w-6 h-6" />,
    difficulty: 'intermediate',
    impact: 'high',
    timeToLearn: '5 minutes',
    benefits: ['Data-driven decisions', 'Predict trends', 'Maximize performance'],
    useCases: ['Track performance', 'Optimize strategy', 'Predict growth'],
    isPopular: true
  },
  {
    id: 'beat-marketplace',
    title: 'Beat Marketplace',
    description: 'Peer-to-peer beat sales with secure transactions',
    category: 'marketplace',
    icon: <Music className="w-6 h-6" />,
    difficulty: 'beginner',
    impact: 'medium',
    timeToLearn: '3 minutes',
    benefits: ['Monetize beats', 'Find collaborators', 'Build network'],
    useCases: ['Sell beats', 'Buy beats', 'Collaborate'],
    isPopular: true
  },
  {
    id: 'hyperfollow',
    title: 'HyperFollow Campaigns',
    description: 'Pre-save campaigns that maximize release impact',
    category: 'distribution',
    icon: <TrendingUp className="w-6 h-6" />,
    difficulty: 'beginner',
    impact: 'high',
    timeToLearn: '2 minutes',
    benefits: ['Maximize streams', 'Build anticipation', 'Increase reach'],
    useCases: ['Promote releases', 'Build fanbase', 'Increase streams'],
    isPopular: true
  },
  {
    id: 'ai-content-generation',
    title: 'AI Content Generation',
    description: 'Generate images, videos, and audio for social media',
    category: 'social',
    icon: <Sparkles className="w-6 h-6" />,
    difficulty: 'beginner',
    impact: 'high',
    timeToLearn: '2 minutes',
    benefits: ['Professional content', 'Save time', 'Increase engagement'],
    useCases: ['Create posts', 'Generate visuals', 'Produce content'],
    isNew: true,
    isPopular: true
  },
  {
    id: 'url-content-extraction',
    title: 'URL Content Extraction',
    description: 'Extract and optimize content from any URL',
    category: 'ai',
    icon: <Link className="w-6 h-6" />,
    difficulty: 'beginner',
    impact: 'medium',
    timeToLearn: '1 minute',
    benefits: ['Quick content creation', 'Optimize existing content', 'Save time'],
    useCases: ['Share music', 'Promote content', 'Create posts'],
    isNew: true
  },
  {
    id: 'collaboration-tools',
    title: 'Real-time Collaboration',
    description: 'Collaborate with other artists in real-time',
    category: 'studio',
    icon: <Mic className="w-6 h-6" />,
    difficulty: 'intermediate',
    impact: 'medium',
    timeToLearn: '5 minutes',
    benefits: ['Remote collaboration', 'Real-time feedback', 'Creative synergy'],
    useCases: ['Work with producers', 'Get feedback', 'Create together'],
    isPro: true
  }
];

interface FeatureDiscoveryProps {
  onClose: () => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export default function FeatureDiscovery({ onClose, userLevel }: FeatureDiscoveryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveredFeatures, setDiscoveredFeatures] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Features', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'ai', name: 'AI Features', icon: <Zap className="w-4 h-4" /> },
    { id: 'studio', name: 'Studio', icon: <Music className="w-4 h-4" /> },
    { id: 'distribution', name: 'Distribution', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'social', name: 'Social Media', icon: <Share2 className="w-4 h-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'marketplace', name: 'Marketplace', icon: <Music className="w-4 h-4" /> },
    { id: 'advertising', name: 'Advertising', icon: <Target className="w-4 h-4" /> }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels', color: 'bg-gray-100 text-gray-800' },
    { id: 'beginner', name: 'Beginner', color: 'bg-green-100 text-green-800' },
    { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'advanced', name: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

  const impacts = [
    { id: 'all', name: 'All Impact', color: 'bg-gray-100 text-gray-800' },
    { id: 'low', name: 'Low Impact', color: 'bg-blue-100 text-blue-800' },
    { id: 'medium', name: 'Medium Impact', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: 'High Impact', color: 'bg-orange-100 text-orange-800' },
    { id: 'revolutionary', name: 'Revolutionary', color: 'bg-red-100 text-red-800' }
  ];

  // Filter features based on selected criteria
  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || feature.difficulty === selectedDifficulty;
    const matchesImpact = selectedImpact === 'all' || feature.impact === selectedImpact;
    const matchesSearch = searchQuery === '' || 
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesImpact && matchesSearch;
  });

  const handleFeatureDiscovery = (featureId: string) => {
    if (!discoveredFeatures.includes(featureId)) {
      setDiscoveredFeatures(prev => [...prev, featureId]);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'revolutionary': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const discoveryProgress = (discoveredFeatures.length / features.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feature Discovery</h2>
            <p className="text-gray-600">Explore all the powerful features Max Booster has to offer</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Discovery Progress</span>
            <span className="text-sm text-gray-600">
              {discoveredFeatures.length}/{features.length} features discovered
            </span>
          </div>
          <Progress value={discoveryProgress} className="h-2" />
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Difficulty</h3>
              <div className="space-y-1">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`w-full p-2 rounded-lg text-left transition-colors ${
                      selectedDifficulty === difficulty.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{difficulty.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Impact</h3>
              <div className="space-y-1">
                {impacts.map((impact) => (
                  <button
                    key={impact.id}
                    onClick={() => setSelectedImpact(impact.id)}
                    className={`w-full p-2 rounded-lg text-left transition-colors ${
                      selectedImpact === impact.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{impact.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFeatures.map((feature) => (
                <Card 
                  key={feature.id} 
                  className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    discoveredFeatures.includes(feature.id) ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => handleFeatureDiscovery(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {feature.isNew && <Badge className="bg-green-100 text-green-800">New</Badge>}
                        {feature.isPopular && <Badge className="bg-blue-100 text-blue-800">Popular</Badge>}
                        {feature.isPro && <Badge className="bg-purple-100 text-purple-800">Pro</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getDifficultyColor(feature.difficulty)}>
                          {feature.difficulty}
                        </Badge>
                        <Badge className={getImpactColor(feature.impact)}>
                          {feature.impact} impact
                        </Badge>
                        <Badge variant="secondary">
                          {feature.timeToLearn}
                        </Badge>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Key Benefits</h4>
                        <ul className="space-y-1">
                          {feature.benefits.slice(0, 3).map((benefit, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Use Cases */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Use Cases</h4>
                        <div className="flex flex-wrap gap-1">
                          {feature.useCases.slice(0, 3).map((useCase, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Explore
                        </Button>
                        {feature.tutorialUrl && (
                          <Button size="sm" variant="outline">
                            <HelpCircle className="w-3 h-3 mr-1" />
                            Tutorial
                          </Button>
                        )}
                        {feature.demoUrl && (
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            Demo
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFeatures.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No features found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
