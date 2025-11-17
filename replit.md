# Overview

Max Booster is an AI-powered platform designed to empower music artists with professional tools for career management. It offers functionalities spanning music production (featuring a Studio One-inspired DAW interface), distribution, social media management, advertising, marketplace operations, and advanced analytics. The platform integrates autonomous AI systems for content optimization and security, built on an enterprise-scale architecture capable of supporting millions of concurrent users. Its core purpose is to streamline artist operations and accelerate career growth through advanced technology.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18, TypeScript, and Vite. It uses Wouter for routing, React Query for server state management with aggressive caching, and React Hook Form with Zod for validation. The UI leverages shadcn/ui on Radix UI, styled with Tailwind CSS to create a dark mode, Studio One-inspired aesthetic. State management prioritizes React Query for server state and React hooks for local UI state.

## Backend Architecture

The backend is developed with Express.js on Node.js using TypeScript ESM modules, featuring a RESTful API with approximately 400 endpoints. It employs shared TypeScript types for client-server consistency. Authentication uses session-based `express-session` with Redis backing and Bcrypt password hashing, supporting Google OAuth. Key architectural decisions include a stateless API for scalability, PostgreSQL with Drizzle ORM for type-safe data access, and a design for phased scalability utilizing Redis for distributed state and database connection pooling.

## Data Storage

The primary database is PostgreSQL (Neon serverless) managed with Drizzle ORM, comprising over 96 tables. Redis is used for session management and distributed caching. File storage is designed to support secure user asset uploads (audio samples, plugin files) with MIME type validation and per-user isolation, with a planned migration to cloud storage.

## Authentication & Security

Authentication includes bcrypt password hashing, secure session cookies, JWT refresh tokens, password reset flows, and Google OAuth. Authorization uses role-based access control, subscription tier enforcement, and resource ownership verification. The system incorporates continuous health monitoring, automated threat detection, and audit logging.

## Key Architectural Decisions

-   **Stateless API with Redis Sessions:** Enables horizontal scalability.
-   **PostgreSQL with Drizzle ORM:** Provides type-safe database access and migration management.
-   **React Query for Server State:** Manages server state with aggressive caching and optimistic updates.
-   **Monorepo with Shared Types:** Ensures consistent data structures between client and server.
-   **AI Music Suite Architecture:** Utilizes Web Audio API, Canvas rendering, and multi-resolution waveforms for a professional browser-based DAW.
-   **Autonomous Upgrade System:** AI-driven self-detection and self-upgrading capabilities.
-   **Zero-Cost Advertising AI:** Leverages AI for organic content amplification.
-   **Scalability Architecture:** Designed to scale to millions of concurrent users through phased plans.

# External Dependencies

-   **Payment Processing:** Stripe for payments and Stripe Connect for marketplace transactions.
-   **AI Services:** OpenAI-compatible endpoints for content generation, alongside in-house AI for mixing, mastering, autonomous upgrades, and security.
-   **Email Services:** SendGrid for transactional emails.
-   **Social Media OAuth:** Integrations with Facebook/Instagram, Twitter/X, and YouTube APIs.
-   **Music Distribution:** Provider-agnostic layer for Digital Service Providers (DSPs), with LabelGrid identified as a primary choice.
-   **Cloud Storage:** Replit App Storage (currently integrated) with planned migration to AWS S3 and CloudFront CDN.
-   **Database:** Neon PostgreSQL and Redis.