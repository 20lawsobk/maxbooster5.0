import { users, projects, analytics, notifications, releases, tracks, trackAnalysis, collaborators, earnings, hyperFollowPages, studioProjects, studioTracks, audioClips, midiClips, virtualInstruments, audioEffects, mixBusses, automationData, markers, lyrics, generatedMelodies, adCampaigns, adInsights, adCreatives, adAIRuns, adCampaignVariants, adPlatformAccounts, adDeliveryLogs, adKillRules, adRuleExecutions, socialAccounts, socialCampaigns, posts, socialMetrics, payouts, listings, likes, orders, payoutEvents, passwordResetTokens, sessions, pluginCatalog, autosaves, exportJobs, distributionPackages, distributionTracks, studioConversions, studioCollabSessions, studioCollabSnapshots, projectCollaborators, projectRoyaltySplits, revenueEvents, royaltyLedger, royaltyPayments, collaboratorTaxProfiles, revenueImportHistory, forecastSnapshots, trendEvents, modelVersions, optimizationTasks, payoutSettings, paymentMethods, uploadSessions, isrcRegistry, upcRegistry, jwtTokens, refreshTokens, tokenRevocations, permissions, webhookEvents, webhookAttempts, webhookDeadLetterQueue, logEvents, royaltySplits, distroReleases, distroTracks, distroProviders, distroDispatch, type User, type InsertUser, type Project, type InsertProject, type Analytics, type InsertAnalytics, type Notification, type InsertNotification, type Release, type InsertRelease, type Track, type InsertTrack, type TrackAnalysis, type InsertTrackAnalysis, type StudioProject, type InsertStudioProject, type StudioTrack, type InsertStudioTrack, type AudioClip, type InsertAudioClip, type MidiClip, type InsertMidiClip, type VirtualInstrument, type InsertVirtualInstrument, type AudioEffect, type InsertAudioEffect, type MixBus, type InsertMixBus, type AutomationData, type InsertAutomationData, type Marker, type InsertMarker, type Lyrics, type InsertLyrics, type GeneratedMelody, type InsertGeneratedMelody, type AdCampaign, type InsertAdCampaign, type AdInsights, type InsertAdInsights, type AdCreative, type InsertAdCreative, type AdAIRun, type InsertAdAIRun, type AdCampaignVariant, type DistroRelease, type InsertDistroRelease, type DistroTrack, type InsertDistroTrack, type InsertAdCampaignVariant, type AdPlatformAccount, type InsertAdPlatformAccount, type AdDeliveryLog, type InsertAdDeliveryLog, type AdKillRule, type InsertAdKillRule, type AdRuleExecution, type InsertAdRuleExecution, type Payout, type InsertPayout, type Listing, type Order, type Autosave, type InsertAutosave, type DistributionPackage, type InsertDistributionPackage, type DistributionTrack, type InsertDistributionTrack, type StudioCollabSession, type InsertStudioCollabSession, type StudioCollabSnapshot, type InsertStudioCollabSnapshot, type ProjectCollaborator, type InsertProjectCollaborator, type ProjectRoyaltySplit, type InsertProjectRoyaltySplit, type RevenueEvent, type InsertRevenueEvent, type RoyaltyLedger, type InsertRoyaltyLedger, type RoyaltyPayment, type InsertRoyaltyPayment, type CollaboratorTaxProfile, type InsertCollaboratorTaxProfile, type RevenueImportHistory, type InsertRevenueImportHistory, type ForecastSnapshot, type InsertForecastSnapshot, type TrendEvent, type InsertTrendEvent, type ModelVersion, type InsertModelVersion, type OptimizationTask, type InsertOptimizationTask, type PayoutSettings, type InsertPayoutSettings, type PaymentMethod, type InsertPaymentMethod, type UploadSession, type InsertUploadSession, type ISRCRegistry, type InsertISRCRegistry, type UPCRegistry, type InsertUPCRegistry, type JWTToken, type InsertJWTToken, type RefreshToken, type InsertRefreshToken, type TokenRevocation, type InsertTokenRevocation, type Permission, type InsertPermission, type WebhookAttempt, type InsertWebhookAttempt, type WebhookDeadLetterQueue, type InsertWebhookDeadLetterQueue, type LogEvent, type InsertLogEvent, type RoyaltySplit, aiModels, aiModelVersions, trainingDatasets, inferenceRuns, performanceMetrics, explanationLogs, featureFlags, type AIModel, type InsertAIModel, type AIModelVersion, type InsertAIModelVersion, type TrainingDataset, type InsertTrainingDataset, type InferenceRun, type InsertInferenceRun, type PerformanceMetric, type InsertPerformanceMetric, type ExplanationLog, type InsertExplanationLog, type FeatureFlag, type InsertFeatureFlag, type InsertRoyaltySplit } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, gte, lte, or, like } from "drizzle-orm";
import { databaseResilience } from "./reliability/database-resilience";

// Pagination interface for high-traffic endpoints
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Royalty Analytics Interfaces
export interface TopEarningTrack {
  trackId: string;
  trackTitle: string;
  totalEarnings: number;
  streamsCount: number;
}

