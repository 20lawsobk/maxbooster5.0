## Feature: AI Music Suite

### Overview
A browser-based DAW that mirrors Studio One 7’s workflow with low-latency playback, AI-assisted mixing and mastering, and a modular plugin system. It supports real-time collaboration, autosave, and persistent project/session storage. The feature integrates WebAudio, WebAssembly-accelerated DSP, TensorFlow.js for AI inference, Next.js API routes, PostgreSQL (Drizzle ORM) for metadata, and Socket.io for collaborative state sync.

### User Stories & Requirements
- As an artist, I want to create a new project with tracks so that I can organize my session.
  - Acceptance: POST /api/projects creates a project; adding tracks positions them in the timeline with default mixer settings (volume 0dB, pan center).

- As an artist, I want to import/record audio clips so that I can arrange stems and takes.
  - Acceptance: Upload endpoint accepts WAV/MP3; clips appear on the timeline with waveform preview; decode errors are surfaced.

- As an artist, I want low-latency transport (play/stop/loop) so that I can edit and mix in real time.
  - Acceptance: Transport controls start/stop within <30ms jitter; loop region plays seamlessly; master peak meter updates in real time.

- As an artist, I want AI mixing to auto-balance track levels, panning, and basic EQ so that I get a professional starting point.
  - Acceptance: Clicking “AI Mix” runs analysis and returns proposed gain/pan/EQ per track; user can preview and apply non-destructively; persisted in project state.

- As an artist, I want AI mastering to polish the master bus so that I can export a competitive track.
  - Acceptance: “AI Master” produces mastering chain settings (EQ, comp, limiter target LUFS) and preview; applying updates master plugin chain.

- As a collaborator, I want multi-user editing with presence so that we can work together in real time.
  - Acceptance: Multiple users in the same project see live cursor/selection updates and track edits via Socket.io; conflicts resolved last-writer-wins with server reconcile.

- As a user, I want autosave and version snapshots so that I never lose my work.
  - Acceptance: Autosave JSON every 30s and on focus loss; manual “Save Snapshot” creates a named version; recovery UI lists snapshots.

- As a user, I want a plugin rack with drag-and-drop so that I can build effects chains.
  - Acceptance: Plugin catalog lists built-in and AI plugins; dragging to a track inserts an instance; parameters persist and recall.

### Technical Implementation

#### Database Schema
Define PostgreSQL schema with Drizzle ORM. Store durable metadata and references to audio assets; audio binaries are stored in external storage or local FS with path references.

