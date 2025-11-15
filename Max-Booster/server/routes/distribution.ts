import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import * as codeGenerationService from '../services/distributionCodeGenerationService';
import { distributionService } from '../services/distributionService';
import { labelGridService } from '../services/labelgrid-service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for audio and artwork uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'distribution');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});

// Validation schemas
const createReleaseSchema = z.object({
  title: z.string().min(1),
  artistName: z.string().min(1),
  releaseType: z.enum(['single', 'EP', 'album']),
  primaryGenre: z.string().min(1),
  secondaryGenre: z.string().optional(),
  language: z.string().min(1),
  labelName: z.string().optional(),
  copyrightYear: z.number().int().min(1900),
  copyrightOwner: z.string().min(1),
  publishingRights: z.string().optional(),
  isExplicit: z.boolean().default(false),
  moodTags: z.array(z.string()).optional(),
  releaseDate: z.string().optional(),
  territoryMode: z.enum(['worldwide', 'include', 'exclude']).default('worldwide'),
  territories: z.array(z.string()).optional(),
  selectedPlatforms: z.array(z.string()).optional(),
});

const updateReleaseSchema = createReleaseSchema.partial();

const createTrackSchema = z.object({
  title: z.string().min(1),
  trackNumber: z.number().int().min(1),
  explicit: z.boolean().default(false),
  lyrics: z.string().optional(),
  lyricsLanguage: z.string().optional(),
});

const generateCodeSchema = z.object({
  trackId: z.string().optional(),
  releaseId: z.string().optional(),
  artist: z.string(),
  title: z.string(),
});

const createRoyaltySplitSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['songwriter', 'producer', 'performer', 'manager', 'featured_artist']),
  percentage: z.number().min(0.1).max(100),
});

// Middleware to ensure user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// ===================
// RELEASE ENDPOINTS
// ===================

// GET /api/distribution/releases - List user's releases
router.get('/releases', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const releases = await storage.getDistroReleases(userId);
    res.json(releases);
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

// POST /api/distribution/releases - Create new release draft
router.post('/releases', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const data = createReleaseSchema.parse(req.body);

    const release = await storage.createDistroRelease({
      artistId: userId,
      title: data.title,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      metadata: {
        artistName: data.artistName,
        releaseType: data.releaseType,
        primaryGenre: data.primaryGenre,
        secondaryGenre: data.secondaryGenre,
        language: data.language,
        labelName: data.labelName,
        copyrightYear: data.copyrightYear,
        copyrightOwner: data.copyrightOwner,
        publishingRights: data.publishingRights,
        isExplicit: data.isExplicit,
        moodTags: data.moodTags,
        territoryMode: data.territoryMode,
        territories: data.territories,
        selectedPlatforms: data.selectedPlatforms,
      }
    });

    res.json(release);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating release:', error);
    res.status(500).json({ error: 'Failed to create release' });
  }
});

// GET /api/distribution/releases/:id - Get single release
router.get('/releases/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    res.json(release);
  } catch (error) {
    console.error('Error fetching release:', error);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
});

// PATCH /api/distribution/releases/:id - Update release metadata
router.patch('/releases/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const updates = updateReleaseSchema.parse(req.body);

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const updatedRelease = await storage.updateDistroRelease(id, {
      title: updates.title,
      releaseDate: updates.releaseDate ? new Date(updates.releaseDate) : undefined,
      metadata: {
        ...release.metadata,
        ...updates
      }
    });

    res.json(updatedRelease);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating release:', error);
    res.status(500).json({ error: 'Failed to update release' });
  }
});

