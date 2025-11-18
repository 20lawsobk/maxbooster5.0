import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { socialOAuth } from '../services/socialOAuthService.js';
import { logger } from '../logger.js';

const router = Router();

/**
 * Get OAuth authorization URL for a platform
 */
router.get('/connect/:platform', requireAuth, (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.session.userId!;

    const authUrl = socialOAuth.getAuthorizationUrl(platform, userId);

    res.json({ authUrl });
  } catch (error: unknown) {
    logger.error('Failed to generate OAuth URL:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * OAuth callback handler for all platforms
 */
router.get('/callback/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      logger.error(`OAuth error for ${platform}:`, error);
      return res.redirect(`/dashboard?error=oauth_${error}`);
    }

    if (!code || !state) {
      return res.redirect('/dashboard?error=oauth_invalid');
    }

    // Extract userId from state
    const [userId] = (state as string).split(':');

    // Exchange code for tokens
    await socialOAuth.exchangeCodeForToken(platform, code as string, userId);

    // Redirect to dashboard with success message
    res.redirect(`/dashboard?success=connected_${platform}`);
  } catch (error: unknown) {
    logger.error('OAuth callback error:', error);
    res.redirect('/dashboard?error=oauth_failed');
  }
});

/**
 * Get connected platforms for current user
 */
router.get('/connected', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const connected = await socialOAuth.getConnectedPlatforms(userId);

    res.json({ platforms: connected });
  } catch (error: unknown) {
    logger.error('Failed to get connected platforms:', error);
    res.status(500).json({ error: 'Failed to get connected platforms' });
  }
});

/**
 * Disconnect a platform
 */
router.delete('/disconnect/:platform', requireAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.session.userId!;

    await socialOAuth.disconnectPlatform(userId, platform);

    res.json({ success: true, message: `${platform} disconnected` });
  } catch (error: unknown) {
    logger.error('Failed to disconnect platform:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Refresh access token for a platform
 */
router.post('/refresh/:platform', requireAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.session.userId!;

    const result = await socialOAuth.refreshAccessToken(userId, platform);

    res.json({
      success: true,
      expiresIn: result.expiresIn,
    });
  } catch (error: unknown) {
    logger.error('Failed to refresh token:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Test post to connected platform
 */
router.post('/test/:platform', requireAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { message } = req.body;
    const userId = req.session.userId!;

    // Check if platform is connected
    const isConnected = await socialOAuth.isPlatformConnected(userId, platform);
    if (!isConnected) {
      return res.status(400).json({ error: `${platform} not connected` });
    }

    // This would integrate with platformAPI service
    res.json({
      success: true,
      message: `Test post to ${platform} would be sent: "${message}"`,
    });
  } catch (error: unknown) {
    logger.error('Test post failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
