import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePremium } from '../middleware/requirePremium';
import { AutonomousService } from '../services/autonomousService';
import { db } from '../db';
import { autonomousSettings, socialMediaPosts, campaigns } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../logger';

const router = Router();
const autonomousService = new AutonomousService();

/**
 * Get autonomous settings
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const [settings] = await db.select().from(autonomousSettings)
      .where(eq(autonomousSettings.userId, userId));
    
    res.json(settings || {
      enabled: false,
      requireApproval: true,
      postFrequency: 'daily',
      contentTypes: ['promotional', 'engagement', 'educational'],
      activeHours: { start: 9, end: 21 },
      platforms: []
    });
  } catch (error) {
    logger.error('Error fetching autonomous settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * Update autonomous settings
 */
router.put('/settings', requireAuth, requirePremium, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const settings = req.body;
    
    // Check if settings exist
    const [existing] = await db.select().from(autonomousSettings)
      .where(eq(autonomousSettings.userId, userId));
    
    if (existing) {
      // Update existing
      await db.update(autonomousSettings)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(eq(autonomousSettings.userId, userId));
    } else {
      // Create new
      await db.insert(autonomousSettings).values({
        userId,
        ...settings
      });
    }
    
    // If enabling fully autonomous mode, start the service
    if (settings.enabled && !settings.requireApproval) {
      autonomousService.startAutonomousMode(userId);
    } else if (!settings.enabled) {
      autonomousService.stopAutonomousMode(userId);
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    logger.error('Error updating autonomous settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * Get pending content for approval
 */
router.get('/pending', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const pendingContent = await db.select().from(socialMediaPosts)
      .where(and(
        eq(socialMediaPosts.userId, userId),
        eq(socialMediaPosts.status, 'pending_approval')
      ))
      .orderBy(desc(socialMediaPosts.createdAt))
      .limit(20);
    
    res.json(pendingContent);
  } catch (error) {
    logger.error('Error fetching pending content:', error);
    res.status(500).json({ error: 'Failed to fetch pending content' });
  }
});

/**
 * Approve content
 */
router.post('/approve/:postId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { postId } = req.params;
    const { modifications } = req.body;
    
    // Verify ownership
    const [post] = await db.select().from(socialMediaPosts)
      .where(and(
        eq(socialMediaPosts.id, postId),
        eq(socialMediaPosts.userId, userId)
      ));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Apply modifications if any
    const finalContent = modifications?.content || post.content;
    const finalMedia = modifications?.media || post.media;
    
    // Update status and content
    await db.update(socialMediaPosts)
      .set({
        status: 'approved',
        content: finalContent,
        media: finalMedia,
        approvedAt: new Date()
      })
      .where(eq(socialMediaPosts.id, postId));
    
    // Schedule for posting
    await autonomousService.schedulePost(userId, postId);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error approving content:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

/**
 * Reject content
 */
router.post('/reject/:postId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { postId } = req.params;
    const { reason } = req.body;
    
    // Verify ownership
    const [post] = await db.select().from(socialMediaPosts)
      .where(and(
        eq(socialMediaPosts.id, postId),
        eq(socialMediaPosts.userId, userId)
      ));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Update status
    await db.update(socialMediaPosts)
      .set({
        status: 'rejected',
        metadata: {
          ...post.metadata,
          rejectionReason: reason,
          rejectedAt: new Date()
        }
      })
      .where(eq(socialMediaPosts.id, postId));
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error rejecting content:', error);
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

/**
 * Generate content now
 */
router.post('/generate', requireAuth, requirePremium, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { type, topic, tone, platforms } = req.body;
    
    const content = await autonomousService.generateContent(userId, {
      type: type || 'promotional',
      topic,
      tone: tone || 'professional',
      platforms: platforms || ['twitter', 'instagram', 'facebook']
    });
    
    res.json(content);
  } catch (error) {
    logger.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

/**
 * Get autonomous activity log
 */
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Get recent posts
    const recentPosts = await db.select().from(socialMediaPosts)
      .where(eq(socialMediaPosts.userId, userId))
      .orderBy(desc(socialMediaPosts.createdAt))
      .limit(50);
    
    // Get active campaigns
    const activeCampaigns = await db.select().from(campaigns)
      .where(and(
        eq(campaigns.userId, userId),
        eq(campaigns.status, 'active')
      ));
    
    res.json({
      posts: recentPosts,
      campaigns: activeCampaigns,
      stats: {
        totalPosts: recentPosts.length,
        pendingApproval: recentPosts.filter(p => p.status === 'pending_approval').length,
        published: recentPosts.filter(p => p.status === 'published').length,
        scheduled: recentPosts.filter(p => p.status === 'scheduled').length
      }
    });
  } catch (error) {
    logger.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

/**
 * Start autonomous mode
 */
router.post('/start', requireAuth, requirePremium, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Start autonomous operations
    await autonomousService.startAutonomousMode(userId);
    
    // Update settings
    await db.update(autonomousSettings)
      .set({
        enabled: true,
        updatedAt: new Date()
      })
      .where(eq(autonomousSettings.userId, userId));
    
    res.json({ 
      success: true,
      message: 'Autonomous mode activated'
    });
  } catch (error) {
    logger.error('Error starting autonomous mode:', error);
    res.status(500).json({ error: 'Failed to start autonomous mode' });
  }
});

/**
 * Stop autonomous mode
 */
router.post('/stop', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Stop autonomous operations
    await autonomousService.stopAutonomousMode(userId);
    
    // Update settings
    await db.update(autonomousSettings)
      .set({
        enabled: false,
        updatedAt: new Date()
      })
      .where(eq(autonomousSettings.userId, userId));
    
    res.json({ 
      success: true,
      message: 'Autonomous mode deactivated'
    });
  } catch (error) {
    logger.error('Error stopping autonomous mode:', error);
    res.status(500).json({ error: 'Failed to stop autonomous mode' });
  }
});

/**
 * Manual sync with platforms
 */
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Sync with all connected platforms
    const results = await autonomousService.syncWithPlatforms(userId);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    logger.error('Error syncing platforms:', error);
    res.status(500).json({ error: 'Failed to sync with platforms' });
  }
});

export default router;