// DELETE /api/distribution/releases/:id - Delete/takedown release
router.delete('/releases/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // If release is live on LabelGrid, initiate takedown
    const metadata = release.metadata as any;
    if (metadata?.labelGridReleaseId && release.status !== 'draft') {
      try {
        await labelGridService.takedownRelease(metadata.labelGridReleaseId);
        console.log(`✅ LabelGrid takedown initiated for release ${metadata.labelGridReleaseId}`);
      } catch (error) {
        console.error('Error initiating LabelGrid takedown:', error);
        // Continue with local deletion even if LabelGrid fails
      }
    }

    // Delete from local database
    await storage.deleteDistroRelease(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting release:', error);
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

// ===================
// TRACK ENDPOINTS
// ===================

// POST /api/distribution/releases/:id/tracks - Upload track audio
router.post('/releases/:id/tracks', requireAuth, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id: releaseId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Audio file required' });
    }

    const release = await storage.getDistroRelease(releaseId);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const data = createTrackSchema.parse(JSON.parse(req.body.metadata || '{}'));

    const track = await storage.createDistroTrack({
      releaseId,
      title: data.title,
      trackNumber: data.trackNumber,
      audioUrl: `/uploads/distribution/${file.filename}`,
      metadata: {
        explicit: data.explicit,
        lyrics: data.lyrics,
        lyricsLanguage: data.lyricsLanguage,
      }
    });

    res.json(track);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error uploading track:', error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// PATCH /api/distribution/releases/:releaseId/tracks/:trackId - Update track metadata
router.patch('/releases/:releaseId/tracks/:trackId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { releaseId, trackId } = req.params;

    const release = await storage.getDistroRelease(releaseId);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const updates = createTrackSchema.partial().parse(req.body);
    const track = await storage.updateDistroTrack(trackId, updates);

    res.json(track);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating track:', error);
    res.status(500).json({ error: 'Failed to update track' });
  }
});

// DELETE /api/distribution/releases/:releaseId/tracks/:trackId - Remove track
router.delete('/releases/:releaseId/tracks/:trackId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { releaseId, trackId } = req.params;

    const release = await storage.getDistroRelease(releaseId);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    await storage.deleteDistroTrack(trackId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

// ===================
// CODE GENERATION ENDPOINTS
// ===================

// POST /api/distribution/codes/isrc - Generate ISRC code
router.post('/codes/isrc', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { trackId, artist, title } = generateCodeSchema.parse(req.body);

    // Use LabelGrid API to generate ISRC
    const result = await labelGridService.generateISRC(artist, title);

    // Store in database for tracking
    if (trackId && trackId !== `temp_${Date.now()}`) {
      await codeGenerationService.generateISRC(userId, trackId, artist, title);
    }

    res.json({ isrc: result.code, assignedTo: result.assignedTo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error generating ISRC:', error);
    res.status(500).json({ error: 'Failed to generate ISRC' });
  }
});

// POST /api/distribution/codes/upc - Generate UPC code
router.post('/codes/upc', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { releaseId, title } = generateCodeSchema.parse(req.body);

    // Use LabelGrid API to generate UPC
    const result = await labelGridService.generateUPC(title);

    // Store in database for tracking
    if (releaseId && releaseId !== `temp_${Date.now()}`) {
      await codeGenerationService.generateUPC(userId, releaseId, title);
    }

    res.json({ upc: result.code, assignedTo: result.assignedTo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error generating UPC:', error);
    res.status(500).json({ error: 'Failed to generate UPC' });
  }
});

// POST /api/distribution/codes/validate - Validate existing code
router.post('/codes/validate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { code, type } = z.object({
      code: z.string(),
      type: z.enum(['isrc', 'upc'])
    }).parse(req.body);

    let result;
    if (type === 'isrc') {
      result = await codeGenerationService.verifyISRC(code);
    } else {
      result = await codeGenerationService.verifyUPC(code);
    }

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error validating code:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

// ===================
// PLATFORM ENDPOINTS
// ===================

// GET /api/distribution/platforms - Get all DSP providers
router.get('/platforms', async (_req: Request, res: Response) => {
  try {
    const platforms = await storage.getDSPProviders();
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

// POST /api/distribution/releases/:id/schedule - Schedule release date
router.post('/releases/:id/schedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { releaseDate } = z.object({
      releaseDate: z.string()
    }).parse(req.body);

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const updatedRelease = await storage.updateDistroRelease(id, {
      releaseDate: new Date(releaseDate)
    });

    res.json(updatedRelease);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error scheduling release:', error);
    res.status(500).json({ error: 'Failed to schedule release' });
  }
});

