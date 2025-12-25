import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { queryKeys } from '../lib/query-client';
import type { Lesson, CourseProgress } from '../types/api';
import type { EnrichedCourseDetail } from './use-courses';

// ============================================
// Types
// ============================================

export interface MarkCompleteParams {
  courseId: string;
  lessonId: string;
  isCompleted?: boolean; // Defaults to true
}

export interface LessonWithProgress extends Lesson {
  /**
   * Helper to check if lesson is completed
   * Derived from isCompleted field or progress data
   */
  completed: boolean;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch lesson details
 * GET /api/lessons/:id
 * 
 * Requires authentication + course ownership
 * Returns full lesson data including videoUrl
 */
const fetchLesson = async (id: string): Promise<Lesson> => {
  const response = await apiClient.get<Lesson>(`/lessons/${id}`);
  return response.data;
};

/**
 * Update lesson progress
 * PUT /api/courses/:courseId/lessons/:lessonId/progress
 */
const updateLessonProgress = async (params: MarkCompleteParams): Promise<void> => {
  const { courseId, lessonId, isCompleted = true } = params;
  await apiClient.put(`/courses/${courseId}/lessons/${lessonId}/progress`, {
    isCompleted,
  });
};

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook to fetch lesson details
 * 
 * @param id - Lesson ID
 * @param options - Query options
 * @returns Query result with lesson data
 * 
 * @example
 * ```tsx
 * const { data: lesson, isLoading, error } = useLesson('lesson-123');
 * 
 * if (lesson?.videoUrl) {
 *   // Render video player
 * }
 * ```
 */
export const useLesson = (
  id: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.lessons.detail(id),
    queryFn: () => fetchLesson(id),
    enabled: options?.enabled ?? !!id,
    retry: false, // Don't retry - might fail due to auth/ownership
  });
};

/**
 * Hook to mark a lesson as complete (or incomplete)
 * 
 * Features:
 * - Optimistic update: Immediately shows lesson as completed
 * - Rollback on error: Reverts to previous state if API fails
 * - Cache updates: Updates both lesson and course progress caches
 * 
 * @example
 * ```tsx
 * const markComplete = useMarkLessonComplete();
 * 
 * // Mark as complete
 * markComplete.mutate({ 
 *   courseId: 'course-123', 
 *   lessonId: 'lesson-456' 
 * });
 * 
 * // Mark as incomplete
 * markComplete.mutate({ 
 *   courseId: 'course-123', 
 *   lessonId: 'lesson-456',
 *   isCompleted: false 
 * });
 * 
 * // With callbacks
 * markComplete.mutate(
 *   { courseId, lessonId },
 *   {
 *     onSuccess: () => toast.success('Lesson completed!'),
 *     onError: (error) => toast.error(error.message),
 *   }
 * );
 * ```
 */
