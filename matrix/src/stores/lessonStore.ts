import { makeAutoObservable, runInAction, observable } from 'mobx';
import apiClient from '../services/apiClient';
import type { Lesson, CourseProgress } from '../types/api';

class LessonStore {
  currentLesson: Lesson | null = null;

  // Map of lessonId -> isCompleted (for optimistic updates)
  lessonProgress: Map<string, boolean> = observable.map();

  // Course progress cache: courseId -> CourseProgress
  courseProgressCache: Map<string, CourseProgress> = observable.map();

  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed: check if current lesson is completed
  get isCurrentLessonCompleted(): boolean {
    if (!this.currentLesson) return false;
    return this.lessonProgress.get(this.currentLesson.id) ?? false;
  }

  // Fetch lesson details (requires auth + course ownership)
  async fetchLesson(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient.get<Lesson>(`/lessons/${id}`);

      runInAction(() => {
        this.currentLesson = response.data;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Failed to fetch lesson';
        this.currentLesson = null;
      });
    }
  }

  // Mark lesson as complete (optimistic update)
  async markComplete(courseId: string, lessonId: string): Promise<boolean> {
    // Optimistic update - immediately mark as completed
    const previousState = this.lessonProgress.get(lessonId);
    this.lessonProgress.set(lessonId, true);

    try {
      await apiClient.put(`/courses/${courseId}/lessons/${lessonId}/progress`, {
        isCompleted: true,
      });

      // Update course progress cache if exists
      runInAction(() => {
        const cachedProgress = this.courseProgressCache.get(courseId);
        if (cachedProgress && !cachedProgress.completedLessons.includes(lessonId)) {
          cachedProgress.completedLessons.push(lessonId);
          cachedProgress.percentage = Math.round(
            (cachedProgress.completedLessons.length / cachedProgress.totalLessons) * 100
          );
        }
      });

      return true;
    } catch (error) {
      // Revert on failure
      runInAction(() => {
        if (previousState !== undefined) {
          this.lessonProgress.set(lessonId, previousState);
        } else {
          this.lessonProgress.delete(lessonId);
        }
        this.error = error instanceof Error ? error.message : 'Failed to mark lesson complete';
      });
      return false;
    }
  }

  // Mark lesson as incomplete (optimistic update)
  async markIncomplete(courseId: string, lessonId: string): Promise<boolean> {
    // Optimistic update
    const previousState = this.lessonProgress.get(lessonId);
    this.lessonProgress.set(lessonId, false);

    try {
      await apiClient.put(`/courses/${courseId}/lessons/${lessonId}/progress`, {
        isCompleted: false,
      });

      // Update course progress cache
      runInAction(() => {
        const cachedProgress = this.courseProgressCache.get(courseId);
        if (cachedProgress) {
          cachedProgress.completedLessons = cachedProgress.completedLessons.filter(
            (id) => id !== lessonId
          );
          cachedProgress.percentage = Math.round(
            (cachedProgress.completedLessons.length / cachedProgress.totalLessons) * 100
          );
        }
      });

      return true;
    } catch (error) {
      // Revert on failure
      runInAction(() => {
        if (previousState !== undefined) {
          this.lessonProgress.set(lessonId, previousState);
        } else {
          this.lessonProgress.delete(lessonId);
        }
        this.error = error instanceof Error ? error.message : 'Failed to update lesson progress';
      });
      return false;
    }
  }

  // Toggle lesson completion
  async toggleComplete(courseId: string, lessonId: string): Promise<boolean> {
    const isCurrentlyCompleted = this.lessonProgress.get(lessonId) ?? false;
    if (isCurrentlyCompleted) {
      return this.markIncomplete(courseId, lessonId);
    }
    return this.markComplete(courseId, lessonId);
  }

  // Fetch course progress and populate lessonProgress map
  async fetchCourseProgress(courseId: string): Promise<void> {
    try {
      const response = await apiClient.get<CourseProgress>(
        `/courses/${courseId}/progress`
      );

      runInAction(() => {
        // Cache the course progress
        this.courseProgressCache.set(courseId, response.data);

        // Populate lessonProgress map
        response.data.completedLessons.forEach((lessonId) => {
          this.lessonProgress.set(lessonId, true);
        });
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch progress';
      });
    }
  }

  // Check if a specific lesson is completed
  isLessonCompleted(lessonId: string): boolean {
    return this.lessonProgress.get(lessonId) ?? false;
  }

  // Get progress percentage for a course
  getCourseProgress(courseId: string): number {
    return this.courseProgressCache.get(courseId)?.percentage ?? 0;
  }

  // Clear current lesson when leaving
  clearCurrentLesson(): void {
    this.currentLesson = null;
  }

  // Clear all progress data (on logout)
  clearProgress(): void {
    this.lessonProgress.clear();
    this.courseProgressCache.clear();
    this.currentLesson = null;
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }
}

export default LessonStore;

