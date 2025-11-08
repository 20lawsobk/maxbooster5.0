## Feature: Security & Infrastructure

### Overview
Self-healing security and infrastructure layer that:
- Continuously monitors service health and auto-recovers from failures
- Enforces RBAC-protected admin operations
- Runs continuous security and performance audits with a full audit log
- Provides real-time visibility and proactive incident handling to maintain near-zero downtime

This feature is the backbone that ensures scalable uptime, integrity, and safety across all other modules.

### User Stories & Requirements
- As an end user, I want the app to be available and fast so that I never notice outages.
  - Acceptance:
    - 99.9%+ uptime target at app level
    - Average API response < 200ms under normal load
    - Automatic degradation instead of hard failures during dependency outages

- As an admin, I want a protected dashboard to monitor system health, incidents, and audit logs in real time so that I can act quickly.
  - Acceptance:
    - /admin/security is accessible only to authenticated admins
    - Live feed of health, incidents, and alerts within 1s of change
    - Ability to resolve incidents, trigger synthetic health checks, and run safe-mode toggles

- As an auditor, I want immutable audit logs of critical actions so that I can verify compliance.
  - Acceptance:
    - All sensitive actions are logged with user, IP, UA, resource, and outcome
    - Logs are queryable with filters; tamper-evident via hash chain
    - Minimum retention of 90 days

- As a platform owner, I want continuous automated audits (security & performance) so that risks are detected and auto-patched where possible.
  - Acceptance:
    - Pipeline posts findings via webhook stored as security_findings
    - Severity thresholds raise incidents automatically
    - Optional auto-patch scripts invoked via admin approval or pre-set policy

- As an SRE, I want self-healing behavior so the app recovers from common faults automatically.
  - Acceptance:
    - Watchdog monitors event loop lag, memory, DB connectivity and triggers graceful restart or degrade mode
    - Circuit breaker on external deps with retries and backoff
    - Health checks per region/service with incident creation on breach

### Technical Implementation

#### Database Schema
Using Drizzle ORM (PostgreSQL) in shared/schema.ts and drizzle migrations.

```typescript
// shared/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";

// Roles & RBAC
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(), // 'admin', 'sre', 'auditor', 'user'
  name: text('name').notNull(),
  permissions: jsonb('permissions').$type<Record<string, boolean>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // from Replit Auth subject or user table
  roleId: uuid('role_id').notNull().references(() => roles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  userIdx: index('idx_user_roles_user').on(t.userId),
  roleIdx: index('idx_user_roles_role').on(t.roleId),
}));

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'), // nullable for system events
  action: text('action').notNull(), // e.g., 'INCIDENT_RESOLVE', 'ROLE_ASSIGN'
  resource: text('resource').notNull(), // e.g., 'incident:123'
  statusCode: integer('status_code').notNull().default(200),
  ip: text('ip'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  hash: text('hash').notNull(), // tamper-evident hash chain
  prevHash: text('prev_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  actionIdx: index('idx_audit_action').on(t.action),
  createdIdx: index('idx_audit_created').on(t.createdAt),
}));

// Health Checks
export const healthChecks = pgTable('health_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  service: text('service').notNull(), // 'api', 'db', 'socket', 'external:stripe'
  region: text('region').default('global'),
  status: text('status').notNull(), // 'healthy' | 'degraded' | 'down'
  latencyMs: integer('latency_ms').notNull().default(0),
  error: text('error'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  svcIdx: index('idx_health_service_region').on(t.service, t.region),
  timeIdx: index('idx_health_checked_at').on(t.checkedAt),
}));

// Incidents
export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  severity: text('severity').notNull(), // 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('open'), // 'open' | 'investigating' | 'mitigated' | 'resolved'
  detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdBy: text('created_by'),
  meta: jsonb('meta').$type<Record<string, any>>().default({}),
}, (t) => ({
  sevIdx: index('idx_incidents_severity').on(t.severity),
  statusIdx: index('idx_incidents_status').on(t.status),
}));

// Security Findings (from CI/CD audit)
export const securityFindings = pgTable('security_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'dependency', 'sast', 'dast', 'config'
  component: text('component').notNull(),
  severity: text('severity').notNull(), // 'low' | 'medium' | 'high' | 'critical'
  description: text('description').notNull(),
  cve: text('cve'),
  status: text('status').notNull().default('open'), // 'open' | 'accepted_risk' | 'mitigated' | 'false_positive' | 'resolved'
  detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
}, (t) => ({
  typeIdx: index('idx_findings_type').on(t.type),
  sevIdx: index('idx_findings_severity').on(t.severity),
  statusIdx: index('idx_findings_status').on(t.status),
}));

// Patches (optional auto-patching registry)
export const patches = pgTable('patches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  scriptPath: text('script_path').notNull(),
  checksum: text('checksum').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'applied' | 'failed'
  appliedAt: timestamp('applied_at', { withTimezone: true }),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
});

// System Flags (feature toggles / safe-mode)
export const systemFlags = pgTable('system_flags', {
  key: text('key').primaryKey(), // e.g. 'safe_mode', 'degrade_db_reads'
  value: jsonb('value').$type<any>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

Generate and run migrations via drizzle kit (see drizzle/).

#### API Endpoints / Server Actions
Next.js API routes (no Server Actions). Socket.io for real-time updates.

```typescript
// client/src/pages/api/security/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth';
import { runHealthChecks } from '@/lib/health';
import { ioServer } from '@/lib/socket';

