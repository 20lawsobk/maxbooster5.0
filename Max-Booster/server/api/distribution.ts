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
        upcGeneration: true,
      },
    });
  } catch (error: unknown) {
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
    const { songIds, title, artist, label, releaseDate, platforms, territories, metadata } =
      req.body;

    // Validate ALL tracks belong to user - CRITICAL SECURITY FIX
    const userTracks = await db.select().from(tracks).where(eq(tracks.userId, userId));

    const userTrackIds = userTracks.map((t) => t.id);
    const unauthorizedTracks = songIds.filter((id: string) => !userTrackIds.includes(id));

    if (unauthorizedTracks.length > 0) {
      return res.status(403).json({
        error: 'Unauthorized: You do not own all selected tracks',
        unauthorizedTracks,
      });
    }

    // Get full track metadata with real audio files
    const selectedTracks = userTracks.filter((t) => songIds.includes(t.id));

    // Map platforms properly for LabelGrid (must be array, not string "all")
    const labelGridPlatforms =
      platforms === 'all'
        ? [
            'spotify',
            'apple-music',
            'youtube-music',
            'amazon-music',
            'tidal',
            'deezer',
            'pandora',
            'soundcloud',
            'tiktok',
            'instagram',
          ]
        : Array.isArray(platforms)
          ? platforms
          : [platforms];

    // Submit to LabelGrid with REAL track data
    const release = await labelGridService.createRelease({
      title,
      artist,
      label: label || 'Max Booster Records',
      releaseDate: new Date(releaseDate),
      type: songIds.length > 1 ? 'album' : 'single',
      tracks: selectedTracks.map((track, index) => ({
        title: track.title,
        artist: track.artist || artist,
        isrc: track.isrc || labelGridService.generateISRC('US', 'MXB'),
        duration: track.duration || 180,
        audioFileUrl: track.audioUrl, // Real audio file URL
        trackNumber: index + 1,
        discNumber: 1,
        metadata: track.metadata,
      })),
      territories: Array.isArray(territories) ? territories : [territories || 'WORLD'],
      platforms: labelGridPlatforms,
    });

    // Save to database using releases table
    const [newRelease] = await db
      .insert(releases)
      .values({
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
          territories: territories || ['WORLD'],
        },
      })
      .returning();

    res.json({
      success: true,
      release: newRelease,
      releaseId: release.id,
      isrc: release.tracks[0].isrc,
      upc: release.upc,
      estimatedLiveDate: release.estimatedLiveDate,
    });
  } catch (error: unknown) {
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

    const [release] = await db
      .select()
      .from(releases)
      .where(and(eq(releases.id, releaseId), eq(releases.userId, userId)));

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Get status from LabelGrid if available
    const metadata = release.metadata as any;
    if (metadata?.labelGridReleaseId) {
      const status = await labelGridService.getReleaseStatus(metadata.labelGridReleaseId);

      // Update local status if changed
      if (status.status !== release.status) {
        await db
          .update(releases)
          .set({
            status: status.status,
            metadata: {
              ...metadata,
              platformStatuses: status.platformStatuses,
            },
          })
          .where(eq(releases.id, releaseId));
      }

      res.json({
        ...release,
        status: status.status,
        platformStatuses: status.platformStatuses,
        liveLinks: status.liveLinks,
      });
    } else {
      res.json(release);
    }
  } catch (error: unknown) {
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

    const userReleases = await db
      .select()
      .from(releases)
      .where(eq(releases.userId, userId))
      .orderBy(releases.createdAt);

    res.json(userReleases);
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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

    const [release] = await db
      .select()
      .from(releases)
      .where(and(eq(releases.id, releaseId), eq(releases.userId, userId)));

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const metadata = release.metadata as any;
    // Request takedown from LabelGrid
    if (metadata?.labelGridReleaseId) {
      await labelGridService.takedownRelease(metadata.labelGridReleaseId, reason);
    }

    // Update status
    await db
      .update(releases)
      .set({
        status: 'takedown_requested',
        metadata: {
          ...metadata,
          takedownReason: reason,
          takedownRequestedAt: new Date(),
        },
      })
      .where(eq(releases.id, releaseId));

    res.json({ success: true });
  } catch (error: unknown) {
    logger.error('Takedown error:', error);
    res.status(500).json({ error: 'Failed to process takedown' });
  }
});

export default router;