// ===========================
// HYPERFOLLOW CAMPAIGN ENDPOINTS
// ===========================

const hyperFollowSchema = z.object({
  title: z.string().min(1),
  artistName: z.string().min(1),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  headerImage: z.string().optional(),
  releaseId: z.string().optional(),
  collectEmails: z.boolean().default(true),
  platforms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    url: z.string().optional(),
  })),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
  })).optional(),
  theme: z.object({
    primaryColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    buttonStyle: z.enum(['rounded', 'square', 'pill']),
  }),
});

// POST /api/distribution/hyperfollow - Create campaign
router.post('/hyperfollow', requireAuth, upload.single('headerImage'), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const file = req.file;
    
    const data = hyperFollowSchema.parse(JSON.parse(req.body.data));

    const headerImageUrl = file ? `/uploads/distribution/${file.filename}` : data.headerImage;

    const campaign = await storage.createHyperFollowPage({
      userId,
      title: data.title,
      slug: data.slug,
      imageUrl: headerImageUrl,
      links: {
        platforms: data.platforms,
        socialLinks: data.socialLinks,
        artistName: data.artistName,
        description: data.description,
        releaseId: data.releaseId,
        collectEmails: data.collectEmails,
        theme: data.theme,
        analytics: {
          pageViews: 0,
          preSaves: 0,
          emailSignups: 0,
          platformClicks: {},
        },
        emailList: [],
      },
    });

    res.json(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating HyperFollow campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// GET /api/distribution/hyperfollow - List user campaigns
router.get('/hyperfollow', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const campaigns = await storage.getHyperFollowPages(userId);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching HyperFollow campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/distribution/hyperfollow/:slug - Get campaign by slug (public endpoint)
router.get('/hyperfollow/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const campaign = await storage.getHyperFollowPageBySlug(slug);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching HyperFollow campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// PATCH /api/distribution/hyperfollow/:id - Update campaign
router.patch('/hyperfollow/:id', requireAuth, upload.single('headerImage'), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const file = req.file;

    const campaign = await storage.getHyperFollowPage(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const data = hyperFollowSchema.partial().parse(JSON.parse(req.body.data || '{}'));

    const headerImageUrl = file 
      ? `/uploads/distribution/${file.filename}` 
      : data.headerImage || campaign.imageUrl;

    const updatedCampaign = await storage.updateHyperFollowPage(id, {
      title: data.title || campaign.title,
      slug: data.slug || campaign.slug,
      imageUrl: headerImageUrl,
      links: {
        ...(campaign.links as any),
        platforms: data.platforms || (campaign.links as any).platforms,
        socialLinks: data.socialLinks || (campaign.links as any).socialLinks,
        artistName: data.artistName || (campaign.links as any).artistName,
        description: data.description !== undefined ? data.description : (campaign.links as any).description,
        collectEmails: data.collectEmails !== undefined ? data.collectEmails : (campaign.links as any).collectEmails,
        theme: data.theme || (campaign.links as any).theme,
      },
    });

    res.json(updatedCampaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating HyperFollow campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /api/distribution/hyperfollow/:id - Delete campaign
router.delete('/hyperfollow/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const campaign = await storage.getHyperFollowPage(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await storage.deleteHyperFollowPage(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting HyperFollow campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// POST /api/distribution/hyperfollow/:slug/track - Track visitor (analytics)
router.post('/hyperfollow/:slug/track', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { eventType, platform, email } = z.object({
      eventType: z.enum(['pageView', 'preSave', 'emailSignup', 'platformClick']),
      platform: z.string().optional(),
      email: z.string().email().optional(),
    }).parse(req.body);

    const campaign = await storage.getHyperFollowPageBySlug(slug);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const links = campaign.links as any;
    const analytics = links.analytics || {
      pageViews: 0,
      preSaves: 0,
      emailSignups: 0,
      platformClicks: {},
    };

    // Update analytics
    if (eventType === 'pageView') {
      analytics.pageViews = (analytics.pageViews || 0) + 1;
    } else if (eventType === 'preSave') {
      analytics.preSaves = (analytics.preSaves || 0) + 1;
    } else if (eventType === 'emailSignup' && email) {
      analytics.emailSignups = (analytics.emailSignups || 0) + 1;
      const emailList = links.emailList || [];
      if (!emailList.includes(email)) {
        emailList.push(email);
        links.emailList = emailList;
      }
    } else if (eventType === 'platformClick' && platform) {
      analytics.platformClicks = analytics.platformClicks || {};
      analytics.platformClicks[platform] = (analytics.platformClicks[platform] || 0) + 1;
    }

    // Save updated analytics
    await storage.updateHyperFollowPage(campaign.id, {
      links: {
        ...links,
        analytics,
      },
    });

    res.json({ success: true, analytics });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error tracking HyperFollow event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// ===========================
// RELEASE STATUS & MONITORING ENDPOINTS
// ===========================

// GET /api/distribution/releases/:id/status - Get delivery status per DSP
router.get('/releases/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Get real-time status from LabelGrid if we have an external release ID
    const metadata = release.metadata as any;
    let labelGridStatus = null;
    
    if (metadata?.labelGridReleaseId) {
      try {
        labelGridStatus = await labelGridService.getReleaseStatus(metadata.labelGridReleaseId);
        
        // Update local database with latest status
        if (labelGridStatus.platforms) {
          for (const platformStatus of labelGridStatus.platforms) {
            await storage.updateDistroDispatchStatus(id, {
              providerId: platformStatus.platform,
              status: platformStatus.status,
              liveAt: platformStatus.liveDate ? new Date(platformStatus.liveDate) : undefined,
              error: platformStatus.errorMessage,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching LabelGrid status:', error);
        // Fall back to database status
      }
    }

    // Get dispatch status from database
    const statuses = await storage.getDistroDispatchStatuses(id);
    
    // Calculate overall progress
    const liveCount = statuses.filter((s: any) => s.status === 'live').length;
    const totalCount = statuses.length || 1;
    const overallProgress = (liveCount / totalCount) * 100;

    res.json({
      statuses: statuses.map((status: any) => ({
        platform: status.providerId,
        platformName: status.providerName || status.providerId,
        status: status.status,
        externalId: status.externalId,
        estimatedGoLive: status.estimatedGoLive,
        deliveredAt: status.deliveredAt,
        liveAt: status.liveAt,
        errorMessage: status.error,
        errorResolution: status.errorResolution,
        lastChecked: status.updatedAt,
      })),
      overallProgress: Math.round(overallProgress),
      labelGridStatus: labelGridStatus ? {
        releaseId: labelGridStatus.releaseId,
        status: labelGridStatus.status,
        estimatedLiveDate: labelGridStatus.estimatedLiveDate,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching release status:', error);
    res.status(500).json({ error: 'Failed to fetch release status' });
  }
});

// POST /api/distribution/releases/:id/check-status - Force status refresh
router.post('/releases/:id/check-status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Trigger status refresh from DSPs
    await distributionService.refreshReleaseStatus(id);

    res.json({ success: true, message: 'Status refresh initiated' });
  } catch (error) {
    console.error('Error refreshing release status:', error);
    res.status(500).json({ error: 'Failed to refresh release status' });
  }
});

// ===========================
// DDEX PACKAGE ENDPOINTS
// ===========================

import { ddexPackageService } from '../services/ddexPackageService';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// POST /api/distribution/releases/:id/ddex/preview - Generate and preview XML
router.post('/releases/:id/ddex/preview', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const tracks = await storage.getDistroTracks(id);

    const metadata = release.metadata as any;
    const xml = await ddexPackageService.generateDDEXXML(
      {
        id: release.id,
        title: release.title || '',
        artistName: metadata.artistName,
        releaseType: metadata.releaseType,
        upc: release.upc || '',
        releaseDate: release.releaseDate?.toISOString().split('T')[0] || '',
        labelName: metadata.labelName,
        copyrightYear: metadata.copyrightYear,
        copyrightOwner: metadata.copyrightOwner,
        publishingRights: metadata.publishingRights,
        primaryGenre: metadata.primaryGenre,
        secondaryGenre: metadata.secondaryGenre,
        isExplicit: metadata.isExplicit,
        coverArtPath: release.coverArtUrl,
        territories: metadata.territories,
      },
      tracks.map((track: any, index: number) => ({
        id: track.id,
        title: track.title,
        isrc: track.isrc || '',
        trackNumber: index + 1,
        duration: track.duration || 0,
        audioFilePath: track.audioUrl,
        explicit: track.metadata?.explicit || false,
        lyrics: track.metadata?.lyrics,
        primaryArtist: metadata.artistName,
        featuredArtists: track.metadata?.featuredArtists,
        songwriters: track.metadata?.songwriters,
        producers: track.metadata?.producers,
      }))
    );

    // Validate XML
    const validation = await ddexPackageService.validateDDEXXML(xml);

    res.json({
      xml,
      validation,
    });
  } catch (error) {
    console.error('Error generating DDEX preview:', error);
    res.status(500).json({ error: 'Failed to generate DDEX preview' });
  }
});

// GET /api/distribution/releases/:id/ddex/download - Download DDEX package (.zip)
router.get('/releases/:id/ddex/download', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const tracks = await storage.getDistroTracks(id);
    const metadata = release.metadata as any;

    const outputPath = path.join(uploadDir, `ddex_${id}_${Date.now()}.zip`);

    await ddexPackageService.createDDEXPackage(
      {
        id: release.id,
        title: release.title || '',
        artistName: metadata.artistName,
        releaseType: metadata.releaseType,
        upc: release.upc || '',
        releaseDate: release.releaseDate?.toISOString().split('T')[0] || '',
        labelName: metadata.labelName,
        copyrightYear: metadata.copyrightYear,
        copyrightOwner: metadata.copyrightOwner,
        publishingRights: metadata.publishingRights,
        primaryGenre: metadata.primaryGenre,
        secondaryGenre: metadata.secondaryGenre,
        isExplicit: metadata.isExplicit,
        coverArtPath: release.coverArtUrl,
        territories: metadata.territories,
      },
      tracks.map((track: any, index: number) => ({
        id: track.id,
        title: track.title,
        isrc: track.isrc || '',
        trackNumber: index + 1,
        duration: track.duration || 0,
        audioFilePath: path.join(process.cwd(), track.audioUrl),
        explicit: track.metadata?.explicit || false,
        lyrics: track.metadata?.lyrics,
        primaryArtist: metadata.artistName,
        featuredArtists: track.metadata?.featuredArtists,
        songwriters: track.metadata?.songwriters,
        producers: track.metadata?.producers,
      })),
      outputPath
    );

    res.download(outputPath, `${release.title}_DDEX.zip`, (err) => {
      if (err) {
        console.error('Error downloading DDEX package:', err);
      }
      // Clean up file after download
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error creating DDEX package:', error);
    res.status(500).json({ error: 'Failed to create DDEX package' });
  }
});

// POST /api/distribution/releases/:id/submit - Submit release for distribution
router.post('/releases/:id/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Update release status to submitted
    await storage.updateDistroRelease(id, { metadata: { ...(release.metadata as any), status: 'submitted' } });

    // Create dispatch records for each selected platform
    const metadata = release.metadata as any;
    const selectedPlatforms = metadata.selectedPlatforms || [];

    for (const platformSlug of selectedPlatforms) {
      const provider = await storage.getDSPProviderBySlug(platformSlug);
      if (provider) {
        await storage.createDistroDispatch({
          releaseId: id,
          providerId: provider.id,
          status: 'queued',
        });
      }
    }

    res.json({ success: true, message: 'Release submitted for distribution' });
  } catch (error) {
    console.error('Error submitting release:', error);
    res.status(500).json({ error: 'Failed to submit release' });
  }
});

// ===========================
// TAKEDOWN ENDPOINTS
// ===========================

const takedownSchema = z.object({
  reason: z.string().min(1),
  explanation: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  allPlatforms: z.boolean().default(true),
});

// POST /api/distribution/releases/:id/takedown - Request takedown
router.post('/releases/:id/takedown', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const data = takedownSchema.parse(req.body);

    // Update dispatch statuses for takedown
    const statuses = await storage.getDistroDispatchStatuses(id);
    const platformsToTakedown = data.allPlatforms 
      ? statuses.map((s: any) => s.providerId)
      : data.platforms || [];

    for (const status of statuses) {
      if (platformsToTakedown.includes(status.providerId)) {
        await storage.updateDistroDispatch(status.id, {
          status: 'takedown_requested',
          logs: JSON.stringify({
            reason: data.reason,
            explanation: data.explanation,
            requestedAt: new Date().toISOString(),
          }),
        });
      }
    }

    // Log takedown request
    await storage.createAuditLog({
      userId,
      action: 'release_takedown_requested',
      resourceType: 'release',
      resourceId: id,
      metadata: {
        reason: data.reason,
        explanation: data.explanation,
        platforms: platformsToTakedown,
      },
    });

    res.json({ 
      success: true, 
      message: 'Takedown request submitted',
      estimatedCompletionDays: 14,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error requesting takedown:', error);
    res.status(500).json({ error: 'Failed to request takedown' });
  }
});

// GET /api/distribution/releases/:id/takedown-status - Check takedown progress
router.get('/releases/:id/takedown-status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const statuses = await storage.getDistroDispatchStatuses(id);
    const takedownStatuses = statuses
      .filter((s: any) => s.status === 'takedown_requested' || s.status === 'removed')
      .map((s: any) => {
        const logs = s.logs ? JSON.parse(s.logs) : {};
        return {
          platform: s.providerId,
          platformName: s.providerName,
          status: s.status,
          requestedAt: logs.requestedAt,
          completedAt: logs.completedAt,
          reason: logs.reason,
          explanation: logs.explanation,
        };
      });

    const allCompleted = takedownStatuses.every((s: any) => s.status === 'removed');
    const totalRequested = takedownStatuses.length;
    const totalCompleted = takedownStatuses.filter((s: any) => s.status === 'removed').length;

    res.json({
      statuses: takedownStatuses,
      summary: {
        totalRequested,
        totalCompleted,
        allCompleted,
        progressPercentage: totalRequested > 0 ? (totalCompleted / totalRequested) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching takedown status:', error);
    res.status(500).json({ error: 'Failed to fetch takedown status' });
  }
});

// ===========================
// ANALYTICS ENDPOINTS
// ===========================

// GET /api/distribution/releases/:id/analytics - Get release analytics from LabelGrid
router.get('/releases/:id/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const metadata = release.metadata as any;
    
    // Get analytics from LabelGrid if we have an external release ID
    if (metadata?.labelGridReleaseId) {
      try {
        const analytics = await labelGridService.getReleaseAnalytics(metadata.labelGridReleaseId);
        
        // Save analytics to database for historical tracking
        await storage.createAnalytics({
          userId,
          projectId: release.projectId || undefined,
          date: new Date(),
          totalStreams: analytics.totalStreams,
          totalRevenue: analytics.totalRevenue.toString(),
          platformData: analytics.platforms,
          trackData: analytics.timeline,
        });

        res.json(analytics);
      } catch (error) {
        console.error('Error fetching LabelGrid analytics:', error);
        res.status(500).json({ 
          error: 'Failed to fetch analytics from LabelGrid',
          message: 'Please try again later or check your LabelGrid connection',
        });
      }
    } else {
      // Return empty analytics if no LabelGrid release ID
      res.json({
        releaseId: id,
        totalStreams: 0,
        totalRevenue: 0,
        platforms: {},
        timeline: [],
        message: 'Release not yet distributed to LabelGrid',
      });
    }
  } catch (error) {
    console.error('Error fetching release analytics:', error);
    res.status(500).json({ error: 'Failed to fetch release analytics' });
  }
});

export default router;
