import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePremium } from '../middleware/requirePremium.js';
import { db } from '../db.js';
import { releases, tracks, users, projects } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { labelGridService } from '../services/labelgrid-service.js';
import { logger } from '../logger.js';

const router = Router();

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
    
    // Validate tracks belong to user
    const userTracks = await db.select().from(tracks)
      .where(and(
        eq(tracks.userId, userId),
        eq(tracks.id, songIds[0]) // Check at least first track
      ));
    
    if (userTracks.length === 0) {
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
    
    // Save to database using releases table
    const [newRelease] = await db.insert(releases).values({
      userId,
      title,
      artist,
      type: songIds.length > 1 ? 'album' : 'single',
      releaseDate: new Date(releaseDate),
      status: 'pending',
      metadata: {
        ...metadata,
        labelGridReleaseId: release.id,
        isrc: release.tracks[0].isrc,
        upc: release.upc,
        platforms: platforms || ['all'],
        territories: territories || ['WORLD']
      }
    }).returning();
    
    res.json({
      success: true,
      release: newRelease,
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
router.get('/status/:releaseId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { releaseId } = req.params;
    
    const [release] = await db.select().from(releases)
      .where(and(
        eq(releases.id, releaseId),
        eq(releases.userId, userId)
      ));
    
    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }
    
    // Get status from LabelGrid if available
    const metadata = release.metadata as any;
    if (metadata?.labelGridReleaseId) {
      const status = await labelGridService.getReleaseStatus(
        metadata.labelGridReleaseId
      );
      
      // Update local status if changed
      if (status.status !== release.status) {
        await db.update(releases)
          .set({ 
            status: status.status,
            metadata: {
              ...metadata,
              platformStatuses: status.platformStatuses
            }
          })
          .where(eq(releases.id, releaseId));
      }
      
      res.json({
        ...release,
        status: status.status,
        platformStatuses: status.platformStatuses,
        liveLinks: status.liveLinks
      });
    } else {
      res.json(release);
    }
  } catch (error) {
    logger.error('Error fetching release status:', error);
    res.status(500).json({ error: 'Failed to fetch release status' });
  }
});

/**
 * Get user's distributions
 */
router.get('/my-distributions', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const userReleases = await db.select().from(releases)
      .where(eq(releases.userId, userId))
      .orderBy(releases.createdAt);
    
    res.json(userReleases);
  } catch (error) {
    logger.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
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
router.post('/takedown/:releaseId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { releaseId } = req.params;
    const { reason } = req.body;
    
    const [release] = await db.select().from(releases)
      .where(and(
        eq(releases.id, releaseId),
        eq(releases.userId, userId)
      ));
    
    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }
    
    const metadata = release.metadata as any;
    // Request takedown from LabelGrid
    if (metadata?.labelGridReleaseId) {
      await labelGridService.takedownRelease(
        metadata.labelGridReleaseId,
        reason
      );
    }
    
    // Update status
    await db.update(releases)
      .set({ 
        status: 'takedown_requested',
        metadata: {
          ...metadata,
          takedownReason: reason,
          takedownRequestedAt: new Date()
        }
      })
      .where(eq(releases.id, releaseId));
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Takedown error:', error);
    res.status(500).json({ error: 'Failed to process takedown' });
  }
});

export default router;