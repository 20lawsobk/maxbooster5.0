import { pgTable, serial, varchar, text, integer, timestamp, boolean, jsonb, decimal, real, bigint, uuid, index, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Revenue source types for royalty tracking
export const revenueSourceEnum = pgEnum('revenue_source', [
  'spotify', 'apple_music', 'youtube', 'soundcloud', 
  'licensing', 'sync', 'performance', 'mechanical', 'other'
]);

// Payment status types for royalty payments
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'processing', 'completed', 'failed', 'cancelled'
]);

// Users table - VARCHAR ID (existing database)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  isAdmin: boolean("is_admin").default(false),
  subscriptionTier: varchar("subscription_tier", { length: 50 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeConnectedAccountId: varchar("stripe_connected_account_id", { length: 255 }),
  stripeBankAccountId: varchar("stripe_bank_account_id", { length: 255 }),
  totalPayouts: decimal("total_payouts", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  username: varchar("username", { length: 255 }),
  password: text("password"),
  role: varchar("role", { length: 50 }).default("user"),
  googleId: varchar("google_id", { length: 255 }),
  subscriptionPlan: varchar("subscription_plan", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 50 }),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  facebookToken: text("facebook_token"),
  instagramToken: text("instagram_token"),
  twitterToken: text("twitter_token"),
  youtubeToken: text("youtube_token"),
  tiktokToken: text("tiktok_token"),
  linkedinToken: text("linkedin_token"),
  threadsToken: text("threads_token"),
  googleBusinessToken: text("google_business_token"),
  notificationPreferences: jsonb("notification_preferences").default({
    email: true,
    browser: true,
    releases: true,
    earnings: true,
    sales: true,
    marketing: true,
    system: true
  }),
  pushSubscription: jsonb("push_subscription"),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  onboardingData: jsonb("onboarding_data"),
});

// Password Reset Tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("password_reset_tokens_email_idx").on(table.email),
  tokenIdx: index("password_reset_tokens_token_idx").on(table.token),
  expiresAtIdx: index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
}));

// Sessions table for multi-device session tracking
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userAgent: text("user_agent"),
  ip: varchar("ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  sessionIdIdx: index("sessions_session_id_idx").on(table.sessionId),
  lastActivityIdx: index("sessions_last_activity_idx").on(table.lastActivity),
}));

// Projects table - Unified with optional studio-specific fields
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  progress: integer("progress").default(0),
  duration: integer("duration"),
  filePath: varchar("file_path", { length: 500 }),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"),
  artworkUrl: varchar("artwork_url", { length: 500 }),
  streams: integer("streams").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  type: varchar("type", { length: 50 }),
  tags: text("tags"),
  playCount: integer("play_count").default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
  quality: varchar("quality", { length: 50 }),
  likeCount: integer("like_count").default(0),
  isStudioProject: boolean("is_studio_project").default(false),
  isTemplate: boolean("is_template").default(false),
  bpm: integer("bpm").default(120),
  timeSignature: varchar("time_signature", { length: 10 }).default("4/4"),
  key: varchar("key", { length: 10 }).default("C"),
  sampleRate: integer("sample_rate").default(48000),
  bitDepth: integer("bit_depth").default(24),
  masterVolume: real("master_volume").default(0.8),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("projects_user_id_idx").on(table.userId),
  statusIdx: index("projects_status_idx").on(table.status),
  createdAtIdx: index("projects_created_at_idx").on(table.createdAt),
  isStudioProjectIdx: index("projects_is_studio_project_idx").on(table.isStudioProject),
  userStatusIdx: index("projects_user_status_idx").on(table.userId, table.status),
  userStatusCreatedIdx: index("projects_user_status_created_idx").on(table.userId, table.status, table.createdAt),
}));

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  totalStreams: integer("total_streams").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  totalListeners: integer("total_listeners").default(0),
  streams: integer("streams").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  platform: varchar("platform", { length: 100 }),
  platformData: jsonb("platform_data"),
  trackData: jsonb("track_data"),
  audienceData: jsonb("audience_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("analytics_user_id_idx").on(table.userId),
  dateIdx: index("analytics_date_idx").on(table.date),
  userDateIdx: index("analytics_user_date_idx").on(table.userId, table.date),
  userCreatedAtIdx: index("analytics_user_created_at_idx").on(table.userId, table.createdAt),
}));

// Analytics Anomalies table - Threshold-based anomaly detection
export const analyticsAnomalies = pgTable("analytics_anomalies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  projectId: uuid("project_id"),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  anomalyType: varchar("anomaly_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull(),
  baselineValue: decimal("baseline_value", { precision: 15, scale: 2 }).notNull(),
  actualValue: decimal("actual_value", { precision: 15, scale: 2 }).notNull(),
  deviationPercentage: decimal("deviation_percentage", { precision: 10, scale: 2 }).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  notificationSent: boolean("notification_sent").default(false),
}, (table) => ({
  userIdIdx: index("analytics_anomalies_user_id_idx").on(table.userId),
  projectIdIdx: index("analytics_anomalies_project_id_idx").on(table.projectId),
  metricTypeIdx: index("analytics_anomalies_metric_type_idx").on(table.metricType),
  severityIdx: index("analytics_anomalies_severity_idx").on(table.severity),
  detectedAtIdx: index("analytics_anomalies_detected_at_idx").on(table.detectedAt),
  acknowledgedAtIdx: index("analytics_anomalies_acknowledged_at_idx").on(table.acknowledgedAt),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  link: varchar("link", { length: 500 }),
  metadata: jsonb("metadata"),
  emailSent: boolean("email_sent").default(false),
  browserSent: boolean("browser_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.read),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

// Releases table
export const releases = pgTable("releases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  projectId: uuid("project_id"),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  albumArt: varchar("album_art", { length: 500 }),
  releaseDate: timestamp("release_date"),
  status: varchar("status", { length: 50 }).default("draft"),
  platforms: jsonb("platforms"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("releases_user_id_idx").on(table.userId),
  statusIdx: index("releases_status_idx").on(table.status),
  userStatusReleaseDateIdx: index("releases_user_status_release_date_idx").on(table.userId, table.status, table.releaseDate),
}));

// Tracks table
export const tracks = pgTable("tracks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id"),
  name: text("name"),
  trackNumber: integer("track_number"),
  audioUrl: varchar("audio_url", { length: 500 }),
  gain: real("gain"),
  pan: real("pan"),
  isMuted: boolean("is_muted").default(false),
  isSolo: boolean("is_solo").default(false),
  effects: jsonb("effects"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track Analysis (AI Music Analysis Results)
export const trackAnalysis = pgTable("track_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  trackId: uuid("track_id"),
  bpm: decimal("bpm", { precision: 6, scale: 2 }),
  musicalKey: varchar("musical_key", { length: 20 }),
  scale: varchar("scale", { length: 20 }),
  genre: varchar("genre", { length: 100 }),
  mood: varchar("mood", { length: 100 }),
  energy: real("energy"),
  danceability: real("danceability"),
  valence: real("valence"),
  instrumentalness: real("instrumentalness"),
  acousticness: real("acousticness"),
  loudnessLufs: real("loudness_lufs"),
  spectralCentroid: real("spectral_centroid"),
  durationSeconds: integer("duration_seconds"),
  beatPositions: jsonb("beat_positions"), // Array of beat timestamps
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("track_analysis_project_id_idx").on(table.projectId),
  trackIdIdx: index("track_analysis_track_id_idx").on(table.trackId),
}));

// Collaborators table
export const collaborators = pgTable("collaborators", {
  id: varchar("id", { length: 255 }).primaryKey(),
  releaseId: varchar("release_id", { length: 255 }),
  trackId: varchar("track_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
});

// Earnings table
export const earnings = pgTable("earnings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  releaseId: varchar("release_id", { length: 255 }),
  platform: varchar("platform", { length: 100 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }),
  date: timestamp("date"),
  streams: integer("streams").default(0),
  reportDate: timestamp("report_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payouts table
export const payouts = pgTable("payouts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePayoutId: varchar("stripe_payout_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"),
  method: varchar("method", { length: 50 }).default("stripe"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("payouts_user_id_idx").on(table.userId),
  statusIdx: index("payouts_status_idx").on(table.status),
  createdAtIdx: index("payouts_created_at_idx").on(table.createdAt),
}));

// Royalty Splits table - Tracks percentage splits per project collaborator
export const projectRoyaltySplits = pgTable("project_royalty_splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  collaboratorId: varchar("collaborator_id", { length: 255 }).references(() => users.id).notNull(),
  splitPercentage: decimal("split_percentage", { precision: 5, scale: 2 }).notNull(),
  role: varchar("role", { length: 100 }),
  effectiveDate: timestamp("effective_date").notNull().defaultNow(),
  lockedAt: timestamp("locked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("project_royalty_splits_project_id_idx").on(table.projectId),
  collaboratorIdIdx: index("project_royalty_splits_collaborator_id_idx").on(table.collaboratorId),
}));

// Revenue Events table - Incoming revenue from various sources
export const revenueEvents = pgTable("revenue_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  source: revenueSourceEnum("source").notNull(),
  sourceType: varchar("source_type", { length: 50 }),
  rawAmount: decimal("raw_amount", { precision: 12, scale: 2 }),
  description: text("description"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("revenue_events_project_id_idx").on(table.projectId),
  occurredAtIdx: index("revenue_events_occurred_at_idx").on(table.occurredAt),
  sourceIdx: index("revenue_events_source_idx").on(table.source),
  projectCreatedAtIdx: index("revenue_events_project_created_at_idx").on(table.projectId, table.createdAt),
}));

// Royalty Ledger table - Per-collaborator earnings from each revenue event
export const royaltyLedger = pgTable("royalty_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  revenueEventId: varchar("revenue_event_id").references(() => revenueEvents.id, { onDelete: 'cascade' }).notNull(),
  collaboratorId: varchar("collaborator_id", { length: 255 }).references(() => users.id).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  splitPercentage: decimal("split_percentage", { precision: 5, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  revenueEventIdIdx: index("royalty_ledger_revenue_event_id_idx").on(table.revenueEventId),
  collaboratorIdIdx: index("royalty_ledger_collaborator_id_idx").on(table.collaboratorId),
  projectIdIdx: index("royalty_ledger_project_id_idx").on(table.projectId),
  isPaidIdx: index("royalty_ledger_is_paid_idx").on(table.isPaid),
  collaboratorPaidCreatedIdx: index("royalty_ledger_collaborator_paid_created_idx").on(table.collaboratorId, table.isPaid, table.createdAt),
}));

// Royalty Payments table - Records of actual payouts to collaborators
export const royaltyPayments = pgTable("royalty_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collaboratorId: varchar("collaborator_id", { length: 255 }).references(() => users.id).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  ledgerEntryIds: text("ledger_entry_ids").array(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  collaboratorIdIdx: index("royalty_payments_collaborator_id_idx").on(table.collaboratorId),
  projectIdIdx: index("royalty_payments_project_id_idx").on(table.projectId),
  statusIdx: index("royalty_payments_status_idx").on(table.status),
  createdAtIdx: index("royalty_payments_created_at_idx").on(table.createdAt),
  collaboratorStatusCreatedIdx: index("royalty_payments_collaborator_status_created_idx").on(table.collaboratorId, table.status, table.createdAt),
}));

// Tax Profiles for 1099-MISC generation
export const collaboratorTaxProfiles = pgTable("collaborator_tax_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taxId: varchar("tax_id", { length: 20 }).notNull(),
  taxIdType: varchar("tax_id_type", { length: 10 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  w9OnFile: boolean("w9_on_file").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("collaborator_tax_profiles_user_id_idx").on(table.userId),
}));

// CSV Upload History for idempotent uploads
export const revenueImportHistory = pgTable("revenue_import_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename", { length: 512 }).notNull(),
  fileHash: varchar("file_hash", { length: 64 }).notNull().unique(),
  rowsProcessed: integer("rows_processed").notNull().default(0),
  rowsSucceeded: integer("rows_succeeded").notNull().default(0),
  rowsFailed: integer("rows_failed").notNull().default(0),
  errors: jsonb("errors"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("revenue_import_history_user_id_idx").on(table.userId),
  fileHashIdx: index("revenue_import_history_file_hash_idx").on(table.fileHash),
  statusIdx: index("revenue_import_history_status_idx").on(table.status),
}));

// Forecast Snapshots for AI predictions
export const forecastSnapshots = pgTable("forecast_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  granularity: varchar("granularity", { length: 20 }).notNull(),
  forecastPeriods: jsonb("forecast_periods").notNull(),
  baselinePeriod: varchar("baseline_period", { length: 50 }).notNull(),
  confidenceLevel: integer("confidence_level").notNull().default(95),
  algorithm: varchar("algorithm", { length: 50 }).notNull().default("exponential_smoothing"),
  metadata: jsonb("metadata"),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("forecast_snapshots_user_id_idx").on(table.userId),
  projectIdIdx: index("forecast_snapshots_project_id_idx").on(table.projectId),
  granularityIdx: index("forecast_snapshots_granularity_idx").on(table.granularity),
}));

