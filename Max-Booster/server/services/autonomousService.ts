import { storage } from '../storage';
import { socialQueueService } from './socialQueueService';
import { advertisingDispatchService } from './advertisingDispatchService';
import { approvalService } from './approvalService';
import type { SocialPost, AdCampaign } from '@shared/schema';

/**
 * Autonomous Service - Manages fully autonomous operations
 * Can bypass approval workflows when AUTONOMOUS_MODE is enabled
 */
export class AutonomousService {
  private autonomousMode: boolean;
  private autonomousWhitelist: Set<string> = new Set();
  
  constructor() {
    // Check environment variable or database config
    this.autonomousMode = process.env.AUTONOMOUS_MODE === 'true' || false;
    
    // Initialize with admin users who can enable autonomous mode
    this.loadAutonomousWhitelist();
  }
  
  /**
   * Load users who have autonomous mode enabled
   */
  private async loadAutonomousWhitelist(): Promise<void> {
    try {
      // Load from database - users with autonomous_enabled flag
      const autonomousUsers = await storage.getAutonomousUsers();
      this.autonomousWhitelist = new Set(autonomousUsers.map(u => u.id));
    } catch (error) {
      console.error('Error loading autonomous whitelist:', error);
    }
  }
  
  /**
   * Check if a user has autonomous mode enabled
   */
  isAutonomousEnabled(userId: string): boolean {
    return this.autonomousMode || this.autonomousWhitelist.has(userId);
  }
  
  /**
   * Enable/disable autonomous mode for a user
   */
  async setAutonomousMode(userId: string, enabled: boolean): Promise<void> {
    if (enabled) {
      this.autonomousWhitelist.add(userId);
    } else {
      this.autonomousWhitelist.delete(userId);
    }
    
    // Update database
    await storage.updateUser(userId, { autonomousEnabled: enabled });
  }
  
  /**
   * Post content autonomously (bypassing approval if enabled)
   */
  async postContent(
    userId: string,
    content: Partial<SocialPost>,
    platforms: string[]
  ): Promise<{ success: boolean; postId?: string; requiresApproval: boolean }> {
    try {
      const isAutonomous = this.isAutonomousEnabled(userId);
      
      if (isAutonomous) {
        // AUTONOMOUS MODE: Direct publishing without approval
        console.log(`[AUTONOMOUS] Publishing content directly for user ${userId}`);
        
        // Create post and mark as auto-approved
        const post = await storage.createSocialPost({
          ...content,
          userId,
          platforms,
          status: 'scheduled',
          approvalStatus: 'auto-approved',
          approvedBy: 'autonomous-system',
          approvedAt: new Date(),
        } as any);
        
        // Queue for immediate publishing
        await socialQueueService.schedulePost(post.id, new Date());
        
        // Trigger immediate dispatch
        await this.dispatchAutonomousContent(post.id);
        
        return {
          success: true,
          postId: post.id,
          requiresApproval: false
        };
      } else {
        // APPROVAL MODE: Route through approval workflow
        console.log(`[APPROVAL] Routing content through approval for user ${userId}`);
        
        // Create post pending approval
        const post = await storage.createSocialPost({
          ...content,
          userId,
          platforms,
          status: 'draft',
          approvalStatus: 'pending',
        } as any);
        
        // Submit for approval
        await approvalService.submitForApproval({
          type: 'social_post',
          itemId: post.id,
          userId,
          metadata: { platforms, content: content.content }
        });
        
        return {
          success: true,
          postId: post.id,
          requiresApproval: true
        };
      }
    } catch (error) {
      console.error('Error in autonomous posting:', error);
      return {
        success: false,
        requiresApproval: !this.isAutonomousEnabled(userId)
      };
    }
  }
  
