# Production Roadmap - Complete Implementation Guide

**Last Updated:** October 18, 2025  
**Status:** Research Complete → Ready for Implementation  
**Approach:** Systematic, professional, production-grade implementation

---

## Overview

This document provides the complete professional implementation guide for transforming the Max Booster platform from infrastructure-ready to fully functional with real, working features. All research has been completed, industry best practices identified, and technical approaches validated.

---

## TASK 1: Real Marketplace with Stripe Connect P2P Payments ✅ RESEARCHED

### Current State
- Database schema correct (listings table uses UUID)
- Service layer has placeholder implementations (`browseListings()` returns `[]`, `getListing()` returns `null`)
- Routes exist but return empty data
- Frontend UI complete but shows no beats

### Professional Implementation Approach

**Architecture: Stripe Connect Express Accounts**
- **Why Express**: Automated 2-minute seller onboarding, pre-built dashboard, Stripe handles KYC/verification
- **Payment Flow**: Destination Charges with automatic platform fee splitting
- **Fee Structure**: 10% platform fee (configurable), Stripe takes 2.9% + $0.30 + 0.25% platform fee

**Technical Stack:**
```javascript
// Payment Intent with destination charge
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // $100
  currency: 'usd',
  application_fee_amount: 1000, // $10 platform fee
  on_behalf_of: sellerConnectedAccountId,
  transfer_data: {
    destination: sellerConnectedAccountId,
  },
  metadata: {
    beat_id: beatId,
    buyer_id: buyerId,
  },
}, {
  idempotencyKey: `beat_${beatId}_buyer_${buyerId}_${Date.now()}`
});
```

**Seller Onboarding Flow:**
1. Create Stripe Express Connected Account
2. Generate onboarding link with `stripe.accountLinks.create()`
3. Redirect seller to Stripe's embedded onboarding
4. Stripe collects: business details, bank account, tax ID, identity verification
5. Webhook `account.updated` confirms verification complete

**Webhook Security (CRITICAL):**
- Use `express.raw({ type: 'application/json' })` for webhook routes (NOT `express.json()`)
- Always verify signature with `stripe.webhooks.constructEvent()`
- Implement idempotency to handle duplicate events
- Store processed event IDs in database

**Database Schema Updates:**
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN stripe_account_id VARCHAR(255);
ALTER TABLE users ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN payout_schedule VARCHAR(20) DEFAULT 'weekly';

-- Orders/transactions table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id VARCHAR REFERENCES users(id),
  seller_id VARCHAR REFERENCES users(id),
  payment_intent_id VARCHAR(255),
  amount_cents INT,
  platform_fee_cents INT,
  seller_amount_cents INT,
  status VARCHAR(20), -- pending, succeeded, failed, refunded
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation Steps:**
1. Fix service layer methods to query database (already started)
2. Add Stripe Connect seller onboarding endpoints
3. Implement payment processing with destination charges
4. Set up webhook handlers for `payment_intent.succeeded`, `account.updated`
5. Add seller dashboard showing earnings, payout schedule
6. Test with Stripe test mode cards

**Testing:**
```bash
# Test webhook locally
stripe listen --forward-to localhost:5000/webhooks/stripe
stripe trigger payment_intent.succeeded
```

**Resources:**
- Stripe Connect Docs: https://stripe.com/docs/connect
- Express Accounts: https://stripe.com/docs/connect/express-accounts
- BeatStars takes 0% commission (monetizes via subscriptions) - we'll take 10%

---

## TASK 2: Social Media Multi-Platform Posting (Real API Integration)

### Current State
- Social service has stubbed `postToSocialMedia()` that returns fake post IDs
- Frontend shows "Posted successfully" but nothing actually posts
- No OAuth integration for user authentication

### Professional Implementation Approach

**Architecture: Unified API (LATE or Ayrshare) + OAuth 2.0**

**Why Unified API:**
- Single integration covers 10+ platforms (Twitter, Instagram, Facebook, TikTok, LinkedIn, Threads, Pinterest, Bluesky)
- Automatic rate limit handling
- Retry logic built-in
- Sub-50ms response times
- $19/month for 10 profiles, 120 posts

