import { create } from 'zustand';

export interface Take {
  id: string;
  takeNumber: number;
  takeGroupId: string;
  trackId: string;
  startTime: number;
  duration: number;
  audioUrl?: string;
  isComped: boolean;
  isMuted: boolean;
  rating?: number;
  note?: string;
}

export interface Marker {
  id: string;
  name: string;
  time: number;
  position: number; // Same as time, for backend compatibility
  color: string;
  type?: string;
}

export interface StudioState {
  // Playhead and Navigation
  currentTime: number;
  isPlaying: boolean;
  isRecording: boolean;
  followPlayhead: boolean;
  
  // Transport State
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  tempo: number;
  timeSignature: string;
  metronomeEnabled: boolean;
  
  // Timeline View State
  zoom: number;
  scrollPosition: number;
  snapEnabled: boolean;
  snapResolution: number; // in seconds
  
  // Selection
  selectedTrackIds: string[];
  selectedClipIds: string[];
  selectedMarkerId: string | null;
  selectedTrackId: string | null; // Single selection for Inspector
  selectedClipId: string | null; // Single selection for Inspector
  
  // Browser State
  browserVisible: boolean;
  browserSearchQuery: string;
  browserActiveTab: 'presets' | 'samples' | 'plugins' | 'files';
  browserSelectedItem: string | null;
  
  // Inspector State
  inspectorVisible: boolean;
  
  // Routing Matrix State
  routingMatrixVisible: boolean;
  
  // Markers
  markers: Marker[];
  
  // Audio Devices
  selectedInputDevice: string | null;
  selectedOutputDevice: string | null;
  bufferSize: number;
  
  // Metronome Advanced
  metronomeVolume: number;
  
  // Punch Recording
  punchMode: boolean;
  punchIn: number | null;
  punchOut: number | null;
  
  // Take Comping
  takesByTrack: Record<string, Take[]>;
  
  // Transport Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  toggleFollowPlayhead: () => void;
  setLoopEnabled: (enabled: boolean) => void;
  setLoopStart: (time: number) => void;
  setLoopEnd: (time: number) => void;
  setTempo: (tempo: number) => void;
  setTimeSignature: (signature: string) => void;
  setMetronomeEnabled: (enabled: boolean) => void;
  
  // View Actions
  setZoom: (zoom: number) => void;
  setScrollPosition: (position: number) => void;
  toggleSnap: () => void;
  setSnapResolution: (resolution: number) => void;
  
  // Selection Actions
  selectTrack: (trackId: string, multi?: boolean) => void;
  selectClip: (clipId: string, multi?: boolean) => void;
  selectMarker: (markerId: string | null) => void;
  clearSelection: () => void;
  
  // Browser Actions
  toggleBrowser: () => void;
  setBrowserSearchQuery: (query: string) => void;
  setBrowserActiveTab: (tab: 'presets' | 'samples' | 'plugins' | 'files') => void;
  setBrowserSelectedItem: (itemId: string | null) => void;
  
  // Inspector Actions
  toggleInspector: () => void;
  
  // Routing Matrix Actions
  toggleRoutingMatrix: () => void;
  
  // Marker Actions
  addMarker: (marker: Marker) => void;
  updateMarker: (id: string, updates: Partial<Marker>) => void;
  deleteMarker: (id: string) => void;
  
  // Audio Device Actions
  setSelectedInputDevice: (deviceId: string | null) => void;
  setSelectedOutputDevice: (deviceId: string | null) => void;
  setBufferSize: (size: number) => void;
  
  // Metronome Actions
  setMetronomeVolume: (volume: number) => void;
  
  // Punch Recording Actions
  setPunchMode: (enabled: boolean) => void;
  setPunchIn: (time: number | null) => void;
  setPunchOut: (time: number | null) => void;
  
  // Take Comping Actions
  addTake: (trackId: string, take: Take) => void;
  updateTake: (trackId: string, takeId: string, updates: Partial<Take>) => void;
  deleteTake: (trackId: string, takeId: string) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial State
  currentTime: 0,
  isPlaying: false,
  isRecording: false,
  followPlayhead: true,
  
  // Transport State
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 8,
  tempo: 120,
  timeSignature: '4/4',
  metronomeEnabled: false,
  
  zoom: 1.0,
  scrollPosition: 0,
  snapEnabled: true,
  snapResolution: 0.25, // Quarter note at 120 BPM
  
  selectedTrackIds: [],
  selectedClipIds: [],
  selectedMarkerId: null,
  selectedTrackId: null,
  selectedClipId: null,
  
  // Browser State
  browserVisible: true,
  browserSearchQuery: '',
  browserActiveTab: 'files',
  browserSelectedItem: null,
  
  // Inspector State
  inspectorVisible: true,
  
  // Routing Matrix State
  routingMatrixVisible: false,
  
  markers: [],
  
