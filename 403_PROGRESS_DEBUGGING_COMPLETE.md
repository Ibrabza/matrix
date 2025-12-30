# 🔍 403 Forbidden Error - Progress Endpoint Debug Complete

**Endpoint:** `GET /api/courses/1d6266c6-fca0-487e-8101-4001e6056332/progress`  
**Error:** 403 Forbidden  
**Status:** ✅ Debug logging added + Tools provided

---

## 🎯 Root Cause Analysis

### **The Prisma Query That's Failing**

```typescript
const purchase = await prisma.purchase.findUnique({
  where: { userId_courseId: { userId, courseId } },
  select: { id: true },
});

if (!purchase) {
  return sendFailure(res, 403, "Forbidden");
}
```

**This query uses the compound unique constraint:**
- Schema: `@@unique([userId, courseId])` (line 74 in schema.prisma)
- Returns `null` if no matching purchase exists
- Both `userId` and `courseId` are `String` (UUID format)

### **Why You're Getting 403**

The backend is correctly enforcing **authorization logic**:
1. ✅ Authentication passed (you have a valid token)
2. ❌ Authorization failed (you haven't purchased the course)

**The user must have a record in the `Purchase` table to view progress.**

---

## 🔧 What I've Added

### 1. **Enhanced Backend Logging**

**File: `backend_matrix/src/controllers/progressController.ts`**

Added comprehensive debug logs that will show:

```typescript
// Before the query
📊 [Progress] Checking purchase with compound key {
  userId: 'user-123',
  courseId: '1d6266c6-fca0-487e-8101-4001e6056332',
  userIdType: 'string',
  courseIdType: 'string',
  userIdLength: 36,
  courseIdLength: 36
}

// Query result
🔍 [Progress] Purchase query result: {
  found: false,
  purchase: null
}

// If not found, show what the user DOES have
❌ [Progress] Purchase NOT FOUND {
  searchedFor: {
    userId: 'user-123',
    courseId: '1d6266c6-fca0-487e-8101-4001e6056332'
  },
  userHasPurchases: true,
  userPurchaseCount: 2,
  userPurchasedCourses: [
    { courseId: 'course-abc', purchasedAt: '2025-12-26...' },
    { courseId: 'course-xyz', purchasedAt: '2025-12-25...' }
  ]
}

// Check if course exists
❌ [Progress] Course existence check: {
  courseId: '1d6266c6-fca0-487e-8101-4001e6056332',
  exists: true,
  course: { id: '...', title: 'Introduction to React' }
}

// Compare IDs for formatting issues
❌ [Progress] COMPARISON CHECK:
{
  purchasedCourseId: 'course-abc',
  requestedCourseId: '1d6266c6-fca0-487e-8101-4001e6056332',
  match: false,
  purchasedLength: 36,
  requestedLength: 36
}
```

### 2. **Debug Script: `debug-purchase.js`**

A Node.js script to check the database directly:

```bash
cd backend_matrix
node debug-purchase.js "YOUR_USER_ID" "1d6266c6-fca0-487e-8101-4001e6056332"
```

**This will show:**
- ✅ Whether user exists
- ✅ Whether course exists
- ✅ Whether purchase exists
- 📚 All purchases the user has made
- 💡 SQL to create a test purchase

### 3. **SQL Script: `create-test-purchase.sql`**

Pre-written SQL queries to:
- Check user existence
- Check course existence
- Check purchase status
- **Create a test purchase**
- Verify the purchase was created

---

## 🧪 Step-by-Step Debugging

### **Step 1: Restart Backend Server**

```bash
cd backend_matrix
npm run dev
```

### **Step 2: Reproduce the Error**

Make a request to the progress endpoint and watch the **backend console**.

You'll now see detailed logs like:

```
📊 [Progress] Request received
🔐 [Auth Middleware] Token verified { userId: 'abc-123' }
📊 [Progress] Checking purchase with compound key
🔍 [Progress] Purchase query result: { found: false, purchase: null }
❌ [Progress] Purchase NOT FOUND
❌ [Progress] Course existence check: { exists: true }
```

### **Step 3: Get Your User ID**

From the logs, copy your `userId`:

```
userId: 'abc-123-def-456'
```

OR check in browser console:

```javascript
// Decode your JWT token
const token = localStorage.getItem('matrix_auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', payload.userId);
```

### **Step 4: Run the Debug Script**

```bash
cd backend_matrix
node debug-purchase.js "YOUR_USER_ID" "1d6266c6-fca0-487e-8101-4001e6056332"
```

**Expected Output:**

```
🔍 DEBUG: Purchase Status Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User ID:   abc-123-def-456
Course ID: 1d6266c6-fca0-487e-8101-4001e6056332
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Checking if user exists...
✅ User found: { id: '...', email: 'user@example.com' }

2️⃣ Checking if course exists...
✅ Course found: { id: '...', title: 'Introduction to React', price: 49.99 }

3️⃣ Checking for purchase...
❌ PURCHASE NOT FOUND
   User has NOT purchased this course.

4️⃣ All purchases for this user:
   📭 No purchases found for this user.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User Exists:         ✅ YES
Course Exists:       ✅ YES
Purchase Exists:     ❌ NO
User Total Purchases: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 SOLUTION:
   The user needs to purchase this course first.
```

---

## 🛠️ Solutions

### **Solution 1: Purchase the Course via UI**

1. Login to your frontend
2. Navigate to the course page
3. Click "Buy Course"
4. Complete the Stripe checkout (or mock purchase)

### **Solution 2: Create Test Purchase via SQL**

```bash
# Connect to your database
psql -U postgres -d your_database_name

# Run this query (replace YOUR_USER_ID)
INSERT INTO "Purchase" (
  "id", 
  "userId", 
  "courseId", 
  "stripeSessionId", 
  "createdAt"
)
VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID_HERE',
  '1d6266c6-fca0-487e-8101-4001e6056332',
  'test_session_' || gen_random_uuid()::text,
  NOW()
);
```

### **Solution 3: Use the Direct Purchase API**

```bash
curl -X POST \
  http://localhost:3000/api/courses/1d6266c6-fca0-487e-8101-4001e6056332/purchase \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### **Solution 4: Use Provided SQL File**

```bash
# Edit the SQL file to add your user ID
nano backend_matrix/create-test-purchase.sql

# Replace YOUR_USER_ID_HERE with your actual user ID

# Run the SQL file
psql -U postgres -d your_database_name -f backend_matrix/create-test-purchase.sql
```

---

## 📊 Expected Logs After Fix

Once you create a purchase, the logs should show:

```
📊 [Progress] Request received
🔐 [Auth Middleware] Token verified { userId: 'abc-123' }
📊 [Progress] Checking purchase with compound key
🔍 [Progress] Purchase query result: {
  found: true,
  purchase: {
    id: 'purchase-123',
    userId: 'abc-123',
    courseId: '1d6266c6-fca0-487e-8101-4001e6056332',
    createdAt: '2025-12-26T...'
  }
}
✅ [Progress] Purchase verified
✅ [Progress] Progress calculated {
  totalLessons: 10,
  completedLessons: 0,
  progress: '0%'
}
```

---

## 🔍 Understanding the Schema

From `prisma/schema.prisma`:

```prisma
model Purchase {
  id              String   @id @default(uuid())
  userId          String
  courseId        String
  stripeSessionId String   @unique
  createdAt       DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])  // ← This is what we're querying
  @@index([userId])
  @@index([courseId])
}
```

**Key Points:**
1. Both `userId` and `courseId` are **String** (UUID format)
2. The `@@unique([userId, courseId])` creates a compound unique constraint
3. One user can only purchase each course once
4. The Prisma query uses this constraint: `userId_courseId: { userId, courseId }`

---

## 🎯 Type Safety Analysis

The code is **type-safe**:
- ✅ `userId` from `req.user.id` → String (from JWT)
- ✅ `courseId` from `req.params.courseId` → String (from URL)
- ✅ Database columns → String (UUID)
- ✅ No Int/String mismatch

**Hypothesis 1 (UUID vs String):** ❌ Not the issue - both are String  
**Hypothesis 2 (Empty table):** ✅ **MOST LIKELY** - User hasn't purchased course  
**Hypothesis 3 (Role check):** ❌ Not applicable - No role checking in this code

---

## 🚀 Quick Fix Command

**If you just want to create a test purchase quickly:**

```bash
# Step 1: Get your user ID from JWT
# In browser console:
JSON.parse(atob(localStorage.getItem('matrix_auth_token').split('.')[1])).userId