export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLessonProgress,

    // ============================================
    // Optimistic Update
    // ============================================
    onMutate: async ({ courseId, lessonId, isCompleted = true }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.lessons.detail(lessonId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.progress(courseId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.detail(courseId) });

      // Snapshot previous values for rollback
      const previousLesson = queryClient.getQueryData<Lesson>(
        queryKeys.lessons.detail(lessonId)
      );
      const previousProgress = queryClient.getQueryData<CourseProgress>(
        queryKeys.courses.progress(courseId)
      );
      const previousCourse = queryClient.getQueryData<EnrichedCourseDetail>(
        queryKeys.courses.detail(courseId)
      );

      // ----------------------------------------
      // Optimistic update: Lesson cache
      // ----------------------------------------
      if (previousLesson) {
        queryClient.setQueryData<Lesson>(queryKeys.lessons.detail(lessonId), {
          ...previousLesson,
          isCompleted,
        });
      }

      // ----------------------------------------
      // Optimistic update: Course progress cache
      // ----------------------------------------
      if (previousProgress) {
        const newCompletedLessons = isCompleted
          ? [...new Set([...previousProgress.completedLessons, lessonId])]
          : previousProgress.completedLessons.filter((id) => id !== lessonId);

        queryClient.setQueryData<CourseProgress>(queryKeys.courses.progress(courseId), {
          ...previousProgress,
          completedLessons: newCompletedLessons,
          percentage: Math.round(
            (newCompletedLessons.length / previousProgress.totalLessons) * 100
          ),
        });
      }

      // ----------------------------------------
      // Optimistic update: Course detail cache (lesson list)
      // ----------------------------------------
      if (previousCourse?.lessons) {
        const updatedLessons = previousCourse.lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, isCompleted }
            : lesson
        );

        queryClient.setQueryData<EnrichedCourseDetail>(queryKeys.courses.detail(courseId), {
          ...previousCourse,
          lessons: updatedLessons,
        });
      }

      // Return context for rollback
      return { previousLesson, previousProgress, previousCourse, courseId, lessonId };
    },

    // ============================================
    // Rollback on Error
    // ============================================
    onError: (_error, _variables, context) => {
      // Restore lesson cache
      if (context?.previousLesson && context.lessonId) {
        queryClient.setQueryData(
          queryKeys.lessons.detail(context.lessonId),
          context.previousLesson
        );
      }

      // Restore progress cache
      if (context?.previousProgress && context.courseId) {
        queryClient.setQueryData(
          queryKeys.courses.progress(context.courseId),
          context.previousProgress
        );
      }

      // Restore course detail cache
      if (context?.previousCourse && context.courseId) {
        queryClient.setQueryData(
          queryKeys.courses.detail(context.courseId),
          context.previousCourse
        );
      }
    },

    // ============================================
    // Refetch after success (ensure consistency)
    // ============================================
    onSettled: (_data, _error, variables) => {
      // Invalidate queries to refetch fresh data from server
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.progress(variables.courseId),
      });
    },
  });
};

/**
 * Convenience hook for toggling lesson completion
 * 
 * @example
 * ```tsx
 * const { toggleComplete, isToggling } = useToggleLessonComplete();
 * 
 * <Button 
 *   loading={isToggling}
 *   onClick={() => toggleComplete(courseId, lessonId, currentStatus)}
 * >
 *   {currentStatus ? 'Mark Incomplete' : 'Mark Complete'}
 * </Button>
 * ```
 */
export const useToggleLessonComplete = () => {
  const mutation = useMarkLessonComplete();

  return {
    toggleComplete: (courseId: string, lessonId: string, currentlyCompleted: boolean) => {
      mutation.mutate({
        courseId,
        lessonId,
        isCompleted: !currentlyCompleted,
      });
    },
    markComplete: (courseId: string, lessonId: string) => {
      mutation.mutate({ courseId, lessonId, isCompleted: true });
    },
    markIncomplete: (courseId: string, lessonId: string) => {
      mutation.mutate({ courseId, lessonId, isCompleted: false });
    },
    isToggling: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook to fetch course progress
 * 
 * @param courseId - Course ID
 * @returns Query result with progress data
 * 
 * @example
 * ```tsx
 * const { data: progress } = useCourseProgress('course-123');
 * 
 * // Check if lesson is completed
 * const isCompleted = progress?.completedLessons.includes(lessonId);
 * 
 * // Get percentage
 * const percent = progress?.percentage ?? 0;
 * ```
 */
export const useCourseProgress = (
  courseId: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.courses.progress(courseId),
    queryFn: async () => {
      const response = await apiClient.get<CourseProgress>(
        `/courses/${courseId}/progress`
      );
      return response.data;
    },
    enabled: options?.enabled ?? !!courseId,
  });
};

/**
 * Helper hook to check if a specific lesson is completed
 * 
 * @example
 * ```tsx
 * const isCompleted = useIsLessonCompleted('course-123', 'lesson-456');
 * ```
 */
export const useIsLessonCompleted = (courseId: string, lessonId: string): boolean => {
  const { data: progress } = useCourseProgress(courseId, {
    enabled: !!courseId && !!lessonId,
  });

  return progress?.completedLessons.includes(lessonId) ?? false;
};

