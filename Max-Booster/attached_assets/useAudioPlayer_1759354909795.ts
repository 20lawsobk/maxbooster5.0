import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioContext } from './useAudioContext';

export interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
  waveformData?: number[];
  gain: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  effects?: AudioEffect[];
}

export interface AudioEffect {
  id: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'distortion' | 'filter';
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  tracks: Track[];
  masterVolume: number;
  bpm: number;
  timeSignature: [number, number];
}

export interface AudioPlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  preload?: boolean;
}

export function useAudioPlayer(options: AudioPlayerOptions = {}) {
  const { context, isSupported } = useAudioContext();
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
    tracks: [],
    masterVolume: 1.0,
    bpm: 120,
    timeSignature: [4, 4],
  });

  const audioSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const panNodesRef = useRef<Map<string, StereoPannerNode>>(new Map());
  const effectNodesRef = useRef<Map<string, AudioNode[]>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  // Initialize master gain node
  useEffect(() => {
    if (context && !masterGainRef.current) {
      masterGainRef.current = context.createGain();
      masterGainRef.current.connect(context.destination);
      masterGainRef.current.gain.setValueAtTime(state.masterVolume, context.currentTime);
    }
  }, [context, state.masterVolume]);

  const loadTrack = useCallback(async (track: Track): Promise<void> => {
    if (!context || !isSupported) {
      throw new Error('Audio context not available');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(track.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      audioBuffersRef.current.set(track.id, audioBuffer);
      
      // Create gain and pan nodes for this track
      const gainNode = context.createGain();
      const panNode = context.createStereoPanner();
      
      gainNode.gain.setValueAtTime(track.gain, context.currentTime);
      panNode.pan.setValueAtTime(track.pan, context.currentTime);
      
      gainNodesRef.current.set(track.id, gainNode);
      panNodesRef.current.set(track.id, panNode);

      // Set up effects chain
      if (track.effects && track.effects.length > 0) {
        const effectChain = await createEffectsChain(track.effects, context);
        effectNodesRef.current.set(track.id, effectChain);
        
        // Connect the chain: gain -> effects -> pan -> master
        gainNode.connect(effectChain[0]);
        effectChain[effectChain.length - 1].connect(panNode);
      } else {
        // Direct connection: gain -> pan -> master
        gainNode.connect(panNode);
      }
      
      if (masterGainRef.current) {
        panNode.connect(masterGainRef.current);
      }

      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => 
          t.id === track.id ? { ...t, duration: audioBuffer.duration } : t
        ),
        duration: Math.max(prev.duration, audioBuffer.duration),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error loading track:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [context, isSupported]);

  const addTrack = useCallback(async (track: Track) => {
    setState(prev => ({ ...prev, tracks: [...prev.tracks, track] }));
    await loadTrack(track);
  }, [loadTrack]);

  const removeTrack = useCallback((trackId: string) => {
    // Stop and clean up audio nodes
    const source = audioSourcesRef.current.get(trackId);
    if (source) {
      source.stop();
      source.disconnect();
      audioSourcesRef.current.delete(trackId);
    }

    // Clean up other nodes
    audioBuffersRef.current.delete(trackId);
    gainNodesRef.current.delete(trackId);
    panNodesRef.current.delete(trackId);
    effectNodesRef.current.delete(trackId);

    setState(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId),
    }));
  }, []);

  const play = useCallback(async (startTime: number = 0) => {
    if (!context || !masterGainRef.current) {
      throw new Error('Audio context not available');
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    // Create new sources for all tracks
    audioSourcesRef.current.clear();
    
    for (const track of state.tracks) {
      const buffer = audioBuffersRef.current.get(track.id);
      const gainNode = gainNodesRef.current.get(track.id);
      
      if (buffer && gainNode) {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.setValueAtTime(state.playbackRate, context.currentTime);
        source.connect(gainNode);
        
        audioSourcesRef.current.set(track.id, source);
        
        // Apply mute/solo logic
        const shouldPlay = !track.isMuted && (!hasSoloTracks() || track.isSolo);
        if (shouldPlay) {
          source.start(context.currentTime, startTime);
        }
      }
    }

    startTimeRef.current = context.currentTime - startTime;
    pauseTimeRef.current = 0;
    
    setState(prev => ({ ...prev, isPlaying: true, isPaused: false, currentTime: startTime }));
    
    // Start time updates
    updateCurrentTime();

  }, [context, state.tracks, state.playbackRate]);

  const pause = useCallback(() => {
    if (!context) return;

    pauseTimeRef.current = context.currentTime - startTimeRef.current;
    
    // Stop all sources
    audioSourcesRef.current.forEach(source => {
      source.stop();
      source.disconnect();
    });
    audioSourcesRef.current.clear();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
  }, [context]);

  const stop = useCallback(() => {
    if (!context) return;

    // Stop all sources
    audioSourcesRef.current.forEach(source => {
      source.stop();
      source.disconnect();
    });
    audioSourcesRef.current.clear();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    }));

    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
  }, [context]);

  const seek = useCallback((time: number) => {
    const wasPlaying = state.isPlaying;
    
    if (wasPlaying) {
      pause();
    }
    
    setState(prev => ({ ...prev, currentTime: time }));
    
    if (wasPlaying) {
      play(time);
    }
  }, [state.isPlaying, pause, play]);

  const updateTrackGain = useCallback((trackId: string, gain: number) => {
    const gainNode = gainNodesRef.current.get(trackId);
    if (gainNode && context) {
      gainNode.gain.setTargetAtTime(gain, context.currentTime, 0.1);
    }
    
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, gain } : t
      ),
    }));
  }, [context]);

  const updateTrackPan = useCallback((trackId: string, pan: number) => {
    const panNode = panNodesRef.current.get(trackId);
    if (panNode && context) {
      panNode.pan.setTargetAtTime(pan, context.currentTime, 0.1);
    }
    
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, pan } : t
      ),
    }));
  }, [context]);

  const muteTrack = useCallback((trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      ),
    }));
  }, []);

  const soloTrack = useCallback((trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, isSolo: !t.isSolo } : t
      ),
    }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    if (masterGainRef.current && context) {
      masterGainRef.current.gain.setTargetAtTime(volume, context.currentTime, 0.1);
    }
    setState(prev => ({ ...prev, masterVolume: volume }));
  }, [context]);

  const setPlaybackRate = useCallback((rate: number) => {
    audioSourcesRef.current.forEach(source => {
      if (context) {
        source.playbackRate.setTargetAtTime(rate, context.currentTime, 0.1);
      }
    });
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, [context]);

  // Helper functions
  const hasSoloTracks = useCallback(() => {
    return state.tracks.some(t => t.isSolo);
  }, [state.tracks]);

  const updateCurrentTime = useCallback(() => {
    if (state.isPlaying && context) {
      const currentTime = context.currentTime - startTimeRef.current;
      setState(prev => ({ ...prev, currentTime }));
      
      if (currentTime >= state.duration) {
        stop();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
      }
    }
  }, [state.isPlaying, context, state.duration, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioSourcesRef.current.forEach(source => {
        source.stop();
        source.disconnect();
      });
    };
  }, []);

  return {
    ...state,
    isSupported,
    addTrack,
    removeTrack,
    loadTrack,
    play,
    pause,
    stop,
    seek,
    updateTrackGain,
    updateTrackPan,
    muteTrack,
    soloTrack,
    setMasterVolume,
    setPlaybackRate,
  };
}