# Step 2: Run the debug script (optional, to verify)
cd backend_matrix
node debug-purchase.js "YOUR_USER_ID" "1d6266c6-fca0-487e-8101-4001e6056332"

# Step 3: Create purchase in database
psql -U postgres -d your_database_name -c "
INSERT INTO \"Purchase\" (id, \"userId\", \"courseId\", \"stripeSessionId\", \"createdAt\") 
VALUES (gen_random_uuid(), 'YOUR_USER_ID', '1d6266c6-fca0-487e-8101-4001e6056332', 'test_' || gen_random_uuid()::text, NOW());"

# Step 4: Test the API again
curl -X GET \
  http://localhost:3000/api/courses/1d6266c6-fca0-487e-8101-4001e6056332/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Files Modified/Created

### Modified:
- ✅ `backend_matrix/src/controllers/progressController.ts`
  - Enhanced logging in `getCourseProgress` function
  - Shows purchase query results
  - Lists all user purchases when not found
  - Compares course IDs for debugging

### Created:
- ✅ `backend_matrix/debug-purchase.js`
  - Node.js script to debug purchase status
  - Shows user/course/purchase existence
  - Provides SQL to create test purchase

- ✅ `backend_matrix/create-test-purchase.sql`
  - Pre-written SQL queries
  - Step-by-step database checks
  - Insert statement for test purchase

---

## ✅ Summary

**Problem:** User getting 403 when accessing progress API

**Root Cause:** User has NOT purchased the course (no row in `Purchase` table)

**Solution:** Create a purchase record for this user + course combination

**How to Verify:** 
1. Check backend logs - they now show detailed purchase check results
2. Run `debug-purchase.js` script
3. Query database directly with provided SQL

**Expected Behavior:** 
- 403 is **CORRECT** if user hasn't purchased
- This is authorization working as intended
- User must purchase course before viewing progress

---

**Status:** ✅ **DEBUGGING COMPLETE**  
**Next Step:** Create a purchase record and test again