// Hyper Follow Pages table
export const hyperFollowPages = pgTable("hyper_follow_pages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  imageUrl: varchar("image_url", { length: 500 }),
  links: jsonb("links"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DEPRECATED: Studio Projects table - Merged into unified "projects" table
// DO NOT USE - Kept for reference only, all new projects use unified "projects" table
// export const studioProjects = pgTable("studio_projects", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   userId: varchar("user_id", { length: 255 }).notNull(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   bpm: integer("bpm").default(120),
//   timeSignature: varchar("time_signature", { length: 10 }).default("4/4"),
//   key: varchar("key", { length: 10 }).default("C"),
//   sampleRate: integer("sample_rate").default(48000),
//   bitDepth: integer("bit_depth").default(24),
//   masterVolume: real("master_volume").default(0.8),
//   masterGain: real("master_gain").default(0),
//   projectLength: integer("project_length").default(0),
//   loopStart: integer("loop_start").default(0),
//   loopEnd: integer("loop_end").default(0),
//   isLooping: boolean("is_looping").default(false),
//   isPublic: boolean("is_public").default(false),
//   collaborators: jsonb("collaborators").default(sql`'[]'::json`),
//   lastPlayPosition: integer("last_play_position").default(0),
//   totalTracks: integer("total_tracks").default(0),
//   status: varchar("status", { length: 50 }).default("draft"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// }, (table) => ({
//   userIdIdx: index("studio_projects_user_id_idx").on(table.userId),
//   statusIdx: index("studio_projects_status_idx").on(table.status),
//   createdAtIdx: index("studio_projects_created_at_idx").on(table.createdAt),
// }));

// Studio Tracks table - References unified projects table
export const studioTracks = pgTable("studio_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  trackNumber: integer("track_number").notNull(),
  trackType: varchar("track_type", { length: 50 }).notNull().default("audio"),
  inputChannel: integer("input_channel").default(1),
  outputBus: varchar("output_bus", { length: 50 }).default("master"),
  volume: real("volume").default(0.8),
  pan: real("pan").default(0),
  mute: boolean("mute").default(false),
  solo: boolean("solo").default(false),
  armed: boolean("armed").default(false),
  effects: jsonb("effects"),
  sends: jsonb("sends"),
  color: varchar("color", { length: 50 }),
  height: integer("height").default(100),
  collapsed: boolean("collapsed").default(false),
  inputMonitoring: boolean("input_monitoring").default(false),
  recordEnabled: boolean("record_enabled").default(false),
  frozen: boolean("frozen").default(false),
  frozenFilePath: text("frozen_file_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdIdx: index("studio_tracks_project_id_idx").on(table.projectId),
  trackNumberIdx: index("studio_tracks_track_number_idx").on(table.trackNumber),
}));

// Audio Clips table
export const audioClips = pgTable("audio_clips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: varchar("track_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  originalFilename: varchar("original_filename", { length: 255 }),
  fileSize: bigint("file_size", { mode: "number" }),
  duration: real("duration").notNull(),
  sampleRate: integer("sample_rate"),
  channels: integer("channels"),
  startTime: real("start_time").notNull(),
  endTime: real("end_time").notNull(),
  offset: real("offset").default(0),
  gain: real("gain").default(0),
  fadeIn: real("fade_in").default(0),
  fadeOut: real("fade_out").default(0),
  reversed: boolean("reversed").default(false),
  timeStretch: real("time_stretch").default(1.0),
  pitchShift: real("pitch_shift").default(0),
  preserveFormants: boolean("preserve_formants").default(true),
  waveformData: jsonb("waveform_data"),
  peakData: jsonb("peak_data"),
  takeNumber: integer("take_number").default(1),
  takeGroupId: varchar("take_group_id", { length: 255 }),
  isComped: boolean("is_comped").default(false),
  compSourceIds: jsonb("comp_source_ids"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  trackIdIdx: index("audio_clips_track_id_idx").on(table.trackId),
  takeGroupIdIdx: index("audio_clips_take_group_id_idx").on(table.takeGroupId),
}));

// MIDI Clips table
export const midiClips = pgTable("midi_clips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: varchar("track_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  startTime: real("start_time").notNull(),
  endTime: real("end_time").notNull(),
  notes: jsonb("notes").notNull(),
  velocity: integer("velocity").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// Virtual Instruments table
export const virtualInstruments = pgTable("virtual_instruments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: varchar("track_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  pluginId: varchar("plugin_id", { length: 100 }).notNull(),
  preset: varchar("preset", { length: 255 }),
  parameters: jsonb("parameters"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audio Effects table
export const audioEffects = pgTable("audio_effects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: varchar("track_id"),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  pluginId: varchar("plugin_id", { length: 100 }),
  chainPosition: integer("chain_position").default(0),
  bypass: boolean("bypass").default(false),
  parameters: jsonb("parameters"),
  presetName: varchar("preset_name", { length: 255 }),
  wetDryMix: real("wet_dry_mix").default(1.0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mix Busses table - References unified projects table
export const mixBusses = pgTable("mix_busses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }),
  volume: real("volume").default(0.8),
  pan: real("pan").default(0),
  mute: boolean("mute").default(false),
  solo: boolean("solo").default(false),
  effects: jsonb("effects"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Automation Data table - References unified projects table
export const automationData = pgTable("automation_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  trackId: varchar("track_id"),
  parameter: varchar("parameter", { length: 100 }).notNull(),
  parameterType: varchar("parameter_type", { length: 50 }),
  automationPoints: jsonb("automation_points").notNull(),
  curveType: varchar("curve_type", { length: 50 }).default("linear"),
  enabled: boolean("enabled").default(true),
  readMode: varchar("read_mode", { length: 50 }).default("read"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Markers table - References unified projects table
export const markers = pgTable("markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  time: real("time").notNull(),
  position: real("position").notNull(),
  color: varchar("color", { length: 50 }),
  type: varchar("type", { length: 50 }).default("marker"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lyrics table - References unified projects table
export const lyrics = pgTable("lyrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  content: text("content"),
  entries: jsonb("entries").default(sql`'[]'::json`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated Melodies table - AI Music Generation Results
export const generatedMelodies = pgTable("generated_melodies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  sourceType: varchar("source_type", { length: 50 }),
  sourceText: text("source_text"),
  sourceAudioPath: text("source_audio_path"),
  generatedNotes: jsonb("generated_notes").$type<Array<{note: string, octave: number, duration: number, time: number}>>(),
  generatedChords: jsonb("generated_chords").$type<Array<{chord: string, time: number, duration: number}>>(),
  parameters: jsonb("parameters").$type<{
    key: string;
    scale: string;
    tempo: number;
    mood: string;
    genre: string;
  }>(),
  audioFilePath: text("audio_file_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("generated_melodies_project_id_idx").on(table.projectId),
  userIdIdx: index("generated_melodies_user_id_idx").on(table.userId),
}));

// Ad Campaigns table
export const adCampaigns = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  objective: varchar("objective", { length: 100 }).notNull(),
  budget: real("budget").notNull(),
  spent: real("spent").default(0).notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  platforms: jsonb("platforms").notNull(),
  connectedPlatforms: jsonb("connected_platforms"),
  personalAdNetwork: jsonb("personal_ad_network"),
  aiOptimizations: jsonb("ai_optimizations"),
  organicMetrics: jsonb("organic_metrics").$type<{
    posts: Array<{
      platform: string;
      posted: boolean;
      postId?: string;
      metrics: {
        impressions: number;
        engagements: number;
        shares: number;
        clicks: number;
        reach: number;
        engagementRate: number;
      };
      organicBoost: number;
      costSavings: number;
      timestamp: string;
    }>;
    lastUpdated?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("ad_campaigns_user_id_idx").on(table.userId),
  statusIdx: index("ad_campaigns_status_idx").on(table.status),
}));

// Ad Creatives table - Content intake and normalization
export const adCreatives = pgTable("ad_creatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: integer("campaign_id").references(() => adCampaigns.id, { onDelete: "cascade" }),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  rawContent: text("raw_content"),
  normalizedContent: text("normalized_content"),
  assetUrls: text("asset_urls").array().default(sql`ARRAY[]::text[]`),
  platformVariants: jsonb("platform_variants"),
  complianceStatus: varchar("compliance_status", { length: 50 }).notNull().default("pending"),
  complianceIssues: jsonb("compliance_issues"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("ad_creatives_user_id_idx").on(table.userId),
  campaignIdIdx: index("ad_creatives_campaign_id_idx").on(table.campaignId),
  statusIdx: index("ad_creatives_status_idx").on(table.status),
}));

// Ad AI Runs table - Track AI model executions for determinism
export const adAIRuns = pgTable("ad_ai_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creativeId: varchar("creative_id", { length: 255 }).notNull().references(() => adCreatives.id, { onDelete: "cascade" }),
  modelVersion: varchar("model_version", { length: 50 }).notNull(),
  inferenceInputs: jsonb("inference_inputs"),
  inferenceOutputs: jsonb("inference_outputs"),
  executionTime: integer("execution_time"),
  deterministic: boolean("deterministic").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  creativeIdIdx: index("ad_ai_runs_creative_id_idx").on(table.creativeId),
}));

// Ad Campaign Variants table - A/B testing and experiment arms
export const adCampaignVariants = pgTable("ad_campaign_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: integer("campaign_id").notNull().references(() => adCampaigns.id, { onDelete: "cascade" }),
  creativeId: varchar("creative_id", { length: 255 }).references(() => adCreatives.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  variantName: varchar("variant_name", { length: 50 }).notNull(),
  content: jsonb("content"),
  predictedCTR: decimal("predicted_ctr", { precision: 5, scale: 4 }),
  predictedEngagement: decimal("predicted_engagement", { precision: 5, scale: 4 }),
  predictedConversion: decimal("predicted_conversion", { precision: 5, scale: 4 }),
  viralityScore: integer("virality_score"),
  budgetAllocation: decimal("budget_allocation", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  actualMetrics: jsonb("actual_metrics"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  campaignIdIdx: index("ad_campaign_variants_campaign_id_idx").on(table.campaignId),
  platformIdx: index("ad_campaign_variants_platform_idx").on(table.platform),
  statusIdx: index("ad_campaign_variants_status_idx").on(table.status),
}));

// Ad Platform Accounts table - OAuth credentials for platform dispatch
export const adPlatformAccounts = pgTable("ad_platform_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformAccountId: varchar("platform_account_id", { length: 255 }).notNull(),
  oauthTokenId: varchar("oauth_token_id", { length: 255 }),
  adAccountName: varchar("ad_account_name", { length: 255 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("ad_platform_accounts_user_id_idx").on(table.userId),
  platformIdx: index("ad_platform_accounts_platform_idx").on(table.platform),
}));

// Ad Delivery Logs table - Track platform submission status
export const adDeliveryLogs = pgTable("ad_delivery_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  variantId: varchar("variant_id", { length: 255 }).notNull().references(() => adCampaignVariants.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformAdId: varchar("platform_ad_id", { length: 255 }),
  deliveryStatus: varchar("delivery_status", { length: 50 }).notNull(),
  platformResponse: jsonb("platform_response"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  variantIdIdx: index("ad_delivery_logs_variant_id_idx").on(table.variantId),
  platformIdx: index("ad_delivery_logs_platform_idx").on(table.platform),
  statusIdx: index("ad_delivery_logs_status_idx").on(table.deliveryStatus),
}));

// Ad Kill Rules table - Automated performance thresholds
export const adKillRules = pgTable("ad_kill_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: integer("campaign_id").notNull().references(() => adCampaigns.id, { onDelete: "cascade" }),
  ruleType: varchar("rule_type", { length: 50 }).notNull(),
  condition: jsonb("condition").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  pivotStrategy: jsonb("pivot_strategy"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  triggeredCount: integer("triggered_count").default(0),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  campaignIdIdx: index("ad_kill_rules_campaign_id_idx").on(table.campaignId),
  statusIdx: index("ad_kill_rules_status_idx").on(table.status),
}));

// Ad Rule Executions table - Log automated actions
export const adRuleExecutions = pgTable("ad_rule_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id", { length: 255 }).notNull().references(() => adKillRules.id),
  variantId: varchar("variant_id", { length: 255 }).references(() => adCampaignVariants.id),
  triggerReason: text("trigger_reason").notNull(),
  actionTaken: varchar("action_taken", { length: 50 }).notNull(),
  metricsSnapshot: jsonb("metrics_snapshot"),
  learnings: text("learnings"),
  executedAt: timestamp("executed_at").defaultNow(),
}, (table) => ({
  ruleIdIdx: index("ad_rule_executions_rule_id_idx").on(table.ruleId),
  variantIdIdx: index("ad_rule_executions_variant_id_idx").on(table.variantId),
}));

// Ad Insights table - AI-generated advertising insights and recommendations
export const adInsights = pgTable("ad_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  recommendations: jsonb("recommendations").$type<Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
  }>>().notNull(),
  performancePredictions: jsonb("performance_predictions").$type<{
    expectedReach: number;
    expectedEngagement: number;
    viralPotential: number;
  }>(),
  audienceInsights: jsonb("audience_insights").$type<{
    topInterests: string[];
    bestPostingTimes: string[];
    optimalPlatforms: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("ad_insights_user_id_idx").on(table.userId),
  createdAtIdx: index("ad_insights_created_at_idx").on(table.createdAt),
}));

// Distribution & Marketplace Tables

// Distribution Packages for DSP metadata export
export const distributionPackages = pgTable("distribution_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  upc: varchar("upc", { length: 20 }),
  albumTitle: varchar("album_title", { length: 255 }),
  releaseDate: timestamp("release_date"),
  label: varchar("label", { length: 255 }),
  artworkUrl: text("artwork_url"),
  copyrightP: varchar("copyright_p", { length: 255 }),
  copyrightC: varchar("copyright_c", { length: 255 }),
  status: varchar("status", { length: 50 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdIdx: index("distribution_packages_project_id_idx").on(table.projectId),
  userIdIdx: index("distribution_packages_user_id_idx").on(table.userId),
  statusIdx: index("distribution_packages_status_idx").on(table.status),
  userStatusCreatedIdx: index("distribution_packages_user_status_created_idx").on(table.userId, table.status, table.createdAt),
}));

// Distribution Tracks for package metadata
export const distributionTracks = pgTable("distribution_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id", { length: 255 }).references(() => distributionPackages.id, { onDelete: 'cascade' }),
  trackId: varchar("track_id", { length: 255 }).references(() => studioTracks.id),
  isrc: varchar("isrc", { length: 20 }),
  trackNumber: integer("track_number"),
  title: varchar("title", { length: 255 }),
  artist: varchar("artist", { length: 255 }),
  genre: varchar("genre", { length: 100 }),
  explicitContent: boolean("explicit_content").default(false),
  lyrics: text("lyrics"),
  credits: text("credits"),
  duration: integer("duration"),
}, (table) => ({
  packageIdIdx: index("distribution_tracks_package_id_idx").on(table.packageId),
  trackIdIdx: index("distribution_tracks_track_id_idx").on(table.trackId),
}));

// Beat Marketplace Listings
export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  licenseType: varchar("license_type", { length: 50 }).notNull(),
  exclusiveStock: integer("exclusive_stock").default(1),
  previewUrl: text("preview_url"),
  downloadUrl: text("download_url"),
  coverArtUrl: text("cover_art_url"),
  isPublished: boolean("is_published").default(false),
  tags: jsonb("tags"),
  metadata: jsonb("metadata"),
  playCount: integer("play_count").default(0),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ownerIdIdx: index("listings_owner_id_idx").on(table.ownerId),
  isPublishedIdx: index("listings_is_published_idx").on(table.isPublished),
  createdAtIdx: index("listings_created_at_idx").on(table.createdAt),
  ownerPublishedIdx: index("listings_owner_published_idx").on(table.ownerId, table.isPublished),
}));