```typescript
// shared/schema.ts
import { pgTable, serial, varchar, timestamp, integer, boolean, jsonb, text, uuid, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  replitId: varchar('replit_id', { length: 128 }).notNull().unique(), // From Replit Auth
  displayName: varchar('display_name', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  name: varchar('name', { length: 256 }).notNull(),
  bpm: numeric('bpm', { precision: 6, scale: 2 }).default('120'),
  sampleRate: integer('sample_rate').default(48000),
  timeSig: varchar('time_sig', { length: 8 }).default('4/4'),
  state: jsonb('state').default({}), // serialized DAW graph for quick load
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isCollaborative: boolean('is_collaborative').default(true),
});

export const projectMembers = pgTable('project_members', {
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 32 }).default('editor'),
}, (t) => ({
  pk: { columns: [t.projectId, t.userId] }
}));

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  kind: varchar('kind', { length: 32 }).notNull(), // audio|midi|aux|master
  index: integer('index').notNull(),
  muted: boolean('muted').default(false),
  solo: boolean('solo').default(false),
  gainDb: numeric('gain_db', { precision: 6, scale: 2 }).default('0'),
  pan: numeric('pan', { precision: 5, scale: 2 }).default('0'), // -1..1
  color: varchar('color', { length: 16 }),
  meta: jsonb('meta').default({}), // arbitrary track metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clips = pgTable('clips', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackId: uuid('track_id').references(() => tracks.id).notNull(),
  assetId: uuid('asset_id').references(() => assets.id).notNull(),
  startSec: numeric('start_sec', { precision: 12, scale: 4 }).notNull(),
  durationSec: numeric('duration_sec', { precision: 12, scale: 4 }).notNull(),
  offsetSec: numeric('offset_sec', { precision: 12, scale: 4 }).default('0'), // offset into asset
  gainDb: numeric('gain_db', { precision: 6, scale: 2 }).default('0'),
  fadeInSec: numeric('fade_in_sec', { precision: 6, scale: 3 }).default('0'),
  fadeOutSec: numeric('fade_out_sec', { precision: 6, scale: 3 }).default('0'),
  meta: jsonb('meta').default({}),
});

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  kind: varchar('kind', { length: 32 }).notNull(), // audio|midi|preset
  name: varchar('name', { length: 256 }).notNull(),
  mime: varchar('mime', { length: 128 }).notNull(),
  bytes: integer('bytes').notNull(),
  storageUri: text('storage_uri').notNull(), // e.g., file:/workspace/uploads/.. or https://...
  waveformJson: jsonb('waveform_json'), // optional precomputed peaks
  createdAt: timestamp('created_at').defaultNow(),
});

export const pluginCatalog = pgTable('plugin_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 128 }).unique().notNull(), // mb-eq, mb-comp, mb-ai-mix, mb-ai-master
  name: varchar('name', { length: 256 }).notNull(),
  kind: varchar('kind', { length: 32 }).notNull(), // effect|instrument|analyzer
  version: varchar('version', { length: 32 }).default('1.0.0'),
  manifest: jsonb('manifest').notNull(), // parameters schema, ui module path
  createdAt: timestamp('created_at').defaultNow(),
});

export const pluginInstances = pgTable('plugin_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  trackId: uuid('track_id').references(() => tracks.id), // null for master bus
  catalogId: uuid('catalog_id').references(() => pluginCatalog.id).notNull(),
  index: integer('index').notNull(),
  params: jsonb('params').default({}),
  bypassed: boolean('bypassed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiJobs = pgTable('ai_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  type: varchar('type', { length: 32 }).notNull(), // mix|master
  status: varchar('status', { length: 32 }).default('queued'), // queued|running|done|error
  input: jsonb('input').notNull(), // snapshot of current state/audio features references
  output: jsonb('output'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const autosaves = pgTable('autosaves', {
  id: serial('id').primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  label: varchar('label', { length: 128 }).default('autosave'),
  state: jsonb('state').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations (optional)
export const projectsRelations = relations(projects, ({ many }) => ({
  tracks: many(tracks),
  assets: many(assets),
  plugins: many(pluginInstances),
}));
```

#### API Endpoints / Server Actions
Next.js API routes handle REST endpoints (no Server Actions). Socket.io provides real-time collaboration. Authentication uses Replit Auth; include middleware to resolve user from request headers.

```typescript
// client/src/pages/api/projects/index.ts
import { db } from '@/lib/db';
import { projects, projectMembers } from '@/../../shared/schema';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';

const createProjectSchema = z.object({
  name: z.string().min(1),
  bpm: z.number().optional(),
  sampleRate: z.number().optional(),
  timeSig: z.string().optional(),
});

export default async function handler(req, res) {
  const user = await getAuthUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const [proj] = await db.insert(projects).values({
      ownerId: user.id,
      name: parsed.data.name,
      bpm: parsed.data.bpm ?? 120,
      sampleRate: parsed.data.sampleRate ?? 48000,
      timeSig: parsed.data.timeSig ?? '4/4',
      state: {},
    }).returning();
    await db.insert(projectMembers).values({ projectId: proj.id, userId: user.id, role: 'owner' });
    return res.status(201).json(proj);
  }

  if (req.method === 'GET') {
    // list projects for user
    const list = await db.query.projects.findMany({
      where: (p, { eq }) => eq(p.ownerId, user.id),
    });
    return res.status(200).json(list);
  }

  return res.status(405).end();
}
```

```typescript
// client/src/pages/api/projects/[id].ts
import { db } from '@/lib/db';
import { projects, tracks, clips, pluginInstances, assets } from '@/../../shared/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export default async function handler(req, res) {
  const user = await getAuthUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'GET') {
    // fetch full project graph
    const proj = await db.query.projects.findFirst({ where: eq(projects.id, id as string) });
    if (!proj) return res.status(404).json({ error: 'Not Found' });
    const [tr, pl, as] = await Promise.all([
      db.query.tracks.findMany({ where: eq(tracks.projectId, proj.id) }),
      db.query.pluginInstances.findMany({ where: eq(pluginInstances.projectId, proj.id) }),
      db.query.assets.findMany({ where: eq(assets.projectId, proj.id) }),
    ]);
    return res.status(200).json({ project: proj, tracks: tr, plugins: pl, assets: as });
  }

  if (req.method === 'PATCH') {
    // update project state (e.g., state JSON)
    // validate and update...
  }

  return res.status(405).end();
}
```

