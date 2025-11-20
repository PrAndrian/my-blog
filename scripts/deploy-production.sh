#!/bin/bash

# ========================================
# Production Deployment Script
# ========================================
# This script deploys the application to production environment
# It's called by GitHub Actions but can also be run manually
# ⚠️  USE WITH CAUTION - This deploys to PRODUCTION

set -e  # Exit on error

echo "🚀 Starting deployment to PRODUCTION..."

# Confirm production deployment
read -p "⚠️  You are about to deploy to PRODUCTION. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Deployment cancelled"
  exit 0
fi

# Environment
export NODE_ENV=production

# Load production environment variables
if [ -f .env.production ]; then
  echo "📝 Loading production environment variables..."
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests (if available)
if grep -q '"test"' package.json; then
  echo "🧪 Running tests..."
  pnpm test
fi

# Deploy Convex backend to production
echo "☁️  Deploying Convex to production..."
npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL --prod

# Build Next.js application
echo "🏗️  Building Next.js application..."
pnpm build

# Deploy to Vercel production
echo "🌐 Deploying to Vercel (Production)..."
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN not set"
  exit 1
fi

vercel --prod \
  --token="$VERCEL_TOKEN" \
  --env NEXT_PUBLIC_CONVEX_URL="$PRODUCTION_CONVEX_URL" \
  --env NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$PRODUCTION_CLERK_PUBLISHABLE_KEY"

echo "✅ Production deployment complete!"
echo "📍 Your production site is now live at: $NEXT_PUBLIC_APP_URL"
