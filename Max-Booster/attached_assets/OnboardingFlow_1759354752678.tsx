import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  TrendingUp,
  Share2,
  Target,
  BarChart3,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  benefits: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Max Booster',
    description: 'Your AI-powered music career management platform',
    icon: <Sparkles className="w-8 h-8 text-blue-500" />,
    features: [
      'Complete music career management',
      'AI-powered optimization',
      'Cross-platform distribution',
    ],
    benefits: ['Save 10+ hours per week', 'Increase earnings by 300%', 'Professional-grade tools'],
    estimatedTime: '2 minutes',
    difficulty: 'beginner',
  },
  {
    id: 'studio',
    title: 'Studio One Clone',
    description: 'Professional DAW with AI mixing and mastering',
    icon: <Music className="w-8 h-8 text-purple-500" />,
    features: ['AI-powered mixing', 'Professional mastering', 'Real-time collaboration'],
    benefits: ['Studio-quality results', 'Save $1000s in studio costs', 'Learn from AI'],
    estimatedTime: '5 minutes',
    difficulty: 'intermediate',
  },
  {
    id: 'distribution',
    title: 'Music Distribution',
    description: 'Distribute to 150+ platforms worldwide',
    icon: <TrendingUp className="w-8 h-8 text-green-500" />,
    features: ['150+ platforms', 'Automated royalty collection', 'HyperFollow campaigns'],
    benefits: ['Global reach', 'Maximize earnings', 'Professional distribution'],
    estimatedTime: '3 minutes',
    difficulty: 'beginner',
  },
  {
    id: 'advertising',
    title: 'Revolutionary AI Advertising',
    description: 'Zero-cost advertising that outperforms paid campaigns',
    icon: <Target className="w-8 h-8 text-red-500" />,
    features: ['Zero ad spend', '1000% better performance', 'Viral amplification'],
    benefits: ['Eliminate advertising costs', '15% viral success rate', 'Algorithm domination'],
    estimatedTime: '4 minutes',
    difficulty: 'advanced',
  },
  {
    id: 'social',
    title: 'Social Media Management',
    description: 'AI-optimized content for 8 platforms',
    icon: <Share2 className="w-8 h-8 text-pink-500" />,
    features: ['8 platform integration', 'AI content generation', 'Automated scheduling'],
    benefits: ['10x engagement', 'Save 5+ hours weekly', 'Professional presence'],
    estimatedTime: '3 minutes',
    difficulty: 'intermediate',
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: '50+ metrics with AI predictions',
    icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
    features: ['50+ analytics categories', 'AI predictions', 'Growth optimization'],
    benefits: ['Data-driven decisions', 'Predict trends', 'Maximize performance'],
    estimatedTime: '2 minutes',
    difficulty: 'intermediate',
  },
  {
    id: 'marketplace',
    title: 'Beat Marketplace',
    description: 'Peer-to-peer beat sales and collaboration',
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    features: ['Beat sales', 'Collaboration tools', 'Secure transactions'],
    benefits: ['Monetize beats', 'Find collaborators', 'Build network'],
    estimatedTime: '3 minutes',
    difficulty: 'beginner',
  },
  {
    id: 'setup',
    title: 'Complete Setup',
    description: 'Configure your preferences and start creating',
    icon: <Settings className="w-8 h-8 text-gray-500" />,
    features: ['Profile setup', 'Payment configuration', 'Platform connections'],
    benefits: ['Ready to create', 'Optimized settings', 'Full access'],
    estimatedTime: '5 minutes',
    difficulty: 'beginner',
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    const currentStepData = onboardingSteps[currentStep];
    setCompletedSteps((prev) => [...prev, currentStepData.id]);

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Max Booster Setup</h1>
            </div>
            <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
              Skip Setup
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg">{currentStepData.icon}</div>
                  <div>
                    <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                    <p className="text-gray-600 mt-2">{currentStepData.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentStepData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Benefits</h3>
                  <div className="space-y-2">
                    {currentStepData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Info */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Badge className={getDifficultyColor(currentStepData.difficulty)}>
                      {currentStepData.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ⏱️ {currentStepData.estimatedTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Level Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Experience Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setUserLevel(level)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        userLevel === level
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium capitalize">{level}</div>
                      <div className="text-sm text-gray-600">
                        {level === 'beginner' && 'New to music production and distribution'}
                        {level === 'intermediate' && 'Some experience with music tools'}
                        {level === 'advanced' && 'Professional music producer/artist'}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Features</span>
                    <span className="font-semibold">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Supported Platforms</span>
                    <span className="font-semibold">150+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AI Optimization</span>
                    <span className="font-semibold text-green-600">1000%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Savings</span>
                    <span className="font-semibold text-blue-600">$10k+/year</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button onClick={handleNext} className="w-full" size="lg">
                    {isLastStep ? 'Complete Setup' : 'Next Step'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {currentStep > 0 && (
                    <Button variant="outline" onClick={handlePrevious} className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
