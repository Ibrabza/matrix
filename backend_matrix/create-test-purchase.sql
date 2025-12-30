-- ============================================
-- Create Test Purchase
-- ============================================
-- This SQL script creates a test purchase for debugging the 403 error.
-- Replace the placeholder values with your actual user ID and course ID.

-- STEP 1: Check if user exists
SELECT id, email, name 
FROM "User" 
WHERE id = 'YOUR_USER_ID_HERE';
-- Expected: Should return 1 row with user details

-- STEP 2: Check if course exists
SELECT id, title, price 
FROM "Course" 
WHERE id = '1d6266c6-fca0-487e-8101-4001e6056332';
-- Expected: Should return 1 row with course details

-- STEP 3: Check if purchase already exists
SELECT * 
FROM "Purchase" 
WHERE "userId" = 'YOUR_USER_ID_HERE' 
AND "courseId" = '1d6266c6-fca0-487e-8101-4001e6056332';
-- Expected: If empty, user hasn't purchased the course yet

-- STEP 4: Create test purchase (if not exists)
-- IMPORTANT: Replace YOUR_USER_ID_HERE with the actual user ID
INSERT INTO "Purchase" (
  "id", 
  "userId", 
  "courseId", 
  "stripeSessionId", 
  "createdAt"
)
VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  '1d6266c6-fca0-487e-8101-4001e6056332',
  'test_session_' || gen_random_uuid()::text,
  NOW()
)
ON CONFLICT ("userId", "courseId") DO NOTHING;
-- This will create a purchase record for testing

-- STEP 5: Verify purchase was created
SELECT 
  p.id,
  p."userId",
  p."courseId",
  p."createdAt",
  u.email as "userEmail",
  c.title as "courseTitle"
FROM "Purchase" p
JOIN "User" u ON p."userId" = u.id
JOIN "Course" c ON p."courseId" = c.id
WHERE p."userId" = 'YOUR_USER_ID_HERE'
AND p."courseId" = '1d6266c6-fca0-487e-8101-4001e6056332';
-- Expected: Should return 1 row showing the purchase was created

-- ============================================
-- Additional Debugging Queries
-- ============================================

-- List all purchases for a user
SELECT 
  p.id,
  p."courseId",
  c.title as "courseTitle",
  p."createdAt"
FROM "Purchase" p
JOIN "Course" c ON p."courseId" = c.id
WHERE p."userId" = 'YOUR_USER_ID_HERE'
ORDER BY p."createdAt" DESC;

-- List all courses (to get valid course IDs)
SELECT id, title, price 
FROM "Course" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- List all users (to get valid user IDs)
SELECT id, email, name 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Delete test purchase (if needed)
-- DELETE FROM "Purchase" 
-- WHERE "userId" = 'YOUR_USER_ID_HERE'
-- AND "courseId" = '1d6266c6-fca0-487e-8101-4001e6056332';