export default requireAdmin(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const report = await runHealthChecks();
    // broadcast update
    ioServer().emit('health:update', report);
    return res.status(200).json(report);
  }
  return res.status(405).end();
});
```

```typescript
// client/src/pages/api/security/incidents/index.ts
import { db } from '@/lib/db';
import { incidents } from '@/shared/schema';
import { requireAdmin } from '@/lib/auth';
import { ioServer } from '@/lib/socket';
import { eq } from 'drizzle-orm';

export default requireAdmin(async (req, res) => {
  if (req.method === 'GET') {
    const list = await db.select().from(incidents).orderBy(incidents.detectedAt);
    return res.status(200).json(list);
  }
  if (req.method === 'POST') {
    const { severity, title, description, meta } = req.body;
    const [inserted] = await db.insert(incidents).values({ severity, title, description, meta }).returning();
    ioServer().emit('incident:new', inserted);
    return res.status(201).json(inserted);
  }
  res.status(405).end();
});
```

```typescript
// client/src/pages/api/security/incidents/[id].ts
import { db } from '@/lib/db';
import { incidents } from '@/shared/schema';
import { requireAdmin } from '@/lib/auth';
import { ioServer } from '@/lib/socket';
import { eq } from 'drizzle-orm';

export default requireAdmin(async (req, res) => {
  const { id } = req.query as { id: string };
  if (req.method === 'PATCH') {
    const { status, resolvedAt, meta } = req.body;
    const [updated] = await db.update(incidents).set({ status, resolvedAt, meta }).where(eq(incidents.id, id)).returning();
    ioServer().emit('incident:update', updated);
    return res.status(200).json(updated);
  }
  res.status(405).end();
});
```

```typescript
// client/src/pages/api/security/audit/logs.ts
import { db } from '@/lib/db';
import { auditLogs } from '@/shared/schema';
import { requireAdmin, optionalAuth } from '@/lib/auth';
import { createAuditEntry } from '@/lib/audit';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Public logging endpoint (optionalAuth) for system & app events
    await optionalAuth(req, res);
    const entry = await createAuditEntry(req, {
      action: req.body.action,
      resource: req.body.resource,
      statusCode: req.body.statusCode ?? 200,
      metadata: req.body.metadata ?? {},
    });
    return res.status(201).json(entry);
  }
  if (req.method === 'GET') {
    await requireAdmin(async () => {})(req, res); // ensure admin
    const { action, from, to, limit = 100 } = req.query;
    // build filters...
    // return filtered audit logs
    // (pseudo - implement drizzle query with where clauses)
  }
  res.status(405).end();
}
```

```typescript
// client/src/pages/api/security/findings/webhook.ts
// CI/CD posts JSON findings here
import { db } from '@/lib/db';
import { securityFindings, incidents } from '@/shared/schema';
import { verifyCiSecret } from '@/lib/ci';
import { ioServer } from '@/lib/socket';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!verifyCiSecret(req.headers['x-ci-signature'] as string)) return res.status(401).end();

  const payload = req.body; // array of findings
  const inserted = await db.insert(securityFindings).values(payload).returning();

  // auto-incident on threshold
  const critical = inserted.filter(f => f.severity === 'critical');
  if (critical.length) {
    const [incident] = await db.insert(incidents).values({
      severity: 'critical',
      title: `Critical security findings (${critical.length})`,
      description: 'Auto-created from CI audit webhook',
      meta: { ids: critical.map(c => c.id) },
    }).returning();
    ioServer().emit('incident:new', incident);
  }
  res.status(201).json({ count: inserted.length });
}
```

```typescript
// client/src/pages/api/security/rbac/assign.ts
import { db } from '@/lib/db';
import { roles, userRoles } from '@/shared/schema';
import { requireAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { createAuditEntry } from '@/lib/audit';

export default requireAdmin(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, roleSlug } = req.body;
  const [role] = await db.select().from(roles).where(eq(roles.slug, roleSlug));
  if (!role) return res.status(404).json({ error: 'Role not found' });
  await db.insert(userRoles).values({ userId, roleId: role.id });
  await createAuditEntry(req, { action: 'ROLE_ASSIGN', resource: `user:${userId}`, metadata: { role: roleSlug } });
  res.status(204).end();
});
```

```typescript
// client/src/pages/api/security/cron/health-check.ts
// Triggered by external scheduler or Replit ping
import { runHealthChecks } from '@/lib/health';
import { ioServer } from '@/lib/socket';