// Likes for Listings
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userListingIdx: index("likes_user_listing_idx").on(table.userId, table.listingId),
  uniqueUserListing: index("likes_unique_user_listing").on(table.userId, table.listingId),
}));

// Royalty Splits for Listings
export const royaltySplits = pgTable("royalty_splits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  recipientId: varchar("recipient_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  kind: varchar("kind", { length: 32 }).default("sale"),
});

// Orders for Beat Purchases
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").references(() => users.id, { onDelete: 'set null' }),
  sellerId: varchar("seller_id").references(() => users.id, { onDelete: 'set null' }),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: 'set null' }),
  licenseType: varchar("license_type", { length: 50 }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  status: varchar("status", { length: 50 }).default("pending"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  licenseDocumentUrl: text("license_document_url"),
  downloadUrl: text("download_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  buyerIdIdx: index("orders_buyer_id_idx").on(table.buyerId),
  sellerIdIdx: index("orders_seller_id_idx").on(table.sellerId),
  listingIdIdx: index("orders_listing_id_idx").on(table.listingId),
  statusIdx: index("orders_status_idx").on(table.status),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
}));

// Payout Events (Stripe Connect)
export const payoutEvents = pgTable("payout_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: 'cascade' }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  type: varchar("type", { length: 50 }).notNull(),
  stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("initiated"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Distribution Releases (DistroKid-style)
export const distroReleases = pgTable("distro_releases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  upc: varchar("upc", { length: 32 }),
  releaseDate: timestamp("release_date"),
  coverArtUrl: text("cover_art_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Distribution Tracks
export const distroTracks = pgTable("distro_tracks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  releaseId: uuid("release_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  isrc: varchar("isrc", { length: 32 }),
  audioUrl: text("audio_url"),
  metadata: jsonb("metadata"),
  trackNumber: integer("track_number"),
});

// DSP Providers (Spotify, Apple Music, etc.)
export const distroProviders = pgTable("distro_providers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  apiBase: text("api_base"),
  authType: varchar("auth_type", { length: 32 }),
  deliveryMethod: varchar("delivery_method", { length: 32 }).default("api"),
  processingTime: varchar("processing_time", { length: 64 }),
  region: varchar("region", { length: 64 }).default("global"),
  category: varchar("category", { length: 32 }).default("streaming"),
  requirements: jsonb("requirements").$type<{
    isrc?: boolean;
    upc?: boolean;
    metadata?: string[];
    audioFormats?: string[];
  }>(),
  status: varchar("status", { length: 32 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Distribution Dispatch Status
export const distroDispatch = pgTable("distro_dispatch", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  releaseId: uuid("release_id").notNull(),
  providerId: uuid("provider_id").notNull(),
  status: varchar("status", { length: 50 }).default("queued"),
  externalId: varchar("external_id", { length: 255 }),
  logs: text("logs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Upload Sessions for chunked uploads (500MB+ files)
export const uploadSessions = pgTable("upload_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 512 }).notNull(),
  totalSize: bigint("total_size", { mode: "number" }).notNull(),
  chunkSize: integer("chunk_size").notNull().default(5242880),
  totalChunks: integer("total_chunks").notNull(),
  uploadedChunks: integer("uploaded_chunks").notNull().default(0),
  chunks: jsonb("chunks").$type<{index: number, hash: string, offset: number, size: number}[]>().notNull().default(sql`'[]'::jsonb`),
  fileHash: varchar("file_hash", { length: 64 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  finalPath: text("final_path"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("upload_sessions_user_id_idx").on(table.userId),
  statusIdx: index("upload_sessions_status_idx").on(table.status),
  createdAtIdx: index("upload_sessions_created_at_idx").on(table.createdAt),
}));

// ISRC Registry for deterministic code generation
export const isrcRegistry = pgTable("isrc_registry", {
  id: serial("id").primaryKey(),
  isrc: varchar("isrc", { length: 12 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  trackId: uuid("track_id").references(() => distroTracks.id),
  registrantCode: varchar("registrant_code", { length: 5 }).notNull(),
  yearCode: varchar("year_code", { length: 2 }).notNull(),
  designation: varchar("designation", { length: 5 }).notNull(),
  metadataHash: varchar("metadata_hash", { length: 64 }).notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
}, (table) => ({
  isrcIdx: index("isrc_registry_isrc_idx").on(table.isrc),
  userIdIdx: index("isrc_registry_user_id_idx").on(table.userId),
  trackIdIdx: index("isrc_registry_track_id_idx").on(table.trackId),
}));

// UPC Registry for album/release codes
export const upcRegistry = pgTable("upc_registry", {
  id: serial("id").primaryKey(),
  upc: varchar("upc", { length: 12 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  releaseId: uuid("release_id").references(() => distroReleases.id),
  prefix: varchar("prefix", { length: 6 }).notNull(),
  itemReference: varchar("item_reference", { length: 5 }).notNull(),
  checkDigit: varchar("check_digit", { length: 1 }).notNull(),
  metadataHash: varchar("metadata_hash", { length: 64 }).notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
}, (table) => ({
  upcIdx: index("upc_registry_upc_idx").on(table.upc),
  userIdIdx: index("upc_registry_user_id_idx").on(table.userId),
  releaseIdIdx: index("upc_registry_release_id_idx").on(table.releaseId),
}));

// Webhook Events
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(),
  eventType: varchar("event_type", { length: 128 }).notNull(),
  raw: jsonb("raw").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// JWT Token System
export const jwtTokens = pgTable("jwt_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  revoked: boolean("revoked").notNull().default(false),
}, (table) => ({
  userIdIdx: index("jwt_tokens_user_id_idx").on(table.userId),
  expiresAtIdx: index("jwt_tokens_expires_at_idx").on(table.expiresAt),
}));

export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  revoked: boolean("revoked").notNull().default(false),
}, (table) => ({
  userIdIdx: index("refresh_tokens_user_id_idx").on(table.userId),
  tokenIdx: index("refresh_tokens_token_idx").on(table.token),
  expiresAtIdx: index("refresh_tokens_expires_at_idx").on(table.expiresAt),
}));

export const tokenRevocations = pgTable("token_revocations", {
  id: serial("id").primaryKey(),
  tokenId: varchar("token_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reason: varchar("reason", { length: 255 }),
  revokedAt: timestamp("revoked_at").notNull().defaultNow(),
}, (table) => ({
  tokenIdIdx: index("token_revocations_token_id_idx").on(table.tokenId),
  userIdIdx: index("token_revocations_user_id_idx").on(table.userId),
}));

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  allowed: boolean("allowed").notNull().default(true),
}, (table) => ({
  roleResourceActionIdx: index("permissions_role_resource_action_idx").on(table.role, table.resource, table.action),
}));

// Webhook Reliability
export const webhookAttempts = pgTable("webhook_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookEventId: integer("webhook_event_id").notNull().references(() => webhookEvents.id),
  attempt: integer("attempt").notNull().default(1),
  status: varchar("status", { length: 20 }).notNull(),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  error: text("error"),
  url: text("url").notNull(),
  payload: jsonb("payload").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
  nextRetryAt: timestamp("next_retry_at"),
}, (table) => ({
  webhookEventIdIdx: index("webhook_attempts_webhook_event_id_idx").on(table.webhookEventId),
  statusIdx: index("webhook_attempts_status_idx").on(table.status),
  nextRetryAtIdx: index("webhook_attempts_next_retry_at_idx").on(table.nextRetryAt),
}));

export const webhookDeadLetterQueue = pgTable("webhook_dead_letter_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookEventId: integer("webhook_event_id").notNull().references(() => webhookEvents.id),
  attempts: integer("attempts").notNull(),
  lastError: text("last_error").notNull(),
  payload: jsonb("payload").notNull(),
  enqueuedAt: timestamp("enqueued_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  status: varchar("status", { length: 20 }).notNull().default("queued"),
}, (table) => ({
  webhookEventIdIdx: index("webhook_dlq_webhook_event_id_idx").on(table.webhookEventId),
  statusIdx: index("webhook_dlq_status_idx").on(table.status),
  enqueuedAtIdx: index("webhook_dlq_enqueued_at_idx").on(table.enqueuedAt),
}));

// Centralized Logging
export const logEvents = pgTable("log_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: varchar("level", { length: 20 }).notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  message: text("message").notNull(),
  userId: varchar("user_id").references(() => users.id),
  context: jsonb("context"),
  stackTrace: text("stack_trace"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  levelIdx: index("log_events_level_idx").on(table.level),
  serviceIdx: index("log_events_service_idx").on(table.service),
  userIdIdx: index("log_events_user_id_idx").on(table.userId),
  timestampIdx: index("log_events_timestamp_idx").on(table.timestamp),
  levelServiceIdx: index("log_events_level_service_idx").on(table.level, table.service),
}));

// Platform Settings
export const platformSettings = pgTable("platform_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  platformFeePercent: decimal("platform_fee_percent", { precision: 5, scale: 2 }).default("10.00"),
  currency: varchar("currency", { length: 10 }).default("usd"),
});

// Social & Advertising AI Tables

// Social Providers
export const socialProviders = pgTable("social_providers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 32 }).notNull(),
  name: varchar("name", { length: 64 }).notNull(),
});

// Social Accounts (OAuth connections)
export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  platform: varchar("platform").notNull(),
  accountId: varchar("account_id", { length: 256 }).notNull(),
  username: varchar("username", { length: 256 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Campaigns
export const socialCampaigns = pgTable("social_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  prompt: text("prompt").notNull(),
  brandConstraints: jsonb("brand_constraints"),
  objectives: jsonb("objectives"),
  platforms: jsonb("platforms").notNull(),
  status: varchar("status", { length: 32 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("social_campaigns_user_id_idx").on(table.userId),
  statusIdx: index("social_campaigns_status_idx").on(table.status),
  userStatusCreatedIdx: index("social_campaigns_user_status_created_idx").on(table.userId, table.status, table.createdAt),
}));

// A/B Test Variants
export const variants = pgTable("variants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  platform: varchar("platform", { length: 32 }).notNull(),
  title: varchar("title", { length: 256 }),
  body: text("body").notNull(),
  media: jsonb("media"),
  aiMeta: jsonb("ai_meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posting Schedules
export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  platform: varchar("platform", { length: 32 }).notNull(),
  socialAccountId: uuid("social_account_id").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  cadenceCron: varchar("cadence_cron", { length: 64 }),
  timezone: varchar("timezone", { length: 64 }).default("UTC"),
  enabled: boolean("enabled").default(true),
  useOptimizer: boolean("use_optimizer").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Published Posts
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  scheduleId: uuid("schedule_id"),
  platform: varchar("platform", { length: 32 }).notNull(),
  socialAccountId: uuid("social_account_id").notNull(),
  variantId: uuid("variant_id"),
  status: varchar("status", { length: 32 }).default("scheduled"),
  externalPostId: varchar("external_post_id", { length: 256 }),
  error: text("error"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  campaignIdIdx: index("posts_campaign_id_idx").on(table.campaignId),
  platformIdx: index("posts_platform_idx").on(table.platform),
  statusIdx: index("posts_status_idx").on(table.status),
  socialAccountIdIdx: index("posts_social_account_id_idx").on(table.socialAccountId),
  campaignPlatformScheduledIdx: index("posts_campaign_platform_scheduled_idx").on(table.campaignId, table.platform, table.scheduledAt),
  socialAccountStatusIdx: index("posts_social_account_status_idx").on(table.socialAccountId, table.status),
}));

// Social Metrics
export const socialMetrics = pgTable("social_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  variantId: uuid("variant_id"),
  platform: varchar("platform", { length: 32 }).notNull(),
  metricAt: timestamp("metric_at").defaultNow(),
  impressions: integer("impressions").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  clicks: integer("clicks").default(0),
});

// A/B Test Optimizer State
export const optimizerState = pgTable("optimizer_state", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  platform: varchar("platform", { length: 32 }).notNull(),
  state: jsonb("state"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security & Infrastructure Tables

// RBAC Roles
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  permissions: jsonb("permissions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Role Assignments
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: uuid("role_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  statusCode: integer("status_code").default(200),
  ip: text("ip"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  hash: text("hash").notNull(),
  prevHash: text("prev_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Checks
export const healthChecks = pgTable("health_checks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  service: text("service").notNull(),
  region: text("region").default("global"),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms").default(0),
  error: text("error"),
  checkedAt: timestamp("checked_at").defaultNow(),
});

// Incidents
export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open"),
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  createdBy: text("created_by"),
  meta: jsonb("meta"),
});

// Security Findings
export const securityFindings = pgTable("security_findings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  component: text("component").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  cve: text("cve"),
  status: text("status").default("open"),
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata"),
});

// Auto-Patch Registry
export const patches = pgTable("patches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  version: text("version").notNull(),
  scriptPath: text("script_path").notNull(),
  checksum: text("checksum").notNull(),
  status: text("status").default("pending"),
  appliedAt: timestamp("applied_at"),
  metadata: jsonb("metadata"),
});

// System Flags (Feature Toggles)
export const systemFlags = pgTable("system_flags", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// IP Blacklist for security threat mitigation
export const ipBlacklist = pgTable("ip_blacklist", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: varchar("ip_address", { length: 50 }).notNull().unique(),
  reason: text("reason").notNull(),
  threatType: varchar("threat_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  blockedAt: timestamp("blocked_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  permanent: boolean("permanent").default(false),
  metadata: jsonb("metadata"),
}, (table) => ({
  ipAddressIdx: index("ip_blacklist_ip_address_idx").on(table.ipAddress),
  expiresAtIdx: index("ip_blacklist_expires_at_idx").on(table.expiresAt),
}));

// Security Threat History for tracking all detected threats
export const securityThreats = pgTable("security_threats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  threatType: varchar("threat_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  source: varchar("source", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userId: varchar("user_id", { length: 255 }),
  requestPath: varchar("request_path", { length: 500 }),
  requestMethod: varchar("request_method", { length: 10 }),
  details: text("details").notNull(),
  blocked: boolean("blocked").default(false),
  healed: boolean("healed").default(false),
  healingStatus: varchar("healing_status", { length: 50 }),
  healingDuration: integer("healing_duration"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  healedAt: timestamp("healed_at"),
  metadata: jsonb("metadata"),
}, (table) => ({
  threatTypeIdx: index("security_threats_threat_type_idx").on(table.threatType),
  severityIdx: index("security_threats_severity_idx").on(table.severity),
  ipAddressIdx: index("security_threats_ip_address_idx").on(table.ipAddress),
  detectedAtIdx: index("security_threats_detected_at_idx").on(table.detectedAt),
}));

// AI Music Suite Additions

// Audio Assets
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  ownerId: varchar("owner_id").notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  mime: varchar("mime", { length: 128 }).notNull(),
  bytes: integer("bytes").notNull(),
  storageUri: text("storage_uri").notNull(),
  waveformJson: jsonb("waveform_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timeline Clips
export const clips = pgTable("clips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: uuid("track_id").notNull(),
  assetId: uuid("asset_id").notNull(),
  startSec: decimal("start_sec", { precision: 12, scale: 4 }).notNull(),
  durationSec: decimal("duration_sec", { precision: 12, scale: 4 }).notNull(),
  offsetSec: decimal("offset_sec", { precision: 12, scale: 4 }).default("0"),
  gainDb: decimal("gain_db", { precision: 6, scale: 2 }).default("0"),
  fadeInSec: decimal("fade_in_sec", { precision: 6, scale: 3 }).default("0"),
  fadeOutSec: decimal("fade_out_sec", { precision: 6, scale: 3 }).default("0"),
  meta: jsonb("meta"),
});

// Plugin Catalog
export const pluginCatalog = pgTable("plugin_catalog", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 128 }).unique().notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  version: varchar("version", { length: 32 }).default("1.0.0"),
  manifest: jsonb("manifest").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Plugin Instances
export const pluginInstances = pgTable("plugin_instances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  trackId: uuid("track_id"),
  catalogId: uuid("catalog_id").notNull(),
  index: integer("index").notNull(),
  params: jsonb("params"),
  bypassed: boolean("bypassed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Jobs (Mixing/Mastering)
export const aiJobs = pgTable("ai_jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  status: varchar("status", { length: 32 }).default("queued"),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// User Asset Management (Samples, Plugins, etc.)
// ============================================================================

// Asset Folders - For organizing user assets
export const assetFolders = pgTable("asset_folders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: uuid("parent_id"),
  name: varchar("name", { length: 255 }).notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("asset_folders_user_id_idx").on(table.userId),
  parentIdIdx: index("asset_folders_parent_id_idx").on(table.parentId),
  userPathIdx: index("asset_folders_user_path_idx").on(table.userId, table.path),
}));

// User Assets - Audio samples, plugins, loops, etc.
export const userAssets = pgTable("user_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  folderId: uuid("folder_id").references(() => assetFolders.id, { onDelete: 'set null' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'set null' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  assetType: varchar("asset_type", { length: 50 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  filePath: text("file_path").notNull(),
  fileSize: bigint("file_size", { mode: 'number' }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  duration: real("duration"),
  sampleRate: integer("sample_rate"),
  bitDepth: integer("bit_depth"),
  channels: integer("channels"),
  bpm: integer("bpm"),
  key: varchar("key", { length: 10 }),
  waveformData: jsonb("waveform_data"),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").default(false),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_assets_user_id_idx").on(table.userId),
  folderIdIdx: index("user_assets_folder_id_idx").on(table.folderId),
  projectIdIdx: index("user_assets_project_id_idx").on(table.projectId),
  assetTypeIdx: index("user_assets_asset_type_idx").on(table.assetType),
  userAssetTypeIdx: index("user_assets_user_asset_type_idx").on(table.userId, table.assetType),
  createdAtIdx: index("user_assets_created_at_idx").on(table.createdAt),
}));

// Asset Tags - For categorizing and searching assets
export const assetTags = pgTable("asset_tags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: uuid("asset_id").notNull().references(() => userAssets.id, { onDelete: 'cascade' }),
  tag: varchar("tag", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  assetIdIdx: index("asset_tags_asset_id_idx").on(table.assetId),
  tagIdx: index("asset_tags_tag_idx").on(table.tag),
  assetTagIdx: index("asset_tags_asset_tag_idx").on(table.assetId, table.tag),
}));

// Project Autosaves
export const autosaves = pgTable("autosaves", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  authorId: varchar("author_id").notNull(),
  label: varchar("label", { length: 128 }).default("autosave"),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export Jobs
export const exportJobs = pgTable("export_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull(),
  exportType: varchar("export_type", { length: 32 }).notNull(),
  format: varchar("format", { length: 16 }).notNull(),
  sampleRate: integer("sample_rate").notNull(),
  bitDepth: integer("bit_depth").notNull(),
  quality: varchar("quality", { length: 16 }),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  progress: integer("progress").default(0).notNull(),
  filePath: varchar("file_path", { length: 500 }),
  options: jsonb("options"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  projectIdIdx: index("export_jobs_project_id_idx").on(table.projectId),
  userIdIdx: index("export_jobs_user_id_idx").on(table.userId),
  statusIdx: index("export_jobs_status_idx").on(table.status),
}));

// Studio Audio Conversions
export const studioConversions = pgTable("studio_conversions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id),
  sourceFilePath: text("source_file_path").notNull(),
  targetFormat: varchar("target_format", { length: 16 }).notNull(),
  qualityPreset: varchar("quality_preset", { length: 16 }).notNull(),
  bitrate: integer("bitrate"),
  sampleRate: integer("sample_rate"),
  outputFilePath: text("output_file_path"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  progress: integer("progress").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  projectIdIdx: index("studio_conversions_project_id_idx").on(table.projectId),
  userIdIdx: index("studio_conversions_user_id_idx").on(table.userId),
  statusIdx: index("studio_conversions_status_idx").on(table.status),
}));

// Project Members (Collaboration)
export const projectMembers = pgTable("project_members", {
  projectId: uuid("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role", { length: 32 }).default("editor"),
});

// ============================================================================
// CRDT Collaborative Editing with Yjs
// ============================================================================

// Collaborative editing sessions - Track active users in real-time
export const studioCollabSessions = pgTable("studio_collab_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id),
  awarenessState: jsonb("awareness_state"), // Yjs awareness state (cursor, selection, etc.)
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  projectIdIdx: index("studio_collab_sessions_project_id_idx").on(table.projectId),
  userIdIdx: index("studio_collab_sessions_user_id_idx").on(table.userId),
}));

// Periodic Yjs document snapshots for crash recovery
export const studioCollabSnapshots = pgTable("studio_collab_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  documentState: text("document_state"), // Binary Yjs state vector (base64 encoded)
  snapshotHash: varchar("snapshot_hash", { length: 255 }), // For version comparison
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  projectIdIdx: index("studio_collab_snapshots_project_id_idx").on(table.projectId),
  createdAtIdx: index("studio_collab_snapshots_created_at_idx").on(table.createdAt),
}));

// Project collaborators and permissions
export const projectCollaborators = pgTable("project_collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id),
  role: varchar("role", { length: 50 }).default("viewer"), // owner, editor, viewer
  invitedBy: varchar("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  projectIdIdx: index("project_collaborators_project_id_idx").on(table.projectId),
  userIdIdx: index("project_collaborators_user_id_idx").on(table.userId),
  projectUserIdx: index("project_collaborators_project_user_idx").on(table.projectId, table.userId),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Social Media Suite
// ============================================================================

// Content Calendar - Visual calendar for scheduling posts
export const contentCalendar = pgTable("content_calendar", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  platforms: jsonb("platforms").notNull(), // ['facebook', 'instagram', 'twitter', etc]
  status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, scheduled, published, failed
  postType: varchar("post_type", { length: 50 }).notNull(), // post, story, reel, video
  content: text("content"),
  mediaUrls: jsonb("media_urls"),
  hashtags: jsonb("hashtags"),
  mentions: jsonb("mentions"),
  location: varchar("location", { length: 255 }),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("content_calendar_user_id_idx").on(table.userId),
  scheduledForIdx: index("content_calendar_scheduled_for_idx").on(table.scheduledFor),
  statusIdx: index("content_calendar_status_idx").on(table.status),
}));

// Unified Inbox - Aggregated messages from all social platforms
export const unifiedInboxMessages = pgTable("unified_inbox_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, instagram, twitter, etc
  messageType: varchar("message_type", { length: 50 }).notNull(), // dm, comment, mention, reply
  externalId: varchar("external_id", { length: 255 }), // Platform's message ID
  fromUsername: varchar("from_username", { length: 255 }),
  fromDisplayName: varchar("from_display_name", { length: 255 }),
  content: text("content").notNull(),
  postUrl: varchar("post_url", { length: 500 }),
  isRead: boolean("is_read").default(false),
  isReplied: boolean("is_replied").default(false),
  replyText: text("reply_text"),
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
  priority: varchar("priority", { length: 20 }).default("normal"), // high, normal, low
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("unified_inbox_user_id_idx").on(table.userId),
  platformIdx: index("unified_inbox_platform_idx").on(table.platform),
  isReadIdx: index("unified_inbox_is_read_idx").on(table.isRead),
  receivedAtIdx: index("unified_inbox_received_at_idx").on(table.receivedAt),
  userPlatformIdx: index("unified_inbox_user_platform_idx").on(table.userId, table.platform),
}));