**Alternative: Direct Platform APIs**
- More control but 2-4 weeks setup per platform
- Must handle rate limits manually
- OAuth 2.0 for each platform separately
- Higher maintenance overhead

**Recommended: Start with LATE API, add direct APIs later for advanced features**

**LATE API Implementation:**
```javascript
const axios = require('axios');

async function postToMultiplePlatforms(content, platforms, mediaUrls) {
  const response = await axios.post('https://api.getlate.dev/v1/posts', {
    text: content,
    platforms: platforms, // ['twitter', 'facebook', 'instagram']
    media_urls: mediaUrls,
    schedule_date: null, // Immediate posting
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.LATE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data; // Returns post IDs for each platform
}
```

**OAuth 2.0 User Connection Flow (for direct APIs):**

**Twitter/X:**
```javascript
// 1. Redirect to authorization
const authUrl = `https://twitter.com/i/oauth2/authorize?` +
  `response_type=code&` +
  `client_id=${TWITTER_CLIENT_ID}&` +
  `redirect_uri=${CALLBACK_URL}&` +
  `scope=tweet.read tweet.write users.read&` +
  `state=${randomState}&` +
  `code_challenge=${codeChallenge}&` +
  `code_challenge_method=S256`;

// 2. Exchange code for token
const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', {
  code: authCode,
  grant_type: 'authorization_code',
  client_id: TWITTER_CLIENT_ID,
  redirect_uri: CALLBACK_URL,
  code_verifier: codeVerifier
});

// 3. Store access token per user
await db.socialAccounts.create({
  user_id: userId,
  platform: 'twitter',
  access_token: tokenResponse.data.access_token,
  refresh_token: tokenResponse.data.refresh_token,
  expires_at: Date.now() + tokenResponse.data.expires_in * 1000
});
```

**Database Schema:**
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  platform VARCHAR(50), -- twitter, facebook, instagram, tiktok, linkedin
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  platform_user_id VARCHAR(255),
  platform_username VARCHAR(255),
  connected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  content TEXT,
  media_urls JSONB,
  platforms JSONB, -- ['twitter', 'instagram']
  platform_post_ids JSONB, -- {twitter: '123', instagram: '456'}
  status VARCHAR(20), -- pending, posted, failed
  posted_at TIMESTAMP,
  error_message TEXT
);
```

**Implementation Steps:**
1. Sign up for LATE API account (or choose Ayrshare)
2. Add OAuth 2.0 connection flow for each platform
3. Build "Connect Social Accounts" page in frontend
4. Update `socialService.postToSocialMedia()` to call LATE API
5. Add retry logic for failed posts
6. Display post analytics (likes, shares, comments) if API provides

**Rate Limits to Handle:**
- Twitter: 300 posts/3hrs (user), 1500 tweets/day
- Instagram: 25 posts/24hrs
- Facebook: Varies by engagement
- TikTok: Varies by access tier

**Resources:**
- LATE Docs: https://getlate.dev/docs
- Ayrshare: https://www.ayrshare.com
- Twitter OAuth: https://developer.x.com/en/docs/authentication

---

## TASK 3: Music Distribution to DSPs (Spotify, Apple Music)

### Current State
- Distribution service returns fake submission IDs
- No actual integration with DSPs

### Reality Check: NO PUBLIC APIS AVAILABLE

**Critical Finding:**
- Spotify for Artists API: **Private only** (requires direct distribution agreement)
- Apple Music Connect: **Discontinued in 2018**
- DistroKid/TuneCore: **No public APIs**
- Direct DSP uploads: **Not possible without aggregator partnership**

**Professional Approach:**

**Option A: Partner with Existing Distributor API (If Available)**
- Symphonic Distribution (API for label clients)
- AWAL (enterprise API)
- Vydia (enterprise API)
- Requires business development contact

