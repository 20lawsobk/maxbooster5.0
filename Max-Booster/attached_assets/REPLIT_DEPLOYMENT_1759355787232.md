# 🚀 Max Booster - Replit Deployment Guide

## 📋 Quick Start

1. **Import to Replit**: Click "Import from GitHub" and paste your repository URL
2. **Set Environment Variables**: Go to Secrets tab and add the required variables
3. **Run**: Click the "Run" button or use `npm run replit`

## 🔧 Environment Variables Setup

### Required Variables (Secrets Tab)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Stripe (for payments)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Security
SESSION_SECRET=your_super_secret_key_here

# Admin Access
ADMIN_EMAIL=brandonlawson720@gmail.com
ADMIN_PASSWORD=admin123!
```

### Optional Variables
```bash
# Social Media APIs
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
YOUTUBE_API_KEY=your_youtube_api_key
TIKTOK_ACCESS_TOKEN=your_tiktok_token
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 🗄️ Database Setup

### Option 1: Neon Database (Recommended)
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add to Replit Secrets as `DATABASE_URL`

### Option 2: Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add to Replit Secrets as `DATABASE_URL`

### Option 3: Railway
1. Go to [Railway](https://railway.app/)
2. Create a new PostgreSQL service
3. Copy the connection string
4. Add to Replit Secrets as `DATABASE_URL`

## 🚀 Deployment Steps

### 1. Import Project
- Click "Import from GitHub" in Replit
- Paste your repository URL
- Wait for import to complete

### 2. Configure Environment
- Go to the "Secrets" tab
- Add all required environment variables
- Save the secrets

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize Database
```bash
npm run db:push
```

### 5. Start Application
```bash
npm run replit
```

## 🔍 Access Points

Once deployed, you can access:

- **Main App**: `https://your-repl-name.your-username.repl.co`
- **Admin Dashboard**: `https://your-repl-name.your-username.repl.co/admin`
- **API Endpoints**: `https://your-repl-name.your-username.repl.co/api/*`

## 🛠️ Development Commands

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run start

# Replit optimized mode
npm run replit

# Type checking
npm run check

# Database operations
npm run db:push
```

## 📊 Features Available

### ✅ Core Features
- **Dashboard**: Comprehensive analytics and insights
- **Studio**: Professional DAW with AI mixing/mastering
- **Distribution**: Music distribution to 150+ platforms
- **Marketplace**: Beat marketplace with peer-to-peer transactions
- **Social Media**: AI-powered content generation for 8 platforms
- **Advertisement**: Revolutionary AI advertising system
- **Analytics**: Advanced analytics with 50+ metrics
- **Royalties**: Comprehensive royalty management

### ✅ Authentication
- Email/Password login
- Google OAuth integration
- Admin role management
- Session-based authentication

### ✅ Payment Integration
- Stripe integration for subscriptions
- Three pricing tiers: $49/month, $39/month (yearly), $699 (lifetime)
- Automated billing and webhooks

## 🔒 Security Features

- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Content Security Policy and input sanitization
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Session Security**: Secure session configuration
- **File Upload Security**: File type validation and size limits

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Modern UI**: Futuristic design with blue color scheme
- **Dark/Light Mode**: Automatic theme switching
- **Progressive Onboarding**: Guided setup for new users
- **Feature Discovery**: Interactive feature exploration
- **Accessibility**: WCAG 2.1 AA compliant

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in Secrets
   - Ensure database is accessible from Replit
   - Run `npm run db:push` to initialize schema

2. **Stripe Integration Issues**
   - Verify Stripe keys in Secrets
   - Check webhook endpoint configuration
   - Ensure test keys for development

3. **Google OAuth Issues**
   - Verify Google OAuth credentials
   - Check redirect URIs in Google Console
   - Ensure OAuth consent screen is configured

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper MIME type validation

### Performance Optimization

- **Database Indexing**: Automatic indexing for common queries
- **Caching**: Client-side caching with TanStack Query
- **Code Splitting**: Automatic code splitting for faster loads
- **Image Optimization**: Automatic image optimization and compression

## 📈 Monitoring

- **Health Checks**: Built-in health check endpoints
- **Error Logging**: Comprehensive error logging and monitoring
- **Performance Metrics**: Real-time performance monitoring
- **Audit System**: Continuous security and functionality auditing

## 🔄 Updates and Maintenance

- **Automatic Updates**: Dependencies automatically updated
- **Database Migrations**: Automatic schema migrations
- **Backup System**: Automatic database backups
- **Rollback Support**: Easy rollback to previous versions

## 📞 Support

For support and questions:
- **Email**: brandonlawson720@gmail.com
- **Documentation**: Check the main README.md
- **Issues**: Create an issue in the repository

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Database connected and schema initialized
- [ ] Stripe integration tested
- [ ] Google OAuth configured
- [ ] File uploads working
- [ ] All features tested
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Backup system active

---

**Max Booster** - The Ultimate AI-Powered Music Career Management Platform 🎵



