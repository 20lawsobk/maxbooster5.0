#!/bin/bash
set -e

# Max Booster - EC2 Instance Initialization Script
# This script runs on EC2 instance startup

echo "Starting Max Booster application setup..."

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install FFmpeg for audio processing
apt-get install -y ffmpeg

# Install PM2 for process management
npm install -g pm2

# Create application directory
mkdir -p /opt/maxbooster
cd /opt/maxbooster

# Clone repository (replace with your repository)
# git clone https://github.com/yourusername/maxbooster.git .

# Set environment variables
cat > /opt/maxbooster/.env << EOF
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://${db_user}:${db_password}@${db_host}:5432/${db_name}
DB_POOL_SIZE=50

# Redis Configuration
REDIS_URL=redis://${redis_host}:6379

# S3 Configuration
S3_BUCKET=${s3_bucket}
AWS_REGION=us-east-1

# Application Configuration
MAX_SESSIONS=100000
RATE_LIMIT_MAX=500
MAX_FILE_SIZE=104857600
EOF

# Install dependencies
npm install --production

# Run database migrations
npm run db:push

# Start application with PM2
pm2 start npm --name "maxbooster-api" -- start
pm2 startup systemd
pm2 save

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7

echo "Max Booster application setup complete!"
