## Feature: Distribution & Marketplace

### Overview
Enables artists to:
- Distribute releases to external DSPs (e.g., Spotify/Apple Music) via a provider-agnostic automation layer.
- List and sell beats/licenses in a BeatStars-like marketplace with secure checkout.
- Automate royalties and peer-to-peer payments using Stripe Connect, with real-time tracking and analytics.

This feature integrates Stripe Connect for split payouts, a marketplace for listings and orders, a distribution pipeline to partner DSPs, and a royalty ledger with live updates.

### User Stories & Requirements
- As an artist, I want to onboard to Stripe Connect so I can receive royalties and sales payouts.
  - Acceptance:
    - When I click “Enable Payouts,” I am redirected to a Stripe Connect onboarding flow.
    - After completion, my dashboard shows “Payouts Enabled.”
    - If onboarding is incomplete, checkout involving my listings is blocked with a clear message.

- As an artist, I want to create a beat listing with pricing and license types so buyers can purchase my beats.
  - Acceptance:
    - I can create a listing with title, price, license type (exclusive/non-exclusive), preview audio, and cover image.
    - Exclusive listings become unavailable after they are sold once.
    - Non-exclusive listings remain available indefinitely unless unpublished.

- As a buyer, I want to securely purchase a beat and immediately get access to download and a license certificate.
  - Acceptance:
    - Checkout is processed via Stripe.
    - On payment success, I receive a download link and license document.
    - I can see the order in my Orders page and get email confirmation (placeholder if email service is not yet integrated).

- As an artist/producer team, we want to define revenue splits so payouts are automatically distributed.
  - Acceptance:
    - I can add collaborators and their percentage splits for a listing.
    - Sum of splits must equal 100% (or system-enforced platform fee + splits sum = 100%).
    - After a successful purchase, each collaborator’s Stripe balance updates in near real time or a pending payout is recorded if not onboarded.

- As an artist, I want to submit a release for global distribution and track its status across providers.
  - Acceptance:
    - I can create a release, upload tracks, set metadata, and choose providers.
    - Submissions validate required fields (ISRC/UPC, cover art size, audio format).
    - Status transitions from Queued → Submitted → Processing → Live (or Failed) per provider.
    - Errors are displayed with actionable guidance.

- As a user, I want real-time updates for orders, payouts, and distribution statuses.
  - Acceptance:
    - Socket updates notify of payment success, payout events, and distribution status changes without refreshing.

- As an admin, I want payout analytics to track gross sales, platform fees, net payouts, and royalty distributions.
  - Acceptance:
    - Analytics endpoint returns aggregate metrics by date range, user, listing, and release.
    - Data matches Stripe balances and internal ledger.

### Technical Implementation

#### Database Schema
Drizzle ORM with PostgreSQL (Neon). Place in shared/schema.ts and generate migrations in drizzle/.

