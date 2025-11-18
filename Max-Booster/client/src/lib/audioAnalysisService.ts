/**
 * Real Audio Analysis Service using Essentia.js
 * Implements BPM detection, key detection, and audio feature extraction
 */

import { Essentia, EssentiaWASM } from 'essentia.js';

export interface AudioAnalysisResult {
  bpm: number;
  musicalKey: string;
  scale: string;
  energy: number;
  danceability: number;
  loudness: number;
  spectralCentroid: number;
  durationSeconds: number;
  beatPositions: number[];
}

class AudioAnalysisService {
  private essentia: Essentia | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const EssentiaModule = await EssentiaWASM();
      this.essentia = new Essentia(EssentiaModule);
      this.initialized = true;
    } catch (error: unknown) {
      logger.error('Failed to initialize Essentia.js:', error);
      throw new Error('Failed to initialize audio analysis engine');
    }
  }

  /**
   * Analyze audio file and extract all features
   */
  async analyzeAudioFile(audioFile: File): Promise<AudioAnalysisResult> {
    await this.initialize();

    if (!this.essentia) {
      throw new Error('Essentia not initialized');
    }

    // Decode audio file to AudioBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Convert to mono Float32Array
    const audioData = this.convertToMono(audioBuffer);

    // Create Essentia vector
    const audioVector = this.essentia.arrayToVector(audioData);

    // Extract all features
    const analysis: AudioAnalysisResult = {
      bpm: this.extractBPM(audioVector),
      ...this.extractKey(audioVector),
      energy: this.extractEnergy(audioVector),
      danceability: this.extractDanceability(audioVector),
      loudness: this.extractLoudness(audioVector),
      spectralCentroid: this.extractSpectralCentroid(audioVector),
      durationSeconds: audioBuffer.duration,
      beatPositions: this.extractBeatPositions(audioVector),
    };

    // Clean up
    audioVector.delete();
    await audioContext.close();

    return analysis;
  }

  /**
   * Extract BPM using RhythmExtractor
   */
  private extractBPM(audioVector: unknown): number {
    try {
      const rhythm = this.essentia!.RhythmExtractor2013(audioVector);
      return Math.round(rhythm.bpm * 100) / 100;
    } catch (error: unknown) {
      logger.error('BPM extraction error:', error);
      return 120; // Default fallback
    }
  }

  /**
   * Extract musical key and scale
   */
  private extractKey(audioVector: unknown): { musicalKey: string; scale: string } {
    try {
      const keyData = this.essentia!.KeyExtractor(audioVector, true, true, true, true, true, true);
      return {
        musicalKey: keyData.key,
        scale: keyData.scale,
      };
    } catch (error: unknown) {
      logger.error('Key extraction error:', error);
      return { musicalKey: 'C', scale: 'major' };
    }
  }

  /**
   * Extract energy level
   */
  private extractEnergy(audioVector: unknown): number {
    try {
      const rms = this.essentia!.RMS(audioVector);
      // Normalize to 0-1 range
      return Math.min(1, rms.rms * 10);
    } catch (error: unknown) {
      logger.error('Energy extraction error:', error);
      return 0.5;
    }
  }

  /**
   * Extract danceability
   */
  private extractDanceability(audioVector: unknown): number {
    try {
      const danceability = this.essentia!.Danceability(audioVector);
      return Math.round(danceability.danceability * 100) / 100;
    } catch (error: unknown) {
      logger.error('Danceability extraction error:', error);
      return 0.5;
    }
  }

  /**
   * Extract loudness (approximation)
   */
  private extractLoudness(audioVector: unknown): number {
    try {
      const loudness = this.essentia!.Loudness(audioVector);
      return Math.round(loudness.loudness * 100) / 100;
    } catch (error: unknown) {
      logger.error('Loudness extraction error:', error);
      return -14.0; // Default LUFS target
    }
  }

  /**
   * Extract spectral centroid (brightness measure)
   */
  private extractSpectralCentroid(audioVector: unknown): number {
    try {
      const centroid = this.essentia!.Centroid(audioVector);
      return Math.round(centroid.centroid * 100) / 100;
    } catch (error: unknown) {
      logger.error('Spectral centroid extraction error:', error);
      return 1500; // Default value
    }
  }

  /**
   * Extract beat positions (timestamps)
   */
  private extractBeatPositions(audioVector: unknown): number[] {
    try {
      const beats = this.essentia!.BeatTrackerMultiFeature(audioVector);
      // Convert to array and round to 2 decimal places
      const positions: number[] = [];
      for (let i = 0; i < beats.ticks.size(); i++) {
        positions.push(Math.round(beats.ticks.get(i) * 100) / 100);
      }
      return positions;
    } catch (error: unknown) {
      logger.error('Beat extraction error:', error);
      return [];
    }
  }

  /**
   * Convert stereo/multi-channel AudioBuffer to mono Float32Array
   */
  private convertToMono(audioBuffer: AudioBuffer): Float32Array {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }

    // Average all channels to mono
    const monoData = new Float32Array(audioBuffer.length);
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i++) {
        monoData[i] += channelData[i] / audioBuffer.numberOfChannels;
      }
    }

    return monoData;
  }

  /**
   * Analyze audio from URL
   */
  async analyzeAudioURL(url: string): Promise<AudioAnalysisResult> {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'audio.wav', { type: blob.type });
    return this.analyzeAudioFile(file);
  }
}

// Export singleton instance
export const audioAnalysisService = new AudioAnalysisService();
