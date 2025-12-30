# 🔍 Progress API Debugging Guide

**Endpoint:** `GET /api/courses/{courseId}/progress`  
**Issue:** Error when fetching course progress  
**Date:** December 26, 2025

---

## 📊 Endpoint Information

### Backend Route
```typescript
GET /api/courses/:courseId/progress
Middleware: authMiddleware (requires valid JWT token)
Controller: getCourseProgress
```

### Requirements
1. ✅ User must be authenticated (valid JWT token)
2. ✅ User must have **purchased** the course
3. ✅ Course must exist in database

---

## 🔍 Debug Logs Added

### Frontend Logs (Browser Console)

**When fetching progress:**
```javascript
📊 [Frontend] Fetching course progress { courseId: '...' }
🔐 [Request Interceptor] { hasToken: true, tokenPreview: '...' }
✅ [Request Interceptor] Token attached to request
```

**On success:**
```javascript
✅ [Frontend] Course progress fetched { 
  courseId: '...', 
  progress: { progress: 75, completedLessons: [...] } 
}
```

**On error:**
```javascript
❌ [Frontend] Failed to fetch course progress {
  courseId: '...',
  error: 'Forbidden: You must purchase this course to view progress'
}
```

### Backend Logs (Server Console)

**Request received:**
```
📊 [Progress] Request received {
  url: '/courses/1d6266c6-fca0-487e-8101-4001e6056332/progress',
  courseId: '1d6266c6-fca0-487e-8101-4001e6056332',
  hasUser: true,
  userId: 'user-123',
  headers: { authorization: '✅ Present' }
}
```

**Auth middleware:**
```
🔐 [Auth Middleware] Checking authentication
✅ [Auth Middleware] Token verified { userId: 'user-123' }
✅ [Auth Middleware] Authentication successful
```

**Purchase check:**
```
📊 [Progress] Checking purchase { userId: 'user-123', courseId: '...' }
```

**If purchase NOT found:**
```
❌ [Progress] User has not purchased this course {
  userId: 'user-123',
  courseId: '1d6266c6-fca0-487e-8101-4001e6056332',
  message: 'User must purchase course before viewing progress'
}
```

**If purchase found:**
```
✅ [Progress] Purchase verified { purchaseId: 'purchase-123' }
✅ [Progress] Progress calculated {
  totalLessons: 10,
  completedLessons: 7,
  progress: '70%'
}
```

---

## 🐛 Common Errors & Solutions

### Error 1: 401 Unauthorized

**Symptom:**
```
❌ [API Error] { status: 401, url: '/courses/.../progress' }
```

**Causes:**
1. No token in localStorage
2. Token expired
3. Invalid token
4. Token not attached to request

**Debug Steps:**
```javascript
// Check in browser console:
localStorage.getItem('matrix_auth_token')  // Should return a JWT token

// Check request headers in Network tab:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Solutions:**
- Login again to get a fresh token
- Check that `TOKEN_KEY = 'matrix_auth_token'` matches across all files
- Verify JWT_SECRET is set on backend

---

### Error 2: 403 Forbidden

**Symptom:**
```
❌ [Progress] User has not purchased this course
Response: { success: false, message: "Forbidden: You must purchase this course to view progress" }
```

**Cause:**
User has NOT purchased the course yet.

**Debug Steps:**
```sql
-- Check in database:
SELECT * FROM "Purchase" 
WHERE "userId" = 'your-user-id' 
AND "courseId" = '1d6266c6-fca0-487e-8101-4001e6056332';
```

**Solutions:**
1. **Purchase the course first:**
   - Use the "Buy Course" button
   - OR use direct purchase endpoint (dev/testing):
     ```bash
     POST /api/courses/{courseId}/purchase
     ```

2. **For testing, manually insert purchase:**
   ```sql
   INSERT INTO "Purchase" ("id", "userId", "courseId", "purchasedAt")
   VALUES (
     gen_random_uuid(),
     'your-user-id',
     '1d6266c6-fca0-487e-8101-4001e6056332',
     NOW()
   );
   ```

---

### Error 3: 404 Not Found

**Symptom:**
```
❌ [API Error] { status: 404 }
```

**Cause:**
Course doesn't exist in database.

**Debug Steps:**
```sql
-- Check if course exists:
SELECT * FROM "Course" 
WHERE "id" = '1d6266c6-fca0-487e-8101-4001e6056332';
```

**Solution:**
- Verify the courseId is correct
- Check that the course was created in the database

---

### Error 4: 500 Internal Server Error

**Symptom:**
```
❌ [API Error] { status: 500 }
💥 [500 Server Error] - DO NOT LOGOUT
```

**Causes:**
1. Database connection error
2. Prisma query error
3. Missing environment variables

**Debug Steps:**
1. Check server logs for stack trace
2. Verify database is running
3. Check DATABASE_URL in .env

**Solution:**
- Check backend console for detailed error
- Ensure PostgreSQL is running
- Run `npx prisma generate` if schema changed

---

## 🧪 Testing the Progress API

### Step 1: Check Authentication

```bash
# In browser console:
localStorage.getItem('matrix_auth_token')
# Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Check Purchase Status

