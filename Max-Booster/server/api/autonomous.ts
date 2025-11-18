import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePremium } from '../middleware/requirePremium.js';
import { autonomousService } from '../services/autonomousService.js';
import { db } from '../db.js';
import { users, posts, socialCampaigns } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../logger.js';

const router = Router();

/**
 * Get autonomous settings
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;

    // Get user settings from metadata
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    const metadata = (user?.metadata as any) || {};
    const autonomousSettings = metadata.autonomousSettings || {
      enabled: false,
      requireApproval: true,
      postFrequency: 'daily',
      contentTypes: ['promotional', 'engagement', 'educational'],
      activeHours: { start: 9, end: 21 },
      platforms: [],
    };

    res.json(autonomousSettings);
  } catch (error: unknown) {
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

    // Get current user metadata
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    const currentMetadata = (user?.metadata as any) || {};

    // Update user metadata with autonomous settings
    await db
      .update(users)
      .set({
        metadata: {
          ...currentMetadata,
          autonomousSettings: settings,
        },
      })
      .where(eq(users.id, userId));

    // If enabling fully autonomous mode, start the service
    if (settings.enabled && !settings.requireApproval) {
      autonomousService.startAutonomousMode(userId);
    } else if (!settings.enabled) {
      autonomousService.stopAutonomousMode(userId);
    }

    res.json({ success: true, settings });
  } catch (error: unknown) {
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

    const pendingContent = await db
      .select()
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, 'pending')))
      .orderBy(desc(posts.createdAt))
      .limit(20);

    res.json(pendingContent);
  } catch (error: unknown) {
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
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Apply modifications if any
    const finalContent = modifications?.content || post.content;
    const finalMedia = modifications?.media || post.media;

    // Update status and content
    await db
      .update(posts)
      .set({
        status: 'approved',
        content: finalContent,
        media: finalMedia,
        approvedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    // Schedule for posting
    await autonomousService.schedulePost(userId, postId);

    res.json({ success: true });
  } catch (error: unknown) {
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
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update status
    await db
      .update(posts)
      .set({
        status: 'rejected',
        metadata: {
          ...post.metadata,
          rejectionReason: reason,
          rejectedAt: new Date(),
        },
      })
      .where(eq(posts.id, postId));

    res.json({ success: true });
  } catch (error: unknown) {
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
      platforms: platforms || ['twitter', 'instagram', 'facebook'],
    });

    res.json(content);
  } catch (error: unknown) {
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
    const recentPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(50);

    // Get active socialCampaigns
    const activeCampaigns = await db
      .select()
      .from(socialCampaigns)
      .where(and(eq(socialCampaigns.userId, userId), eq(socialCampaigns.status, 'active')));

    res.json({
      posts: recentPosts,
      socialCampaigns: activeCampaigns,
      stats: {
        totalPosts: recentPosts.length,
        pendingApproval: recentPosts.filter((p) => p.status === 'pending_approval').length,
        published: recentPosts.filter((p) => p.status === 'published').length,
        scheduled: recentPosts.filter((p) => p.status === 'scheduled').length,
      },
    });
  } catch (error: unknown) {
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
    await db
      .update(autonomousSettings)
      .set({
        enabled: true,
        updatedAt: new Date(),
      })
      .where(eq(autonomousSettings.userId, userId));

    res.json({
      success: true,
      message: 'Autonomous mode activated',
    });
  } catch (error: unknown) {
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
    await db
      .update(autonomousSettings)
      .set({
        enabled: false,
        updatedAt: new Date(),
      })
      .where(eq(autonomousSettings.userId, userId));

    res.json({
      success: true,
      message: 'Autonomous mode deactivated',
    });
  } catch (error: unknown) {
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
      results,
    });
  } catch (error: unknown) {
    logger.error('Error syncing platforms:', error);
    res.status(500).json({ error: 'Failed to sync with platforms' });
  }
});

export default router;
