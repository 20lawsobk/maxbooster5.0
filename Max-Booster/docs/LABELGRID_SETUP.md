# LabelGrid API Integration Setup Guide

## Overview

LabelGrid is Max Booster's music distribution partner, enabling seamless distribution to **Spotify, Apple Music, and 34+ other digital streaming platforms (DSPs)**. This integration provides:

- ✅ Automated distribution to all major streaming platforms
- ✅ Real-time status updates via webhooks
- ✅ Automated ISRC/UPC code generation
- ✅ Comprehensive streaming analytics
- ✅ Direct revenue routing (BYO-Deals)
- ✅ DDEX 3.8.2 and 4.3 support

---

## Prerequisites

- **LabelGrid Account**: Sign up at [labelgrid.com](https://labelgrid.com)
- **Growth Tier Subscription**: Required for API access (7-day free trial available)
- **Max Booster Server**: Running with PostgreSQL database
- **Environment Access**: Ability to set environment variables

---

## Step 1: Sign Up for LabelGrid

1. Visit [labelgrid.com](https://labelgrid.com)
2. Click **"Sign Up"** or **"Get Started"**
3. Select the **Growth Tier** plan:
   - Full RESTful API access
   - Webhook support
   - ISRC/UPC generation
   - Analytics from all platforms
   - 25 label seats
   - **7-day free trial** (no credit card required)

4. Complete the registration process

---

## Step 2: Generate API Token

1. Log in to your **LabelGrid Dashboard**
2. Navigate to **Settings** → **WordPress Plugin** section
3. Click **"Generate New API Token"**
4. Configure token settings:
   - **Domain/IP Restriction**: Add your Max Booster server domain/IP for security
   - **Label Scope** (optional): Select specific record labels if applicable
   - **Permissions**: Ensure all distribution permissions are enabled
5. **Copy the API token** (you'll only see it once!)
6. Store it securely - you'll add it to your `.env` file next

---

## Step 3: Configure Environment Variables

1. Open your `.env` file in the Max Booster root directory
2. Add the following configuration:

```bash
# LabelGrid Music Distribution API
LABELGRID_API_TOKEN=your_api_token_here
LABELGRID_API_URL=https://api.labelgrid.com
LABELGRID_WEBHOOK_SECRET=your_webhook_secret_here
```

3. Replace `your_api_token_here` with the token from Step 2
4. Generate a webhook secret (any random string, 32+ characters recommended):

```bash
# Generate a secure webhook secret
openssl rand -hex 32
```

5. Save the `.env` file
6. **Restart your Max Booster server** to load the new variables

---

## Step 4: Configure Webhooks in LabelGrid

LabelGrid sends real-time status updates via webhooks. Configure them to keep Max Booster synchronized:

1. In **LabelGrid Dashboard**, go to **Settings** → **Webhooks**
2. Click **"Add Webhook Endpoint"**
3. Configure webhook:
   - **URL**: `https://your-domain.com/api/webhooks/labelgrid`
   - **Secret**: The same secret you added to `LABELGRID_WEBHOOK_SECRET`
   - **Events**: Select all distribution events:
     - `release.status.changed`
     - `release.live`
     - `release.failed`
     - `analytics.updated`

4. Click **"Save Webhook"**
5. Test the webhook using LabelGrid's test feature

---

## Step 5: Verify Installation

Test that the integration is working correctly:

### 5.1 Check Environment Variables

```bash
# SSH into your server
cd Max-Booster

# Verify variables are loaded
node -e "console.log('API Token:', process.env.LABELGRID_API_TOKEN ? '✅ Loaded' : '❌ Missing')"
node -e "console.log('Webhook Secret:', process.env.LABELGRID_WEBHOOK_SECRET ? '✅ Loaded' : '❌ Missing')"
```

### 5.2 Test ISRC Generation

Use the API endpoint to test code generation:

```bash
curl -X POST http://localhost:5000/api/distribution/codes/isrc \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "artist": "Test Artist",
    "title": "Test Song"
  }'
```

Expected response:
```json
{
  "isrc": "US-XXX-25-12345",
  "assignedTo": "Test Artist - Test Song"
}
```

### 5.3 Check Server Logs

Look for the initialization message:

```bash
tail -f logs/*.log | grep LabelGrid
```

You should see:
```
✅ LabelGrid API client initialized
```

---

## Step 6: Test with a Sample Release

Create a test release to verify end-to-end functionality:

1. **Log in to Max Booster**
2. Navigate to **Distribution** → **New Release**
3. Fill in release details:
   - Title: "Test Release"
   - Artist: "Your Name"
   - Genre: Select appropriate genre
   - Release Date: Any future date

4. Upload a test track (WAV/MP3, minimum 30 seconds)
5. Upload album artwork (3000x3000px minimum, JPG/PNG)
6. Click **"Submit to Platforms"**

7. **Monitor the status**:
   - Check **Distribution Status** page
   - You should see status updates as the release processes
   - Webhooks will update status in real-time

8. **Review analytics** (after release goes live):
   - Navigate to **Distribution** → **Analytics**
   - Select your test release
   - View platform-specific streaming data

---

## API Usage Examples

### Create Release

```typescript
import { labelGridService } from './services/labelgrid-service';

const release = await labelGridService.createRelease({
  title: 'My Album',
  artist: 'Artist Name',
  releaseDate: '2025-12-25',
  genre: 'Pop',
  artwork: 'https://yourcdn.com/artwork.jpg',
  platforms: ['spotify', 'apple_music', 'youtube_music'],
  tracks: [
    {
      title: 'Track 1',
      artist: 'Artist Name',
      audioFile: 'https://yourcdn.com/track1.wav',
      duration: 180,
      trackNumber: 1,
    }
  ],
});

console.log('Release ID:', release.releaseId);
console.log('Status:', release.status);
```

### Check Release Status

```typescript
const status = await labelGridService.getReleaseStatus(releaseId);

console.log('Overall Status:', status.status);
status.platforms.forEach(platform => {
  console.log(`${platform.platform}: ${platform.status}`);
});
```

### Get Analytics

```typescript
const analytics = await labelGridService.getReleaseAnalytics(releaseId);

console.log('Total Streams:', analytics.totalStreams);
console.log('Total Revenue:', analytics.totalRevenue);

Object.entries(analytics.platforms).forEach(([platform, data]) => {
  console.log(`${platform}: ${data.streams} streams, $${data.revenue}`);
});
```

### Generate ISRC/UPC

```typescript
// Generate ISRC for a track
const isrc = await labelGridService.generateISRC('Artist Name', 'Track Title');
console.log('ISRC:', isrc.code);

// Generate UPC for a release
const upc = await labelGridService.generateUPC('Album Title');
console.log('UPC:', upc.code);
```

---

## Webhook Event Handling

The webhook handler automatically processes these events:

### `release.status.changed`
- Updates release status in database
- Syncs with LabelGrid's current state

### `release.live`
- Marks release as live on specific platform
- Creates notification for user
- Updates dispatch status

### `release.failed`
- Marks release as failed
- Stores error message
- Alerts user with resolution steps

### `analytics.updated`
- Updates streaming/download counts
- Saves to database for historical tracking
- Refreshes dashboard analytics

---

## Troubleshooting

### Issue: "LabelGrid not configured - returning simulated response"

**Cause**: API token not set in environment variables

**Solution**:
1. Verify `LABELGRID_API_TOKEN` is set in `.env`
2. Restart server after updating `.env`
3. Check token hasn't expired in LabelGrid dashboard

---

### Issue: "Webhook signature verification failed"

**Cause**: Webhook secret mismatch

**Solution**:
1. Ensure `LABELGRID_WEBHOOK_SECRET` in `.env` matches secret in LabelGrid dashboard
2. Check for extra spaces or newlines in secret
3. Regenerate both secret and webhook if needed

---

### Issue: "Failed to generate ISRC/UPC"

**Cause**: API token lacks necessary permissions

**Solution**:
1. Log in to LabelGrid dashboard
2. Go to API tokens section
3. Edit token permissions
4. Enable "Code Generation" permission
5. Save and restart server

---

### Issue: "Release status not updating"

**Cause**: Webhooks not configured or failing

**Solution**:
1. Check webhook endpoint is publicly accessible
2. Verify webhook URL in LabelGrid dashboard
3. Test webhook using LabelGrid's test feature
4. Check server logs for webhook errors:
   ```bash
   tail -f logs/*.log | grep webhook
   ```

---

### Issue: "Analytics not available"

**Cause**: Release not yet live or insufficient data

**Solution**:
1. Ensure release status is "live" on platforms
2. Wait 24-48 hours after go-live for initial analytics
3. Check platform-specific reporting delays:
   - Spotify: 2-3 days delay
   - Apple Music: 3-5 days delay
   - Others: Varies by platform

---

## Rate Limits

LabelGrid API implements rate limiting:

- **Growth Tier**: 1000 requests per hour
- **Retry Logic**: Automatic exponential backoff (1s, 2s, 4s, 8s, 16s max)
- **Webhook Deliveries**: Unlimited (but must respond within 5 seconds)

---

## Security Best Practices

1. **Never commit API tokens to version control**
   - Use `.env` file (already in `.gitignore`)
   - Use environment secrets in production

2. **Rotate API tokens regularly**
   - Recommended: Every 90 days
   - Immediately if compromised

3. **Validate webhook signatures**
   - Already implemented in webhook handler
   - Never process unsigned webhooks

4. **Use HTTPS only**
   - LabelGrid requires HTTPS for webhooks
   - Ensure SSL certificate is valid

5. **Monitor API usage**
   - Check LabelGrid dashboard for unusual activity
   - Set up alerts for rate limit warnings

---

## Production Deployment Checklist

Before going live, verify:

- [ ] LabelGrid Growth Tier subscription is active (trial expired)
- [ ] API token is production-ready (not test token)
- [ ] Webhook endpoint is publicly accessible via HTTPS
- [ ] Environment variables are set in production environment
- [ ] Database migrations have run successfully
- [ ] Test release has been submitted and verified
- [ ] Analytics are being received and displayed
- [ ] Error notifications are working
- [ ] Backup/rollback plan is in place

---

## Support

### LabelGrid Support
- **Documentation**: [labelgrid.com/docs](https://labelgrid.com/docs)
- **Email**: support@labelgrid.com
- **Dashboard**: Live chat (bottom-right corner)

### Max Booster Support
- **GitHub Issues**: [github.com/your-org/max-booster/issues](https://github.com/your-org/max-booster/issues)
- **Email**: dev@maxbooster.ai
- **Logs**: Check `Max-Booster/logs/` directory

---

## Appendix: Supported Platforms

LabelGrid distributes to 36+ platforms, including:

### Streaming Services
- Spotify
- Apple Music
- YouTube Music
- Amazon Music
- Deezer
- Tidal
- Pandora
- iHeartRadio
- SoundCloud Go+

### Social Platforms
- TikTok
- Instagram/Facebook
- YouTube Content ID
- Snapchat

### Download Stores
- iTunes
- Amazon Music Store
- Google Play Store

### Other Services
- Shazam
- Beatport
- 7digital
- And 20+ more

---

## Changelog

**v1.0.0** - Initial release (December 2025)
- Full LabelGrid API integration
- Webhook support
- ISRC/UPC generation
- Analytics tracking
- Graceful degradation (simulated mode)
