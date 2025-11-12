# Overview

Max Booster is an AI-powered music artist career management platform offering professional tools for music production, distribution, social media, advertising, marketplace operations, and analytics. It features a Studio One-inspired DAW interface, autonomous AI systems for content optimization and security, and an enterprise-scale architecture designed for millions of concurrent users. The platform aims to empower artists with advanced technology to manage and grow their careers efficiently.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses React 18 with TypeScript and Vite. It leverages Wouter for routing, React Query for server state management with aggressive caching (5min staleTime, 10min gcTime), and React Hook Form with Zod for validation. The UI is built with shadcn/ui on Radix UI, styled with Tailwind CSS for a dark mode, Studio One-inspired professional aesthetic. State management prioritizes React Query for server state and React hooks for local UI state, avoiding global state libraries.

## Backend Architecture

The backend is built with Express.js on Node.js with TypeScript ESM modules, featuring a RESTful API design with approximately 400 endpoints. Shared TypeScript types (`@shared/*`) ensure client-server consistency. Authentication is session-based using `express-session` with Redis backing and Bcrypt password hashing, supporting Google OAuth. APIs are organized by domain with comprehensive error handling, request validation, CORS, and compression middleware. Key architectural decisions include a stateless API with Redis sessions for scalability, PostgreSQL with Drizzle ORM for type-safe data access, and React Query for efficient server state management. The system is designed for scalability with phased scaling plans, leveraging patterns like stateless APIs, Redis for distributed state, database connection pooling, and async job queues.

## Data Storage

The primary database is PostgreSQL (Neon serverless) using Drizzle ORM for type-safe queries and migrations across 96+ tables with extensive foreign key relationships and indexes. Redis serves as the session store and for distributed caching, complemented by an in-memory caching layer. File storage currently uses the local filesystem for development but is architected for future migration to AWS S3/CDN. It supports secure user asset uploads (audio samples, plugin files) with a 500MB limit, strict MIME type validation, and per-user isolation.

## Authentication & Security

Authentication involves password-based bcrypt hashing, secure session cookies, JWT refresh tokens, password reset flows, and Google OAuth. Authorization uses role-based access control (admin, user), subscription tier enforcement, and resource ownership verification. A self-healing security system provides continuous health monitoring, automated threat detection, and audit logging for critical operations.

## Key Architectural Decisions

- **Stateless API with Redis Sessions:** Ensures horizontal scalability by sharing sessions across multiple server instances.
- **PostgreSQL with Drizzle ORM:** Provides type-safe database access, migration management, and SQL injection prevention.
- **React Query for Server State:** Manages server state with aggressive caching, optimistic updates, and built-in error handling.
- **Monorepo with Shared Types:** Maintains a single source of truth for data structures between client and server.
- **AI Music Suite Architecture:** Utilizes Web Audio API, Canvas rendering, and multi-resolution waveforms for a low-latency, professional browser-based DAW experience.
- **Autonomous Upgrade System:** Self-detecting and self-upgrading AI system for continuous adaptation to platform changes.
- **Zero-Cost Advertising AI:** Leverages AI-optimized content and networks for organic amplification without direct advertising spend.
- **Scalability Architecture:** Designed to scale from 10,000 to 100 million concurrent users through phased plans and scale-ready patterns.

# External Dependencies

-   **Payment Processing:** Stripe for payments and Stripe Connect for marketplace P2P transactions, including automated seller onboarding.
-   **AI Services:** OpenAI-compatible endpoints for content generation and in-house AI systems for mixing, mastering, autonomous upgrades, and security.
-   **Email Services:** SendGrid for transactional emails (partially implemented).
-   **Social Media OAuth:** Integrations with Facebook/Instagram, Twitter/X, and YouTube APIs.
-   **Music Distribution:** Provider-agnostic layer for integration with various Digital Service Providers (DSPs), including ISRC/UPC management.
-   **Cloud Storage:** Planned migration to AWS S3 and CloudFront CDN for audio file storage and delivery.
-   **Monitoring & Analytics:** Internal health monitoring, performance metrics, and audit logging systems.
-   **Development Tools:** Drizzle Kit for database migrations, Vite for frontend builds, Jest for testing, and ESBuild for server bundling.
-   **Database:** Neon PostgreSQL for serverless database needs and Redis for session and caching.