**Option B: Manual Workflow + Metadata Management**
```javascript
// Instead of auto-distribution, provide:
async function prepareDistributionPackage(releaseId) {
  const release = await db.releases.findById(releaseId);
  
  // Generate distribution package
  return {
    // Audio files (WAV 44.1kHz/16-bit)
    audioFiles: await getAudioFiles(release.track_ids),
    
    // Metadata in DDEX format (industry standard)
    metadata: {
      upc: release.upc || generateUPC(),
      isrc: release.isrcs,
      title: release.title,
      artist: release.artist_name,
      release_date: release.release_date,
      genre: release.genre,
      artwork_url: release.artwork_url, // 3000x3000px minimum
      territories: release.territories || 'worldwide'
    },
    
    // Distribution instructions
    instructions: generateDistributionGuide(release)
  };
}
```

**Frontend UX:**
Instead of "Distribute Now", show:
1. Checklist for distribution readiness
2. Download metadata files (DDEX XML)
3. Links to DistroKid/TuneCore/CD Baby signup
4. Integration guides for each platform
5. Track distribution status manually

**Future Integration Path:**
- Monitor for API releases from distributors
- Build DistroKid-like service (requires DSP partnerships - multi-year effort)
- Use Spotify Web API for post-distribution analytics only

**Implementation Steps:**
1. Update service to generate proper distribution packages
2. Create metadata export (DDEX XML format)
3. Build "Distribution Readiness" checklist UI
4. Add manual tracking of distribution status
5. Integrate Spotify Web API for analytics AFTER manual distribution

**Resources:**
- DDEX Standard: http://ddex.net/
- Spotify Web API: https://developer.spotify.com/documentation/web-api
- Apple Music API: https://developer.apple.com/musickit/

---

## TASK 4: Studio/DAW - Web Audio API Implementation

### Current State
- UI complete with track controls, timeline, waveform display
- Audio playback stubbed (no actual Web Audio processing)
- Effects don't actually process audio
- Recording not functional

### Professional Implementation Approach

**Architecture: Web Audio API + AudioWorklets**

**Core Components:**

**1. AudioContext Setup:**
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Handle browser autoplay policy
document.getElementById('playBtn').addEventListener('click', async () => {
  await audioContext.resume();
  // Now can play audio
});
```

**2. Track Playback (BufferSource):**
```javascript
async function loadAudioTrack(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // Connect to gain (volume) then destination
  const gain = audioContext.createGain();
  gain.gain.value = 0.8;
  
  source.connect(gain);
  gain.connect(audioContext.destination);
  
  source.start(0);
  
  return { source, gain, duration: audioBuffer.duration };
}
```

**3. Multi-Track Mixing:**
```javascript
class MultiTrackMixer {
  constructor() {
    this.tracks = new Map();
    this.masterGain = audioContext.createGain();
    this.masterGain.connect(audioContext.destination);
  }
  
  async addTrack(trackId, audioUrl) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const trackGain = audioContext.createGain();
    trackGain.connect(this.masterGain);
    
    this.tracks.set(trackId, {
      buffer: audioBuffer,
      gain: trackGain,
      source: null
    });
  }
  
  play() {
    const startTime = audioContext.currentTime;
    
    this.tracks.forEach((track, trackId) => {
      const source = audioContext.createBufferSource();
      source.buffer = track.buffer;
      source.connect(track.gain);
      source.start(startTime);
      track.source = source;
    });
  }
  
  stop() {
    this.tracks.forEach(track => {
      if (track.source) {
        track.source.stop();
        track.source = null;
      }
    });
  }
}
```

**4. Effects Implementation:**

**Reverb (ConvolverNode):**
```javascript
async function createReverb() {
  const convolver = audioContext.createConvolver();
  
  // Load impulse response
  const response = await fetch('/impulse-responses/hall.wav');
  const arrayBuffer = await response.arrayBuffer();
  convolver.buffer = await audioContext.decodeAudioData(arrayBuffer);
  
  return convolver;
}

