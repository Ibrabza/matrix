# Database Seeding Guide

This guide explains how to populate your Matrix LMS database with realistic mock data for testing, development, and production deployment.

## 📋 Overview

The seeding script creates:
- **20 Users** - Diverse students with realistic names and credentials
- **8 Courses** - Technology courses across different categories
- **25+ Lessons** - Detailed course content with proper ordering
- **15 Purchases** - Course purchases linking users to courses
- **Progress Tracking** - Realistic completion data for purchased courses

## 🏗️ Database Schema

### Relationships (Foreign Key Constraints)
```
User (1) ──── (N) Purchase (N) ──── (1) Course
   │                     │
   │                     │
   └── (N) UserProgress (1) ─── (N) Lesson
```

### Data Integrity
- ✅ **Users** created first (no dependencies)
- ✅ **Courses** created second (no dependencies)
- ✅ **Lessons** created third (depends on Courses)
- ✅ **Purchases** created fourth (depends on Users & Courses)
- ✅ **UserProgress** created last (depends on Users & Lessons)

## 🚀 Running the Seed Script

### Prerequisites
1. Database is set up and migrations are applied
2. Prisma client is generated
3. Environment variables are configured

### Execute Seeding
```bash
# Navigate to backend directory
cd backend_matrix

# Run the seed script
npm run db:seed

# Or directly with ts-node
npx ts-node prisma/seed.ts
```

### Verify Seeding
```bash
# Check seeded data
npx prisma studio

# Or query via API
curl http://localhost:3000/api/courses
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👥 Sample User Accounts

| Email | Password | Purchased Courses |
|-------|----------|-------------------|
| `alex.johnson@email.com` | `SecurePass123!` | React, JavaScript, MERN |
| `sarah.mitchell@email.com` | `Password456!` | Python, Node.js |
| `mike.davis@email.com` | `MikeSecure789!` | React, DevOps |
| `emily.chen@email.com` | `EmilyPass321!` | React Native, AWS |
| `david.wilson@email.com` | `DavidSecure654!` | Node.js |

## 📚 Sample Courses

### Frontend Development
- **Complete React Development Bootcamp** ($89.99)
- **Modern JavaScript: From Fundamentals to Advanced** ($79.99)
- **Mobile App Development with React Native** ($109.99)

### Backend & Full-Stack
- **Node.js Backend Development with Express** ($99.99)
- **Full-Stack Web Development with MERN** ($149.99)
- **Python for Data Science & Machine Learning** ($119.99)

### DevOps & Cloud
- **DevOps & CI/CD Pipeline Mastery** ($129.99)
- **AWS Cloud Architecture & Solutions** ($139.99)

## 📊 Realistic Data Features

### User Diversity
- ✅ Realistic names and email addresses
- ✅ Professional avatar URLs (DiceBear API)
- ✅ Varied password patterns
- ✅ Different enrollment dates

### Course Content
- ✅ Industry-relevant course titles
- ✅ Detailed descriptions with learning outcomes
- ✅ Realistic pricing ($79.99 - $149.99)
- ✅ Professional instructor names
- ✅ High-quality cover images (Unsplash)

### Lesson Structure
- ✅ Logical progression (fundamentals → advanced)
- ✅ Comprehensive content descriptions
- ✅ Proper ordering within courses
- ✅ Realistic video URLs (sample videos)

### Purchase Patterns
- ✅ Users buy multiple courses (realistic behavior)
- ✅ Recent purchase timestamps
- ✅ Unique Stripe session IDs
- ✅ Proper user-course relationships

### Progress Tracking
- ✅ Realistic completion rates (50-100%)
- ✅ Varied completion timestamps
- ✅ Proper lesson ordering
- ✅ Only purchased courses have progress

## 🔄 Re-Seeding

To clear and reseed the database:

```bash
# Reset database (WARNING: Destroys all data)
npx prisma migrate reset --force

# Re-seed with fresh data
npm run db:seed
```

## 🧪 Testing Scenarios

### Pagination Testing
- **Courses**: 8 total (good for pagination testing)
- **Users**: 20 total (sufficient for user management)
- **Lessons**: 25+ total (adequate for lesson browsing)

### Business Logic Testing
- **Purchased Course Access**: Users can only view purchased courses
- **Progress Tracking**: Completion percentages and timestamps
- **User Authentication**: JWT tokens and password hashing
- **Course Categories**: Filtering by categoryId

### API Endpoint Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Course catalog
curl http://localhost:3000/api/courses

# User authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex.johnson@email.com", "password": "SecurePass123!"}'

# Protected routes
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Data Volume Summary

```
Users:        20 (diverse student base)
Courses:       8 (technology-focused curriculum)
Lessons:      25+ (comprehensive course content)
Purchases:    15 (realistic enrollment patterns)
Progress:     50+ (learning activity simulation)
```

## 🚀 Production Deployment

### Render Deployment Setup

To ensure your deployed backend has seeded data:

#### Option 1: Automatic Seeding (Recommended)

1. **Update your Render build command** to include seeding:
   ```
   Build Command: npm run build
   Start Command: npm run db:deploy && npm start
   ```

2. **Or use the deployment script**:
   ```
   Build Command: npm run build
   Start Command: npm run deploy:setup && npm start
   ```

#### Option 2: Manual Seeding After Deployment

If you prefer to seed manually after deployment:

1. **Connect to your Render instance** via SSH or dashboard
2. **Run the seed script**:
   ```bash
   npm run db:seed
   ```

### Environment Variables

Ensure your Render environment has:
```bash
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

### Deployment Verification

After deployment, verify seeded data:
```bash
# Test health endpoint
curl https://your-render-app.onrender.com/api/health

# Test seeded courses
curl https://your-render-app.onrender.com/api/courses

# Test seeded user login
curl -X POST https://your-render-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex.johnson@email.com", "password": "SecurePass123!"}'
```

## 🔄 Redeployment Handling

The seed script is **idempotent** - it checks for existing data and skips seeding if data is already present. This prevents duplicate data on redeployments.

### Forcing a Re-seed (Development Only)

If you need to reset data during development:
```bash
# WARNING: Destroys all data!
npx prisma migrate reset --force
npm run db:seed
```

## 🎯 Next Steps

After seeding:
1. **Start the server**: `npm run dev`
2. **Test API endpoints** using the provided curl commands
3. **Open Prisma Studio**: `npx prisma studio` to browse data
4. **Test frontend integration** with the seeded data
5. **Verify business logic** (authentication, purchases, progress)

### Deployment Checklist
- ✅ Database migrations applied
- ✅ Seed script runs without errors
- ✅ API endpoints return expected data
- ✅ Authentication works with test accounts
- ✅ Frontend can connect to deployed backend

The seeded data provides a solid foundation for comprehensive testing of your LMS platform in both development and production! 🚀