```typescript
// shared/schema.ts
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, numeric, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const currencyEnum = pgEnum('currency_enum', ['usd']);
export const orderStatusEnum = pgEnum('order_status_enum', ['pending', 'paid', 'failed', 'refunded']);
export const payoutStatusEnum = pgEnum('payout_status_enum', ['initiated', 'paid', 'failed']);
export const payoutTypeEnum = pgEnum('payout_type_enum', ['sale_split', 'distro_royalty']);
export const licenseTypeEnum = pgEnum('license_type_enum', ['exclusive', 'non_exclusive']);
export const dispatchStatusEnum = pgEnum('dispatch_status_enum', ['queued', 'submitted', 'processing', 'live', 'failed']);
export const webhookProviderEnum = pgEnum('webhook_provider_enum', ['stripe', 'dsp']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  handle: varchar('handle', { length: 64 }).notNull().unique(),
  role: varchar('role', { length: 32 }).notNull().default('artist'),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  stripeOnboarded: boolean('stripe_onboarded').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const artistProfiles = pgTable('artist_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 128 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
});

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  currency: currencyEnum('currency').notNull().default('usd'),
  licenseType: licenseTypeEnum('license_type').notNull(),
  exclusiveStock: integer('exclusive_stock').notNull().default(1), // only used for exclusive
  previewUrl: text('preview_url'),
  downloadUrl: text('download_url'), // secured link to asset bundle
  coverArtUrl: text('cover_art_url'),
  isPublished: boolean('is_published').notNull().default(false),
  tags: jsonb('tags').$type<string[]>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const royaltySplits = pgTable('royalty_splits', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  recipientId: uuid('recipient_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(), // 0-100
  kind: varchar('kind', { length: 32 }).notNull().default('sale'), // extensible
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'set null' }),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'set null' }),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),
  licenseType: licenseTypeEnum('order_license_type').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: currencyEnum('order_currency').notNull().default('usd'),
  status: orderStatusEnum('status').notNull().default('pending'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeChargeId: varchar('stripe_charge_id', { length: 255 }),
  licenseDocumentUrl: text('license_document_url'),
  downloadUrl: text('deliverable_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const payoutEvents = pgTable('payout_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  amountCents: integer('amount_cents').notNull(),
  currency: currencyEnum('currency').notNull().default('usd'),
  type: payoutTypeEnum('type').notNull(),
  stripeTransferId: varchar('stripe_transfer_id', { length: 255 }),
  status: payoutStatusEnum('status').notNull().default('initiated'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const distroReleases = pgTable('distro_releases', {
  id: uuid('id').primaryKey().defaultRandom(),
  artistId: uuid('artist_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  upc: varchar('upc', { length: 32 }),
  releaseDate: timestamp('release_date', { withTimezone: true }),
  coverArtUrl: text('cover_art_url'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const distroTracks = pgTable('distro_tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  releaseId: uuid('release_id').references(() => distroReleases.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  isrc: varchar('isrc', { length: 32 }),
  audioUrl: text('audio_url'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  trackNumber: integer('track_number'),
});

export const distroProviders = pgTable('distro_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 64 }).notNull(),
  apiBase: text('api_base'),
  status: varchar('status', { length: 32 }).notNull().default('active'),
  // credentials and secrets are env-managed; do not store secrets here
});

export const distroDispatch = pgTable('distro_dispatch', {
  id: uuid('id').primaryKey().defaultRandom(),
  releaseId: uuid('release_id').references(() => distroReleases.id, { onDelete: 'cascade' }).notNull(),
  providerId: uuid('provider_id').references(() => distroProviders.id, { onDelete: 'cascade' }).notNull(),
  status: dispatchStatusEnum('status').notNull().default('queued'),
  externalId: varchar('external_id', { length: 255 }),
  logs: text('logs'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: webhookProviderEnum('provider').notNull(),
  eventType: varchar('event_type', { length: 128 }).notNull(),
  raw: jsonb('raw').notNull(),
  processed: boolean('processed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const platformSettings = pgTable('platform_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformFeePercent: numeric('platform_fee_percent', { precision: 5, scale: 2 }).notNull().default('10.00'),
  currency: currencyEnum('currency').notNull().default('usd'),
});

// Useful constraints (add via SQL in migrations)
// - Ensure sum(royalty_splits.percentage) = 100 for a listing
// - Exclusive stock cannot drop below zero
```

#### API Endpoints / Server Actions
Use Next.js API routes (no Server Actions). Replit Auth (session) enforced via middleware; add Zod validation.

```typescript
// client/src/pages/api/stripe/connect/create-account.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/lib/db'; // drizzle instance
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth'; // Replit Auth helper

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Create or reuse Connected Account
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
  let accountId = dbUser?.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' });
    accountId = account.id;
    await db.update(users).set({ stripeAccountId: accountId }).where(eq(users.id, user.id));
  }

  const origin = req.headers.origin ?? process.env.APP_URL!;
  const link = await stripe.accountLinks.create({
    account: accountId!,
    refresh_url: `${origin}/payments/onboarding?refresh=true`,
    return_url: `${origin}/payments/onboarding?return=true`,
    type: 'account_onboarding',
  });

  return res.status(200).json({ url: link.url, accountId });
}
```

```typescript
// client/src/pages/api/stripe/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '@/lib/db';
import { webhookEvents, orders, payoutEvents, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Persist raw event
  await db.insert(webhookEvents).values({
    provider: 'stripe',
    eventType: event.type,
    raw: event as any,
  });

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await db.update(orders).set({ status: 'paid', stripePaymentIntentId: pi.id }).where(eq(orders.id, orderId));
        // Socket: notify order status
        // enqueue license delivery and payouts finalization if needed
      }
      break;
    }
    case 'account.updated': {
      // Detect details_submitted to mark onboarded
      const acct = event.data.object as Stripe.Account;
      const [user] = await db.select().from(users).where(eq(users.stripeAccountId, acct.id));
      if (user) {
        await db.update(users).set({ stripeOnboarded: !!acct.details_submitted }).where(eq(users.id, user.id));
      }
      break;
    }
    case 'transfer.paid': {
      const transfer = event.data.object as Stripe.Transfer;
      // Update payoutEvents by stripeTransferId -> status = paid
      await db.update(payoutEvents).set({ status: 'paid' }).where(eq(payoutEvents.stripeTransferId, transfer.id));
      break;
    }
    default:
      break;
  }

  return res.json({ received: true });
}
```

