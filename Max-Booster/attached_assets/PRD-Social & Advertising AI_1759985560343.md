## Feature: Social & Advertising AI

### Overview
A unified social media management and advertising creation module that:
- Connects user social accounts via OAuth
- Generates platform-specific organic ad/marketing content via in-house AI (OpenAI-compatible endpoint)
- Schedules automated multi-platform posting
- Runs self-optimizing A/B tests via a reinforcement-learning bandit to maximize reach without paid spend
- Streams real-time analytics for campaigns and variants

This feature eliminates dependence on native ad spend by optimizing organic reach using data-driven content, timing, and variant selection.

### User Stories & Requirements
- As an authenticated user, I can connect my social accounts (Facebook Pages/Instagram, X/Twitter, YouTube, TikTok) via OAuth so the app can post on my behalf.
  - Acceptance: I can see connected accounts with platform, handle, and token status; I can disconnect; refresh flow handles token expiry.

- As a user, I can create a campaign by providing a prompt, target platforms, goals (reach, engagement, CTR), and constraints (brand voice, length, media).
  - Acceptance: AI generates at least 2 variants per platform with platform-specific formatting and media recommendations.

- As a user, I can schedule posts across platforms (one-off times or a cadence) and choose A/B test parameters (variants per platform).
  - Acceptance: Scheduled posts display in a calendar; conflicts/timezones handled; ability to pause/resume.

- As a user, I can view real-time analytics (impressions, likes, shares, comments, clicks) for campaigns and their variants.
  - Acceptance: Dashboard updates live without refresh; data can be filtered by date, platform, and campaign.

- As a user, I want the system to automatically optimize which variant to post next using performance data (no paid spend).
  - Acceptance: The optimizer selects variants based on prior performance; I can see the rationale and current exploration vs. exploitation ratio.

- As a user, I can manually override any automated decision (variant selection, schedule).
  - Acceptance: Manual override disables auto-selection for that posting slot; changes are auditable.

- As a user, I can export a performance report (CSV) for a campaign.
  - Acceptance: Download includes per-platform, per-variant metrics and summary KPIs.

### Technical Implementation

#### Database Schema
Define PostgreSQL schema with Drizzle ORM (TypeScript):

