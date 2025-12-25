// Auth Service
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
  authApi,
} from './auth.service';

// Course Service
export {
  useCourses,
  useCourse,
  useCourseProgress,
  useCreateCheckoutSession,
  usePrefetchCourse,
  courseApi,
} from './course.service';

// Lesson Service
export {
  useLesson,
  useUpdateLessonProgress,
  useMarkLessonComplete,
  lessonApi,
} from './lesson.service';

