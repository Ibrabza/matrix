import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { queryKeys } from '../lib/query-client';
import type { Course, CourseDetail, PaginatedResponse } from '../types/api';

// ============================================
// Types
// ============================================

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export interface EnrichedCourseDetail extends CourseDetail {
  /**
   * Helper boolean to determine if user is enrolled in the course.
   * Derived from:
   * - hasPurchased === true, OR
   * - Any lesson has a videoUrl (only available to enrolled users)
   */
  isEnrolled: boolean;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch courses catalog with pagination and filters
 * GET /api/courses?page=1&limit=10&search=react&categoryId=...
 */
const fetchCourses = async (filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);

  const queryString = params.toString();
  const url = queryString ? `/courses?${queryString}` : '/courses';

  const response = await apiClient.get<PaginatedResponse<Course>>(url);
  return response.data;
};

/**
 * Fetch single course details
 * GET /api/courses/:id
 * 
 * Response differs based on authentication:
 * - Guest: Basic course info + lesson previews (no videoUrl)
 * - Logged in: Adds hasPurchased + progress fields
 * - Enrolled: Lessons may include videoUrl
 */
const fetchCourse = async (id: string): Promise<EnrichedCourseDetail> => {
  const response = await apiClient.get<CourseDetail>(`/courses/${id}`);
  const course = response.data;

  // Derive isEnrolled from response data
  // User is enrolled if:
  // 1. hasPurchased is explicitly true, OR
  // 2. Any lesson has a videoUrl (only available to enrolled users)
  const hasVideoAccess = course.lessons?.some((lesson) => 
    'videoUrl' in lesson && lesson.videoUrl
  ) ?? false;

  const isEnrolled = course.hasPurchased === true || hasVideoAccess;

  return {
    ...course,
    isEnrolled,
  };
};

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook to fetch courses catalog with pagination and filters
 * 
 * @param params - Filter parameters (page, limit, search, categoryId)
 * @returns Query result with paginated courses
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCourses({ 
 *   page: 1, 
 *   limit: 12, 
 *   search: 'react' 
 * });
 * 
 * // Access courses
 * data?.data.map(course => ...)
 * 
 * // Access pagination meta
 * data?.meta.totalPages
 * ```
 */
export const useCourses = (params: CourseFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => fetchCourses(params),
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch single course details
 * 
 * @param id - Course ID
 * @param options - Query options
 * @returns Query result with enriched course detail including isEnrolled helper
 * 
 * @example
 * ```tsx
 * const { data: course, isLoading } = useCourse('course-123');
 * 
 * if (course?.isEnrolled) {
 *   // User has purchased, show full content
 * } else {
 *   // Show preview + purchase button
 * }
 * ```
 */
export const useCourse = (
  id: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => fetchCourse(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Hook to prefetch course details (for hover/preloading)
 * 
 * @example
 * ```tsx
 * const prefetch = usePrefetchCourse();
 * 
 * <CourseCard onMouseEnter={() => prefetch(course.id)} />
 * ```
 */
export const usePrefetchCourse = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses.detail(id),
      queryFn: () => fetchCourse(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

/**
 * Hook to invalidate courses cache (after purchase, etc.)
 * 
 * @example
 * ```tsx
 * const invalidate = useInvalidateCourses();
 * 
 * // After successful purchase
 * invalidate.all();        // Invalidate all course queries
 * invalidate.course(id);   // Invalidate specific course
 * ```
 */
export const useInvalidateCourses = () => {
  const queryClient = useQueryClient();

  return {
    all: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
    list: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
    },
    course: (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(id) });
    },
  };
};

