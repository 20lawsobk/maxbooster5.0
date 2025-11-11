import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Save, 
  Send,
  Music,
  FileAudio,
  FileText,
  Globe,
  Calendar,
  Users,
  Eye
} from 'lucide-react';

import { MetadataForm } from './MetadataForm';
import { TrackUploader } from './TrackUploader';
import { ArtworkUploader } from './ArtworkUploader';
import { LyricsEditor } from './LyricsEditor';
import { TerritorySelector } from './TerritorySelector';
import { DSPSelector } from './DSPSelector';
import { ReleaseDateScheduler } from './ReleaseDateScheduler';
import { RoyaltySplitManager } from './RoyaltySplitManager';

// Step configuration
const STEPS = [
  { id: 1, title: 'Metadata', icon: Music, description: 'Basic release information' },
  { id: 2, title: 'Tracks & Artwork', icon: FileAudio, description: 'Upload audio and cover art' },
  { id: 3, title: 'Lyrics', icon: FileText, description: 'Add lyrics and credits' },
  { id: 4, title: 'Territory & DSPs', icon: Globe, description: 'Distribution settings' },
  { id: 5, title: 'Schedule & Splits', icon: Calendar, description: 'Release date and royalties' },
  { id: 6, title: 'Review & Submit', icon: Eye, description: 'Final review' },
];

// Validation schemas for each step
const metadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artistName: z.string().min(1, 'Artist name is required'),
  releaseType: z.enum(['single', 'EP', 'album']),
  primaryGenre: z.string().min(1, 'Primary genre is required'),
  secondaryGenre: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  labelName: z.string().optional(),
  copyrightYear: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  copyrightOwner: z.string().min(1, 'Copyright owner is required'),
  publishingRights: z.string().optional(),
  isExplicit: z.boolean(),
  moodTags: z.array(z.string()).optional(),
});

const tracksSchema = z.object({
  audioFiles: z.array(z.any()).min(1, 'At least one track is required'),
  artwork: z.any().nullable(),
});

interface ReleaseWizardProps {
  releaseId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function ReleaseWizard({ releaseId, onComplete, onCancel }: ReleaseWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for all steps
  const [metadataData, setMetadataData] = useState({
    title: '',
    artistName: '',
    releaseType: 'single' as 'single' | 'EP' | 'album',
    primaryGenre: '',
    secondaryGenre: '',
    language: 'English',
    labelName: '',
    copyrightYear: new Date().getFullYear(),
    copyrightOwner: '',
    publishingRights: '',
    isExplicit: false,
    moodTags: [] as string[],
  });

  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [artwork, setArtwork] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState<Record<string, string>>({});
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [territoryMode, setTerritoryMode] = useState<'worldwide' | 'include' | 'exclude'>('worldwide');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['spotify', 'apple-music', 'youtube-music']);
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [royaltySplits, setRoyaltySplits] = useState<any[]>([]);

  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', metadataData.title);
      formData.append('artistName', metadataData.artistName);
      formData.append('releaseType', metadataData.releaseType);
      formData.append('primaryGenre', metadataData.primaryGenre);
      formData.append('language', metadataData.language);
      formData.append('copyrightYear', metadataData.copyrightYear.toString());
      formData.append('copyrightOwner', metadataData.copyrightOwner);
      formData.append('isExplicit', metadataData.isExplicit.toString());
      
      if (releaseDate) {
        formData.append('releaseDate', releaseDate.toISOString());
      }

      formData.append('metadata', JSON.stringify({
        ...metadataData,
        territoryMode,
        territories: selectedTerritories,
        selectedPlatforms,
        royaltySplits,
      }));

