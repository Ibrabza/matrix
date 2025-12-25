import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ConfigProvider, theme as antdTheme, Button, Progress, Skeleton } from 'antd';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  List,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useLesson, useCourseProgress, useMarkLessonComplete } from '../../hooks/use-lessons';
import { useCourse } from '../../hooks/use-courses';

/**
 * Learn Page - Video Player for enrolled users
 * Protected route - requires authentication + course enrollment
 */
const LearnPage = observer(() => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch data
  const { data: course, isLoading: courseLoading } = useCourse(courseId || '');
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useLesson(lessonId || '');
  const { data: progress } = useCourseProgress(courseId || '', { enabled: !!courseId });
  const markComplete = useMarkLessonComplete();

  const isCompleted = progress?.completedLessons.includes(lessonId || '') ?? false;
  const progressPercent = progress?.percentage ?? 0;

  // Find prev/next lessons
  const currentIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? course?.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < (course?.lessons.length ?? 0) - 1 
    ? course?.lessons[currentIndex + 1] 
    : null;

  // Redirect if not enrolled
  useEffect(() => {
    if (course && !course.isEnrolled) {
      navigate(`/courses/${courseId}`, { replace: true });
    }
  }, [course, courseId, navigate]);

  const handleMarkComplete = () => {
    if (courseId && lessonId) {
      markComplete.mutate({
        courseId,
        lessonId,
        isCompleted: !isCompleted,
      });
    }
  };

  const handleNavigate = (targetLessonId: string) => {
    navigate(`/learn/${courseId}/lessons/${targetLessonId}`);
  };

  if (courseLoading || lessonLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <Skeleton active />
          <Skeleton.Image active className="!w-full !h-96" />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  if (lessonError || !lesson) {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="text-center">
            <Lock className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Lesson Not Available
            </h1>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lessonError?.message || 'You may need to enroll in this course first.'}
            </p>
            <Link to={`/courses/${courseId}`}>
              <Button type="primary" className="mt-4">
                View Course
              </Button>
            </Link>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#8b5cf6' },
      }}
    >
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Progress bar at top */}
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

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Link
              to={`/courses/${courseId}`}
              className={`flex items-center gap-2 ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">{course?.title}</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {currentIndex + 1} / {course?.lessons.length}
              </span>
              <Link
                to={`/courses/${courseId}`}
                className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Video Player */}
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="aspect-video bg-black">
              {lesson.videoUrl ? (
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-slate-400">Video not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Info */}
          <div
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-slate-800/50 border border-white/[0.05]'
                : 'bg-white border border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lesson.description}
                  </p>
                )}
              </div>

              <Button
                type={isCompleted ? 'default' : 'primary'}
                size="large"
                onClick={handleMarkComplete}
                loading={markComplete.isPending}
                icon={<CheckCircle className="w-5 h-5" />}
                className={
                  isCompleted
                    ? '!bg-green-500 !border-green-500 !text-white hover:!bg-green-600'
                    : ''
                }
              >
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-700">
              <Button
                size="large"
                disabled={!prevLesson}
                onClick={() => prevLesson && handleNavigate(prevLesson.id)}
                icon={<ChevronLeft className="w-5 h-5" />}
              >
                Previous
              </Button>

              <Button
                type="primary"
                size="large"
                disabled={!nextLesson}
                onClick={() => nextLesson && handleNavigate(nextLesson.id)}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
});

export default LearnPage;