export default async function handler(req, res) {
  const report = await runHealthChecks();
  ioServer().emit('health:update', report);
  res.status(200).json(report);
}
```

Socket.io setup (server)

```typescript
// client/src/pages/api/socketio.ts
import { NextApiRequest } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: any) {
  if (!(res.socket as any).server.io) {
    const httpServer: HTTPServer = (res.socket as any).server;
    const io = new IOServer(httpServer, { path: '/api/socketio' });
    (res.socket as any).server.io = io;
  }
  res.end();
}

// client/src/lib/socket.ts
import { Server as IOServer } from 'socket.io';

export const ioServer = () => {
  // ensure /api/socketio was called at least once (on app start)
  return (global as any).io || ((global as any).io = (global as any).server?.io || null) || ({} as IOServer);
};
```

Self-healing watchdog and health checks

```typescript
// client/src/lib/health.ts
import { db } from '@/lib/db';
import { healthChecks, incidents, systemFlags } from '@/shared/schema';
import { performance } from 'perf_hooks';
import { eq } from 'drizzle-orm';

export async function runHealthChecks() {
  const start = performance.now();
  let dbOk = true, dbErr: string | undefined;
  try { await db.execute('select 1'); } catch (e: any) { dbOk = false; dbErr = e.message; }

  const eventLoopLag = await measureEventLoopLag(200);
  const status = {
    api: { status: eventLoopLag < 200 ? 'healthy' : 'degraded', latencyMs: Math.round(eventLoopLag) },
    db: { status: dbOk ? 'healthy' : 'down', error: dbErr },
  };

  // persist checks
  await db.insert(healthChecks).values([
    { service: 'api', status: status.api.status, latencyMs: status.api.latencyMs },
    { service: 'db', status: status.db.status, error: status.db.error },
  ]);

  // create incident if needed
  if (!dbOk) {
    await db.insert(incidents).values({
      severity: 'high',
      title: 'Database connectivity failure',
      description: dbErr || 'Unknown DB error',
      meta: { source: 'health-check' },
    });
    // set safe_mode flag
    await db.insert(systemFlags).values({ key: 'safe_mode', value: { enabled: true, reason: 'db_down' } })
      .onConflictDoUpdate({ target: systemFlags.key, set: { value: { enabled: true, reason: 'db_down' } } });
  }

  return { status, checkedAt: new Date().toISOString() };
}

async function measureEventLoopLag(ms: number) {
  return new Promise<number>((resolve) => {
    const start = performance.now();
    setTimeout(() => {
      resolve(performance.now() - start - ms);
    }, ms);
  });
}
```

Circuit breaker example (for external deps)

```typescript
// client/src/lib/circuit.ts
import CircuitBreaker from 'opossum';