```bash
# Make a test request:
curl -X GET \
  http://localhost:3000/api/courses/1d6266c6-fca0-487e-8101-4001e6056332/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Responses:**

**If NOT purchased (403):**
```json
{
  "success": false,
  "message": "Forbidden: You must purchase this course to view progress"
}
```

**If purchased (200):**
```json
{
  "success": true,
  "data": {
    "progress": 70
  }
}
```

### Step 3: Purchase the Course (if needed)

**Option A: Use the UI**
1. Login
2. Navigate to course page
3. Click "Buy Course"
4. Complete Stripe checkout (or use mock purchase)

**Option B: Direct API call (dev/testing)**
```bash
curl -X POST \
  http://localhost:3000/api/courses/1d6266c6-fca0-487e-8101-4001e6056332/purchase \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Step 4: Verify Progress API Works

After purchasing, retry the progress endpoint:
```bash
curl -X GET \
  http://localhost:3000/api/courses/1d6266c6-fca0-487e-8101-4001e6056332/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Should now return:
```json
{
  "success": true,
  "data": {
    "progress": 0  // 0% if no lessons completed yet
  }
}
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   PROGRESS API FLOW                          │
└─────────────────────────────────────────────────────────────┘

Frontend: useCourseProgress(courseId)
  │
  ├─ 📊 [Frontend] Fetching course progress
  │
  ▼
Request: GET /api/courses/{courseId}/progress
  │
  ├─ 🔐 [Request Interceptor] Token attached
  │
  ▼
Backend: Auth Middleware
  │
  ├─ 🔐 [Auth Middleware] Checking authentication
  ├─ Validates JWT token
  │
  ├─ ✅ Token valid → Continue
  └─ ❌ Token invalid → 401 Unauthorized
  │
  ▼
Backend: Progress Controller
  │
  ├─ 📊 [Progress] Request received
  ├─ Extract userId from req.user
  ├─ Extract courseId from req.params
  │
  ▼
Check Purchase:
  │
  ├─ Query: Purchase.findUnique({ userId, courseId })
  │
  ├─ ✅ Purchase found → Continue
  └─ ❌ Purchase NOT found → 403 Forbidden
  │
  ▼
Calculate Progress:
  │
  ├─ Count total lessons in course
  ├─ Count completed lessons for user
  ├─ Calculate percentage
  │
  ▼
Response: 200 OK
  │
  ├─ ✅ [Progress] Progress calculated
  │   { totalLessons: 10, completedLessons: 7, progress: '70%' }
  │
  ▼
Frontend: Response received
  │
  ├─ ✅ [Frontend] Course progress fetched
  └─ Display progress to user
```

---

## 🔧 Quick Fix Checklist

If the progress API is failing, check these in order:

- [ ] **Backend server is running**
  ```bash
  cd backend_matrix
  npm run dev
  ```

- [ ] **Frontend server is running**
  ```bash
  cd matrix
  npm run dev
  ```

- [ ] **User is logged in**
  ```javascript
  // Browser console:
  localStorage.getItem('matrix_auth_token')
  ```

- [ ] **Token is valid** (not expired)
  - Try logging out and logging back in

- [ ] **User has purchased the course**
  ```sql
  -- Check database:
  SELECT * FROM "Purchase" WHERE "userId" = '...' AND "courseId" = '...';
  ```

- [ ] **Course exists in database**
  ```sql
  SELECT * FROM "Course" WHERE "id" = '1d6266c6-fca0-487e-8101-4001e6056332';
  ```

- [ ] **Database is running**
  ```bash
  # Check PostgreSQL status
  psql -U postgres -c "SELECT 1"
  ```

- [ ] **Environment variables are set**
  ```bash
  # backend_matrix/.env
  DATABASE_URL="postgresql://..."
  JWT_SECRET="your-secret"
  ```

---

## 📝 Expected Log Sequence (Success)

### Frontend Console:
```
📊 [Frontend] Fetching course progress { courseId: '1d6266c6...' }
🔐 [Request Interceptor] { hasToken: true, tokenPreview: 'eyJhbG...' }
✅ [Request Interceptor] Token attached to request
🔵 [API Response - lib] /courses/1d6266c6.../progress { success: true, data: { progress: 70 } }
✅ [API Unwrapped - lib] { progress: 70 }
✅ [Frontend] Course progress fetched { courseId: '1d6266c6...', progress: { progress: 70 } }
```

### Backend Console:
```
🔐 [Auth Middleware] Checking authentication { url: '/courses/1d6266c6.../progress' }
✅ [Auth Middleware] Token verified { userId: 'user-123' }
✅ [Auth Middleware] Authentication successful
📊 [Progress] Request received { courseId: '1d6266c6...', userId: 'user-123' }
📊 [Progress] Checking purchase { userId: 'user-123', courseId: '1d6266c6...' }
✅ [Progress] Purchase verified { purchaseId: 'purchase-123' }
✅ [Progress] Progress calculated { totalLessons: 10, completedLessons: 7, progress: '70%' }
```

---

## 🎯 Most Likely Issue

Based on the error you're seeing, the **most likely cause** is:

### ❌ **User has NOT purchased the course**

**Solution:**
1. Purchase the course using the "Buy Course" button
2. OR use the direct purchase endpoint for testing:
   ```bash
   POST /api/courses/1d6266c6-fca0-487e-8101-4001e6056332/purchase
   ```

The backend is correctly enforcing that users must purchase a course before viewing progress. This is the expected behavior for security and business logic.

---

## 🚀 Next Steps

1. **Check the logs** in both browser console and server console
2. **Identify the error** (401, 403, 404, or 500)
3. **Follow the solution** for that specific error above
4. **Test again** after applying the fix

The comprehensive debug logs will show you exactly where the request is failing.

---

**Status:** ✅ Debug logging added  
**Ready for testing:** Yes  
**Documentation:** Complete