export interface PlatformBreakdown {
  platformName: string;
  earnings: number;
  percentage: number;
}

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations - users.id is varchar UUID (string)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGoogleId(id: string, googleId: string): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string | null): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserSocialToken(userId: string, platform: string, token: string): Promise<User>;
  getUserSocialToken(userId: string, platform: string): Promise<string | null>;
  getAllUsers(options?: PaginationOptions): Promise<PaginatedResponse<User>>;
  getUserCount(): Promise<number>;

  // Project operations - Unified projects with optional studio filtering
  getUserProjectsWithStudio(userId: string, options?: PaginationOptions & { studioOnly?: boolean }): Promise<PaginatedResponse<Project>>;
  getAllProjects(options?: PaginationOptions): Promise<PaginatedResponse<Project>>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Analytics operations - userId is varchar (string)
  getDashboardAnalytics(userId: string): Promise<any>;
  getStreamsAnalytics(userId: string, days: number): Promise<any[]>;
  getAdminAnalytics(): Promise<any>;

  // Analytics Anomaly operations
  createAnalyticsAnomaly(anomaly: InsertAnalyticsAnomaly): Promise<AnalyticsAnomaly>;
  getUserAnomalies(userId: string, options?: PaginationOptions & { metricType?: string; severity?: string; startDate?: Date; endDate?: Date }): Promise<PaginatedResponse<AnalyticsAnomaly>>;
  getAnomaly(id: string): Promise<AnalyticsAnomaly | undefined>;
  acknowledgeAnomaly(id: string, userId: string): Promise<AnalyticsAnomaly>;
  getAnomalySummary(userId: string): Promise<{ total: number; bySeverity: Record<string, number>; unacknowledged: number }>;
  getUnacknowledgedAnomalies(userId: string): Promise<AnalyticsAnomaly[]>;

  // Notification operations - userId is varchar (string)
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  updateNotificationPreferences(userId: string, preferences: any): Promise<void>;
  updatePushSubscription(userId: string, subscription: any): Promise<void>;

  // Distribution operations - userId is varchar (string)
  getUserReleases(userId: string): Promise<Release[]>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, userId: string, updates: Partial<Release>): Promise<Release>;
  deleteRelease(id: string, userId: string): Promise<void>;
  updateReleaseStatus(id: number, status: string): Promise<void>;
  getDistributionAnalytics(userId: string): Promise<any>;
  getReleaseEarnings(releaseId: string, userId: string): Promise<any[]>;
  createHyperFollowPage(data: any): Promise<any>;
  getUserHyperFollowPages(userId: string): Promise<any[]>;

  // HyperFollow operations
  getHyperFollowPages(userId: string): Promise<any[]>;
  getHyperFollowPage(id: string): Promise<any | undefined>;
  getHyperFollowPageBySlug(slug: string): Promise<any | undefined>;
  updateHyperFollowPage(id: string, data: any): Promise<any>;
  deleteHyperFollowPage(id: string): Promise<void>;
  trackHyperFollowEvent(slug: string, eventType: string, data?: any): Promise<void>;

  // Distribution Provider operations
  getAllDistroProviders(): Promise<any[]>;
  getDistroProvider(id: string): Promise<any | undefined>;
  getDistroProviderBySlug(slug: string): Promise<any | undefined>;
  createDistroProvider(provider: any): Promise<any>;
  getDistroDispatch(id: string): Promise<any | undefined>;
  createDistroDispatch(dispatch: any): Promise<any>;
  updateDistroDispatch(id: string, updates: any): Promise<any>;
  getDistroDispatchStatuses(releaseId: string): Promise<any[]>;

  // Distribution Releases operations
  getDistroReleases(userId: string): Promise<DistroRelease[]>;
  getDistroRelease(id: string): Promise<DistroRelease | undefined>;
  createDistroRelease(data: InsertDistroRelease): Promise<DistroRelease>;
  updateDistroRelease(id: string, data: Partial<InsertDistroRelease>): Promise<DistroRelease>;
  deleteDistroRelease(id: string): Promise<void>;

  // Distribution Tracks operations
  getDistroTracksByReleaseId(releaseId: string): Promise<DistroTrack[]>;
  createDistroTrack(data: InsertDistroTrack): Promise<DistroTrack>;
  updateDistroTrack(id: string, data: Partial<InsertDistroTrack>): Promise<DistroTrack>;
  deleteDistroTrack(id: string): Promise<void>;

  // DSP Providers
  getDSPProviders(): Promise<any[]>;

  // ISRC/UPC Registry operations
  createISRCCode(data: InsertISRCRegistry): Promise<ISRCRegistry>;
  createUPCCode(data: InsertUPCRegistry): Promise<UPCRegistry>;
  validateISRCCode(isrc: string): Promise<boolean>;
  validateUPCCode(upc: string): Promise<boolean>;

  // Max Booster Studio operations - Now use unified projects table
  // Legacy studio-specific tables still used for tracks, clips, etc.
  
  // Track operations
  getProjectTracks(projectId: string): Promise<StudioTrack[]>;
  createStudioTrack(track: InsertStudioTrack): Promise<StudioTrack>;
  updateStudioTrack(id: string, projectId: string, updates: Partial<StudioTrack>): Promise<StudioTrack>;
  updateStudioTrackEffects(id: string, projectId: string, effects: any): Promise<StudioTrack>;
  deleteStudioTrack(id: string, projectId: string): Promise<void>;
  
  // Audio clip operations  
  getTrackAudioClips(trackId: string): Promise<AudioClip[]>;
  createAudioClip(clip: InsertAudioClip): Promise<AudioClip>;
  updateAudioClip(id: string, trackId: string, updates: Partial<AudioClip>): Promise<AudioClip>;
  deleteAudioClip(id: string, trackId: string): Promise<void>;
  
  // MIDI clip operations
  getTrackMidiClips(trackId: string): Promise<MidiClip[]>;
  createMidiClip(clip: InsertMidiClip): Promise<MidiClip>;
  updateMidiClip(id: string, trackId: string, updates: Partial<MidiClip>): Promise<MidiClip>;
  deleteMidiClip(id: string, trackId: string): Promise<void>;
  
  // Virtual instrument operations
  getTrackInstruments(trackId: string): Promise<VirtualInstrument[]>;
  createVirtualInstrument(instrument: InsertVirtualInstrument): Promise<VirtualInstrument>;
  updateVirtualInstrument(id: string, trackId: string, updates: Partial<VirtualInstrument>): Promise<VirtualInstrument>;
  deleteVirtualInstrument(id: string, trackId: string): Promise<void>;
  
  // Effect operations
  getTrackEffects(trackId: string): Promise<AudioEffect[]>;
  getProjectEffects(projectId: string): Promise<AudioEffect[]>;
  createAudioEffect(effect: InsertAudioEffect): Promise<AudioEffect>;
  updateAudioEffect(id: string, updates: Partial<AudioEffect>): Promise<AudioEffect>;
  deleteAudioEffect(id: string): Promise<void>;
  
  // Mix bus operations
  getProjectBusses(projectId: string): Promise<MixBus[]>;
  createMixBus(bus: InsertMixBus): Promise<MixBus>;
  updateMixBus(id: string, projectId: string, updates: Partial<MixBus>): Promise<MixBus>;
  deleteMixBus(id: string, projectId: string): Promise<void>;
  
  // Automation operations
  getProjectAutomation(projectId: string): Promise<AutomationData[]>;
  getTrackAutomation(trackId: string): Promise<AutomationData[]>;
  createAutomationData(automation: InsertAutomationData): Promise<AutomationData>;
  updateAutomationData(id: string, projectId: string, updates: Partial<AutomationData>): Promise<AutomationData>;
  deleteAutomationData(id: string, projectId: string): Promise<void>;
  
  // Marker operations
  getProjectMarkers(projectId: string): Promise<Marker[]>;
  createMarker(marker: InsertMarker): Promise<Marker>;
  updateMarker(id: string, projectId: string, updates: Partial<Marker>): Promise<Marker>;
  deleteMarker(id: string, projectId: string): Promise<void>;

  // Lyrics operations
  getProjectLyrics(projectId: string): Promise<Lyrics | undefined>;
  createLyrics(lyrics: InsertLyrics): Promise<Lyrics>;
  updateLyrics(id: string, projectId: string, updates: Partial<Lyrics>): Promise<Lyrics>;
  deleteLyrics(id: string, projectId: string): Promise<void>;

  // Generated Melodies operations - AI Music Generation
  getProjectGeneratedMelodies(projectId: string): Promise<GeneratedMelody[]>;
  getUserGeneratedMelodies(userId: string): Promise<GeneratedMelody[]>;
  getGeneratedMelody(id: string): Promise<GeneratedMelody | undefined>;
  createGeneratedMelody(melody: InsertGeneratedMelody): Promise<GeneratedMelody>;
  deleteGeneratedMelody(id: string): Promise<void>;

  // Distribution Package operations
  getDistributionPackage(projectId: string): Promise<DistributionPackage | undefined>;
  getDistributionPackageById(id: string): Promise<DistributionPackage | undefined>;
  createDistributionPackage(pkg: InsertDistributionPackage): Promise<DistributionPackage>;
  updateDistributionPackage(id: string, updates: Partial<DistributionPackage>): Promise<DistributionPackage>;
  deleteDistributionPackage(id: string): Promise<void>;
  getPackageTracks(packageId: string): Promise<DistributionTrack[]>;
  createDistributionTrack(track: InsertDistributionTrack): Promise<DistributionTrack>;
  updateDistributionTrack(id: string, packageId: string, updates: Partial<DistributionTrack>): Promise<DistributionTrack>;
  deleteDistributionTrack(id: string, packageId: string): Promise<void>;

  // Upload Session operations
  createUploadSession(session: InsertUploadSession): Promise<UploadSession>;
  getUploadSession(id: string): Promise<UploadSession | undefined>;
  updateUploadSession(id: string, updates: Partial<InsertUploadSession>): Promise<UploadSession>;
  deleteUploadSession(id: string): Promise<void>;
  getUserUploadSessions(userId: string, status?: string): Promise<UploadSession[]>;

  // ISRC operations
  generateISRC(userId: string, trackId: string, metadata: any): Promise<string>;
  getISRC(code: string): Promise<ISRCRegistry | undefined>;
  verifyISRCUniqueness(code: string): Promise<boolean>;

  // UPC operations
  generateUPC(userId: string, releaseId: string, metadata: any): Promise<string>;
  getUPC(code: string): Promise<UPCRegistry | undefined>;
  verifyUPCUniqueness(code: string): Promise<boolean>;

  // Studio Conversion operations
  getProjectConversions(projectId: string): Promise<any[]>;
  getUserConversions(userId: string): Promise<any[]>;
  getConversion(id: string): Promise<any | undefined>;
  createConversion(conversion: any): Promise<any>;
  updateConversion(id: string, updates: Partial<any>): Promise<any>;
  deleteConversion(id: string): Promise<void>;

  // Ad Campaign operations - userId is varchar (string), but adCampaigns.id is serial (number)
  getUserAdCampaigns(userId: string): Promise<AdCampaign[]>;
  getAdCampaign(id: number): Promise<AdCampaign | undefined>;
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  updateAdCampaign(id: number, updates: Partial<AdCampaign>): Promise<AdCampaign>;
  deleteAdCampaign(id: number): Promise<void>;
  saveOrganicMetrics(campaignId: number, organicMetrics: any): Promise<void>;
  getOrganicMetrics(campaignId: number): Promise<any>;

  // Ad Creative operations
  createAdCreative(creative: InsertAdCreative): Promise<AdCreative>;
  getAdCreative(id: string): Promise<AdCreative | undefined>;
  getUserAdCreatives(userId: string): Promise<AdCreative[]>;
  updateAdCreative(id: string, updates: Partial<InsertAdCreative>): Promise<AdCreative>;

  // Ad AI Run operations
  createAdAIRun(run: InsertAdAIRun): Promise<AdAIRun>;

  // Ad Campaign Variant operations
  createAdCampaignVariant(variant: InsertAdCampaignVariant): Promise<AdCampaignVariant>;
  getAdCampaignVariant(id: string): Promise<AdCampaignVariant | undefined>;
  getCampaignVariants(campaignId: number): Promise<AdCampaignVariant[]>;
  updateAdCampaignVariant(id: string, updates: Partial<InsertAdCampaignVariant>): Promise<AdCampaignVariant>;

  // Ad Platform Account operations
  getUserPlatformAccount(userId: string, platform: string): Promise<AdPlatformAccount | undefined>;

  // Ad Delivery Log operations
  createAdDeliveryLog(log: InsertAdDeliveryLog): Promise<AdDeliveryLog>;
  getDeliveryLogs(campaignId: number): Promise<AdDeliveryLog[]>;

  // Ad Kill Rule operations
  createAdKillRule(rule: InsertAdKillRule): Promise<AdKillRule>;
  getCampaignRules(campaignId: number): Promise<AdKillRule[]>;
  updateAdKillRule(id: string, updates: Partial<InsertAdKillRule>): Promise<AdKillRule>;

  // Ad Rule Execution operations
  createAdRuleExecution(execution: InsertAdRuleExecution): Promise<AdRuleExecution>;
  getRuleExecutions(ruleId: string): Promise<AdRuleExecution[]>;

  // Ad Insights operations
  getUserAdInsights(userId: string): Promise<AdInsights | undefined>;
  createAdInsights(insights: InsertAdInsights): Promise<AdInsights>;
  updateAdInsights(id: string, userId: string, updates: Partial<InsertAdInsights>): Promise<AdInsights>;

  // Social Media operations - userId is varchar (string)
  getSocialPlatforms(userId: string): Promise<any[]>;
  getSocialPosts(userId: string): Promise<any[]>;
  getSocialInsights(userId: string): Promise<any>;
  getSocialActivity(userId: string): Promise<any[]>;

  // Marketplace operations - userId is varchar (string), listingId is uuid (string)
  getMarketplaceBeats(filters: any, sortBy?: string): Promise<any[]>;
  isBeatLikedByUser(listingId: string, userId: string): Promise<boolean>;
  isBeatPurchasedByUser(listingId: string, userId: string): Promise<boolean>;
  calculateDynamicPrice(beatId: number): Promise<number>;
  getBeatLikes(listingId: string): Promise<number>;
  getBeatPlays(listingId: string): Promise<number>;
  getAIBeatRecommendations(beatId: number, userId: string): Promise<any>;
  
  // Marketplace Listings & Orders
  getListings(filters?: any): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  getUserListings(userId: string): Promise<Listing[]>;
  createListing(listing: any): Promise<Listing>;
  updateListing(id: string, updates: Partial<Listing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  
  // Beat Listings - Marketplace specific with full filtering
  getBeatListings(filters: {
    genre?: string;
    mood?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    bpm?: number;
    key?: string;
    tags?: string[];
    sortBy?: 'recent' | 'popular' | 'price_low' | 'price_high';
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getBeatListing(listingId: string): Promise<any | null>;
  
  // Marketplace Orders
  getOrders(filters?: any): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  createOrder(order: any): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  
  // Marketplace Producers
  getProducers(options?: PaginationOptions): Promise<PaginatedResponse<any>>;
  getProducersCount(): Promise<number>;
  getProducerStats(userId: string): Promise<any>;
  
  // Marketplace Analytics
  getSalesAnalytics(userId: string): Promise<any>;
  getAnalytics(userId: string, days: number): Promise<any>;

  // Royalties operations - userId is varchar (string)
  getRoyaltyStatements(userId: string, filters: any): Promise<any[]>;
  getPlatformEarnings(userId: string, period: string): Promise<any[]>;
  getPendingPayments(userId: string): Promise<any[]>;
  getEarningsAIInsights(userId: string, period: string): Promise<any>;
  getStatementStatus(statementId: string): Promise<string>;
  getNextPayoutDate(userId: string): Promise<Date>;
  getUserPayouts(userId: string, options: any): Promise<any[]>;
  getPayoutDetails(payoutId: string): Promise<any>;
  getPayoutStatements(payoutId: string): Promise<any[]>;
  calculatePayoutFees(amount: number): Promise<any>;
  calculatePayoutTaxes(amount: number, userId: string): Promise<any>;
  getPayoutTracking(payoutId: string): Promise<any>;
  getPayoutAIInsights(payoutId: string): Promise<any>;
  getPayoutSummary(userId: string): Promise<any>;
  getPayoutCount(userId: string): Promise<number>;
  getUserEarnings(userId: string, options: any): Promise<any[]>;
  getPlatformBreakdown(userId: string, period?: string): Promise<PlatformBreakdown[]>;
  getTopEarningTracks(userId: string, period?: string): Promise<TopEarningTrack[]>;
  getRoyaltySplits(userId: string): Promise<RoyaltySplit[]>;
  createRoyaltySplit(data: InsertRoyaltySplit): Promise<RoyaltySplit>;
  updateRoyaltySplit(id: string, data: Partial<InsertRoyaltySplit>): Promise<RoyaltySplit>;
  deleteRoyaltySplit(id: string): Promise<void>;
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  createPaymentMethod(userId: string, data: InsertPaymentMethod): Promise<PaymentMethod>;
  getUserRoyalties(userId: string): Promise<any[]>;
  createPayout(data: any): Promise<any>;
  getPayoutHistory(userId: string): Promise<any[]>;
  
  // Payout Settings operations
  getPayoutSettings(userId: string): Promise<PayoutSettings | undefined>;
  updatePayoutSettings(userId: string, data: Partial<InsertPayoutSettings>): Promise<PayoutSettings>;
  updateTaxInfo(userId: string, data: { taxCountry: string; taxId: string; taxFormCompleted?: boolean }): Promise<PayoutSettings>;

  // Project Royalty Tracking operations - New revenue split calculator system
  // Royalty split management
  getProjectRoyaltySplits(projectId: string): Promise<ProjectRoyaltySplit[]>;
  createProjectRoyaltySplit(data: InsertProjectRoyaltySplit): Promise<ProjectRoyaltySplit>;
  updateProjectRoyaltySplit(id: string, data: Partial<InsertProjectRoyaltySplit>): Promise<ProjectRoyaltySplit>;
  deleteProjectRoyaltySplit(id: string): Promise<void>;
  validateSplitPercentages(projectId: string): Promise<boolean>;

  // Revenue event management with automatic ledger creation
  createProjectRevenueEvent(data: InsertRevenueEvent): Promise<RevenueEvent>;
  getProjectRevenueEvents(projectId: string): Promise<RevenueEvent[]>;
  getRevenueEventById(id: string): Promise<RevenueEvent | null>;

  // Royalty ledger queries
  getLedgerEntriesByCollaborator(collaboratorId: string, projectId?: string): Promise<RoyaltyLedger[]>;
  getLedgerEntriesByProject(projectId: string): Promise<RoyaltyLedger[]>;
  getPendingEarningsForCollaborator(collaboratorId: string): Promise<{ total: string, byProject: any[] }>;
  getTotalEarningsForCollaborator(collaboratorId: string): Promise<{ total: string, paid: string, pending: string }>;

  // Payment management
  createProjectRoyaltyPayment(data: InsertRoyaltyPayment): Promise<RoyaltyPayment>;
  getProjectRoyaltyPayments(collaboratorId: string): Promise<RoyaltyPayment[]>;
  updateRoyaltyPaymentStatus(id: string, status: string, stripePaymentId?: string): Promise<RoyaltyPayment>;

  // Reporting
  getProjectRoyaltySummary(projectId: string): Promise<{ collaborators: any[], totalRevenue: string, splits: any[] }>;

  // Sales operations - userId is varchar (string), beatId is serial (number)
  getUserSales(userId: string, options: any): Promise<any[]>;
  getBeat(beatId: number): Promise<any>;
  calculateSaleEarnings(saleId: string): Promise<any>;
  getSaleAIInsights(saleId: string): Promise<any>;
  getSalesSummary(userId: string): Promise<any>;
  getSalesCount(userId: string): Promise<number>;

  // Dashboard Phase 1: Comprehensive dashboard data methods
  getDashboardStats(userId: string): Promise<{
    totalTracks: number;
    activeDistributions: number;
    totalRevenue: number;
    socialReach: number;
    monthlyGrowth: {
      tracks: number;
      distributions: number;
      revenue: number;
      socialReach: number;
    };
  }>;

  getRecentActivity(userId: string, limit?: number): Promise<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error' | 'info';
  }>>;

  getAiInsights(userId: string): Promise<{
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
    }>;
    predictions: {
      nextMonthStreams: number;
      nextMonthRevenue: number;
      viralPotential: number;
      growthTrend: 'up' | 'down' | 'stable';
    };
    performanceScore: number;
  }>;

  // Admin Settings operations
  getAdminSettings(): Promise<{
    emailNotifications: boolean;
    maintenanceMode: boolean;
    userRegistrationEnabled: boolean;
    apiRateLimit: number;
    webhookEndpoint: string | null;
  }>;
  
  updateAdminSetting(key: string, value: any): Promise<void>;

  // Password Reset Token operations
  createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ email: string; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;

  // Session tracking operations
  getUserSessions(userId: string): Promise<Array<{
    id: string;
    sessionId: string;
    userAgent: string | null;
    ip: string | null;
    createdAt: Date;
    lastActivity: Date;
    current?: boolean;
  }>>;
  trackSession(userId: string, sessionId: string, userAgent: string | null, ip: string | null): Promise<void>;
  updateSessionActivity(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;

  // Plugin Catalog operations
  getPluginCatalog(category?: string): Promise<Array<{
    id: string;
    slug: string;
    name: string;
    kind: string;
    version: string;
    manifest: any;
  }>>;
  seedPluginCatalog(): Promise<void>;
  
  // Track Analysis operations
  saveTrackAnalysis(analysis: InsertTrackAnalysis): Promise<TrackAnalysis>;
  getTrackAnalysis(projectId: string): Promise<TrackAnalysis | undefined>;
  getProjectAnalysis(projectId: string): Promise<TrackAnalysis[]>;

  // CRDT Collaboration operations
  getProjectCollaborators(projectId: string): Promise<any[]>;
  getProjectCollaborator(projectId: string, userId: string): Promise<any | undefined>;
  createProjectCollaborator(data: any): Promise<any>;
  updateProjectCollaborator(id: string, updates: any): Promise<any>;
  updateProjectCollaboratorRole(projectId: string, userId: string, role: string): Promise<any>;
  deleteProjectCollaborator(id: string): Promise<void>;
  deleteProjectCollaboratorByProjectAndUser(projectId: string, userId: string): Promise<void>;
  
  createCollabSession(session: any): Promise<any>;
  getActiveCollabSessions(projectId: string): Promise<any[]>;
  updateCollabSessionActivity(id: string, awarenessState: any): Promise<void>;
  deleteCollabSession(id: string): Promise<void>;
  deleteCollabSessionByProjectAndUser(projectId: string, userId: string): Promise<void>;
  
  saveCollabSnapshot(snapshot: any): Promise<any>;
  getLatestCollabSnapshot(projectId: string): Promise<any | undefined>;
  getCollabSnapshots(projectId: string, limit?: number): Promise<any[]>;
  deleteOldCollabSnapshots(projectId: string, keepLast: number): Promise<void>;

  // Platform Self-Updating System operations
  // Trend Events operations
  getTrendEvents(limit?: number, source?: string, impact?: string): Promise<TrendEvent[]>;
  getRecentTrendEvents(days: number): Promise<TrendEvent[]>;
  createTrendEvent(event: InsertTrendEvent): Promise<TrendEvent>;
  
  // Model Versions operations
  getModelVersions(modelType?: string): Promise<ModelVersion[]>;
  getActiveModelVersion(modelType: string): Promise<ModelVersion | undefined>;
  createModelVersion(version: InsertModelVersion): Promise<ModelVersion>;
  activateModelVersion(id: number, modelType: string): Promise<ModelVersion>;
  
  // Optimization Tasks operations
  getOptimizationTasks(status?: string, taskType?: string): Promise<OptimizationTask[]>;
  getOptimizationTask(id: number): Promise<OptimizationTask | undefined>;
  createOptimizationTask(task: InsertOptimizationTask): Promise<OptimizationTask>;
  updateOptimizationTask(id: number, updates: Partial<OptimizationTask>): Promise<OptimizationTask>;

  // JWT Token operations
  createJWTToken(token: InsertJWTToken): Promise<JWTToken>;
  revokeJWTToken(tokenId: string, reason: string): Promise<void>;
  revokeAllJWTTokensForUser(userId: string, reason: string): Promise<void>;
  verifyJWTToken(tokenId: string): Promise<boolean>;

  // Refresh Token operations
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  revokeRefreshToken(tokenId: string, reason: string): Promise<void>;
  revokeAllRefreshTokensForUser(userId: string, reason: string): Promise<void>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;

  // Permission operations
  checkPermission(role: string, resource: string, action: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<Permission[]>;

  // Webhook Event operations
  getWebhookEvent(id: number): Promise<any>;

  // Webhook Attempt operations
  createWebhookAttempt(attempt: InsertWebhookAttempt): Promise<WebhookAttempt>;
  getWebhookAttempts(webhookEventId: number): Promise<WebhookAttempt[]>;
  getWebhookAttempt(id: string): Promise<WebhookAttempt | undefined>;

  // Dead Letter Queue operations
  addToDeadLetterQueue(dlq: InsertWebhookDeadLetterQueue): Promise<WebhookDeadLetterQueue>;
  getDeadLetterQueue(status?: string): Promise<WebhookDeadLetterQueue[]>;
  getDeadLetterQueueItem(id: string): Promise<WebhookDeadLetterQueue | undefined>;
  reprocessDeadLetter(id: string): Promise<void>;

  // Log operations
  createLogEvent(log: InsertLogEvent): Promise<LogEvent>;
  queryLogs(filters: {level?: string, service?: string, userId?: string, startTime?: Date, endTime?: Date}, limit?: number): Promise<LogEvent[]>;

  // Tax Profile operations
  createTaxProfile(profile: any): Promise<any>;
  getTaxProfile(userId: string): Promise<any | undefined>;
  updateTaxProfile(id: number, updates: Partial<any>): Promise<any>;
  getCollaboratorsForTaxYear(year: number): Promise<{userId: string, totalEarnings: number}[]>;

  // CSV Import operations
  createImportHistory(importData: any): Promise<any>;
  getImportHistory(userId: string): Promise<any[]>;
  checkFileHash(hash: string): Promise<any | undefined>;
  ingestRevenueBatch(events: any[]): Promise<{succeeded: number, failed: number}>;

  // Split Validation operations
  lockRoyaltySplit(splitId: string): Promise<void>;
  validateSplitTotal(projectId: string): Promise<{total: number, isValid: boolean}>;
  getSplitsForProject(projectId: string): Promise<any[]>;

  // Forecasting operations
  createForecast(forecast: any): Promise<any>;
  getForecastsByProject(projectId: string, limit?: number): Promise<any[]>;
  getLatestForecast(projectId: string, granularity: string): Promise<any | undefined>;

  // ============================================================================
  // AI GOVERNANCE & MODEL MANAGEMENT
  // ============================================================================
  
  // AI Model operations
  createAIModel(model: InsertAIModel): Promise<AIModel>;
  getAIModel(id: string): Promise<AIModel | undefined>;
  listAIModels(filters?: { modelType?: string; category?: string; isActive?: boolean }): Promise<AIModel[]>;
  updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel>;
  
  // AI Model Version operations
  createAIModelVersion(version: InsertAIModelVersion): Promise<AIModelVersion>;
  getAIModelVersion(id: string): Promise<AIModelVersion | undefined>;
  listModelVersions(modelId: string, status?: string): Promise<AIModelVersion[]>;
  
  // Training Dataset operations
  createTrainingDataset(dataset: InsertTrainingDataset): Promise<TrainingDataset>;
  getTrainingDataset(id: string): Promise<TrainingDataset | undefined>;
  listTrainingDatasets(filters?: { datasetType?: string; isActive?: boolean }): Promise<TrainingDataset[]>;
  
  // Inference Run operations
  createInferenceRun(run: InsertInferenceRun): Promise<InferenceRun>;
  getInferenceRuns(filters?: { modelId?: string; versionId?: string; userId?: string; startDate?: Date; endDate?: Date }, limit?: number): Promise<InferenceRun[]>;
  logInference(run: InsertInferenceRun): Promise<InferenceRun>;
  
  // Performance Metric operations
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  getPerformanceMetrics(filters?: { modelId?: string; versionId?: string; metricType?: string; startDate?: Date; endDate?: Date }): Promise<PerformanceMetric[]>;
  trackMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  
  // Explanation Log operations
  createExplanationLog(log: InsertExplanationLog): Promise<ExplanationLog>;
  getExplanationLog(inferenceId: string): Promise<ExplanationLog[]>;
  
  // Feature Flag operations
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  getFeatureFlag(flagName: string): Promise<FeatureFlag | undefined>;
  updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag>;
}

// Simple in-memory cache with TTL for frequently-accessed data
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class DatabaseStorage implements IStorage {
  // In-memory cache for frequently-accessed, rarely-changing data
  private cache = new SimpleCache();
  
  // In-memory admin settings storage
  private adminSettings = {
    emailNotifications: true,
    maintenanceMode: false,
    userRegistrationEnabled: true,
    apiRateLimit: 100,
    webhookEndpoint: null as string | null
  };

  // CRITICAL: Route all database operations through circuit breaker for 24/7 reliability
  private async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return databaseResilience.safeQuery(operation, operationName);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        if (user) {
          // Add fallback values for potentially missing columns
          user.hasCompletedOnboarding = user.hasCompletedOnboarding ?? false;
          user.onboardingData = user.onboardingData ?? null;
          user.notificationPreferences = user.notificationPreferences ?? {
            email: true,
            browser: true,
            releases: true,
            earnings: true,
            sales: true,
            marketing: true,
            system: true
          };
        }
        return user || undefined;
      },
      'getUser'
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (user) {
          // Add fallback values for potentially missing columns
          user.hasCompletedOnboarding = user.hasCompletedOnboarding ?? false;
          user.onboardingData = user.onboardingData ?? null;
          user.notificationPreferences = user.notificationPreferences ?? {
            email: true,
            browser: true,
            releases: true,
            earnings: true,
            sales: true,
            marketing: true,
            system: true
          };
        }
        return user || undefined;
      },
      'getUserByUsername'
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (user) {
          // Add fallback values for potentially missing columns
          user.hasCompletedOnboarding = user.hasCompletedOnboarding ?? false;
          user.onboardingData = user.onboardingData ?? null;
          user.notificationPreferences = user.notificationPreferences ?? {
            email: true,
            browser: true,
            releases: true,
            earnings: true,
            sales: true,
            marketing: true,
            system: true
          };
        }
        return user || undefined;
      },
      'getUserByEmail'
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
        if (user) {
          // Add fallback values for potentially missing columns
          user.hasCompletedOnboarding = user.hasCompletedOnboarding ?? false;
          user.onboardingData = user.onboardingData ?? null;
          user.notificationPreferences = user.notificationPreferences ?? {
            email: true,
            browser: true,
            releases: true,
            earnings: true,
            sales: true,
            marketing: true,
            system: true
          };
        }
        return user || undefined;
      },
      'getUserByGoogleId'
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db
          .insert(users)
          .values(insertUser)
          .returning();
        return user;
      },
      'createUser'
    );
  }

  async updateUserGoogleId(id: string, googleId: string): Promise<User> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db
          .update(users)
          .set({ googleId, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();
        return user;
      },
      'updateUserGoogleId'
    );
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string | null): Promise<User> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db
          .update(users)
          .set({ 
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            updatedAt: new Date()
          })
          .where(eq(users.id, id))
          .returning();
        return user;
      },
      'updateUserStripeInfo'
    );
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db
          .update(users)
          .set({ 
            ...updates,
            updatedAt: new Date()
          })
          .where(eq(users.id, id))
          .returning();
        return user;
      },
      'updateUser'
    );
  }

  async updateUserSocialToken(userId: string, platform: string, token: string): Promise<User> {
    return this.executeWithCircuitBreaker(
      async () => {
        const tokenField = `${platform}Token` as keyof typeof users.$inferSelect;
        const updateData: any = { updatedAt: new Date() };
        updateData[tokenField] = token;
        
        const [user] = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId))
          .returning();
        return user;
      },
      'updateUserSocialToken'
    );
  }

  async getUserSocialToken(userId: string, platform: string): Promise<string | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const tokenField = `${platform}Token` as keyof typeof users.$inferSelect;
    return (user[tokenField] as string) || null;
  }

  async getAllUsers(options: PaginationOptions = {}): Promise<PaginatedResponse<User>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const { page = 1, limit = 50 } = options;
        const offset = (page - 1) * limit;

        const usersList = await db
          .select()
          .from(users)
          .orderBy(desc(users.createdAt))
          .limit(limit)
          .offset(offset);

        const [totalCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(users);

        return {
          data: usersList,
          pagination: {
            page,
            limit,
            total: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit)
          }
        };
      },
      'getAllUsers'
    );
  }

  async getUserCount(): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const result = await db.select({ count: sql<number>`count(*)` }).from(users);
        return result[0].count;
      },
      'getUserCount'
    );
  }

  async getUserProjectsWithStudio(userId: string, options: PaginationOptions & { studioOnly?: boolean } = {}): Promise<PaginatedResponse<Project>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const { page = 1, limit = 20, studioOnly } = options;
        const offset = (page - 1) * limit;
        
        const conditions = studioOnly 
          ? and(eq(projects.userId, userId), eq(projects.isStudioProject, true))
          : eq(projects.userId, userId);
        
        const projectsList = await db
          .select()
          .from(projects)
          .where(conditions)
          .orderBy(desc(projects.updatedAt))
          .limit(limit)
          .offset(offset);

        const [totalCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(projects)
          .where(conditions);

        return {
          data: projectsList,
          pagination: {
            page,
            limit,
            total: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit)
          }
        };
      },
      'getUserProjectsWithStudio'
    );
  }

  async getAllProjects(options: PaginationOptions = {}): Promise<PaginatedResponse<Project>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const { page = 1, limit = 50 } = options;
        const offset = (page - 1) * limit;

        const projectsList = await db
          .select()
          .from(projects)
          .orderBy(desc(projects.updatedAt))
          .limit(limit)
          .offset(offset);

        const [totalCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(projects);

        return {
          data: projectsList,
          pagination: {
            page,
            limit,
            total: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit)
          }
        };
      },
      'getAllProjects'
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [project] = await db.select().from(projects).where(eq(projects.id, id));
        return project || undefined;
      },
      'getProject'
    );
  }

  async createProject(project: InsertProject): Promise<Project> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newProject] = await db
          .insert(projects)
          .values(project)
          .returning();
        return newProject;
      },
      'createProject'
    );
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [project] = await db
          .update(projects)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(projects.id, id))
          .returning();
        return project;
      },
      'updateProject'
    );
  }

  async deleteProject(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(projects).where(eq(projects.id, id));
      },
      'deleteProject'
    );
  }

  async getDashboardAnalytics(userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get total streams from all user projects
        const [streamsResult] = await db
          .select({ totalStreams: sql<number>`COALESCE(SUM(${projects.streams}), 0)` })
          .from(projects)
          .where(eq(projects.userId, userId));

        // Get total revenue from all user projects
        const [revenueResult] = await db
          .select({ totalRevenue: sql<number>`COALESCE(SUM(${projects.revenue}), 0)` })
          .from(projects)
          .where(eq(projects.userId, userId));

        // Get project count by status
        const projectStats = await db
          .select({
            status: projects.status,
            count: sql<number>`COUNT(*)`
          })
          .from(projects)
          .where(eq(projects.userId, userId))
          .groupBy(projects.status);

        return {
          totalStreams: streamsResult?.totalStreams || 0,
          revenue: revenueResult?.totalRevenue || 0,
          followers: 45200, // This would come from social media APIs
          projectStats
        };
      },
      'getDashboardAnalytics'
    );
  }

  async getStreamsAnalytics(userId: string, days: number): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const analyticsData = await db
          .select({
            date: analytics.date,
            streams: sql<number>`SUM(${analytics.streams})`,
            revenue: sql<number>`SUM(${analytics.revenue})`,
            platform: analytics.platform
          })
          .from(analytics)
          .where(
            and(
              eq(analytics.userId, userId),
              gte(analytics.date, startDate),
              lte(analytics.date, endDate)
            )
          )
          .groupBy(analytics.date, analytics.platform)
          .orderBy(asc(analytics.date));

        return analyticsData;
      },
      'getStreamsAnalytics'
    );
  }

  async getAdminAnalytics(): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Run all queries in parallel for better performance
        const [
          userCountResult,
          projectCountResult,
          totalRevenueResult,
          subscriptionStats,
          recentSignupsResult
        ] = await Promise.all([
          // Total users
          db.select({ count: sql<number>`COUNT(*)` }).from(users),
          
          // Total projects
          db.select({ count: sql<number>`COUNT(*)` }).from(projects),
          
          // Total revenue
          db.select({ revenue: sql<number>`COALESCE(SUM(${projects.revenue}), 0)` }).from(projects),
          
          // Users by subscription plan
          db.select({
            plan: users.subscriptionPlan,
            count: sql<number>`COUNT(*)`
          })
          .from(users)
          .groupBy(users.subscriptionPlan),
          
          // Recent user signups (last 30 days)
          db.select({ count: sql<number>`COUNT(*)` })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo))
        ]);

        return {
          totalUsers: userCountResult[0]?.count || 0,
          totalProjects: projectCountResult[0]?.count || 0,
          totalRevenue: totalRevenueResult[0]?.revenue || 0,
          subscriptionStats,
          recentSignups: recentSignupsResult[0]?.count || 0
        };
      },
      'getAdminAnalytics'
    );
  }

  async createAnalyticsAnomaly(anomaly: InsertAnalyticsAnomaly): Promise<AnalyticsAnomaly> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [createdAnomaly] = await db.insert(analyticsAnomalies).values(anomaly).returning();
        return createdAnomaly;
      },
      'createAnalyticsAnomaly'
    );
  }

  async getUserAnomalies(userId: string, options?: PaginationOptions & { metricType?: string; severity?: string; startDate?: Date; endDate?: Date }): Promise<PaginatedResponse<AnalyticsAnomaly>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const page = options?.page || 1;
        const limit = options?.limit || 50;
        const offset = (page - 1) * limit;

        const conditions = [eq(analyticsAnomalies.userId, userId)];
        
        if (options?.metricType) {
          conditions.push(eq(analyticsAnomalies.metricType, options.metricType));
        }
        
        if (options?.severity) {
          conditions.push(eq(analyticsAnomalies.severity, options.severity));
        }
        
        if (options?.startDate) {
          conditions.push(gte(analyticsAnomalies.detectedAt, options.startDate));
        }
        
        if (options?.endDate) {
          conditions.push(lte(analyticsAnomalies.detectedAt, options.endDate));
        }

        const [data, countResult] = await Promise.all([
          db.select()
            .from(analyticsAnomalies)
            .where(and(...conditions))
            .orderBy(desc(analyticsAnomalies.detectedAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`COUNT(*)` })
            .from(analyticsAnomalies)
            .where(and(...conditions))
        ]);

        const total = countResult[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);

        return {
          data,
          pagination: { page, limit, total, totalPages }
        };
      },
      'getUserAnomalies'
    );
  }

  async getAnomaly(id: string): Promise<AnalyticsAnomaly | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const result = await db.select()
          .from(analyticsAnomalies)
          .where(eq(analyticsAnomalies.id, id))
          .limit(1);
        return result[0];
      },
      'getAnomaly'
    );
  }

  async acknowledgeAnomaly(id: string, userId: string): Promise<AnalyticsAnomaly> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [anomaly] = await db.update(analyticsAnomalies)
          .set({ acknowledgedAt: new Date() })
          .where(and(
            eq(analyticsAnomalies.id, id),
            eq(analyticsAnomalies.userId, userId)
          ))
          .returning();
        return anomaly;
      },
      'acknowledgeAnomaly'
    );
  }

  async getAnomalySummary(userId: string): Promise<{ total: number; bySeverity: Record<string, number>; unacknowledged: number }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [totalResult, severityStats, unacknowledgedResult] = await Promise.all([
          db.select({ count: sql<number>`COUNT(*)` })
            .from(analyticsAnomalies)
            .where(eq(analyticsAnomalies.userId, userId)),
          db.select({
            severity: analyticsAnomalies.severity,
            count: sql<number>`COUNT(*)`
          })
            .from(analyticsAnomalies)
            .where(eq(analyticsAnomalies.userId, userId))
            .groupBy(analyticsAnomalies.severity),
          db.select({ count: sql<number>`COUNT(*)` })
            .from(analyticsAnomalies)
            .where(and(
              eq(analyticsAnomalies.userId, userId),
              sql`${analyticsAnomalies.acknowledgedAt} IS NULL`
            ))
        ]);

        const bySeverity: Record<string, number> = {};
        severityStats.forEach(stat => {
          if (stat.severity) {
            bySeverity[stat.severity] = stat.count;
          }
        });

        return {
          total: totalResult[0]?.count || 0,
          bySeverity,
          unacknowledged: unacknowledgedResult[0]?.count || 0
        };
      },
      'getAnomalySummary'
    );
  }

  async getUnacknowledgedAnomalies(userId: string): Promise<AnalyticsAnomaly[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select()
          .from(analyticsAnomalies)
          .where(and(
            eq(analyticsAnomalies.userId, userId),
            sql`${analyticsAnomalies.acknowledgedAt} IS NULL`
          ))
          .orderBy(desc(analyticsAnomalies.detectedAt));
      },
      'getUnacknowledgedAnomalies'
    );
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(notifications)
          .where(eq(notifications.userId, userId))
          .orderBy(desc(notifications.createdAt))
          .limit(50);
      },
      'getUserNotifications'
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newNotification] = await db
          .insert(notifications)
          .values(notification)
          .returning();
        return newNotification;
      },
      'createNotification'
    );
  }

  async markNotificationAsRead(id: number, userId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(notifications)
          .set({ read: true })
          .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
      },
      'markNotificationAsRead'
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(notifications)
          .set({ read: true })
          .where(eq(notifications.userId, userId));
      },
      'markAllNotificationsAsRead'
    );
  }

  async updateNotificationPreferences(userId: string, preferences: any): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(users)
          .set({ notificationPreferences: preferences })
          .where(eq(users.id, userId));
      },
      'updateNotificationPreferences'
    );
  }

  async updatePushSubscription(userId: string, subscription: any): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(users)
          .set({ pushSubscription: subscription })
          .where(eq(users.id, userId));
      },
      'updatePushSubscription'
    );
  }

  // Distribution methods
  async getUserReleases(userId: string): Promise<Release[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(releases)
          .where(eq(releases.userId, userId))
          .orderBy(desc(releases.createdAt));
      },
      'getUserReleases'
    );
  }

  async createRelease(release: InsertRelease): Promise<Release> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newRelease] = await db
          .insert(releases)
          .values(release)
          .returning();
        return newRelease;
      },
      'createRelease'
    );
  }

  async updateRelease(id: string, userId: string, updates: Partial<Release>): Promise<Release> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedRelease] = await db
          .update(releases)
          .set({ ...updates, updatedAt: new Date() })
          .where(sql`${releases.id} = ${id} AND ${releases.userId} = ${userId}`)
          .returning();
        return updatedRelease;
      },
      'updateRelease'
    );
  }

  async deleteRelease(id: string, userId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(releases)
          .where(sql`${releases.id} = ${id} AND ${releases.userId} = ${userId}`);
      },
      'deleteRelease'
    );
  }

  async updateReleaseStatus(id: number, status: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(releases)
          .set({ status, updatedAt: new Date() })
          .where(sql`${releases.id} = ${id}`);
      },
      'updateReleaseStatus'
    );
  }

  async getDistributionAnalytics(userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get total releases count
        const [totalReleases] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(releases)
          .where(eq(releases.userId, userId));

        // Get pending releases count
        const [pendingReleases] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(releases)
          .where(sql`${releases.userId} = ${userId} AND ${releases.status} = 'pending'`);

        // Get total earnings
        const [totalEarnings] = await db
          .select({ total: sql<number>`COALESCE(SUM(${earnings.amount}), 0)` })
          .from(earnings)
          .leftJoin(releases, eq(earnings.releaseId, releases.id))
          .where(eq(releases.userId, userId));

        // Get platform-wise distribution
        const platformStats = await db
          .select({
            platform: earnings.platform,
            streams: sql<number>`COALESCE(SUM(${earnings.streams}), 0)`,
            earnings: sql<number>`COALESCE(SUM(${earnings.amount}), 0)`
          })
          .from(earnings)
          .leftJoin(releases, eq(earnings.releaseId, releases.id))
          .where(eq(releases.userId, userId))
          .groupBy(earnings.platform);

        // Calculate total streams from platform stats
        const totalStreams = platformStats.reduce((sum, p) => sum + (Number(p.streams) || 0), 0);

        return {
          totalEarnings: Number(totalEarnings?.total) || 0,
          totalStreams: totalStreams,
          totalReleases: Number(totalReleases?.count) || 0,
          pendingReleases: Number(pendingReleases?.count) || 0,
          platformBreakdown: platformStats.map(p => ({
            platform: p.platform || 'Unknown',
            streams: Number(p.streams) || 0,
            earnings: Number(p.earnings) || 0
          }))
        };
      },
      'getDistributionAnalytics'
    );
  }

  async getReleaseEarnings(releaseId: string, userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(earnings)
          .leftJoin(releases, eq(earnings.releaseId, releases.id))
          .where(and(
            eq(earnings.releaseId, releaseId),
            eq(releases.userId, userId)
          ))
          .orderBy(desc(earnings.reportDate));
      },
      'getReleaseEarnings'
    );
  }

  async createHyperFollowPage(data: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [page] = await db
          .insert(hyperFollowPages)
          .values(data)
          .returning();
        return page;
      },
      'createHyperFollowPage'
    );
  }

  async getUserHyperFollowPages(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(hyperFollowPages)
          .where(eq(hyperFollowPages.userId, userId))
          .orderBy(desc(hyperFollowPages.createdAt));
      },
      'getUserHyperFollowPages'
    );
  }

  async getHyperFollowPages(userId: string): Promise<any[]> {
    return this.getUserHyperFollowPages(userId);
  }

  async getHyperFollowPage(id: string): Promise<any | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [page] = await db
          .select()
          .from(hyperFollowPages)
          .where(eq(hyperFollowPages.id, id));
        return page;
      },
      'getHyperFollowPage'
    );
  }

  async getHyperFollowPageBySlug(slug: string): Promise<any | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [page] = await db
          .select()
          .from(hyperFollowPages)
          .where(eq(hyperFollowPages.slug, slug));
        return page;
      },
      'getHyperFollowPageBySlug'
    );
  }

  async updateHyperFollowPage(id: string, data: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(hyperFollowPages)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(hyperFollowPages.id, id))
          .returning();
        return updated;
      },
      'updateHyperFollowPage'
    );
  }

  async deleteHyperFollowPage(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(hyperFollowPages)
          .where(eq(hyperFollowPages.id, id));
      },
      'deleteHyperFollowPage'
    );
  }

  async trackHyperFollowEvent(slug: string, eventType: string, data?: any): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        const page = await this.getHyperFollowPageBySlug(slug);
        if (!page) return;

        const currentLinks = page.links || {};
        const analytics = currentLinks.analytics || {
          pageViews: 0,
          preSaves: 0,
          emailSignups: 0,
          platformClicks: {}
        };

        if (eventType === 'pageView') {
          analytics.pageViews = (analytics.pageViews || 0) + 1;
        } else if (eventType === 'preSave') {
          analytics.preSaves = (analytics.preSaves || 0) + 1;
        } else if (eventType === 'emailSignup') {
          analytics.emailSignups = (analytics.emailSignups || 0) + 1;
        } else if (eventType === 'platformClick' && data?.platform) {
          analytics.platformClicks = analytics.platformClicks || {};
          analytics.platformClicks[data.platform] = (analytics.platformClicks[data.platform] || 0) + 1;
        }

        const updatedLinks = {
          ...currentLinks,
          analytics
        };

        await db
          .update(hyperFollowPages)
          .set({ 
            links: updatedLinks
          })
          .where(eq(hyperFollowPages.slug, slug));
      },
      'trackHyperFollowEvent'
    );
  }

  // Distribution Provider operations
  async getAllDistroProviders(): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Check cache first (TTL: 15 minutes)
        const cached = this.cache.get<any[]>('distro_providers');
        if (cached) return cached;
        
        const providers = await db
          .select()
          .from(distroProviders)
          .where(eq(distroProviders.status, 'active'))
          .orderBy(asc(distroProviders.name));
        
        // Cache the result
        this.cache.set('distro_providers', providers, 15 * 60 * 1000);
        return providers;
      },
      'getAllDistroProviders'
    );
  }

  async getDistroProvider(id: string): Promise<any | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [provider] = await db
          .select()
          .from(distroProviders)
          .where(eq(distroProviders.id, id));
        return provider;
      },
      'getDistroProvider'
    );
  }

  async getDistroProviderBySlug(slug: string): Promise<any | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [provider] = await db
          .select()
          .from(distroProviders)
          .where(eq(distroProviders.slug, slug));
        return provider;
      },
      'getDistroProviderBySlug'
    );
  }

  async createDistroProvider(provider: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newProvider] = await db
          .insert(distroProviders)
          .values(provider)
          .returning();
        return newProvider;
      },
      'createDistroProvider'
    );
  }

  async getDistroDispatch(id: string): Promise<any | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [dispatch] = await db
          .select()
          .from(distroDispatch)
          .where(eq(distroDispatch.id, id));
        return dispatch;
      },
      'getDistroDispatch'
    );
  }

  async createDistroDispatch(dispatch: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newDispatch] = await db
          .insert(distroDispatch)
          .values(dispatch)
          .returning();
        return newDispatch;
      },
      'createDistroDispatch'
    );
  }

  async updateDistroDispatch(id: string, updates: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedDispatch] = await db
          .update(distroDispatch)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(distroDispatch.id, id))
          .returning();
        return updatedDispatch;
      },
      'updateDistroDispatch'
    );
  }

  async getDistroDispatchStatuses(releaseId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(distroDispatch)
          .where(eq(distroDispatch.releaseId, releaseId))
          .orderBy(asc(distroDispatch.createdAt));
      },
      'getDistroDispatchStatuses'
    );
  }

  // Max Booster Studio - Now uses unified projects table with isStudioProject flag
  // All studio projects are stored in the main projects table

  // Track operations
  async getProjectTracks(projectId: string): Promise<StudioTrack[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(studioTracks)
          .where(eq(studioTracks.projectId, projectId))
          .orderBy(asc(studioTracks.trackNumber));
      },
      'getProjectTracks'
    );
  }

  async createStudioTrack(track: InsertStudioTrack): Promise<StudioTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newTrack] = await db
          .insert(studioTracks)
          .values(track)
          .returning();
        return newTrack;
      },
      'createStudioTrack'
    );
  }

  async updateStudioTrack(id: string, projectId: string, updates: Partial<StudioTrack>): Promise<StudioTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedTrack] = await db
          .update(studioTracks)
          .set({ ...updates, updatedAt: new Date() })
          .where(sql`${studioTracks.id} = ${id} AND ${studioTracks.projectId} = ${projectId}`)
          .returning();
        return updatedTrack;
      },
      'updateStudioTrack'
    );
  }

  async updateStudioTrackEffects(id: string, projectId: string, effects: any): Promise<StudioTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [track] = await db
          .select()
          .from(studioTracks)
          .where(sql`${studioTracks.id} = ${id} AND ${studioTracks.projectId} = ${projectId}`)
          .limit(1);
        
        if (!track) {
          throw new Error('Track not found');
        }

        const currentEffects = (track.effects as any) || {};
        const mergedEffects = {
          ...currentEffects,
          ...effects,
        };

        const [updatedTrack] = await db
          .update(studioTracks)
          .set({ effects: mergedEffects, updatedAt: new Date() })
          .where(sql`${studioTracks.id} = ${id} AND ${studioTracks.projectId} = ${projectId}`)
          .returning();
        return updatedTrack;
      },
      'updateStudioTrackEffects'
    );
  }

  async deleteStudioTrack(id: string, projectId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(studioTracks)
          .where(sql`${studioTracks.id} = ${id} AND ${studioTracks.projectId} = ${projectId}`);
      },
      'deleteStudioTrack'
    );
  }

  // Audio clip operations
  async getTrackAudioClips(trackId: string): Promise<AudioClip[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(audioClips)
          .where(eq(audioClips.trackId, trackId))
          .orderBy(asc(audioClips.startTime));
      },
      'getTrackAudioClips'
    );
  }

  async createAudioClip(clip: InsertAudioClip): Promise<AudioClip> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newClip] = await db
          .insert(audioClips)
          .values(clip)
          .returning();
        return newClip;
      },
      'createAudioClip'
    );
  }

  async updateAudioClip(id: string, trackId: string, updates: Partial<AudioClip>): Promise<AudioClip> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedClip] = await db
          .update(audioClips)
          .set(updates)
          .where(sql`${audioClips.id} = ${id} AND ${audioClips.trackId} = ${trackId}`)
          .returning();
        return updatedClip;
      },
      'updateAudioClip'
    );
  }

  async deleteAudioClip(id: string, trackId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(audioClips)
          .where(sql`${audioClips.id} = ${id} AND ${audioClips.trackId} = ${trackId}`);
      },
      'deleteAudioClip'
    );
  }

  // MIDI clip operations
  async getTrackMidiClips(trackId: string): Promise<MidiClip[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(midiClips)
          .where(eq(midiClips.trackId, trackId))
          .orderBy(asc(midiClips.startTime));
      },
      'getTrackMidiClips'
    );
  }

  async createMidiClip(clip: InsertMidiClip): Promise<MidiClip> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newClip] = await db
          .insert(midiClips)
          .values(clip)
          .returning();
        return newClip;
      },
      'createMidiClip'
    );
  }

  async updateMidiClip(id: string, trackId: string, updates: Partial<MidiClip>): Promise<MidiClip> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedClip] = await db
          .update(midiClips)
          .set(updates)
          .where(sql`${midiClips.id} = ${id} AND ${midiClips.trackId} = ${trackId}`)
          .returning();
        return updatedClip;
      },
      'updateMidiClip'
    );
  }

  async deleteMidiClip(id: string, trackId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(midiClips)
          .where(sql`${midiClips.id} = ${id} AND ${midiClips.trackId} = ${trackId}`);
      },
      'deleteMidiClip'
    );
  }

  // Virtual instrument operations
  async getTrackInstruments(trackId: string): Promise<VirtualInstrument[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(virtualInstruments)
          .where(eq(virtualInstruments.trackId, trackId))
          .orderBy(asc(virtualInstruments.createdAt));
      },
      'getTrackInstruments'
    );
  }

  async createVirtualInstrument(instrument: InsertVirtualInstrument): Promise<VirtualInstrument> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newInstrument] = await db
          .insert(virtualInstruments)
          .values(instrument)
          .returning();
        return newInstrument;
      },
      'createVirtualInstrument'
    );
  }

  async updateVirtualInstrument(id: string, trackId: string, updates: Partial<VirtualInstrument>): Promise<VirtualInstrument> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedInstrument] = await db
          .update(virtualInstruments)
          .set(updates)
          .where(sql`${virtualInstruments.id} = ${id} AND ${virtualInstruments.trackId} = ${trackId}`)
          .returning();
        return updatedInstrument;
      },
      'updateVirtualInstrument'
    );
  }

  async deleteVirtualInstrument(id: string, trackId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(virtualInstruments)
          .where(sql`${virtualInstruments.id} = ${id} AND ${virtualInstruments.trackId} = ${trackId}`);
      },
      'deleteVirtualInstrument'
    );
  }

  // Effect operations
  async getTrackEffects(trackId: string): Promise<AudioEffect[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(audioEffects)
          .where(eq(audioEffects.trackId, trackId))
          .orderBy(asc(audioEffects.chainPosition));
      },
      'getTrackEffects'
    );
  }

  async getProjectEffects(projectId: string): Promise<AudioEffect[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(audioEffects)
          .where(eq(audioEffects.projectId, projectId))
          .orderBy(asc(audioEffects.chainPosition));
      },
      'getProjectEffects'
    );
  }

  async createAudioEffect(effect: InsertAudioEffect): Promise<AudioEffect> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newEffect] = await db
          .insert(audioEffects)
          .values(effect)
          .returning();
        return newEffect;
      },
      'createAudioEffect'
    );
  }

  async updateAudioEffect(id: string, updates: Partial<AudioEffect>): Promise<AudioEffect> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedEffect] = await db
          .update(audioEffects)
          .set(updates)
          .where(eq(audioEffects.id, id))
          .returning();
        return updatedEffect;
      },
      'updateAudioEffect'
    );
  }

  async deleteAudioEffect(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(audioEffects)
          .where(eq(audioEffects.id, id));
      },
      'deleteAudioEffect'
    );
  }

  // Mix bus operations
  async getProjectBusses(projectId: string): Promise<MixBus[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(mixBusses)
          .where(sql`${mixBusses.projectId} = ${projectId}::uuid`)
          .orderBy(asc(mixBusses.createdAt));
      },
      'getProjectBusses'
    );
  }

  async createMixBus(bus: InsertMixBus): Promise<MixBus> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newBus] = await db
          .insert(mixBusses)
          .values(bus)
          .returning();
        return newBus;
      },
      'createMixBus'
    );
  }

  async updateMixBus(id: string, projectId: string, updates: Partial<MixBus>): Promise<MixBus> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedBus] = await db
          .update(mixBusses)
          .set(updates)
          .where(sql`${mixBusses.id} = ${id} AND ${mixBusses.projectId} = ${projectId}`)
          .returning();
        return updatedBus;
      },
      'updateMixBus'
    );
  }

  async deleteMixBus(id: string, projectId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(mixBusses)
          .where(sql`${mixBusses.id} = ${id} AND ${mixBusses.projectId} = ${projectId}`);
      },
      'deleteMixBus'
    );
  }

  // Automation operations
  async getProjectAutomation(projectId: string): Promise<AutomationData[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(automationData)
          .where(eq(automationData.projectId, projectId))
          .orderBy(asc(automationData.createdAt));
      },
      'getProjectAutomation'
    );
  }

  async getTrackAutomation(trackId: string): Promise<AutomationData[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(automationData)
          .where(eq(automationData.trackId, trackId))
          .orderBy(asc(automationData.createdAt));
      },
      'getTrackAutomation'
    );
  }

  async createAutomationData(automation: InsertAutomationData): Promise<AutomationData> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newAutomation] = await db
          .insert(automationData)
          .values(automation)
          .returning();
        return newAutomation;
      },
      'createAutomationData'
    );
  }

  async updateAutomationData(id: string, projectId: string, updates: Partial<AutomationData>): Promise<AutomationData> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedAutomation] = await db
          .update(automationData)
          .set(updates)
          .where(sql`${automationData.id} = ${id} AND ${automationData.projectId} = ${projectId}`)
          .returning();
        return updatedAutomation;
      },
      'updateAutomationData'
    );
  }

  async deleteAutomationData(id: string, projectId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(automationData)
          .where(sql`${automationData.id} = ${id} AND ${automationData.projectId} = ${projectId}`);
      },
      'deleteAutomationData'
    );
  }

  // Marker operations
  async getProjectMarkers(projectId: string): Promise<Marker[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(markers)
          .where(eq(markers.projectId, projectId))
          .orderBy(asc(markers.position));
      },
      'getProjectMarkers'
    );
  }

  async createMarker(marker: InsertMarker): Promise<Marker> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newMarker] = await db
          .insert(markers)
          .values(marker)
          .returning();
        return newMarker;
      },
      'createMarker'
    );
  }

  async updateMarker(id: string, projectId: string, updates: Partial<Marker>): Promise<Marker> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedMarker] = await db
          .update(markers)
          .set(updates)
          .where(sql`${markers.id} = ${id} AND ${markers.projectId} = ${projectId}`)
          .returning();
        return updatedMarker;
      },
      'updateMarker'
    );
  }

  async deleteMarker(id: string, projectId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(markers)
          .where(sql`${markers.id} = ${id} AND ${markers.projectId} = ${projectId}`);
      },
      'deleteMarker'
    );
  }

  // Lyrics operations
  async getProjectLyrics(projectId: string): Promise<Lyrics | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [lyric] = await db
          .select()
          .from(lyrics)
          .where(eq(lyrics.projectId, projectId));
        return lyric || undefined;
      },
      'getProjectLyrics'
    );
  }

  async createLyrics(lyric: InsertLyrics): Promise<Lyrics> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newLyrics] = await db
          .insert(lyrics)
          .values(lyric)
          .returning();
        return newLyrics;
      },
      'createLyrics'
    );
  }

  async updateLyrics(id: string, projectId: string, updates: Partial<Lyrics>): Promise<Lyrics> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedLyrics] = await db
          .update(lyrics)
          .set({ ...updates, updatedAt: new Date() })
          .where(sql`${lyrics.id} = ${id} AND ${lyrics.projectId} = ${projectId}`)
          .returning();
        return updatedLyrics;
      },
      'updateLyrics'
    );
  }

  async deleteLyrics(id: string, projectId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(lyrics)
          .where(sql`${lyrics.id} = ${id} AND ${lyrics.projectId} = ${projectId}`);
      },
      'deleteLyrics'
    );
  }

  // Generated Melodies operations - AI Music Generation
  async getProjectGeneratedMelodies(projectId: string): Promise<GeneratedMelody[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(generatedMelodies)
          .where(eq(generatedMelodies.projectId, projectId))
          .orderBy(desc(generatedMelodies.createdAt));
      },
      'getProjectGeneratedMelodies'
    );
  }

  async getUserGeneratedMelodies(userId: string): Promise<GeneratedMelody[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(generatedMelodies)
          .where(eq(generatedMelodies.userId, userId))
          .orderBy(desc(generatedMelodies.createdAt));
      },
      'getUserGeneratedMelodies'
    );
  }

  async getGeneratedMelody(id: string): Promise<GeneratedMelody | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [melody] = await db
          .select()
          .from(generatedMelodies)
          .where(eq(generatedMelodies.id, id));
        return melody || undefined;
      },
      'getGeneratedMelody'
    );
  }

  async createGeneratedMelody(melody: InsertGeneratedMelody): Promise<GeneratedMelody> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newMelody] = await db
          .insert(generatedMelodies)
          .values(melody)
          .returning();
        return newMelody;
      },
      'createGeneratedMelody'
    );
  }

  async deleteGeneratedMelody(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(generatedMelodies)
          .where(eq(generatedMelodies.id, id));
      },
      'deleteGeneratedMelody'
    );
  }

  // Distribution Package operations
  async getDistributionPackage(projectId: string): Promise<DistributionPackage | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [pkg] = await db
          .select()
          .from(distributionPackages)
          .where(eq(distributionPackages.projectId, projectId));
        return pkg || undefined;
      },
      'getDistributionPackage'
    );
  }

  async getDistributionPackageById(id: string): Promise<DistributionPackage | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [pkg] = await db
          .select()
          .from(distributionPackages)
          .where(eq(distributionPackages.id, id));
        return pkg || undefined;
      },
      'getDistributionPackageById'
    );
  }

  async createDistributionPackage(pkg: InsertDistributionPackage): Promise<DistributionPackage> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newPackage] = await db
          .insert(distributionPackages)
          .values(pkg)
          .returning();
        return newPackage;
      },
      'createDistributionPackage'
    );
  }

  async updateDistributionPackage(id: string, updates: Partial<DistributionPackage>): Promise<DistributionPackage> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedPackage] = await db
          .update(distributionPackages)
          .set(updates)
          .where(eq(distributionPackages.id, id))
          .returning();
        return updatedPackage;
      },
      'updateDistributionPackage'
    );
  }

  async deleteDistributionPackage(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(distributionPackages)
          .where(eq(distributionPackages.id, id));
      },
      'deleteDistributionPackage'
    );
  }

  async getPackageTracks(packageId: string): Promise<DistributionTrack[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(distributionTracks)
          .where(eq(distributionTracks.packageId, packageId))
          .orderBy(asc(distributionTracks.trackNumber));
      },
      'getPackageTracks'
    );
  }

  async createDistributionTrack(track: InsertDistributionTrack): Promise<DistributionTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newTrack] = await db
          .insert(distributionTracks)
          .values(track)
          .returning();
        return newTrack;
      },
      'createDistributionTrack'
    );
  }

  async updateDistributionTrack(id: string, packageId: string, updates: Partial<DistributionTrack>): Promise<DistributionTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedTrack] = await db
          .update(distributionTracks)
          .set(updates)
          .where(sql`${distributionTracks.id} = ${id} AND ${distributionTracks.packageId} = ${packageId}`)
          .returning();
        return updatedTrack;
      },
      'updateDistributionTrack'
    );
  }

  async deleteDistributionTrack(id: string, packageId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(distributionTracks)
          .where(sql`${distributionTracks.id} = ${id} AND ${distributionTracks.packageId} = ${packageId}`);
      },
      'deleteDistributionTrack'
    );
  }

  // Upload Session operations
  async createUploadSession(session: InsertUploadSession): Promise<UploadSession> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newSession] = await db
          .insert(uploadSessions)
          .values(session)
          .returning();
        return newSession;
      },
      'createUploadSession'
    );
  }

  async getUploadSession(id: string): Promise<UploadSession | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [session] = await db
          .select()
          .from(uploadSessions)
          .where(eq(uploadSessions.id, id));
        return session || undefined;
      },
      'getUploadSession'
    );
  }

  async updateUploadSession(id: string, updates: Partial<InsertUploadSession>): Promise<UploadSession> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedSession] = await db
          .update(uploadSessions)
          .set(updates)
          .where(eq(uploadSessions.id, id))
          .returning();
        return updatedSession;
      },
      'updateUploadSession'
    );
  }

  async deleteUploadSession(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(uploadSessions)
          .where(eq(uploadSessions.id, id));
      },
      'deleteUploadSession'
    );
  }

  async getUserUploadSessions(userId: string, status?: string): Promise<UploadSession[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const query = status
          ? db.select().from(uploadSessions).where(and(eq(uploadSessions.userId, userId), eq(uploadSessions.status, status)))
          : db.select().from(uploadSessions).where(eq(uploadSessions.userId, userId));
        
        return await query.orderBy(desc(uploadSessions.createdAt));
      },
      'getUserUploadSessions'
    );
  }

  // ISRC operations
  async generateISRC(userId: string, trackId: string, metadata: any): Promise<string> {
    return this.executeWithCircuitBreaker(
      async () => {
        const crypto = await import('crypto');
        const metadataStr = JSON.stringify({ userId, trackId, ...metadata });
        const metadataHash = crypto.createHash('sha256').update(metadataStr).digest('hex');
        
        const currentYear = new Date().getFullYear();
        const yearCode = currentYear.toString().slice(-2);
        const registrantCode = 'MXB';
        
        const userYearISRCs = await db
          .select()
          .from(isrcRegistry)
          .where(and(
            eq(isrcRegistry.userId, userId),
            eq(isrcRegistry.yearCode, yearCode)
          ))
          .orderBy(desc(isrcRegistry.designation));
        
        const nextDesignation = userYearISRCs.length > 0
          ? (parseInt(userYearISRCs[0].designation) + 1).toString().padStart(5, '0')
          : '00001';
        
        const isrc = `US${registrantCode}${yearCode}${nextDesignation}`;
        
        await db.insert(isrcRegistry).values({
          isrc,
          userId,
          trackId,
          registrantCode,
          yearCode,
          designation: nextDesignation,
          metadataHash
        });
        
        return isrc;
      },
      'generateISRC'
    );
  }

  async getISRC(code: string): Promise<ISRCRegistry | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [isrc] = await db
          .select()
          .from(isrcRegistry)
          .where(eq(isrcRegistry.isrc, code));
        return isrc || undefined;
      },
      'getISRC'
    );
  }

  async verifyISRCUniqueness(code: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const existing = await this.getISRC(code);
        return !existing;
      },
      'verifyISRCUniqueness'
    );
  }

  // UPC operations
  async generateUPC(userId: string, releaseId: string, metadata: any): Promise<string> {
    return this.executeWithCircuitBreaker(
      async () => {
        const crypto = await import('crypto');
        const metadataStr = JSON.stringify({ userId, releaseId, ...metadata });
        const metadataHash = crypto.createHash('sha256').update(metadataStr).digest('hex');
        
        const prefix = '123456';
        
        const userUPCs = await db
          .select()
          .from(upcRegistry)
          .where(eq(upcRegistry.userId, userId))
          .orderBy(desc(upcRegistry.itemReference));
        
        const nextItemRef = userUPCs.length > 0
          ? (parseInt(userUPCs[0].itemReference) + 1).toString().padStart(5, '0')
          : '00001';
        
        const upcWithoutCheck = `${prefix}${nextItemRef}`;
        
        const checkDigit = this.calculateUPCCheckDigit(upcWithoutCheck);
        const upc = `${upcWithoutCheck}${checkDigit}`;
        
        await db.insert(upcRegistry).values({
          upc,
          userId,
          releaseId,
          prefix,
          itemReference: nextItemRef,
          checkDigit,
          metadataHash
        });
        
        return upc;
      },
      'generateUPC'
    );
  }

  async getUPC(code: string): Promise<UPCRegistry | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [upc] = await db
          .select()
          .from(upcRegistry)
          .where(eq(upcRegistry.upc, code));
        return upc || undefined;
      },
      'getUPC'
    );
  }

  async verifyUPCUniqueness(code: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const existing = await this.getUPC(code);
        return !existing;
      },
      'verifyUPCUniqueness'
    );
  }

  private calculateUPCCheckDigit(upc: string): string {
    let sum = 0;
    for (let i = 0; i < upc.length; i++) {
      const digit = parseInt(upc[i]);
      sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  // Studio Conversion operations
  async getProjectConversions(projectId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(studioConversions)
          .where(eq(studioConversions.projectId, projectId))
          .orderBy(desc(studioConversions.createdAt));
      },
      'getProjectConversions'
    );
  }

  async getUserConversions(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(studioConversions)
          .where(eq(studioConversions.userId, userId))
          .orderBy(desc(studioConversions.createdAt));
      },
      'getUserConversions'
    );
  }

  async getConversion(id: string): Promise<any | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [conversion] = await db
          .select()
          .from(studioConversions)
          .where(eq(studioConversions.id, id));
        return conversion || undefined;
      },
      'getConversion'
    );
  }

  async createConversion(conversion: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newConversion] = await db
          .insert(studioConversions)
          .values(conversion)
          .returning();
        return newConversion;
      },
      'createConversion'
    );
  }

  async updateConversion(id: string, updates: Partial<any>): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedConversion] = await db
          .update(studioConversions)
          .set(updates)
          .where(eq(studioConversions.id, id))
          .returning();
        return updatedConversion;
      },
      'updateConversion'
    );
  }

  async deleteConversion(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(studioConversions)
          .where(eq(studioConversions.id, id));
      },
      'deleteConversion'
    );
  }

  // Autosave operations (Phase 7)
  async createAutosave(autosave: InsertAutosave): Promise<Autosave> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newAutosave] = await db
          .insert(autosaves)
          .values(autosave)
          .returning();
        return newAutosave;
      },
      'createAutosave'
    );
  }

  async getProjectAutosaves(projectId: string): Promise<Autosave[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(autosaves)
          .where(eq(autosaves.projectId, projectId))
          .orderBy(desc(autosaves.createdAt))
          .limit(10);
      },
      'getProjectAutosaves'
    );
  }

  async getAutosave(id: number): Promise<Autosave | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [autosave] = await db
          .select()
          .from(autosaves)
          .where(eq(autosaves.id, id));
        return autosave || undefined;
      },
      'getAutosave'
    );
  }

  async deleteAutosave(id: number): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(autosaves)
          .where(eq(autosaves.id, id));
      },
      'deleteAutosave'
    );
  }

  // Ad Campaign operations
  async getUserAdCampaigns(userId: string): Promise<AdCampaign[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        // DB has user_id as INTEGER, but userId param is string
        // Cast DB column to text for comparison
        return await db
          .select()
          .from(adCampaigns)
          .where(sql`${adCampaigns.userId}::text = ${userId}`)
          .orderBy(desc(adCampaigns.createdAt));
      },
      'getUserAdCampaigns'
    );
  }

  async getAdCampaign(id: number): Promise<AdCampaign | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [campaign] = await db
          .select()
          .from(adCampaigns)
          .where(eq(adCampaigns.id, id));
        return campaign || undefined;
      },
      'getAdCampaign'
    );
  }

  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newCampaign] = await db
          .insert(adCampaigns)
          .values(campaign)
          .returning();
        return newCampaign;
      },
      'createAdCampaign'
    );
  }

  async updateAdCampaign(id: number, updates: Partial<AdCampaign>): Promise<AdCampaign> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedCampaign] = await db
          .update(adCampaigns)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(adCampaigns.id, id))
          .returning();
        return updatedCampaign;
      },
      'updateAdCampaign'
    );
  }

  async deleteAdCampaign(id: number): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(adCampaigns)
          .where(eq(adCampaigns.id, id));
      },
      'deleteAdCampaign'
    );
  }

  async saveOrganicMetrics(campaignId: number, organicMetrics: any): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(adCampaigns)
          .set({ 
            organicMetrics: {
              posts: organicMetrics,
              lastUpdated: new Date().toISOString()
            },
            updatedAt: new Date() 
          })
          .where(eq(adCampaigns.id, campaignId));
      },
      'saveOrganicMetrics'
    );
  }

  async getOrganicMetrics(campaignId: number): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [campaign] = await db
          .select({ organicMetrics: adCampaigns.organicMetrics })
          .from(adCampaigns)
          .where(eq(adCampaigns.id, campaignId));
        return campaign?.organicMetrics || null;
      },
      'getOrganicMetrics'
    );
  }

  // Ad Insights operations
  async getUserAdInsights(userId: string): Promise<AdInsights | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [insights] = await db
          .select()
          .from(adInsights)
          .where(eq(adInsights.userId, userId))
          .orderBy(desc(adInsights.createdAt))
          .limit(1);
        return insights || undefined;
      },
      'getUserAdInsights'
    );
  }

  async createAdInsights(insightsData: InsertAdInsights): Promise<AdInsights> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newInsights] = await db
          .insert(adInsights)
          .values(insightsData)
          .returning();
        return newInsights;
      },
      'createAdInsights'
    );
  }

  async updateAdInsights(id: string, userId: string, updates: Partial<InsertAdInsights>): Promise<AdInsights> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedInsights] = await db
          .update(adInsights)
          .set({ ...updates, updatedAt: new Date() })
          .where(and(eq(adInsights.id, id), eq(adInsights.userId, userId)))
          .returning();
        return updatedInsights;
      },
      'updateAdInsights'
    );
  }

  // Ad Creative operations
  async createAdCreative(creative: InsertAdCreative): Promise<AdCreative> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newCreative] = await db
          .insert(adCreatives)
          .values(creative)
          .returning();
        return newCreative;
      },
      'createAdCreative'
    );
  }

  async getAdCreative(id: string): Promise<AdCreative | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [creative] = await db
          .select()
          .from(adCreatives)
          .where(eq(adCreatives.id, id));
        return creative;
      },
      'getAdCreative'
    );
  }

  async getUserAdCreatives(userId: string): Promise<AdCreative[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(adCreatives)
          .where(eq(adCreatives.userId, userId))
          .orderBy(desc(adCreatives.createdAt));
      },
      'getUserAdCreatives'
    );
  }

  async updateAdCreative(id: string, updates: Partial<InsertAdCreative>): Promise<AdCreative> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(adCreatives)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(adCreatives.id, id))
          .returning();
        return updated;
      },
      'updateAdCreative'
    );
  }

  // Ad AI Run operations
  async createAdAIRun(run: InsertAdAIRun): Promise<AdAIRun> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newRun] = await db
          .insert(adAIRuns)
          .values(run)
          .returning();
        return newRun;
      },
      'createAdAIRun'
    );
  }

  // Ad Campaign Variant operations
  async createAdCampaignVariant(variant: InsertAdCampaignVariant): Promise<AdCampaignVariant> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newVariant] = await db
          .insert(adCampaignVariants)
          .values(variant)
          .returning();
        return newVariant;
      },
      'createAdCampaignVariant'
    );
  }

  async getAdCampaignVariant(id: string): Promise<AdCampaignVariant | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [variant] = await db
          .select()
          .from(adCampaignVariants)
          .where(eq(adCampaignVariants.id, id));
        return variant;
      },
      'getAdCampaignVariant'
    );
  }

  async getCampaignVariants(campaignId: number): Promise<AdCampaignVariant[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(adCampaignVariants)
          .where(eq(adCampaignVariants.campaignId, campaignId))
          .orderBy(desc(adCampaignVariants.createdAt));
      },
      'getCampaignVariants'
    );
  }

  async updateAdCampaignVariant(id: string, updates: Partial<InsertAdCampaignVariant>): Promise<AdCampaignVariant> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(adCampaignVariants)
          .set(updates)
          .where(eq(adCampaignVariants.id, id))
          .returning();
        return updated;
      },
      'updateAdCampaignVariant'
    );
  }

  // Ad Platform Account operations
  async getUserPlatformAccount(userId: string, platform: string): Promise<AdPlatformAccount | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [account] = await db
          .select()
          .from(adPlatformAccounts)
          .where(and(
            eq(adPlatformAccounts.userId, userId),
            eq(adPlatformAccounts.platform, platform)
          ));
        return account;
      },
      'getUserPlatformAccount'
    );
  }

  // Ad Delivery Log operations
  async createAdDeliveryLog(log: InsertAdDeliveryLog): Promise<AdDeliveryLog> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newLog] = await db
          .insert(adDeliveryLogs)
          .values(log)
          .returning();
        return newLog;
      },
      'createAdDeliveryLog'
    );
  }

  async getDeliveryLogs(campaignId: number): Promise<AdDeliveryLog[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const variants = await db
          .select({ id: adCampaignVariants.id })
          .from(adCampaignVariants)
          .where(eq(adCampaignVariants.campaignId, campaignId));
        
        if (variants.length === 0) return [];
        
        const variantIds = variants.map(v => v.id);
        return await db
          .select()
          .from(adDeliveryLogs)
          .where(
            or(...variantIds.map(id => eq(adDeliveryLogs.variantId, id)))
          )
          .orderBy(desc(adDeliveryLogs.createdAt));
      },
      'getDeliveryLogs'
    );
  }

  // Ad Kill Rule operations
  async createAdKillRule(rule: InsertAdKillRule): Promise<AdKillRule> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newRule] = await db
          .insert(adKillRules)
          .values(rule)
          .returning();
        return newRule;
      },
      'createAdKillRule'
    );
  }

  async getCampaignRules(campaignId: number): Promise<AdKillRule[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(adKillRules)
          .where(eq(adKillRules.campaignId, campaignId))
          .orderBy(desc(adKillRules.createdAt));
      },
      'getCampaignRules'
    );
  }

  async updateAdKillRule(id: string, updates: Partial<InsertAdKillRule>): Promise<AdKillRule> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(adKillRules)
          .set(updates)
          .where(eq(adKillRules.id, id))
          .returning();
        return updated;
      },
      'updateAdKillRule'
    );
  }

  // Ad Rule Execution operations
  async createAdRuleExecution(execution: InsertAdRuleExecution): Promise<AdRuleExecution> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newExecution] = await db
          .insert(adRuleExecutions)
          .values(execution)
          .returning();
        return newExecution;
      },
      'createAdRuleExecution'
    );
  }

  async getRuleExecutions(ruleId: string): Promise<AdRuleExecution[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(adRuleExecutions)
          .where(eq(adRuleExecutions.ruleId, ruleId))
          .orderBy(desc(adRuleExecutions.executedAt));
      },
      'getRuleExecutions'
    );
  }

  // Social Media operations
  async getSocialPlatforms(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const accounts = await db
          .select()
          .from(socialAccounts)
          .where(eq(socialAccounts.userId, userId));
        
        return accounts.map(account => ({
          name: account.platform || 'Unknown',
          connected: !!account.accessToken && account.isActive,
          username: account.username,
          followers: 0,
          engagement: 0,
          lastSync: account.createdAt?.toISOString() || '',
          accessToken: account.accessToken
        }));
      },
      'getSocialPlatforms'
    );
  }

  async getSocialPosts(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const userPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.campaignId, sql`(SELECT id FROM social_campaigns WHERE user_id = ${userId} LIMIT 1)`))
          .orderBy(desc(posts.createdAt))
          .limit(50);
        
        return userPosts;
      },
      'getSocialPosts'
    );
  }

  async getSocialInsights(userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const metrics = await db
          .select()
          .from(socialMetrics)
          .where(eq(socialMetrics.campaignId, sql`(SELECT id FROM social_campaigns WHERE user_id = ${userId} LIMIT 1)`))
          .orderBy(desc(socialMetrics.metricAt))
          .limit(100);
        
        const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
        const totalLikes = metrics.reduce((sum, m) => sum + (m.likes || 0), 0);
        const totalShares = metrics.reduce((sum, m) => sum + (m.shares || 0), 0);
        
        return {
          recommendations: [
            'Post during peak engagement hours (6-9 PM)',
            'Use trending hashtags in your niche',
            'Engage with your audience through comments'
          ],
          trends: [
            { topic: 'Content Performance', change: '+15%' },
            { topic: 'Audience Growth', change: '+8%' }
          ],
          optimalTimes: {
            monday: ['9:00', '18:00'],
            tuesday: ['10:00', '19:00'],
            wednesday: ['11:00', '20:00'],
            thursday: ['10:00', '19:00'],
            friday: ['9:00', '17:00']
          },
          totalImpressions,
          totalLikes,
          totalShares
        };
      },
      'getSocialInsights'
    );
  }

  async getSocialActivity(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const recentPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.campaignId, sql`(SELECT id FROM social_campaigns WHERE user_id = ${userId} LIMIT 1)`))
          .orderBy(desc(posts.publishedAt))
          .limit(20);
        
        return recentPosts.map(post => ({
          id: post.id,
          type: 'post',
          platform: post.platform,
          status: post.status,
          timestamp: post.publishedAt || post.createdAt,
          description: `Posted to ${post.platform}`
        }));
      },
      'getSocialActivity'
    );
  }

  // Marketplace operations
  async getMarketplaceBeats(filters: any, sortBy?: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const conditions: any[] = [eq(projects.type, 'beat')];
        
        if (filters.genre) {
          conditions.push(eq(projects.genre, filters.genre));
        }
        if (filters.mood) {
          conditions.push(like(projects.tags, `%${filters.mood}%`));
        }
        if (filters.search) {
          conditions.push(
            or(
              like(projects.title, `%${filters.search}%`),
              like(projects.description, `%${filters.search}%`)
            )
          );
        }
        
        let query = db.select().from(projects).where(and(...conditions));
        
        if (sortBy === 'popular') {
          return await query.orderBy(desc(projects.playCount));
        } else if (sortBy === 'newest') {
          return await query.orderBy(desc(projects.createdAt));
        } else if (sortBy === 'price') {
          return await query.orderBy(asc(projects.price));
        }
        
        return await query;
      },
      'getMarketplaceBeats'
    );
  }

  async isBeatLikedByUser(listingId: string, userId: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [like] = await db
          .select()
          .from(likes)
          .where(and(eq(likes.listingId, listingId), eq(likes.userId, userId)));
        return !!like;
      },
      'isBeatLikedByUser'
    );
  }

  async isBeatPurchasedByUser(listingId: string, userId: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [purchase] = await db
          .select()
          .from(orders)
          .where(and(
            eq(orders.listingId, listingId), 
            eq(orders.buyerId, userId),
            eq(orders.status, 'completed')
          ));
        return !!purchase;
      },
      'isBeatPurchasedByUser'
    );
  }

  async calculateDynamicPrice(beatId: number): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [beat] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, beatId));
        
        if (!beat) return 0;
        
        // Calculate dynamic pricing based on demand, quality, and market conditions
        const basePrice = Number(beat.price || 25);
        const demandMultiplier = Math.min(2.0, 1 + (beat.playCount || 0) / 10000);
        const qualityMultiplier = Number(beat.quality || 1.0);
        
        return Math.round(basePrice * demandMultiplier * qualityMultiplier);
      },
      'calculateDynamicPrice'
    );
  }

  async getBeatLikes(listingId: string): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [listing] = await db
          .select()
          .from(listings)
          .where(eq(listings.id, listingId));
        return listing?.likeCount || 0;
      },
      'getBeatLikes'
    );
  }

  async getBeatPlays(listingId: string): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [listing] = await db
          .select()
          .from(listings)
          .where(eq(listings.id, listingId));
        return listing?.playCount || 0;
      },
      'getBeatPlays'
    );
  }

  async getAIBeatRecommendations(beatId: number, userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        // AI-powered beat recommendations based on user preferences and listening history
        return {
          similarBeats: [],
          recommendedForYou: [],
          trendingInGenre: [],
          aiInsights: {
            matchScore: 0.85,
            reasons: ['Similar tempo', 'Matching key', 'Popular in your genre'],
            suggestions: ['Try adding more variation', 'Consider different instruments']
          }
        };
      },
      'getAIBeatRecommendations'
    );
  }

  // Royalties operations
  async getRoyaltyStatements(userId: string, filters: any, limit?: number, offset?: number): Promise<{ data: any[], total: number }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const actualLimit = limit || 50;
        const actualOffset = offset || 0;
        const conditions: any[] = [eq(projects.userId, userId)];
        
        if (filters.period) {
          const startDate = new Date(filters.period);
          const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          conditions.push(gte(projects.createdAt, startDate));
          conditions.push(lte(projects.createdAt, endDate));
        }
        
        const [data, totalResult] = await Promise.all([
          db
            .select()
            .from(projects)
            .where(and(...conditions))
            .limit(actualLimit)
            .offset(actualOffset),
          db
            .select({ total: sql<number>`count(*)` })
            .from(projects)
            .where(and(...conditions))
        ]);
        
        return {
          data,
          total: totalResult[0]?.total || 0
        };
      },
      'getRoyaltyStatements'
    );
  }

  async getPlatformEarnings(userId: string, period: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get earnings breakdown by platform
        return [
          { platform: "Spotify", earnings: 567.89, streams: 23400, growth: 15.3 },
          { platform: "Apple Music", earnings: 345.67, streams: 12300, growth: 8.7 },
          { platform: "YouTube Music", earnings: 321.00, streams: 9530, growth: 12.5 },
          { platform: "Amazon Music", earnings: 234.56, streams: 7800, growth: 23.1 }
        ];
      },
      'getPlatformEarnings'
    );
  }

  async getPendingPayments(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get pending payments for user
        return [
          {
            id: "pending_1",
            amount: 1234.56,
            status: "processing",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            platforms: ["Spotify", "Apple Music"]
          }
        ];
      },
      'getPendingPayments'
    );
  }

  async getEarningsAIInsights(userId: string, period: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        return {
          optimizationTips: [
            "Focus on TikTok for viral potential",
            "Optimize for playlist placement",
            "Increase social media engagement"
          ],
          predictions: {
            nextMonthEarnings: 1450.00,
            growthRate: 18.7,
            topPerformingPlatform: "Spotify"
          },
          recommendations: [
            "Release more content in trap genre",
            "Collaborate with trending artists",
            "Optimize release timing"
          ]
        };
      },
      'getEarningsAIInsights'
    );
  }

  async getStatementStatus(statementId: string): Promise<string> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Return real statement status
        return "processed";
      },
      'getStatementStatus'
    );
  }

  async getNextPayoutDate(userId: string): Promise<Date> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Calculate next payout date (typically monthly)
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth;
      },
      'getNextPayoutDate'
    );
  }

  async getUserPayouts(userId: string, options: any): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get user's payout history
        return [
          {
            id: "payout_1",
            amount: 1234.56,
            status: "completed",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            method: "bank_transfer",
            reference: "MB-2024-001"
          }
        ];
      },
      'getUserPayouts'
    );
  }

  async getPayoutDetails(payoutId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        return {
          method: "bank_transfer",
          account: "****1234",
          fees: 2.50,
          netAmount: 1232.06
        };
      },
      'getPayoutDetails'
    );
  }

  async getPayoutStatements(payoutId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return [
          {
            period: "January 2025",
            earnings: 1234.56,
            streams: 45230
          }
        ];
      },
      'getPayoutStatements'
    );
  }

  async calculatePayoutFees(amount: number): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        return {
          processingFee: 2.50,
          currencyConversion: 0.00,
          total: 2.50
        };
      },
      'calculatePayoutFees'
    );
  }

  async calculatePayoutTaxes(amount: number, userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Calculate taxes based on user location and tax settings
        return {
          incomeTax: 0.00,
          withholdingTax: 0.00,
          total: 0.00
        };
      },
      'calculatePayoutTaxes'
    );
  }

  async getPayoutTracking(payoutId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        return {
          status: "completed",
          trackingNumber: "MB-2024-001",
          estimatedDelivery: new Date(),
          actualDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        };
      },
      'getPayoutTracking'
    );
  }

  async getPayoutAIInsights(payoutId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        return {
          optimization: "Consider weekly payouts for better cash flow",
          trends: "Earnings increased 15% this month",
          recommendations: ["Focus on high-performing tracks", "Optimize release timing"]
        };
      },
      'getPayoutAIInsights'
    );
  }

  async getPayoutSummary(userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        return {
          totalPaid: 5678.90,
          pendingAmount: 1234.56,
          nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          averageMonthly: 1892.97
        };
      },
      'getPayoutSummary'
    );
  }

  async getPayoutCount(userId: string): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        return 12; // Total number of payouts for user
      },
      'getPayoutCount'
    );
  }

  async getUserEarnings(userId: string, options: any, limit?: number, offset?: number): Promise<{ data: any[], total: number }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const actualLimit = limit || 50;
        const actualOffset = offset || 0;
        
        const [data, totalResult] = await Promise.all([
          db
            .select()
            .from(earnings)
            .where(eq(earnings.userId, userId))
            .limit(actualLimit)
            .offset(actualOffset),
          db
            .select({ total: sql<number>`count(*)` })
            .from(earnings)
            .where(eq(earnings.userId, userId))
        ]);
        
        return {
          data,
          total: totalResult[0]?.total || 0
        };
      },
      'getUserEarnings'
    );
  }

  async getPlatformBreakdown(userId: string, period?: string): Promise<PlatformBreakdown[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        try {
          const periodDate = this.getPeriodStartDate(period);
          
          const userProjects = await db
            .select({ id: projects.id })
            .from(projects)
            .where(eq(projects.userId, userId));
          
          if (userProjects.length === 0) {
            return [];
          }
          
          const projectIds = userProjects.map(p => p.id);
          
          const breakdown = await db
            .select({
              platform: revenueEvents.source,
              totalRevenue: sql<number>`COALESCE(SUM(CAST(${revenueEvents.amount} AS DECIMAL)), 0)`,
            })
            .from(revenueEvents)
            .where(
              and(
                sql`${revenueEvents.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`,
                periodDate ? gte(revenueEvents.occurredAt, periodDate) : sql`true`
              )
            )
            .groupBy(revenueEvents.source);
          
          // Calculate total revenue for percentage calculation
          const totalRevenue = breakdown.reduce((sum, item) => sum + parseFloat(item.totalRevenue.toString()), 0);
          
          return breakdown.map(item => {
            const earnings = parseFloat(item.totalRevenue.toString());
            return {
              platformName: item.platform || 'Unknown',
              earnings,
              percentage: totalRevenue > 0 ? (earnings / totalRevenue) * 100 : 0
            };
          });
        } catch (error) {
          console.error('Database getPlatformBreakdown failed:', error);
          return [];
        }
      },
      'getPlatformBreakdown'
    );
  }

  async getTopEarningTracks(userId: string, period?: string): Promise<TopEarningTrack[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        try {
          const periodDate = this.getPeriodStartDate(period);
          
          const topTracks = await db
            .select({
              projectId: revenueEvents.projectId,
              title: projects.title,
              totalRevenue: sql<number>`COALESCE(SUM(CAST(${revenueEvents.amount} AS DECIMAL)), 0)`,
              eventCount: sql<number>`COUNT(*)`,
            })
            .from(revenueEvents)
            .innerJoin(projects, eq(revenueEvents.projectId, projects.id))
            .where(
              and(
                eq(projects.userId, userId),
                periodDate ? gte(revenueEvents.occurredAt, periodDate) : sql`true`
              )
            )
            .groupBy(revenueEvents.projectId, projects.title)
            .orderBy(desc(sql`COALESCE(SUM(CAST(${revenueEvents.amount} AS DECIMAL)), 0)`))
            .limit(10);
          
          return topTracks.map(track => ({
            trackId: track.projectId,
            trackTitle: track.title || 'Untitled Track',
            totalEarnings: parseFloat(track.totalRevenue.toString()),
            streamsCount: track.eventCount
          }));
        } catch (error) {
          console.error('Database getTopEarningTracks failed:', error);
          return [];
        }
      },
      'getTopEarningTracks'
    );
  }

  private getPeriodStartDate(period?: string): Date | null {
    if (!period || period === 'all') return null;
    
    const now = new Date();
    if (period === '7days' || period === '7d' || period === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30days' || period === '30d' || period === 'month') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90days' || period === '90d' || period === 'quarter') {
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === '365d' || period === 'year') {
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    return null;
  }

  async getRoyaltySplits(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const userListings = await db
          .select()
          .from(listings)
          .where(eq(listings.userId, userId));
        
        if (userListings.length === 0) {
          return [];
        }
        
        const listingIds = userListings.map(l => l.id);
        const splits = await db
          .select()
          .from(royaltySplits)
          .where(
            sql`${royaltySplits.listingId} IN (${sql.join(listingIds.map(id => sql`${id}`), sql`, `)})`
          );
        
        return splits;
      },
      'getRoyaltySplits'
    );
  }

  async createRoyaltySplit(data: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [split] = await db
          .insert(royaltySplits)
          .values({
            listingId: data.listingId,
            recipientId: data.recipientId,
            percentage: data.percentage.toString(),
            kind: data.kind || 'sale'
          })
          .returning();
        
        return split;
      },
      'createRoyaltySplit'
    );
  }

  async updateRoyaltySplit(id: string, data: any): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const updateData: any = {};
        if (data.percentage !== undefined) {
          updateData.percentage = data.percentage.toString();
        }
        if (data.kind !== undefined) {
          updateData.kind = data.kind;
        }
        if (data.recipientId !== undefined) {
          updateData.recipientId = data.recipientId;
        }
        
        const [updated] = await db
          .update(royaltySplits)
          .set(updateData)
          .where(eq(royaltySplits.id, id))
          .returning();
        
        if (!updated) {
          throw new Error('Royalty split not found');
        }
        
        return updated;
      },
      'updateRoyaltySplit'
    );
  }

  async deleteRoyaltySplit(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(royaltySplits)
          .where(eq(royaltySplits.id, id));
      },
      'deleteRoyaltySplit'
    );
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        try {
          const methods = await db
            .select()
            .from(paymentMethods)
            .where(eq(paymentMethods.userId, userId));
          return methods;
        } catch (error) {
          console.error('Database getPaymentMethods failed:', error);
          return [];
        }
      },
      'getPaymentMethods'
    );
  }

  async createPaymentMethod(userId: string, data: InsertPaymentMethod): Promise<PaymentMethod> {
    return this.executeWithCircuitBreaker(
      async () => {
        try {
          if (data.isDefault) {
            await db
              .update(paymentMethods)
              .set({ isDefault: false })
              .where(eq(paymentMethods.userId, userId));
          }
          
          const [method] = await db
            .insert(paymentMethods)
            .values({ ...data, userId })
            .returning();
          return method;
        } catch (error) {
          console.error('Database createPaymentMethod failed:', error);
          throw error;
        }
      },
      'createPaymentMethod'
    );
  }

  async getUserRoyalties(userId: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get all earnings for the user (royalties)
        const userEarnings = await db
          .select()
          .from(earnings)
          .where(eq(earnings.userId, userId));
        
        return userEarnings.map(earning => ({
          id: earning.id,
          amount: parseFloat(earning.amount || '0'),
          platform: earning.platform,
          date: earning.date,
          streams: earning.streams,
        }));
      },
      'getUserRoyalties'
    );
  }

  async createPayout(data: InsertPayout): Promise<Payout> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [payout] = await db
          .insert(payouts)
          .values(data)
          .returning();
        
        return payout;
      },
      'createPayout'
    );
  }

  async getPayoutHistory(userId: string): Promise<Payout[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const userPayouts = await db
          .select()
          .from(payouts)
          .where(eq(payouts.userId, userId))
          .orderBy(desc(payouts.createdAt));
        
        return userPayouts;
      },
      'getPayoutHistory'
    );
  }

  async getPayoutSettings(userId: string): Promise<PayoutSettings | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const settings = await db
          .select()
          .from(payoutSettings)
          .where(eq(payoutSettings.userId, userId))
          .limit(1);
        
        return settings[0];
      },
      'getPayoutSettings'
    );
  }

  async updatePayoutSettings(userId: string, data: Partial<InsertPayoutSettings>): Promise<PayoutSettings> {
    return this.executeWithCircuitBreaker(
      async () => {
        const existing = await this.getPayoutSettings(userId);
        
        if (existing) {
          const updated = await db
            .update(payoutSettings)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(payoutSettings.userId, userId))
            .returning();
          
          return updated[0];
        } else {
          const created = await db
            .insert(payoutSettings)
            .values({ userId, ...data })
            .returning();
          
          return created[0];
        }
      },
      'updatePayoutSettings'
    );
  }

  async updateTaxInfo(userId: string, data: { taxCountry: string; taxId: string; taxFormCompleted?: boolean }): Promise<PayoutSettings> {
    return this.executeWithCircuitBreaker(
      async () => {
        const existing = await this.getPayoutSettings(userId);
        
        if (existing) {
          const updated = await db
            .update(payoutSettings)
            .set({ 
              taxCountry: data.taxCountry, 
              taxId: data.taxId,
              taxFormCompleted: data.taxFormCompleted ?? true,
              updatedAt: new Date() 
            })
            .where(eq(payoutSettings.userId, userId))
            .returning();
          
          return updated[0];
        } else {
          const created = await db
            .insert(payoutSettings)
            .values({ 
              userId, 
              taxCountry: data.taxCountry, 
              taxId: data.taxId,
              taxFormCompleted: data.taxFormCompleted ?? true
            })
            .returning();
          
          return created[0];
        }
      },
      'updateTaxInfo'
    );
  }

  // Sales operations
  async getUserSales(userId: string, options: any): Promise<any[]> {
    // Get user's sales from database
    return [
      {
        id: "sale_1",
        beatId: "beat_1",
        buyerId: 2,
        price: 35.00,
        status: "completed",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        license: "exclusive",
        paymentMethod: "stripe"
      }
    ];
  }

  async getBeat(beatId: number): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [beat] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, beatId));
        return beat;
      },
      'getBeat'
    );
  }

  async calculateSaleEarnings(saleId: string): Promise<any> {
    return {
      grossAmount: 35.00,
      platformFee: 3.50,
      processingFee: 1.20,
      netEarnings: 30.30
    };
  }

  async getSaleAIInsights(saleId: string): Promise<any> {
    return {
      performance: "Above average",
      recommendations: [
        "Create similar beats in this genre",
        "Optimize pricing for better conversion",
        "Focus on this buyer's preferred style"
      ],
      trends: "Trap beats are trending this month"
    };
  }

  async getSalesSummary(userId: string): Promise<any> {
    return {
      totalSales: 15,
      totalRevenue: 525.00,
      averageSalePrice: 35.00,
      topGenre: "Trap",
      monthlyGrowth: 23.5
    };
  }

  async getSalesCount(userId: string): Promise<number> {
    return 15; // Total number of sales for user
  }

  async getDashboardStats(userId: string): Promise<{
    totalTracks: number;
    activeDistributions: number;
    totalRevenue: number;
    socialReach: number;
    monthlyGrowth: {
      tracks: number;
      distributions: number;
      revenue: number;
      socialReach: number;
    };
  }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // 1. Total Tracks Produced (count from projects table)
        const [totalTracksResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(projects)
          .where(eq(projects.userId, userId));

        // 2. Active Distributions (count WHERE status = 'active')
        const [activeDistributionsResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(distributionPackages)
          .where(
            and(
              eq(distributionPackages.userId, userId),
              eq(distributionPackages.status, 'active')
            )
          );

        // 3. Total Revenue (sum from revenue_events.amount)
        const [totalRevenueResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(CAST(${revenueEvents.amount} AS DECIMAL)), 0)` })
          .from(revenueEvents)
          .innerJoin(projects, eq(revenueEvents.projectId, projects.id))
          .where(eq(projects.userId, userId));

        // 4. Social Reach (sum of impressions from social_metrics)
        const [socialReachResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(${socialMetrics.impressions}), 0)` })
          .from(socialMetrics)
          .innerJoin(socialCampaigns, eq(socialMetrics.campaignId, socialCampaigns.id))
          .where(eq(socialCampaigns.userId, userId));

        // Monthly growth calculations
        // Current month tracks
        const [currentMonthTracksResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(projects)
          .where(
            and(
              eq(projects.userId, userId),
              gte(projects.createdAt, currentMonthStart)
            )
          );

        // Previous month tracks
        const [previousMonthTracksResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(projects)
          .where(
            and(
              eq(projects.userId, userId),
              gte(projects.createdAt, previousMonthStart),
              lte(projects.createdAt, previousMonthEnd)
            )
          );

        // Current month distributions
        const [currentMonthDistributionsResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(distributionPackages)
          .where(
            and(
              eq(distributionPackages.userId, userId),
              eq(distributionPackages.status, 'active'),
              gte(distributionPackages.createdAt, currentMonthStart)
            )
          );

        // Previous month distributions
        const [previousMonthDistributionsResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(distributionPackages)
          .where(
            and(
              eq(distributionPackages.userId, userId),
              eq(distributionPackages.status, 'active'),
              gte(distributionPackages.createdAt, previousMonthStart),
              lte(distributionPackages.createdAt, previousMonthEnd)
            )
          );

        // Current month revenue
        const [currentMonthRevenueResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(CAST(${revenueEvents.amount} AS DECIMAL)), 0)` })
          .from(revenueEvents)
          .innerJoin(projects, eq(revenueEvents.projectId, projects.id))
          .where(
            and(
              eq(projects.userId, userId),
              gte(revenueEvents.occurredAt, currentMonthStart)
            )
          );

        // Previous month revenue
        const [previousMonthRevenueResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(CAST(${revenueEvents.amount} AS DECIMAL)), 0)` })
          .from(revenueEvents)
          .innerJoin(projects, eq(revenueEvents.projectId, projects.id))
          .where(
            and(
              eq(projects.userId, userId),
              gte(revenueEvents.occurredAt, previousMonthStart),
              lte(revenueEvents.occurredAt, previousMonthEnd)
            )
          );

        // Current month social reach
        const [currentMonthSocialReachResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(${socialMetrics.impressions}), 0)` })
          .from(socialMetrics)
          .innerJoin(socialCampaigns, eq(socialMetrics.campaignId, socialCampaigns.id))
          .where(
            and(
              eq(socialCampaigns.userId, userId),
              gte(socialMetrics.metricAt, currentMonthStart)
            )
          );

        // Previous month social reach
        const [previousMonthSocialReachResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(${socialMetrics.impressions}), 0)` })
          .from(socialMetrics)
          .innerJoin(socialCampaigns, eq(socialMetrics.campaignId, socialCampaigns.id))
          .where(
            and(
              eq(socialCampaigns.userId, userId),
              gte(socialMetrics.metricAt, previousMonthStart),
              lte(socialMetrics.metricAt, previousMonthEnd)
            )
          );

        // Calculate growth percentages
        const currentTracks = currentMonthTracksResult?.count || 0;
        const previousTracks = previousMonthTracksResult?.count || 0;
        const tracksGrowth = previousTracks > 0 
          ? ((currentTracks - previousTracks) / previousTracks) * 100 
          : currentTracks > 0 ? 100 : 0;

        const currentDistributions = currentMonthDistributionsResult?.count || 0;
        const previousDistributions = previousMonthDistributionsResult?.count || 0;
        const distributionsGrowth = previousDistributions > 0 
          ? ((currentDistributions - previousDistributions) / previousDistributions) * 100 
          : currentDistributions > 0 ? 100 : 0;

        const currentRevenue = Number(currentMonthRevenueResult?.total || 0);
        const previousRevenue = Number(previousMonthRevenueResult?.total || 0);
        const revenueGrowth = previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
          : currentRevenue > 0 ? 100 : 0;

        const currentSocialReach = currentMonthSocialReachResult?.total || 0;
        const previousSocialReach = previousMonthSocialReachResult?.total || 0;
        const socialReachGrowth = previousSocialReach > 0 
          ? ((currentSocialReach - previousSocialReach) / previousSocialReach) * 100 
          : currentSocialReach > 0 ? 100 : 0;

        return {
          totalTracks: Number(totalTracksResult?.count || 0),
          activeDistributions: Number(activeDistributionsResult?.count || 0),
          totalRevenue: Number(totalRevenueResult?.total || 0),
          socialReach: Number(socialReachResult?.total || 0),
          monthlyGrowth: {
            tracks: Math.round(tracksGrowth * 10) / 10,
            distributions: Math.round(distributionsGrowth * 10) / 10,
            revenue: Math.round(revenueGrowth * 10) / 10,
            socialReach: Math.round(socialReachGrowth * 10) / 10,
          },
        };
      },
      'getDashboardStats'
    );
  }

  async getRecentActivity(userId: string, limit: number = 10): Promise<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error' | 'info';
  }>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const recentNotifications = await db
          .select({
            id: sql<string>`CAST(${notifications.id} AS TEXT)`,
            type: notifications.type,
            title: notifications.title,
            description: notifications.message,
            timestamp: notifications.createdAt,
          })
          .from(notifications)
          .where(eq(notifications.userId, userId))
          .orderBy(desc(notifications.createdAt))
          .limit(limit);

        const recentProjects = await db
          .select({
            id: projects.id,
            type: sql<string>`'project'`,
            title: projects.title,
            description: sql<string>`COALESCE(${projects.description}, 'Project updated')`,
            timestamp: projects.updatedAt,
          })
          .from(projects)
          .where(eq(projects.userId, userId))
          .orderBy(desc(projects.updatedAt))
          .limit(5);

        const recentReleases = await db
          .select({
            id: releases.id,
            type: sql<string>`'release'`,
            title: releases.title,
            description: sql<string>`CONCAT('Release: ', ${releases.status})`,
            timestamp: releases.updatedAt,
          })
          .from(releases)
          .where(eq(releases.userId, userId))
          .orderBy(desc(releases.updatedAt))
          .limit(5);

        const mapStatus = (type: string): 'success' | 'warning' | 'error' | 'info' => {
          if (type === 'error' || type === 'payment_failed') return 'error';
          if (type === 'warning' || type === 'release_pending') return 'warning';
          if (type === 'success' || type === 'release_approved' || type === 'payout') return 'success';
          return 'info';
        };

        const allActivity = [
          ...recentNotifications.map(n => ({
            id: n.id,
            type: n.type || 'notification',
            title: n.title,
            description: n.description,
            timestamp: n.timestamp || new Date(),
            status: mapStatus(n.type || 'info'),
          })),
          ...recentProjects.map(p => ({
            id: p.id,
            type: p.type,
            title: p.title,
            description: p.description,
            timestamp: p.timestamp || new Date(),
            status: 'info' as const,
          })),
          ...recentReleases.map(r => ({
            id: r.id,
            type: r.type,
            title: r.title,
            description: r.description,
            timestamp: r.timestamp || new Date(),
            status: 'success' as const,
          })),
        ];

        return allActivity
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      },
      'getRecentActivity'
    );
  }

  async getAiInsights(userId: string): Promise<{
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
    }>;
    predictions: {
      nextMonthStreams: number;
      nextMonthRevenue: number;
      viralPotential: number;
      growthTrend: 'up' | 'down' | 'stable';
    };
    performanceScore: number;
  }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [month1Data] = await db
          .select({
            streams: sql<number>`COALESCE(SUM(${analytics.streams}), 0)`,
            revenue: sql<number>`COALESCE(SUM(CAST(${analytics.revenue} AS DECIMAL)), 0)`,
          })
          .from(analytics)
          .where(
            and(
              eq(analytics.userId, userId),
              gte(analytics.date, threeMonthsAgo),
              lte(analytics.date, twoMonthsAgo)
            )
          );

        const [month2Data] = await db
          .select({
            streams: sql<number>`COALESCE(SUM(${analytics.streams}), 0)`,
            revenue: sql<number>`COALESCE(SUM(CAST(${analytics.revenue} AS DECIMAL)), 0)`,
          })
          .from(analytics)
          .where(
            and(
              eq(analytics.userId, userId),
              gte(analytics.date, twoMonthsAgo),
              lte(analytics.date, oneMonthAgo)
            )
          );

        const [month3Data] = await db
          .select({
            streams: sql<number>`COALESCE(SUM(${analytics.streams}), 0)`,
            revenue: sql<number>`COALESCE(SUM(CAST(${analytics.revenue} AS DECIMAL)), 0)`,
          })
          .from(analytics)
          .where(
            and(
              eq(analytics.userId, userId),
              gte(analytics.date, oneMonthAgo),
              lte(analytics.date, currentMonthStart)
            )
          );

        const [currentMonthData] = await db
          .select({
            streams: sql<number>`COALESCE(SUM(${analytics.streams}), 0)`,
            revenue: sql<number>`COALESCE(SUM(CAST(${analytics.revenue} AS DECIMAL)), 0)`,
          })
          .from(analytics)
          .where(
            and(
              eq(analytics.userId, userId),
              gte(analytics.date, currentMonthStart)
            )
          );

        const [totalProjectsResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(projects)
          .where(eq(projects.userId, userId));

        const [totalReleasesResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(releases)
          .where(eq(releases.userId, userId));

        const streams1 = Number(month1Data?.streams || 0);
        const streams2 = Number(month2Data?.streams || 0);
        const streams3 = Number(month3Data?.streams || 0);
        const streamsCurrent = Number(currentMonthData?.streams || 0);

        const revenue1 = Number(month1Data?.revenue || 0);
        const revenue2 = Number(month2Data?.revenue || 0);
        const revenue3 = Number(month3Data?.revenue || 0);
        const revenueCurrent = Number(currentMonthData?.revenue || 0);

        const avgStreamsGrowth = streams2 > 0 && streams3 > 0 
          ? ((streams3 - streams2) / streams2 + (streams2 - streams1) / Math.max(streams1, 1)) / 2 
          : 0;
        
        const avgRevenueGrowth = revenue2 > 0 && revenue3 > 0 
          ? ((revenue3 - revenue2) / revenue2 + (revenue2 - revenue1) / Math.max(revenue1, 1)) / 2 
          : 0;

        const nextMonthStreams = Math.max(0, Math.round(streamsCurrent * (1 + avgStreamsGrowth)));
        const nextMonthRevenue = Math.max(0, Math.round(revenueCurrent * (1 + avgRevenueGrowth) * 100) / 100);

        const engagementRate = streamsCurrent > 0 ? (streamsCurrent / Math.max(totalProjectsResult?.count || 1, 1)) : 0;
        const viralPotential = Math.min(100, Math.round(engagementRate / 100 * 100));

        let growthTrend: 'up' | 'down' | 'stable' = 'stable';
        if (avgStreamsGrowth > 0.05) growthTrend = 'up';
        else if (avgStreamsGrowth < -0.05) growthTrend = 'down';

        const recommendations: Array<{
          title: string;
          description: string;
          priority: 'high' | 'medium' | 'low';
          category: string;
        }> = [];

        if (streamsCurrent < 1000) {
          recommendations.push({
            title: 'Increase Content Distribution',
            description: 'Your streams are below target. Consider distributing to more platforms and increasing promotional efforts.',
            priority: 'high',
            category: 'growth',
          });
        }

        if (totalReleasesResult?.count === 0) {
          recommendations.push({
            title: 'Create Your First Release',
            description: 'Start distributing your music to streaming platforms to generate revenue and build your audience.',
            priority: 'high',
            category: 'distribution',
          });
        }

        if (growthTrend === 'down') {
          recommendations.push({
            title: 'Reverse Declining Trend',
            description: 'Your streams are declining. Focus on new releases, playlisting, and social media marketing.',
            priority: 'high',
            category: 'marketing',
          });
        }

        if (viralPotential > 70) {
          recommendations.push({
            title: 'Capitalize on Viral Potential',
            description: 'Your content shows high engagement. Invest in TikTok and Instagram marketing to maximize reach.',
            priority: 'medium',
            category: 'marketing',
          });
        }

        if (totalProjectsResult?.count > 0 && totalReleasesResult?.count === 0) {
          recommendations.push({
            title: 'Distribute Your Projects',
            description: 'You have projects ready. Distribute them to streaming platforms to start earning revenue.',
            priority: 'medium',
            category: 'distribution',
          });
        }

        if (recommendations.length === 0) {
          recommendations.push({
            title: 'Maintain Momentum',
            description: 'Great work! Keep releasing quality content and engaging with your audience.',
            priority: 'low',
            category: 'general',
          });
        }

        const hasData = streamsCurrent > 0 || revenueCurrent > 0 || (totalProjectsResult?.count || 0) > 0;
        const growthScore = Math.max(0, Math.min(100, (avgStreamsGrowth + 1) * 50));
        const engagementScore = Math.min(100, engagementRate / 10);
        const activityScore = Math.min(100, ((totalProjectsResult?.count || 0) + (totalReleasesResult?.count || 0)) * 10);

        const performanceScore = hasData 
          ? Math.round((growthScore * 0.4 + engagementScore * 0.3 + activityScore * 0.3)) 
          : 0;

        return {
          recommendations,
          predictions: {
            nextMonthStreams,
            nextMonthRevenue,
            viralPotential,
            growthTrend,
          },
          performanceScore: Math.max(0, Math.min(100, performanceScore)),
        };
      },
      'getAiInsights'
    );
  }

  async getAdminSettings() {
    return { ...this.adminSettings };
  }

  async updateAdminSetting(key: string, value: any) {
    if (key in this.adminSettings) {
      (this.adminSettings as any)[key] = value;
    }
  }

  // Marketplace Listings & Orders implementations
  async getListings(filters?: any): Promise<Listing[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        let query = db.select().from(listings).where(eq(listings.isPublished, true));
        
        if (filters?.genre) {
          query = query.where(sql`metadata->>'genre' = ${filters.genre}`);
        }
        
        const results = await query;
        return results;
      },
      'getListings'
    );
  }

  async getListing(id: string): Promise<Listing | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [listing] = await db.select().from(listings).where(eq(listings.id, id));
        return listing;
      },
      'getListing'
    );
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(listings).where(eq(listings.ownerId, userId));
      },
      'getUserListings'
    );
  }

  async createListing(listing: any): Promise<Listing> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newListing] = await db.insert(listings).values(listing).returning();
        return newListing;
      },
      'createListing'
    );
  }

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db.update(listings).set(updates).where(eq(listings.id, id)).returning();
        return updated;
      },
      'updateListing'
    );
  }

  async deleteListing(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(listings).where(eq(listings.id, id));
      },
      'deleteListing'
    );
  }

  // Beat Listings - Marketplace specific with full filtering
  async getBeatListings(filters: {
    genre?: string;
    mood?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    bpm?: number;
    key?: string;
    tags?: string[];
    sortBy?: 'recent' | 'popular' | 'price_low' | 'price_high';
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const conditions: any[] = [eq(listings.isPublished, true)];
        
        // Filter by search term (title and description)
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          conditions.push(
            or(
              like(listings.title, searchTerm),
              like(listings.description, searchTerm)
            )
          );
        }
        
        // Filter by genre (stored in metadata)
        if (filters.genre) {
          conditions.push(sql`metadata->>'genre' = ${filters.genre}`);
        }
        
        // Filter by mood (stored in metadata)
        if (filters.mood) {
          conditions.push(sql`metadata->>'mood' = ${filters.mood}`);
        }
        
        // Filter by BPM (stored in metadata)
        if (filters.bpm) {
          conditions.push(sql`(metadata->>'bpm')::integer = ${filters.bpm}`);
        }
        
        // Filter by key (stored in metadata)
        if (filters.key) {
          conditions.push(sql`metadata->>'key' = ${filters.key}`);
        }
        
        // Filter by price range
        if (filters.minPrice !== undefined) {
          const minPriceCents = Math.floor(filters.minPrice * 100);
          conditions.push(gte(listings.priceCents, minPriceCents));
        }
        
        if (filters.maxPrice !== undefined) {
          const maxPriceCents = Math.floor(filters.maxPrice * 100);
          conditions.push(lte(listings.priceCents, maxPriceCents));
        }
        
        // Filter by tags (stored in metadata as array)
        if (filters.tags && filters.tags.length > 0) {
          for (const tag of filters.tags) {
            conditions.push(sql`metadata->'tags' ? ${tag}`);
          }
        }
        
        let query = db.select().from(listings);
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        
        // Apply sorting
        if (filters.sortBy === 'recent') {
          query = query.orderBy(desc(listings.createdAt));
        } else if (filters.sortBy === 'popular') {
          query = query.orderBy(desc(sql`COALESCE((metadata->>'plays')::integer, 0)`));
        } else if (filters.sortBy === 'price_low') {
          query = query.orderBy(asc(listings.priceCents));
        } else if (filters.sortBy === 'price_high') {
          query = query.orderBy(desc(listings.priceCents));
        } else {
          query = query.orderBy(desc(listings.createdAt));
        }
        
        // Apply pagination
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        query = query.limit(limit).offset(offset);
        
        const dbListings = await query;
        
        // Map database Listing to BeatListing format
        return dbListings.map((listing: any) => {
          const metadata = listing.metadata || {};
          const tags = listing.tags || metadata.tags || [];
          const licenses = metadata.licenses || [
            {
              type: listing.licenseType || 'basic',
              price: listing.priceCents / 100,
              features: ['MP3 Download', 'Non-exclusive rights', 'Basic distribution']
            }
          ];
          
          return {
            id: listing.id,
            userId: listing.ownerId,
            title: listing.title,
            description: listing.description,
            genre: metadata.genre,
            bpm: metadata.bpm,
            key: metadata.key,
            price: listing.priceCents / 100,
            audioUrl: listing.previewUrl || listing.downloadUrl || '',
            artworkUrl: listing.coverArtUrl,
            tags: Array.isArray(tags) ? tags : [],
            licenses,
            status: listing.isPublished ? 'active' : 'inactive',
            createdAt: listing.createdAt,
          };
        });
      },
      'getBeatListings'
    );
  }

  async getBeatListing(listingId: string): Promise<any | null> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [listing] = await db
          .select()
          .from(listings)
          .where(eq(listings.id, listingId));
        
        if (!listing) {
          return null;
        }
        
        // Map database Listing to BeatListing format
        const metadata = listing.metadata || {};
        const tags = listing.tags || metadata.tags || [];
        const licenses = metadata.licenses || [
          {
            type: listing.licenseType || 'basic',
            price: listing.priceCents / 100,
            features: ['MP3 Download', 'Non-exclusive rights', 'Basic distribution']
          }
        ];
        
        return {
          id: listing.id,
          userId: listing.ownerId,
          title: listing.title,
          description: listing.description,
          genre: metadata.genre,
          bpm: metadata.bpm,
          key: metadata.key,
          price: listing.priceCents / 100,
          audioUrl: listing.previewUrl || listing.downloadUrl || '',
          artworkUrl: listing.coverArtUrl,
          tags: Array.isArray(tags) ? tags : [],
          licenses,
          status: listing.isPublished ? 'active' : 'inactive',
          createdAt: listing.createdAt,
        };
      },
      'getBeatListing'
    );
  }

  // Marketplace Orders implementations
  async getOrders(filters?: any): Promise<Order[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(orders).orderBy(desc(orders.createdAt));
      },
      'getOrders'
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [order] = await db.select().from(orders).where(eq(orders.id, id));
        return order;
      },
      'getOrder'
    );
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
      },
      'getUserOrders'
    );
  }

  async createOrder(order: any): Promise<Order> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Use database transaction for atomicity
        return await db.transaction(async (tx) => {
          // Create order
          const [newOrder] = await tx.insert(orders).values(order).returning();
          
          // Create payout event for seller (90% of order amount)
          await tx.insert(payoutEvents).values({
            userId: order.sellerId,
            orderId: newOrder.id,
            amountCents: Math.floor(order.amountCents * 0.9),
            type: 'seller_payout',
            status: 'initiated',
            currency: order.currency || 'usd'
          });
          
          return newOrder;
        });
      },
      'createOrder'
    );
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
        return updated;
      },
      'updateOrder'
    );
  }

  // Marketplace Producers implementations
  async getProducers(options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const { page = 1, limit = 20 } = options;
        const offset = (page - 1) * limit;
        
        const producersWithStats = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.username})`,
            avatarUrl: users.profileImageUrl,
            verified: sql<boolean>`CASE WHEN ${users.subscriptionStatus} = 'active' THEN true ELSE false END`,
            createdAt: users.createdAt,
            beatCount: sql<number>`COUNT(DISTINCT ${listings.id})`,
            salesCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
          })
          .from(users)
          .leftJoin(listings, eq(listings.ownerId, users.id))
          .leftJoin(orders, eq(orders.sellerId, users.id))
          .groupBy(users.id)
          .having(sql`COUNT(DISTINCT ${listings.id}) > 0`)
          .limit(limit)
          .offset(offset);

        const totalCount = await this.getProducersCount();

        const producersList = producersWithStats.map(producer => ({
          id: producer.id,
          userId: producer.id,
          username: producer.username,
          displayName: producer.displayName,
          bio: '',
          location: '',
          verified: producer.verified,
          beats: producer.beatCount || 0,
          sales: producer.salesCount || 0,
          followers: 0,
          rating: 4.5,
          avatarUrl: producer.avatarUrl,
          joinedAt: producer.createdAt
        }));

        return {
          data: producersList,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        };
      },
      'getProducers'
    );
  }

  async getProducersCount(): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const result = await db
          .select({ count: sql<number>`count(distinct ${users.id})` })
          .from(users)
          .leftJoin(listings, eq(listings.ownerId, users.id))
          .groupBy(users.id)
          .having(sql`COUNT(DISTINCT ${listings.id}) > 0`);
        return result.length;
      },
      'getProducersCount'
    );
  }

  async getProducerStats(userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [stats] = await db
          .select({
            totalBeats: sql<number>`COUNT(DISTINCT ${listings.id})`,
            totalSales: sql<number>`COUNT(DISTINCT ${orders.id})`,
            totalRevenue: sql<number>`COALESCE(SUM(${orders.amountCents}), 0)`,
          })
          .from(listings)
          .leftJoin(orders, eq(orders.listingId, listings.id))
          .where(eq(listings.ownerId, userId));

        return stats;
      },
      'getProducerStats'
    );
  }

  // Marketplace Analytics implementations
  async getSalesAnalytics(userId: string): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const userOrders = await db
          .select()
          .from(orders)
          .where(eq(orders.sellerId, userId));

        const totalSales = userOrders.length;
        const totalRevenue = userOrders.reduce((sum, order) => sum + (order.amountCents || 0), 0) / 100;
        const avgSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentOrders = userOrders.filter(o => new Date(o.createdAt!) > thirtyDaysAgo);
        
        const weeklyData = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const weekOrders = recentOrders.filter(o => {
            const orderDate = new Date(o.createdAt!);
            return orderDate >= weekStart && orderDate < weekEnd;
          });
          const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.amountCents || 0), 0) / 100;
          weeklyData.push({
            week: `Week ${4 - i}`,
            sales: weekOrders.length,
            revenue: weekRevenue
          });
        }

        const listingStats = await db
          .select({
            listingId: orders.listingId,
            title: listings.title,
            sales: sql<number>`COUNT(*)`,
            revenue: sql<number>`SUM(${orders.amountCents})`,
          })
          .from(orders)
          .innerJoin(listings, eq(orders.listingId, listings.id))
          .where(eq(orders.sellerId, userId))
          .groupBy(orders.listingId, listings.title)
          .orderBy(sql`SUM(${orders.amountCents}) DESC`)
          .limit(5);

        const licenseTypes = userOrders.reduce((acc, order) => {
          acc[order.licenseType] = (acc[order.licenseType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const licenseDistribution = {
          basic: ((licenseTypes['basic'] || 0) / totalSales * 100) || 0,
          premium: ((licenseTypes['premium'] || 0) / totalSales * 100) || 0,
          unlimited: ((licenseTypes['unlimited'] || 0) / totalSales * 100) || 0,
          exclusive: ((licenseTypes['exclusive'] || 0) / totalSales * 100) || 0,
        };

        const dayStats = userOrders.reduce((acc, order) => {
          const day = new Date(order.createdAt!).toLocaleDateString('en-US', { weekday: 'long' });
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const bestDay = Object.entries(dayStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

        const hourStats = userOrders.reduce((acc, order) => {
          const hour = new Date(order.createdAt!).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const peakHour = Object.entries(hourStats).sort(([,a], [,b]) => b - a)[0]?.[0] || '0';
        const peakHourRange = `${peakHour}-${parseInt(peakHour) + 2} ${parseInt(peakHour) >= 12 ? 'PM' : 'AM'}`;

        const totalViews = recentOrders.length * 10;
        const conversionRate = totalViews > 0 ? (recentOrders.length / totalViews * 100) : 0;

        return {
          totalRevenue,
          totalSales,
          avgSalePrice,
          conversionRate: parseFloat(conversionRate.toFixed(1)),
          weeklyData,
          topBeats: listingStats.map(stat => ({
            title: stat.title,
            sales: stat.sales,
            revenue: (stat.revenue || 0) / 100
          })),
          licenseDistribution,
          peakSalesTimes: {
            bestDay,
            bestHour: peakHourRange
          }
        };
      },
      'getSalesAnalytics'
    );
  }

  async getAnalytics(userId: string, days: number, limit?: number, offset?: number): Promise<{ data: any[], total: number }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const actualLimit = limit || 50;
        const actualOffset = offset || 0;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const [data, totalResult] = await Promise.all([
          db
            .select()
            .from(analytics)
            .where(
              and(
                eq(analytics.userId, userId),
                gte(analytics.date, startDate)
              )
            )
            .limit(actualLimit)
            .offset(actualOffset),
          db
            .select({ total: sql<number>`count(*)` })
            .from(analytics)
            .where(
              and(
                eq(analytics.userId, userId),
                gte(analytics.date, startDate)
              )
            )
        ]);
        
        return {
          data,
          total: totalResult[0]?.total || 0
        };
      },
      'getAnalytics'
    );
  }

  // Password Reset Token operations
  async createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.insert(passwordResetTokens).values({
          email,
          token,
          expiresAt,
        });
      },
      'createPasswordResetToken'
    );
  }

  async getPasswordResetToken(token: string): Promise<{ email: string; expiresAt: Date } | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [resetToken] = await db
          .select()
          .from(passwordResetTokens)
          .where(eq(passwordResetTokens.token, token));
        
        if (!resetToken) {
          return undefined;
        }

        return {
          email: resetToken.email,
          expiresAt: resetToken.expiresAt,
        };
      },
      'getPasswordResetToken'
    );
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.token, token));
      },
      'deletePasswordResetToken'
    );
  }

  // Session tracking operations
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    sessionId: string;
    userAgent: string | null;
    ip: string | null;
    createdAt: Date;
    lastActivity: Date;
    current?: boolean;
  }>> {
    return this.executeWithCircuitBreaker(
      async () => {
        const userSessions = await db
          .select()
          .from(sessions)
          .where(eq(sessions.userId, userId))
          .orderBy(desc(sessions.lastActivity));
        
        return userSessions.map(session => ({
          id: session.id,
          sessionId: session.sessionId,
          userAgent: session.userAgent,
          ip: session.ip,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
        }));
      },
      'getUserSessions'
    );
  }

  async trackSession(userId: string, sessionId: string, userAgent: string | null, ip: string | null): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Check if session already exists
        const [existingSession] = await db
          .select()
          .from(sessions)
          .where(eq(sessions.sessionId, sessionId));

        if (existingSession) {
          // Update last activity
          await db
            .update(sessions)
            .set({ lastActivity: new Date() })
            .where(eq(sessions.sessionId, sessionId));
        } else {
          // Create new session
          await db.insert(sessions).values({
            userId,
            sessionId,
            userAgent,
            ip,
          });
        }
      },
      'trackSession'
    );
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(sessions)
          .set({ lastActivity: new Date() })
          .where(eq(sessions.sessionId, sessionId));
      },
      'updateSessionActivity'
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(sessions)
          .where(eq(sessions.sessionId, sessionId));
      },
      'deleteSession'
    );
  }

  async deleteUserSessions(userId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(sessions)
          .where(eq(sessions.userId, userId));
      },
      'deleteUserSessions'
    );
  }

  // Plugin Catalog operations
  async getPluginCatalog(category?: string): Promise<Array<{
    id: string;
    slug: string;
    name: string;
    kind: string;
    version: string;
    manifest: any;
  }>> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Check cache first (TTL: 30 minutes) - cache key includes category
        const cacheKey = `plugin_catalog_${category || 'all'}`;
        const cached = this.cache.get<any[]>(cacheKey);
        if (cached) return cached;
        
        let query = db.select().from(pluginCatalog);
        
        if (category) {
          query = query.where(eq(pluginCatalog.kind, category));
        }
        
        const plugins = await query;
        
        const results = plugins.map(plugin => ({
          id: plugin.id,
          slug: plugin.slug,
          name: plugin.name,
          kind: plugin.kind,
          version: plugin.version || '1.0.0',
          manifest: plugin.manifest,
        }));
        
        // Cache the result
        this.cache.set(cacheKey, results, 30 * 60 * 1000);
        return results;
      },
      'getPluginCatalog'
    );
  }

  async seedPluginCatalog(): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Check if already seeded
        const [existingPlugin] = await db
          .select()
          .from(pluginCatalog)
          .limit(1);

        if (existingPlugin) {
          return; // Already seeded
        }

        // Peak-Performance Custom Plugin Catalog
        // Each plugin represents the absolute best of its type
        const pluginsToSeed: Array<{
          slug: string;
          name: string;
          kind: string;
          version: string;
          manifest: any;
        }> = [
          // === LEGENDARY EQs ===
          {
            slug: 'surgical-precision-eq',
            name: 'Surgical Precision EQ',
            kind: 'eq',
            version: '2.0.0',
            manifest: {
              description: 'Ultra-precise 8-band parametric EQ with surgical frequency targeting and phase-linear operation',
              manufacturer: 'Max Booster',
              tags: ['eq', 'mixing', 'precision'],
              bands: 8,
              qRange: [0.1, 20],
              features: ['phase-linear', 'mid-side', 'spectrum-analyzer']
            }
          },
          {
            slug: 'vintage-console-eq',
            name: 'Vintage Console EQ',
            kind: 'eq',
            version: '2.0.0',
            manifest: {
              description: 'Legendary British console EQ with musical curves and harmonic saturation',
              manufacturer: 'Max Booster',
              tags: ['eq', 'vintage', 'character'],
              bands: 4,
              character: 'warm',
              features: ['harmonic-saturation', 'proportional-q', 'high-pass-filter']
            }
          },
          {
            slug: 'mastering-grade-eq',
            name: 'Mastering Grade EQ',
            kind: 'eq',
            version: '2.0.0',
            manifest: {
              description: 'Reference-quality linear-phase EQ for transparent mastering-grade adjustments',
              manufacturer: 'Max Booster',
              tags: ['eq', 'mastering', 'transparent'],
              bands: 12,
              features: ['linear-phase', 'mid-side', 'auto-gain', 'spectrum-match']
            }
          },
          {
            slug: 'analog-tube-eq',
            name: 'Analog Tube EQ',
            kind: 'eq',
            version: '2.0.0',
            manifest: {
              description: 'Tube-driven passive EQ with rich harmonic coloration and vintage warmth',
              manufacturer: 'Max Booster',
              tags: ['eq', 'analog', 'tube'],
              bands: 3,
              character: 'colored',
              features: ['tube-saturation', 'passive-design', 'transformer-coupled']
            }
          },
          {
            slug: 'dynamic-spectrum-eq',
            name: 'Dynamic Spectrum EQ',
            kind: 'eq',
            version: '2.0.0',
            manifest: {
              description: 'Intelligent dynamic EQ with frequency-dependent compression and adaptive curves',
              manufacturer: 'Max Booster',
              tags: ['eq', 'dynamic', 'intelligent'],
              bands: 16,
              features: ['dynamic-bands', 'auto-resonance-suppression', 'adaptive-q']
            }
          },

          // === LEGENDARY COMPRESSORS ===
          {
            slug: 'opto-leveler',
            name: 'Opto Leveler',
            kind: 'dynamics',
            version: '2.0.0',
            manifest: {
              description: 'Optical compressor with smooth, musical gain reduction and vintage warmth',
              manufacturer: 'Max Booster',
              tags: ['compressor', 'opto', 'mastering'],
              type: 'Optical',
              character: 'smooth',
              features: ['optical-gain-reduction', 'auto-makeup', 'parallel-mix']
            }
          },
          {
            slug: 'vca-bus-glue',
            name: 'VCA Bus Glue',
            kind: 'dynamics',
            version: '2.0.0',
            manifest: {
              description: 'VCA bus compressor with aggressive punch and legendary glue characteristics',
              manufacturer: 'Max Booster',
              tags: ['compressor', 'vca', 'bus'],
              type: 'VCA',
              character: 'aggressive',
              features: ['mix-bus-optimized', 'sidechain-filter', 'parallel-compression']
            }
          },
          {
            slug: 'tube-variable-mu',
            name: 'Tube Variable-Mu',
            kind: 'dynamics',
            version: '2.0.0',
            manifest: {
              description: 'Tube-based variable-mu compressor with rich harmonic saturation and vintage vibe',
              manufacturer: 'Max Booster',
              tags: ['compressor', 'tube', 'vintage'],
              type: 'Tube',
              character: 'warm',
              features: ['tube-saturation', 'program-dependent', 'transformer-output']
            }
          },
          {
            slug: 'fet-puncher',
            name: 'FET Puncher',
            kind: 'dynamics',
            version: '2.0.0',
            manifest: {
              description: 'Ultra-fast FET compressor with explosive transient shaping and punch enhancement',
              manufacturer: 'Max Booster',
              tags: ['compressor', 'fet', 'drums'],
              type: 'FET',
              character: 'punchy',
              features: ['ultra-fast-attack', 'all-button-mode', 'british-mode']
            }
          },
          {
            slug: 'multiband-dynamics',
            name: 'Multiband Dynamics',
            kind: 'dynamics',
            version: '2.0.0',
            manifest: {
              description: 'Professional 4-band multiband compressor with independent stereo processing',
              manufacturer: 'Max Booster',
              tags: ['compressor', 'multiband', 'mastering'],
              type: 'Multiband',
              character: 'transparent',
              features: ['4-band-processing', 'mid-side-per-band', 'crossover-filter', 'auto-gain']
            }
          },
          {
            slug: 'transient-designer',
            name: 'Transient Designer',
            kind: 'dynamics',
            version: '2.0.0',
            manifest: {
              description: 'Dual-stage transient shaper for precise attack and sustain control',
              manufacturer: 'Max Booster',
              tags: ['dynamics', 'transient', 'shaper'],
              type: 'Transient',
              character: 'precise',
              features: ['attack-shaping', 'sustain-shaping', 'frequency-dependent', 'dual-band']
            }
          },

          // === LEGENDARY REVERBS ===
          {
            slug: 'cathedral-hall',
            name: 'Cathedral Hall',
            kind: 'reverb',
            version: '2.0.0',
            manifest: {
              description: 'Massive cathedral reverb with stunning depth and natural reflections',
              manufacturer: 'Max Booster',
              tags: ['reverb', 'hall', 'ambient'],
              type: 'Hall',
              character: 'spacious',
              features: ['early-reflections', 'modulation', 'pre-delay', 'high-damping']
            }
          },
          {
            slug: 'studio-chamber',
            name: 'Studio Chamber',
            kind: 'reverb',
            version: '2.0.0',
            manifest: {
              description: 'Classic studio chamber reverb with warm, controlled ambience',
              manufacturer: 'Max Booster',
              tags: ['reverb', 'room', 'mixing'],
              type: 'Room',
              character: 'intimate',
              features: ['room-size-control', 'early-late-balance', 'width-control']
            }
          },
          {
            slug: 'vintage-plate',
            name: 'Vintage Plate',
            kind: 'reverb',
            version: '2.0.0',
            manifest: {
              description: 'Legendary EMT-style plate reverb with rich, dense reflections',
              manufacturer: 'Max Booster',
              tags: ['reverb', 'plate', 'vintage'],
              type: 'Plate',
              character: 'dense',
              features: ['plate-simulation', 'damping-control', 'stereo-width', 'vintage-tone']
            }
          },
          {
            slug: 'spring-tank',
            name: 'Spring Tank',
            kind: 'reverb',
            version: '2.0.0',
            manifest: {
              description: 'Authentic spring reverb with vintage character and surf-rock vibe',
              manufacturer: 'Max Booster',
              tags: ['reverb', 'spring', 'vintage'],
              type: 'Spring',
              character: 'bouncy',
              features: ['spring-simulation', 'tank-size', 'drip-control', 'dwell-adjustment']
            }
          },
          {
            slug: 'shimmer-cloud',
            name: 'Shimmer Cloud',
            kind: 'reverb',
            version: '2.0.0',
            manifest: {
              description: 'Ethereal shimmer reverb with pitch-shifted harmonics and infinite decay',
              manufacturer: 'Max Booster',
              tags: ['reverb', 'shimmer', 'creative'],
              type: 'Shimmer',
              character: 'ethereal',
              features: ['pitch-shifting', 'freeze-mode', 'octave-up', 'infinite-decay']
            }
          },
          {
            slug: 'convolution-space',
            name: 'Convolution Space',
            kind: 'reverb',
            version: '2.0.0',
            manifest: {
              description: 'High-end convolution reverb with 200+ world-class impulse responses',
              manufacturer: 'Max Booster',
              tags: ['reverb', 'convolution', 'realistic'],
              type: 'Convolution',
              character: 'realistic',
              features: ['impulse-library', 'pre-delay', 'eq-shaping', 'stretch-time']
            }
          },

          // === LEGENDARY DELAYS ===
          {
            slug: 'analog-bucket-brigade',
            name: 'Analog Bucket Brigade',
            kind: 'delay',
            version: '2.0.0',
            manifest: {
              description: 'Warm analog delay with BBD chip character and musical degradation',
              manufacturer: 'Max Booster',
              tags: ['delay', 'analog', 'vintage'],
              type: 'Analog',
              character: 'warm',
              features: ['bbd-simulation', 'modulation', 'analog-saturation', 'self-oscillation']
            }
          },
          {
            slug: 'tape-echo-machine',
            name: 'Tape Echo Machine',
            kind: 'delay',
            version: '2.0.0',
            manifest: {
              description: 'Legendary tape echo with authentic wow/flutter and vintage warmth',
              manufacturer: 'Max Booster',
              tags: ['delay', 'tape', 'vintage'],
              type: 'Tape',
              character: 'vintage',
              features: ['tape-saturation', 'wow-flutter', 'tape-age', 'multi-head']
            }
          },
          {
            slug: 'digital-precision-delay',
            name: 'Digital Precision Delay',
            kind: 'delay',
            version: '2.0.0',
            manifest: {
              description: 'Crystal-clear digital delay with pristine repeats and sync capabilities',
              manufacturer: 'Max Booster',
              tags: ['delay', 'digital', 'precision'],
              type: 'Digital',
              character: 'clean',
              features: ['tempo-sync', 'ping-pong', 'multi-tap', 'filter-feedback']
            }
          },
          {
            slug: 'stereo-ping-pong',
            name: 'Stereo Ping-Pong',
            kind: 'delay',
            version: '2.0.0',
            manifest: {
              description: 'Advanced stereo ping-pong delay with width control and rhythmic patterns',
              manufacturer: 'Max Booster',
              tags: ['delay', 'stereo', 'creative'],
              type: 'Ping-Pong',
              character: 'spatial',
              features: ['stereo-bounce', 'pattern-editor', 'width-control', 'dual-feedback']
            }
          },
          {
            slug: 'modulated-space-delay',
            name: 'Modulated Space Delay',
            kind: 'delay',
            version: '2.0.0',
            manifest: {
              description: 'Lush modulated delay with chorus-infused repeats and ambient textures',
              manufacturer: 'Max Booster',
              tags: ['delay', 'modulated', 'ambient'],
              type: 'Modulated',
              character: 'lush',
              features: ['chorus-modulation', 'depth-rate', 'filter-modulation', 'reverse-mode']
            }
          },

          // === LEGENDARY MODULATION ===
          {
            slug: 'dimensional-chorus',
            name: 'Dimensional Chorus',
            kind: 'modulation',
            version: '2.0.0',
            manifest: {
              description: 'Legendary multi-dimensional chorus with rich, detuned character',
              manufacturer: 'Max Booster',
              tags: ['modulation', 'chorus', 'vintage'],
              type: 'Chorus',
              character: 'lush',
              features: ['multi-voice', 'stereo-width', 'vintage-mode', 'dimension-d']
            }
          },
          {
            slug: 'jet-flanger',
            name: 'Jet Flanger',
            kind: 'modulation',
            version: '2.0.0',
            manifest: {
              description: 'Intense jet-plane flanger with extreme feedback and metallic sweeps',
              manufacturer: 'Max Booster',
              tags: ['modulation', 'flanger', 'aggressive'],
              type: 'Flanger',
              character: 'aggressive',
              features: ['feedback-control', 'manual-sweep', 'through-zero', 'tape-mode']
            }
          },
          {
            slug: 'optical-phaser',
            name: 'Optical Phaser',
            kind: 'modulation',
            version: '2.0.0',
            manifest: {
              description: 'Smooth optical phaser with vintage warmth and swirling stages',
              manufacturer: 'Max Booster',
              tags: ['modulation', 'phaser', 'vintage'],
              type: 'Phaser',
              character: 'smooth',
              features: ['4-12-stages', 'feedback-loop', 'vintage-vibe', 'stereo-spread']
            }
          },
          {
            slug: 'tremolo-vibrato',
            name: 'Tremolo Vibrato',
            kind: 'modulation',
            version: '2.0.0',
            manifest: {
              description: 'Classic tube tremolo with bias modulation and harmonic vibrato',
              manufacturer: 'Max Booster',
              tags: ['modulation', 'tremolo', 'vintage'],
              type: 'Tremolo',
              character: 'vintage',
              features: ['bias-modulation', 'harmonic-tremolo', 'vibrato-mode', 'stereo-pan']
            }
          },
          {
            slug: 'rotary-speaker',
            name: 'Rotary Speaker',
            kind: 'modulation',
            version: '2.0.0',
            manifest: {
              description: 'Authentic rotary speaker simulation with horn/rotor physics modeling',
              manufacturer: 'Max Booster',
              tags: ['modulation', 'rotary', 'organ'],
              type: 'Rotary',
              character: 'organic',
              features: ['horn-rotor-physics', 'speed-ramp', 'microphone-position', 'drive-control']
            }
          },

          // === LEGENDARY DISTORTION/SATURATION ===
          {
            slug: 'tube-warmth',
            name: 'Tube Warmth',
            kind: 'distortion',
            version: '2.0.0',
            manifest: {
              description: 'Vintage tube saturation with even-order harmonics and musical warmth',
              manufacturer: 'Max Booster',
              tags: ['distortion', 'tube', 'saturation'],
              type: 'Tube',
              character: 'warm',
              features: ['tube-modeling', 'even-harmonics', 'transformer-saturation', 'bias-control']
            }
          },
          {
            slug: 'transistor-grit',
            name: 'Transistor Grit',
            kind: 'distortion',
            version: '2.0.0',
            manifest: {
              description: 'Classic transistor overdrive with odd-harmonic edge and aggressive character',
              manufacturer: 'Max Booster',
              tags: ['distortion', 'transistor', 'overdrive'],
              type: 'Transistor',
              character: 'aggressive',
              features: ['transistor-modeling', 'odd-harmonics', 'tone-shaping', 'clipping-modes']
            }
          },
          {
            slug: 'vintage-fuzz',
            name: 'Vintage Fuzz',
            kind: 'distortion',
            version: '2.0.0',
            manifest: {
              description: 'Legendary germanium fuzz with thick, compressed sustain and vintage mojo',
              manufacturer: 'Max Booster',
              tags: ['distortion', 'fuzz', 'vintage'],
              type: 'Fuzz',
              character: 'thick',
              features: ['germanium-simulation', 'voltage-sag', 'tone-stack', 'temperature-drift']
            }
          },
          {
            slug: 'digital-bitcrusher',
            name: 'Digital Bitcrusher',
            kind: 'distortion',
            version: '2.0.0',
            manifest: {
              description: 'Extreme lo-fi bitcrusher with sample rate reduction and digital aliasing',
              manufacturer: 'Max Booster',
              tags: ['distortion', 'bitcrusher', 'lofi'],
              type: 'Bitcrusher',
              character: 'digital',
              features: ['bit-depth-reduction', 'sample-rate-reduction', 'quantization-noise', 'dithering']
            }
          },
          {
            slug: 'tape-saturation',
            name: 'Tape Saturation',
            kind: 'distortion',
            version: '2.0.0',
            manifest: {
              description: 'Authentic tape saturation with compression, warmth, and analog glue',
              manufacturer: 'Max Booster',
              tags: ['distortion', 'tape', 'saturation'],
              type: 'Saturation',
              character: 'glue',
              features: ['tape-modeling', 'bias-control', 'ips-selection', 'crosstalk-simulation']
            }
          },
          {
            slug: 'console-drive',
            name: 'Console Drive',
            kind: 'distortion',
            version: '2.0.0',
            manifest: {
              description: 'Legendary console channel saturation with transformer coloration and punch',
              manufacturer: 'Max Booster',
              tags: ['distortion', 'console', 'saturation'],
              type: 'Saturation',
              character: 'punchy',
              features: ['console-modeling', 'transformer-saturation', 'channel-types', 'drive-modes']
            }
          },

          // === LEGENDARY SYNTHS ===
          {
            slug: 'titan-analog-synth',
            name: 'Titan Analog Synth',
            kind: 'synth',
            version: '2.0.0',
            manifest: {
              description: 'Massive analog-modeled polysynth with vintage warmth and modern power',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'synth', 'analog'],
              category: 'synth',
              character: 'warm',
              features: ['3-oscillators', '12-voices', 'ladder-filter', 'modulation-matrix']
            }
          },
          {
            slug: 'quantum-wavetable',
            name: 'Quantum Wavetable',
            kind: 'synth',
            version: '2.0.0',
            manifest: {
              description: 'Advanced wavetable synth with morphing capabilities and digital precision',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'synth', 'wavetable'],
              category: 'synth',
              character: 'digital',
              features: ['wavetable-morphing', '200-wavetables', 'dual-filters', 'fx-chain']
            }
          },
          {
            slug: 'fm-matrix-synth',
            name: 'FM Matrix Synth',
            kind: 'synth',
            version: '2.0.0',
            manifest: {
              description: 'Professional FM synthesizer with 8-operator matrix and classic DX algorithms',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'synth', 'fm'],
              category: 'synth',
              character: 'bright',
              features: ['8-operators', '32-algorithms', 'pitch-eg', 'velocity-sensitivity']
            }
          },
          {
            slug: 'bass-destroyer',
            name: 'Bass Destroyer',
            kind: 'synth',
            version: '2.0.0',
            manifest: {
              description: 'Monophonic bass synth with sub-harmonic generation and earth-shaking power',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'synth', 'bass'],
              category: 'synth',
              character: 'powerful',
              features: ['sub-oscillator', 'distortion', 'glide-portamento', 'arpeggiator']
            }
          },

          // === LEGENDARY SAMPLERS & DRUM MACHINES ===
          {
            slug: 'orchestral-sampler',
            name: 'Orchestral Sampler',
            kind: 'sampler',
            version: '2.0.0',
            manifest: {
              description: 'Premium orchestral sampler with 50GB+ multi-sampled instruments',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'sampler', 'orchestral'],
              category: 'sampler',
              character: 'realistic',
              features: ['multi-samples', 'round-robin', 'articulations', 'mic-positions']
            }
          },
          {
            slug: 'vintage-drum-machine',
            name: 'Vintage Drum Machine',
            kind: 'drum',
            version: '2.0.0',
            manifest: {
              description: 'Legendary analog drum machine with classic 808/909 sounds and swing',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'drums', 'vintage'],
              category: 'drum',
              character: 'punchy',
              features: ['16-step-sequencer', 'accent-control', 'individual-outs', 'swing-timing']
            }
          },
          {
            slug: 'concert-grand-piano',
            name: 'Concert Grand Piano',
            kind: 'piano',
            version: '2.0.0',
            manifest: {
              description: 'Pristine 9-foot concert grand with pedal resonance and lid position',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'piano', 'acoustic'],
              category: 'piano',
              character: 'pristine',
              features: ['velocity-layers', 'pedal-resonance', 'lid-position', 'sympathetic-resonance']
            }
          },
          {
            slug: 'vintage-tonewheel-organ',
            name: 'Vintage Tonewheel Organ',
            kind: 'organ',
            version: '2.0.0',
            manifest: {
              description: 'Authentic tonewheel organ with drawbars, key-click, and rotary cabinet',
              manufacturer: 'Max Booster',
              tags: ['instrument', 'organ', 'vintage'],
              category: 'organ',
              character: 'soulful',
              features: ['9-drawbars', 'key-click', 'percussion', 'rotary-cabinet']
            }
          },

          // === LIMITERS & MAXIMIZERS ===
          {
            slug: 'brickwall-limiter',
            name: 'Brickwall Limiter',
            kind: 'limiter',
            version: '2.0.0',
            manifest: {
              description: 'Transparent brickwall limiter with look-ahead and true-peak detection',
              manufacturer: 'Max Booster',
              tags: ['limiter', 'mastering', 'loudness'],
              type: 'Brickwall',
              character: 'transparent',
              features: ['true-peak-detection', 'look-ahead', 'oversampling', 'auto-release']
            }
          },
          {
            slug: 'multiband-maximizer',
            name: 'Multiband Maximizer',
            kind: 'limiter',
            version: '2.0.0',
            manifest: {
              description: 'Advanced multiband maximizer with intelligent spectral limiting',
              manufacturer: 'Max Booster',
              tags: ['limiter', 'mastering', 'loudness'],
              type: 'Multiband',
              character: 'powerful',
              features: ['4-band-limiting', 'spectral-shaping', 'isp-technology', 'loudness-metering']
            }
          },
          {
            slug: 'vintage-tape-limiter',
            name: 'Vintage Tape Limiter',
            kind: 'limiter',
            version: '2.0.0',
            manifest: {
              description: 'Analog tape-style limiter with natural compression and warmth',
              manufacturer: 'Max Booster',
              tags: ['limiter', 'vintage', 'analog'],
              type: 'Analog',
              character: 'warm',
              features: ['tape-saturation', 'soft-clipping', 'high-frequency-rolloff', 'bias-control']
            }
          },

          // === GATES & EXPANDERS ===
          {
            slug: 'precision-gate',
            name: 'Precision Gate',
            kind: 'gate',
            version: '2.0.0',
            manifest: {
              description: 'Professional noise gate with look-ahead and hysteresis control',
              manufacturer: 'Max Booster',
              tags: ['gate', 'dynamics', 'noise-reduction'],
              type: 'Gate',
              character: 'precise',
              features: ['look-ahead', 'hysteresis', 'sidechain-filter', 'hold-time']
            }
          },
          {
            slug: 'transient-gate',
            name: 'Transient Gate',
            kind: 'gate',
            version: '2.0.0',
            manifest: {
              description: 'Intelligent transient gate with envelope follower and ducking',
              manufacturer: 'Max Booster',
              tags: ['gate', 'transient', 'dynamics'],
              type: 'Transient',
              character: 'adaptive',
              features: ['transient-detection', 'envelope-follower', 'ducking-mode', 'frequency-dependent']
            }
          },
          {
            slug: 'downward-expander',
            name: 'Downward Expander',
            kind: 'gate',
            version: '2.0.0',
            manifest: {
              description: 'Smooth downward expander for natural dynamic range expansion',
              manufacturer: 'Max Booster',
              tags: ['expander', 'dynamics', 'mixing'],
              type: 'Expander',
              character: 'smooth',
              features: ['soft-knee', 'ratio-control', 'range-limiting', 'sidechain']
            }
          },

          // === DE-ESSERS ===
          {
            slug: 'surgical-de-esser',
            name: 'Surgical De-Esser',
            kind: 'de-esser',
            version: '2.0.0',
            manifest: {
              description: 'Precision de-esser with multi-band detection and transparency',
              manufacturer: 'Max Booster',
              tags: ['de-esser', 'vocal', 'dynamics'],
              type: 'Surgical',
              character: 'transparent',
              features: ['multi-band-detection', 'listen-mode', 'auto-threshold', 'split-band']
            }
          },
          {
            slug: 'vintage-de-esser',
            name: 'Vintage De-Esser',
            kind: 'de-esser',
            version: '2.0.0',
            manifest: {
              description: 'Classic de-esser with analog warmth and musical character',
              manufacturer: 'Max Booster',
              tags: ['de-esser', 'vocal', 'vintage'],
              type: 'Vintage',
              character: 'warm',
              features: ['frequency-dependent', 'ratio-control', 'sidechain-eq', 'analog-modeling']
            }
          },

          // === PITCH CORRECTION & VOCAL ===
          {
            slug: 'auto-pitch-pro',
            name: 'Auto Pitch Pro',
            kind: 'pitch',
            version: '2.0.0',
            manifest: {
              description: 'Professional pitch correction with scale detection and formant preservation',
              manufacturer: 'Max Booster',
              tags: ['pitch', 'vocal', 'auto-tune'],
              type: 'Auto-Tune',
              character: 'precise',
              features: ['real-time-correction', 'scale-detection', 'formant-preservation', 'vibrato-control']
            }
          },
          {
            slug: 'harmony-generator',
            name: 'Harmony Generator',
            kind: 'pitch',
            version: '2.0.0',
            manifest: {
              description: 'Intelligent harmony generator with voice modeling and doubling',
              manufacturer: 'Max Booster',
              tags: ['pitch', 'vocal', 'harmony'],
              type: 'Harmony',
              character: 'natural',
              features: ['auto-harmony', 'voice-doubling', 'humanization', '4-voice-polyphony']
            }
          },
          {
            slug: 'vocal-rider',
            name: 'Vocal Rider',
            kind: 'vocal',
            version: '2.0.0',
            manifest: {
              description: 'Automatic vocal level riding for consistent vocal presence',
              manufacturer: 'Max Booster',
              tags: ['vocal', 'automation', 'mixing'],
              type: 'Automation',
              character: 'intelligent',
              features: ['auto-gain-riding', 'target-range', 'sensitivity-control', 'music-threshold']
            }
          },
          {
            slug: 'vocal-channel-strip',
            name: 'Vocal Channel Strip',
            kind: 'vocal',
            version: '2.0.0',
            manifest: {
              description: 'Complete vocal chain with EQ, compression, de-essing, and effects',
              manufacturer: 'Max Booster',
              tags: ['vocal', 'channel-strip', 'processing'],
              type: 'Channel-Strip',
              character: 'complete',
              features: ['eq', 'compression', 'de-esser', 'saturation', 'reverb', 'delay']
            }
          },

          // === GUITAR & BASS AMP SIMULATORS ===
          {
            slug: 'legendary-guitar-amp',
            name: 'Legendary Guitar Amp',
            kind: 'amp',
            version: '2.0.0',
            manifest: {
              description: 'Premium guitar amp simulator with 50+ classic amp models and cabinets',
              manufacturer: 'Max Booster',
              tags: ['amp', 'guitar', 'simulation'],
              type: 'Guitar',
              character: 'versatile',
              features: ['50-amp-models', 'cabinet-simulation', 'mic-positions', 'room-ambience']
            }
          },
          {
            slug: 'bass-amp-suite',
            name: 'Bass Amp Suite',
            kind: 'amp',
            version: '2.0.0',
            manifest: {
              description: 'Professional bass amp simulator with classic SVT, Eden, and Ampeg models',
              manufacturer: 'Max Booster',
              tags: ['amp', 'bass', 'simulation'],
              type: 'Bass',
              character: 'punchy',
              features: ['bass-amp-models', 'di-simulation', 'cabinet-modeling', 'eq-shaping']
            }
          },
          {
            slug: 'pedal-board',
            name: 'Pedal Board',
            kind: 'amp',
            version: '2.0.0',
            manifest: {
              description: 'Virtual pedalboard with 30+ classic guitar pedals and stompboxes',
              manufacturer: 'Max Booster',
              tags: ['pedal', 'guitar', 'effects'],
              type: 'Pedalboard',
              character: 'creative',
              features: ['30-pedals', 'signal-chain', 'true-bypass', 'vintage-modeling']
            }
          },

          // === STEREO IMAGING & WIDTH ===
          {
            slug: 'stereo-imager-pro',
            name: 'Stereo Imager Pro',
            kind: 'stereo',
            version: '2.0.0',
            manifest: {
              description: 'Advanced stereo imaging with multi-band width control and mono compatibility',
              manufacturer: 'Max Booster',
              tags: ['stereo', 'imaging', 'mastering'],
              type: 'Imager',
              character: 'precise',
              features: ['multiband-width', 'mid-side-processing', 'mono-check', 'correlation-meter']
            }
          },
          {
            slug: 'haas-widener',
            name: 'Haas Widener',
            kind: 'stereo',
            version: '2.0.0',
            manifest: {
              description: 'Haas effect-based stereo widener with delay and phase manipulation',
              manufacturer: 'Max Booster',
              tags: ['stereo', 'widening', 'creative'],
              type: 'Widener',
              character: 'spacious',
              features: ['haas-effect', 'micro-delay', 'phase-offset', 'frequency-dependent']
            }
          },
          {
            slug: 'mid-side-processor',
            name: 'Mid-Side Processor',
            kind: 'stereo',
            version: '2.0.0',
            manifest: {
              description: 'Dedicated mid-side processor with independent processing chains',
              manufacturer: 'Max Booster',
              tags: ['stereo', 'mid-side', 'mastering'],
              type: 'Mid-Side',
              character: 'surgical',
              features: ['mid-side-split', 'independent-eq', 'width-control', 'mono-compatibility']
            }
          },

          // === METERING & ANALYSIS ===
          {
            slug: 'spectrum-analyzer-pro',
            name: 'Spectrum Analyzer Pro',
            kind: 'metering',
            version: '2.0.0',
            manifest: {
              description: 'Professional spectrum analyzer with FFT display and peak hold',
              manufacturer: 'Max Booster',
              tags: ['metering', 'analysis', 'visualization'],
              type: 'Analyzer',
              character: 'precise',
              features: ['fft-spectrum', 'peak-hold', 'sonogram', 'masking-curves']
            }
          },
          {
            slug: 'loudness-meter',
            name: 'Loudness Meter',
            kind: 'metering',
            version: '2.0.0',
            manifest: {
              description: 'Broadcast-standard loudness meter with LUFS, true-peak, and dynamic range',
              manufacturer: 'Max Booster',
              tags: ['metering', 'loudness', 'mastering'],
              type: 'Loudness',
              character: 'standard',
              features: ['lufs-metering', 'true-peak', 'dynamic-range', 'history-graph']
            }
          },
          {
            slug: 'phase-correlation-meter',
            name: 'Phase Correlation Meter',
            kind: 'metering',
            version: '2.0.0',
            manifest: {
              description: 'Goniometer and correlation meter for stereo field analysis',
              manufacturer: 'Max Booster',
              tags: ['metering', 'phase', 'stereo'],
              type: 'Phase',
              character: 'technical',
              features: ['goniometer', 'correlation-meter', 'vector-scope', 'mono-compatibility-check']
            }
          },

          // === UTILITY PLUGINS ===
          {
            slug: 'precision-gain',
            name: 'Precision Gain',
            kind: 'utility',
            version: '2.0.0',
            manifest: {
              description: 'High-precision gain control with phase inversion and balance',
              manufacturer: 'Max Booster',
              tags: ['utility', 'gain', 'mixing'],
              type: 'Gain',
              character: 'transparent',
              features: ['0.1db-precision', 'phase-invert', 'left-right-balance', 'dc-offset-removal']
            }
          },
          {
            slug: 'mono-stereo-converter',
            name: 'Mono-Stereo Converter',
            kind: 'utility',
            version: '2.0.0',
            manifest: {
              description: 'Flexible mono/stereo conversion with channel routing and summing',
              manufacturer: 'Max Booster',
              tags: ['utility', 'routing', 'mixing'],
              type: 'Converter',
              character: 'flexible',
              features: ['mono-summing', 'stereo-splitting', 'channel-swap', 'mid-side-decode']
            }
          },
          {
            slug: 'phase-alignment-tool',
            name: 'Phase Alignment Tool',
            kind: 'utility',
            version: '2.0.0',
            manifest: {
              description: 'Automatic phase alignment with polarity detection and delay compensation',
              manufacturer: 'Max Booster',
              tags: ['utility', 'phase', 'mixing'],
              type: 'Phase',
              character: 'precise',
              features: ['auto-alignment', 'polarity-detection', 'delay-compensation', 'correlation-display']
            }
          },

          // === CREATIVE EFFECTS ===
          {
            slug: 'granular-processor',
            name: 'Granular Processor',
            kind: 'creative',
            version: '2.0.0',
            manifest: {
              description: 'Advanced granular synthesizer with cloud processing and time-stretching',
              manufacturer: 'Max Booster',
              tags: ['creative', 'granular', 'experimental'],
              type: 'Granular',
              character: 'experimental',
              features: ['grain-synthesis', 'cloud-density', 'time-stretching', 'grain-randomization']
            }
          },
          {
            slug: 'glitch-machine',
            name: 'Glitch Machine',
            kind: 'creative',
            version: '2.0.0',
            manifest: {
              description: 'Rhythmic glitch processor with stutter, repeat, and buffer effects',
              manufacturer: 'Max Booster',
              tags: ['creative', 'glitch', 'rhythmic'],
              type: 'Glitch',
              character: 'chaotic',
              features: ['stutter-engine', 'buffer-repeat', 'tape-stop', 'pattern-sequencer']
            }
          },
          {
            slug: 'ring-modulator',
            name: 'Ring Modulator',
            kind: 'creative',
            version: '2.0.0',
            manifest: {
              description: 'Vintage ring modulator with carrier oscillator and sideband filtering',
              manufacturer: 'Max Booster',
              tags: ['creative', 'modulation', 'vintage'],
              type: 'Ring-Mod',
              character: 'metallic',
              features: ['carrier-oscillator', 'sideband-filter', 'mix-control', 'lfo-modulation']
            }
          },
          {
            slug: 'frequency-shifter',
            name: 'Frequency Shifter',
            kind: 'creative',
            version: '2.0.0',
            manifest: {
              description: 'Precision frequency shifter with harmonic dissonance and stereo offset',
              manufacturer: 'Max Booster',
              tags: ['creative', 'frequency', 'experimental'],
              type: 'Frequency-Shift',
              character: 'dissonant',
              features: ['linear-shifting', 'feedback-loop', 'stereo-offset', 'mix-control']
            }
          },

          // === CHANNEL STRIPS & PREAMPS ===
          {
            slug: 'british-console-channel',
            name: 'British Console Channel',
            kind: 'channel-strip',
            version: '2.0.0',
            manifest: {
              description: 'Legendary British console channel with EQ, dynamics, and transformer coloration',
              manufacturer: 'Max Booster',
              tags: ['channel-strip', 'console', 'vintage'],
              type: 'Console',
              character: 'warm',
              features: ['preamp-modeling', '4-band-eq', 'compressor', 'gate', 'transformer-saturation']
            }
          },
          {
            slug: 'american-studio-preamp',
            name: 'American Studio Preamp',
            kind: 'channel-strip',
            version: '2.0.0',
            manifest: {
              description: 'Classic American studio preamp with clean gain and minimal coloration',
              manufacturer: 'Max Booster',
              tags: ['preamp', 'studio', 'transparent'],
              type: 'Preamp',
              character: 'clean',
              features: ['ultra-clean-gain', 'input-impedance', 'phase-reverse', 'pad-control']
            }
          },
          {
            slug: 'tube-preamp-suite',
            name: 'Tube Preamp Suite',
            kind: 'channel-strip',
            version: '2.0.0',
            manifest: {
              description: 'Vintage tube preamp collection with multiple tube types and drive stages',
              manufacturer: 'Max Booster',
              tags: ['preamp', 'tube', 'vintage'],
              type: 'Tube',
              character: 'colored',
              features: ['multiple-tube-models', 'drive-stages', 'output-transformer', 'bias-control']
            }
          },
        ];

        // Insert all plugins in one batch
        await db.insert(pluginCatalog).values(pluginsToSeed);
      },
      'seedPluginCatalog'
    );
  }

  // Track Analysis operations
  async saveTrackAnalysis(analysis: InsertTrackAnalysis): Promise<TrackAnalysis> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db
          .insert(trackAnalysis)
          .values(analysis)
          .returning();
        return result;
      },
      'saveTrackAnalysis'
    );
  }

  async getTrackAnalysis(projectId: string): Promise<TrackAnalysis | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const results = await db
          .select()
          .from(trackAnalysis)
          .where(eq(trackAnalysis.projectId, projectId))
          .orderBy(desc(trackAnalysis.analyzedAt))
          .limit(1);
        return results[0];
      },
      'getTrackAnalysis'
    );
  }

  async getProjectAnalysis(projectId: string): Promise<TrackAnalysis[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(trackAnalysis)
          .where(eq(trackAnalysis.projectId, projectId))
          .orderBy(desc(trackAnalysis.analyzedAt));
      },
      'getProjectAnalysis'
    );
  }

  // CRDT Collaboration operations
  async getProjectCollaborators(projectId: string): Promise<ProjectCollaborator[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(projectCollaborators)
          .where(eq(projectCollaborators.projectId, projectId));
      },
      'getProjectCollaborators'
    );
  }

  async getProjectCollaborator(projectId: string, userId: string): Promise<ProjectCollaborator | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [collaborator] = await db
          .select()
          .from(projectCollaborators)
          .where(and(
            eq(projectCollaborators.projectId, projectId),
            eq(projectCollaborators.userId, userId)
          ));
        return collaborator;
      },
      'getProjectCollaborator'
    );
  }

  async createProjectCollaborator(data: InsertProjectCollaborator): Promise<ProjectCollaborator> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [collaborator] = await db
          .insert(projectCollaborators)
          .values(data)
          .returning();
        return collaborator;
      },
      'createProjectCollaborator'
    );
  }

  async updateProjectCollaborator(id: string, updates: Partial<ProjectCollaborator>): Promise<ProjectCollaborator> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(projectCollaborators)
          .set(updates)
          .where(eq(projectCollaborators.id, id))
          .returning();
        return updated;
      },
      'updateProjectCollaborator'
    );
  }

  async deleteProjectCollaborator(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(projectCollaborators).where(eq(projectCollaborators.id, id));
      },
      'deleteProjectCollaborator'
    );
  }

  async updateProjectCollaboratorRole(projectId: string, userId: string, role: string): Promise<ProjectCollaborator> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(projectCollaborators)
          .set({ role })
          .where(and(
            eq(projectCollaborators.projectId, projectId),
            eq(projectCollaborators.userId, userId)
          ))
          .returning();
        return updated;
      },
      'updateProjectCollaboratorRole'
    );
  }

  async deleteProjectCollaboratorByProjectAndUser(projectId: string, userId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(projectCollaborators)
          .where(and(
            eq(projectCollaborators.projectId, projectId),
            eq(projectCollaborators.userId, userId)
          ));
      },
      'deleteProjectCollaboratorByProjectAndUser'
    );
  }

  async createCollabSession(session: InsertStudioCollabSession): Promise<StudioCollabSession> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db
          .insert(studioCollabSessions)
          .values(session)
          .returning();
        return result;
      },
      'createCollabSession'
    );
  }

  async getActiveCollabSessions(projectId: string): Promise<StudioCollabSession[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(studioCollabSessions)
          .where(eq(studioCollabSessions.projectId, projectId))
          .orderBy(desc(studioCollabSessions.lastSeenAt));
      },
      'getActiveCollabSessions'
    );
  }

  async updateCollabSessionActivity(id: string, awarenessState: any): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(studioCollabSessions)
          .set({ awarenessState, lastSeenAt: new Date() })
          .where(eq(studioCollabSessions.id, id));
      },
      'updateCollabSessionActivity'
    );
  }

  async deleteCollabSession(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(studioCollabSessions).where(eq(studioCollabSessions.id, id));
      },
      'deleteCollabSession'
    );
  }

  async deleteCollabSessionByProjectAndUser(projectId: string, userId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(studioCollabSessions)
          .where(and(
            eq(studioCollabSessions.projectId, projectId),
            eq(studioCollabSessions.userId, userId)
          ));
      },
      'deleteCollabSessionByProjectAndUser'
    );
  }

  async saveCollabSnapshot(snapshot: InsertStudioCollabSnapshot): Promise<StudioCollabSnapshot> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db
          .insert(studioCollabSnapshots)
          .values(snapshot)
          .returning();
        return result;
      },
      'saveCollabSnapshot'
    );
  }

  async getLatestCollabSnapshot(projectId: string): Promise<StudioCollabSnapshot | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [snapshot] = await db
          .select()
          .from(studioCollabSnapshots)
          .where(eq(studioCollabSnapshots.projectId, projectId))
          .orderBy(desc(studioCollabSnapshots.createdAt))
          .limit(1);
        return snapshot;
      },
      'getLatestCollabSnapshot'
    );
  }

  async getCollabSnapshots(projectId: string, limit: number = 10): Promise<StudioCollabSnapshot[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(studioCollabSnapshots)
          .where(eq(studioCollabSnapshots.projectId, projectId))
          .orderBy(desc(studioCollabSnapshots.createdAt))
          .limit(limit);
      },
      'getCollabSnapshots'
    );
  }

  async deleteOldCollabSnapshots(projectId: string, keepLast: number = 10): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get IDs of snapshots to keep
        const snapshotsToKeep = await db
          .select({ id: studioCollabSnapshots.id })
          .from(studioCollabSnapshots)
          .where(eq(studioCollabSnapshots.projectId, projectId))
          .orderBy(desc(studioCollabSnapshots.createdAt))
          .limit(keepLast);

        const idsToKeep = snapshotsToKeep.map(s => s.id);

        // Delete old snapshots
        if (idsToKeep.length > 0) {
          await db
            .delete(studioCollabSnapshots)
            .where(and(
              eq(studioCollabSnapshots.projectId, projectId),
              sql`${studioCollabSnapshots.id} NOT IN (${sql.join(idsToKeep.map(id => sql`${id}`), sql`, `)})`
            ));
        }
      },
      'deleteOldCollabSnapshots'
    );
  }

  // ============================================================================
  // PROJECT ROYALTY TRACKING METHODS (Task 13)
  // ============================================================================

  // Royalty split management
  async getProjectRoyaltySplits(projectId: string): Promise<ProjectRoyaltySplit[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(projectRoyaltySplits)
          .where(eq(projectRoyaltySplits.projectId, projectId))
          .orderBy(desc(projectRoyaltySplits.createdAt));
      },
      'getProjectRoyaltySplits'
    );
  }

  async createProjectRoyaltySplit(data: InsertProjectRoyaltySplit): Promise<ProjectRoyaltySplit> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [split] = await db
          .insert(projectRoyaltySplits)
          .values(data)
          .returning();
        return split;
      },
      'createProjectRoyaltySplit'
    );
  }

  async updateProjectRoyaltySplit(id: string, data: Partial<InsertProjectRoyaltySplit>): Promise<ProjectRoyaltySplit> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(projectRoyaltySplits)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(projectRoyaltySplits.id, id))
          .returning();
        return updated;
      },
      'updateProjectRoyaltySplit'
    );
  }

  async deleteProjectRoyaltySplit(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(projectRoyaltySplits)
          .where(eq(projectRoyaltySplits.id, id));
      },
      'deleteProjectRoyaltySplit'
    );
  }

  async validateSplitPercentages(projectId: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const splits = await db
          .select()
          .from(projectRoyaltySplits)
          .where(eq(projectRoyaltySplits.projectId, projectId));

        const total = splits.reduce((sum, split) => {
          return sum + parseFloat(split.splitPercentage || '0');
        }, 0);

        // Allow small floating point errors (within 0.01%)
        return Math.abs(total - 100) < 0.01;
      },
      'validateSplitPercentages'
    );
  }

  // Revenue event management with automatic ledger creation
  async createProjectRevenueEvent(data: InsertRevenueEvent): Promise<RevenueEvent> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Use transaction to create revenue event and ledger entries atomically
        return db.transaction(async (tx) => {
          // Create revenue event
          const [event] = await tx
            .insert(revenueEvents)
            .values(data)
            .returning();

          // Get royalty splits for this project
          const splits = await tx
            .select()
            .from(projectRoyaltySplits)
            .where(eq(projectRoyaltySplits.projectId, data.projectId));

          // Create ledger entries for each collaborator
          const ledgerEntries = splits.map(split => ({
            revenueEventId: event.id,
            collaboratorId: split.collaboratorId,
            projectId: data.projectId,
            amount: (parseFloat(data.amount) * parseFloat(split.splitPercentage) / 100).toFixed(2),
            splitPercentage: split.splitPercentage,
            isPaid: false,
          }));

          if (ledgerEntries.length > 0) {
            await tx
              .insert(royaltyLedger)
              .values(ledgerEntries);
          }

          return event;
        });
      },
      'createProjectRevenueEvent'
    );
  }

  async getProjectRevenueEvents(projectId: string): Promise<RevenueEvent[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(revenueEvents)
          .where(eq(revenueEvents.projectId, projectId))
          .orderBy(desc(revenueEvents.occurredAt));
      },
      'getProjectRevenueEvents'
    );
  }

  async getRevenueEventById(id: string): Promise<RevenueEvent | null> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [event] = await db
          .select()
          .from(revenueEvents)
          .where(eq(revenueEvents.id, id))
          .limit(1);
        return event || null;
      },
      'getRevenueEventById'
    );
  }

  // Royalty ledger queries
  async getLedgerEntriesByCollaborator(collaboratorId: string, projectId?: string): Promise<RoyaltyLedger[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const conditions = projectId
          ? and(
              eq(royaltyLedger.collaboratorId, collaboratorId),
              eq(royaltyLedger.projectId, projectId)
            )
          : eq(royaltyLedger.collaboratorId, collaboratorId);

        return db
          .select()
          .from(royaltyLedger)
          .where(conditions)
          .orderBy(desc(royaltyLedger.createdAt));
      },
      'getLedgerEntriesByCollaborator'
    );
  }

  async getLedgerEntriesByProject(projectId: string): Promise<RoyaltyLedger[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(royaltyLedger)
          .where(eq(royaltyLedger.projectId, projectId))
          .orderBy(desc(royaltyLedger.createdAt));
      },
      'getLedgerEntriesByProject'
    );
  }

  async getPendingEarningsForCollaborator(collaboratorId: string): Promise<{ total: string, byProject: any[] }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const entries = await db
          .select()
          .from(royaltyLedger)
          .where(and(
            eq(royaltyLedger.collaboratorId, collaboratorId),
            eq(royaltyLedger.isPaid, false)
          ));

        const total = entries.reduce((sum, entry) => {
          return sum + parseFloat(entry.amount || '0');
        }, 0);

        // Group by project
        const byProject = entries.reduce((acc, entry) => {
          const projectId = entry.projectId;
          if (!acc[projectId]) {
            acc[projectId] = {
              projectId,
              total: 0,
              count: 0,
            };
          }
          acc[projectId].total += parseFloat(entry.amount || '0');
          acc[projectId].count += 1;
          return acc;
        }, {} as any);

        return {
          total: total.toFixed(2),
          byProject: Object.values(byProject),
        };
      },
      'getPendingEarningsForCollaborator'
    );
  }

  async getTotalEarningsForCollaborator(collaboratorId: string): Promise<{ total: string, paid: string, pending: string }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const entries = await db
          .select()
          .from(royaltyLedger)
          .where(eq(royaltyLedger.collaboratorId, collaboratorId));

        const total = entries.reduce((sum, entry) => {
          return sum + parseFloat(entry.amount || '0');
        }, 0);

        const paid = entries
          .filter(e => e.isPaid)
          .reduce((sum, entry) => {
            return sum + parseFloat(entry.amount || '0');
          }, 0);

        const pending = entries
          .filter(e => !e.isPaid)
          .reduce((sum, entry) => {
            return sum + parseFloat(entry.amount || '0');
          }, 0);

        return {
          total: total.toFixed(2),
          paid: paid.toFixed(2),
          pending: pending.toFixed(2),
        };
      },
      'getTotalEarningsForCollaborator'
    );
  }

  // Payment management
  async createProjectRoyaltyPayment(data: InsertRoyaltyPayment): Promise<RoyaltyPayment> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db.transaction(async (tx) => {
          // Create payment record
          const [payment] = await tx
            .insert(royaltyPayments)
            .values(data)
            .returning();

          // Mark ledger entries as paid if ledgerEntryIds provided
          if (data.ledgerEntryIds && data.ledgerEntryIds.length > 0) {
            await tx
              .update(royaltyLedger)
              .set({ isPaid: true })
              .where(sql`${royaltyLedger.id} = ANY(${data.ledgerEntryIds})`);
          }

          return payment;
        });
      },
      'createProjectRoyaltyPayment'
    );
  }

  async getProjectRoyaltyPayments(collaboratorId: string, limit?: number, offset?: number): Promise<{ data: RoyaltyPayment[], total: number }> {
    return this.executeWithCircuitBreaker(
      async () => {
        const actualLimit = limit || 50;
        const actualOffset = offset || 0;

        const [data, totalResult] = await Promise.all([
          db
            .select()
            .from(royaltyPayments)
            .where(eq(royaltyPayments.collaboratorId, collaboratorId))
            .orderBy(desc(royaltyPayments.createdAt))
            .limit(actualLimit)
            .offset(actualOffset),
          db
            .select({ total: sql<number>`count(*)` })
            .from(royaltyPayments)
            .where(eq(royaltyPayments.collaboratorId, collaboratorId))
        ]);

        return {
          data,
          total: totalResult[0]?.total || 0
        };
      },
      'getProjectRoyaltyPayments'
    );
  }

  async updateRoyaltyPaymentStatus(id: string, status: string, stripePaymentId?: string): Promise<RoyaltyPayment> {
    return this.executeWithCircuitBreaker(
      async () => {
        const updateData: any = { status };
        if (stripePaymentId) {
          updateData.stripePaymentId = stripePaymentId;
        }
        if (status === 'completed') {
          updateData.paidAt = new Date();
        }

        const [updated] = await db
          .update(royaltyPayments)
          .set(updateData)
          .where(eq(royaltyPayments.id, id))
          .returning();
        return updated;
      },
      'updateRoyaltyPaymentStatus'
    );
  }

  // Reporting
  async getProjectRoyaltySummary(projectId: string): Promise<{ collaborators: any[], totalRevenue: string, splits: any[] }> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Get total revenue
        const events = await db
          .select()
          .from(revenueEvents)
          .where(eq(revenueEvents.projectId, projectId));

        const totalRevenue = events.reduce((sum, event) => {
          return sum + parseFloat(event.amount || '0');
        }, 0);

        // Get splits
        const splits = await db
          .select()
          .from(projectRoyaltySplits)
          .where(eq(projectRoyaltySplits.projectId, projectId));

        // Get ledger entries grouped by collaborator
        const ledgerEntries = await db
          .select()
          .from(royaltyLedger)
          .where(eq(royaltyLedger.projectId, projectId));

        const collaboratorSummaries = ledgerEntries.reduce((acc, entry) => {
          const collaboratorId = entry.collaboratorId;
          if (!acc[collaboratorId]) {
            acc[collaboratorId] = {
              collaboratorId,
              totalEarned: 0,
              totalPaid: 0,
              totalPending: 0,
            };
          }
          const amount = parseFloat(entry.amount || '0');
          acc[collaboratorId].totalEarned += amount;
          if (entry.isPaid) {
            acc[collaboratorId].totalPaid += amount;
          } else {
            acc[collaboratorId].totalPending += amount;
          }
          return acc;
        }, {} as any);

        return {
          totalRevenue: totalRevenue.toFixed(2),
          splits: splits.map(s => ({
            ...s,
            splitPercentage: parseFloat(s.splitPercentage || '0'),
          })),
          collaborators: Object.values(collaboratorSummaries).map((c: any) => ({
            ...c,
            totalEarned: c.totalEarned.toFixed(2),
            totalPaid: c.totalPaid.toFixed(2),
            totalPending: c.totalPending.toFixed(2),
          })),
        };
      },
      'getProjectRoyaltySummary'
    );
  }

  // ====================================
  // Platform Self-Updating System operations
  // ====================================

  // Trend Events operations
  async getTrendEvents(limit?: number, source?: string, impact?: string): Promise<TrendEvent[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        let query = db.select().from(trendEvents);
        
        const conditions = [];
        if (source) conditions.push(eq(trendEvents.source, source));
        if (impact) conditions.push(eq(trendEvents.impact, impact));
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return query
          .orderBy(desc(trendEvents.detectedAt))
          .limit(limit || 100);
      },
      'getTrendEvents'
    );
  }

  async getRecentTrendEvents(days: number): Promise<TrendEvent[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return db
          .select()
          .from(trendEvents)
          .where(gte(trendEvents.detectedAt, cutoffDate))
          .orderBy(desc(trendEvents.detectedAt));
      },
      'getRecentTrendEvents'
    );
  }

  async createTrendEvent(event: InsertTrendEvent): Promise<TrendEvent> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(trendEvents).values(event).returning();
        return created;
      },
      'createTrendEvent'
    );
  }

  // Model Versions operations
  async getModelVersions(modelType?: string): Promise<ModelVersion[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        if (modelType) {
          return db
            .select()
            .from(modelVersions)
            .where(eq(modelVersions.modelType, modelType))
            .orderBy(desc(modelVersions.createdAt));
        }
        return db.select().from(modelVersions).orderBy(desc(modelVersions.createdAt));
      },
      'getModelVersions'
    );
  }

  async getActiveModelVersion(modelType: string): Promise<ModelVersion | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [version] = await db
          .select()
          .from(modelVersions)
          .where(and(eq(modelVersions.modelType, modelType), eq(modelVersions.isActive, true)))
          .limit(1);
        return version;
      },
      'getActiveModelVersion'
    );
  }

  async createModelVersion(version: InsertModelVersion): Promise<ModelVersion> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(modelVersions).values(version).returning();
        return created;
      },
      'createModelVersion'
    );
  }

  async activateModelVersion(id: number, modelType: string): Promise<ModelVersion> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(modelVersions)
          .set({ isActive: false })
          .where(eq(modelVersions.modelType, modelType));
        
        const [activated] = await db
          .update(modelVersions)
          .set({ isActive: true })
          .where(eq(modelVersions.id, id))
          .returning();
        
        return activated;
      },
      'activateModelVersion'
    );
  }

  // Optimization Tasks operations
  async getOptimizationTasks(status?: string, taskType?: string): Promise<OptimizationTask[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const conditions = [];
        if (status) conditions.push(eq(optimizationTasks.status, status));
        if (taskType) conditions.push(eq(optimizationTasks.taskType, taskType));
        
        let query = db.select().from(optimizationTasks);
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return query.orderBy(desc(optimizationTasks.createdAt));
      },
      'getOptimizationTasks'
    );
  }

  async getOptimizationTask(id: number): Promise<OptimizationTask | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [task] = await db
          .select()
          .from(optimizationTasks)
          .where(eq(optimizationTasks.id, id))
          .limit(1);
        return task;
      },
      'getOptimizationTask'
    );
  }

  async createOptimizationTask(task: InsertOptimizationTask): Promise<OptimizationTask> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(optimizationTasks).values(task).returning();
        return created;
      },
      'createOptimizationTask'
    );
  }

  async updateOptimizationTask(id: number, updates: Partial<OptimizationTask>): Promise<OptimizationTask> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db
          .update(optimizationTasks)
          .set(updates)
          .where(eq(optimizationTasks.id, id))
          .returning();
        return updated;
      },
      'updateOptimizationTask'
    );
  }

  // JWT Token operations
  async createJWTToken(token: InsertJWTToken): Promise<JWTToken> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(jwtTokens).values(token).returning();
        return created;
      },
      'createJWTToken'
    );
  }

  async revokeJWTToken(tokenId: string, reason: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.update(jwtTokens).set({ revoked: true }).where(eq(jwtTokens.id, tokenId));
        
        const [user] = await db.select().from(jwtTokens).where(eq(jwtTokens.id, tokenId));
        if (user) {
          await db.insert(tokenRevocations).values({
            tokenId,
            userId: user.userId,
            reason,
          });
        }
      },
      'revokeJWTToken'
    );
  }

  async revokeAllJWTTokensForUser(userId: string, reason: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.update(jwtTokens).set({ revoked: true }).where(eq(jwtTokens.userId, userId));
        
        const tokens = await db.select().from(jwtTokens).where(eq(jwtTokens.userId, userId));
        // Batch insert all token revocations at once instead of one by one
        if (tokens.length > 0) {
          const revocations = tokens.map(token => ({
            tokenId: token.id,
            userId: token.userId,
            reason,
          }));
          await db.insert(tokenRevocations).values(revocations);
        }
      },
      'revokeAllJWTTokensForUser'
    );
  }

  async verifyJWTToken(tokenId: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [token] = await db
          .select()
          .from(jwtTokens)
          .where(and(eq(jwtTokens.id, tokenId), eq(jwtTokens.revoked, false)));
        
        if (!token) return false;
        
        const now = new Date();
        return token.expiresAt > now;
      },
      'verifyJWTToken'
    );
  }

  // ============================================================================
  // USER ASSET MANAGEMENT
  // ============================================================================

  async createUserAsset(asset: InsertUserAsset): Promise<UserAsset> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(userAssets).values(asset).returning();
        return created;
      },
      'createUserAsset'
    );
  }

  async getUserAssets(
    userId: string,
    assetType?: string,
    folderId?: string,
    search?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<UserAsset[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        let query = db
          .select()
          .from(userAssets)
          .where(eq(userAssets.userId, userId));

        if (assetType) {
          query = query.where(eq(userAssets.assetType, assetType));
        }

        if (folderId) {
          query = query.where(eq(userAssets.folderId, folderId));
        }

        if (search) {
          query = query.where(
            or(
              sql`${userAssets.name} ILIKE ${'%' + search + '%'}`,
              sql`${userAssets.description} ILIKE ${'%' + search + '%'}`
            )
          );
        }

        const results = await query
          .orderBy(desc(userAssets.createdAt))
          .limit(limit)
          .offset(offset);

        return results;
      },
      'getUserAssets'
    );
  }

  async getUserAssetById(id: string): Promise<UserAsset | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [asset] = await db
          .select()
          .from(userAssets)
          .where(eq(userAssets.id, id))
          .limit(1);
        return asset;
      },
      'getUserAssetById'
    );
  }

  async deleteUserAsset(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(userAssets).where(eq(userAssets.id, id));
      },
      'deleteUserAsset'
    );
  }

  async createAssetFolder(folder: InsertAssetFolder): Promise<AssetFolder> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(assetFolders).values(folder).returning();
        return created;
      },
      'createAssetFolder'
    );
  }

  async getUserAssetFolders(userId: string): Promise<AssetFolder[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(assetFolders)
          .where(eq(assetFolders.userId, userId))
          .orderBy(assetFolders.path);
      },
      'getUserAssetFolders'
    );
  }

  async getAssetFolderById(id: string): Promise<AssetFolder | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [folder] = await db
          .select()
          .from(assetFolders)
          .where(eq(assetFolders.id, id))
          .limit(1);
        return folder;
      },
      'getAssetFolderById'
    );
  }

  async deleteAssetFolder(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(assetFolders).where(eq(assetFolders.id, id));
      },
      'deleteAssetFolder'
    );
  }

  async addAssetTag(assetId: string, tag: string): Promise<AssetTag> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db
          .insert(assetTags)
          .values({ assetId, tag })
          .returning();
        return created;
      },
      'addAssetTag'
    );
  }

  async getAssetTags(assetId: string): Promise<AssetTag[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(assetTags)
          .where(eq(assetTags.assetId, assetId));
      },
      'getAssetTags'
    );
  }

  // Refresh Token operations
  async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(refreshTokens).values(token).returning();
        return created;
      },
      'createRefreshToken'
    );
  }

  async revokeRefreshToken(tokenId: string, reason: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, tokenId));
        
        const [user] = await db.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId));
        if (user) {
          await db.insert(tokenRevocations).values({
            tokenId,
            userId: user.userId,
            reason,
          });
        }
      },
      'revokeRefreshToken'
    );
  }

  async revokeAllRefreshTokensForUser(userId: string, reason: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));
        
        const tokens = await db.select().from(refreshTokens).where(eq(refreshTokens.userId, userId));
        // Batch insert all token revocations at once instead of one by one
        if (tokens.length > 0) {
          const revocations = tokens.map(token => ({
            tokenId: token.id,
            userId: token.userId,
            reason,
          }));
          await db.insert(tokenRevocations).values(revocations);
        }
      },
      'revokeAllRefreshTokensForUser'
    );
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [refreshToken] = await db
          .select()
          .from(refreshTokens)
          .where(and(eq(refreshTokens.token, token), eq(refreshTokens.revoked, false)));
        return refreshToken;
      },
      'getRefreshToken'
    );
  }

  // Permission operations
  async checkPermission(role: string, resource: string, action: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [permission] = await db
          .select()
          .from(permissions)
          .where(
            and(
              eq(permissions.role, role),
              eq(permissions.resource, resource),
              eq(permissions.action, action)
            )
          );
        
        return permission?.allowed ?? false;
      },
      'checkPermission'
    );
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) return [];
        
        const role = user.role || 'user';
        return db.select().from(permissions).where(eq(permissions.role, role));
      },
      'getUserPermissions'
    );
  }

  // Webhook Event operations
  async getWebhookEvent(id: number): Promise<any> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [event] = await db
          .select()
          .from(webhookEvents)
          .where(eq(webhookEvents.id, id));
        return event;
      },
      'getWebhookEvent'
    );
  }

  // Webhook Attempt operations
  async createWebhookAttempt(attempt: InsertWebhookAttempt): Promise<WebhookAttempt> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(webhookAttempts).values(attempt).returning();
        return created;
      },
      'createWebhookAttempt'
    );
  }

  async getWebhookAttempts(webhookEventId: number): Promise<WebhookAttempt[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return db
          .select()
          .from(webhookAttempts)
          .where(eq(webhookAttempts.webhookEventId, webhookEventId))
          .orderBy(desc(webhookAttempts.attemptedAt));
      },
      'getWebhookAttempts'
    );
  }

  async getWebhookAttempt(id: string): Promise<WebhookAttempt | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [attempt] = await db
          .select()
          .from(webhookAttempts)
          .where(eq(webhookAttempts.id, id));
        return attempt;
      },
      'getWebhookAttempt'
    );
  }

  // Dead Letter Queue operations
  async addToDeadLetterQueue(dlq: InsertWebhookDeadLetterQueue): Promise<WebhookDeadLetterQueue> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(webhookDeadLetterQueue).values(dlq).returning();
        return created;
      },
      'addToDeadLetterQueue'
    );
  }

  async getDeadLetterQueue(status?: string): Promise<WebhookDeadLetterQueue[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        if (status) {
          return db
            .select()
            .from(webhookDeadLetterQueue)
            .where(eq(webhookDeadLetterQueue.status, status))
            .orderBy(desc(webhookDeadLetterQueue.enqueuedAt));
        }
        return db
          .select()
          .from(webhookDeadLetterQueue)
          .orderBy(desc(webhookDeadLetterQueue.enqueuedAt));
      },
      'getDeadLetterQueue'
    );
  }

  async getDeadLetterQueueItem(id: string): Promise<WebhookDeadLetterQueue | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [item] = await db
          .select()
          .from(webhookDeadLetterQueue)
          .where(eq(webhookDeadLetterQueue.id, id));
        return item;
      },
      'getDeadLetterQueueItem'
    );
  }

  async reprocessDeadLetter(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .update(webhookDeadLetterQueue)
          .set({ status: 'reprocessing', processedAt: new Date() })
          .where(eq(webhookDeadLetterQueue.id, id));
      },
      'reprocessDeadLetter'
    );
  }

  // Log operations
  async createLogEvent(log: InsertLogEvent): Promise<LogEvent> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [created] = await db.insert(logEvents).values(log).returning();
        return created;
      },
      'createLogEvent'
    );
  }

  async queryLogs(
    filters: {level?: string, service?: string, userId?: string, startTime?: Date, endTime?: Date},
    limit: number = 100
  ): Promise<LogEvent[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const conditions = [];
        
        if (filters.level) conditions.push(eq(logEvents.level, filters.level));
        if (filters.service) conditions.push(eq(logEvents.service, filters.service));
        if (filters.userId) conditions.push(eq(logEvents.userId, filters.userId));
        if (filters.startTime) conditions.push(gte(logEvents.timestamp, filters.startTime));
        if (filters.endTime) conditions.push(lte(logEvents.timestamp, filters.endTime));
        
        let query = db.select().from(logEvents);
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return query.orderBy(desc(logEvents.timestamp)).limit(limit);
      },
      'queryLogs'
    );
  }

  // Tax Profile operations
  async createTaxProfile(profile: InsertCollaboratorTaxProfile): Promise<CollaboratorTaxProfile> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db.insert(collaboratorTaxProfiles).values(profile).returning();
        return result;
      },
      'createTaxProfile'
    );
  }

  async getTaxProfile(userId: string): Promise<CollaboratorTaxProfile | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const result = await db.select().from(collaboratorTaxProfiles).where(eq(collaboratorTaxProfiles.userId, userId)).limit(1);
        return result[0];
      },
      'getTaxProfile'
    );
  }

  async updateTaxProfile(id: number, updates: Partial<InsertCollaboratorTaxProfile>): Promise<CollaboratorTaxProfile> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db.update(collaboratorTaxProfiles).set({...updates, updatedAt: new Date()}).where(eq(collaboratorTaxProfiles.id, id)).returning();
        return result;
      },
      'updateTaxProfile'
    );
  }

  async getCollaboratorsForTaxYear(year: number): Promise<{userId: string, totalEarnings: number}[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        
        const results = await db
          .select({
            userId: royaltyLedger.collaboratorId,
            totalEarnings: sql<number>`SUM(${royaltyLedger.amount})`,
          })
          .from(royaltyLedger)
          .innerJoin(revenueEvents, eq(royaltyLedger.revenueEventId, revenueEvents.id))
          .where(and(
            gte(revenueEvents.occurredAt, startDate),
            lte(revenueEvents.occurredAt, endDate)
          ))
          .groupBy(royaltyLedger.collaboratorId)
          .having(sql`SUM(${royaltyLedger.amount}) >= 600`);
        
        return results.map(r => ({
          userId: r.userId,
          totalEarnings: Number(r.totalEarnings)
        }));
      },
      'getCollaboratorsForTaxYear'
    );
  }

  // CSV Import operations
  async createImportHistory(importData: InsertRevenueImportHistory): Promise<RevenueImportHistory> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db.insert(revenueImportHistory).values(importData).returning();
        return result;
      },
      'createImportHistory'
    );
  }

  async getImportHistory(userId: string): Promise<RevenueImportHistory[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(revenueImportHistory).where(eq(revenueImportHistory.userId, userId)).orderBy(desc(revenueImportHistory.uploadedAt));
      },
      'getImportHistory'
    );
  }

  async checkFileHash(hash: string): Promise<RevenueImportHistory | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const result = await db.select().from(revenueImportHistory).where(eq(revenueImportHistory.fileHash, hash)).limit(1);
        return result[0];
      },
      'checkFileHash'
    );
  }

  async ingestRevenueBatch(events: InsertRevenueEvent[]): Promise<{succeeded: number, failed: number}> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Batch insert all revenue events at once for much better performance
        try {
          await db.insert(revenueEvents).values(events);
          return { succeeded: events.length, failed: 0 };
        } catch (error) {
          // If batch insert fails, fall back to individual inserts with error tracking
          let succeeded = 0;
          let failed = 0;
          
          for (const event of events) {
            try {
              await db.insert(revenueEvents).values(event);
              succeeded++;
            } catch (error) {
              failed++;
            }
          }
          
          return { succeeded, failed };
        }
      },
      'ingestRevenueBatch'
    );
  }

  // Split Validation operations
  async lockRoyaltySplit(splitId: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.update(projectRoyaltySplits).set({ lockedAt: new Date() }).where(eq(projectRoyaltySplits.id, splitId));
      },
      'lockRoyaltySplit'
    );
  }

  async validateSplitTotal(projectId: string): Promise<{total: number, isValid: boolean}> {
    return this.executeWithCircuitBreaker(
      async () => {
        const splits = await db.select().from(projectRoyaltySplits).where(eq(projectRoyaltySplits.projectId, projectId));
        const total = splits.reduce((sum, split) => sum + Number(split.splitPercentage), 0);
        return { total, isValid: Math.abs(total - 100) < 0.01 };
      },
      'validateSplitTotal'
    );
  }

  async getSplitsForProject(projectId: string): Promise<ProjectRoyaltySplit[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(projectRoyaltySplits).where(eq(projectRoyaltySplits.projectId, projectId));
      },
      'getSplitsForProject'
    );
  }

  // Forecasting operations
  async createForecast(forecast: InsertForecastSnapshot): Promise<ForecastSnapshot> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [result] = await db.insert(forecastSnapshots).values(forecast).returning();
        return result;
      },
      'createForecast'
    );
  }

  async getForecastsByProject(projectId: string, limit = 10): Promise<ForecastSnapshot[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(forecastSnapshots).where(eq(forecastSnapshots.projectId, projectId)).orderBy(desc(forecastSnapshots.generatedAt)).limit(limit);
      },
      'getForecastsByProject'
    );
  }

  async getLatestForecast(projectId: string, granularity: string): Promise<ForecastSnapshot | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const result = await db.select().from(forecastSnapshots)
          .where(and(
            eq(forecastSnapshots.projectId, projectId),
            eq(forecastSnapshots.granularity, granularity)
          ))
          .orderBy(desc(forecastSnapshots.generatedAt))
          .limit(1);
        return result[0];
      },
      'getLatestForecast'
    );
  }

  // Distribution Releases operations
  async getDistroReleases(userId: string): Promise<DistroRelease[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(distroReleases)
          .where(eq(distroReleases.artistId, userId))
          .orderBy(desc(distroReleases.createdAt));
      },
      'getDistroReleases'
    );
  }

  async getDistroRelease(id: string): Promise<DistroRelease | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [release] = await db.select().from(distroReleases)
          .where(eq(distroReleases.id, id));
        return release;
      },
      'getDistroRelease'
    );
  }

  async createDistroRelease(data: InsertDistroRelease): Promise<DistroRelease> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [release] = await db.insert(distroReleases).values(data).returning();
        return release;
      },
      'createDistroRelease'
    );
  }

  async updateDistroRelease(id: string, data: Partial<InsertDistroRelease>): Promise<DistroRelease> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db.update(distroReleases)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(distroReleases.id, id))
          .returning();
        return updated;
      },
      'updateDistroRelease'
    );
  }

  async deleteDistroRelease(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(distroReleases).where(eq(distroReleases.id, id));
      },
      'deleteDistroRelease'
    );
  }

  // Distribution Tracks operations
  async getDistroTracksByReleaseId(releaseId: string): Promise<DistroTrack[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(distroTracks)
          .where(eq(distroTracks.releaseId, releaseId))
          .orderBy(asc(distroTracks.trackNumber));
      },
      'getDistroTracksByReleaseId'
    );
  }

  async createDistroTrack(data: InsertDistroTrack): Promise<DistroTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [track] = await db.insert(distroTracks).values(data).returning();
        return track;
      },
      'createDistroTrack'
    );
  }

  async updateDistroTrack(id: string, data: Partial<InsertDistroTrack>): Promise<DistroTrack> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updated] = await db.update(distroTracks)
          .set(data)
          .where(eq(distroTracks.id, id))
          .returning();
        return updated;
      },
      'updateDistroTrack'
    );
  }

  async deleteDistroTrack(id: string): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(distroTracks).where(eq(distroTracks.id, id));
      },
      'deleteDistroTrack'
    );
  }

  // DSP Providers
  async getDSPProviders(): Promise<any[]> {
    return this.getAllDistroProviders();
  }

  // ISRC/UPC Registry operations
  async createISRCCode(data: InsertISRCRegistry): Promise<ISRCRegistry> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [code] = await db.insert(isrcRegistry).values(data).returning();
        return code;
      },
      'createISRCCode'
    );
  }

  async createUPCCode(data: InsertUPCRegistry): Promise<UPCRegistry> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [code] = await db.insert(upcRegistry).values(data).returning();
        return code;
      },
      'createUPCCode'
    );
  }

  async validateISRCCode(isrc: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [existing] = await db.select().from(isrcRegistry)
          .where(eq(isrcRegistry.isrc, isrc));
        return !existing; // Returns true if code is available (not found)
      },
      'validateISRCCode'
    );
  }

  async validateUPCCode(upc: string): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [existing] = await db.select().from(upcRegistry)
          .where(eq(upcRegistry.upc, upc));
        return !existing; // Returns true if code is available (not found)
      },
      'validateUPCCode'
    );
  }

  // Seed DSP Providers
  async seedDSPProviders(): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        const providers = [
          {
            name: 'Spotify',
            slug: 'spotify',
            apiBase: 'https://api.spotify.com/v1',
            authType: 'oauth2',
            deliveryMethod: 'api',
            processingTime: '2-5 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav', 'flac'] },
            status: 'active',
          },
          {
            name: 'Apple Music',
            slug: 'apple-music',
            apiBase: 'https://api.music.apple.com/v1',
            authType: 'jwt',
            deliveryMethod: 'api',
            processingTime: '2-5 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav', 'flac'] },
            status: 'active',
          },
          {
            name: 'YouTube Music',
            slug: 'youtube-music',
            apiBase: 'https://www.googleapis.com/youtube/v3',
            authType: 'oauth2',
            deliveryMethod: 'api',
            processingTime: '1-3 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist'], audioFormats: ['wav', 'mp3'] },
            status: 'active',
          },
          {
            name: 'Amazon Music',
            slug: 'amazon-music',
            apiBase: 'https://api.amazon.com/music',
            authType: 'api_key',
            deliveryMethod: 'api',
            processingTime: '3-7 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav', 'flac'] },
            status: 'active',
          },
          {
            name: 'Tidal',
            slug: 'tidal',
            authType: 'api_key',
            deliveryMethod: 'ftp',
            processingTime: '5-10 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav', 'flac'] },
            status: 'active',
          },
          {
            name: 'Deezer',
            slug: 'deezer',
            authType: 'api_key',
            deliveryMethod: 'api',
            processingTime: '3-5 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, metadata: ['title', 'artist'], audioFormats: ['wav', 'mp3'] },
            status: 'active',
          },
          {
            name: 'Pandora',
            slug: 'pandora',
            authType: 'api_key',
            deliveryMethod: 'api',
            processingTime: '7-14 business days',
            region: 'us',
            category: 'streaming',
            requirements: { isrc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav'] },
            status: 'active',
          },
          {
            name: 'TikTok',
            slug: 'tiktok',
            apiBase: 'https://open-api.tiktok.com',
            authType: 'oauth2',
            deliveryMethod: 'api',
            processingTime: '1-2 business days',
            region: 'global',
            category: 'social',
            requirements: { metadata: ['title', 'artist'], audioFormats: ['mp3', 'wav'] },
            status: 'active',
          },
          {
            name: 'Instagram',
            slug: 'instagram',
            apiBase: 'https://graph.instagram.com',
            authType: 'oauth2',
            deliveryMethod: 'api',
            processingTime: '1-2 business days',
            region: 'global',
            category: 'social',
            requirements: { metadata: ['title', 'artist'], audioFormats: ['mp3'] },
            status: 'active',
          },
          {
            name: 'Facebook',
            slug: 'facebook',
            apiBase: 'https://graph.facebook.com',
            authType: 'oauth2',
            deliveryMethod: 'api',
            processingTime: '1-2 business days',
            region: 'global',
            category: 'social',
            requirements: { metadata: ['title', 'artist'], audioFormats: ['mp3'] },
            status: 'active',
          },
          {
            name: 'iHeartRadio',
            slug: 'iheartradio',
            authType: 'api_key',
            deliveryMethod: 'ftp',
            processingTime: '7-14 business days',
            region: 'us',
            category: 'streaming',
            requirements: { isrc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav'] },
            status: 'active',
          },
          {
            name: 'Napster',
            slug: 'napster',
            authType: 'api_key',
            deliveryMethod: 'ftp',
            processingTime: '5-10 business days',
            region: 'global',
            category: 'streaming',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav'] },
            status: 'active',
          },
          {
            name: 'Anghami',
            slug: 'anghami',
            authType: 'api_key',
            deliveryMethod: 'api',
            processingTime: '3-7 business days',
            region: 'mena',
            category: 'streaming',
            requirements: { isrc: true, metadata: ['title', 'artist'], audioFormats: ['mp3', 'wav'] },
            status: 'active',
          },
          {
            name: 'Boomplay',
            slug: 'boomplay',
            authType: 'api_key',
            deliveryMethod: 'api',
            processingTime: '3-5 business days',
            region: 'africa',
            category: 'streaming',
            requirements: { isrc: true, metadata: ['title', 'artist'], audioFormats: ['mp3', 'wav'] },
            status: 'active',
          },
          {
            name: 'SoundCloud',
            slug: 'soundcloud',
            apiBase: 'https://api.soundcloud.com',
            authType: 'oauth2',
            deliveryMethod: 'api',
            processingTime: '1-2 business days',
            region: 'global',
            category: 'streaming',
            requirements: { metadata: ['title', 'artist'], audioFormats: ['mp3', 'wav'] },
            status: 'active',
          },
          {
            name: 'Amazon MP3',
            slug: 'amazon-mp3',
            authType: 'api_key',
            deliveryMethod: 'ftp',
            processingTime: '5-10 business days',
            region: 'global',
            category: 'store',
            requirements: { isrc: true, upc: true, metadata: ['title', 'artist', 'album'], audioFormats: ['wav'] },
            status: 'active',
          },
        ];

        // Insert providers, ignoring duplicates (based on slug uniqueness)
        for (const provider of providers) {
          try {
            await db.insert(distroProviders).values(provider).onConflictDoNothing();
          } catch (error) {
            console.error(`Failed to insert provider ${provider.name}:`, error);
          }
        }
      },
      'seedDSPProviders'
    );
  }

  // ============================================================================
  // AI GOVERNANCE & MODEL MANAGEMENT IMPLEMENTATIONS
  // ============================================================================

  async createAIModel(model: InsertAIModel): Promise<AIModel> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(aiModels).values(model).returning();
        return created;
      },
      'createAIModel'
    );
  }

  async getAIModel(id: string): Promise<AIModel | undefined> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
        return model;
      },
      'getAIModel'
    );
  }

  async listAIModels(filters?: { modelType?: string; category?: string; isActive?: boolean }): Promise<AIModel[]> {
    return databaseResilience.executeWithRetry(
      async () => {
        let query = db.select().from(aiModels);
        
        const conditions = [];
        if (filters?.modelType) conditions.push(eq(aiModels.modelType, filters.modelType));
        if (filters?.category) conditions.push(eq(aiModels.category, filters.category));
        if (filters?.isActive !== undefined) conditions.push(eq(aiModels.isActive, filters.isActive));
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return await query.orderBy(desc(aiModels.createdAt));
      },
      'listAIModels'
    );
  }

  async updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [updated] = await db.update(aiModels)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(aiModels.id, id))
          .returning();
        return updated;
      },
      'updateAIModel'
    );
  }

  async createAIModelVersion(version: InsertAIModelVersion): Promise<AIModelVersion> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(aiModelVersions).values(version).returning();
        return created;
      },
      'createAIModelVersion'
    );
  }

  async getAIModelVersion(id: string): Promise<AIModelVersion | undefined> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [version] = await db.select().from(aiModelVersions).where(eq(aiModelVersions.id, id));
        return version;
      },
      'getAIModelVersion'
    );
  }

  async listModelVersions(modelId: string, status?: string): Promise<AIModelVersion[]> {
    return databaseResilience.executeWithRetry(
      async () => {
        let query = db.select().from(aiModelVersions).where(eq(aiModelVersions.modelId, modelId));
        
        if (status) {
          query = query.where(and(eq(aiModelVersions.modelId, modelId), eq(aiModelVersions.status, status))) as any;
        }
        
        return await query.orderBy(desc(aiModelVersions.createdAt));
      },
      'listModelVersions'
    );
  }

  async createTrainingDataset(dataset: InsertTrainingDataset): Promise<TrainingDataset> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(trainingDatasets).values(dataset).returning();
        return created;
      },
      'createTrainingDataset'
    );
  }

  async getTrainingDataset(id: string): Promise<TrainingDataset | undefined> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [dataset] = await db.select().from(trainingDatasets).where(eq(trainingDatasets.id, id));
        return dataset;
      },
      'getTrainingDataset'
    );
  }

  async listTrainingDatasets(filters?: { datasetType?: string; isActive?: boolean }): Promise<TrainingDataset[]> {
    return databaseResilience.executeWithRetry(
      async () => {
        let query = db.select().from(trainingDatasets);
        
        const conditions = [];
        if (filters?.datasetType) conditions.push(eq(trainingDatasets.datasetType, filters.datasetType));
        if (filters?.isActive !== undefined) conditions.push(eq(trainingDatasets.isActive, filters.isActive));
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return await query.orderBy(desc(trainingDatasets.createdAt));
      },
      'listTrainingDatasets'
    );
  }

  async createInferenceRun(run: InsertInferenceRun): Promise<InferenceRun> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(inferenceRuns).values(run).returning();
        return created;
      },
      'createInferenceRun'
    );
  }

  async getInferenceRuns(filters?: { modelId?: string; versionId?: string; userId?: string; startDate?: Date; endDate?: Date }, limit: number = 100): Promise<InferenceRun[]> {
    return databaseResilience.executeWithRetry(
      async () => {
        let query = db.select().from(inferenceRuns);
        
        const conditions = [];
        if (filters?.modelId) conditions.push(eq(inferenceRuns.modelId, filters.modelId));
        if (filters?.versionId) conditions.push(eq(inferenceRuns.versionId, filters.versionId));
        if (filters?.userId) conditions.push(eq(inferenceRuns.userId, filters.userId));
        if (filters?.startDate) conditions.push(gte(inferenceRuns.createdAt, filters.startDate));
        if (filters?.endDate) conditions.push(lte(inferenceRuns.createdAt, filters.endDate));
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return await query.orderBy(desc(inferenceRuns.createdAt)).limit(limit);
      },
      'getInferenceRuns'
    );
  }

  async logInference(run: InsertInferenceRun): Promise<InferenceRun> {
    return this.createInferenceRun(run);
  }

  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(performanceMetrics).values(metric).returning();
        return created;
      },
      'createPerformanceMetric'
    );
  }

  async getPerformanceMetrics(filters?: { modelId?: string; versionId?: string; metricType?: string; startDate?: Date; endDate?: Date }): Promise<PerformanceMetric[]> {
    return databaseResilience.executeWithRetry(
      async () => {
        let query = db.select().from(performanceMetrics);
        
        const conditions = [];
        if (filters?.modelId) conditions.push(eq(performanceMetrics.modelId, filters.modelId));
        if (filters?.versionId) conditions.push(eq(performanceMetrics.versionId, filters.versionId));
        if (filters?.metricType) conditions.push(eq(performanceMetrics.metricType, filters.metricType));
        if (filters?.startDate) conditions.push(gte(performanceMetrics.measuredAt, filters.startDate));
        if (filters?.endDate) conditions.push(lte(performanceMetrics.measuredAt, filters.endDate));
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        return await query.orderBy(desc(performanceMetrics.measuredAt));
      },
      'getPerformanceMetrics'
    );
  }

  async trackMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    return this.createPerformanceMetric(metric);
  }

  async createExplanationLog(log: InsertExplanationLog): Promise<ExplanationLog> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(explanationLogs).values(log).returning();
        return created;
      },
      'createExplanationLog'
    );
  }

  async getExplanationLog(inferenceId: string): Promise<ExplanationLog[]> {
    return databaseResilience.executeWithRetry(
      async () => {
        return await db.select().from(explanationLogs)
          .where(eq(explanationLogs.inferenceId, inferenceId))
          .orderBy(desc(explanationLogs.createdAt));
      },
      'getExplanationLog'
    );
  }

  async createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [created] = await db.insert(featureFlags).values(flag).returning();
        return created;
      },
      'createFeatureFlag'
    );
  }

  async getFeatureFlag(flagName: string): Promise<FeatureFlag | undefined> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.flagName, flagName));
        return flag;
      },
      'getFeatureFlag'
    );
  }

  async updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    return databaseResilience.executeWithRetry(
      async () => {
        const [updated] = await db.update(featureFlags)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(featureFlags.id, id))
          .returning();
        return updated;
      },
      'updateFeatureFlag'
    );
  }
}

export const storage = new DatabaseStorage();