```typescript
// client/src/pages/api/marketplace/listings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { db } from '@/lib/db';
import { listings, royaltySplits } from '@/shared/schema';
import { and, eq, like } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth';
import { ioEmit } from '@/lib/realtime'; // Socket.io server emitter

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priceCents: z.number().int().positive(),
  licenseType: z.enum(['exclusive', 'non_exclusive']),
  previewUrl: z.string().url().optional(),
  downloadUrl: z.string().url().optional(),
  coverArtUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  splits: z.array(z.object({ recipientId: z.string().uuid(), percentage: z.number().min(0).max(100) })).min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const user = await getSessionUser(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { splits, ...data } = parsed.data;

    // Enforce sum of splits = 100
    const sum = splits.reduce((s, r) => s + r.percentage, 0);
    if (Math.round(sum * 100) !== 10000) return res.status(400).json({ error: 'Splits must sum to 100%' });

    const [created] = await db.insert(listings).values({
      ...data,
      ownerId: user.id,
      isPublished: true,
      exclusiveStock: data.licenseType === 'exclusive' ? 1 : 0,
    }).returning();

    await db.insert(royaltySplits).values(
      splits.map(s => ({ listingId: created.id, recipientId: s.recipientId, percentage: s.percentage.toString(), kind: 'sale' }))
    );

    ioEmit('marketplace:listings:updated', { listingId: created.id, action: 'created' });
    return res.status(201).json(created);
  }

  if (req.method === 'GET') {
    const { q } = req.query;
    const rows = await db.select().from(listings)
      .where(and(eq(listings.isPublished, true), q ? like(listings.title, `%${q}%`) : undefined as any))
      .orderBy(listings.createdAt);
    return res.status(200).json(rows);
  }

  return res.status(405).end();
}
```

```typescript
// client/src/pages/api/marketplace/checkout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { z } from 'zod';
import { db } from '@/lib/db';
import { listings, orders, users, royaltySplits, platformSettings } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const schema = z.object({
  listingId: z.string().uuid(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [setting] = await db.select().from(platformSettings).limit(1);
  const [l] = await db.select().from(listings).where(eq(listings.id, parsed.data.listingId));
  if (!l || !l.isPublished) return res.status(404).json({ error: 'Listing not found' });

  // For exclusive, ensure stock is available (lock row in a transaction in real implementation)
  if (l.licenseType === 'exclusive' && l.exclusiveStock <= 0) {
    return res.status(409).json({ error: 'Exclusive license already sold' });
  }

  const [seller] = await db.select().from(users).where(eq(users.id, l.ownerId));
  if (!seller?.stripeAccountId || !seller.stripeOnboarded) {
    return res.status(400).json({ error: 'Seller payouts not enabled yet' });
  }

  const [order] = await db.insert(orders).values({
    buyerId: user.id, sellerId: l.ownerId, listingId: l.id,
    licenseType: l.licenseType, amountCents: l.priceCents, currency: l.currency,
  }).returning();

  // Calculate application fee and split transfers
  const platformFeePercent = Number(setting?.platformFeePercent ?? '10.00');
  const appFee = Math.floor((l.priceCents * platformFeePercent) / 100);

  // Build transfer group metadata; we will split after payment succeeded via transfers or use destination charge with on_behalf_of
  const paymentIntent = await stripe.paymentIntents.create({
    amount: l.priceCents,
    currency: l.currency,
    payment_method_types: ['card'],
    metadata: { orderId: order.id },
    application_fee_amount: appFee,
    transfer_data: { destination: seller.stripeAccountId! }, // destination charge
  });

  await db.update(orders).set({ stripePaymentIntentId: paymentIntent.id }).where(eq(orders.id, order.id));
  return res.status(200).json({ clientSecret: paymentIntent.client_secret, orderId: order.id });
}
```