```typescript
// shared/schema.ts
import { pgTable, uuid, varchar, timestamp, jsonb, integer, boolean, text, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  replitId: varchar("replit_id", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialProviders = pgTable("social_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 32 }).notNull(), // "facebook", "instagram", "x", "youtube", "tiktok"
  name: varchar("name", { length: 64 }).notNull(),
}, (t) => ({
  providerKeyIdx: index("social_providers_key_idx").on(t.key),
}));

export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => socialProviders.id),
  externalId: varchar("external_id", { length: 256 }).notNull(), // page/channel/account id
  handle: varchar("handle", { length: 256 }).notNull(),
  displayName: varchar("display_name", { length: 256 }),
  scopes: text("scopes"),
  accessTokenEnc: text("access_token_enc").notNull(),
  refreshTokenEnc: text("refresh_token_enc"),
  tokenExpiresAt: timestamp("token_expires_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("social_accounts_user_idx").on(t.userId),
  extIdx: index("social_accounts_ext_idx").on(t.externalId),
}));

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  prompt: text("prompt").notNull(),
  brandConstraints: jsonb("brand_constraints").$type<{ tone?: string; bannedWords?: string[]; length?: string }>(),
  objectives: jsonb("objectives").$type<{ goal: "reach" | "engagement" | "ctr"; kpis?: string[] }>(),
  platforms: jsonb("platforms").$type<string[]>().notNull(), // ["facebook","instagram","x","youtube","tiktok"]
  status: varchar("status", { length: 32 }).notNull().default("draft"), // draft|active|paused|completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => sql`now()`),
});

export const variants = pgTable("variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 32 }).notNull(),
  title: varchar("title", { length: 256 }),
  body: text("body").notNull(),
  media: jsonb("media").$type<{ urls?: string[]; type?: "image"|"video"|"audio" }>(),
  aiMeta: jsonb("ai_meta").$type<{ temperature?: number; model?: string; prompt?: string }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  campaignIdx: index("variants_campaign_idx").on(t.campaignId),
  platformIdx: index("variants_platform_idx").on(t.platform),
}));

export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 32 }).notNull(),
  socialAccountId: uuid("social_account_id").notNull().references(() => socialAccounts.id, { onDelete: "cascade" }),
  // either a fixed time or a cadence rule
  scheduledAt: timestamp("scheduled_at"),
  cadenceCron: varchar("cadence_cron", { length: 64 }), // e.g. "0 14 * * 1,3,5"
  timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
  enabled: boolean("enabled").notNull().default(true),
  useOptimizer: boolean("use_optimizer").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  platform: varchar("platform", { length: 32 }).notNull(),
  socialAccountId: uuid("social_account_id").notNull().references(() => socialAccounts.id),
  variantId: uuid("variant_id").references(() => variants.id),
  status: varchar("status", { length: 32 }).notNull().default("scheduled"), // scheduled|publishing|published|failed
  externalPostId: varchar("external_post_id", { length: 256 }),
  error: text("error"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  campaignIdx: index("posts_campaign_idx").on(t.campaignId),
  statusIdx: index("posts_status_idx").on(t.status),
}));

export const metrics = pgTable("metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => variants.id),
  platform: varchar("platform", { length: 32 }).notNull(),
  metricAt: timestamp("metric_at").defaultNow().notNull(),
  impressions: integer("impressions").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
}, (t) => ({
  timeIdx: index("metrics_time_idx").on(t.metricAt),
  campaignIdx: index("metrics_campaign_idx").on(t.campaignId),
}));

export const optimizerState = pgTable("optimizer_state", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 32 }).notNull(),
  // per-variant historical stats to support bandit selection
  state: jsonb("state").$type<{
    variants: Record<string, { impressions: number; clicks: number; engagements: number; trials: number; reward: number }>;
    algorithm: "ucb1" | "thompson";
    lastUpdated: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => sql`now()`),
}, (t) => ({
  uniq: index("optimizer_campaign_platform_idx").on(t.campaignId, t.platform),
}));
```

Secrets and tokens must be encrypted before storage. Use AES-256-GCM with a per-environment key:
- ENV: OAUTH_CRYPTO_KEY (32-byte base64)

Encryption helper:

```typescript
// server/utils/crypto.ts
import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.OAUTH_CRYPTO_KEY!, "base64");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(b64: string) {
  const raw = Buffer.from(b64, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
```

#### API Endpoints / Server Actions
Next.js REST API routes (no server actions). Paths under client/src/pages/api.

OAuth flows:
```typescript
// client/src/pages/api/oauth/[provider]/start.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "../../../lib/auth";
import { createOAuthState, getAuthUrl } from "../../../../server/utils/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const { provider } = req.query as { provider: string };
  const state = await createOAuthState(user.id, provider); // stored in Replit DB
  const url = getAuthUrl(provider, state);
  res.status(200).json({ url });
}

// client/src/pages/api/oauth/[provider]/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { exchangeCodeForToken, upsertSocialAccount } from "../../../../server/utils/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, state, code } = req.query as any;
  try {
    const tokenResp = await exchangeCodeForToken(provider, code, state);
    const account = await upsertSocialAccount(provider, tokenResp);
    res.status(200).json({ connected: true, account });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
```

Campaigns and Variants:
```typescript
// client/src/pages/api/campaigns/index.ts
import { z } from "zod"; import { db } from "../../../../drizzle/db"; import { campaigns, variants } from "../../../../shared/schema";
import type { NextApiRequest, NextApiResponse } from "next"; import { eq } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
const createSchema = z.object({
  name: z.string().min(1),
  prompt: z.string().min(1),
  brandConstraints: z.any().optional(),
  objectives: z.object({ goal: z.enum(["reach","engagement","ctr"]) }),
  platforms: z.array(z.string().min(1)),
  variantsPerPlatform: z.number().min(1).max(5).default(2),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res); if (!user) return res.status(401).end();
  if (req.method === "GET") {
    const rows = await db.select().from(campaigns).where(eq(campaigns.userId, user.id));
    return res.json(rows);
  }
  if (req.method === "POST") {
    const body = createSchema.parse(req.body);
    const [c] = await db.insert(campaigns).values({ userId: user.id, ...body, status: "draft" }).returning();
    // kick off AI generation per platform
    // enqueue background generation job
    return res.status(201).json(c);
  }
  res.setHeader("Allow", "GET, POST"); res.status(405).end();
}
```

