import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import * as codeGenerationService from '../services/distributionCodeGenerationService';
import { distributionService } from '../services/distributionService';
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

// DELETE /api/distribution/releases/:id - Delete draft release
router.delete('/releases/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const release = await storage.getDistroRelease(id);
    if (!release || release.artistId !== userId) {
      return res.status(404).json({ error: 'Release not found' });
    }

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

    const isrc = await codeGenerationService.generateISRC(
      userId,
      trackId || `temp_${Date.now()}`,
      artist,
      title
    );

    res.json({ isrc });
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

    const upc = await codeGenerationService.generateUPC(
      userId,
      releaseId || `temp_${Date.now()}`,
      title
    );

    res.json({ upc });
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

export default router;
