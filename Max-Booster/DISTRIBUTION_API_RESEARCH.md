# Music Distribution API Research & Recommendation

**Date**: November 12, 2025  
**Goal**: Find the best music distribution API for Max Booster to deliver music to Spotify, Apple Music, YouTube Music, and 30+ other platforms

---

## 🏆 WINNER: LabelGrid

**Recommended Choice**: Start with **LabelGrid** (7-day free trial, then Growth tier)

### Why LabelGrid Wins

1. **0% Royalty Take**: LabelGrid takes **zero royalty commission** on Merlin-affiliated DSPs (Spotify, Apple Music, Deezer, etc.). You only pay the monthly subscription fee. This is critical for Max Booster's $468-699/year pricing model.

2. **Spotify Preferred Delivery Partner**: One of the few globally with this status - ensures fastest delivery times and best relationship with Spotify (the #1 streaming platform).

3. **Full RESTful API**: Complete programmatic control over:
   - **Content/CMS API** - Manage releases, tracks, artists, metadata
   - **Distribution API** - Automate delivery to 100+ DSPs, schedule releases, handle takedowns
   - **Royalty & Accounting API** - Access splits, earnings, statements, payments
   - **Analytics API** - Real-time streaming data from all DSPs (geography, playlists, trends)
   - **DDEX Feed Integration** - Automated catalog sync via industry-standard XML

4. **DDEX 3.8.2 & 4.3 Support**: Industry-standard automated metadata delivery. Max Booster can build clean internal workflows that export DDEX XML and LabelGrid ingests automatically - no manual uploads.

5. **BYO-Deals (Bring Your Own Deals)**: Growth+ tier allows Max Booster to establish **direct relationships with DSPs** over time while still using LabelGrid's infrastructure. This enables the hybrid approach: start aggregated, gradually migrate to direct.

6. **Webhooks**: Growth+ tier provides real-time webhook notifications for distribution events - critical for Max Booster's email notification system.

7. **7-Day Free Trial**: Test the full API before committing any money.

8. **Developer-Friendly**: Full API documentation at https://docs.labelgrid.com/, WordPress plugin, sandbox environment.

9. **US-Based**: Denver, Colorado company = easier communication and support for solo founder vs overseas companies.

10. **Scalable Tiers**: Start small (Starter), add webhooks (Growth), get dedicated support (Scale), go unlimited (Enterprise).

---

## LabelGrid Pricing Tiers

| Tier | Target | Features | Support |
|------|--------|----------|---------|
| **Starter** | First catalog, testing | Basic API access, essential endpoints | Email (48h) |
| **Growth** | Automation | **Webhooks**, 25 label seats, BYO-Deals | Email (48h) |
| **Scale** | Large catalogs | Dedicated account manager, higher limits | Named TAM, 4h SLA |
| **Enterprise** | Unlimited | Custom SLAs, regional hosting, unlimited seats | Custom uptime |

**Estimated Pricing** (based on industry standards):
- **Starter**: ~$200-300/month
- **Growth**: ~$400-600/month (includes webhooks - **recommended tier**)
- **Scale**: ~$800-1,500/month
- **Enterprise**: Custom (likely $2,000+/month)

---

## Profitability Analysis for Max Booster

### Using LabelGrid Growth Tier at $500/month ($6,000/year)

| Users | Annual Revenue | LabelGrid Cost | Gross Profit | Margin |
|-------|----------------|----------------|--------------|--------|
| **13** | $6,084 | $6,000 | $84 | **1%** (break-even) |
| **50** | $23,400 | $6,000 | $17,400 | **74%** |
| **100** | $46,800 | $6,000 | $40,800 | **87%** |
| **500** | $234,000 | $6,000 | $228,000 | **97%** |
| **1,000** | $468,000 | $6,000 | $462,000 | **99%** |

**Break-even**: 13 paying yearly customers at $468/year  
**Scales beautifully**: 97-99% profit margin at scale

---

## LabelGrid Distribution Network (100+ DSPs)

### Major Streaming Platforms
- ✅ Spotify (Preferred Delivery Partner status)
- ✅ Apple Music
- ✅ Amazon Music
- ✅ YouTube Music
- ✅ Deezer
- ✅ Pandora
- ✅ Tidal
- ✅ TikTok
- ✅ Instagram/Facebook (ContentID)

### Electronic/DJ Platforms
- ✅ Beatport
- ✅ Traxsource

### Direct-to-Fan
- ✅ Bandcamp
- ✅ SoundCloud

### Additional Features
- ✅ YouTube Content ID monetization (optional 20% fee)
- ✅ Automated UPC/ISRC code generation
- ✅ Real-time analytics from all platforms
- ✅ Nightly backups & disaster recovery

---

## API Integration Workflow

### Step 1: Sign Up & Trial
1. Go to https://labelgrid.com/pricing/
2. Start **7-day free trial** (full API access, no credit card)
3. Generate API token from dashboard

### Step 2: Test API Integration
```typescript
// Example: Max Booster → LabelGrid Distribution Flow

// 1. User uploads audio file to Max Booster
// 2. Max Booster processes metadata (artist, title, genre, artwork, etc.)
// 3. Generate DDEX XML package OR use REST API directly

// REST API Example:
POST https://api.labelgrid.com/releases
{
  "artist": "John Doe",
  "title": "My New Single",
  "genre": "Electronic",
  "release_date": "2025-12-01",
  "tracks": [...],
  "dsps": ["spotify", "apple_music", "youtube_music"],
  "isrc_codes": ["US-ABC-25-12345"]
}

// 4. LabelGrid validates & delivers to DSPs
// 5. Webhook notifies Max Booster of delivery status
// 6. Max Booster sends email to user: "Your music is live on Spotify!"
```

### Step 3: Production Setup
1. Subscribe to **Growth tier** (webhooks + BYO-Deals)
2. Configure webhook endpoints in Max Booster server
3. Set up DDEX feed for automated catalog sync (optional)
4. Integrate royalty API for automated earnings reports

### Step 4: Scale
- Monitor usage and catalog size
- Upgrade to Scale tier when needing dedicated support
- Eventually negotiate BYO-Deals with Spotify/Apple Music for direct relationships

---

## Alternative Options (If LabelGrid Doesn't Work Out)

### Runner-Up #1: SonoSuite

**Pricing**: €199/month (~$215/month = $2,580/year)  
**Capacity**: 5,000 tracks, 500 user accounts, 3 admin accounts  
**DSPs**: 220+ platforms  
**API**: RESTful distribution API, DDEX support  

**Pros**:
- ✅ **Transparent pricing** (no surprise costs)
- ✅ 220+ DSPs (more than LabelGrid)
- ✅ Quality Control team ensures DSP compliance
- ✅ Automated royalty management
- ✅ White-label branding
- ✅ Established company (founded 2007, Barcelona)

**Cons**:
- ⚠️ May take revenue share on some platforms (need to confirm)
- ⚠️ No "BYO-Deals" feature for direct DSP relationships
- ⚠️ Based in Spain (EU timezone, potential language barriers)

**Profitability at €199/month ($2,580/year)**:
- Break-even: 5.5 users
- At 100 users: $46,800 revenue - $2,580 = $44,220 profit (94% margin)
- At 500 users: $234,000 revenue - $2,580 = $231,420 profit (99% margin)

---

### Runner-Up #2: limbo/ (Limbo Music)

**Pricing**: Pay-as-you-go modular pricing (contact for quote)  
**DSPs**: All major platforms  
**API**: Modular "Music Blocks" RESTful API (JSON API spec)  

**Pros**:
- ✅ API-first design (built for developers)
- ✅ Pay only for modules you use (flexible)
- ✅ YouTube Tier A Partner status
- ✅ Advanced AI fraud detection (combat fake streams)
- ✅ Merlin Network board member (CEO Fer Isella)
- ✅ Direct DSP contracts supported
- ✅ AI chatbot integration (limbo/Chat)

**Cons**:
- ⚠️ No public pricing (need custom quote)
- ⚠️ Newer company (less established than SonoSuite/LabelGrid)
- ⚠️ Based in Madrid, Spain

**Best For**: Max Booster if needing maximum API flexibility and fraud protection at scale.

---

### Not Recommended

**FUGA** - Enterprise-only, custom pricing likely $5,000-20,000+/month  
**VerseOne Pro API** - Brand new (July 2025), unproven, no pricing transparency  
**Symphonic** - No public API available  
**Ditto Music** - Limited white-label info, contact for pricing  
**iMusician** - No API, artist-focused B2C only  

---

## Implementation Timeline

### Week 1: Trial & Testing
- **Day 1**: Sign up for LabelGrid 7-day free trial
- **Day 2-3**: Read API documentation, test release creation endpoint
- **Day 4-5**: Build integration in Max Booster distribution service
- **Day 6**: Test complete flow: upload → metadata → distribute → webhook
- **Day 7**: Evaluate pricing and decide

### Week 2: Production Setup
- **Day 8**: Subscribe to Growth tier ($400-600/month est.)
- **Day 9-10**: Configure webhooks for distribution status updates
- **Day 11-12**: Integrate email notifications (SendGrid already ready)
- **Day 13**: Deploy to production, test with 1-2 beta users
- **Day 14**: Document API integration in codebase

### Week 3-4: Polish & Launch
- **Day 15-20**: Add error handling, retry logic, monitoring
- **Day 21-25**: Build admin dashboard for distribution analytics
- **Day 26-28**: Beta testing with 10-20 users, fix bugs

### Launch Day
- Announce distribution feature to users
- Monitor first 100 releases closely
- Gather feedback and iterate

---

## Key API Endpoints to Integrate

### 1. Distribution API
```typescript
// Create release
POST /api/releases
{
  artist, title, genre, tracks, artwork, dsps, release_date
}

// Check delivery status
GET /api/releases/{id}/delivery-status

// Takedown release
DELETE /api/releases/{id}
```

### 2. Webhook Notifications
```typescript
// Max Booster webhook receiver
POST /api/webhooks/labelgrid
{
  event: "release.delivered",
  release_id: "12345",
  dsp: "spotify",
  status: "live",
  link: "https://open.spotify.com/album/..."
}

// Trigger email: "Your music is live on Spotify!"
```

### 3. Analytics API
```typescript
// Get streaming stats
GET /api/analytics/release/{id}
{
  total_streams: 50000,
  platforms: {
    spotify: 35000,
    apple_music: 10000,
    youtube_music: 5000
  },
  geography: { US: 20000, UK: 15000, ... },
  playlists: [...]
}
```

### 4. Royalty API
```typescript
// Get earnings
GET /api/royalties/release/{id}
{
  total_earnings: 250.50,
  platforms: {
    spotify: 175.00,
    apple_music: 50.50,
    youtube_music: 25.00
  },
  period: "2025-10-01 to 2025-10-31"
}
```

---

## Security & Best Practices

### API Authentication
- Use API tokens (not hardcoded, store in environment variables)
- Rotate tokens every 90 days
- Never expose tokens in client-side code

### Webhook Security
- Verify webhook signatures (HMAC)
- Use HTTPS endpoints only
- Implement idempotency (handle duplicate webhook events)

### Error Handling
- Retry failed deliveries (exponential backoff)
- Log all API requests for debugging
- Monitor API rate limits
- Graceful degradation if LabelGrid API is down

---

## Conclusion & Next Steps

### Recommendation: LabelGrid Growth Tier

**Why**: 
- 0% royalty take (only pay monthly subscription)
- Spotify Preferred Partner status
- Full RESTful API with webhooks
- BYO-Deals for future direct DSP relationships
- 7-day free trial to test everything
- $6,000/year cost = 97%+ profit margin at 100+ users

**Next Steps**:
1. ✅ **This Week**: Sign up for LabelGrid 7-day free trial
2. ✅ **Test API**: Build integration in Max Booster during trial
3. ✅ **Evaluate**: Review actual pricing after trial
4. ✅ **Subscribe**: If pricing is $200-600/month, subscribe to Growth tier
5. ✅ **Fallback**: If too expensive (>$600/month), try SonoSuite at €199/month

**Alternative Path**:
- If LabelGrid pricing is >$600/month, go with **SonoSuite Bronze** at €199/month ($2,580/year)
- Still 94%+ profit margin at scale
- More transparent pricing
- 220+ DSPs

**Launch Timeline**: 2-4 weeks from trial start to production launch

---

## Contact Information

### LabelGrid
- **Website**: https://labelgrid.com/
- **Pricing**: https://labelgrid.com/pricing/
- **API Docs**: https://docs.labelgrid.com/
- **Trial**: 7 days free, full access
- **Location**: Denver, Colorado, USA

### SonoSuite (Fallback)
- **Website**: https://sonosuite.com/
- **Pricing**: €199/month (Bronze tier)
- **Location**: Barcelona, Spain
- **Contact**: Fill form on website for quote

### limbo/ (Alternative)
- **Website**: https://www.limbomusic.com/
- **API Docs**: https://developer.limbomusic.com/
- **Contact**: info@limbomusic.com
- **Location**: Madrid, Spain

---

**Final Verdict**: Start with **LabelGrid 7-day free trial** immediately. If pricing works out ($200-600/month), it's the perfect fit for Max Booster. If too expensive, fallback to **SonoSuite** at €199/month.

Both options give Max Booster:
- ✅ Real distribution to 100+ DSPs
- ✅ Professional API integration
- ✅ 90%+ profit margins at scale
- ✅ Production-ready in 2-4 weeks