// Best Posting Times - AI-calculated optimal posting times
export const bestPostingTimes = pgTable("best_posting_times", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  hour: integer("hour").notNull(), // 0-23
  engagementScore: real("engagement_score").notNull(), // 0-100
  sampleSize: integer("sample_size").notNull(), // Number of posts analyzed
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("best_posting_times_user_id_idx").on(table.userId),
  platformIdx: index("best_posting_times_platform_idx").on(table.platform),
  userPlatformIdx: index("best_posting_times_user_platform_idx").on(table.userId, table.platform),
}));

// Hashtag Research - AI-suggested hashtags with performance metrics
export const hashtagResearch = pgTable("hashtag_research", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  hashtag: varchar("hashtag", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }),
  popularity: real("popularity"), // 0-100
  competition: real("competition"), // 0-100 (low = easier to rank)
  avgEngagement: real("avg_engagement"),
  trending: boolean("trending").default(false),
  relatedTags: jsonb("related_tags"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("hashtag_research_user_id_idx").on(table.userId),
  hashtagIdx: index("hashtag_research_hashtag_idx").on(table.hashtag),
  platformIdx: index("hashtag_research_platform_idx").on(table.platform),
  trendingIdx: index("hashtag_research_trending_idx").on(table.trending),
}));

// Story Schedules - Scheduling for Stories/Reels/Short-form content
export const storySchedules = pgTable("story_schedules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(), // instagram, facebook, youtube_shorts, tiktok
  storyType: varchar("story_type", { length: 50 }).notNull(), // story, reel, short
  mediaUrl: varchar("media_url", { length: 500 }).notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(), // image, video
  duration: integer("duration"), // seconds (for videos)
  caption: text("caption"),
  stickers: jsonb("stickers"), // location, poll, question, etc
  scheduledFor: timestamp("scheduled_for").notNull(),
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, published, failed
  publishedAt: timestamp("published_at"),
  externalId: varchar("external_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("story_schedules_user_id_idx").on(table.userId),
  platformIdx: index("story_schedules_platform_idx").on(table.platform),
  scheduledForIdx: index("story_schedules_scheduled_for_idx").on(table.scheduledFor),
  statusIdx: index("story_schedules_status_idx").on(table.status),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Marketplace Pro
// ============================================================================

// Listing Stems - Individual track stems for sale
export const listingStems = pgTable("listing_stems", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  stemName: varchar("stem_name", { length: 255 }).notNull(), // "Drums", "Bass", "Vocals", etc
  stemType: varchar("stem_type", { length: 50 }).notNull(), // drums, bass, melody, vocals, fx, etc
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileSize: bigint("file_size", { mode: 'number' }).notNull(),
  format: varchar("format", { length: 20 }).notNull(), // wav, mp3, flac
  sampleRate: integer("sample_rate"),
  bitDepth: integer("bit_depth"),
  price: decimal("price", { precision: 10, scale: 2 }), // Optional individual stem price
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  listingIdIdx: index("listing_stems_listing_id_idx").on(table.listingId),
  stemTypeIdx: index("listing_stems_stem_type_idx").on(table.stemType),
}));

// License Templates - Customizable license agreements
export const licenseTemplates = pgTable("license_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  licenseType: varchar("license_type", { length: 50 }).notNull(), // basic, premium, exclusive, custom
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  usageRights: jsonb("usage_rights").notNull(), // {commercial: bool, streaming: bool, radio: bool, etc}
  distributionLimit: integer("distribution_limit"), // Max copies/streams (null = unlimited)
  monetizationAllowed: boolean("monetization_allowed").default(true),
  creditRequired: boolean("credit_required").default(true),
  exclusivity: boolean("exclusivity").default(false),
  royaltySplit: integer("royalty_split"), // Percentage to producer (0-100)
  termsText: text("terms_text").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("license_templates_user_id_idx").on(table.userId),
  licenseTypeIdx: index("license_templates_license_type_idx").on(table.licenseType),
  isActiveIdx: index("license_templates_is_active_idx").on(table.isActive),
}));

// Embeddable Players - Widget configurations for external sites
export const embeddablePlayers = pgTable("embeddable_players", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: 'cascade' }),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  widgetToken: varchar("widget_token", { length: 255 }).notNull().unique(),
  theme: varchar("theme", { length: 50 }).default("dark"), // dark, light, custom
  primaryColor: varchar("primary_color", { length: 20 }).default("#4ade80"),
  showWaveform: boolean("show_waveform").default(true),
  showPurchaseButton: boolean("show_purchase_button").default(true),
  showSocialShare: boolean("show_social_share").default(true),
  autoplay: boolean("autoplay").default(false),
  width: integer("width").default(400),
  height: integer("height").default(200),
  embedCode: text("embed_code"),
  playCount: integer("play_count").default(0),
  clickThroughCount: integer("click_through_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("embeddable_players_user_id_idx").on(table.userId),
  listingIdIdx: index("embeddable_players_listing_id_idx").on(table.listingId),
  widgetTokenIdx: index("embeddable_players_widget_token_idx").on(table.widgetToken),
}));

