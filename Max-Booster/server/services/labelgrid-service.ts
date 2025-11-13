import axios, { AxiosInstance, AxiosError } from 'axios';
import { loggingService } from './loggingService';

export interface LabelGridRelease {
  title: string;
  artist: string;
  releaseDate: string;
  upc?: string;
  tracks: LabelGridTrack[];
  artwork: string;
  genre: string;
  platforms: string[];
  label?: string;
  copyrightYear?: number;
  copyrightOwner?: string;
  territoryMode?: 'worldwide' | 'include' | 'exclude';
  territories?: string[];
}

export interface LabelGridTrack {
  title: string;
  artist: string;
  isrc?: string;
  audioFile: string;
  duration: number;
  trackNumber: number;
  explicit?: boolean;
  lyrics?: string;
}

export interface LabelGridReleaseResponse {
  releaseId: string;
  status: 'draft' | 'processing' | 'live' | 'failed';
  submittedAt: string;
  estimatedLiveDate?: string;
  platforms: LabelGridPlatformStatus[];
}

export interface LabelGridPlatformStatus {
  platform: string;
  status: 'pending' | 'processing' | 'live' | 'failed';
  liveDate?: string;
  errorMessage?: string;
}

export interface LabelGridAnalytics {
  releaseId: string;
  totalStreams: number;
  totalRevenue: number;
  platforms: {
    [key: string]: {
      streams: number;
      revenue: number;
      listeners: number;
    };
  };
  timeline: {
    date: string;
    streams: number;
    revenue: number;
  }[];
}

export interface LabelGridWebhookPayload {
  event: string;
  releaseId: string;
  status?: string;
  errorMessage?: string;
  platform?: string;
  data?: any;
  timestamp: string;
}

export interface LabelGridCodeResponse {
  code: string;
  type: 'isrc' | 'upc';
  assignedTo?: string;
  createdAt: string;
}

class LabelGridService {
  private client: AxiosInstance;
  private apiToken: string | undefined;
  private apiUrl: string;
  private webhookSecret: string | undefined;
  private isConfigured: boolean = false;
  private maxRetries: number = 3;
  private baseDelay: number = 1000;

