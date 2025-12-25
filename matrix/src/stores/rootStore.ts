import { createContext, useContext } from 'react';
import AuthStore from './authStore';
import CourseStore from './courseStore';
import LessonStore from './lessonStore';

// RootStore class that holds all domain stores
class RootStore {
  authStore: AuthStore;
  courseStore: CourseStore;
  lessonStore: LessonStore;

  constructor() {
    // Initialize all stores
    this.authStore = new AuthStore();
    this.courseStore = new CourseStore();
    this.lessonStore = new LessonStore();
  }

  // Reset all stores (useful for logout)
  reset(): void {
    this.authStore.logout();
    this.lessonStore.clearProgress();
    this.courseStore.clearCurrentCourse();
  }
}

// Create a single instance
const rootStore = new RootStore();

// Create context
export const StoreContext = createContext<RootStore>(rootStore);

// Custom hook to access stores
export const useStore = (): RootStore => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Individual store hooks for convenience
export const useAuthStore = (): AuthStore => {
  const { authStore } = useStore();
  return authStore;
};

export const useCourseStore = (): CourseStore => {
  const { courseStore } = useStore();
  return courseStore;
};

export const useLessonStore = (): LessonStore => {
  const { lessonStore } = useStore();
  return lessonStore;
};

// Export the root store instance
export default rootStore;