// Usage
const reverb = await createReverb();
source.connect(reverb);
reverb.connect(audioContext.destination);
```

**EQ (BiquadFilterNode):**
```javascript
function create3BandEQ() {
  const lowShelf = audioContext.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = 320;
  lowShelf.gain.value = 0; // -12dB to +12dB
  
  const mid = audioContext.createBiquadFilter();
  mid.type = 'peaking';
  mid.frequency.value = 1000;
  mid.Q.value = 1;
  mid.gain.value = 0;
  
  const highShelf = audioContext.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 3200;
  highShelf.gain.value = 0;
  
  // Chain filters
  lowShelf.connect(mid);
  mid.connect(highShelf);
  
  return { input: lowShelf, output: highShelf, lowShelf, mid, highShelf };
}
```

**Compressor:**
```javascript
const compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -50;
compressor.knee.value = 40;
compressor.ratio.value = 12;
compressor.attack.value = 0;
compressor.release.value = 0.25;

source.connect(compressor);
compressor.connect(audioContext.destination);
```

**5. Recording (MediaRecorder):**
```javascript
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);
  
  const mediaRecorder = new MediaRecorder(stream);
  const chunks = [];
  
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };
  
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(blob);
    // Upload to server or add to project
    await uploadRecording(blob);
  };
  
  mediaRecorder.start();
  return { mediaRecorder, source };
}
```

**6. Waveform Visualization (AnalyserNode):**
```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

source.connect(analyser);
analyser.connect(audioContext.destination);

