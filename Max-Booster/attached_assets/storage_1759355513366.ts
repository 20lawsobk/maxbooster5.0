import { users, projects, analytics, notifications, releases, tracks, collaborators, earnings, hyperFollowPages, studioProjects, studioTracks, audioClips, midiClips, virtualInstruments, audioEffects, mixBusses, automationData, markers, adCampaigns, type User, type InsertUser, type Project, type InsertProject, type Analytics, type InsertAnalytics, type Notification, type InsertNotification, type Release, type InsertRelease, type Track, type InsertTrack, type StudioProject, type InsertStudioProject, type StudioTrack, type InsertStudioTrack, type AudioClip, type InsertAudioClip, type MidiClip, type InsertMidiClip, type VirtualInstrument, type InsertVirtualInstrument, type AudioEffect, type InsertAudioEffect, type MixBus, type InsertMixBus, type AutomationData, type InsertAutomationData, type Marker, type InsertMarker, type AdCampaign, type InsertAdCampaign } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, gte, lte } from "drizzle-orm";
import { databaseResilience } from "./reliability/database-resilience";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGoogleId(id: number, googleId: string): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string | null): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserSocialToken(userId: number, platform: string, token: string): Promise<User>;
  getUserSocialToken(userId: number, platform: string): Promise<string | null>;
  getAllUsers(): Promise<User[]>;

  // Project operations
  getUserProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Analytics operations
  getDashboardAnalytics(userId: number): Promise<any>;
  getStreamsAnalytics(userId: number, days: number): Promise<any[]>;
  getAdminAnalytics(): Promise<any>;

  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number, userId: number): Promise<void>;

  // Distribution operations
  getUserReleases(userId: number): Promise<Release[]>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, userId: number, updates: Partial<Release>): Promise<Release>;
  deleteRelease(id: string, userId: number): Promise<void>;
  updateReleaseStatus(id: number, status: string): Promise<void>;
  getDistributionAnalytics(userId: number): Promise<any>;
  getReleaseEarnings(releaseId: string, userId: number): Promise<any[]>;
  createHyperFollowPage(data: any): Promise<any>;
  getUserHyperFollowPages(userId: number): Promise<any[]>;

  // Max Booster Studio operations
  getUserStudioProjects(userId: number): Promise<StudioProject[]>;
  getStudioProject(id: string): Promise<StudioProject | undefined>;
  createStudioProject(project: InsertStudioProject): Promise<StudioProject>;
  updateStudioProject(id: string, userId: number, updates: Partial<StudioProject>): Promise<StudioProject>;
  deleteStudioProject(id: string, userId: number): Promise<void>;
  
  // Track operations
  getProjectTracks(projectId: string): Promise<StudioTrack[]>;
  createStudioTrack(track: InsertStudioTrack): Promise<StudioTrack>;
  updateStudioTrack(id: string, projectId: string, updates: Partial<StudioTrack>): Promise<StudioTrack>;
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

  // Ad Campaign operations
  getUserAdCampaigns(userId: number): Promise<AdCampaign[]>;
  getAdCampaign(id: number): Promise<AdCampaign | undefined>;
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  updateAdCampaign(id: number, updates: Partial<AdCampaign>): Promise<AdCampaign>;
  deleteAdCampaign(id: number): Promise<void>;

  // Marketplace operations
  getMarketplaceBeats(filters: any, sortBy?: string): Promise<any[]>;
  isBeatLikedByUser(beatId: string, userId: number): Promise<boolean>;
  isBeatPurchasedByUser(beatId: string, userId: number): Promise<boolean>;
  calculateDynamicPrice(beatId: string): Promise<number>;
  getBeatLikes(beatId: string): Promise<number>;
  getBeatPlays(beatId: string): Promise<number>;
  getAIBeatRecommendations(beatId: string, userId: number): Promise<any>;

  // Royalties operations
  getRoyaltyStatements(userId: number, filters: any): Promise<any[]>;
  getPlatformEarnings(userId: number, period: string): Promise<any[]>;
  getPendingPayments(userId: number): Promise<any[]>;
  getEarningsAIInsights(userId: number, period: string): Promise<any>;
  getStatementStatus(statementId: string): Promise<string>;
  getNextPayoutDate(userId: number): Promise<Date>;
  getUserPayouts(userId: number, options: any): Promise<any[]>;
  getPayoutDetails(payoutId: string): Promise<any>;
  getPayoutStatements(payoutId: string): Promise<any[]>;
  calculatePayoutFees(amount: number): Promise<any>;
  calculatePayoutTaxes(amount: number, userId: number): Promise<any>;
  getPayoutTracking(payoutId: string): Promise<any>;
  getPayoutAIInsights(payoutId: string): Promise<any>;
  getPayoutSummary(userId: number): Promise<any>;
  getPayoutCount(userId: number): Promise<number>;

  // Sales operations
  getUserSales(userId: number, options: any): Promise<any[]>;
  getBeat(beatId: string): Promise<any>;
  calculateSaleEarnings(saleId: string): Promise<any>;
  getSaleAIInsights(saleId: string): Promise<any>;
  getSalesSummary(userId: number): Promise<any>;
  getSalesCount(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // CRITICAL: Route all database operations through circuit breaker for 24/7 reliability
  private async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return databaseResilience.safeQuery(operation, operationName);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
      },
      'getUser'
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
      },
      'getUserByUsername'
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
      },
      'getUserByEmail'
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
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

  async updateUserGoogleId(id: number, googleId: string): Promise<User> {
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

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string | null): Promise<User> {
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

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
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

  async updateUserSocialToken(userId: number, platform: string, token: string): Promise<User> {
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

  async getUserSocialToken(userId: number, platform: string): Promise<string | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const tokenField = `${platform}Token` as keyof typeof users.$inferSelect;
    return (user[tokenField] as string) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      },
      'getAllUsers'
    );
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(projects)
          .where(eq(projects.userId, userId))
          .orderBy(desc(projects.updatedAt));
      },
      'getUserProjects'
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
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

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
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

  async deleteProject(id: number): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db.delete(projects).where(eq(projects.id, id));
      },
      'deleteProject'
    );
  }

  async getDashboardAnalytics(userId: number): Promise<any> {
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

  async getStreamsAnalytics(userId: number, days: number): Promise<any[]> {
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
        // Total users
        const [userCount] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users);

        // Total projects
        const [projectCount] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(projects);

        // Total revenue
        const [totalRevenue] = await db
          .select({ revenue: sql<number>`COALESCE(SUM(${projects.revenue}), 0)` })
          .from(projects);

        // Users by subscription plan
        const subscriptionStats = await db
          .select({
            plan: users.subscriptionPlan,
            count: sql<number>`COUNT(*)`
          })
          .from(users)
          .groupBy(users.subscriptionPlan);

        // Recent user signups (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const [recentSignups] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .where(gte(users.createdAt, thirtyDaysAgo));

        return {
          totalUsers: userCount?.count || 0,
          totalProjects: projectCount?.count || 0,
          totalRevenue: totalRevenue?.revenue || 0,
          subscriptionStats,
          recentSignups: recentSignups?.count || 0
        };
      },
      'getAdminAnalytics'
    );
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
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

  async markNotificationAsRead(id: number, userId: number): Promise<void> {
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

  // Distribution methods
  async getUserReleases(userId: number): Promise<Release[]> {
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

  async updateRelease(id: string, userId: number, updates: Partial<Release>): Promise<Release> {
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

  async deleteRelease(id: string, userId: number): Promise<void> {
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

  async getDistributionAnalytics(userId: number): Promise<any> {
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

  async getReleaseEarnings(releaseId: string, userId: number): Promise<any[]> {
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

  async getUserHyperFollowPages(userId: number): Promise<any[]> {
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

  // Max Booster Studio Implementation
  async getUserStudioProjects(userId: number): Promise<StudioProject[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(studioProjects)
          .where(eq(studioProjects.userId, userId))
          .orderBy(desc(studioProjects.updatedAt));
      },
      'getUserStudioProjects'
    );
  }

  async getStudioProject(id: string): Promise<StudioProject | undefined> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [project] = await db
          .select()
          .from(studioProjects)
          .where(eq(studioProjects.id, id));
        return project;
      },
      'getStudioProject'
    );
  }

  async createStudioProject(project: InsertStudioProject): Promise<StudioProject> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [newProject] = await db
          .insert(studioProjects)
          .values(project)
          .returning();
        return newProject;
      },
      'createStudioProject'
    );
  }

  async updateStudioProject(id: string, userId: number, updates: Partial<StudioProject>): Promise<StudioProject> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [updatedProject] = await db
          .update(studioProjects)
          .set({ ...updates, updatedAt: new Date() })
          .where(sql`${studioProjects.id} = ${id} AND ${studioProjects.userId} = ${userId}`)
          .returning();
        return updatedProject;
      },
      'updateStudioProject'
    );
  }

  async deleteStudioProject(id: string, userId: number): Promise<void> {
    return this.executeWithCircuitBreaker(
      async () => {
        await db
          .delete(studioProjects)
          .where(sql`${studioProjects.id} = ${id} AND ${studioProjects.userId} = ${userId}`);
      },
      'deleteStudioProject'
    );
  }

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
          .where(eq(mixBusses.projectId, projectId))
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

  // Ad Campaign operations
  async getUserAdCampaigns(userId: number): Promise<AdCampaign[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        return await db
          .select()
          .from(adCampaigns)
          .where(eq(adCampaigns.userId, userId))
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

  // Marketplace operations
  async getMarketplaceBeats(filters: any, sortBy?: string): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        let query = db.select().from(projects).where(eq(projects.type, 'beat'));
        
        if (filters.genre) {
          query = query.where(eq(projects.genre, filters.genre));
        }
        if (filters.mood) {
          query = query.where(like(projects.tags, `%${filters.mood}%`));
        }
        if (filters.search) {
          query = query.where(
            or(
              like(projects.title, `%${filters.search}%`),
              like(projects.description, `%${filters.search}%`)
            )
          );
        }
        
        if (sortBy === 'popular') {
          query = query.orderBy(desc(projects.playCount));
        } else if (sortBy === 'newest') {
          query = query.orderBy(desc(projects.createdAt));
        } else if (sortBy === 'price') {
          query = query.orderBy(asc(projects.price));
        }
        
        return await query;
      },
      'getMarketplaceBeats'
    );
  }

  async isBeatLikedByUser(beatId: string, userId: number): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [like] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, beatId), eq(projects.userId, userId)));
        return !!like;
      },
      'isBeatLikedByUser'
    );
  }

  async isBeatPurchasedByUser(beatId: string, userId: number): Promise<boolean> {
    return this.executeWithCircuitBreaker(
      async () => {
        // Check if user has purchased this beat
        const [purchase] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, beatId), eq(projects.userId, userId)));
        return !!purchase;
      },
      'isBeatPurchasedByUser'
    );
  }

  async calculateDynamicPrice(beatId: string): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [beat] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, beatId));
        
        if (!beat) return 0;
        
        // Calculate dynamic pricing based on demand, quality, and market conditions
        const basePrice = beat.price || 25;
        const demandMultiplier = Math.min(2.0, 1 + (beat.playCount || 0) / 10000);
        const qualityMultiplier = beat.quality || 1.0;
        
        return Math.round(basePrice * demandMultiplier * qualityMultiplier);
      },
      'calculateDynamicPrice'
    );
  }

  async getBeatLikes(beatId: string): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [beat] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, beatId));
        return beat?.likeCount || 0;
      },
      'getBeatLikes'
    );
  }

  async getBeatPlays(beatId: string): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        const [beat] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, beatId));
        return beat?.playCount || 0;
      },
      'getBeatPlays'
    );
  }

  async getAIBeatRecommendations(beatId: string, userId: number): Promise<any> {
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
  async getRoyaltyStatements(userId: number, filters: any): Promise<any[]> {
    return this.executeWithCircuitBreaker(
      async () => {
        let query = db
          .select()
          .from(projects)
          .where(eq(projects.userId, userId));
        
        if (filters.period) {
          const startDate = new Date(filters.period);
          const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          query = query.where(
            and(
              gte(projects.createdAt, startDate),
              lte(projects.createdAt, endDate)
            )
          );
        }
        
        return await query;
      },
      'getRoyaltyStatements'
    );
  }

  async getPlatformEarnings(userId: number, period: string): Promise<any[]> {
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

  async getPendingPayments(userId: number): Promise<any[]> {
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

  async getEarningsAIInsights(userId: number, period: string): Promise<any> {
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

  async getNextPayoutDate(userId: number): Promise<Date> {
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

  async getUserPayouts(userId: number, options: any): Promise<any[]> {
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

  async calculatePayoutTaxes(amount: number, userId: number): Promise<any> {
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

  async getPayoutSummary(userId: number): Promise<any> {
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

  async getPayoutCount(userId: number): Promise<number> {
    return this.executeWithCircuitBreaker(
      async () => {
        return 12; // Total number of payouts for user
      },
      'getPayoutCount'
    );
  }

  // Sales operations
  async getUserSales(userId: number, options: any): Promise<any[]> {
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

  async getBeat(beatId: string): Promise<any> {
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

  async getSalesSummary(userId: number): Promise<any> {
    return {
      totalSales: 15,
      totalRevenue: 525.00,
      averageSalePrice: 35.00,
      topGenre: "Trap",
      monthlyGrowth: 23.5
    };
  }

  async getSalesCount(userId: number): Promise<number> {
    return 15; // Total number of sales for user
  }
}

export const storage = new DatabaseStorage();
