import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePremium } from '../middleware/requirePremium';
import { db } from '../db';
import { distributions, songs, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { LabelGridService } from '../services/labelgrid-service';
import { logger } from '../logger';

const router = Router();
const labelGridService = new LabelGridService();

/**
 * Get distribution config
 */
router.get('/config', requireAuth, async (req, res) => {
  try {
    const platforms = await labelGridService.getAvailablePlatforms();
    const territories = await labelGridService.getTerritories();
    
    res.json({
      platforms,
      territories,
      features: {
        instantPayouts: true,
        royaltyTracking: true,
        automatedDistribution: true,
        isrcGeneration: true,
        upcGeneration: true
      }
    });
  } catch (error) {
    logger.error('Error fetching distribution config:', error);
    res.status(500).json({ error: 'Failed to fetch distribution config' });
  }
});

/**
 * Submit release for distribution
 */
router.post('/submit', requireAuth, requirePremium, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const {
      songIds,
      title,
      artist,
      label,
      releaseDate,
      platforms,
      territories,
      metadata
    } = req.body;
    
    // Validate songs belong to user
    const userSongs = await db.select().from(songs)
      .where(and(
        eq(songs.userId, userId),
        eq(songs.id, songIds[0]) // Check at least first song
      ));
    
    if (userSongs.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Submit to LabelGrid
    const release = await labelGridService.createRelease({
      title,
      artist,
      label: label || 'Max Booster Records',
      releaseDate: new Date(releaseDate),
      type: songIds.length > 1 ? 'album' : 'single',
      tracks: songIds.map((id: string, index: number) => ({
        title: `Track ${index + 1}`,
        isrc: labelGridService.generateISRC('US', 'MXB'),
        duration: 180, // Default 3 minutes
        trackNumber: index + 1,
        discNumber: 1
      })),
      territories: territories || ['WORLD'],
      platforms: platforms || 'all'
    });
    
    // Save to database
    const [distribution] = await db.insert(distributions).values({
      userId,
      songId: songIds[0],
      platforms: platforms || ['all'],
      status: 'pending',
      submittedAt: new Date(),
      metadata: {
        ...metadata,
        labelGridReleaseId: release.id,
        isrc: release.tracks[0].isrc,
        upc: release.upc
      }
    }).returning();
    
    res.json({
      success: true,
      distribution,
      releaseId: release.id,
      isrc: release.tracks[0].isrc,
      upc: release.upc,
      estimatedLiveDate: release.estimatedLiveDate
    });
  } catch (error) {
    logger.error('Distribution submission error:', error);
    res.status(500).json({ error: 'Failed to submit distribution' });
  }
});

/**
 * Get distribution status
 */
router.get('/status/:distributionId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { distributionId } = req.params;
    
    const [distribution] = await db.select().from(distributions)
      .where(and(
        eq(distributions.id, distributionId),
        eq(distributions.userId, userId)
      ));
    
    if (!distribution) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    // Get status from LabelGrid if available
    if (distribution.metadata?.labelGridReleaseId) {
      const status = await labelGridService.getReleaseStatus(
        distribution.metadata.labelGridReleaseId
      );
      
      // Update local status if changed
      if (status.status !== distribution.status) {
        await db.update(distributions)
          .set({ 
            status: status.status,
            metadata: {
              ...distribution.metadata,
              platformStatuses: status.platformStatuses
            }
          })
          .where(eq(distributions.id, distributionId));
      }
      
      res.json({
        ...distribution,
        status: status.status,
        platformStatuses: status.platformStatuses,
        liveLinks: status.liveLinks
      });
    } else {
      res.json(distribution);
    }
  } catch (error) {
    logger.error('Error fetching distribution status:', error);
    res.status(500).json({ error: 'Failed to fetch distribution status' });
  }
});

/**
 * Get user's distributions
 */
router.get('/my-distributions', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const userDistributions = await db.select().from(distributions)
      .where(eq(distributions.userId, userId))
      .orderBy(distributions.submittedAt);
    
    res.json(userDistributions);
  } catch (error) {
    logger.error('Error fetching distributions:', error);
    res.status(500).json({ error: 'Failed to fetch distributions' });
  }
});

/**
 * Generate ISRC
 */
router.post('/generate-isrc', requireAuth, requirePremium, async (req, res) => {
  try {
    const isrc = labelGridService.generateISRC('US', 'MXB');
    res.json({ isrc });
  } catch (error) {
    logger.error('Error generating ISRC:', error);
    res.status(500).json({ error: 'Failed to generate ISRC' });
  }
});

/**
 * Generate UPC
 */
router.post('/generate-upc', requireAuth, requirePremium, async (req, res) => {
  try {
    const upc = labelGridService.generateUPC('080'); // Max Booster prefix
    res.json({ upc });
  } catch (error) {
    logger.error('Error generating UPC:', error);
    res.status(500).json({ error: 'Failed to generate UPC' });
  }
});

/**
 * Takedown release
 */
router.post('/takedown/:distributionId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { distributionId } = req.params;
    const { reason } = req.body;
    
    const [distribution] = await db.select().from(distributions)
      .where(and(
        eq(distributions.id, distributionId),
        eq(distributions.userId, userId)
      ));
    
    if (!distribution) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    // Request takedown from LabelGrid
    if (distribution.metadata?.labelGridReleaseId) {
      await labelGridService.takedownRelease(
        distribution.metadata.labelGridReleaseId,
        reason
      );
    }
    
    // Update status
    await db.update(distributions)
      .set({ 
        status: 'takedown_requested',
        metadata: {
          ...distribution.metadata,
          takedownReason: reason,
          takedownRequestedAt: new Date()
        }
      })
      .where(eq(distributions.id, distributionId));
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Takedown error:', error);
    res.status(500).json({ error: 'Failed to process takedown' });
  }
});

export default router;