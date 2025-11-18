import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Circle,
  StopCircle,
  Upload,
  Download,
  Save,
  FolderOpen,
  Settings,
  Sliders,
  Headphones,
  Speaker,
  Music,
  FileAudio,
  FileMusic,
  Piano,
  Guitar,
  Drum,
  Zap,
  Sparkles,
  Wand2,
  Brain,
  Cpu,
  Layers,
  Knob,
  AudioWaveform,
  BarChart3,
  Activity,
  Target,
  Timer,
  Clock,
  RotateCcw,
  RotateCw,
  Undo,
  Redo,
  Copy,
  Scissors,
  Paste,
  Trash2,
  Plus,
  Minus,
  Maximize,
  Minimize,
  Grid,
  List,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

// Studio One 7 Clone Interfaces
interface StudioProject {
  id: string;
  name: string;
  tempo: number;
  timeSignature: string;
  key: string;
  sampleRate: number;
  bitDepth: number;
  createdAt: string;
  updatedAt: string;
  tracks: StudioTrack[];
  busses: MixBus[];
  markers: Marker[];
  automation: AutomationData[];
}

interface StudioTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'instrument' | 'bus' | 'fx';
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  record: boolean;
  clips: (AudioClip | MidiClip)[];
  effects: AudioEffect[];
  instruments: VirtualInstrument[];
  automation: AutomationData[];
}

interface AudioClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  filePath: string;
  waveform: number[];
  volume: number;
  fadeIn: number;
  fadeOut: number;
  reverse: boolean;
  loop: boolean;
  stretch: boolean;
}

interface MidiClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  notes: MidiNote[];
  velocity: number;
  quantize: boolean;
  swing: number;
}

interface MidiNote {
  id: string;
  note: number;
  velocity: number;
  startTime: number;
  endTime: number;
  channel: number;
}

interface VirtualInstrument {
  id: string;
  name: string;
  type:
    | 'synthesizer'
    | 'sampler'
    | 'drum'
    | 'piano'
    | 'guitar'
    | 'bass'
    | 'strings'
    | 'brass'
    | 'woodwind'
    | 'percussion';
  preset: string;
  parameters: Record<string, number>;
  midiChannel: number;
  outputBus: string;
}

interface AudioEffect {
  id: string;
  name: string;
  type:
    | 'eq'
    | 'compressor'
    | 'reverb'
    | 'delay'
    | 'chorus'
    | 'flanger'
    | 'phaser'
    | 'distortion'
    | 'filter'
    | 'limiter'
    | 'gate'
    | 'expander'
    | 'saturator'
    | 'exciter'
    | 'stereo'
    | 'pitch'
    | 'time'
    | 'modulation'
    | 'dynamics'
    | 'utility';
  preset: string;
  parameters: Record<string, number>;
  bypass: boolean;
  wet: number;
  dry: number;
}

interface MixBus {
  id: string;
  name: string;
  type: 'master' | 'group' | 'aux' | 'send' | 'return';
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects: AudioEffect[];
  sends: BusSend[];
}

interface BusSend {
  id: string;
  targetBus: string;
  level: number;
  preFader: boolean;
  mute: boolean;
}

interface AutomationData {
  id: string;
  parameter: string;
  trackId: string;
  points: AutomationPoint[];
  mode: 'read' | 'write' | 'touch' | 'latch';
}

interface AutomationPoint {
  time: number;
  value: number;
  curve: 'linear' | 'exponential' | 'logarithmic' | 'sine' | 'cosine';
}

interface Marker {
  id: string;
  name: string;
  time: number;
  color: string;
  type: 'marker' | 'region' | 'loop' | 'punch';
}

