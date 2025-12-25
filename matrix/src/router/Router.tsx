import { Route, Routes } from 'react-router-dom';

// Layout
import MainLayout from '../layout/MainLayout';
import AuthGuard from '../components/layout/AuthGuard';

// Public Pages
import LoginPage from '../pages/Authentication/Login/LoginPage';
import RegisterPage from '../pages/Authentication/Register/RegisterPage';
import HomePage from '../pages/HomePage/HomePage';
import CoursePage from '../pages/Course/CoursePage';
import CourseDetailsPage from '../pages/Course/CourseDetailsPage';

// Protected Pages
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UserSettingsPage from '../pages/User/UserSettingsPage';
import SettingsPage from '../pages/User/SettingsPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import LearnPage from '../pages/Learn/LearnPage';

// ============================================
// Router Component
// ============================================

const Router = () => {
  return (
    <Routes>
      {/* ============================================ */}
      {/* Public Routes - Visible to everyone */}
      {/* ============================================ */}

      {/* Home / Catalog */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />

      {/* Course Catalog */}
      <Route
        path="/courses"
        element={
          <MainLayout>
            <CoursePage />
          </MainLayout>
        }
      />

      {/* Course Landing Page (Hybrid view - different for enrolled users) */}
      <Route
        path="/courses/:courseId"
        element={
          <MainLayout>
            <CourseDetailsPage />
          </MainLayout>
        }
      />

      {/* ============================================ */}
      {/* Auth Routes - Redirect if already logged in */}
      {/* ============================================ */}

      {/* Login Page */}
      <Route
        path="/login"
        element={
          <AuthGuard requireGuest guestRedirectTo="/dashboard">
            <LoginPage />
          </AuthGuard>
        }
      />

      {/* Register Page */}
      <Route
        path="/register"
        element={
          <AuthGuard requireGuest guestRedirectTo="/dashboard">
            <RegisterPage />
          </AuthGuard>
        }
      />

      {/* ============================================ */}
      {/* Protected Routes - Require authentication */}
      {/* ============================================ */}

      {/* Dashboard - My Learning */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* User Account Page */}
      <Route
        path="/account"
        element={
          <AuthGuard>
            <MainLayout>
              <UserSettingsPage />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* User Profile/Settings Page */}
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Settings Page (alias) */}
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Checkout Page */}
      <Route
        path="/checkout/:courseId"
        element={
          <AuthGuard>
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Video Player / Learn Page (no MainLayout for cinema mode) */}
      <Route
        path="/learn/:courseId/lessons/:lessonId"
        element={
          <AuthGuard>
            <LearnPage />
          </AuthGuard>
        }
      />

      {/* ============================================ */}
      {/* Fallback / 404 */}
      {/* ============================================ */}

      <Route
        path="*"
        element={
          <MainLayout>
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">404</h1>
              <p className="mt-2 text-slate-500">Page not found</p>
            </div>
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default Router;