// Producer Profiles - Enhanced seller profiles
export const producerProfiles = pgTable("producer_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  bannerImageUrl: varchar("banner_image_url", { length: 500 }),
  location: varchar("location", { length: 255 }),
  genres: jsonb("genres"),
  socialLinks: jsonb("social_links"), // {instagram, twitter, youtube, etc}
  verifiedProducer: boolean("verified_producer").default(false),
  totalSales: integer("total_sales").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("producer_profiles_user_id_idx").on(table.userId),
  verifiedIdx: index("producer_profiles_verified_idx").on(table.verifiedProducer),
  featuredIdx: index("producer_profiles_featured_idx").on(table.featured),
}));

// Stem Orders - Track individual stem purchases
export const stemOrders = pgTable("stem_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  stemId: uuid("stem_id").notNull().references(() => listingStems.id, { onDelete: 'cascade' }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  downloadToken: varchar("download_token", { length: 255 }),
  downloadedAt: timestamp("downloaded_at"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index("stem_orders_order_id_idx").on(table.orderId),
  stemIdIdx: index("stem_orders_stem_id_idx").on(table.stemId),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Analytics Intelligence
// ============================================================================

// Playlist Tracking - Track playlist adds/removals across platforms
export const playlistTracking = pgTable("playlist_tracking", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(), // spotify, apple_music, youtube_music, etc
  playlistName: varchar("playlist_name", { length: 255 }).notNull(),
  playlistId: varchar("playlist_id", { length: 255 }), // Platform's playlist ID
  playlistFollowers: integer("playlist_followers"),
  playlistType: varchar("playlist_type", { length: 50 }), // editorial, algorithmic, user
  curatorName: varchar("curator_name", { length: 255 }),
  position: integer("position"), // Position in playlist
  addedDate: timestamp("added_date").notNull(),
  removedDate: timestamp("removed_date"),
  streamsGenerated: integer("streams_generated").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("playlist_tracking_user_id_idx").on(table.userId),
  trackIdIdx: index("playlist_tracking_track_id_idx").on(table.trackId),
  platformIdx: index("playlist_tracking_platform_idx").on(table.platform),
  isActiveIdx: index("playlist_tracking_is_active_idx").on(table.isActive),
  addedDateIdx: index("playlist_tracking_added_date_idx").on(table.addedDate),
}));

// Competitive Analysis - Compare performance to other artists
export const competitiveAnalysis = pgTable("competitive_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitorName: varchar("competitor_name", { length: 255 }).notNull(),
  competitorId: varchar("competitor_id", { length: 255 }), // Platform artist ID
  platform: varchar("platform", { length: 50 }).notNull(),
  monthlyListeners: integer("monthly_listeners"),
  followers: integer("followers"),
  totalStreams: bigint("total_streams", { mode: 'number' }),
  topPlaylistPosition: integer("top_playlist_position"),
  socialMediaFollowing: jsonb("social_media_following"),
  releaseFrequency: real("release_frequency"), // Releases per month
  avgStreamsPerRelease: integer("avg_streams_per_release"),
  benchmarkDate: timestamp("benchmark_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("competitive_analysis_user_id_idx").on(table.userId),
  competitorNameIdx: index("competitive_analysis_competitor_name_idx").on(table.competitorName),
  platformIdx: index("competitive_analysis_platform_idx").on(table.platform),
  benchmarkDateIdx: index("competitive_analysis_benchmark_date_idx").on(table.benchmarkDate),
}));

// Radio Plays - Traditional radio airplay tracking
export const radioPlays = pgTable("radio_plays", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  stationName: varchar("station_name", { length: 255 }).notNull(),
  stationCallSign: varchar("station_call_sign", { length: 50 }),
  stationFormat: varchar("station_format", { length: 100 }), // Top 40, Country, Hip-Hop, etc
  market: varchar("market", { length: 255 }), // City/Region
  marketSize: varchar("market_size", { length: 50 }), // Major, Medium, Small
  estimatedListeners: integer("estimated_listeners"),
  playedAt: timestamp("played_at").notNull(),
  detectionSource: varchar("detection_source", { length: 100 }), // uploaded_log, api, manual
  royaltyGenerated: decimal("royalty_generated", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("radio_plays_user_id_idx").on(table.userId),
  trackIdIdx: index("radio_plays_track_id_idx").on(table.trackId),
  stationNameIdx: index("radio_plays_station_name_idx").on(table.stationName),
  playedAtIdx: index("radio_plays_played_at_idx").on(table.playedAt),
  marketIdx: index("radio_plays_market_idx").on(table.market),
}));

// TikTok Analytics - TikTok-specific performance metrics
export const tiktokAnalytics = pgTable("tiktok_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  soundId: varchar("sound_id", { length: 255 }), // TikTok sound ID
  videoCreations: integer("video_creations").default(0), // Number of videos using the sound
  totalViews: bigint("total_views", { mode: 'number' }).default(sql`0`),
  totalLikes: bigint("total_likes", { mode: 'number' }).default(sql`0`),
  totalShares: integer("total_shares").default(0),
  totalComments: integer("total_comments").default(0),
  trending: boolean("trending").default(false),
  trendingRegions: jsonb("trending_regions"), // Array of country codes
  topCreators: jsonb("top_creators"), // Top users using the sound
  viralityScore: real("virality_score"), // 0-100
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("tiktok_analytics_user_id_idx").on(table.userId),
  trackIdIdx: index("tiktok_analytics_track_id_idx").on(table.trackId),
  trendingIdx: index("tiktok_analytics_trending_idx").on(table.trending),
  snapshotDateIdx: index("tiktok_analytics_snapshot_date_idx").on(table.snapshotDate),
}));

// Demographic Insights - Age, gender, location breakdown
export const demographicInsights = pgTable("demographic_insights", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(),
  ageRange: varchar("age_range", { length: 20 }).notNull(), // 13-17, 18-24, 25-34, etc
  gender: varchar("gender", { length: 20 }), // male, female, non_binary, unknown
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 255 }),
  listeners: integer("listeners").default(0),
  streams: integer("streams").default(0),
  percentage: real("percentage"), // Percentage of total audience
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("demographic_insights_user_id_idx").on(table.userId),
  trackIdIdx: index("demographic_insights_track_id_idx").on(table.trackId),
  platformIdx: index("demographic_insights_platform_idx").on(table.platform),
  countryIdx: index("demographic_insights_country_idx").on(table.country),
  snapshotDateIdx: index("demographic_insights_snapshot_date_idx").on(table.snapshotDate),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Royalties Operations
// ============================================================================

// Split Sheet Documents - Generated PDF split sheets
export const splitSheetDocuments = pgTable("split_sheet_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  documentUrl: varchar("document_url", { length: 500 }),
  status: varchar("status", { length: 50 }).default("draft"), // draft, pending_signatures, completed
  totalSplits: integer("total_splits").notNull(),
  signedCount: integer("signed_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("split_sheet_documents_user_id_idx").on(table.userId),
  projectIdIdx: index("split_sheet_documents_project_id_idx").on(table.projectId),
  statusIdx: index("split_sheet_documents_status_idx").on(table.status),
}));

// Split Sheet Signatures - Digital signatures for split agreements
export const splitSheetSignatures = pgTable("split_sheet_signatures", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: uuid("document_id").notNull().references(() => splitSheetDocuments.id, { onDelete: 'cascade' }),
  collaboratorId: varchar("collaborator_id").references(() => users.id),
  collaboratorEmail: varchar("collaborator_email", { length: 255 }).notNull(),
  collaboratorName: varchar("collaborator_name", { length: 255 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  role: varchar("role", { length: 100 }), // Producer, Writer, Composer, etc
  signatureToken: varchar("signature_token", { length: 255 }).unique(),
  signedAt: timestamp("signed_at"),
  signatureData: text("signature_data"), // Base64 signature image
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, signed, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  documentIdIdx: index("split_sheet_signatures_document_id_idx").on(table.documentId),
  collaboratorIdIdx: index("split_sheet_signatures_collaborator_id_idx").on(table.collaboratorId),
  statusIdx: index("split_sheet_signatures_status_idx").on(table.status),
  signatureTokenIdx: index("split_sheet_signatures_signature_token_idx").on(table.signatureToken),
}));

// PRO Registrations - Track ASCAP, BMI, SESAC registrations
export const proRegistrations = pgTable("pro_registrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  proName: varchar("pro_name", { length: 100 }).notNull(), // ASCAP, BMI, SESAC, PRS, SOCAN, etc
  workId: varchar("work_id", { length: 255 }), // PRO's work registration ID
  iswc: varchar("iswc", { length: 50 }), // International Standard Musical Work Code
  registrationStatus: varchar("registration_status", { length: 50 }).default("pending"), // pending, registered, rejected
  submittedDate: timestamp("submitted_date"),
  approvedDate: timestamp("approved_date"),
  writers: jsonb("writers").notNull(), // Array of {name, ipi, percentage, role}
  publishers: jsonb("publishers"), // Array of {name, ipi, percentage}
  registrationNotes: text("registration_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("pro_registrations_user_id_idx").on(table.userId),
  trackIdIdx: index("pro_registrations_track_id_idx").on(table.trackId),
  proNameIdx: index("pro_registrations_pro_name_idx").on(table.proName),
  workIdIdx: index("pro_registrations_work_id_idx").on(table.workId),
  statusIdx: index("pro_registrations_status_idx").on(table.registrationStatus),
}));

// Territory Royalties - Country/region-specific royalty tracking
export const territoryRoyalties = pgTable("territory_royalties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  territory: varchar("territory", { length: 100 }).notNull(), // Country code or region
  platform: varchar("platform", { length: 50 }).notNull(),
  revenueType: varchar("revenue_type", { length: 50 }).notNull(), // streaming, download, performance, mechanical
  streams: integer("streams").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  reportedDate: timestamp("reported_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("territory_royalties_user_id_idx").on(table.userId),
  trackIdIdx: index("territory_royalties_track_id_idx").on(table.trackId),
  territoryIdx: index("territory_royalties_territory_idx").on(table.territory),
  platformIdx: index("territory_royalties_platform_idx").on(table.platform),
  periodStartIdx: index("territory_royalties_period_start_idx").on(table.periodStart),
}));

// Black Box Royalties - Unclaimed/unmatched royalties tracking
export const blackBoxRoyalties = pgTable("black_box_royalties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  source: varchar("source", { length: 100 }).notNull(), // Platform or PRO
  trackTitle: varchar("track_title", { length: 255 }),
  possibleTrackId: uuid("possible_track_id").references(() => tracks.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  claimStatus: varchar("claim_status", { length: 50 }).default("unclaimed"), // unclaimed, investigating, claimed, disputed
  claimedAt: timestamp("claimed_at"),
  matchConfidence: real("match_confidence"), // 0-100 AI confidence score
  matchReason: text("match_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("black_box_royalties_user_id_idx").on(table.userId),
  sourceIdx: index("black_box_royalties_source_idx").on(table.source),
  claimStatusIdx: index("black_box_royalties_claim_status_idx").on(table.claimStatus),
  possibleTrackIdIdx: index("black_box_royalties_possible_track_id_idx").on(table.possibleTrackId),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Distribution Enhancements
// ============================================================================

// Pre-Release Analytics - Track pre-saves and pre-orders
export const preReleaseAnalytics = pgTable("pre_release_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  releaseId: uuid("release_id").notNull().references(() => distroReleases.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(), // spotify, apple_music, etc
  preSaves: integer("pre_saves").default(0),
  preOrders: integer("pre_orders").default(0),
  emailCaptures: integer("email_captures").default(0),
  socialShares: integer("social_shares").default(0),
  referralSource: varchar("referral_source", { length: 255 }),
  country: varchar("country", { length: 100 }),
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  releaseIdIdx: index("pre_release_analytics_release_id_idx").on(table.releaseId),
  userIdIdx: index("pre_release_analytics_user_id_idx").on(table.userId),
  platformIdx: index("pre_release_analytics_platform_idx").on(table.platform),
  snapshotDateIdx: index("pre_release_analytics_snapshot_date_idx").on(table.snapshotDate),
}));

// Territory Release Dates - Country-specific release scheduling
export const territoryReleaseDates = pgTable("territory_release_dates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  releaseId: uuid("release_id").notNull().references(() => distroReleases.id, { onDelete: 'cascade' }),
  territory: varchar("territory", { length: 100 }).notNull(), // Country code or region
  releaseDate: timestamp("release_date").notNull(),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  releasedAt: timestamp("released_at"),
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, released, delayed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  releaseIdIdx: index("territory_release_dates_release_id_idx").on(table.releaseId),
  territoryIdx: index("territory_release_dates_territory_idx").on(table.territory),
  releaseDateIdx: index("territory_release_dates_release_date_idx").on(table.releaseDate),
  statusIdx: index("territory_release_dates_status_idx").on(table.status),
}));

// Content ID Claims - YouTube Content ID tracking
export const contentIdClaims = pgTable("content_id_claims", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  videoId: varchar("video_id", { length: 255 }), // YouTube video ID
  videoUrl: varchar("video_url", { length: 500 }),
  videoTitle: varchar("video_title", { length: 500 }),
  channelName: varchar("channel_name", { length: 255 }),
  claimType: varchar("claim_type", { length: 50 }).default("automatic"), // automatic, manual
  claimStatus: varchar("claim_status", { length: 50 }).default("claimed"), // claimed, disputed, released, resolved
  policy: varchar("policy", { length: 50 }).default("monetize"), // monetize, track, block
  matchDuration: integer("match_duration"), // Seconds of matched content
  totalDuration: integer("total_duration"), // Total video duration
  views: integer("views").default(0),
  estimatedRevenue: decimal("estimated_revenue", { precision: 10, scale: 2 }).default("0"),
  disputeReason: text("dispute_reason"),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("content_id_claims_user_id_idx").on(table.userId),
  trackIdIdx: index("content_id_claims_track_id_idx").on(table.trackId),
  videoIdIdx: index("content_id_claims_video_id_idx").on(table.videoId),
  claimStatusIdx: index("content_id_claims_claim_status_idx").on(table.claimStatus),
}));

