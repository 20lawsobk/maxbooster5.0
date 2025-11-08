import { aiService } from "./aiService";
import { studioService } from "./studioService";
import { storage } from "../storage";

export interface MixSettings {
  eq: {
    lowGain: number;
    lowMidGain: number;
    midGain: number;
    highMidGain: number;
    highGain: number;
    lowCut: number;
    highCut: number;
  };
  compression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeupGain: number;
  };
  effects: {
    reverb: { wetness: number; roomSize: number; damping: number };
    delay: { time: number; feedback: number; wetness: number };
    chorus: { rate: number; depth: number; wetness: number };
    saturation: { drive: number; warmth: number };
  };
  stereoImaging: {
    width: number;
    bassMonoFreq: number;
  };
}

export interface MasterSettings {
  multiband: {
    low: { threshold: number; ratio: number; gain: number; frequency: number };
    lowMid: { threshold: number; ratio: number; gain: number; frequency: number };
    mid: { threshold: number; ratio: number; gain: number; frequency: number };
    highMid: { threshold: number; ratio: number; gain: number; frequency: number };
    high: { threshold: number; ratio: number; gain: number; frequency: number };
  };
  limiter: {
    ceiling: number;
    release: number;
    lookahead: number;
  };
  maximizer: {
    amount: number;
    character: 'transparent' | 'punchy' | 'warm' | 'aggressive';
  };
  stereoEnhancer: {
    width: number;
    bassWidth: number;
  };
  spectralBalance: {
    lowShelf: number;
    highShelf: number;
    presence: number;
  };
}

export interface AudioAnalysis {
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  energy: number;
  danceability: number;
  valence: number;
  instrumentalness: number;
  acousticness: number;
  stems: {
    vocals: boolean;
    drums: boolean;
    bass: boolean;
    melody: boolean;
    harmony: boolean;
  };
}

export class AIMusicService {
  /**
   * Run AI mixing on a track
   */
  async runAIMix(trackId: string, userId: string, audioData?: Buffer): Promise<{
    success: boolean;
    mixSettings: MixSettings;
    analysisData: AudioAnalysis;
  }> {
    try {
      // Use AI service for intelligent mixing
      const result = await aiService.mixTrack(trackId, userId, audioData);
      
      // Get audio analysis
      let analysisData: AudioAnalysis;
      if (audioData) {
        analysisData = await aiService.analyzeTrack(audioData);
      } else {
        analysisData = {
          bpm: 120,
          key: "C Major",
          genre: "Electronic",
          mood: "Energetic",
          energy: 0.8,
          danceability: 0.7,
          valence: 0.6,
          instrumentalness: 0.3,
          acousticness: 0.2,
          stems: {
            vocals: true,
            drums: true,
            bass: true,
            melody: true,
            harmony: true,
          },
        };
      }

      return {
        success: result.success,
        mixSettings: result.mixSettings,
        analysisData,
      };
    } catch (error) {
      console.error("Error running AI mix:", error);
      throw new Error("Failed to run AI mixing");
    }
  }