  constructor() {
    this.apiToken = process.env.LABELGRID_API_TOKEN;
    this.apiUrl = process.env.LABELGRID_API_URL || 'https://api.labelgrid.com';
    this.webhookSecret = process.env.LABELGRID_WEBHOOK_SECRET;

    if (!this.apiToken) {
      console.warn('⚠️  LabelGrid API token not configured. Distribution features will use simulated mode.');
      console.warn('   Set LABELGRID_API_TOKEN in your environment to enable real distribution.');
    } else {
      this.isConfigured = true;
      console.log('✅ LabelGrid API client initialized');
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiToken && { 'Authorization': `Bearer ${this.apiToken}` }),
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logError('LabelGrid API Error', error);
        return Promise.reject(error);
      }
    );
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const axiosError = error as AxiosError;
        
        const isRetryable = 
          axiosError.code === 'ECONNABORTED' ||
          axiosError.code === 'ETIMEDOUT' ||
          (axiosError.response?.status && axiosError.response.status >= 500);

        if (isLastAttempt || !isRetryable) {
          throw error;
        }

        const delay = Math.min(this.baseDelay * Math.pow(2, attempt), 16000);
        console.log(`⏳ LabelGrid API retry ${attempt + 1}/${retries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private logError(context: string, error: any): void {
    const errorDetails = {
      context,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    loggingService.logError(`${context}: ${error.message}`, errorDetails);
  }

  private logApiCall(method: string, endpoint: string, data?: any): void {
    loggingService.logInfo(`LabelGrid API ${method} ${endpoint}`, {
      endpoint,
      method,
      hasData: !!data,
    });
  }

  async createRelease(releaseData: LabelGridRelease): Promise<LabelGridReleaseResponse> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - returning simulated response');
      return this.simulateCreateRelease(releaseData);
    }

    this.logApiCall('POST', '/releases', releaseData);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.post<LabelGridReleaseResponse>('/v1/releases', {
          title: releaseData.title,
          artist: releaseData.artist,
          release_date: releaseData.releaseDate,
          upc: releaseData.upc,
          artwork_url: releaseData.artwork,
          genre: releaseData.genre,
          label: releaseData.label,
          copyright_year: releaseData.copyrightYear,
          copyright_owner: releaseData.copyrightOwner,
          territory_mode: releaseData.territoryMode || 'worldwide',
          territories: releaseData.territories || [],
          platforms: releaseData.platforms,
          tracks: releaseData.tracks.map(track => ({
            title: track.title,
            artist: track.artist,
            isrc: track.isrc,
            audio_url: track.audioFile,
            duration_seconds: track.duration,
            track_number: track.trackNumber,
            explicit: track.explicit || false,
            lyrics: track.lyrics,
          })),
        });
      });

      loggingService.logInfo('LabelGrid release created successfully', {
        releaseId: response.data.releaseId,
        status: response.data.status,
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to create LabelGrid release', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getReleaseStatus(releaseId: string): Promise<LabelGridReleaseResponse> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - returning simulated response');
      return this.simulateGetReleaseStatus(releaseId);
    }

    this.logApiCall('GET', `/releases/${releaseId}/status`);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.get<LabelGridReleaseResponse>(
          `/v1/releases/${releaseId}/status`
        );
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to get LabelGrid release status', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async generateISRC(artist: string, title: string): Promise<LabelGridCodeResponse> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - generating local ISRC');
      return this.simulateGenerateISRC(artist, title);
    }

    this.logApiCall('POST', '/codes/isrc', { artist, title });

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.post<LabelGridCodeResponse>('/v1/codes/isrc', {
          artist,
          title,
        });
      });

      loggingService.logInfo('ISRC generated successfully', {
        code: response.data.code,
        artist,
        title,
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to generate ISRC', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async generateUPC(releaseTitle: string): Promise<LabelGridCodeResponse> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - generating local UPC');
      return this.simulateGenerateUPC(releaseTitle);
    }

    this.logApiCall('POST', '/codes/upc', { releaseTitle });

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.post<LabelGridCodeResponse>('/v1/codes/upc', {
          release_title: releaseTitle,
        });
      });

      loggingService.logInfo('UPC generated successfully', {
        code: response.data.code,
        releaseTitle,
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to generate UPC', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getReleaseAnalytics(releaseId: string): Promise<LabelGridAnalytics> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - returning simulated analytics');
      return this.simulateGetReleaseAnalytics(releaseId);
    }

    this.logApiCall('GET', `/releases/${releaseId}/analytics`);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.get<LabelGridAnalytics>(
          `/v1/releases/${releaseId}/analytics`
        );
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to get LabelGrid release analytics', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async updateRelease(
    releaseId: string,
    updates: Partial<LabelGridRelease>
  ): Promise<LabelGridReleaseResponse> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - returning simulated response');
      return this.simulateUpdateRelease(releaseId, updates);
    }

    this.logApiCall('PATCH', `/releases/${releaseId}`, updates);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.patch<LabelGridReleaseResponse>(
          `/v1/releases/${releaseId}`,
          updates
        );
      });

      loggingService.logInfo('LabelGrid release updated successfully', {
        releaseId,
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to update LabelGrid release', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async takedownRelease(releaseId: string): Promise<{ success: boolean }> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - returning simulated response');
      return { success: true };
    }

    this.logApiCall('DELETE', `/releases/${releaseId}`);

    try {
      await this.retryWithBackoff(async () => {
        return await this.client.delete(`/v1/releases/${releaseId}/takedown`);
      });

      loggingService.logInfo('LabelGrid release takedown initiated', {
        releaseId,
      });

      return { success: true };
    } catch (error: any) {
      this.logError('Failed to takedown LabelGrid release', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getArtistAnalytics(artistId: string): Promise<LabelGridAnalytics> {
    if (!this.isConfigured) {
      console.warn('⚠️  LabelGrid not configured - returning simulated analytics');
      return this.simulateGetArtistAnalytics(artistId);
    }

    this.logApiCall('GET', `/artists/${artistId}/analytics`);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.get<LabelGridAnalytics>(
          `/v1/artists/${artistId}/analytics`
        );
      });

      return response.data;
    } catch (error: any) {
      this.logError('Failed to get LabelGrid artist analytics', error);
      throw new Error(
        `LabelGrid API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('⚠️  LabelGrid webhook secret not configured - skipping verification');
      return true;
    }

    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      this.logError('Webhook signature verification failed', error);
      return false;
    }
  }

  private simulateCreateRelease(releaseData: LabelGridRelease): LabelGridReleaseResponse {
    const releaseId = `lg_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const estimatedLiveDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      releaseId,
      status: 'processing',
      submittedAt: new Date().toISOString(),
      estimatedLiveDate: estimatedLiveDate.toISOString(),
      platforms: releaseData.platforms.map(platform => ({
        platform,
        status: 'processing',
      })),
    };
  }

  private simulateGetReleaseStatus(releaseId: string): LabelGridReleaseResponse {
    return {
      releaseId,
      status: 'processing',
      submittedAt: new Date().toISOString(),
      estimatedLiveDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      platforms: [
        { platform: 'spotify', status: 'processing' },
        { platform: 'apple_music', status: 'processing' },
        { platform: 'youtube_music', status: 'processing' },
      ],
    };
  }

  private simulateGenerateISRC(artist: string, title: string): LabelGridCodeResponse {
    const year = new Date().getFullYear().toString().substring(2);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const code = `US-SIM-${year}-${randomNum}`;

    return {
      code,
      type: 'isrc',
      assignedTo: `${artist} - ${title}`,
      createdAt: new Date().toISOString(),
    };
  }

  private simulateGenerateUPC(releaseTitle: string): LabelGridCodeResponse {
    const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
    const code = randomNum.toString();

    return {
      code,
      type: 'upc',
      assignedTo: releaseTitle,
      createdAt: new Date().toISOString(),
    };
  }

  private simulateGetReleaseAnalytics(releaseId: string): LabelGridAnalytics {
    return {
      releaseId,
      totalStreams: 0,
      totalRevenue: 0,
      platforms: {},
      timeline: [],
    };
  }

  private simulateGetArtistAnalytics(artistId: string): LabelGridAnalytics {
    return {
      releaseId: artistId,
      totalStreams: 0,
      totalRevenue: 0,
      platforms: {},
      timeline: [],
    };
  }

  private simulateUpdateRelease(
    releaseId: string,
    updates: Partial<LabelGridRelease>
  ): LabelGridReleaseResponse {
    return {
      releaseId,
      status: 'processing',
      submittedAt: new Date().toISOString(),
      platforms: [],
    };
  }
}

export const labelGridService = new LabelGridService();