AI content generation (OpenAI-compatible local endpoint):
```typescript
// server/utils/ai.ts
export async function generateVariants({ prompt, platform, brand }: { prompt: string; platform: string; brand?: any }) {
  const body = {
    model: process.env.AI_MODEL || "local-llm",
    temperature: 0.7,
    messages: [
      { role: "system", content: `You are an expert ${platform} copywriter. Obey platform rules.` },
      { role: "user", content: JSON.stringify({ prompt, brand }) },
    ],
  };
  const resp = await fetch(`${process.env.AI_BASE_URL}/v1/chat/completions`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error("AI generation failed");
  const data = await resp.json();
  // map to { title, body, media }
  return parseVariantsFromAI(data);
}
```

Scheduling and publishing:
```typescript
// client/src/pages/api/scheduler/tick.ts
// Called every minute by an internal interval or external ping
import type { NextApiRequest, NextApiResponse } from "next";
import { withAdvisoryLock } from "../../../../server/utils/locks";
import { findDuePosts, publishPost } from "../../../../server/utils/publisher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await withAdvisoryLock(42, async () => {
    const due = await findDuePosts();
    for (const post of due) await publishPost(post);
  });
  res.json({ ok: true });
}
```

Analytics ingestion and realtime:
```typescript
// client/src/pages/api/analytics/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../..//drizzle/db"; import { metrics } from "../../../../shared/schema";
import { io } from "../../../../server/utils/socket";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // called by polling workers or provider webhooks
  const payloads = Array.isArray(req.body) ? req.body : [req.body];
  // validate...
  // insert metrics...
  // broadcast
  payloads.forEach((m) => io().to(`campaign:${m.campaignId}`).emit("campaign:metrics", m));
  res.json({ ingested: payloads.length });
}
```

Socket.io events
```typescript
// server/utils/socket.ts
import { Server } from "socket.io";
let _io: Server | null = null;

export function initIO(httpServer: any) {
  _io = new Server(httpServer, { path: "/api/socket" });
  _io.on("connection", (socket) => {
    socket.on("campaign:subscribe", ({ campaignId }) => socket.join(`campaign:${campaignId}`));
    socket.on("campaign:unsubscribe", ({ campaignId }) => socket.leave(`campaign:${campaignId}`));
  });
  return _io;
}
export function io() { if (!_io) throw new Error("Socket.io not initialized"); return _io; }
```

Reinforcement learning (multi-armed bandit):
```typescript
// server/utils/optimizer.ts
import { db } from "../../drizzle/db"; import { optimizerState, metrics, variants } from "../../shared/schema";
import { sql, eq } from "drizzle-orm";

export async function selectVariantForNextPost(campaignId: string, platform: string) {
  const [state] = await db.select().from(optimizerState).where(eq(optimizerState.campaignId, campaignId));
  // fallback: uniform random among platform variants
  const vs = await db.select().from(variants).where(sql`${variants.campaignId}=${campaignId} AND ${variants.platform}=${platform}`);
  const vIds = vs.map(v => v.id);
  if (!state) return vIds[Math.floor(Math.random() * vIds.length)];
  const s = state.state;
  // UCB1
  const totalTrials = Object.values(s.variants).reduce((a, v) => a + (v.trials || 0), 0) || 1;
  let best = vIds[0], bestScore = -Infinity;
  for (const id of vIds) {
    const v = s.variants[id] || { trials: 0, reward: 0 };
    const mean = v.reward / Math.max(1, v.trials);
    const bonus = Math.sqrt((2 * Math.log(totalTrials)) / Math.max(1, v.trials));
    const score = mean + bonus;
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return best;
}

export async function updateOptimizerFromMetrics(campaignId: string, platform: string) {
  // compute reward = weighted engagements or clicks / impressions
  // update optimizer_state.state with aggregated values
}
```