function drawWaveform() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  analyser.getByteTimeDomainData(dataArray);
  
  // Draw to canvas
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(0, 200, 0)';
  ctx.beginPath();
  
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  }
  
  ctx.stroke();
  requestAnimationFrame(drawWaveform);
}
```

**7. Export/Bounce (OfflineAudioContext):**
```javascript
async function exportProject(tracks, duration) {
  const offlineContext = new OfflineAudioContext(2, duration * 44100, 44100);
  
  // Render all tracks
  for (const track of tracks) {
    const response = await fetch(track.audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
    
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    
    const gain = offlineContext.createGain();
    gain.gain.value = track.volume;
    
    source.connect(gain);
    gain.connect(offlineContext.destination);
    source.start(0);
  }
  
  // Render faster than real-time
  const renderedBuffer = await offlineContext.startRendering();
  
  // Convert to WAV
  const wavBlob = bufferToWav(renderedBuffer);
  return wavBlob;
}
```

**Implementation Steps:**
1. Replace stubbed playback with AudioBufferSourceNode
2. Implement track gain/volume controls
3. Add effects chain (reverb, EQ, compressor)
4. Implement recording via MediaRecorder API
5. Add waveform visualization with AnalyserNode
6. Implement export using OfflineAudioContext
7. Add automation (volume, pan, effects parameters over time)

**Performance Optimizations:**
- Use AudioWorklets for custom DSP (avoids main thread blocking)
- Implement buffer caching for frequently used samples
- Use React.memo for track components (already done)
- Debounce parameter changes during automation

**Resources:**
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Web Audio Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- Tone.js (higher-level library): https://tonejs.github.io/

---

## TASK 5: AI Music Analysis (BPM, Key, Loudness Detection)

### Current State
- AI service returns random/placeholder values
- No actual audio analysis

### Professional Implementation Approach

**Architecture: Python Backend + Essentia + pyloudnorm**

**Why Python:**
- Best audio analysis libraries (Essentia, librosa, pyloudnorm)
- Production-tested algorithms
- Can run as microservice called from Node.js backend

**Tech Stack:**
- **BPM Detection**: Essentia RhythmExtractor2013
- **Key Detection**: Essentia KeyExtractor
- **Loudness (LUFS)**: pyloudnorm (ITU-R BS.1770-4 compliant)

**Python Microservice:**
```python
# audio_analysis_service.py
import essentia.standard as es
import pyloudnorm as pyln
import soundfile as sf
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    audio_file = request.files['audio']
    audio_path = f'/tmp/{audio_file.filename}'
    audio_file.save(audio_path)
    
    # Load audio
    audio = es.MonoLoader(filename=audio_path, sampleRate=44100)()
    
    # BPM Detection
    rhythm = es.RhythmExtractor2013(method="multifeature")
    bpm, beats, confidence, _, _ = rhythm(audio)
    
    # Key Detection
    key_extractor = es.KeyExtractor()
    key, scale, strength = key_extractor(audio)
    
    # LUFS Measurement
    data, rate = sf.read(audio_path)
    meter = pyln.Meter(rate)
    lufs = meter.integrated_loudness(data)
    
    return jsonify({
        'bpm': float(bpm),
        'key': f"{key} {scale}",
        'key_strength': float(strength),
        'lufs': float(lufs),
        'beats_confidence': float(confidence)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

**Node.js Integration:**
```javascript
// server/services/aiService.ts
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function analyzeAudio(audioFilePath: string) {
  const form = new FormData();
  form.append('audio', fs.createReadStream(audioFilePath));
  
  const response = await axios.post('http://localhost:5001/analyze', form, {
    headers: form.getHeaders()
  });
  
  return response.data;
}
```

**Alternative: JavaScript-Only (Browser)**
```javascript
// For client-side analysis (less accurate but no backend needed)
import { RealTimeBpmAnalyzer } from 'realtime-bpm-analyzer';

const audioContext = new AudioContext();
const analyzer = await createRealTimeBpmProcessor(audioContext);

analyzer.port.onmessage = (event) => {
  if (event.data.message === 'BPM') {
    console.log('BPM:', event.data.data.bpm);
  }
};
```

**Database Schema:**
```sql
ALTER TABLE projects ADD COLUMN bpm INT;
ALTER TABLE projects ADD COLUMN musical_key VARCHAR(20);
ALTER TABLE projects ADD COLUMN lufs_integrated FLOAT;
ALTER TABLE projects ADD COLUMN analysis_date TIMESTAMP;
```

**Implementation Steps:**
1. Create Python Flask microservice with Essentia + pyloudnorm
2. Docker containerize Python service
3. Add `/api/analyze-audio` endpoint in Node.js that calls Python service
4. Update frontend to display analysis results
5. Store analysis results in database
6. Add re-analysis button for updated tracks

**Docker Setup:**
```dockerfile
# Dockerfile.audio-analysis
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY audio_analysis_service.py .

CMD ["python", "audio_analysis_service.py"]
```

**requirements.txt:**
```
Flask==3.0.0
essentia==2.1b6.dev1034
pyloudnorm==0.1.1
soundfile==0.12.1
numpy==1.24.3
```

**Resources:**
- Essentia: https://essentia.upf.edu/
- pyloudnorm: https://github.com/csteinmetz1/pyloudnorm
- ITU-R BS.1770 Standard: https://www.itu.int/rec/R-REC-BS.1770/

---

## TASK 6: FFmpeg Audio Format Conversion

### Current State
- Export dialog shows format options but conversion not implemented
- Backend returns original file regardless of requested format

### Professional Implementation Approach

**Architecture: fluent-ffmpeg + Streaming**

**Installation:**
```bash
# System dependency
sudo apt-get install ffmpeg  # Linux
brew install ffmpeg          # macOS

# Node.js wrapper
npm install fluent-ffmpeg
```

**Implementation:**

**Streaming Conversion (Memory Efficient):**
```javascript
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

function convertAudio(inputPath, outputPath, options = {}) {
  const {
    format = 'mp3',
    bitrate = '192k',
    sampleRate = 44100,
    channels = 2
  } = options;
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(format)
      .audioCodec(getCodec(format))
      .audioBitrate(bitrate)
      .audioFrequency(sampleRate)
      .audioChannels(channels)
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        console.log('Conversion complete!');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Error:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
}

function getCodec(format) {
  const codecs = {
    mp3: 'libmp3lame',
    wav: 'pcm_s16le',
    flac: 'flac',
    aac: 'aac',
    ogg: 'libvorbis'
  };
  return codecs[format] || 'copy';
}
```

**HTTP Streaming Response (Express):**
```javascript
app.get('/api/projects/:id/export', async (req, res) => {
  const { format = 'mp3', bitrate = '192k' } = req.query;
  const project = await storage.getProject(req.params.id);
  
  res.writeHead(200, {
    'Content-Type': `audio/${format}`,
    'Content-Disposition': `attachment; filename="${project.title}.${format}"`
  });
  
  ffmpeg(project.audioFilePath)
    .toFormat(format)
    .audioCodec(getCodec(format))
    .audioBitrate(bitrate)
    .on('error', (err) => {
      console.error('Export error:', err);
      res.status(500).end();
    })
    .pipe(res, { end: true });
});
```

**Stem Export (Multi-Track):**
```javascript
async function exportStems(projectId) {
  const project = await storage.getProject(projectId);
  const tracks = await storage.getProjectTracks(projectId);
  
  const stemPaths = [];
  
  for (const track of tracks) {
    const stemPath = `/tmp/stem_${track.id}.wav`;
    
    await convertAudio(track.audioFilePath, stemPath, {
      format: 'wav',
      sampleRate: 48000,
      channels: 2
    });
    
    stemPaths.push(stemPath);
  }
  
  // Zip all stems
  const zip = new JSZip();
  for (const stemPath of stemPaths) {
    const data = await fs.promises.readFile(stemPath);
    zip.file(path.basename(stemPath), data);
  }
  
  return await zip.generateAsync({ type: 'nodebuffer' });
}
```

**Loudness Normalization (EBU R128):**
```javascript
function normalizeAudio(inputPath, outputPath, targetLUFS = -14) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters(`loudnorm=I=${targetLUFS}:TP=-1.5:LRA=11`)
      .toFormat('wav')
      .on('end', () => resolve())
      .on('error', reject)
      .save(outputPath);
  });
}
```

**Implementation Steps:**
1. Add FFmpeg conversion to export endpoint
2. Support formats: WAV, MP3, FLAC, OGG, AAC
3. Add quality settings (bitrate, sample rate)
4. Implement stem export (individual tracks)
5. Add loudness normalization option
6. Show conversion progress to user
7. Clean up temporary files after export

**Format Options:**

| Format | Codec | Quality | Use Case |
|--------|-------|---------|----------|
| WAV | PCM | Lossless | Mastering, production |
| FLAC | FLAC | Lossless | Archival |
| MP3 | LAME | 128k-320k | Distribution |
| AAC | AAC | 128k-256k | Streaming |
| OGG | Vorbis | Variable | Open source platforms |

**Resources:**
- fluent-ffmpeg: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
- FFmpeg Docs: https://ffmpeg.org/documentation.html
- Audio codecs guide: https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio

---

## TASK 7-20: Additional Tasks (Abbreviated)

### TASK 7: Collaborative Playlists (WebSocket Real-Time)
- **Tech**: WebSocket (ws library) + CRDT conflict resolution
- **Features**: Real-time add/remove/reorder, presence indicators, change notifications
- **Database**: `playlist_members`, `playlist_activities` tables

### TASK 8: Audio Collaboration Comments
- **Tech**: WaveSurfer.js RegionsPlugin + WebSocket
- **Features**: Timestamped comments, range comments, voice notes, replies
- **Database**: `comments` table with start_time, end_time fields

### TASK 9: Beat Licensing System
- **License Types**: MP3, WAV, Premium, Unlimited, Exclusive
- **Automation**: PDF contract generation (PDFKit), instant delivery, expiration tracking
- **Database**: `license_types`, `licenses_issued` tables

### TASK 10: Version Control for Projects
- **Tech**: Git-based for text project files + S3 for binaries
- **Features**: Auto-save versioning, visual diff, restore points
- **Database**: `project_versions` table

### TASK 11: Analytics Dashboard
- **Metrics**: Plays, likes, purchases, earnings, geographic data
- **Tech**: Recharts/Victory for visualizations
- **Database**: Aggregate queries on existing tables

### TASK 12: Royalty Payment Automation
- **Tech**: Stripe Connect scheduled transfers
- **Features**: Split payments, royalty shares, automatic payouts
- **Database**: `royalty_splits` table (already exists)

### TASK 13: Sample Library
- **Features**: Searchable sample packs, preview playback, license tracking
- **Database**: `sample_packs`, `samples` tables

### TASK 14: MIDI Support
- **Tech**: Web MIDI API + MIDI.js
- **Features**: MIDI input recording, virtual instruments, MIDI export
- **Implementation**: Navigator.requestMIDIAccess()

### TASK 15: Mastering Suite
- **Tech**: Essentia + custom Web Audio processing
- **Features**: Auto-mastering, reference matching, loudness targets
- **Algorithm**: Multiband compression, limiting, EQ matching

### TASK 16: Mobile Responsive Optimization
- **Tech**: Tailwind responsive classes + touch gestures
- **Features**: Mobile DAW controls, swipe gestures, PWA support
- **Testing**: Chrome DevTools mobile emulation

### TASK 17: Notification System Enhancement
- **Tech**: WebSocket + Push API + email (SendGrid)
- **Features**: Real-time notifications, push permissions, email digests
- **Database**: `notifications` table with read status

### TASK 18: Search & Discovery
- **Tech**: Full-text search (PostgreSQL) + Elasticsearch (future)
- **Features**: Beat search, producer search, genre filtering, trending
- **Database**: GIN indexes on text fields

### TASK 19: User Profiles & Following
- **Features**: Producer profiles, follower system, activity feeds
- **Database**: `follows` table, user stats

### TASK 20: Admin Dashboard
- **Features**: User management, content moderation, platform analytics
- **Tech**: Admin-only routes, role-based access control
- **Database**: Add `role` field to users table

---

## Implementation Priority

### Phase 1: Core Commerce (Weeks 1-2)
1. ✅ Task 1: Real Marketplace (Stripe Connect)
2. Task 9: Beat Licensing System
3. Task 12: Royalty Payments

### Phase 2: Content Creation (Weeks 3-4)
4. Task 4: Studio/DAW (Web Audio)
5. Task 5: AI Music Analysis
6. Task 6: FFmpeg Conversion

### Phase 3: Social & Distribution (Weeks 5-6)
7. Task 2: Social Media Posting
8. Task 3: Distribution Workflow
9. Task 11: Analytics Dashboard

### Phase 4: Collaboration (Weeks 7-8)
10. Task 7: Collaborative Playlists
11. Task 8: Audio Comments
12. Task 10: Version Control

### Phase 5: Enhancement (Weeks 9-10)
13. Task 13: Sample Library
14. Task 14: MIDI Support
15. Task 15: Mastering Suite
16. Task 16: Mobile Optimization

### Phase 6: Growth (Weeks 11-12)
17. Task 17: Notifications
18. Task 18: Search & Discovery
19. Task 19: User Profiles
20. Task 20: Admin Dashboard

---

## Success Criteria

### Technical
- ✅ All features use real database data (NO mock data)
- ✅ All external APIs properly integrated with error handling
- ✅ All payments process through Stripe (test mode validated)
- ✅ Audio processing works in browser (Web Audio API)
- ✅ Real-time features use WebSocket with reconnection logic
- ✅ All exports generate actual files (FFmpeg conversion)

### User Experience
- ✅ First-time user can create, sell, and get paid for beats
- ✅ Artists can record, mix, and export professional audio
- ✅ Social media posts actually appear on platforms
- ✅ Collaboration features work across multiple users
- ✅ Analytics show real data from platform usage

### Business
- ✅ Platform fee system working (10% on marketplace sales)
- ✅ Stripe payouts automated for sellers
- ✅ License agreements legally binding and auto-generated
- ✅ Revenue tracking accurate and auditable

---

## Technology Stack Summary

### Backend
- Node.js/Express (existing)
- PostgreSQL/Drizzle ORM (existing)
- Stripe Connect (payments)
- FFmpeg (audio conversion)
- Python/Flask (AI microservice)
- WebSocket (real-time)

### Frontend
- React/TypeScript (existing)
- Web Audio API (DAW)
- WaveSurfer.js (waveforms)
- Socket.io client (real-time)
- React Query (existing)

### External Services
- Stripe Connect (payments)
- LATE/Ayrshare (social media)
- SendGrid (email)
- AWS S3 (file storage)

### Python Microservices
- Essentia (BPM/key detection)
- pyloudnorm (LUFS measurement)
- Flask (API wrapper)

---

**Status**: All 20 tasks researched, industry best practices identified, ready for systematic implementation.

**Next Step**: Begin Phase 1 implementation starting with Task 1 (already in progress).
