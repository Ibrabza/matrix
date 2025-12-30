# 🚀 Quick Test Guide - Auth Bug Fix

## Run This Now!

### Step 1: Start Backend
```bash
cd /Users/abzal/Desktop/matrix_fullstack/backend_matrix
npm run dev
```
Wait for: `✓ Server running on port 3000`

### Step 2: Start Frontend (New Terminal)
```bash
cd /Users/abzal/Desktop/matrix_fullstack/matrix
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Step 3: Test Login

1. **Open Browser:** http://localhost:5173/login
2. **Open Console:** Press `F12` → Click "Console" tab
3. **Create Test Account (Register First):**
   - Go to http://localhost:5173/register
   - Fill in:
     - Name: `Test User`
     - Email: `test@example.com`
     - Password: `password123`
     - Confirm Password: `password123`
     - Check "I agree to terms"
   - Click "Create Account"
   - **Watch Console** for logs 📊
   - **Expected:** Redirects to `/dashboard` ✅

4. **Test Login (After Registration):**
   - Logout (if there's a logout button) or clear localStorage:
     ```javascript
     // In browser console:
     localStorage.clear();
     location.reload();
     ```
   - Go to http://localhost:5173/login
   - Enter:
     - Email: `test@example.com`
     - Password: `password123`
   - Click "Sign In"
   - **Watch Console** for these logs:

### Expected Console Output:
```
📋 [LoginPage] Form submitted
✓ [LoginPage] Calling authStore.login...
🔐 [AuthStore] Starting login... { email: 'test@example.com' }
🔵 [API Response] /auth/login {...}
✅ [API Unwrapped] { token: "eyJ...", user: {...} }
✅ [AuthStore] Login response received
🎫 [AuthStore] Token extracted: ✓ Token exists
👤 [AuthStore] User extracted: { id: '...', email: '...', name: '...' }
💾 [AuthStore] Token saved to localStorage
✅ [AuthStore] Login successful, isAuthenticated: true
🔍 [LoginPage] Login result: { success: true, isAuthenticated: true }
✅ [LoginPage] Login successful! Redirecting to: /dashboard
```

### ✅ SUCCESS CRITERIA:
- [ ] Console shows all the logs above
- [ ] Browser URL changes to `/dashboard`
- [ ] You see the Dashboard page (not stuck on login!)
- [ ] Token exists in localStorage

### ❌ If Something Goes Wrong:

**Check Console for Error Logs:**
```
❌ [API Error] ...
❌ [AuthStore] Login failed: ...
```

**Common Issues:**

1. **Backend Not Running:**
   - Error: `Network Error` or `Failed to fetch`
   - Fix: Start backend with `npm run dev`

2. **Wrong Credentials:**
   - Error: `Invalid credentials`
   - Fix: Use credentials from registration or check database

3. **Still Not Redirecting:**
   - Check console logs to see where it stops
   - Verify `isAuthenticated: true` in the logs
   - Check Network tab to see the API response

---

## Verify Token Storage

**In Browser Console:**
```javascript
// Check if token exists
localStorage.getItem('matrix_auth_token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Check all localStorage
localStorage
```

---

## Test Protected Routes

1. **With Token (After Login):**
   - Go to: http://localhost:5173/dashboard
   - **Expected:** Shows dashboard ✅

2. **Without Token:**
   ```javascript
   // Clear token in console:
   localStorage.removeItem('matrix_auth_token');
   ```
   - Go to: http://localhost:5173/dashboard
   - **Expected:** Redirects to `/login` ✅

---

## Quick Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| "Network Error" | Backend running? | Start with `npm run dev` |
| Still on login page | Console logs? | Look for ❌ errors |
| No console logs | Right page? | Should be on `/login` |
| Token is undefined | Check API response | Look for "unwrapped" log |
| "Invalid credentials" | Right email/password? | Register a new account first |

---

## Fast Reset (If Needed)

```javascript
// Run this in browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

**Expected Result:** Login → See Dashboard (Not stuck on login!) ✅

If you see the dashboard, **THE BUG IS FIXED!** 🎉