export function createBreaker<TArgs extends any[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const breaker = new CircuitBreaker(fn, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
  });
  breaker.on('open', () => console.warn('Circuit open'));
  breaker.on('halfOpen', () => console.warn('Circuit half-open'));
  breaker.on('close', () => console.warn('Circuit closed'));
  return breaker;
}
```

Auth and RBAC middleware

```typescript
// client/src/lib/auth.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { userRoles, roles } from '@/shared/schema';
import { and, eq } from 'drizzle-orm';

// Example Replit Auth extraction (adapt to actual Replit Auth in your project)
function getUserFromReq(req: NextApiRequest) {
  // e.g., read from headers/cookies set by Replit Auth
  const userId = req.headers['x-replit-user-id'] as string | undefined;
  return userId ? { id: userId } : null;
}

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    (req as any).user = user;
    return handler(req, res);
  };
}

export const optionalAuth = async (req: NextApiRequest, _res: NextApiResponse) => {
  (req as any).user = getUserFromReq(req) || null;
};

export function requireRole(roleSlug: string) {
  return (handler: NextApiHandler) => withAuth(async (req, res) => {
    const user = (req as any).user as { id: string };
    const rows = await db.select().from(userRoles)
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, user.id), eq(roles.slug, roleSlug)));
    if (!rows?.length) return res.status(403).json({ error: 'Forbidden' });
    return handler(req, res);
  });
}

export const requireAdmin = requireRole('admin');
```

Audit helper (hash-chained logs)

```typescript
// client/src/lib/audit.ts
import crypto from 'crypto';
import { db } from '@/lib/db';
import { auditLogs } from '@/shared/schema';
import { desc } from 'drizzle-orm';

export async function createAuditEntry(req: any, entry: {
  action: string; resource: string; statusCode: number; metadata?: any;
}) {
  const user = (req as any).user || null;
  const [prev] = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(1);
  const prevHash = prev?.hash || '';
  const toHash = JSON.stringify({ ...entry, userId: user?.id, prevHash, ts: Date.now() });
  const hash = crypto.createHash('sha256').update(toHash).digest('hex');

  const [inserted] = await db.insert(auditLogs).values({
    userId: user?.id || null,
    action: entry.action,
    resource: entry.resource,
    statusCode: entry.statusCode,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    metadata: entry.metadata || {},
    prevHash,
    hash,
  }).returning();
  return inserted;
}
```

#### Components Structure
Admin-only security dashboard (Next.js + Tailwind + ShadCN).

```
client/src/components/security/
├── MonitoringDashboard.tsx
├── HealthCard.tsx
├── IncidentTable.tsx
├── AuditLogTable.tsx
├── FindingsTable.tsx
└── SafeModeToggle.tsx