  // Audio Devices
  selectedInputDevice: null,
  selectedOutputDevice: null,
  bufferSize: 256,
  
  // Metronome Advanced
  metronomeVolume: 0.5,
  
  // Punch Recording
  punchMode: false,
  punchIn: null,
  punchOut: null,
  
  // Take Comping
  takesByTrack: {},
  
  // Playhead Actions
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  toggleFollowPlayhead: () => set((state) => ({ followPlayhead: !state.followPlayhead })),
  
  // Transport Actions
  setLoopEnabled: (enabled) => set({ loopEnabled: enabled }),
  setLoopStart: (time) => set({ loopStart: time }),
  setLoopEnd: (time) => set({ loopEnd: time }),
  setTempo: (tempo) => set({ tempo: Math.max(40, Math.min(240, tempo)) }),
  setTimeSignature: (signature) => set({ timeSignature: signature }),
  setMetronomeEnabled: (enabled) => set({ metronomeEnabled: enabled }),
  
  // View Actions
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),
  setScrollPosition: (position) => set({ scrollPosition: Math.max(0, position) }),
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  setSnapResolution: (resolution) => set({ snapResolution: resolution }),
  
  // Selection Actions
  selectTrack: (trackId, multi = false) => set((state) => ({
    selectedTrackIds: multi 
      ? state.selectedTrackIds.includes(trackId)
        ? state.selectedTrackIds.filter(id => id !== trackId)
        : [...state.selectedTrackIds, trackId]
      : [trackId],
    selectedTrackId: multi ? state.selectedTrackId : trackId,
  })),
  
  selectClip: (clipId, multi = false) => set((state) => ({
    selectedClipIds: multi 
      ? state.selectedClipIds.includes(clipId)
        ? state.selectedClipIds.filter(id => id !== clipId)
        : [...state.selectedClipIds, clipId]
      : [clipId],
    selectedClipId: multi ? state.selectedClipId : clipId,
  })),
  
  selectMarker: (markerId) => set({ selectedMarkerId: markerId }),
  
  clearSelection: () => set({ 
    selectedTrackIds: [], 
    selectedClipIds: [], 
    selectedMarkerId: null,
    selectedTrackId: null,
    selectedClipId: null,
  }),
  
  // Browser Actions
  toggleBrowser: () => set((state) => ({ browserVisible: !state.browserVisible })),
  setBrowserSearchQuery: (query) => set({ browserSearchQuery: query }),
  setBrowserActiveTab: (tab) => set({ browserActiveTab: tab }),
  setBrowserSelectedItem: (itemId) => set({ browserSelectedItem: itemId }),
  
  // Inspector Actions
  toggleInspector: () => set((state) => ({ inspectorVisible: !state.inspectorVisible })),
  
  // Routing Matrix Actions
  toggleRoutingMatrix: () => set((state) => ({ routingMatrixVisible: !state.routingMatrixVisible })),
  
  // Marker Actions
  addMarker: (marker) => set((state) => ({ 
    markers: [...state.markers, marker].sort((a, b) => a.time - b.time) 
  })),
  
  updateMarker: (id, updates) => set((state) => ({ 
    markers: state.markers.map(m => m.id === id ? { ...m, ...updates } : m).sort((a, b) => a.time - b.time)
  })),
  
  deleteMarker: (id) => set((state) => ({ 
    markers: state.markers.filter(m => m.id !== id),
    selectedMarkerId: state.selectedMarkerId === id ? null : state.selectedMarkerId
  })),
  
  // Audio Device Actions
  setSelectedInputDevice: (deviceId) => set({ selectedInputDevice: deviceId }),
  setSelectedOutputDevice: (deviceId) => set({ selectedOutputDevice: deviceId }),
  setBufferSize: (size) => set({ bufferSize: size }),
  
  // Metronome Actions
  setMetronomeVolume: (volume) => set({ metronomeVolume: Math.max(0, Math.min(1, volume)) }),
  
  // Punch Recording Actions
  setPunchMode: (enabled) => set({ punchMode: enabled }),
  setPunchIn: (time) => set({ punchIn: time }),
  setPunchOut: (time) => set({ punchOut: time }),
  
  // Take Comping Actions
  addTake: (trackId, take) => set((state) => ({ 
    takesByTrack: {
      ...state.takesByTrack,
      [trackId]: [...(state.takesByTrack[trackId] || []), take]
    }
  })),
  updateTake: (trackId, takeId, updates) => set((state) => ({ 
    takesByTrack: {
      ...state.takesByTrack,
      [trackId]: (state.takesByTrack[trackId] || []).map(t => 
        t.id === takeId ? { ...t, ...updates } : t
      )
    }
  })),
  deleteTake: (trackId, takeId) => set((state) => ({ 
    takesByTrack: {
      ...state.takesByTrack,
      [trackId]: (state.takesByTrack[trackId] || []).filter(t => t.id !== takeId)
    }
  })),
}));
