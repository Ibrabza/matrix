export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  category: string;
  progress: number;
  duration: string;
  lessonsCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  fullDescription: string;
  lastWatchedLessonId?: string;
  lastWatchedLessonTitle?: string;
  modules: Module[];
  totalDuration: string;
  enrolledStudents: number;
  rating: number;
  reviewsCount: number;
  updatedAt: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  whatYouWillLearn: string[];
}
