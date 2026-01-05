# Matrix LMS - Development & Deployment Guide

## 🚀 Environment Setup

This project is configured to work seamlessly in both **local development** and **production deployment**.

### 📍 URLs
- **Local Development**: `http://localhost:5173`
- **Production**: `https://matrix-udevs.netlify.app/`
- **Backend API**: `https://matrix-backendd.onrender.com/api`

## 🔧 Configuration

### Local Development (localhost:5173)

The `.env.local` file configures your local frontend to use the deployed backend:

```bash
# File: .env.local
VITE_API_URL=https://matrix-backendd.onrender.com/api
```

This means when you run `npm run dev`, your frontend will make API calls to your Render backend instead of localhost:3000.

### Production Deployment (matrix-udevs.netlify.app)

The `netlify.toml` file handles routing and proxying:

```toml
# SPA fallback - handles client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# API proxy - routes /api/* to your backend
[[redirects]]
  from = "/api/*"
  to = "https://matrix-backendd.onrender.com/api/:splat"
  status = 200

# Environment variable for production
[build.environment]
  VITE_API_URL = "/api"
```

## 🏃‍♂️ Running Locally

1. **Install dependencies**:
   ```bash
   cd matrix
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: `http://localhost:5173`

Your app will automatically connect to the deployed backend!

## 📦 Building for Production

```bash
npm run build
```

This creates a `dist/` folder that can be deployed to Netlify.

## 🔄 How It Works

### API Routing Logic

| Environment | API Base URL | Actual API Calls |
|-------------|--------------|------------------|
| Local Dev | `https://matrix-backendd.onrender.com/api` | `https://matrix-backendd.onrender.com/api/auth/login` |
| Production | `/api` | `https://matrix-udevs.netlify.app/api/auth/login` → `https://matrix-backendd.onrender.com/api/auth/login` |

### File Priority

1. `.env.local` (highest priority - local development)
2. `.env` (project defaults)
3. `netlify.toml` environment variables (production only)
4. Default fallback: `http://localhost:3000/api`

## 🧪 Testing

### Test Local Development
```bash
cd matrix
npm run dev
# Open http://localhost:5173
# Try registering/logging in - should work with deployed backend
```

### Test Production
- Deploy to Netlify
- Visit `https://matrix-udevs.netlify.app/`
- Test registration/login - should work seamlessly

## 🔍 Troubleshooting

### "Route not found" in Production
- ✅ Check `netlify.toml` has SPA fallback rule
- ✅ Ensure build output goes to `dist/` folder

### API Calls Fail Locally
- ✅ Check `.env.local` exists with correct `VITE_API_URL`
- ✅ Restart dev server after changing environment files
- ✅ Verify backend is accessible: `curl https://matrix-backendd.onrender.com/api/health`

### CORS Issues
- ✅ Local dev: No CORS issues (direct call to Render)
- ✅ Production: Netlify proxy eliminates CORS

## 📝 Environment Files

- `.env.local` - Local development (ignored by git)
- `.env.example` - Template for environment setup
- `netlify.toml` - Production deployment config

## 🎯 Key Benefits

✅ **Same codebase** works in both environments
✅ **No CORS issues** in either environment
✅ **Seamless development** - test with real backend locally
✅ **Automatic deployment** via Netlify
✅ **SPA routing** works in production