```typescript
// client/src/pages/api/assets/upload.ts
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { assets } from '@/../../shared/schema';
import { getAuthUser } from '@/lib/auth';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const user = await getAuthUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const uploadDir = path.join(process.cwd(), 'workspace', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err.message });
    const file = files.file as formidable.File;
    const storageUri = `file:${file.filepath}`;
    const [asset] = await db.insert(assets).values({
      projectId: fields.projectId as string,
      ownerId: user.id,
      kind: 'audio',
      name: file.originalFilename || 'audio',
      mime: file.mimetype || 'audio/wav',
      bytes: file.size as number,
      storageUri,
    }).returning();
    return res.status(201).json(asset);
  });
}
```

```typescript
// client/src/pages/api/ai/mix.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import { db } from '@/lib/db';
import { aiJobs, tracks, projects } from '@/../../shared/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export default async function handler(req, res) {
  const user = await getAuthUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { projectId } = req.body;
  const proj = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // enqueue job; UI may run client-side TF.js inference; server stores job record
  const [job] = await db.insert(aiJobs).values({
    projectId,
    type: 'mix',
    status: 'queued',
    input: { projectId },
  }).returning();

  return res.status(202).json({ jobId: job.id, status: 'queued' });
}
```

```typescript
// client/src/pages/api/ai/master.ts
import { db } from '@/lib/db';
import { aiJobs, projects } from '@/../../shared/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export default async function handler(req, res) {
  const user = await getAuthUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { projectId } = req.body;
  const proj = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const [job] = await db.insert(aiJobs).values({
    projectId,
    type: 'master',
    status: 'queued',
    input: { projectId },
  }).returning();

  return res.status(202).json({ jobId: job.id, status: 'queued' });
}
```

```typescript
// Socket.io events (server) - client/src/pages/api/socket.ts
import { Server } from 'socket.io';

export const config = { api: { bodyParser: false } };

export default function handler(req, res) {
  if (!(res.socket as any).server.io) {
    const io = new Server((res.socket as any).server, { path: '/api/socket' });
    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      socket.on('room:join', ({ projectId }) => {
        socket.join(`project:${projectId}`);
        socket.to(`project:${projectId}`).emit('presence:join', { socketId: socket.id });
      });

      socket.on('room:leave', ({ projectId }) => {
        socket.leave(`project:${projectId}`);
        socket.to(`project:${projectId}`).emit('presence:leave', { socketId: socket.id });
      });

      socket.on('track:update', (payload) => {
        socket.to(`project:${payload.projectId}`).emit('track:update', payload);
      });

      socket.on('clip:update', (payload) => {
        socket.to(`project:${payload.projectId}`).emit('clip:update', payload);
      });

      socket.on('plugin:update', (payload) => {
        socket.to(`project:${payload.projectId}`).emit('plugin:update', payload);
      });

      socket.on('cursor:update', (payload) => {
        socket.to(`project:${payload.projectId}`).emit('cursor:update', payload);
      });

      socket.on('ai:mix:apply', (payload) => {
        socket.to(`project:${payload.projectId}`).emit('ai:mix:apply', payload);
      });

      socket.on('ai:master:apply', (payload) => {
        socket.to(`project:${payload.projectId}`).emit('ai:master:apply', payload);
      });
    });
  }
  res.end();
}
```

#### Components Structure
Key UI and audio engine components under client/src/components/ai-music-suite and supporting libs.

```
client/src/components/ai-music-suite/
├── DawWorkspace.tsx            // Main layout: tracks, timeline, mixer, right panels
├── TransportBar.tsx            // Play/stop/loop/metronome/tempo
├── TrackList.tsx               // Track headers, arm/mute/solo, drag-reorder
├── Timeline.tsx                // Ruler + clip lanes, drag/drop, selection
├── ClipItem.tsx                // Render audio clip, fades, waveform
├── MixerPanel.tsx              // Channel strips, meters, inserts, sends
├── PluginRack.tsx              // Plugin instances list with drag/drop
├── PluginParameterPanel.tsx    // Parameter editor (ShadCN controls)
├── AIPanel.tsx                 // AI Mix and Mastering UX
├── PresenceAvatars.tsx         // Real-time presence indicators
├── SnapshotsPanel.tsx          // Autosave and manual versions
└── MediaBrowser.tsx            // File upload and asset list
```

