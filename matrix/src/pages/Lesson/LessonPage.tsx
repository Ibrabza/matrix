import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Progress, Tooltip, ConfigProvider, theme as antdTheme } from 'antd';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  ArrowLeft,
  List,
  Maximize2,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

// Types
interface LessonData {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  currentIndex: number;
  totalLessons: number;
}

// Mock lesson data
const mockLessons: Record<string, LessonData> = {
  'lesson-1-1': {
    id: 'lesson-1-1',
    title: 'Course Introduction',
    description:
      'Welcome to the React Fundamentals course! In this lesson, we will go over what you will learn throughout this course, the prerequisites, and how to get the most out of your learning experience. We will also set expectations and discuss the project we will build together.',
    duration: '5:30',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    courseId: '1',
    courseTitle: 'React Fundamentals',
    moduleTitle: 'Getting Started with React',
    prevLessonId: null,
    nextLessonId: 'lesson-1-2',
    currentIndex: 1,
    totalLessons: 24,
  },
  'lesson-1-2': {
    id: 'lesson-1-2',
    title: 'Setting Up Your Development Environment',
    description:
      'Before we start coding, we need to set up our development environment. In this lesson, you will learn how to install Node.js, npm, and create your first React application using Create React App and Vite. We will also configure VS Code with essential extensions for React development.',
    duration: '12:45',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    courseId: '1',
    courseTitle: 'React Fundamentals',
    moduleTitle: 'Getting Started with React',
    prevLessonId: 'lesson-1-1',
    nextLessonId: 'lesson-1-3',
    currentIndex: 2,
    totalLessons: 24,
  },
  'lesson-1-3': {
    id: 'lesson-1-3',
    title: 'Understanding JSX',
    description:
      'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files. In this lesson, we will explore what JSX is, how it works under the hood, and best practices for writing clean JSX code. You will learn about expressions, conditionals, and lists in JSX.',
    duration: '18:20',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    courseId: '1',
    courseTitle: 'React Fundamentals',
    moduleTitle: 'Getting Started with React',
    prevLessonId: 'lesson-1-2',
    nextLessonId: 'lesson-1-4',
    currentIndex: 3,
    totalLessons: 24,
  },
  'lesson-1-4': {
    id: 'lesson-1-4',
    title: 'Your First React Component',
    description:
      'Components are the building blocks of React applications. In this hands-on lesson, you will create your first React component from scratch. We will cover function components, how to structure them, and how to compose multiple components together to build a user interface.',
    duration: '22:15',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    courseId: '1',
    courseTitle: 'React Fundamentals',
    moduleTitle: 'Getting Started with React',
    prevLessonId: 'lesson-1-3',
    nextLessonId: 'lesson-2-1',
    currentIndex: 4,
    totalLessons: 24,
  },
  'lesson-2-1': {
    id: 'lesson-2-1',
    title: 'Function vs Class Components',
    description:
      'React supports two types of components: function components and class components. In this lesson, we will compare both approaches, understand when to use each, and why function components with hooks have become the modern standard for React development.',
    duration: '15:00',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    courseId: '1',
    courseTitle: 'React Fundamentals',
    moduleTitle: 'Components & Props',
    prevLessonId: 'lesson-1-4',
    nextLessonId: 'lesson-2-2',
    currentIndex: 5,
    totalLessons: 24,
  },
  'lesson-2-2': {
    id: 'lesson-2-2',
    title: 'Props and Data Flow',
    description:
      'Props are how we pass data from parent components to child components in React. This lesson covers everything you need to know about props: passing them, destructuring, default values, and understanding the one-way data flow principle that makes React predictable.',
    duration: '20:30',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    courseId: '1',
    courseTitle: 'React Fundamentals',
    moduleTitle: 'Components & Props',
    prevLessonId: 'lesson-2-1',
    nextLessonId: null,
    currentIndex: 6,
    totalLessons: 24,
  },
};

// LocalStorage helpers
const STORAGE_KEY = 'matrix_completed_lessons';

const getCompletedLessons = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCompletedLesson = (lessonId: string): void => {
  const completed = getCompletedLessons();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }
};

