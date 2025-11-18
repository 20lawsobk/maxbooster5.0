import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Sparkles,
  Brain,
  Wand2,
  Music,
  Volume2,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  bpm: number;
  keySignature: string;
  description?: string;
}

interface AIAssistantProps {
  project: Project;
  onAIMix: () => void;
  onAIMaster: () => void;
  isProcessing: boolean;
}

export default function AIAssistant({
  project,
  onAIMix,
  onAIMaster,
  isProcessing,
}: AIAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [suggestions, setSuggestions] = useState([
    {
      id: 'eq-suggestion',
      type: 'EQ',
      title: 'Boost Mid Frequencies',
      description: 'Your vocals could benefit from a 2dB boost around 2kHz for better presence',
      confidence: 0.92,
      status: 'pending',
    },
    {
      id: 'compression-suggestion',
      type: 'Dynamics',
      title: 'Add Gentle Compression',
      description: 'Apply 3:1 ratio compression with -18dB threshold to even out dynamics',
      confidence: 0.87,
      status: 'pending',
    },
    {
      id: 'arrangement-suggestion',
      type: 'Arrangement',
      title: 'Extend Bridge Section',
      description: 'Consider adding 8 more bars to the bridge for better song structure',
      confidence: 0.78,
      status: 'pending',
    },
  ]);

  const aiFeatures = [
    {
      id: 'auto-mix',
      title: 'Auto-Mix Tracks',
      description: 'AI analyzes your tracks and applies optimal mixing settings',
      icon: <Volume2 className="w-5 h-5" />,
      action: onAIMix,
      color: 'text-primary',
    },
    {
      id: 'auto-master',
      title: 'Master Track',
      description: 'Professional mastering with AI-optimized loudness and dynamics',
      icon: <Sparkles className="w-5 h-5" />,
      action: onAIMaster,
      color: 'text-secondary',
    },
    {
      id: 'generate-harmony',
      title: 'Generate Harmonies',
      description: 'Create harmonic layers that complement your lead vocals',
      icon: <Music className="w-5 h-5" />,
      action: () => console.log('Generate harmonies'),
      color: 'text-accent',
    },
    {
      id: 'suggest-arrangement',
      title: 'Arrangement Ideas',
      description: 'Get suggestions for song structure and arrangement improvements',
      icon: <Brain className="w-5 h-5" />,
      action: () => console.log('Suggest arrangement'),
      color: 'text-primary',
    },
  ];

  const applySuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: 'applied' } : s))
    );
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-secondary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-accent';
    if (confidence >= 0.8) return 'text-secondary';
    return 'text-primary';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 h-full overflow-y-auto">
        {/* Project Analysis Status */}
        <Card className="bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Project Analysis</h3>
              {analysisComplete ? (
                <Badge className="bg-accent/20 text-accent">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge className="bg-secondary/20 text-secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  Analyzing
                </Badge>
              )}
            </div>

            {analysisComplete ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre Detection:</span>
                  <span>Electronic Pop</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Key:</span>
                  <span>{project.keySignature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo:</span>
                  <span>{project.bpm} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loudness:</span>
                  <span>-14.2 LUFS</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Progress value={75} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Analyzing audio content and structure...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Features */}
        <div>
          <h3 className="font-medium mb-4">AI Tools</h3>
          <div className="grid grid-cols-1 gap-3">
            {aiFeatures.map((feature) => (
              <Card
                key={feature.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                data-testid={`ai-feature-${feature.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-muted/20 rounded ${feature.color}`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={feature.action}
                      disabled={isProcessing}
                      data-testid={`button-${feature.id}`}
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <h3 className="font-medium mb-4">AI Suggestions</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className={`${suggestion.status === 'applied' ? 'bg-accent/5 border-accent/20' : ''}`}
                data-testid={`suggestion-${suggestion.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(suggestion.status)}
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                    <div
                      className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}
                    >
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </div>
                  </div>

                  <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>

                  {suggestion.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion.id)}
                        data-testid={`button-apply-${suggestion.id}`}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissSuggestion(suggestion.id)}
                        data-testid={`button-dismiss-${suggestion.id}`}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom AI Prompt */}
        <div>
          <h3 className="font-medium mb-4">Ask AI</h3>
          <Card>
            <CardContent className="p-4">
              <Textarea
                placeholder="Ask the AI about your project... (e.g., 'How can I make my vocals sound warmer?' or 'Suggest improvements for the chorus')"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-20 resize-none"
                data-testid="textarea-ai-prompt"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted-foreground">
                  AI will analyze your project and provide personalized suggestions
                </p>
                <Button
                  size="sm"
                  disabled={!customPrompt.trim() || isProcessing}
                  data-testid="button-ask-ai"
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-medium text-primary">AI Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Analyzing your tracks and applying optimizations...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