Supporting libs and workers:

```
client/src/lib/audio/
├── engine.ts                   // WebAudio graph, track nodes, scheduling
├── worklet-processor.js        // AudioWorklet DSP boilerplate
├── waveform.ts                 // Offline peak generation for waveforms
└── utils.ts

client/src/lib/ai/
├── models.ts                   // TF.js model loader/backends init (wasm/webgl)
├── mixEngine.ts                // AI mix suggestion logic
└── masterEngine.ts             // AI mastering suggestion logic

client/src/hooks/
├── useSocket.ts                // Socket.io client hook
└── useTransport.ts             // Transport state, clock

client/src/pages/studio/[projectId].tsx
```

#### State Management
- TanStack React Query for server state (projects, tracks, clips, plugins, assets, jobs).
- Local audio engine state in Context + Reducer, synchronized to React Query mutations for persistence.
- Real-time collaboration with Socket.io: optimistic updates; broadcast on change events; reconcile from server snapshots on conflicts.
- Autosave: debounced serialization of project state to PATCH /api/projects/[id] and POST /api/autosaves.

### Dependencies & Integrations
- WebAudio API + AudioWorklet for low-latency processing.
- TensorFlow.js: @tensorflow/tfjs, @tensorflow/tfjs-backend-wasm, @tensorflow/tfjs-backend-webgl for AI inference in-browser.
- Socket.io and socket.io-client for collaboration.
- Drizzle ORM, Neon Postgres (provisioned by Replit Agent) for metadata.
- Zod for request/response validation.
- formidable for uploads (or busboy).
- Optional: wavesurfer.js for waveform rendering.
- Authentication: Replit Auth (primary).
- External storage (optional): S3-compatible or Supabase Storage for large audio; otherwise local file path storageUri.

Interactions:
- Integrates with Security & Infrastructure feature for audit logs (emit audit events on mutations).
- No direct dependency on Distribution or Social features.

### Implementation Steps
1. Set up database models
   - Add tables in shared/schema.ts.
   - Configure drizzle in drizzle.config.ts; run npx drizzle-kit generate and npx drizzle-kit migrate.
2. Create API routes
   - Projects CRUD, Tracks CRUD, Clips CRUD, PluginCatalog GET, PluginInstances CRUD.
   - Upload endpoint for audio assets with formidable, storing storageUri.
   - AI endpoints to enqueue jobs and (optionally) return suggested settings.
3. Implement authentication
   - getAuthUser(req,res) using Replit Auth headers; attach user.id to DB operations.
   - Authorization checks: project ownership or membership for all CRUD.
4. Build React components
   - DawWorkspace shell, Transport, TrackList, Timeline, MixerPanel, PluginRack, AIPanel.
   - Use ShadCN UI for controls; Tailwind for layout.
   - Implement MediaBrowser for uploads and asset listing.
5. Audio engine + AI
   - Create engine.ts to build nodes per track, connect plugin chains, handle transport, loop.
   - Register AudioWorklet; fall back if unsupported.
   - Implement AI mixEngine.ts and masterEngine.ts client-side; integrate with AIPanel to preview/apply.
6. Add Socket.io events
   - Initialize /api/socket side-effect route on app mount.
   - Join room project:[id]; broadcast updates on local edits; handle incoming patches to update UI/engine.
7. Autosave and snapshots
   - Debounce serialize project graph; POST /api/autosaves; PATCH project.state for latest snapshot.
   - SnapshotsPanel lists and restores states.
8. Test collaborative features
   - Simulate two clients; verify presence, track/clip updates, and AI apply events propagate.
9. Deploy on Replit
   - Ensure environment variables for DB and storage are set via Replit Secrets.
   - Validate AudioWorklet in production build; verify CORS for storage if external.

