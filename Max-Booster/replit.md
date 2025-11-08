# Overview

This full-stack web application is a comprehensive platform for music production, distribution, and social media management. Built with React, Express, and TypeScript, it features AI-powered content generation for advertising and music analysis, a modern UI, and a monorepo structure. Key capabilities include payment processing, email services, and a PostgreSQL database. The project enforces a payment-before-account-creation workflow and aims to offer a robust and reliable platform for artists and producers.

# User Preferences

**Working Style:** Operate as a well-seasoned professional, stubbornly perfectionist web developer that always follows client instructions to the exact letter - no more, no less. Execute with meticulous attention to detail and senior-level expertise.

**Communication Style:** Simple, everyday language.

# System Architecture

## Frontend

-   **Framework:** React with TypeScript, Vite.
-   **State Management:** React Query.
-   **UI:** shadcn/ui, Radix UI, Tailwind CSS (theming, dark mode).
-   **Forms:** React Hook Form with Zod.

## Backend

-   **Framework:** Express.js on Node.js with TypeScript and ESM.
-   **Authentication:** Session-based with `express-session` and Redis.
-   **API:** RESTful with shared types and path aliases.
-   **Optimization:** CORS and compression middleware.

## Data Storage

-   **Database:** PostgreSQL (Neon serverless) with Drizzle ORM.
-   **Session Store:** Redis.

## Authentication & Security

-   Password-based authentication (bcrypt).
-   Secure, Redis-backed session cookies.
-   Rate limiting on critical authentication routes.
-   Ownership verification and secure WHERE clauses for data access.

## UI/UX Decisions

-   Comprehensive UI component library and responsive design.
-   "B-Lawz Music" branding with a dark theme aesthetic (Studio One inspired).
-   Notification Center.
-   Social media content generation with previews.
-   **Professional Studio DAW Interface:**
    -   Five-zone layout (TopBar, Inspector, Timeline, Browser, Dock) with Studio One-inspired visual theme
    -   Rich gradient system with professional depth, shadows, and lighting effects
    -   Declarative CSS utility classes (`.studio-btn`, `.studio-btn-play`, `.studio-btn-record`, `.studio-btn-accent`, `.studio-btn-metronome`) for consistent styling
    -   React declarative patterns throughout - zero inline DOM mutations (no `onMouseEnter`/`onMouseLeave` handlers)
    -   CSS variable-based theming system with global `:root` scope for theme-agnostic styling
    -   Professional transport controls with glowing state indicators and smooth transitions
    -   Industry-standard visual appearance matching professional DAW tools
-   Export dialog with format selection.

## Technical Implementations

-   **Production-Ready Type Safety:** Comprehensive TypeScript type system with explicit generic types on all queries, strongly-typed interfaces for all API responses (ComprehensiveAnalytics, PlatformBreakdown, RoyaltySplit, PaymentMethod, etc.), and elimination of critical `any` types in Royalties, Distribution, Advertisement, and Admin pages. Error handlers maintain standard `any` typing as industry practice.
-   **Session Persistence:** Robust authentication flow using Passport's `req.logIn()` with database session tracking, proper error handling, and Redis-backed session storage. All authentication routes implement audit logging and security event tracking.
-   **Page Loading Loop Prevention:** AuthProvider authentication query uses `getQueryFn({ on401: "returnNull" })` to prevent throwing on unauthenticated users, with disabled refetchOnWindowFocus globally and auth query configured with staleTime: Infinity to prevent excessive refetching and eliminate loading loops.
-   **Real-World Data Only:** All endpoints use real database data with no mock/stub data. Social media weekly stats endpoint calculates metrics from actual user posts stored in the database.
-   **Zero-Cost Social Amplification System:** AI-driven organic content generation for major social media platforms, designed to eliminate ad spend.
-   **Proprietary AI System:** In-house AI for content generation, music analysis, and social media automation using deterministic calculations.
-   **AI Music Analysis:** Browser-based audio analysis using Essentia.js for real-time BPM, key/scale, loudness, and audio feature extraction.
-   **AI Melody/Chord Generator:** Custom algorithmic music generation system (text-to-music, audio-to-music) integrated into the Studio.
-   **FFmpeg Audio Format Conversion:** Production-grade conversion system supporting 6 formats with quality presets and queue management.
-   **CRDT Collaborative Editing:** Yjs-based real-time collaboration infrastructure with state snapshot persistence.
-   **Royalty Tracking & Revenue Split Calculator:** Complete royalty management system with transactional revenue event creation, split validation, and AI forecasting (exponential smoothing).
-   Programmatic Stripe product and price ID generation.
-   Dual-channel notification system (SendGrid email, browser push).
-   Production-grade Digital Audio Workstation (DAW) with project persistence, file uploads, and plugin library.
-   Beat marketplace with Stripe Connect P2P payments.
-   All features operate with real database data.
-   **Unified Projects Architecture:** Single `projects` table with UUIDs and CASCADE delete.
-   **Web Audio API Multi-Track Mixing:** Production-grade AudioEngine with lazy AudioContext, memory-efficient buffer caching, synchronized multi-track playback, bus routing, and master dynamics chain.
-   **Platform Self-Updating System:** Autonomous system for monitoring industry changes, auto-updating AI algorithms, and self-optimizing platform features.
-   **Analytics Anomaly Detection:** Background job and statistical analysis for anomaly detection with WebSocket real-time updates and notification integration.
-   **Real-time Analytics Streaming:** WebSocket infrastructure for live analytics updates with polling fallback and auto-reconnect.
-   **Studio DAW URL Routing:** Deep linking support for `/studio/:projectId` with automatic project loading and URL synchronization.
-   **Distribution System:** Comprehensive coverage for 33 distribution platforms with real database-backed submission handlers and UPC generation.

# External Dependencies

-   **Payment Processing:** Stripe
-   **Email Service:** SendGrid
-   **Media Processing:** FFmpeg
-   **Database:** Neon PostgreSQL
-   **Session Store:** Redis