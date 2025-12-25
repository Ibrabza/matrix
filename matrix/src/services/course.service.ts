import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { queryKeys } from '../lib/query-client';
import type {
  Course,
  CourseDetail,
  CourseProgress,
  PaginatedResponse,
  CatalogFilters,
  CreateCheckoutSessionRequest,
  CheckoutSession,
} from '../types/api';

// ============================================
// API Functions
// ============================================

const courseApi = {
  // Get course catalog with pagination and filters
  getCourses: async (filters: Partial<CatalogFilters> = {}): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);

    const response = await apiClient.get<PaginatedResponse<Course>>(`/courses?${params.toString()}`);
    return response.data;
  },

  // Get single course details
  getCourseById: async (id: string): Promise<CourseDetail> => {
    const response = await apiClient.get<CourseDetail>(`/courses/${id}`);
    return response.data;
  },

  // Get course progress (requires auth)
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await apiClient.get<CourseProgress>(`/courses/${courseId}/progress`);
    return response.data;
  },

  // Create checkout session for course purchase
  createCheckoutSession: async (data: CreateCheckoutSessionRequest): Promise<CheckoutSession> => {
    const response = await apiClient.post<CheckoutSession>('/checkout/create-session', data);
    return response.data;
  },
};

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook to fetch course catalog with pagination and filters
 */
export const useCourses = (filters: Partial<CatalogFilters> = {}) => {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => courseApi.getCourses(filters),
  });
};

/**
 * Hook to fetch single course details
 */
export const useCourse = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => courseApi.getCourseById(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Hook to fetch course progress
 */
export const useCourseProgress = (courseId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.courses.progress(courseId),
    queryFn: () => courseApi.getCourseProgress(courseId),
    enabled: options?.enabled ?? !!courseId,
  });
};

/**
 * Hook for creating checkout session (course purchase)
 */
export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: courseApi.createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
};

/**
 * Hook to prefetch course details (for hover/preloading)
 */
export const usePrefetchCourse = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses.detail(id),
      queryFn: () => courseApi.getCourseById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

// Export API functions for direct use if needed
export { courseApi };

