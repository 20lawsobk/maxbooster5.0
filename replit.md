# Overview

Max Booster is an AI-powered platform designed to provide music artists with professional tools for career management. It offers functionalities for music production (featuring a Studio One-inspired DAW interface), distribution, social media management, advertising, marketplace operations, and advanced analytics. The platform integrates autonomous AI systems for content optimization and security, built on an enterprise-scale architecture capable of supporting millions of concurrent users. Its core purpose is to streamline artist operations and accelerate career growth through advanced technology.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18, TypeScript, and Vite, utilizing Wouter for routing, React Query for server state management with aggressive caching, and React Hook Form with Zod for validation. The UI leverages shadcn/ui on Radix UI, styled with Tailwind CSS to create a dark mode, Studio One-inspired aesthetic. State management prioritizes React Query for server state and React hooks for local UI state.

## Backend Architecture

The backend is developed with Express.js on Node.js using TypeScript ESM modules, featuring a RESTful API. It employs shared TypeScript types for client-server consistency. Authentication uses session-based `express-session` with Redis backing and Bcrypt password hashing, supporting Google OAuth. Key architectural decisions include a stateless API for scalability, PostgreSQL with Drizzle ORM for type-safe data access, and a design for phased scalability utilizing Redis for distributed state and database connection pooling.

## Data Storage

The primary database is PostgreSQL (Neon serverless) managed with Drizzle ORM, comprising over 96 tables. Redis is used for session management and distributed caching. File storage supports secure user asset uploads (audio samples, plugin files) with MIME type validation and per-user isolation.

## Authentication & Security

Authentication includes bcrypt password hashing, secure session cookies, JWT refresh tokens, password reset flows, and Google OAuth. Authorization uses role-based access control, subscription tier enforcement, and resource ownership verification. The system incorporates continuous health monitoring, automated threat detection, and audit logging. Legal compliance includes GDPR and COPPA.

## Key Architectural Decisions

-   **Stateless API with Redis Sessions:** Enables horizontal scalability.
-   **PostgreSQL with Drizzle ORM:** Provides type-safe database access and migration management.
-   **React Query for Server State:** Manages server state with aggressive caching and optimistic updates.
-   **Monorepo with Shared Types:** Ensures consistent data structures between client and server.
-   **AI Music Suite Architecture:** Utilizes Web Audio API, Canvas rendering, and multi-resolution waveforms for a professional browser-based DAW.
-   **Autonomous Upgrade System:** AI-driven self-detection and self-upgrading capabilities.
-   **Zero-Cost Advertising AI:** Leverages AI for organic content amplification.
-   **Scalability Architecture:** Designed to scale to millions of concurrent users through phased plans.
-   **FAANG-Level Code Quality:** Enforces production-grade standards through ESLint v9, Prettier, Husky, and CI/CD.

# External Dependencies

-   **Payment Processing:** Stripe for payments and Stripe Connect for marketplace transactions.
-   **AI Services:** OpenAI-compatible endpoints for content generation, alongside in-house AI for mixing, mastering, autonomous upgrades, and security.
-   **Email Services:** SendGrid for transactional emails.
-   **Social Media OAuth:** Integrations with Facebook/Instagram, Twitter/X, and YouTube APIs.
-   **Music Distribution:** Provider-agnostic layer for Digital Service Providers (DSPs), with LabelGrid identified as a primary choice.
-   **Cloud Storage:** Replit App Storage (currently integrated).
-   **Database:** Neon PostgreSQL and Redis.

# Recent Changes

-   **AI Assistant Restoration** (Nov 22, 2025): Restored AI Studio Assistant to the DAW interface:
    -   Re-integrated AIAssistantPanel component into Studio.tsx
    -   Added "AI Assistant" button in Studio toolbar (cyan-colored, Sparkles icon)
    -   Full-featured AI panel with mixing suggestions, loudness analysis, genre presets, and mastering recommendations
    -   Accessible via Studio toolbar alongside AI Mix, AI Master, and AI Generator buttons
    -   Serves as solo founder's workaround for not having a support team - provides intelligent assistance 24/7
-   **Complete Contact/Support References Removal** (Nov 22, 2025): Eliminated all team/support references to reflect solo founder operation:
    -   Removed Contact page, LiveChatWidget, and all "Contact Support/Sales" buttons
    -   Changed all "Email & Chat Support" features to "Comprehensive Help Center"
    -   Updated error messages from "contact support" to "Please try again"
    -   Removed "Contact" navigation links across all pages
    -   Terms.tsx updated to reference Help Center instead of support email
    -   Solo founder first-person voice throughout platform
-   **Desktop App Integration** (Nov 22, 2025): Created native desktop app download page integrated into protected dashboard:
    -   Comprehensive DesktopApp page with platform-specific downloads (Windows, macOS, Linux)
    -   4 feature cards highlighting benefits (Performance, Security, Offline Mode, Native Integration)
    -   Complete system requirements and FAQ sections
    -   Fully internationalized across all 5 languages with i18n
    -   Protected route with AppLayout and useRequireSubscription authentication
    -   Accessible via Desktop App link in main sidebar navigation
    -   Production-ready for paid user access
-   **Multilingual Support** (Nov 22, 2025): Added comprehensive internationalization (i18n) support for Max Booster platform:
    -   Integrated i18next and react-i18next for translation management
    -   5 supported languages: English, Spanish, French, German, and Japanese
    -   Language switcher component in sidebar with flag indicators
    -   Translated navigation, common UI elements, and key pages
    -   Automatic language detection with localStorage persistence
    -   Production-ready multilingual infrastructure
-   **Multimodal Content Analysis System** (Nov 22, 2025): Completed production-ready multimodal content analysis system powering both AI autopilots with rich content features:
    -   5 custom TensorFlow.js analyzers (image, video, audio, text, website) extracting 20+ features per content type
    -   SocialMediaAutopilotAI upgraded to 28 features (12 base + 16 multimodal)
    -   AdvertisingAutopilotAI upgraded to 44 features (24 base + 20 multimodal)
    -   API security: rate limiting (50 req/15min) + subscription gating (monthly/yearly/lifetime only)
    -   Comprehensive test coverage validating multimodal learning pipeline
    -   Architect PASS approval for production deployment with paid users
-   **AI Analytics Backend Implementation** (Nov 22, 2025): Created comprehensive analytics-internal.ts with 10 AI-powered endpoints for the AI Dashboard, including metric predictions, churn analysis, revenue forecasting, anomaly detection, and music career insights. All endpoints authenticated and production-ready.
-   **AI Dashboard UI Enhancement**: Added AppLayout wrapper to provide consistent sidebar navigation across all analytics pages.
-   **API Contract Alignment**: All analytics endpoints return data formats matching frontend expectations precisely, ensuring proper data rendering across all dashboard tabs.
-   **Fixed critical AI cross-tenant data leakage**: Implemented complete metadata persistence solution ensuring AI model weights AND metadata are saved/restored correctly per user.
-   **Created regression test**: test-ai-isolation.ts proves no cross-user contamination after cache eviction.