Express-style mapping (for reference):
```javascript
// Conceptual mapping if using Express in server/routes (not required for Next.js):
router.get('/api/campaigns', auth, listCampaigns);
router.post('/api/campaigns', auth, createCampaign);
router.post('/api/oauth/:provider/start', auth, startOAuth);
router.get('/api/oauth/:provider/callback', auth, callbackOAuth);
router.post('/api/analytics/ingest', ingestMetrics);
router.post('/api/scheduler/tick', tickScheduler);
```

#### Components Structure
```
client/src/components/social-ai/
├── connect-accounts/
│   ├── provider-button.tsx
│   └── accounts-list.tsx
├── campaign-builder/
│   ├── campaign-form.tsx
│   ├── platform-selector.tsx
│   └── constraints-form.tsx
├── variants/
│   ├── variants-grid.tsx
│   └── variant-card.tsx
├── scheduler/
│   ├── schedule-calendar.tsx
│   └── schedule-form.tsx
├── analytics/
│   ├── campaign-dashboard.tsx
│   ├── kpi-cards.tsx
│   └── realtime-chart.tsx
└── optimizer/
    └── optimizer-panel.tsx
```

Pages (Next.js):
```
client/src/pages/social/connect.tsx
client/src/pages/social/campaigns/index.tsx
client/src/pages/social/campaigns/[id].tsx
```

#### State Management
- TanStack React Query for data fetching/mutations: campaigns, variants, schedules, metrics
- Socket.io client for real-time updates; subscribe to campaign room on page mount; update React Query caches on socket events
- Local UI state with React useState/useReducer for form inputs
- Zod for schema validation and type inference

### Dependencies & Integrations
- Core:
  - drizzle-orm, pg, @neondatabase/serverless (PostgreSQL)
  - zod
  - socket.io, socket.io-client
  - jsonwebtoken (if needed for signed webhooks)
- OAuth providers:
  - node-fetch (built-in fetch is fine), specific REST SDKs if available or direct HTTP
  - Replit Database (@replit/database) for ephemeral OAuth state/nonce storage
- AI:
  - OpenAI-compatible endpoint via AI_BASE_URL, AI_API_KEY
- Time & Scheduling:
  - cron parsing: cron-parser or later. For simplicity, store cron string and compute next runs manually.

Interactions with other features:
- Security & Infrastructure: audit logs for OAuth connect/disconnect, post publishing, optimizer decisions
- Marketplace/Distribution: none directly
- AI Music Suite: can post promotional content generated from AI Music assets (future integration via content_assets table)

Environment variables (Replit Secrets):
- DATABASE_URL (Neon Postgres)
- OAUTH_CRYPTO_KEY (32-byte base64)
- AI_BASE_URL, AI_API_KEY
- OAUTH_FACEBOOK_CLIENT_ID, OAUTH_FACEBOOK_CLIENT_SECRET, OAUTH_FACEBOOK_REDIRECT_URI
- OAUTH_X_CLIENT_ID, OAUTH_X_CLIENT_SECRET, OAUTH_X_REDIRECT_URI
- OAUTH_YOUTUBE_CLIENT_ID, OAUTH_YOUTUBE_CLIENT_SECRET, OAUTH_YOUTUBE_REDIRECT_URI
- OAUTH_TIKTOK_CLIENT_ID, OAUTH_TIKTOK_CLIENT_SECRET, OAUTH_TIKTOK_REDIRECT_URI

### Implementation Steps
1. Set up database models
   - Add tables in shared/schema.ts
   - Generate and run Drizzle migrations in drizzle/
   - Seed socialProviders with supported providers