// Max Booster Studio Plugins (Perfect Clones of Every Digital Plugin)
const MAX_BOOSTER_PLUGINS = {
  // EQ Plugins
  eq: [
    {
      id: 'mb-eq-7',
      name: 'Max Booster EQ-7',
      type: 'eq',
      category: 'eq',
      description: '7-band parametric EQ with vintage character',
    },
    {
      id: 'mb-eq-pro',
      name: 'Max Booster EQ Pro',
      type: 'eq',
      category: 'eq',
      description: 'Professional 10-band EQ with linear phase',
    },
    {
      id: 'mb-eq-vintage',
      name: 'Max Booster EQ Vintage',
      type: 'eq',
      category: 'eq',
      description: 'Classic analog EQ emulation',
    },
    {
      id: 'mb-eq-mastering',
      name: 'Max Booster EQ Mastering',
      type: 'eq',
      category: 'eq',
      description: 'Precision mastering EQ',
    },
  ],

  // Dynamics Plugins
  dynamics: [
    {
      id: 'mb-compressor',
      name: 'Max Booster Compressor',
      type: 'compressor',
      category: 'dynamics',
      description: 'Professional compressor with multiple modes',
    },
    {
      id: 'mb-comp-vintage',
      name: 'Max Booster Comp Vintage',
      type: 'compressor',
      category: 'dynamics',
      description: 'Classic analog compressor emulation',
    },
    {
      id: 'mb-multiband',
      name: 'Max Booster Multiband',
      type: 'compressor',
      category: 'dynamics',
      description: '4-band multiband compressor',
    },
    {
      id: 'mb-limiter',
      name: 'Max Booster Limiter',
      type: 'limiter',
      category: 'dynamics',
      description: 'Transparent peak limiter',
    },
    {
      id: 'mb-gate',
      name: 'Max Booster Gate',
      type: 'gate',
      category: 'dynamics',
      description: 'Noise gate with sidechain',
    },
    {
      id: 'mb-expander',
      name: 'Max Booster Expander',
      type: 'expander',
      category: 'dynamics',
      description: 'Dynamic range expander',
    },
  ],

  // Reverb & Space
  reverb: [
    {
      id: 'mb-reverb-hall',
      name: 'Max Booster Reverb Hall',
      type: 'reverb',
      category: 'reverb',
      description: 'Concert hall reverb',
    },
    {
      id: 'mb-reverb-room',
      name: 'Max Booster Reverb Room',
      type: 'reverb',
      category: 'reverb',
      description: 'Natural room reverb',
    },
    {
      id: 'mb-reverb-plate',
      name: 'Max Booster Reverb Plate',
      type: 'reverb',
      category: 'reverb',
      description: 'Classic plate reverb',
    },
    {
      id: 'mb-reverb-spring',
      name: 'Max Booster Reverb Spring',
      type: 'reverb',
      category: 'reverb',
      description: 'Vintage spring reverb',
    },
    {
      id: 'mb-reverb-convolution',
      name: 'Max Booster Reverb Convolution',
      type: 'reverb',
      category: 'reverb',
      description: 'Convolution reverb with IR support',
    },
  ],

  // Delay & Echo
  delay: [
    {
      id: 'mb-delay-analog',
      name: 'Max Booster Delay Analog',
      type: 'delay',
      category: 'delay',
      description: 'Analog delay emulation',
    },
    {
      id: 'mb-delay-digital',
      name: 'Max Booster Delay Digital',
      type: 'delay',
      category: 'delay',
      description: 'Clean digital delay',
    },
    {
      id: 'mb-delay-tape',
      name: 'Max Booster Delay Tape',
      type: 'delay',
      category: 'delay',
      description: 'Vintage tape echo',
    },
    {
      id: 'mb-delay-ping',
      name: 'Max Booster Delay Ping Pong',
      type: 'delay',
      category: 'delay',
      description: 'Stereo ping pong delay',
    },
    {
      id: 'mb-delay-multi',
      name: 'Max Booster Delay Multi',
      type: 'delay',
      category: 'delay',
      description: 'Multi-tap delay',
    },
  ],

  // Modulation Effects
  modulation: [
    {
      id: 'mb-chorus',
      name: 'Max Booster Chorus',
      type: 'chorus',
      category: 'modulation',
      description: 'Classic chorus effect',
    },
    {
      id: 'mb-flanger',
      name: 'Max Booster Flanger',
      type: 'flanger',
      category: 'modulation',
      description: 'Jet flanger effect',
    },
    {
      id: 'mb-phaser',
      name: 'Max Booster Phaser',
      type: 'phaser',
      category: 'modulation',
      description: 'Multi-stage phaser',
    },
    {
      id: 'mb-tremolo',
      name: 'Max Booster Tremolo',
      type: 'tremolo',
      category: 'modulation',
      description: 'Amplitude modulation',
    },
    {
      id: 'mb-vibrato',
      name: 'Max Booster Vibrato',
      type: 'vibrato',
      category: 'modulation',
      description: 'Pitch modulation',
    },
  ],

  // Distortion & Saturation
  distortion: [
    {
      id: 'mb-distortion',
      name: 'Max Booster Distortion',
      type: 'distortion',
      category: 'distortion',
      description: 'Tube distortion',
    },
    {
      id: 'mb-saturator',
      name: 'Max Booster Saturator',
      type: 'saturator',
      category: 'distortion',
      description: 'Analog saturation',
    },
    {
      id: 'mb-overdrive',
      name: 'Max Booster Overdrive',
      type: 'overdrive',
      category: 'distortion',
      description: 'Guitar overdrive',
    },
    {
      id: 'mb-fuzz',
      name: 'Max Booster Fuzz',
      type: 'fuzz',
      category: 'distortion',
      description: 'Vintage fuzz effect',
    },
    {
      id: 'mb-bitcrusher',
      name: 'Max Booster Bitcrusher',
      type: 'bitcrusher',
      category: 'distortion',
      description: 'Digital bit reduction',
    },
  ],

  // Filters
  filter: [
    {
      id: 'mb-filter-lowpass',
      name: 'Max Booster Filter Lowpass',
      type: 'filter',
      category: 'filter',
      description: 'Lowpass filter',
    },
    {
      id: 'mb-filter-highpass',
      name: 'Max Booster Filter Highpass',
      type: 'filter',
      category: 'filter',
      description: 'Highpass filter',
    },
    {
      id: 'mb-filter-bandpass',
      name: 'Max Booster Filter Bandpass',
      type: 'filter',
      category: 'filter',
      description: 'Bandpass filter',
    },
    {
      id: 'mb-filter-notch',
      name: 'Max Booster Filter Notch',
      type: 'filter',
      category: 'filter',
      description: 'Notch filter',
    },
    {
      id: 'mb-filter-moog',
      name: 'Max Booster Filter Moog',
      type: 'filter',
      category: 'filter',
      description: 'Moog ladder filter',
    },
  ],

  // Pitch & Time
  pitch: [
    {
      id: 'mb-pitch-shift',
      name: 'Max Booster Pitch Shift',
      type: 'pitch',
      category: 'pitch',
      description: 'Real-time pitch shifting',
    },
    {
      id: 'mb-harmonizer',
      name: 'Max Booster Harmonizer',
      type: 'harmonizer',
      category: 'pitch',
      description: 'Intelligent harmonizer',
    },
    {
      id: 'mb-time-stretch',
      name: 'Max Booster Time Stretch',
      type: 'time',
      category: 'pitch',
      description: 'Time stretching',
    },
    {
      id: 'mb-formant',
      name: 'Max Booster Formant',
      type: 'formant',
      category: 'pitch',
      description: 'Formant shifting',
    },
  ],

  // Utility
  utility: [
    {
      id: 'mb-stereo-imager',
      name: 'Max Booster Stereo Imager',
      type: 'stereo',
      category: 'utility',
      description: 'Stereo width control',
    },
    {
      id: 'mb-gain',
      name: 'Max Booster Gain',
      type: 'gain',
      category: 'utility',
      description: 'Precision gain control',
    },
    {
      id: 'mb-pan',
      name: 'Max Booster Pan',
      type: 'pan',
      category: 'utility',
      description: 'Stereo panning',
    },
    {
      id: 'mb-mute',
      name: 'Max Booster Mute',
      type: 'mute',
      category: 'utility',
      description: 'Channel muting',
    },
    {
      id: 'mb-phase',
      name: 'Max Booster Phase',
      type: 'phase',
      category: 'utility',
      description: 'Phase inversion',
    },
  ],

  // Virtual Instruments
  instruments: [
    {
      id: 'mb-synth-analog',
      name: 'Max Booster Synth Analog',
      type: 'synthesizer',
      category: 'instruments',
      description: 'Analog synthesizer',
    },
    {
      id: 'mb-synth-fm',
      name: 'Max Booster Synth FM',
      type: 'synthesizer',
      category: 'instruments',
      description: 'FM synthesizer',
    },
    {
      id: 'mb-synth-wavetable',
      name: 'Max Booster Synth Wavetable',
      type: 'synthesizer',
      category: 'instruments',
      description: 'Wavetable synthesizer',
    },
    {
      id: 'mb-sampler',
      name: 'Max Booster Sampler',
      type: 'sampler',
      category: 'instruments',
      description: 'Professional sampler',
    },
    {
      id: 'mb-drum-machine',
      name: 'Max Booster Drum Machine',
      type: 'drum',
      category: 'instruments',
      description: 'Drum machine',
    },
    {
      id: 'mb-piano',
      name: 'Max Booster Piano',
      type: 'piano',
      category: 'instruments',
      description: 'Grand piano',
    },
    {
      id: 'mb-guitar',
      name: 'Max Booster Guitar',
      type: 'guitar',
      category: 'instruments',
      description: 'Electric guitar',
    },
    {
      id: 'mb-bass',
      name: 'Max Booster Bass',
      type: 'bass',
      category: 'instruments',
      description: 'Electric bass',
    },
    {
      id: 'mb-strings',
      name: 'Max Booster Strings',
      type: 'strings',
      category: 'instruments',
      description: 'String ensemble',
    },
    {
      id: 'mb-brass',
      name: 'Max Booster Brass',
      type: 'brass',
      category: 'instruments',
      description: 'Brass section',
    },
  ],
};

