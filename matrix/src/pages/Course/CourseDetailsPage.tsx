import { useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Breadcrumb,
  Collapse,
  Progress,
  Button,
  Skeleton,
  ConfigProvider,
  theme as antdTheme,
  Rate,
  message,
} from 'antd';
import {
  Play,
  Clock,
  Users,
  BarChart3,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  Award,
  Home,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCourse, useInvalidateCourses } from '../../hooks/use-courses';
import { useBuyCourse } from '../../hooks/use-checkout';
import { useStore } from '../../stores';
import type { LessonPreview } from '../../types/api';

// Lesson Item Component
const LessonItem = ({
  lesson,
  isDark,
  isEnrolled,
  courseId,
}: {
  lesson: LessonPreview;
  isDark: boolean;
  isEnrolled: boolean;
  courseId: string;
}) => {
  const isAccessible = isEnrolled || lesson.isFree;

  const content = (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
        isAccessible
          ? isDark
            ? 'hover:bg-white/[0.05] cursor-pointer'
            : 'hover:bg-slate-50 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            !isAccessible
              ? isDark
                ? 'bg-slate-700 text-slate-500'
                : 'bg-slate-200 text-slate-400'
              : isDark
                ? 'bg-white/[0.08] text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-400'
                : 'bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-500'
          }`}
        >
          {!isAccessible ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </div>

        {/* Lesson title */}
        <div className="flex flex-col">
          <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {lesson.title}
          </span>
          {lesson.isFree && !isEnrolled && (
            <span className="text-xs text-green-500">Free preview</span>
          )}
        </div>
      </div>

      {/* Duration */}
      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {lesson.duration}
      </span>
    </div>
  );

  // If not accessible, don't make it a link
  if (!isAccessible) {
    return content;
  }

  return <Link to={`/learn/${courseId}/lessons/${lesson.id}`}>{content}</Link>;
};

// Sidebar Card Component
const SidebarCard = observer(
  ({
    course,
    isDark,
    isMobile = false,
    isEnrolled,
    onBuyClick,
    isPurchasing,
  }: {
    course: {
      thumbnailUrl?: string;
      title: string;
      price: number;
      lessonsCount: number;
      duration: string;
      level: string;
      progress?: { percentage: number };
      lessons?: LessonPreview[];
    };
    isDark: boolean;
    isMobile?: boolean;
    isEnrolled: boolean;
    onBuyClick: () => void;
    isPurchasing: boolean;
  }) => {
    const firstLessonId = course.lessons?.[0]?.id;
    const progress = course.progress?.percentage || 0;

    return (
      <div
        className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-slate-800/50 border border-white/[0.08]'
            : 'bg-white border border-slate-200'
        } ${isMobile ? '' : 'sticky top-24'}`}
      >
        {/* Thumbnail */}
        <div className="relative">
          <img
            src={
              course.thumbnailUrl ||
              'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop'
            }
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-7 h-7 text-purple-600 ml-1" />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Price (only show if not enrolled) */}
          {!isEnrolled && (
            <div className="text-center">
              <span
                className={`text-3xl font-bold ${
                  course.price === 0
                    ? 'text-green-500'
                    : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                }`}
              >
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Progress section (only show if enrolled and has progress) */}
          {isEnrolled && progress > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Your Progress
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {progress}%
                </span>
              </div>
              <Progress
                percent={progress}
                showInfo={false}
                strokeColor="#8b5cf6"
                trailColor={isDark ? '#334155' : '#e2e8f0'}
              />
            </div>
          )}

          {/* CTA Button */}
          {isEnrolled ? (
            <Link to={firstLessonId ? `/learn/${course.lessons?.[0]?.id}/lessons/${firstLessonId}` : '/dashboard'}>
              <Button
                type="primary"
                size="large"
                block
                className="!h-12 !font-semibold !shadow-lg !shadow-purple-500/25 hover:!shadow-purple-500/40"
                icon={<Play className="w-5 h-5" />}
              >
                {progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </Button>
            </Link>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              loading={isPurchasing}
              onClick={onBuyClick}
              className="!h-12 !font-semibold !shadow-lg !shadow-purple-500/25 hover:!shadow-purple-500/40"
              icon={isPurchasing ? undefined : <ShoppingCart className="w-5 h-5" />}
            >
              {isPurchasing ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Buy Course'}
            </Button>
          )}

          {/* Course stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {course.duration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {course.lessonsCount} lessons
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {course.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Loading Skeleton
const CourseDetailsSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6">
    <Skeleton active paragraph={{ rows: 0 }} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
      <div className="hidden lg:block">
        <div
          className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white'}`}
        >
          <Skeleton.Image active className="!w-full !h-48" />
          <div className="p-5">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseDetailsPage = observer(() => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { authStore } = useStore();

  // Fetch course data
  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useCourse(courseId || '', { enabled: !!courseId });

  // Purchase mutation
  const { mutate: buyCourse, isPending: isPurchasing } = useBuyCourse();

  // Invalidate courses hook
  const invalidateCourses = useInvalidateCourses();

  // Handle success query param from Stripe return
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === '1' && courseId) {
      // Show success message
      message.success({
        content: 'Enrollment Successful! Welcome to the course.',
        duration: 5,
        className: 'custom-success-message',
      });

      // Remove the success param from URL
      setSearchParams({}, { replace: true });

      // Refresh course data to show enrolled state
      refetch();
      invalidateCourses.course(courseId);
    }
  }, [searchParams, courseId, refetch, invalidateCourses, setSearchParams]);

  // Handle buy course action
  const handleBuyCourse = useCallback(() => {
    if (!courseId) return;

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', {
        state: { from: { pathname: `/courses/${courseId}` } },
      });
      return;
    }

    // User is authenticated - initiate purchase
    buyCourse(courseId);
  }, [courseId, authStore.isAuthenticated, navigate, buyCourse]);

  // Derive isEnrolled from course data
  const isEnrolled = course?.isEnrolled || false;

  // Generate collapse items for lessons
  const collapseItems =
    course?.lessons && course.lessons.length > 0
      ? [
          {
            key: 'lessons',
            label: (
              <div className="flex items-center justify-between pr-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium ${
                      isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Course Content
                  </span>
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {course.lessons.length} lessons
                </span>
              </div>
            ),
            children: (
              <div className="space-y-2">
                {course.lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isDark={isDark}
                    isEnrolled={isEnrolled}
                    courseId={courseId || ''}
                  />
                ))}
              </div>
            ),
          },
        ]
      : [];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
        components: {
          Collapse: {
            headerBg: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa',
            contentBg: isDark ? 'transparent' : '#ffffff',
            headerPadding: '16px 20px',
            contentPadding: '12px 20px 20px',
          },
          Button: {
            primaryColor: '#ffffff',
            colorPrimary: '#8b5cf6',
            algorithm: true,
          },
          Breadcrumb: {
            itemColor: isDark ? '#94a3b8' : '#64748b',
            lastItemColor: isDark ? '#e2e8f0' : '#1e293b',
            linkColor: isDark ? '#94a3b8' : '#64748b',
            linkHoverColor: '#8b5cf6',
            separatorColor: isDark ? '#475569' : '#cbd5e1',
          },
        },
      }}
    >
      <div className="space-y-6">
        {isLoading ? (
          <CourseDetailsSkeleton isDark={isDark} />
        ) : error ? (
          <div
            className={`text-center py-16 rounded-2xl ${
              isDark ? 'bg-slate-800/30' : 'bg-slate-100'
            }`}
          >
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Failed to load course details
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-4 text-purple-500 hover:text-purple-400"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to courses
            </Link>
          </div>
        ) : course ? (
          <>
            {/* Breadcrumbs */}
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link to="/" className="flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </Link>
                  ),
                },
                {
                  title: course.title,
                },
              ]}
            />

            {/* Mobile Sidebar Card */}
            <div className="lg:hidden">
              <SidebarCard
                course={course}
                isDark={isDark}
                isMobile
                isEnrolled={isEnrolled}
                onBuyClick={handleBuyCourse}
                isPurchasing={isPurchasing}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title & Meta */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {course.category?.name || 'Course'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {course.level}
                    </span>
                    {isEnrolled && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500`}
                      >
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Enrolled
                      </span>
                    )}
                  </div>

                  <h1
                    className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {course.title}
                  </h1>

                  <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {course.instructor
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {course.instructor}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Instructor
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Description */}
                {course.fullDescription && (
                  <div>
                    <h2
                      className={`text-xl font-semibold mb-4 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      About this course
                    </h2>
                    <p
                      className={`text-base leading-relaxed whitespace-pre-line ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {course.fullDescription}
                    </p>
                  </div>
                )}

                {/* Course Content */}
                {collapseItems.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2
                        className={`text-xl font-semibold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Course Content
                      </h2>
                      <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {course.lessons?.length || 0} lessons • {course.duration}
                      </span>
                    </div>

                    <Collapse
                      items={collapseItems}
                      defaultActiveKey={['lessons']}
                      expandIconPosition="end"
                      className={`!rounded-xl overflow-hidden ${
                        isDark ? '!border-white/[0.08]' : '!border-slate-200'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden lg:block">
                <SidebarCard
                  course={course}
                  isDark={isDark}
                  isEnrolled={isEnrolled}
                  onBuyClick={handleBuyCourse}
                  isPurchasing={isPurchasing}
                />
              </div>
            </div>

            {/* Mobile Fixed Bottom CTA */}
            <div
              className={`fixed bottom-0 left-0 right-0 p-4 lg:hidden ${
                isDark ? 'bg-slate-900/95' : 'bg-white/95'
              } backdrop-blur-md border-t ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}
            >
              {isEnrolled ? (
                <Link to={course.lessons?.[0] ? `/learn/${courseId}/lessons/${course.lessons[0].id}` : '/dashboard'}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="!h-12 !font-semibold !shadow-lg !shadow-purple-500/25"
                    icon={<Play className="w-5 h-5" />}
                  >
                    {course.progress?.percentage ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </Link>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isPurchasing}
                  onClick={handleBuyCourse}
                  className="!h-12 !font-semibold !shadow-lg !shadow-purple-500/25"
                  icon={isPurchasing ? undefined : <ShoppingCart className="w-5 h-5" />}
                >
                  {isPurchasing
                    ? 'Processing...'
                    : course.price === 0
                      ? 'Enroll for Free'
                      : `Buy Course - $${course.price.toFixed(2)}`}
                </Button>
              )}
            </div>

            {/* Spacer for mobile fixed button */}
            <div className="h-20 lg:hidden" />
          </>
        ) : null}
      </div>
    </ConfigProvider>
  );
});

export default CourseDetailsPage;