  /**
   * Run AI mastering on a project
   */
  async runAIMaster(projectId: string, userId: string, audioData?: Buffer): Promise<{
    success: boolean;
    masterSettings: MasterSettings;
    analysisData: AudioAnalysis;
  }> {
    try {
      // Verify project access
      const project = await studioService.getProject(projectId, userId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Use AI service for professional mastering
      const result = await aiService.masterTrack(projectId, userId, audioData);
      
      // Get audio analysis
      let analysisData: AudioAnalysis;
      if (audioData) {
        analysisData = await aiService.analyzeTrack(audioData);
      } else {
        analysisData = {
          bpm: project.bpm || 120,
          key: project.key || "C",
          genre: "Electronic",
          mood: "Energetic",
          energy: 0.8,
          danceability: 0.7,
          valence: 0.6,
          instrumentalness: 0.3,
          acousticness: 0.2,
          stems: {
            vocals: true,
            drums: true,
            bass: true,
            melody: true,
            harmony: true,
          },
        };
      }

      return {
        success: result.success,
        masterSettings: result.masterSettings,
        analysisData,
      };
    } catch (error) {
      console.error("Error running AI master:", error);
      throw new Error("Failed to run AI mastering");
    }
  }

  /**
   * Analyze track audio characteristics
   */
  async analyzeTrack(trackId: string, audioData?: Buffer): Promise<AudioAnalysis> {
    try {
      if (!audioData) {
        // If no audio data provided, return default analysis
        return {
          bpm: 120,
          key: "C Major",
          genre: "Electronic",
          mood: "Energetic",
          energy: 0.8,
          danceability: 0.7,
          valence: 0.6,
          instrumentalness: 0.3,
          acousticness: 0.2,
          stems: {
            vocals: true,
            drums: true,
            bass: true,
            melody: true,
            harmony: true,
          },
        };
      }

      return await aiService.analyzeTrack(audioData);
    } catch (error) {
      console.error("Error analyzing track:", error);
      throw new Error("Failed to analyze track");
    }
  }

  /**
   * Get mixing suggestions based on genre
   */
  async getMixingSuggestions(genre: string, mood?: string): Promise<{
    suggestions: string[];
    presets: MixSettings[];
  }> {
    try {
      const suggestions: string[] = [];
      const presets: MixSettings[] = [];

      // Genre-specific suggestions
      const genreSuggestions: Record<string, string[]> = {
        electronic: [
          "Apply sidechain compression to create pumping effect",
          "Use high-pass filter on synths to avoid low-end muddiness",
          "Add stereo width to pads and atmospheric elements",
          "Use parallel compression on drums for punch",
        ],
        'hip-hop': [
          "Keep kick and bass centered for maximum impact",
          "Use saturation on vocals for presence",
          "Apply subtle reverb to create depth without losing clarity",
          "Use high-shelf boost for air and clarity",
        ],
        pop: [
          "Vocals should be clear and upfront in the mix",
          "Use automation for dynamic vocal presence",
          "Add brightness to the mix with high-frequency enhancement",
          "Apply compression for consistent energy",
        ],
        rock: [
          "Use parallel compression on drums for power",
          "Pan guitars left and right for width",
          "Keep vocals and bass centered",
          "Use saturation for warmth and analog feel",
        ],
      };

      suggestions.push(...(genreSuggestions[genre.toLowerCase()] || genreSuggestions.electronic));

      // Generate preset based on genre
      presets.push(this.getGenrePreset(genre));

      return { suggestions, presets };
    } catch (error) {
      console.error("Error getting mixing suggestions:", error);
      throw new Error("Failed to get mixing suggestions");
    }
  }

  /**
   * Get mastering suggestions based on target platform
   */
  async getMasteringSuggestions(platform: 'streaming' | 'radio' | 'club' | 'youtube'): Promise<{
    suggestions: string[];
    targetLUFS: number;
    targetPeaks: number;
    presets: MasterSettings[];
  }> {
    try {
      const platformSpecs: Record<string, any> = {
        streaming: {
          lufs: -14,
          peaks: -1,
          suggestions: [
            "Aim for -14 LUFS for optimal streaming loudness",
            "Leave 1dB headroom for format conversion",
            "Use transparent limiting to avoid distortion",
            "Ensure low-end is tight and controlled",
          ],
        },
        radio: {
          lufs: -6,
          peaks: -0.5,
          suggestions: [
            "Radio requires louder masters around -6 LUFS",
            "Use aggressive limiting but maintain dynamics",
            "Enhance presence frequencies for clarity",
            "Compress low-end to avoid distortion on small speakers",
          ],
        },
        club: {
          lufs: -8,
          peaks: -1,
          suggestions: [
            "Club masters should be punchy around -8 LUFS",
            "Emphasize bass and sub-bass frequencies",
            "Use multiband compression for control",
            "Ensure wide stereo field for immersive experience",
          ],
        },
        youtube: {
          lufs: -13,
          peaks: -1,
          suggestions: [
            "YouTube normalizes to -13 LUFS",
            "Optimize for both speakers and headphones",
            "Ensure vocals are clear and upfront",
            "Add brightness for laptop/phone playback",
          ],
        },
      };

      const spec = platformSpecs[platform] || platformSpecs.streaming;

      return {
        suggestions: spec.suggestions,
        targetLUFS: spec.lufs,
        targetPeaks: spec.peaks,
        presets: [this.getMasteringPreset(platform)],
      };
    } catch (error) {
      console.error("Error getting mastering suggestions:", error);
      throw new Error("Failed to get mastering suggestions");
    }
  }

  /**
   * Stem separation using AI
   */
  async separateStems(audioData: Buffer): Promise<{
    vocals?: string;
    drums?: string;
    bass?: string;
    melody?: string;
    other?: string;
  }> {
    try {
      // In production, use AI models like:
      // - Demucs for high-quality stem separation
      // - Spleeter
      // - Custom trained models

      return {
        vocals: '/stems/vocals.wav',
        drums: '/stems/drums.wav',
        bass: '/stems/bass.wav',
        melody: '/stems/melody.wav',
        other: '/stems/other.wav',
      };
    } catch (error) {
      console.error("Error separating stems:", error);
      throw new Error("Failed to separate stems");
    }
  }

  private getGenrePreset(genre: string): MixSettings {
    const presets: Record<string, MixSettings> = {
      electronic: {
        eq: {
          lowGain: 2,
          lowMidGain: 0,
          midGain: -1,
          highMidGain: 1,
          highGain: 3,
          lowCut: 30,
          highCut: 18000,
        },
        compression: {
          threshold: -12,
          ratio: 4,
          attack: 10,
          release: 100,
          makeupGain: 3,
        },
        effects: {
          reverb: { wetness: 0.2, roomSize: 0.5, damping: 0.4 },
          delay: { time: 0.375, feedback: 0.3, wetness: 0.15 },
          chorus: { rate: 0.5, depth: 0.3, wetness: 0.1 },
          saturation: { drive: 0.3, warmth: 0.4 },
        },
        stereoImaging: {
          width: 1.2,
          bassMonoFreq: 120,
        },
      },
      'hip-hop': {
        eq: {
          lowGain: 4,
          lowMidGain: -1,
          midGain: 0,
          highMidGain: 2,
          highGain: 3,
          lowCut: 25,
          highCut: 16000,
        },
        compression: {
          threshold: -15,
          ratio: 6,
          attack: 5,
          release: 80,
          makeupGain: 4,
        },
        effects: {
          reverb: { wetness: 0.15, roomSize: 0.4, damping: 0.5 },
          delay: { time: 0.25, feedback: 0.2, wetness: 0.1 },
          chorus: { rate: 0.3, depth: 0.2, wetness: 0.05 },
          saturation: { drive: 0.5, warmth: 0.6 },
        },
        stereoImaging: {
          width: 1.0,
          bassMonoFreq: 150,
        },
      },
    };

    return presets[genre.toLowerCase()] || presets.electronic;
  }

  private getMasteringPreset(platform: string): MasterSettings {
    const presets: Record<string, MasterSettings> = {
      streaming: {
        multiband: {
          low: { threshold: -20, ratio: 3, gain: 1, frequency: 120 },
          lowMid: { threshold: -18, ratio: 2.5, gain: 0, frequency: 500 },
          mid: { threshold: -16, ratio: 2, gain: -0.5, frequency: 2000 },
          highMid: { threshold: -14, ratio: 2, gain: 1, frequency: 5000 },
          high: { threshold: -12, ratio: 1.5, gain: 1.5, frequency: 10000 },
        },
        limiter: {
          ceiling: -1,
          release: 50,
          lookahead: 5,
        },
        maximizer: {
          amount: 0.6,
          character: 'transparent',
        },
        stereoEnhancer: {
          width: 1.1,
          bassWidth: 0.8,
        },
        spectralBalance: {
          lowShelf: 1,
          highShelf: 2,
          presence: 1.5,
        },
      },
    };

    return presets[platform] || presets.streaming;
  }
}

export const aiMusicService = new AIMusicService();
