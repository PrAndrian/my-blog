#!/bin/bash

# ========================================
# Staging Deployment Script
# ========================================
# This script deploys the application to staging environment
# It's called by GitHub Actions but can also be run manually

set -e  # Exit on error

echo "🚀 Starting deployment to STAGING..."

# Environment
export NODE_ENV=development

# Load staging environment variables
if [ -f .env.staging ]; then
  echo "📝 Loading staging environment variables..."
  export $(cat .env.staging | grep -v '^#' | xargs)
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Deploy Convex backend to dev environment
echo "☁️  Deploying Convex to staging (dev)..."
npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL

# Build Next.js application
echo "🏗️  Building Next.js application..."
pnpm build

# Deploy to Vercel preview
echo "🌐 Deploying to Vercel (Preview)..."
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN not set"
  exit 1
fi

vercel --token="$VERCEL_TOKEN" \
  --env NEXT_PUBLIC_CONVEX_URL="$STAGING_CONVEX_URL" \
  --env NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$STAGING_CLERK_PUBLISHABLE_KEY"

echo "✅ Staging deployment complete!"
echo "📍 Your staging deployment should be available at the Vercel preview URL"