// Helper function to create effects chain
async function createEffectsChain(effects: AudioEffect[], context: AudioContext): Promise<AudioNode[]> {
  const nodes: AudioNode[] = [];
  
  for (const effect of effects) {
    if (!effect.enabled) continue;
    
    let node: AudioNode;
    
    switch (effect.type) {
      case 'eq':
        // Create a 3-band EQ
        const lowShelf = context.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.setValueAtTime(320, context.currentTime);
        lowShelf.gain.setValueAtTime(effect.parameters.lowGain || 0, context.currentTime);
        
        const midPeak = context.createBiquadFilter();
        midPeak.type = 'peaking';
        midPeak.frequency.setValueAtTime(1000, context.currentTime);
        midPeak.gain.setValueAtTime(effect.parameters.midGain || 0, context.currentTime);
        midPeak.Q.setValueAtTime(1, context.currentTime);
        
        const highShelf = context.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.setValueAtTime(3200, context.currentTime);
        highShelf.gain.setValueAtTime(effect.parameters.highGain || 0, context.currentTime);
        
        lowShelf.connect(midPeak);
        midPeak.connect(highShelf);
        
        nodes.push(lowShelf, midPeak, highShelf);
        node = lowShelf;
        break;
        
      case 'compressor':
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(effect.parameters.threshold || -24, context.currentTime);
        compressor.knee.setValueAtTime(effect.parameters.knee || 30, context.currentTime);
        compressor.ratio.setValueAtTime(effect.parameters.ratio || 12, context.currentTime);
        compressor.attack.setValueAtTime(effect.parameters.attack || 0.003, context.currentTime);
        compressor.release.setValueAtTime(effect.parameters.release || 0.25, context.currentTime);
        node = compressor;
        break;
        
      case 'delay':
        const delay = context.createDelay();
        const delayGain = context.createGain();
        const feedback = context.createGain();
        
        delay.delayTime.setValueAtTime(effect.parameters.time || 0.25, context.currentTime);
        delayGain.gain.setValueAtTime(effect.parameters.wet || 0.2, context.currentTime);
        feedback.gain.setValueAtTime(effect.parameters.feedback || 0.3, context.currentTime);
        
        delay.connect(delayGain);
        delay.connect(feedback);
        feedback.connect(delay);
        
        nodes.push(delay, delayGain, feedback);
        node = delay;
        break;
        
      case 'filter':
        const filter = context.createBiquadFilter();
        filter.type = (effect.parameters.type as BiquadFilterType) || 'lowpass';
        filter.frequency.setValueAtTime(effect.parameters.frequency || 1000, context.currentTime);
        filter.Q.setValueAtTime(effect.parameters.q || 1, context.currentTime);
        node = filter;
        break;
        
      default:
        // Create a gain node as fallback
        node = context.createGain();
        break;
    }
    
    nodes.push(node);
  }
  
  // Connect the chain
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }
  
  return nodes;
}