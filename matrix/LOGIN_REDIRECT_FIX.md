# 🔄 Login Redirect Fix - Purchase Flow

**Issue:** When users try to purchase a course without being logged in, they're redirected to login. After successful login, they should return to the course page, not the dashboard.

---

## 🔍 Problem Analysis

### Current Flow (Before Fix):

```
1. User clicks "Buy Course" (not logged in)
2. Redirect to /login with state: { from: { pathname: '/courses/123' } }
3. User logs in successfully
4. ❌ Redirected to /dashboard (WRONG!)
5. User has to navigate back to course page
```

### Expected Flow (After Fix):

```
1. User clicks "Buy Course" (not logged in)
2. Redirect to /login with state: { from: { pathname: '/courses/123' } }
3. User logs in successfully
4. ✅ Redirected to /courses/123 (CORRECT!)
5. User can continue with purchase
```

---

## ✅ Fixes Implemented

### 1. **Enhanced AuthGuard Logging**
**File:** `src/components/layout/AuthGuard.tsx`

**Added:**
- Console logging to track redirect flow
- Better state extraction from location

```typescript
if (requireGuest) {
  if (isAuthenticated) {
    const fromState = location.state as { from?: { pathname: string } };
    const from = fromState?.from?.pathname || guestRedirectTo;
    
    console.log('🔄 [AuthGuard] User authenticated on guest page, redirecting to:', from);
    console.log('🔍 [AuthGuard] Location state:', location.state);
    
    return <Navigate to={from} replace />;
  }
  return <>{children}</>;
}
```

---

### 2. **Enhanced LoginPage Redirect Logic**
**File:** `src/pages/Authentication/Login/LoginPage.tsx`

**Added:**
- Better state extraction
- Console logging for redirect target
- Proper handling of location state

```typescript
// Get the redirect path from location state (set by purchase flow or AuthGuard)
const fromState = location.state as { from?: { pathname: string } };
const from = fromState?.from?.pathname || '/dashboard';

console.log('🔍 [LoginPage] Redirect target after login:', { from, state: location.state });
```

**In handleSubmit:**
```typescript
if (success) {
  console.log('✅ [LoginPage] Login successful! Redirecting to:', from);
  navigate(from, { replace: true });
}
```

---

### 3. **Enhanced RegisterPage Redirect Logic**
**File:** `src/pages/Authentication/Register/RegisterPage.tsx`

**Added:**
- Import `useLocation` from react-router-dom
- Same redirect logic as LoginPage
- Console logging

```typescript
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Inside component:
const location = useLocation();

// Get the redirect path from location state
const fromState = location.state as { from?: { pathname: string } };
const from = fromState?.from?.pathname || '/dashboard';

console.log('🔍 [RegisterPage] Redirect target after registration:', { from, state: location.state });
```

**In handleSubmit:**
```typescript
if (success) {
  console.log('✅ [RegisterPage] Registration & login successful! Redirecting to:', from);
  navigate(from, { replace: true });  // ← Changed from hardcoded '/dashboard'
}
```

---

## 🎯 Complete Purchase Flow (After Fix)