const removeCompletedLesson = (lessonId: string): void => {
  const completed = getCompletedLessons();
  const filtered = completed.filter((id) => id !== lessonId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// Loading Skeleton
const LessonSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6 animate-pulse">
    <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
    <div className="flex items-center justify-between">
      <div className={`h-4 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className={`h-8 w-24 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
    </div>
    <div className={`aspect-video rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
    <div className={`h-8 w-2/3 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
    <div className={`h-20 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
  </div>
);

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (lessonId && mockLessons[lessonId]) {
        setLesson(mockLessons[lessonId]);
      } else {
        setLesson(null);
      }
      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  // Check completion status on mount and lesson change
  useEffect(() => {
    if (lessonId) {
      const completed = getCompletedLessons();
      setIsCompleted(completed.includes(lessonId));
      setCompletedCount(completed.length);
    }
  }, [lessonId]);

  // Handle mark as completed
  const handleToggleComplete = useCallback(() => {
    if (!lessonId) return;

    if (isCompleted) {
      removeCompletedLesson(lessonId);
      setIsCompleted(false);
      setCompletedCount((prev) => prev - 1);
    } else {
      saveCompletedLesson(lessonId);
      setIsCompleted(true);
      setCompletedCount((prev) => prev + 1);
    }
  }, [lessonId, isCompleted]);

  // Navigate to lesson
  const handleNavigate = (targetLessonId: string | null) => {
    if (targetLessonId) {
      console.log('Navigating to lesson:', targetLessonId);
      navigate(`/lesson/${targetLessonId}`);
    }
  };

  // Calculate progress percentage
  const progressPercent = lesson ? Math.round((completedCount / lesson.totalLessons) * 100) : 0;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
        components: {
          Button: {
            primaryColor: '#ffffff',
            colorPrimary: '#8b5cf6',
          },
          Card: {
            colorBgContainer: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
          },
          Progress: {
            defaultColor: '#8b5cf6',
          },
        },
      }}
    >
      <div
        className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'} transition-colors`}
      >
        {/* Progress bar at very top */}
        <div
          className={`sticky top-0 z-50 ${
            isDark ? 'bg-slate-900/80' : 'bg-white/80'
          } backdrop-blur-md border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}
        >
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor="#8b5cf6"
            trailColor={isDark ? '#1e293b' : '#e2e8f0'}
            size={['100%', 4]}
            className="!mb-0"
          />
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {loading ? (
            <LessonSkeleton isDark={isDark} />
          ) : !lesson ? (
            <div
              className={`text-center py-20 rounded-2xl ${
                isDark ? 'bg-slate-800/30' : 'bg-white'
              }`}
            >
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Lesson not found
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 mt-4 text-purple-500 hover:text-purple-400"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to courses
              </Link>
            </div>
          ) : (
            <>
              {/* Top bar with course info and back button */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Tooltip title="Back to course">
                    <Link
                      to={`/courses/${lesson.courseId}`}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </Tooltip>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {lesson.courseTitle}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      {lesson.moduleTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Lesson {lesson.currentIndex} of {lesson.totalLessons}
                  </span>
                  <Tooltip title="Course outline">
                    <Link
                      to={`/courses/${lesson.courseId}`}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </Link>
                  </Tooltip>
                </div>
              </div>

              {/* Video Player Section */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                {/* 16:9 aspect ratio container */}
                <div className="aspect-video bg-black">
                  <iframe
                    src={lesson.videoUrl}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Fullscreen hint */}
                <div
                  className={`absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                    isDark ? 'bg-black/60 text-white/70' : 'bg-black/50 text-white/80'
                  } backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity pointer-events-none`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Press F for fullscreen
                </div>
              </div>

              {/* Lesson Details Card */}
              <Card
                className={`!rounded-2xl ${
                  isDark ? '!border-white/[0.08]' : '!border-slate-200'
                }`}
                styles={{ body: { padding: '24px' } }}
              >
                <div className="space-y-6">
                  {/* Title and completion button */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <h1
                        className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {lesson.title}
                      </h1>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          />
                          <span
                            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {lesson.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen
                            className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          />
                          <span
                            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {lesson.moduleTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mark as Completed Button */}
                    <Button
                      type={isCompleted ? 'default' : 'primary'}
                      size="large"
                      onClick={handleToggleComplete}
                      className={`!flex items-center gap-2 ${
                        isCompleted
                          ? '!bg-green-500 !border-green-500 !text-white hover:!bg-green-600 hover:!border-green-600'
                          : ''
                      }`}
                      icon={<CheckCircle className="w-5 h-5" />}
                    >
                      {isCompleted ? 'Completed' : 'Mark as Completed'}
                    </Button>
                  </div>

                  {/* Description */}
                  <p
                    className={`text-base leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {lesson.description}
                  </p>

                  {/* Progress info */}
                  <div
                    className={`flex items-center gap-2 p-4 rounded-xl ${
                      isDark ? 'bg-white/[0.03]' : 'bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                      }`}
                    >
                      <BookOpen className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Course Progress
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {completedCount} of {lesson.totalLessons} lessons completed
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <Button
                      size="large"
                      disabled={!lesson.prevLessonId}
                      onClick={() => handleNavigate(lesson.prevLessonId)}
                      className={`!flex items-center gap-2 ${
                        !lesson.prevLessonId ? 'opacity-50' : ''
                      }`}
                      icon={<ChevronLeft className="w-5 h-5" />}
                    >
                      <span className="hidden sm:inline">Previous Lesson</span>
                      <span className="sm:hidden">Previous</span>
                    </Button>

                    <Button
                      type="primary"
                      size="large"
                      disabled={!lesson.nextLessonId}
                      onClick={() => handleNavigate(lesson.nextLessonId)}
                      className={`!flex items-center gap-2 ${
                        !lesson.nextLessonId ? 'opacity-50' : ''
                      }`}
                    >
                      <span className="hidden sm:inline">Next Lesson</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick navigation hint */}
              <div className="flex items-center justify-center gap-6 py-4">
                <div
                  className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  <kbd
                    className={`px-2 py-1 rounded ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    ←
                  </kbd>
                  Previous
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  <kbd
                    className={`px-2 py-1 rounded ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    →
                  </kbd>
                  Next
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  <kbd
                    className={`px-2 py-1 rounded ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    M
                  </kbd>
                  Complete
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LessonPage;