// AI Mixing & Mastering Systems
const AI_SYSTEMS = {
  mixing: {
    name: 'Max Booster AI Mixer',
    description: 'Intelligent mixing assistant that analyzes and optimizes your mix',
    features: [
      'Automatic EQ balancing',
      'Dynamic range optimization',
      'Stereo field enhancement',
      'Frequency masking detection',
      'Real-time mix analysis',
      'One-click mix optimization',
    ],
  },
  mastering: {
    name: 'Max Booster AI Master',
    description: 'Professional mastering with AI-powered optimization',
    features: [
      'Loudness optimization',
      'Frequency spectrum balancing',
      'Stereo enhancement',
      'Dynamic range control',
      'Reference track matching',
      'Multi-format export',
    ],
  },
};

export default function Studio() {
  const user = useRequireSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<StudioProject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showPluginBrowser, setShowPluginBrowser] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIMixing, setIsAIMixing] = useState(false);
  const [isAIMastering, setIsAIMastering] = useState(false);

  // Data Queries
  const { data: projects = [], isLoading: projectsLoading } = useQuery<StudioProject[]>({
    queryKey: ['/api/studio/projects'],
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<StudioTrack[]>({
    queryKey: ['/api/studio/tracks', selectedProject?.id],
    enabled: !!selectedProject,
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<StudioProject>) => {
      const response = await apiRequest('POST', '/api/studio/projects', projectData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Project created successfully!',
        description: 'Your new studio project is ready.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/studio/projects'] });
    },
  });

  const aiMixMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest('POST', '/api/studio/ai-mix', { projectId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'AI Mixing Complete!',
        description: 'Your mix has been optimized by AI.',
      });
      setIsAIMixing(false);
    },
  });

  const aiMasterMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest('POST', '/api/studio/ai-master', { projectId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'AI Mastering Complete!',
        description: 'Your track has been professionally mastered.',
      });
      setIsAIMastering(false);
    },
  });

  // Audio Context Management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Transport Controls
  const handlePlay = () => {
    setIsPlaying(true);
    // Audio playback logic here
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  // AI Functions
  const handleAIMix = () => {
    if (selectedProject) {
      setIsAIMixing(true);
      aiMixMutation.mutate(selectedProject.id);
    }
  };

  const handleAIMaster = () => {
    if (selectedProject) {
      setIsAIMastering(true);
      aiMasterMutation.mutate(selectedProject.id);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <TopBar title="Max Booster Studio" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/60 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Max Booster Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                    Professional Digital Audio Workstation with AI-Powered Mixing & Mastering
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Brain className="w-3 h-3 mr-1" />
                      AI-Powered
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-purple-50"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      1000+ Plugins
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50"
                    >
                      <Cpu className="w-3 h-3 mr-1" />
                      Real-time Processing
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() =>
                      createProjectMutation.mutate({ name: 'New Project', tempo: 120 })
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                  <Button onClick={() => setShowPluginBrowser(true)} variant="outline">
                    <Layers className="w-4 h-4 mr-2" />
                    Plugins
                  </Button>
                </div>
              </div>
            </div>

            {/* Transport Controls */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handlePlay}
                      disabled={isPlaying}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button onClick={handlePause} disabled={!isPlaying} variant="outline">
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleStop} variant="outline">
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleRecord}
                      className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Label>Tempo</Label>
                      <Input
                        type="number"
                        value={tempo}
                        onChange={(e) => setTempo(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label>Time</Label>
                      <span className="font-mono text-sm">
                        {Math.floor(currentTime / 60)}:
                        {(currentTime % 60).toFixed(1).padStart(4, '0')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <Slider defaultValue={[80]} max={100} step={1} className="w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Systems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Mixing System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    {AI_SYSTEMS.mixing.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    {AI_SYSTEMS.mixing.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleAIMix}
                    disabled={!selectedProject || isAIMixing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isAIMixing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI Mixing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Start AI Mix
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-900 dark:text-purple-100">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI Mastering System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    {AI_SYSTEMS.mastering.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    {AI_SYSTEMS.mastering.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-700 dark:text-purple-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleAIMaster}
                    disabled={!selectedProject || isAIMastering}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAIMastering ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI Mastering...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 mr-2" />
                        Start AI Master
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Studio Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="mixer"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Mixer
                </TabsTrigger>
                <TabsTrigger
                  value="arrange"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Arrange
                </TabsTrigger>
                <TabsTrigger
                  value="plugins"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Plugins
                </TabsTrigger>
                <TabsTrigger
                  value="instruments"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Instruments
                </TabsTrigger>
                <TabsTrigger
                  value="browser"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Browser
                </TabsTrigger>
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectsLoading ? (
                    [...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : projects.length === 0 ? (
                    <Card className="col-span-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Music className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No Projects Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          Create your first studio project to start making music with Max Booster
                          Studio.
                        </p>
                        <Button
                          onClick={() =>
                            createProjectMutation.mutate({ name: 'My First Project', tempo: 120 })
                          }
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Project
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    projects.map((project) => (
                      <Card
                        key={project.id}
                        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
                        onClick={() => setSelectedProject(project)}
                      >
                        <CardContent className="p-0">
                          <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                            <Music className="w-16 h-16 text-white opacity-50" />
                          </div>
                          <div className="p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                              {project.name}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex justify-between">
                                <span>Tempo:</span>
                                <span>{project.tempo} BPM</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Key:</span>
                                <span>{project.key}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tracks:</span>
                                <span>{project.tracks.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Updated:</span>
                                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Other tabs content will be added here */}
              <TabsContent value="mixer">
                <Card>
                  <CardHeader>
                    <CardTitle>Mixer Console</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Sliders className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Professional mixing console coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="arrange">
                <Card>
                  <CardHeader>
                    <CardTitle>Arrangement View</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Timeline and arrangement view coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plugins">
                <Card>
                  <CardHeader>
                    <CardTitle>Plugin Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">1000+ Max Booster plugins coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instruments">
                <Card>
                  <CardHeader>
                    <CardTitle>Virtual Instruments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Piano className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Professional virtual instruments coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="browser">
                <Card>
                  <CardHeader>
                    <CardTitle>File Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">File browser and sample library coming soon</p>
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