```typescript
// client/src/pages/api/distribution/releases/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { db } from '@/lib/db';
import { distroReleases, distroTracks, distroDispatch, distroProviders } from '@/shared/schema';
import { getSessionUser } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';
import { ioEmit } from '@/lib/realtime';

const releaseSchema = z.object({
  title: z.string().min(2),
  upc: z.string().optional(),
  releaseDate: z.string().datetime().optional(),
  coverArtUrl: z.string().url(),
  tracks: z.array(z.object({
    title: z.string().min(1),
    isrc: z.string().optional(),
    audioUrl: z.string().url(),
    trackNumber: z.number().int().positive().optional(),
    metadata: z.record(z.any()).optional(),
  })).min(1),
  providerIds: z.array(z.string().uuid()).min(1),
  metadata: z.record(z.any()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const parsed = releaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    // TODO: add metadata validation rules (e.g., cover art 3000x3000, WAV/FLAC formats)
    const { tracks, providerIds, ...r } = parsed.data;

    const [created] = await db.insert(distroReleases).values({
      ...r,
      artistId: user.id,
      releaseDate: r.releaseDate ? new Date(r.releaseDate) : null,
    }).returning();

    await db.insert(distroTracks).values(
      tracks.map((t, i) => ({
        releaseId: created.id,
        title: t.title,
        isrc: t.isrc ?? null,
        audioUrl: t.audioUrl,
        trackNumber: t.trackNumber ?? i + 1,
        metadata: t.metadata ?? {},
      }))
    );

    // Queue dispatch rows
    const providers = await db.select().from(distroProviders).where(inArray(distroProviders.id, providerIds));
    await db.insert(distroDispatch).values(
      providers.map(p => ({ releaseId: created.id, providerId: p.id, status: 'queued' }))
    );

    ioEmit('distribution:release:update', { releaseId: created.id, status: 'queued' });
    return res.status(201).json({ releaseId: created.id });
  }

  if (req.method === 'GET') {
    const rows = await db.select().from(distroReleases).where(eq(distroReleases.artistId, user.id));
    return res.status(200).json(rows);
  }

  return res.status(405).end();
}
```

Socket.io events

```javascript
// server/utils/realtime.js or client/src/lib/realtime.ts
// Server emitter (Socket.io initialized in Next.js custom server or via a singleton)
io.on('connection', (socket) => {
  // auth channel join could be implemented
  socket.on('subscribe', (channel) => socket.join(channel));
});

function ioEmit(event, payload) {
  io.emit(event, payload);
}

// Events used:
// marketplace:listings:updated { listingId, action }
// order:status { orderId, status }
// payout:status { payoutEventId, status }
// distribution:release:update { releaseId, status }
// distribution:dispatch:update { releaseId, providerId, status }
```

#### Components Structure
```
client/src/components/marketplace/
├── ListingCard.tsx
├── ListingGrid.tsx
├── ListingFilters.tsx
├── ListingForm.tsx
├── CheckoutDialog.tsx

client/src/components/payments/
├── StripeOnboardingBanner.tsx
├── PayoutStatusChip.tsx

client/src/components/distribution/
├── ReleaseForm.tsx
├── TrackUploader.tsx
├── ProviderSelector.tsx
├── ReleaseStatusTimeline.tsx
```

Key pages:
- client/src/pages/marketplace/index.tsx
- client/src/pages/marketplace/[id].tsx
- client/src/pages/distribution/releases/new.tsx
- client/src/pages/distribution/releases/[id].tsx
- client/src/pages/orders/index.tsx
- client/src/pages/payments/onboarding.tsx

#### State Management
- TanStack React Query for all data fetching/mutations.
- Socket.io client for real-time updates; subscribe to user-specific and feature channels.
- Local UI state in components; form state with React Hook Form + Zod resolver for schema validation.
- Optimistic updates for listing creation; invalidate on server confirmation.

### Dependencies & Integrations
- Stripe (stripe) for Connect, PaymentIntents, transfers, webhooks.
- Drizzle ORM (drizzle-orm, pg) with Neon PostgreSQL.
- Zod for request/response validation.
- Socket.io (socket.io, socket.io-client) for real-time events.
- Replit Auth integration via custom helper (getSessionUser) and secure cookies.
- Optional: File uploads via a signed upload flow to an object store (e.g., S3-compatible). Provide placeholder endpoints /api/uploads/sign.

Interacts with:
- Security & Infrastructure: audit/logging hooks for financial events.
- Social & Advertising AI: can surface marketplace listings (read-only).
- Analytics: uses payoutEvents and orders for metrics.

### Implementation Steps
1. Set up database models
   - Add schema in shared/schema.ts; generate and run Drizzle migrations.
   - Seed platformSettings with platformFeePercent.

