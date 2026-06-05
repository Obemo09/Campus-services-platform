#!/bin/bash
echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/campus-services-platform

# Pull the latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Rebuild only the services that changed
echo "📦 Rebuilding Docker containers..."
docker compose up -d --build

echo "✅ Deployment complete and successful!"
