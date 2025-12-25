import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Spin } from 'antd';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// Types
// ============================================

interface AuthGuardProps {
  children: React.ReactNode;
  /** Redirect path if not authenticated (default: /login) */
  redirectTo?: string;
  /** If true, redirects authenticated users away (for login/register pages) */
  requireGuest?: boolean;
  /** Redirect path for authenticated users when requireGuest is true */
  guestRedirectTo?: string;
}

// ============================================
// Loading Spinner Component
// ============================================

const FullPageLoader = observer(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-50 ${
        isDark ? 'bg-slate-950' : 'bg-slate-50'
      }`}
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span
            className={`font-bold tracking-tighter text-2xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            MATRIX
          </span>
        </div>
      </div>

      {/* Spinner */}
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className={`w-10 h-10 animate-spin ${
            isDark ? 'text-purple-400' : 'text-purple-500'
          }`}
        />
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Loading...
        </p>
      </div>
    </div>
  );
});

// ============================================
// AuthGuard Component
// ============================================

/**
 * AuthGuard - Route protection wrapper using MobX
 * 
 * Features:
 * - Observes authStore for authentication state
 * - Shows full-page loader while checking auth
 * - Redirects to login if not authenticated
 * - Saves current location for post-login redirect
 * - Can also protect routes from authenticated users (login/register)
 * 
 * @example
 * ```tsx
 * // Protect route - require authentication
 * <AuthGuard>
 *   <DashboardPage />
 * </AuthGuard>
 * 
 * // Redirect authenticated users (for login page)
 * <AuthGuard requireGuest guestRedirectTo="/dashboard">
 *   <LoginPage />
 * </AuthGuard>
 * ```
 */
const AuthGuard = observer(({
  children,
  redirectTo = '/login',
  requireGuest = false,
  guestRedirectTo = '/',
}: AuthGuardProps) => {
  const location = useLocation();
  const { authStore } = useStore();

  const { user, token, isLoading } = authStore;
  const isAuthenticated = !!token && !!user;

  // ============================================
  // Check token validity on mount
  // ============================================
  
  useEffect(() => {
    // If we have a token but no user, try to fetch user
    if (token && !user && !isLoading) {
      authStore.fetchCurrentUser();
    }
  }, [token, user, isLoading, authStore]);

  // ============================================
  // Loading State - Show spinner while checking auth
  // ============================================
  
  // Show loader while:
  // 1. Auth store is loading
  // 2. We have a token but haven't fetched user yet
  const isCheckingAuth = isLoading || (token && !user);

  if (isCheckingAuth) {
    return <FullPageLoader />;
  }

  // ============================================
  // Guest Routes (login/register)
  // ============================================
  
  if (requireGuest) {
    // If user is authenticated, redirect away from login/register
    if (isAuthenticated) {
      // Check if there's a redirect URL in location state
      const from = (location.state as { from?: Location })?.from?.pathname || guestRedirectTo;
      return <Navigate to={from} replace />;
    }
    // User is guest, show the page
    return <>{children}</>;
  }

  // ============================================
  // Protected Routes
  // ============================================
  
  if (!isAuthenticated) {
    // Save current location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
});

// ============================================
// Exports
// ============================================

export { FullPageLoader };
export default AuthGuard;