  /**
   * Launch advertising campaign autonomously
   */
  async launchCampaign(
    userId: string,
    campaign: Partial<AdCampaign>
  ): Promise<{ success: boolean; campaignId?: string; requiresApproval: boolean }> {
    try {
      const isAutonomous = this.isAutonomousEnabled(userId);
      
      if (isAutonomous) {
        // AUTONOMOUS MODE: Direct campaign launch
        console.log(`[AUTONOMOUS] Launching campaign directly for user ${userId}`);
        
        // Create campaign and mark as auto-approved
        const newCampaign = await storage.createAdCampaign({
          ...campaign,
          userId,
          status: 'active',
          approvalStatus: 'auto-approved',
          approvedBy: 'autonomous-system',
          approvedAt: new Date(),
        } as any);
        
        // Start campaign immediately
        await advertisingDispatchService.startCampaign(newCampaign.id);
        
        // Begin autonomous optimization
        await this.optimizeCampaignAutonomously(newCampaign.id);
        
        return {
          success: true,
          campaignId: newCampaign.id,
          requiresApproval: false
        };
      } else {
        // APPROVAL MODE: Route through approval workflow
        console.log(`[APPROVAL] Routing campaign through approval for user ${userId}`);
        
        // Create campaign pending approval
        const newCampaign = await storage.createAdCampaign({
          ...campaign,
          userId,
          status: 'draft',
          approvalStatus: 'pending',
        } as any);
        
        // Submit for approval
        await approvalService.submitForApproval({
          type: 'ad_campaign',
          itemId: newCampaign.id,
          userId,
          metadata: { 
            budget: campaign.budget,
            targetAudience: campaign.targetAudience 
          }
        });
        
        return {
          success: true,
          campaignId: newCampaign.id,
          requiresApproval: true
        };
      }
    } catch (error) {
      console.error('Error in autonomous campaign launch:', error);
      return {
        success: false,
        requiresApproval: !this.isAutonomousEnabled(userId)
      };
    }
  }
  
  /**
   * Dispatch content autonomously without waiting
   */
  private async dispatchAutonomousContent(postId: string): Promise<void> {
    try {
      // Get post details
      const post = await storage.getSocialPost(postId);
      if (!post) return;
      
      // Publish to all platforms immediately
      for (const platform of post.platforms || []) {
        await socialQueueService.publishToPlatform(postId, platform);
      }
      
      // Update status
      await storage.updateSocialPost(postId, {
        status: 'published',
        publishedAt: new Date()
      });
      
      console.log(`[AUTONOMOUS] Content ${postId} published successfully`);
    } catch (error) {
      console.error(`[AUTONOMOUS] Error dispatching content ${postId}:`, error);
    }
  }
  
  /**
   * Continuously optimize campaign using AI
   */
  private async optimizeCampaignAutonomously(campaignId: string): Promise<void> {
    // This runs in background, optimizing the campaign 24/7
    setInterval(async () => {
      try {
        const campaign = await storage.getAdCampaign(campaignId);
        if (!campaign || campaign.status !== 'active') return;
        
        // Get performance metrics
        const metrics = await advertisingDispatchService.getCampaignMetrics(campaignId);
        
        // AI-driven optimization decisions
        if (metrics.ctr < 0.01) {
          // Low CTR - adjust targeting
          await advertisingDispatchService.optimizeTargeting(campaignId);
        }
        
        if (metrics.conversionRate < 0.02) {
          // Low conversions - adjust creative
          await advertisingDispatchService.optimizeCreative(campaignId);
        }
        
        if (metrics.roas < 2) {
          // Low ROAS - adjust bidding
          await advertisingDispatchService.optimizeBidding(campaignId);
        }
        
        console.log(`[AUTONOMOUS] Campaign ${campaignId} optimized - CTR: ${metrics.ctr}, ROAS: ${metrics.roas}`);
      } catch (error) {
        console.error(`[AUTONOMOUS] Error optimizing campaign ${campaignId}:`, error);
      }
    }, 300000); // Optimize every 5 minutes
  }
  
  /**
   * Run 24/7 autonomous operations
   */
  startAutonomousOperations(): void {
    console.log('[AUTONOMOUS] Starting 24/7 autonomous operations...');
    
    // Check for scheduled posts every minute
    setInterval(async () => {
      try {
        const autonomousUsers = Array.from(this.autonomousWhitelist);
        
        for (const userId of autonomousUsers) {
          // Get user's content queue
          const pendingPosts = await storage.getPendingSocialPosts(userId);
          
          for (const post of pendingPosts) {
            if (post.scheduledAt && new Date(post.scheduledAt) <= new Date()) {
              await this.dispatchAutonomousContent(post.id);
            }
          }
          
          // Check campaigns that need optimization
          const activeCampaigns = await storage.getActiveAdCampaigns(userId);
          for (const campaign of activeCampaigns) {
            // Autonomous campaigns continuously optimize
            if (campaign.approvalStatus === 'auto-approved') {
              await advertisingDispatchService.optimizeCampaign(campaign.id);
            }
          }
        }
      } catch (error) {
        console.error('[AUTONOMOUS] Error in 24/7 operations:', error);
      }
    }, 60000); // Run every minute
    
    console.log('[AUTONOMOUS] 24/7 operations started successfully');
  }
}

// Export singleton instance
export const autonomousService = new AutonomousService();

// Start autonomous operations on service initialization
autonomousService.startAutonomousOperations();