client/src/pages/admin/security/index.tsx
client/src/hooks/useSecuritySocket.ts
```

Key components:
- MonitoringDashboard: aggregates cards, incident list, findings table, safe-mode status
- HealthCard: shows per-service health with latency and status
- IncidentTable: list, filter, resolve/update
- AuditLogTable: query recent actions with filters
- FindingsTable: CI findings; accept/mitigate/resolve
- SafeModeToggle: flips system_flags.safe_mode (admin only)

#### State Management
- TanStack React Query for data fetching:
  - useQuery: GET /api/security/health, /api/security/incidents, /api/security/audit/logs, /api/security/findings
  - useMutation: POST/PATCH relevant endpoints
- Socket.io integration:
  - hooks/useSecuritySocket.ts listens to:
    - 'health:update' → invalidate health queries
    - 'incident:new' / 'incident:update' → update incidents cache
    - 'alerts:notify' → toast notifications
- System flags (safe mode) fetched on load and cached with React Query

### Dependencies & Integrations
- Internal:
  - Replit Auth (primary) for identity; map to RBAC via roles/user_roles
  - PostgreSQL (Neon) with Drizzle ORM
  - Replit Database (KV) optional for lightweight flags/circuit state
  - Socket.io for real-time monitoring updates
- External:
  - CI/CD posts to /api/security/findings/webhook (provide secret)
- NPM packages (beyond base):
  - zod (validation)
  - socket.io and socket.io-client
  - opossum (circuit breaker)
  - prom-client (metrics; optional /api/metrics)
  - node-cron (optional scheduled tasks if external scheduler not available)
  - helmet, cors, rate-limiter-flexible (security hardening for any custom Express worker)
  - uuid/nanoid (if needed)
- Security headers:
  - Configure Next.js custom headers with Helmet-like CSP in next.config.js

### Implementation Steps
1. Set up database models
   - Add schema to shared/schema.ts and generate Drizzle migrations
   - Migrate DB (dev and prod)
   - Seed roles: admin, sre, auditor, user
2. Create API routes
   - Health: GET /api/security/health and /api/security/cron/health-check
   - Incidents: GET/POST /api/security/incidents, PATCH /api/security/incidents/[id]
   - Audit: GET/POST /api/security/audit/logs
   - RBAC: POST /api/security/rbac/assign
   - Findings webhook: POST /api/security/findings/webhook with signature verification
3. Implement authentication
   - Build lib/auth.ts for Replit Auth extraction and RBAC middleware (requireAdmin, requireRole)
   - Add audit logging via lib/audit.ts for sensitive endpoints
4. Build React components
   - Create admin dashboard at client/src/pages/admin/security/index.tsx
   - Implement MonitoringDashboard with HealthCard, IncidentTable, AuditLogTable, FindingsTable, SafeModeToggle
   - Wire up React Query hooks and Socket.io client (hooks/useSecuritySocket.ts)
5. Add Socket.io events
   - Initialize /api/socketio and ioServer helper
   - Emit events on health updates, incidents create/update, alert notifications
6. Test collaborative features
   - Verify multiple admin clients see real-time updates
   - Ensure RBAC prevents non-admin access and that audit logs are created
7. Deploy on Replit
   - Configure Replit Secrets: DATABASE_URL, CI_AUDIT_SECRET, etc.
   - Ensure health-check cron ping (Replit or external) invokes /api/security/cron/health-check
   - Monitor logs; verify auto-recovery behaviors

### Edge Cases & Error Handling
- DB outage:
  - Health check creates incident and sets safe_mode flag
  - API handlers should read safe_mode and degrade non-critical operations gracefully
- Socket.io initialization race:
  - Ensure /api/socketio is invoked on app mount; guard emits if io not ready
- Audit log tampering:
  - Hash chain prevents silent tampering; add periodic verification job
- Incident storm:
  - Debounce identical incidents (meta.signature) and increment occurrence count
- Unauthorized access:
  - All admin routes protected; return 401/403 with no sensitive details
- CI webhook abuse:
  - Require HMAC signature; rate-limit endpoint
- Event loop lag spikes:
  - Watchdog reports degraded status; consider process exit for platform restart if sustained
- Time drift:
  - Use server time for incident timestamps; avoid client-supplied dates

### Testing Approach
- Unit tests
  - lib/auth: requireAdmin/requireRole logic and unauthorized/forbidden paths
  - lib/audit: hash chain integrity; log creation with/without user
  - lib/health: healthy/degraded/down scenarios with mocked DB
  - lib/circuit: breaker open/close behavior
- Integration tests
  - API: RBAC on all /api/security/* endpoints
  - Incidents lifecycle: create, update, resolve; verify socket events fired
  - Audit logs: POST/GET with filters; verify entries and hash chain
  - CI webhook: valid/invalid signatures; auto-incident thresholding
- Load/scalability tests
  - Use autocannon/k6 against key endpoints to check latency and error rate
  - Simulate DB failure and confirm degrade mode + incident
- UAT
  - Admin navigates /admin/security, sees live health updates
  - Assign admin role to a test user; verify permissions and audit entries
  - Trigger synthetic health check; see incident and resolution flow

Notes and Replit-specific guidance:
- Use Next.js API routes; avoid Server Actions for external calls
- Configure environment via Replit Secrets (DATABASE_URL, CI_AUDIT_SECRET)
- Replit Agent can scaffold additional service files and migrations as needed
- For “self-healing,” rely on:
  - Graceful degradation via systemFlags
  - Circuit breakers and retries
  - Health checks triggering incident creation and optional process restart
- For admin route protection, ensure production build includes appropriate security headers and CORS policies where applicable.