// Lyric Sync Data - Timed lyrics in LRC format
export const lyricSyncData = pgTable("lyric_sync_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  trackId: uuid("track_id").notNull().references(() => tracks.id, { onDelete: 'cascade' }),
  releaseId: uuid("release_id").references(() => distroReleases.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lrcContent: text("lrc_content").notNull(), // Full LRC format lyrics with timestamps
  language: varchar("language", { length: 20 }).default("en"),
  syncType: varchar("sync_type", { length: 50 }).default("line"), // line, word, syllable
  syncedBy: varchar("synced_by", { length: 50 }).default("manual"), // manual, ai, imported
  lineCount: integer("line_count"),
  duration: integer("duration"), // Track duration in seconds
  platformStatus: jsonb("platform_status"), // {spotify: "synced", apple_music: "pending", etc}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  trackIdIdx: index("lyric_sync_data_track_id_idx").on(table.trackId),
  releaseIdIdx: index("lyric_sync_data_release_id_idx").on(table.releaseId),
  userIdIdx: index("lyric_sync_data_user_id_idx").on(table.userId),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Studio Collaboration
// ============================================================================

// Stem Exports - Individual track export jobs
export const stemExports = pgTable("stem_exports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  trackIds: jsonb("track_ids").notNull(), // Array of track IDs to export as stems
  exportFormat: varchar("export_format", { length: 20 }).notNull(), // wav, mp3, flac, aiff
  sampleRate: integer("sample_rate").default(48000),
  bitDepth: integer("bit_depth").default(24),
  normalize: boolean("normalize").default(true),
  includeEffects: boolean("include_effects").default(true),
  zipArchiveUrl: varchar("zip_archive_url", { length: 500 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, processing, completed, failed
  progress: integer("progress").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  projectIdIdx: index("stem_exports_project_id_idx").on(table.projectId),
  userIdIdx: index("stem_exports_user_id_idx").on(table.userId),
  statusIdx: index("stem_exports_status_idx").on(table.status),
}));

// Plugin Presets - User-saved plugin configurations
export const pluginPresets = pgTable("plugin_presets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  presetName: varchar("preset_name", { length: 255 }).notNull(),
  pluginType: varchar("plugin_type", { length: 100 }).notNull(), // eq, compressor, reverb, etc
  pluginId: varchar("plugin_id", { length: 255 }), // Reference to plugin catalog
  parameters: jsonb("parameters").notNull(), // Full plugin state
  category: varchar("category", { length: 100 }), // vocal, drum, master, etc
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  downloadCount: integer("download_count").default(0),
  rating: real("rating"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("plugin_presets_user_id_idx").on(table.userId),
  pluginTypeIdx: index("plugin_presets_plugin_type_idx").on(table.pluginType),
  categoryIdx: index("plugin_presets_category_idx").on(table.category),
  isPublicIdx: index("plugin_presets_is_public_idx").on(table.isPublic),
}));

// Collaboration Cursors - Real-time cursor positions
export const collaborationCursors = pgTable("collaboration_cursors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  cursorPosition: real("cursor_position").notNull(), // Timeline position in seconds
  viewportStart: real("viewport_start"), // Visible timeline start
  viewportEnd: real("viewport_end"), // Visible timeline end
  selectedTrackId: uuid("selected_track_id"),
  color: varchar("color", { length: 20 }), // User's cursor color
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("collaboration_cursors_project_id_idx").on(table.projectId),
  userIdIdx: index("collaboration_cursors_user_id_idx").on(table.userId),
  projectUserIdx: index("collaboration_cursors_project_user_idx").on(table.projectId, table.userId),
}));

