import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { queryKeys } from '../lib/query-client';
import type { Lesson, UpdateProgressRequest, CourseProgress } from '../types/api';

// ============================================
// API Functions
// ============================================

const lessonApi = {
  // Get lesson details (requires auth + course ownership)
  getLessonById: async (id: string): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },

  // Update lesson progress
  updateProgress: async (params: {
    courseId: string;
    lessonId: string;
    data: UpdateProgressRequest;
  }): Promise<void> => {
    console.log('✏️ [Frontend] Updating lesson progress', {
      courseId: params.courseId,
      lessonId: params.lessonId,
      data: params.data
    });
    try {
      await apiClient.put(
        `/courses/${params.courseId}/lessons/${params.lessonId}/progress`,
        params.data
      );
      console.log('✅ [Frontend] Lesson progress updated successfully');
    } catch (error) {
      console.error('❌ [Frontend] Failed to update lesson progress', {
        courseId: params.courseId,
        lessonId: params.lessonId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
};

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook to fetch lesson details
 * Only works if user has purchased the course
 */
export const useLesson = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.lessons.detail(id),
    queryFn: () => lessonApi.getLessonById(id),
    enabled: options?.enabled ?? !!id,
    retry: false, // Don't retry - might fail due to auth/ownership
  });
};

/**
 * Hook for marking lesson as complete/incomplete
 * Includes optimistic updates
 */
export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lessonApi.updateProgress,
    
    // Optimistic update
    onMutate: async ({ courseId, lessonId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.progress(courseId) });

      // Snapshot previous value
      const previousProgress = queryClient.getQueryData<CourseProgress>(
        queryKeys.courses.progress(courseId)
      );

      // Optimistically update course progress
      if (previousProgress) {
        const newCompletedLessons = data.isCompleted
          ? [...previousProgress.completedLessons, lessonId]
          : previousProgress.completedLessons.filter((id) => id !== lessonId);

        queryClient.setQueryData<CourseProgress>(queryKeys.courses.progress(courseId), {
          ...previousProgress,
          completedLessons: newCompletedLessons,
          percentage: Math.round((newCompletedLessons.length / previousProgress.totalLessons) * 100),
        });
      }

      // Also update the lesson in cache if it exists
      const previousLesson = queryClient.getQueryData<Lesson>(queryKeys.lessons.detail(lessonId));
      if (previousLesson) {
        queryClient.setQueryData<Lesson>(queryKeys.lessons.detail(lessonId), {
          ...previousLesson,
          isCompleted: data.isCompleted,
        });
      }

      return { previousProgress, previousLesson, courseId, lessonId };
    },

    // Rollback on error
    onError: (_error, _variables, context) => {
      if (context?.previousProgress && context.courseId) {
        queryClient.setQueryData(
          queryKeys.courses.progress(context.courseId),
          context.previousProgress
        );
      }
      if (context?.previousLesson && context.lessonId) {
        queryClient.setQueryData(
          queryKeys.lessons.detail(context.lessonId),
          context.previousLesson
        );
      }
    },

    // Refetch after success to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.progress(variables.courseId) 
      });
    },
  });
};

/**
 * Hook for marking lesson as complete (convenience wrapper)
 */
export const useMarkLessonComplete = () => {
  const mutation = useUpdateLessonProgress();

  return {
    ...mutation,
    markComplete: (courseId: string, lessonId: string) =>
      mutation.mutate({ courseId, lessonId, data: { isCompleted: true } }),
    markIncomplete: (courseId: string, lessonId: string) =>
      mutation.mutate({ courseId, lessonId, data: { isCompleted: false } }),
  };
};

// Export API functions for direct use if needed
export { lessonApi };

