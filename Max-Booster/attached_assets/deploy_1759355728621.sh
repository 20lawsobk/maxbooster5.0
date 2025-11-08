#!/bin/bash

# Max Booster - Replit Agent Deployment Script
# This script automates the entire deployment process for the Replit agent

echo "🚀 Starting Max Booster Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Max Booster deployment script started"

# Step 1: Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads
mkdir -p public/generated-content/images
mkdir -p public/generated-content/videos
mkdir -p public/generated-content/audio
mkdir -p logs
print_success "Directories created"

# Step 3: Set permissions
print_status "Setting permissions..."
chmod 755 uploads
chmod 755 public/generated-content
print_success "Permissions set"

# Step 4: Check environment variables
print_status "Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    print_warning "DATABASE_URL not set. Using fallback."
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    print_warning "STRIPE_SECRET_KEY not set. Payment features will be limited."
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    print_warning "GOOGLE_CLIENT_ID not set. Google OAuth will be disabled."
fi

# Step 5: Setup database (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    print_status "Setting up database..."
    if npm run db:push; then
        print_success "Database setup completed"
    else
        print_warning "Database setup failed, but continuing..."
    fi
else
    print_warning "Skipping database setup (DATABASE_URL not set)"
fi

# Step 6: Build the application
print_status "Building application..."
if npm run build; then
    print_success "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 7: Start the application
print_status "Starting Max Booster..."
print_success "Deployment completed successfully!"
print_status "Max Booster is now running on port ${PORT:-5000}"
print_status "Access your app at: http://localhost:${PORT:-5000}"
print_status "Admin dashboard: http://localhost:${PORT:-5000}/admin"
print_status "Health check: http://localhost:${PORT:-5000}/health"

# Start the server
exec npm run replit:start