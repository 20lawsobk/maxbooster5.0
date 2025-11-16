#!/bin/bash

# Stop any existing Redis instance
redis-cli shutdown 2>/dev/null || true

# Start Redis server in the background (bind to localhost only)
echo "🔴 Starting Redis server..."
redis-server --bind 127.0.0.1 --port 6379 --daemonize yes

# Wait for Redis to be ready
sleep 2

# Check if Redis is running
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "⚠️ Redis failed to start, continuing anyway..."
fi

# Start the application
echo "🚀 Starting Max Booster Platform..."
npm run dev