      const response = await apiRequest('POST', '/api/distribution/releases', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Draft saved',
        description: 'Your release has been saved as a draft.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/distribution/releases'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Submit for distribution mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (audioFiles.length === 0) {
        throw new Error('Please upload at least one track');
      }

      const formData = new FormData();
      
      // Add metadata
      formData.append('title', metadataData.title);
      formData.append('artistName', metadataData.artistName);
      formData.append('releaseType', metadataData.releaseType);
      formData.append('primaryGenre', metadataData.primaryGenre);
      formData.append('language', metadataData.language);
      formData.append('copyrightYear', metadataData.copyrightYear.toString());
      formData.append('copyrightOwner', metadataData.copyrightOwner);
      formData.append('isExplicit', metadataData.isExplicit.toString());
      
      if (releaseDate) {
        formData.append('releaseDate', releaseDate.toISOString());
      }

      // Add audio files
      audioFiles.forEach((audioFile, index) => {
        formData.append(`audio_${index}`, audioFile.file);
      });

      // Add artwork
      if (artwork) {
        formData.append('artwork', artwork);
      }

      // Add metadata
      formData.append('metadata', JSON.stringify({
        ...metadataData,
        territoryMode,
        territories: selectedTerritories,
        selectedPlatforms,
        lyrics,
        royaltySplits,
      }));

      const response = await apiRequest('POST', '/api/distribution/releases', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Release submitted!',
        description: 'Your release has been submitted for distribution.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/distribution/releases'] });
      onComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Submission failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const validateStep = (step: number): boolean => {
    try {
      switch (step) {
        case 1:
          metadataSchema.parse(metadataData);
          return true;
        case 2:
          tracksSchema.parse({ audioFiles, artwork });
          return true;
        case 3:
          // Lyrics are optional
          return true;
        case 4:
          if (selectedPlatforms.length === 0) {
            toast({
              title: 'Validation error',
              description: 'Please select at least one distribution platform.',
              variant: 'destructive',
            });
            return false;
          }
          return true;
        case 5:
          if (!releaseDate) {
            toast({
              title: 'Validation error',
              description: 'Please select a release date.',
              variant: 'destructive',
            });
            return false;
          }
          return true;
        case 6:
          return true;
        default:
          return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    saveDraftMutation.mutate();
  };

  const handleSubmit = () => {
    if (validateStep(6)) {
      submitMutation.mutate();
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Release</h2>
            <p className="text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          <Button variant="outline" onClick={handleSaveDraft} disabled={saveDraftMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-xs text-center hidden md:block ${isActive ? 'font-medium' : ''}`}>
                  {step.title}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute w-full h-0.5 bg-muted top-5 left-1/2 -z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <MetadataForm
              data={metadataData}
              onChange={(updates) => setMetadataData({ ...metadataData, ...updates })}
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <TrackUploader
                files={audioFiles}
                onChange={setAudioFiles}
              />
              <ArtworkUploader
                artwork={artwork}
                onChange={setArtwork}
              />
            </div>
          )}

          {currentStep === 3 && (
            <LyricsEditor
              tracks={audioFiles.map((f, i) => ({ 
                id: f.id, 
                title: f.file.name.replace(/\.[^/.]+$/, ''),
                trackNumber: i + 1 
              }))}
              lyrics={lyrics}
              onChange={setLyrics}
            />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <TerritorySelector
                mode={territoryMode}
                selectedTerritories={selectedTerritories}
                onModeChange={setTerritoryMode}
                onTerritoriesChange={setSelectedTerritories}
              />
              <DSPSelector
                selectedPlatforms={selectedPlatforms}
                onChange={setSelectedPlatforms}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <ReleaseDateScheduler
                releaseDate={releaseDate}
                onChange={setReleaseDate}
              />
              <RoyaltySplitManager
                splits={royaltySplits}
                onChange={setRoyaltySplits}
              />
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Release</h3>
              
              <div className="grid gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Metadata</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">Title:</dt>
                    <dd>{metadataData.title}</dd>
                    <dt className="text-muted-foreground">Artist:</dt>
                    <dd>{metadataData.artistName}</dd>
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="capitalize">{metadataData.releaseType}</dd>
                    <dt className="text-muted-foreground">Genre:</dt>
                    <dd>{metadataData.primaryGenre}</dd>
                  </dl>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Tracks</h4>
                  <p className="text-sm">{audioFiles.length} track(s) uploaded</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Distribution</h4>
                  <p className="text-sm">{selectedPlatforms.length} platform(s) selected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {territoryMode === 'worldwide' ? 'Worldwide distribution' : `${selectedTerritories.length} territories`}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Release Date</h4>
                  <p className="text-sm">
                    {releaseDate ? releaseDate.toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Important:</strong> Once submitted, your release will be processed and sent to the selected platforms. 
                  This process typically takes 2-5 business days. Make sure all information is correct before submitting.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handleBack}
          disabled={submitMutation.isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < 6 ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
            <Send className="h-4 w-4 mr-2" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Distribution'}
          </Button>
        )}
      </div>
    </div>
  );
}
