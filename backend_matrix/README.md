# Matrix LMS Backend

A comprehensive Learning Management System backend built with Node.js, TypeScript, Express, and Prisma.

## 🚀 Features

- **User Authentication** - JWT-based auth with secure password hashing
- **Course Management** - Full CRUD operations for courses and lessons
- **Purchase System** - Stripe integration for course purchases
- **Progress Tracking** - Lesson completion and progress monitoring
- **Database Seeding** - Realistic mock data for testing and demo

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Payments**: Stripe
- **Validation**: Custom middleware

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database URL and other configs

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with mock data
npm run db:seed
```

## 🚀 Development

```bash
# Start development server with hot reload
npm run dev

# View database in Prisma Studio
npm run prisma:studio
```

## 🌐 Production Deployment

### Render Deployment (Recommended)

1. **Connect your GitHub repository** to Render
2. **Use the provided configuration**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (includes automatic database setup)
3. **Set environment variables**:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Secure random string
   - `NODE_ENV=production`

### Automatic Database Seeding

When your app starts on Render:
1. **Prisma client generates** automatically
2. **Database migrations run** (if needed)
3. **Seed script runs** (only if database is empty)
4. **Server starts** with seeded data ready

### Manual Seeding (Alternative)

If you need to seed manually:
```bash
npm run db:seed
```

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy database migrations and seed data
npm run db:deploy

# Start the server
npm start
```

## 📊 Database Seeding

The application includes comprehensive mock data seeding for testing and demo purposes.

### Automatic Seeding
- Runs automatically on first deployment
- Skips if data already exists (prevents duplicates)

### Manual Seeding
```bash
npm run db:seed
```

### Seed Data Includes
- **20 Users** with realistic profiles
- **8 Courses** across technology categories
- **25+ Lessons** with proper sequencing
- **15 Purchases** linking users to courses
- **Progress tracking** for enrolled courses

See [README_SEEDING.md](./README_SEEDING.md) for detailed information.

## 🔗 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Users
```
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/change-password
PATCH  /api/users/me/avatar
```

### Courses
```
GET    /api/courses
GET    /api/courses/:id
```

### Lessons
```
GET    /api/lessons/:id
```

### Purchases & Checkout
```
POST   /api/checkout/create-session
```

### Progress
```
PUT    /api/courses/:courseId/lessons/:lessonId/progress
GET    /api/courses/:courseId/progress
```

### Webhooks
```
POST   /api/webhooks/stripe
```

## 🧪 Testing

```bash
# Test user credentials
Email: alex.johnson@email.com
Password: SecurePass123!

# Health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex.johnson@email.com", "password": "SecurePass123!"}'
```

## 📁 Project Structure

```
backend_matrix/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middlewares/     # Custom middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   └── types/          # TypeScript types
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.ts         # Database seeding
│   └── migrations/     # Database migrations
├── scripts/
│   └── deploy.sh       # Deployment script
├── dist/               # Compiled JavaScript
├── README_SEEDING.md   # Seeding documentation
└── package.json
```

## 🔒 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/matrix_lms

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here

# Environment
NODE_ENV=development|production

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure everything works
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