// Project Versions - Snapshot-based version history
export const projectVersions = pgTable("project_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  versionNumber: integer("version_number").notNull(),
  versionName: varchar("version_name", { length: 255 }),
  description: text("description"),
  snapshotData: jsonb("snapshot_data").notNull(), // Complete project state
  fileReferences: jsonb("file_references"), // Audio file URLs/paths at this version
  isAutoSave: boolean("is_auto_save").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("project_versions_project_id_idx").on(table.projectId),
  userIdIdx: index("project_versions_user_id_idx").on(table.userId),
  versionNumberIdx: index("project_versions_version_number_idx").on(table.versionNumber),
  createdAtIdx: index("project_versions_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// PROFESSIONAL FEATURES - Advertising Amplification
// ============================================================================

// Personal Network Impacts - Track organic amplification metrics
export const personalNetworkImpacts = pgTable("personal_network_impacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => adCampaigns.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform", { length: 50 }).notNull(),
  networkReach: integer("network_reach").default(0), // Friends/followers reached
  organicImpressions: integer("organic_impressions").default(0),
  organicEngagement: integer("organic_engagement").default(0),
  organicShares: integer("organic_shares").default(0),
  amplificationFactor: real("amplification_factor"), // Multiplier vs paid reach
  viralCoefficient: real("viral_coefficient"), // Shares per view
  costSavings: decimal("cost_savings", { precision: 10, scale: 2 }), // Estimated vs paid ads
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("personal_network_impacts_campaign_id_idx").on(table.campaignId),
  userIdIdx: index("personal_network_impacts_user_id_idx").on(table.userId),
  platformIdx: index("personal_network_impacts_platform_idx").on(table.platform),
  snapshotDateIdx: index("personal_network_impacts_snapshot_date_idx").on(table.snapshotDate),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// DEPRECATED: Use insertProjectSchema instead (unified projects table)
// export const insertStudioProjectSchema = createInsertSchema(studioProjects).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

export const insertStudioTrackSchema = createInsertSchema(studioTracks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioClipSchema = createInsertSchema(audioClips).omit({
  id: true,
  createdAt: true,
});

export const insertMidiClipSchema = createInsertSchema(midiClips).omit({
  id: true,
  createdAt: true,
});

export const insertVirtualInstrumentSchema = createInsertSchema(virtualInstruments).omit({
  id: true,
  createdAt: true,
});

export const insertAudioEffectSchema = createInsertSchema(audioEffects).omit({
  id: true,
  createdAt: true,
});

export const insertMixBusSchema = createInsertSchema(mixBusses).omit({
  id: true,
  createdAt: true,
});

export const insertAutomationDataSchema = createInsertSchema(automationData).omit({
  id: true,
  createdAt: true,
});

export const insertMarkerSchema = createInsertSchema(markers).omit({
  id: true,
  createdAt: true,
});

export const insertLyricsSchema = createInsertSchema(lyrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeneratedMelodySchema = createInsertSchema(generatedMelodies).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsAnomalySchema = createInsertSchema(analyticsAnomalies).omit({
  id: true,
  detectedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertReleaseSchema = createInsertSchema(releases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  createdAt: true,
});

export const insertTrackAnalysisSchema = createInsertSchema(trackAnalysis, {
  bpm: z.coerce.number().optional(),
  loudnessLufs: z.coerce.number().optional(),
  energy: z.coerce.number().optional(),
  danceability: z.coerce.number().optional(),
  valence: z.coerce.number().optional(),
  instrumentalness: z.coerce.number().optional(),
  acousticness: z.coerce.number().optional(),
  spectralCentroid: z.coerce.number().optional(),
  durationSeconds: z.coerce.number().int().optional(),
}).omit({
  id: true,
  analyzedAt: true,
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdInsightsSchema = createInsertSchema(adInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDistributionPackageSchema = createInsertSchema(distributionPackages).omit({
  id: true,
  createdAt: true,
});

export const insertDistributionTrackSchema = createInsertSchema(distributionTracks).omit({
  id: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoyaltySplitSchema = createInsertSchema(royaltySplits).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutEventSchema = createInsertSchema(payoutEvents).omit({
  id: true,
  createdAt: true,
});

export const insertDistroReleaseSchema = createInsertSchema(distroReleases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDistroTrackSchema = createInsertSchema(distroTracks).omit({
  id: true,
});

export const insertDistroProviderSchema = createInsertSchema(distroProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDistroDispatchSchema = createInsertSchema(distroDispatch).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
});

export const insertSocialProviderSchema = createInsertSchema(socialProviders).omit({
  id: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  connectedAt: true,
});

export const insertSocialCampaignSchema = createInsertSchema(socialCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVariantSchema = createInsertSchema(variants).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertSocialMetricSchema = createInsertSchema(socialMetrics).omit({
  id: true,
});

export const insertOptimizerStateSchema = createInsertSchema(optimizerState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertHealthCheckSchema = createInsertSchema(healthChecks).omit({
  id: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
});

export const insertSecurityFindingSchema = createInsertSchema(securityFindings).omit({
  id: true,
});

export const insertPatchSchema = createInsertSchema(patches).omit({
  id: true,
});

export const insertIpBlacklistSchema = createInsertSchema(ipBlacklist).omit({
  id: true,
});

export const insertSecurityThreatSchema = createInsertSchema(securityThreats).omit({
  id: true,
});

export const insertSystemFlagSchema = createInsertSchema(systemFlags);

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

export const insertClipSchema = createInsertSchema(clips).omit({
  id: true,
});

export const insertPluginCatalogSchema = createInsertSchema(pluginCatalog).omit({
  id: true,
  createdAt: true,
});

export const insertPluginInstanceSchema = createInsertSchema(pluginInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiJobSchema = createInsertSchema(aiJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutosaveSchema = createInsertSchema(autosaves).omit({
  id: true,
  createdAt: true,
});

export const insertStudioConversionSchema = createInsertSchema(studioConversions).omit({
  id: true,
  createdAt: true,
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers);

// Collaboration Insert Schemas
export const insertStudioCollabSessionSchema = createInsertSchema(studioCollabSessions).omit({ id: true, createdAt: true });
export const insertStudioCollabSnapshotSchema = createInsertSchema(studioCollabSnapshots).omit({ id: true, createdAt: true });
export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).omit({ id: true, createdAt: true });

// Royalty Tracking Insert Schemas
export const insertProjectRoyaltySplitSchema = createInsertSchema(projectRoyaltySplits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRevenueEventSchema = createInsertSchema(revenueEvents).omit({ id: true, createdAt: true });
export const insertRoyaltyLedgerSchema = createInsertSchema(royaltyLedger).omit({ id: true, createdAt: true });
export const insertRoyaltyPaymentSchema = createInsertSchema(royaltyPayments).omit({ id: true, createdAt: true });
export const insertCollaboratorTaxProfileSchema = createInsertSchema(collaboratorTaxProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRevenueImportHistorySchema = createInsertSchema(revenueImportHistory).omit({ id: true, uploadedAt: true });
export const insertForecastSnapshotSchema = createInsertSchema(forecastSnapshots).omit({ id: true, generatedAt: true });

// Track Effects Schema with defaults
export const trackEQSchema = z.object({
  lowGain: z.number().min(-12).max(12).default(0),
  midGain: z.number().min(-12).max(12).default(0),
  highGain: z.number().min(-12).max(12).default(0),
  midFrequency: z.number().min(200).max(8000).default(1000),
  bypass: z.boolean().default(false),
});

export const trackCompressorSchema = z.object({
  threshold: z.number().min(-50).max(0).default(-24),
  ratio: z.number().min(1).max(10).default(3),
  attack: z.number().min(3).max(30).default(10),
  release: z.number().min(60).max(600).default(200),
  knee: z.number().min(0).max(12).default(6),
  bypass: z.boolean().default(false),
});

export const trackReverbSchema = z.object({
  mix: z.number().min(0).max(1).default(0.2),
  decay: z.number().min(0.1).max(10).default(2.0),
  preDelay: z.number().min(0).max(100).default(0),
  irId: z.string().default('default'),
  bypass: z.boolean().default(false),
});

export const trackEffectsSchema = z.object({
  eq: trackEQSchema.optional(),
  compressor: trackCompressorSchema.optional(),
  reverb: trackReverbSchema.optional(),
});

export const updateTrackEffectsSchema = z.object({
  eq: trackEQSchema.partial().optional(),
  compressor: trackCompressorSchema.partial().optional(),
  reverb: trackReverbSchema.partial().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
// DEPRECATED: Use InsertProject instead
// export type InsertStudioProject = z.infer<typeof insertStudioProjectSchema>;
export type InsertStudioTrack = z.infer<typeof insertStudioTrackSchema>;
export type InsertAudioClip = z.infer<typeof insertAudioClipSchema>;
export type InsertMidiClip = z.infer<typeof insertMidiClipSchema>;
export type InsertVirtualInstrument = z.infer<typeof insertVirtualInstrumentSchema>;
export type InsertAudioEffect = z.infer<typeof insertAudioEffectSchema>;
export type InsertMixBus = z.infer<typeof insertMixBusSchema>;
export type InsertAutomationData = z.infer<typeof insertAutomationDataSchema>;
export type InsertMarker = z.infer<typeof insertMarkerSchema>;
export type InsertLyrics = z.infer<typeof insertLyricsSchema>;
export type InsertGeneratedMelody = z.infer<typeof insertGeneratedMelodySchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type InsertAnalyticsAnomaly = z.infer<typeof insertAnalyticsAnomalySchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type InsertTrackAnalysis = z.infer<typeof insertTrackAnalysisSchema>;
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type InsertDistributionPackage = z.infer<typeof insertDistributionPackageSchema>;
export type InsertDistributionTrack = z.infer<typeof insertDistributionTrackSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertRoyaltySplit = z.infer<typeof insertRoyaltySplitSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertPayoutEvent = z.infer<typeof insertPayoutEventSchema>;
export type InsertDistroRelease = z.infer<typeof insertDistroReleaseSchema>;
export type InsertDistroTrack = z.infer<typeof insertDistroTrackSchema>;
export type InsertDistroProvider = z.infer<typeof insertDistroProviderSchema>;
export type InsertDistroDispatch = z.infer<typeof insertDistroDispatchSchema>;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type InsertSocialProvider = z.infer<typeof insertSocialProviderSchema>;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type InsertSocialCampaign = z.infer<typeof insertSocialCampaignSchema>;
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertSocialMetric = z.infer<typeof insertSocialMetricSchema>;
export type InsertOptimizerState = z.infer<typeof insertOptimizerStateSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertHealthCheck = z.infer<typeof insertHealthCheckSchema>;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type InsertSecurityFinding = z.infer<typeof insertSecurityFindingSchema>;
export type InsertPatch = z.infer<typeof insertPatchSchema>;
export type InsertIpBlacklist = z.infer<typeof insertIpBlacklistSchema>;
export type InsertSecurityThreat = z.infer<typeof insertSecurityThreatSchema>;
export type InsertSystemFlag = z.infer<typeof insertSystemFlagSchema>;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type InsertClip = z.infer<typeof insertClipSchema>;
export type InsertPluginCatalog = z.infer<typeof insertPluginCatalogSchema>;
export type InsertPluginInstance = z.infer<typeof insertPluginInstanceSchema>;
export type InsertAiJob = z.infer<typeof insertAiJobSchema>;
export type InsertAutosave = z.infer<typeof insertAutosaveSchema>;
export type InsertStudioConversion = z.infer<typeof insertStudioConversionSchema>;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertStudioCollabSession = z.infer<typeof insertStudioCollabSessionSchema>;
export type InsertStudioCollabSnapshot = z.infer<typeof insertStudioCollabSnapshotSchema>;
export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;
export type InsertProjectRoyaltySplit = z.infer<typeof insertProjectRoyaltySplitSchema>;
export type InsertRevenueEvent = z.infer<typeof insertRevenueEventSchema>;
export type InsertRoyaltyLedger = z.infer<typeof insertRoyaltyLedgerSchema>;
export type InsertRoyaltyPayment = z.infer<typeof insertRoyaltyPaymentSchema>;

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
// DEPRECATED: Use Project instead  
// export type StudioProject = typeof studioProjects.$inferSelect;
export type StudioTrack = typeof studioTracks.$inferSelect;
export type AudioClip = typeof audioClips.$inferSelect;
export type MidiClip = typeof midiClips.$inferSelect;
export type VirtualInstrument = typeof virtualInstruments.$inferSelect;
export type AudioEffect = typeof audioEffects.$inferSelect;
export type MixBus = typeof mixBusses.$inferSelect;
export type AutomationData = typeof automationData.$inferSelect;
export type Marker = typeof markers.$inferSelect;
export type Lyrics = typeof lyrics.$inferSelect;
export type GeneratedMelody = typeof generatedMelodies.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type AnalyticsAnomaly = typeof analyticsAnomalies.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Release = typeof releases.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type TrackAnalysis = typeof trackAnalysis.$inferSelect;
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type DistributionPackage = typeof distributionPackages.$inferSelect;
export type DistributionTrack = typeof distributionTracks.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type RoyaltySplit = typeof royaltySplits.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type PayoutEvent = typeof payoutEvents.$inferSelect;
export type DistroRelease = typeof distroReleases.$inferSelect;
export type DistroTrack = typeof distroTracks.$inferSelect;
export type DistroProvider = typeof distroProviders.$inferSelect;
export type DistroDispatch = typeof distroDispatch.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type SocialProvider = typeof socialProviders.$inferSelect;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type SocialCampaign = typeof socialCampaigns.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type SocialMetric = typeof socialMetrics.$inferSelect;
export type OptimizerState = typeof optimizerState.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type HealthCheck = typeof healthChecks.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type SecurityFinding = typeof securityFindings.$inferSelect;
export type Patch = typeof patches.$inferSelect;
export type IpBlacklist = typeof ipBlacklist.$inferSelect;
export type SecurityThreat = typeof securityThreats.$inferSelect;
export type SystemFlag = typeof systemFlags.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Clip = typeof clips.$inferSelect;
export type PluginCatalog = typeof pluginCatalog.$inferSelect;
export type PluginInstance = typeof pluginInstances.$inferSelect;
export type AiJob = typeof aiJobs.$inferSelect;
export type Autosave = typeof autosaves.$inferSelect;
export type StudioConversion = typeof studioConversions.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type StudioCollabSession = typeof studioCollabSessions.$inferSelect;
export type StudioCollabSnapshot = typeof studioCollabSnapshots.$inferSelect;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type ProjectRoyaltySplit = typeof projectRoyaltySplits.$inferSelect;
export type RevenueEvent = typeof revenueEvents.$inferSelect;
export type RoyaltyLedger = typeof royaltyLedger.$inferSelect;
export type RoyaltyPayment = typeof royaltyPayments.$inferSelect;
export type CollaboratorTaxProfile = typeof collaboratorTaxProfiles.$inferSelect;
export type RevenueImportHistory = typeof revenueImportHistory.$inferSelect;
export type ForecastSnapshot = typeof forecastSnapshots.$inferSelect;

// ============================================================================
// API VALIDATION SCHEMAS
// ============================================================================

// Notification Validation Schemas
export const markNotificationReadSchema = z.object({
  notificationId: z.number().int().positive(),
});

export const updateNotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  browser: z.boolean().optional(),
  releases: z.boolean().optional(),
  earnings: z.boolean().optional(),
  sales: z.boolean().optional(),
  marketing: z.boolean().optional(),
  system: z.boolean().optional(),
});

export const subscribePushSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

// Onboarding Validation Schemas
export const updateOnboardingSchema = z.object({
  onboardingData: z.record(z.any()),
});

export const completeOnboardingSchema = z.object({
  hasCompletedOnboarding: z.boolean(),
});

// Subscription Validation Schemas
export const createSubscriptionSchema = z.object({
  priceId: z.string().min(1),
});

// Admin Settings Validation Schemas
export const updateAdminNotificationsSchema = z.object({
  enabled: z.boolean(),
});

export const updateAdminMaintenanceSchema = z.object({
  enabled: z.boolean(),
});

export const updateAdminRegistrationSchema = z.object({
  enabled: z.boolean(),
});

// Distribution Validation Schemas
export const createHyperFollowSchema = z.object({
  releaseId: z.string().min(1),
});

export const updateReleaseSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  status: z.string().optional(),
  releaseDate: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const submitReleaseSchema = z.object({
  providerId: z.string().min(1),
});

// Studio Validation Schemas
export const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  bpm: z.number().int().min(20).max(300).optional(),
  timeSignature: z.string().optional(),
  key: z.string().optional(),
  sampleRate: z.number().int().optional(),
  bitDepth: z.number().int().optional(),
  masterVolume: z.number().min(0).max(1).optional(),
  status: z.string().optional(),
});

export const updateTrackSchema = z.object({
  projectId: z.string(),
  name: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  pan: z.number().min(-1).max(1).optional(),
  mute: z.boolean().optional(),
  solo: z.boolean().optional(),
  effects: z.array(z.any()).optional(),
});

export const updateAudioClipSchema = z.object({
  trackId: z.string(),
  name: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  gain: z.number().optional(),
  fadeIn: z.number().optional(),
  fadeOut: z.number().optional(),
});

export const updateMidiClipSchema = z.object({
  trackId: z.string(),
  name: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  notes: z.array(z.any()).optional(),
});

export const updateInstrumentSchema = z.object({
  trackId: z.string(),
  name: z.string().optional(),
  preset: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

export const updateEffectSchema = z.object({
  trackId: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  enabled: z.boolean().optional(),
});

export const updateBusSchema = z.object({
  projectId: z.string(),
  name: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  pan: z.number().min(-1).max(1).optional(),
  effects: z.array(z.any()).optional(),
});

export const updateAutomationSchema = z.object({
  parameterName: z.string().optional(),
  points: z.array(z.any()).optional(),
});

export const updateMarkerSchema = z.object({
  projectId: z.string(),
  name: z.string().optional(),
  timePosition: z.number().optional(),
  color: z.string().optional(),
});

export const updateLyricsEntriesSchema = z.object({
  projectId: z.string(),
  entries: z.array(z.object({
    timestamp: z.number(),
    text: z.string(),
  })),
});

// Social Media Validation Schemas
export const schedulePostSchema = z.object({
  platforms: z.array(z.string()).min(1),
  content: z.string().min(1),
  mediaUrl: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export const generateContentSchema = z.object({
  platforms: z.array(z.string()).min(1),
  musicData: z.object({
    title: z.string(),
    artist: z.string(),
    genre: z.string().optional(),
  }),
  targetAudience: z.record(z.any()).optional(),
});

export const generateFromUrlSchema = z.object({
  url: z.string().url(),
  platforms: z.array(z.string()).min(1),
});

// Marketplace Validation Schemas
export const createBeatSchema = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  mood: z.string().optional(),
  tempo: z.number().int().min(20).max(300),
  key: z.string(),
  price: z.number().min(0),
  licenseType: z.enum(['basic', 'premium', 'exclusive']),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export const purchaseBeatSchema = z.object({
  beatId: z.string().min(1),
  licenseType: z.enum(['basic', 'premium', 'exclusive']),
});

export const createListingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  licenseType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createOrderSchema = z.object({
  listingId: z.number().int().positive(),
  licenseType: z.string(),
});

export const checkoutSessionSchema = z.object({
  beatId: z.string().min(1),
  licenseType: z.string(),
});

// Royalties Validation Schemas
export const exportRoyaltiesSchema = z.object({
  format: z.enum(['csv', 'pdf', 'xlsx']),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

export const requestPayoutSchema = z.object({
  amount: z.number().min(0),
  method: z.enum(['stripe', 'paypal', 'bank']).optional(),
});

export const createRoyaltySplitSchema = z.object({
  listingId: z.string().uuid(),
  recipientId: z.string(),
  percentage: z.number().min(0).max(100),
  kind: z.string().optional(),
});

export const updateRoyaltySplitSchema = z.object({
  percentage: z.number().min(0).max(100).optional(),
  kind: z.string().optional(),
  recipientId: z.string().optional(),
});

export const addPaymentMethodSchema = z.object({
  type: z.enum(['stripe', 'paypal', 'bank']),
  details: z.record(z.any()),
});

// Project Export Schemas
export const exportProjectSchema = z.object({
  format: z.enum(['json', 'wav', 'mp3', 'flac', 'ogg', 'aac']).optional(),
  exportType: z.enum(['mixdown', 'stems', 'project']).optional(), // mixdown = single file, stems = individual tracks, project = JSON data
  sampleRate: z.number().optional(),
  bitrate: z.string().optional(),
});

// Advertising Validation Schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1),
  objective: z.string().min(1),
  budget: z.number().min(0),
  duration: z.number().int().positive(),
  targetAudience: z.object({
    platforms: z.array(z.string()),
    demographics: z.record(z.any()).optional(),
  }),
});

export const generateAdContentSchema = z.object({
  musicData: z.object({
    title: z.string(),
    artist: z.string(),
    genre: z.string().optional(),
  }),
  targetAudience: z.record(z.any()),
});

export const optimizeCampaignSchema = z.object({
  campaignId: z.string(),
  performance: z.record(z.any()),
});

// Analytics Export Schema
export const exportAnalyticsSchema = z.object({
  format: z.enum(['csv', 'pdf', 'xlsx', 'json']),
  filters: z.record(z.any()).optional(),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Webhook Schema
export const dspWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
});

// Profile Update Schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  username: z.string().min(3).max(255).optional(),
});

// User Preferences Schema
export const updateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

// ====================================
// PLATFORM SELF-UPDATING SYSTEM TABLES
// ====================================

// Trend Events table - Industry trend monitoring
export const trendEvents = pgTable("trend_events", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  impact: text("impact").notNull(),
  metadata: jsonb("metadata"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index("trend_events_source_idx").on(table.source),
  eventTypeIdx: index("trend_events_event_type_idx").on(table.eventType),
  impactIdx: index("trend_events_impact_idx").on(table.impact),
  detectedAtIdx: index("trend_events_detected_at_idx").on(table.detectedAt),
}));

// Model Versions table - AI model versioning and tracking
export const modelVersions = pgTable("model_versions", {
  id: serial("id").primaryKey(),
  modelType: text("model_type").notNull(),
  version: text("version").notNull(),
  parameters: jsonb("parameters").notNull(),
  performanceMetrics: jsonb("performance_metrics"),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  modelTypeIdx: index("model_versions_model_type_idx").on(table.modelType),
  isActiveIdx: index("model_versions_is_active_idx").on(table.isActive),
  createdAtIdx: index("model_versions_created_at_idx").on(table.createdAt),
}));

// Optimization Tasks table - Platform optimization tracking
export const optimizationTasks = pgTable("optimization_tasks", {
  id: serial("id").primaryKey(),
  taskType: text("task_type").notNull(),
  status: text("status").notNull().default("pending"),
  description: text("description").notNull(),
  metrics: jsonb("metrics"),
  executedAt: timestamp("executed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  taskTypeIdx: index("optimization_tasks_task_type_idx").on(table.taskType),
  statusIdx: index("optimization_tasks_status_idx").on(table.status),
  createdAtIdx: index("optimization_tasks_created_at_idx").on(table.createdAt),
}));

// Payout Settings table - User payout preferences and tax information
export const payoutSettings = pgTable("payout_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  minimumPayoutAmount: integer("minimum_payout_amount").default(100),
  payoutFrequency: varchar("payout_frequency", { length: 20 }).default("monthly"),
  taxFormCompleted: boolean("tax_form_completed").default(false),
  taxCountry: varchar("tax_country", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("payout_settings_user_id_idx").on(table.userId),
}));

// Payment Methods table - User payment methods for royalty payouts
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  details: jsonb("details").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("payment_methods_user_id_idx").on(table.userId),
  isDefaultIdx: index("payment_methods_is_default_idx").on(table.isDefault),
}));

// Insert and Select Types for Platform Self-Updating System
export type TrendEvent = typeof trendEvents.$inferSelect;
export const insertTrendEventSchema = createInsertSchema(trendEvents).omit({ id: true, detectedAt: true });
export type InsertTrendEvent = z.infer<typeof insertTrendEventSchema>;

export type ModelVersion = typeof modelVersions.$inferSelect;
export const insertModelVersionSchema = createInsertSchema(modelVersions).omit({ id: true, createdAt: true });
export type InsertModelVersion = z.infer<typeof insertModelVersionSchema>;

export type OptimizationTask = typeof optimizationTasks.$inferSelect;
export const insertOptimizationTaskSchema = createInsertSchema(optimizationTasks).omit({ id: true, createdAt: true });
export type InsertOptimizationTask = z.infer<typeof insertOptimizationTaskSchema>;

// Advertisement AI Insert and Select Types
export type AdCreative = typeof adCreatives.$inferSelect;
export const insertAdCreativeSchema = createInsertSchema(adCreatives).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAdCreative = z.infer<typeof insertAdCreativeSchema>;

export type AdAIRun = typeof adAIRuns.$inferSelect;
export const insertAdAIRunSchema = createInsertSchema(adAIRuns).omit({ id: true, createdAt: true });
export type InsertAdAIRun = z.infer<typeof insertAdAIRunSchema>;

export type AdCampaignVariant = typeof adCampaignVariants.$inferSelect;
export const insertAdCampaignVariantSchema = createInsertSchema(adCampaignVariants).omit({ id: true, createdAt: true });
export type InsertAdCampaignVariant = z.infer<typeof insertAdCampaignVariantSchema>;

export type AdPlatformAccount = typeof adPlatformAccounts.$inferSelect;
export const insertAdPlatformAccountSchema = createInsertSchema(adPlatformAccounts).omit({ id: true, createdAt: true });
export type InsertAdPlatformAccount = z.infer<typeof insertAdPlatformAccountSchema>;

export type AdDeliveryLog = typeof adDeliveryLogs.$inferSelect;
export const insertAdDeliveryLogSchema = createInsertSchema(adDeliveryLogs).omit({ id: true, createdAt: true });
export type InsertAdDeliveryLog = z.infer<typeof insertAdDeliveryLogSchema>;

export type AdKillRule = typeof adKillRules.$inferSelect;
export const insertAdKillRuleSchema = createInsertSchema(adKillRules).omit({ id: true, createdAt: true });
export type InsertAdKillRule = z.infer<typeof insertAdKillRuleSchema>;

export type AdRuleExecution = typeof adRuleExecutions.$inferSelect;
export const insertAdRuleExecutionSchema = createInsertSchema(adRuleExecutions).omit({ id: true, executedAt: true });
export type InsertAdRuleExecution = z.infer<typeof insertAdRuleExecutionSchema>;

export type AdInsights = typeof adInsights.$inferSelect;
export type InsertAdInsights = z.infer<typeof insertAdInsightsSchema>;

// Additional Advertisement AI validation schemas
export const intakeContentSchema = z.object({
  contentType: z.enum(['text', 'image', 'video', 'carousel']),
  rawContent: z.string().min(1).max(5000),
  campaignId: z.number().int().optional(),
  platforms: z.array(z.string()).min(1),
});

export const normalizeContentSchema = z.object({
  creativeId: z.string().uuid(),
});

export const amplifyCreativeSchema = z.object({
  creativeId: z.string().uuid(),
  campaignId: z.number().int(),
});

export const dispatchVariantSchema = z.object({
  variantId: z.string().uuid(),
});

export const createKillRuleSchema = z.object({
  campaignId: z.number().int(),
  ruleType: z.enum(['performance', 'time', 'budget']),
  condition: z.object({
    metric: z.string(),
    operator: z.enum(['<', '<=', '>', '>=', '==']),
    threshold: z.number(),
  }),
  action: z.enum(['kill', 'pause', 'pivot', 'alert']),
  pivotStrategy: z.object({
    reallocateBudget: z.boolean().optional(),
    swapCreative: z.boolean().optional(),
  }).optional(),
});

export const evaluateRulesSchema = z.object({
  campaignId: z.number().int(),
});

// Upload Session Insert and Select Types
export type UploadSession = typeof uploadSessions.$inferSelect;
export const insertUploadSessionSchema = createInsertSchema(uploadSessions).omit({ id: true, createdAt: true });
export type InsertUploadSession = z.infer<typeof insertUploadSessionSchema>;

// ISRC Registry Insert and Select Types
export type ISRCRegistry = typeof isrcRegistry.$inferSelect;
export const insertISRCRegistrySchema = createInsertSchema(isrcRegistry).omit({ id: true, issuedAt: true });
export type InsertISRCRegistry = z.infer<typeof insertISRCRegistrySchema>;

// UPC Registry Insert and Select Types
export type UPCRegistry = typeof upcRegistry.$inferSelect;
export const insertUPCRegistrySchema = createInsertSchema(upcRegistry).omit({ id: true, issuedAt: true });
export type InsertUPCRegistry = z.infer<typeof insertUPCRegistrySchema>;

// JWT Token System Insert and Select Types
export type JWTToken = typeof jwtTokens.$inferSelect;
export const insertJWTTokenSchema = createInsertSchema(jwtTokens).omit({ id: true, issuedAt: true });
export type InsertJWTToken = z.infer<typeof insertJWTTokenSchema>;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({ id: true, issuedAt: true });
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;

export type TokenRevocation = typeof tokenRevocations.$inferSelect;
export const insertTokenRevocationSchema = createInsertSchema(tokenRevocations).omit({ id: true, revokedAt: true });
export type InsertTokenRevocation = z.infer<typeof insertTokenRevocationSchema>;

export type Permission = typeof permissions.$inferSelect;
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true });
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

// Webhook Reliability Insert and Select Types
export type WebhookAttempt = typeof webhookAttempts.$inferSelect;
export const insertWebhookAttemptSchema = createInsertSchema(webhookAttempts).omit({ id: true, attemptedAt: true });
export type InsertWebhookAttempt = z.infer<typeof insertWebhookAttemptSchema>;

export type WebhookDeadLetterQueue = typeof webhookDeadLetterQueue.$inferSelect;
export const insertWebhookDeadLetterQueueSchema = createInsertSchema(webhookDeadLetterQueue).omit({ id: true, enqueuedAt: true });
export type InsertWebhookDeadLetterQueue = z.infer<typeof insertWebhookDeadLetterQueueSchema>;

// Centralized Logging Insert and Select Types
export type LogEvent = typeof logEvents.$inferSelect;
export const insertLogEventSchema = createInsertSchema(logEvents).omit({ id: true, timestamp: true });
export type InsertLogEvent = z.infer<typeof insertLogEventSchema>;

// Payout Settings Insert and Select Types
export type PayoutSettings = typeof payoutSettings.$inferSelect;
export const insertPayoutSettingsSchema = createInsertSchema(payoutSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayoutSettings = z.infer<typeof insertPayoutSettingsSchema>;

// Payout Settings validation schemas
export const updatePayoutSettingsSchema = z.object({
  minimumPayoutAmount: z.number().int().min(50).max(1000).optional(),
  payoutFrequency: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
});

export const updateTaxInfoSchema = z.object({
  taxCountry: z.string().min(1).max(100),
  taxId: z.string().min(1).max(100),
  taxFormCompleted: z.boolean().optional(),
});

// Payment Methods Insert and Select Types
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true });
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

// User Asset Management Insert and Select Types
export type AssetFolder = typeof assetFolders.$inferSelect;
export const insertAssetFolderSchema = createInsertSchema(assetFolders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAssetFolder = z.infer<typeof insertAssetFolderSchema>;

export type UserAsset = typeof userAssets.$inferSelect;
export const insertUserAssetSchema = createInsertSchema(userAssets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserAsset = z.infer<typeof insertUserAssetSchema>;

export type AssetTag = typeof assetTags.$inferSelect;
export const insertAssetTagSchema = createInsertSchema(assetTags).omit({ id: true, createdAt: true });
export type InsertAssetTag = z.infer<typeof insertAssetTagSchema>;

// ============================================================================
// PROFESSIONAL FEATURES - Type Exports
// ============================================================================

// Social Media Suite Types
export type ContentCalendar = typeof contentCalendar.$inferSelect;
export const insertContentCalendarSchema = createInsertSchema(contentCalendar).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentCalendar = z.infer<typeof insertContentCalendarSchema>;

export type UnifiedInboxMessage = typeof unifiedInboxMessages.$inferSelect;
export const insertUnifiedInboxMessageSchema = createInsertSchema(unifiedInboxMessages).omit({ id: true, createdAt: true });
export type InsertUnifiedInboxMessage = z.infer<typeof insertUnifiedInboxMessageSchema>;

export type BestPostingTime = typeof bestPostingTimes.$inferSelect;
export const insertBestPostingTimeSchema = createInsertSchema(bestPostingTimes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBestPostingTime = z.infer<typeof insertBestPostingTimeSchema>;

export type HashtagResearch = typeof hashtagResearch.$inferSelect;
export const insertHashtagResearchSchema = createInsertSchema(hashtagResearch).omit({ id: true, createdAt: true });
export type InsertHashtagResearch = z.infer<typeof insertHashtagResearchSchema>;

export type StorySchedule = typeof storySchedules.$inferSelect;
export const insertStoryScheduleSchema = createInsertSchema(storySchedules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStorySchedule = z.infer<typeof insertStoryScheduleSchema>;

// Marketplace Pro Types
export type ListingStem = typeof listingStems.$inferSelect;
export const insertListingStemSchema = createInsertSchema(listingStems).omit({ id: true, createdAt: true });
export type InsertListingStem = z.infer<typeof insertListingStemSchema>;

export type LicenseTemplate = typeof licenseTemplates.$inferSelect;
export const insertLicenseTemplateSchema = createInsertSchema(licenseTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLicenseTemplate = z.infer<typeof insertLicenseTemplateSchema>;

export type EmbeddablePlayer = typeof embeddablePlayers.$inferSelect;
export const insertEmbeddablePlayerSchema = createInsertSchema(embeddablePlayers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmbeddablePlayer = z.infer<typeof insertEmbeddablePlayerSchema>;

export type ProducerProfile = typeof producerProfiles.$inferSelect;
export const insertProducerProfileSchema = createInsertSchema(producerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProducerProfile = z.infer<typeof insertProducerProfileSchema>;

export type StemOrder = typeof stemOrders.$inferSelect;
export const insertStemOrderSchema = createInsertSchema(stemOrders).omit({ id: true, createdAt: true });
export type InsertStemOrder = z.infer<typeof insertStemOrderSchema>;

// Analytics Intelligence Types
export type PlaylistTracking = typeof playlistTracking.$inferSelect;
export const insertPlaylistTrackingSchema = createInsertSchema(playlistTracking).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlaylistTracking = z.infer<typeof insertPlaylistTrackingSchema>;

export type CompetitiveAnalysis = typeof competitiveAnalysis.$inferSelect;
export const insertCompetitiveAnalysisSchema = createInsertSchema(competitiveAnalysis).omit({ id: true, createdAt: true });
export type InsertCompetitiveAnalysis = z.infer<typeof insertCompetitiveAnalysisSchema>;

export type RadioPlay = typeof radioPlays.$inferSelect;
export const insertRadioPlaySchema = createInsertSchema(radioPlays).omit({ id: true, createdAt: true });
export type InsertRadioPlay = z.infer<typeof insertRadioPlaySchema>;

export type TikTokAnalytics = typeof tiktokAnalytics.$inferSelect;
export const insertTikTokAnalyticsSchema = createInsertSchema(tiktokAnalytics).omit({ id: true, createdAt: true });
export type InsertTikTokAnalytics = z.infer<typeof insertTikTokAnalyticsSchema>;

export type DemographicInsight = typeof demographicInsights.$inferSelect;
export const insertDemographicInsightSchema = createInsertSchema(demographicInsights).omit({ id: true, createdAt: true });
export type InsertDemographicInsight = z.infer<typeof insertDemographicInsightSchema>;

// Royalties Operations Types
export type SplitSheetDocument = typeof splitSheetDocuments.$inferSelect;
export const insertSplitSheetDocumentSchema = createInsertSchema(splitSheetDocuments).omit({ id: true, createdAt: true });
export type InsertSplitSheetDocument = z.infer<typeof insertSplitSheetDocumentSchema>;

export type SplitSheetSignature = typeof splitSheetSignatures.$inferSelect;
export const insertSplitSheetSignatureSchema = createInsertSchema(splitSheetSignatures).omit({ id: true, createdAt: true });
export type InsertSplitSheetSignature = z.infer<typeof insertSplitSheetSignatureSchema>;

export type ProRegistration = typeof proRegistrations.$inferSelect;
export const insertProRegistrationSchema = createInsertSchema(proRegistrations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProRegistration = z.infer<typeof insertProRegistrationSchema>;

export type TerritoryRoyalty = typeof territoryRoyalties.$inferSelect;
export const insertTerritoryRoyaltySchema = createInsertSchema(territoryRoyalties).omit({ id: true, createdAt: true });
export type InsertTerritoryRoyalty = z.infer<typeof insertTerritoryRoyaltySchema>;

export type BlackBoxRoyalty = typeof blackBoxRoyalties.$inferSelect;
export const insertBlackBoxRoyaltySchema = createInsertSchema(blackBoxRoyalties).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlackBoxRoyalty = z.infer<typeof insertBlackBoxRoyaltySchema>;

// Distribution Enhancements Types
export type PreReleaseAnalytics = typeof preReleaseAnalytics.$inferSelect;
export const insertPreReleaseAnalyticsSchema = createInsertSchema(preReleaseAnalytics).omit({ id: true, createdAt: true });
export type InsertPreReleaseAnalytics = z.infer<typeof insertPreReleaseAnalyticsSchema>;

export type TerritoryReleaseDate = typeof territoryReleaseDates.$inferSelect;
export const insertTerritoryReleaseDateSchema = createInsertSchema(territoryReleaseDates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTerritoryReleaseDate = z.infer<typeof insertTerritoryReleaseDateSchema>;

export type ContentIdClaim = typeof contentIdClaims.$inferSelect;
export const insertContentIdClaimSchema = createInsertSchema(contentIdClaims).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentIdClaim = z.infer<typeof insertContentIdClaimSchema>;

export type LyricSyncData = typeof lyricSyncData.$inferSelect;
export const insertLyricSyncDataSchema = createInsertSchema(lyricSyncData).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLyricSyncData = z.infer<typeof insertLyricSyncDataSchema>;

// Studio Collaboration Types
export type StemExport = typeof stemExports.$inferSelect;
export const insertStemExportSchema = createInsertSchema(stemExports).omit({ id: true, createdAt: true });
export type InsertStemExport = z.infer<typeof insertStemExportSchema>;

export type PluginPreset = typeof pluginPresets.$inferSelect;
export const insertPluginPresetSchema = createInsertSchema(pluginPresets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPluginPreset = z.infer<typeof insertPluginPresetSchema>;

export type CollaborationCursor = typeof collaborationCursors.$inferSelect;
export const insertCollaborationCursorSchema = createInsertSchema(collaborationCursors).omit({ id: true, createdAt: true });
export type InsertCollaborationCursor = z.infer<typeof insertCollaborationCursorSchema>;

export type ProjectVersion = typeof projectVersions.$inferSelect;
export const insertProjectVersionSchema = createInsertSchema(projectVersions).omit({ id: true, createdAt: true });
export type InsertProjectVersion = z.infer<typeof insertProjectVersionSchema>;

// Advertising Amplification Types
export type PersonalNetworkImpact = typeof personalNetworkImpacts.$inferSelect;
export const insertPersonalNetworkImpactSchema = createInsertSchema(personalNetworkImpacts).omit({ id: true, createdAt: true });
export type InsertPersonalNetworkImpact = z.infer<typeof insertPersonalNetworkImpactSchema>;
