#!/bin/bash

# Max Booster Replit Startup Script
echo "🚀 Starting Max Booster on Replit..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
mkdir -p uploads
mkdir -p public/generated-content/images
mkdir -p public/generated-content/videos
mkdir -p public/generated-content/audio
mkdir -p logs

# Set permissions
chmod 755 uploads
chmod 755 public/generated-content

# Start the application
echo "🎵 Starting Max Booster server..."
npm run replit



