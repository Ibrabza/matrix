// Theme hook
export { ThemeProvider, useTheme } from './useTheme';

// Auth hook
export { AuthProvider, useAuth, withAuth } from './useAuth';

// Courses hooks
export {
  useCourses,
  useCourse,
  usePrefetchCourse,
  useInvalidateCourses,
  type CourseFilters,
  type EnrichedCourseDetail,
} from './use-courses';

// Lessons hooks
export {
  useLesson,
  useMarkLessonComplete,
  useToggleLessonComplete,
  useCourseProgress,
  useIsLessonCompleted,
  type MarkCompleteParams,
  type LessonWithProgress,
} from './use-lessons';

// Checkout hooks
export {
  buyCourse,
  useBuyCourse,
  usePurchaseCourse,
  type BuyCourseParams,
  type CheckoutResponse,
} from './use-checkout';