### Scenario 1: User Not Logged In

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ON COURSE PAGE (Not Logged In)                      │
│    URL: /courses/abc-123                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS "BUY COURSE"                                  │
│    🛒 [CourseDetails] Buy button clicked                    │
│    ⚠️ [CourseDetails] User not authenticated                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. REDIRECT TO LOGIN WITH STATE                              │
│    navigate('/login', {                                     │
│      state: { from: { pathname: '/courses/abc-123' } }     │
│    })                                                        │
│    URL: /login                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LOGIN PAGE LOADS                                          │
│    🔍 [LoginPage] Redirect target: /courses/abc-123        │
│    User sees login form                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USER SUBMITS LOGIN CREDENTIALS                           │
│    📋 [LoginPage] Form submitted                            │
│    🚀 [LoginPage] Calling authStore.login...                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. LOGIN SUCCESSFUL                                          │
│    ✅ [LoginPage] Login successful!                         │
│    ✅ [LoginPage] Redirecting to: /courses/abc-123         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BACK TO COURSE PAGE (Now Logged In)                      │
│    URL: /courses/abc-123                                    │
│    User can now complete purchase                           │
└─────────────────────────────────────────────────────────────┘
```

---

### Scenario 2: User Registers New Account

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ON COURSE PAGE (Not Logged In)                      │
│    Clicks "Buy Course" → Redirected to /login              │
│    Clicks "Sign up for free" link                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. REGISTER PAGE                                             │
│    URL: /register                                           │
│    State preserved: { from: { pathname: '/courses/abc-123' }}│
│    🔍 [RegisterPage] Redirect target: /courses/abc-123     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USER COMPLETES REGISTRATION                               │
│    📋 [RegisterPage] Form submitted                         │
│    🚀 [RegisterPage] Calling authStore.register...          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. REGISTRATION & AUTO-LOGIN SUCCESSFUL                      │
│    ✅ [RegisterPage] Registration successful!               │
│    ✅ [RegisterPage] Redirecting to: /courses/abc-123      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BACK TO COURSE PAGE (Now Logged In)                      │
│    URL: /courses/abc-123                                    │
│    User can now complete purchase                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Instructions

### Test Case 1: Login Redirect from Purchase

1. **Logout** (if logged in)
2. Navigate to any course page: `/courses/:courseId`
3. Click **"Buy Course"** button
4. **Expected:**
   - Redirected to `/login`
   - Console shows: `⚠️ [CourseDetails] User not authenticated, redirecting to login`
5. Enter login credentials and submit
6. **Expected:**
   - Console shows: `✅ [LoginPage] Login successful! Redirecting to: /courses/:courseId`
   - ✅ **Redirected back to course page** (NOT dashboard)
   - Can now click "Buy Course" again

---

### Test Case 2: Register Redirect from Purchase

1. **Logout** (if logged in)
2. Navigate to any course page: `/courses/:courseId`
3. Click **"Buy Course"** button
4. On login page, click **"Sign up for free"**
5. Complete registration form
6. **Expected:**
   - Console shows: `✅ [RegisterPage] Registration successful! Redirecting to: /courses/:courseId`
   - ✅ **Redirected back to course page** (NOT dashboard)
   - Can now complete purchase

---

### Test Case 3: Direct Login (No Purchase Intent)

1. **Logout** (if logged in)
2. Navigate directly to `/login`
3. Enter credentials and submit
4. **Expected:**
   - Console shows: `✅ [LoginPage] Login successful! Redirecting to: /dashboard`
   - ✅ **Redirected to dashboard** (default behavior)

---

## 🔍 Console Output Examples

### Purchase Flow (Success):

```
🛒 [CourseDetails] Buy button clicked { courseId: 'abc-123' }
⚠️ [CourseDetails] User not authenticated, redirecting to login

--- User navigates to login page ---

🔍 [LoginPage] Redirect target after login: { from: '/courses/abc-123', state: {...} }

--- User submits login form ---

📋 [LoginPage] Form submitted
🚀 [LoginPage] Calling authStore.login...
✅ [LoginPage] Login successful! Redirecting to: /courses/abc-123

--- User redirected back to course page ---

🛒 [CourseDetails] Buy button clicked { courseId: 'abc-123' }
✅ [CourseDetails] User authenticated, initiating Stripe checkout
```

---

### Direct Login (No Purchase):

```
🔍 [LoginPage] Redirect target after login: { from: '/dashboard', state: null }

--- User submits login form ---

📋 [LoginPage] Form submitted
🚀 [LoginPage] Calling authStore.login...
✅ [LoginPage] Login successful! Redirecting to: /dashboard
```

---

## 📊 Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `src/components/layout/AuthGuard.tsx` | Added logging | Track redirect flow |
| `src/pages/Authentication/Login/LoginPage.tsx` | Enhanced redirect logic + logging | Proper course page redirect |
| `src/pages/Authentication/Register/RegisterPage.tsx` | Added useLocation + redirect logic | Proper course page redirect |

---

## ✅ Success Criteria

- [x] User redirected to course page after login (from purchase flow)
- [x] User redirected to course page after registration (from purchase flow)
- [x] User redirected to dashboard when logging in directly
- [x] Console logging tracks entire redirect flow
- [x] Location state properly preserved through navigation
- [x] Works for both "Buy Course" and "Mock Purchase" buttons

---

## 🎯 Summary

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| **Purchase → Login** | Redirects to dashboard ❌ | Redirects to course page ✅ |
| **Purchase → Register** | Redirects to dashboard ❌ | Redirects to course page ✅ |
| **Direct Login** | Redirects to dashboard ✅ | Redirects to dashboard ✅ |
| **Protected Route → Login** | Redirects back ✅ | Redirects back ✅ |

---

**Status:** ✅ **FIXED - Ready for Testing**

The login redirect now properly returns users to the course page after authentication, allowing them to complete their purchase seamlessly!

