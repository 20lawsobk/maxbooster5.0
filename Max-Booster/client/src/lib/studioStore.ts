import { create } from 'zustand';

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
  
  // Timeline View State
  zoom: number;
  scrollPosition: number;
  snapEnabled: boolean;
  snapResolution: number; // in seconds
  
  // Selection
  selectedTrackIds: string[];
  selectedClipIds: string[];
  selectedMarkerId: string | null;
  
  // Markers
  markers: Marker[];
  
  // Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  toggleFollowPlayhead: () => void;
  
  setZoom: (zoom: number) => void;
  setScrollPosition: (position: number) => void;
  toggleSnap: () => void;
  setSnapResolution: (resolution: number) => void;
  
  selectTrack: (trackId: string, multi?: boolean) => void;
  selectClip: (clipId: string, multi?: boolean) => void;
  selectMarker: (markerId: string | null) => void;
  clearSelection: () => void;
  
  addMarker: (marker: Marker) => void;
  updateMarker: (id: string, updates: Partial<Marker>) => void;
  deleteMarker: (id: string) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial State
  currentTime: 0,
  isPlaying: false,
  isRecording: false,
  followPlayhead: true,
  
  zoom: 1.0,
  scrollPosition: 0,
  snapEnabled: true,
  snapResolution: 0.25, // Quarter note at 120 BPM
  
  selectedTrackIds: [],
  selectedClipIds: [],
  selectedMarkerId: null,
  
  markers: [],
  
  // Playhead Actions
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  toggleFollowPlayhead: () => set((state) => ({ followPlayhead: !state.followPlayhead })),
  
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
      : [trackId]
  })),
  
  selectClip: (clipId, multi = false) => set((state) => ({
    selectedClipIds: multi 
      ? state.selectedClipIds.includes(clipId)
        ? state.selectedClipIds.filter(id => id !== clipId)
        : [...state.selectedClipIds, clipId]
      : [clipId]
  })),
  
  selectMarker: (markerId) => set({ selectedMarkerId: markerId }),
  
  clearSelection: () => set({ 
    selectedTrackIds: [], 
    selectedClipIds: [], 
    selectedMarkerId: null 
  }),
  
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
}));