2. Create Next.js API routes
   - Stripe Connect onboarding (create-account, refresh link) and webhook.
   - Marketplace: listings CRUD (create, get, update publish/unpublish), checkout endpoint.
   - Orders: list my orders, get order by id.
   - Distribution: create release, list releases, submit queue (index.ts handles POST as queued), generic DSP webhook endpoint, polling endpoint for provider status.

3. Implement authentication
   - Replit Auth helper getSessionUser; protect all POST/PATCH endpoints.
   - Ownership checks for listing updates and release reads.

4. Build React components
   - Marketplace pages: ListingGrid, ListingCard, filters, detail page with CheckoutDialog (Stripe Elements).
   - Payments: StripeOnboardingBanner showing onboarding state and link.
   - Distribution: ReleaseForm with TrackUploader, ProviderSelector, and ReleaseStatusTimeline.

5. Add Socket.io events
   - Initialize Socket.io server singleton.
   - Emit events on listing create/update, order status changes, payout updates, and distribution status transitions.
   - Client subscribes and updates UI.

6. Implement payout calculation and transfers
   - On payment_intent.succeeded webhook:
     - Mark order paid.
     - If exclusive: decrement stock and unpublish listing inside a transaction.
     - Compute collaborator splits from royaltySplits net of platform fee.
     - Create Transfers to each collaborator’s Stripe account (stripe.transfers.create) or record payoutEvents as pending if collaborator not onboarded.
     - Emit payout:status events.
     - Generate license document (placeholder) and link to order.

7. Implement distribution automation layer
   - Background job (poller) that reads distroDispatch rows with status=queued/submitted:
     - Submit metadata and assets to provider APIs (mock or real).
     - Update status transitions and logs; emit distribution:* events.
   - Add generic /api/distribution/webhook to process provider callbacks and map to distroDispatch updates.

8. Test collaborative features
   - Multiple users editing listings/splits; validate constraints.
   - Concurrent checkout on exclusive listing with row-level lock or transaction retry.

9. Deploy on Replit
   - Configure Replit Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, APP_URL, DATABASE_URL.
   - Ensure webhook endpoint is publicly accessible; set Stripe webhook to /api/stripe/webhook.

### Edge Cases & Error Handling
- Stripe onboarding incomplete
  - Block checkout; return 400 with actionable error. UI shows StripeOnboardingBanner.
- Exclusive listing race condition
  - Use transaction with SELECT FOR UPDATE on listing row to ensure exclusiveStock > 0 then decrement and unpublish.
- Splits not summing to 100%
  - Validation error on create/update; prevent save.
- Webhook retries and idempotency
  - Store webhookEvents and mark processed to avoid double processing. Use Stripe idempotency keys for transfer calls.
- Collaborator not onboarded
  - Record payoutEvents with status=initiated but do not create transfer until onboarded; periodic job attempts transfer when onboarded.
- Refunds/chargebacks
  - On charge.refunded, reverse transfers (stripe.transfers.createReversal) and update payoutEvents to failed/adjustment; mark order as refunded.
- Invalid metadata for distribution
  - Validate mandatory fields and formats; set distroDispatch to failed with logs and actionable error messages.
- Asset storage links
  - Ensure downloadUrl is signed/expiring; prevent direct public access for paid assets.
- Currency
  - Restrict to USD in MVP; validate and block others.

### Testing Approach
- Unit tests
  - Split calculation: ensure correct app fee and collaborator shares.
  - Listings validation: splits sum to 100, exclusive stock logic.
  - Distribution validators: required metadata presence.

- Integration tests
  - Checkout flow: create listing → checkout → webhook → order paid → transfers issued.
  - Stripe webhook signature verification and idempotency.
  - Exclusive race: simulate concurrent purchases; verify only one succeeds.
  - Distribution queue: submit release → provider mocked API → status transitions recorded.

- User acceptance tests
  - Artist onboarding: start/return to Stripe onboarding, dashboard reflects status.
  - Create listing and buy: end-to-end with test card, license delivery.
  - Define collaborator splits and verify payouts.
  - Create release, upload tracks, select providers, see status updates live.

Notes for engineers
- Keep all external calls (Stripe/DSP) in API routes (no Server Actions).
- Use Zod schemas for all inputs.
- Emit Socket.io events after DB commits succeed.
- Store only necessary Stripe IDs; sensitive config handled via env secrets.
- Background processing can be implemented as a lightweight interval job in the Next.js server process or a separate worker in server/ if needed.