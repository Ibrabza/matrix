// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// Alias for backward compatibility
export type AuthResponse = LoginResponse;

// ============================================
// User Profile Types
// ============================================

export interface UpdateProfileRequest {
  email?: string;
  name?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// ============================================
// Course Types
// ============================================

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  instructor: string;
  category: Category;
  categoryId: string;
  lessonsCount: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetail extends Course {
  fullDescription?: string;
  lessons: LessonPreview[];
  // These fields are populated when user is logged in
  hasPurchased?: boolean;
  progress?: CourseProgress;
}

export interface LessonPreview {
  id: string;
  title: string;
  description?: string;
  duration: string;
  order: number;
  isFree: boolean;
  // videoUrl is NOT included in preview (only in full Lesson when purchased)
}

// ============================================
// Lesson Types
// ============================================

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string; // Only available if user has purchased the course
  duration: string;
  order: number;
  courseId: string;
  isFree: boolean;
  isCompleted?: boolean; // User's progress status
}

// ============================================
// Progress Types
// ============================================

export interface CourseProgress {
  completedLessons: string[]; // Array of lesson IDs
  totalLessons: number;
  percentage: number;
}

export interface UpdateProgressRequest {
  isCompleted: boolean;
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
}

// ============================================
// Catalog / Pagination Types
// ============================================

export interface CatalogFilters {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// Checkout Types
// ============================================

export interface CreateCheckoutSessionRequest {
  courseId: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

// ============================================
// API Error Types
// ============================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================
// Health Check Types
// ============================================

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}