### Edge Cases & Error Handling
- Large file uploads: enforce size limits; stream to disk; return 413 on exceed; show progress client-side.
- Unsupported audio format: detect via mime; decodeAudioData failures show actionable message.
- Sample-rate mismatch: resample in engine or warn user; prefer using OfflineAudioContext for pre-processing.
- WebAudio unavailable or blocked: prompt user to interact to resume audio context; provide fallback messaging.
- Browser limitations on AudioWorklet: fallback to ScriptProcessor (with warning on latency).
- TF.js backend fails to init (wasm/webgl): fallback to cpu backend; show “reduced performance.”
- Collaboration conflicts: last-writer-wins with periodic authoritative snapshot refresh; notify on overwrites.
- Network disconnects: queue local changes; retry with exponential backoff; reconcile upon reconnect.
- Permission errors: return 403 if user not project member; UI disables editing.
- AI job timeout/error: set ai_jobs.status=error with message; UI displays retry.

### Testing Approach
- Unit tests
  - ai/mixEngine: given synthetic features, output deterministic gain/pan/EQ suggestions.
  - ai/masterEngine: target LUFS calculation and limiter threshold suggestion logic.
  - audio/waveform: peak generation correctness for various buffer lengths.
  - reducers/selectors for timeline edits.

- Integration tests
  - API: projects CRUD, tracks/clip mutations, plugin instance persistence, upload success/failure, autosave.
  - Socket: joining rooms, receiving updates, reconnection behavior.

- User acceptance tests
  - Create project, add tracks, upload audio, arrange clips, play/loop with low latency.
  - Run AI Mix: preview vs apply; undo/redo works; settings persisted.
  - Run AI Master: audible level/tonal changes; bypass toggles.
  - Two users editing same project: both see real-time updates; no catastrophic conflicts.
  - Autosave and restore a prior snapshot successfully.

```javascript
// Example: /models/AiMixEngine.ts (client/src/lib/ai/mixEngine.ts)
import * as tf from '@tensorflow/tfjs';

export type MixSuggestion = { trackId: string; gainDb: number; pan: number; eq?: { freq: number; gainDb: number; q: number }[] };
export async function suggestMix(features: { trackId: string; rms: number; spectralCentroid: number; crest: number }[]): Promise<MixSuggestion[]> {
  // Placeholder heuristic + TF model hook
  // const model = await tf.loadLayersModel('/models/mb_mix/model.json');
  // const input = tf.tensor(features.map(f => [f.rms, f.spectralCentroid, f.crest]));
  // const pred = model.predict(input) as tf.Tensor;
  // ...
  return features.map((f, i) => ({
    trackId: f.trackId,
    gainDb: Math.max(-12, Math.min(6, -20 * Math.log10(f.rms + 1e-6))), // normalize
    pan: (i % 2 === 0 ? -0.2 : 0.2), // simple spread
    eq: [{ freq: 200, gainDb: f.spectralCentroid > 2000 ? -2 : 2, q: 1.0 }],
  }));
}
```

```javascript
// Example: /routes/feature.js (Express alternative if separate server is used)
// Not required with Next.js API routes, included for reference
router.post('/api/ai/mix', async (req, res) => {
  // Forward to the same controller logic used in Next.js API route
});
```

```tsx
// client/src/components/ai-music-suite/AIPanel.tsx
import { useMutation } from '@tanstack/react-query';
import { suggestMix } from '@/lib/ai/mixEngine';
import { useSocket } from '@/hooks/useSocket';

export function AIPanel({ project }) {
  const socket = useSocket(project.id);
  const mixMutation = useMutation({
    mutationFn: async () => {
      // Collect features from engine or precomputed analysis
      const features = project.tracks.map(t => ({ trackId: t.id, rms: Math.random()*0.2+0.05, spectralCentroid: 1500, crest: 10 }));
      const suggestions = await suggestMix(features);
      return suggestions;
    },
    onSuccess: (suggestions) => {
      socket.emit('ai:mix:apply', { projectId: project.id, suggestions });
      // apply locally and persist via API
    }
  });

  return (
    <div className="p-4 space-y-3">
      <button className="btn btn-primary" onClick={() => mixMutation.mutate()} disabled={mixMutation.isLoading}>
        {mixMutation.isLoading ? 'Analyzing…' : 'AI Mix'}
      </button>
      <button className="btn" /* AI Master hook */>AI Master</button>
    </div>
  );
}
```