2. Create API routes
   - OAuth: /api/oauth/[provider]/start, /api/oauth/[provider]/callback
   - Campaigns: /api/campaigns (GET, POST), /api/campaigns/[id] (GET, PATCH, DELETE)
   - Variants: /api/campaigns/[id]/variants (POST generate via AI)
   - Schedules: /api/schedules (CRUD)
   - Posts: /api/posts (GET), /api/posts/publish (POST for manual publish)
   - Scheduler tick: /api/scheduler/tick (internal)
   - Analytics: /api/analytics/ingest (POST), /api/analytics/summary (GET)

3. Implement authentication
   - Use Replit Auth for app login (getSessionUser)
   - Protect all API routes
   - Encrypt/decrypt provider tokens with crypto.ts
   - Store OAuth state nonces in Replit DB with TTL

4. Build React components
   - Connect Accounts page and components
   - Campaign Builder form with platform selection and constraints
   - Variants grid with edit/regenerate actions
   - Scheduler calendar with timezone support
   - Analytics dashboard with real-time chart and KPI cards
   - Optimizer panel displaying strategy and current weights

5. Add Socket.io events
   - Initialize server-side Socket.io (server entrypoint)
   - Client: subscribe to campaign rooms; update metrics in UI
   - Emit events on publish and metric ingestion

6. Implement optimizer
   - UCB1 for variant selection per campaign/platform
   - Update optimizer state on metric ingestion
   - Respect useOptimizer flag; allow manual override

7. Scheduler and publisher
   - Background interval: create a small node interval in server bootstrap to call /api/scheduler/tick every minute
   - Use Postgres advisory locks to ensure single worker
   - Implement provider-specific publishing adapters (FB/IG, X, YouTube, TikTok)

8. Test collaborative features
   - Multiple users editing campaigns: enforce user scoping in queries
   - Realtime metrics updates with Socket.io

9. Deploy on Replit
   - Ensure .replit and replit.md include process boot and Socket.io init
   - Set Replit Secrets
   - Verify production DB and OAuth redirect URIs

### Edge Cases & Error Handling
- OAuth token expiry/refresh failure: queue token refresh; on failure mark account as action_required
- Provider rate limits: exponential backoff, jitter; persist retry-after; circuit-breaker per provider
- Platform constraints:
  - X character limit, YouTube requires titles/description, TikTok video media; validate before publish
  - Media size/format mismatches; preflight validation and clear user errors
- Timezones and DST: compute next run using timezone; store UTC in DB
- Duplicate posts: idempotency key per (campaignId, scheduledAt, platform); unique constraint to avoid duplicates
- Content moderation flags: capture provider error codes; surface to user with guidance
- Webhook verification: verify signatures where supported (e.g., X, Meta); reject invalid
- Partial platform failures: publish per platform; aggregate errors per post
- Optimizer cold start: ensure minimum exploration; fallback to round-robin when insufficient data
- Multi-session editing: last-write-wins with updatedAt; optimistic UI in React Query

### Testing Approach
- Unit tests
  - crypto.ts encryption/decryption roundtrip
  - optimizer.ts UCB1 selection behavior with mock states
  - ai.ts prompt assembly and parsing
  - publisher adapters: input validation and payload shaping

- Integration tests
  - API routes: campaigns CRUD, variants generation mock (mock AI endpoint)
  - OAuth callback: mock token exchange, token storage encryption
  - Scheduler tick: create due posts, simulate publish with mocked provider APIs
  - Analytics ingestion: insert metrics and verify optimizer state update and socket emission

- Socket tests
  - Server broadcasts to campaign room on metric ingestion
  - Client updates React Query cache upon campaign:metrics

- User acceptance tests
  - Connect account -> create campaign -> generate variants -> schedule -> auto-publish -> see real-time analytics
  - Manual override of variant selection and schedule
  - Export CSV with accurate aggregation

- Performance/Resilience
  - High-frequency scheduler tick under load (1000 due posts)
  - Rate limit handling and retry behavior correctness

Notes
- OAuth Implementations: start with X/Twitter and YouTube (simpler posting), add Meta (FB/IG) and TikTok subsequently.
- Use Replit Database for ephemeral OAuth state/nonce and short-lived rate-limit counters; never store tokens there.
- All external calls via server-side API routes only; no server actions.