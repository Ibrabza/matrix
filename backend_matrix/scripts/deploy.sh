#!/bin/bash

# Deployment script for Matrix LMS Backend
# This script handles database setup and seeding for production deployment

set -e  # Exit on any error

echo "🚀 Starting Matrix LMS Backend Deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Seed the database (only if empty)
echo "🌱 Seeding database with mock data..."
npm run db:seed

echo "✅ Deployment setup complete!"
echo "🎯 Your LMS backend is ready with seeded data!"
