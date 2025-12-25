import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Tabs,
  Card,
  Progress,
  Tag,
  Empty,
  Button,
  Statistic,
  ConfigProvider,
  theme as antdTheme,
  Typography,
} from 'antd';
import { User, BookOpen, Award, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;

// Types
interface UserCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  category: string;
  totalLessons: number;
  lessonIds: string[];
  duration: string;
}

// Mock user course data with lesson IDs
const mockUserCourses: UserCourse[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the core concepts of React including components, state, props, and hooks.',
    instructor: 'Sarah Johnson',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    category: 'Frontend',
    totalLessons: 24,
    lessonIds: [
      'lesson-1-1', 'lesson-1-2', 'lesson-1-3', 'lesson-1-4',
      'lesson-2-1', 'lesson-2-2', 'lesson-2-3', 'lesson-2-4',
      'lesson-3-1', 'lesson-3-2', 'lesson-3-3', 'lesson-3-4', 'lesson-3-5',
      'lesson-4-1', 'lesson-4-2', 'lesson-4-3', 'lesson-4-4',
      'lesson-5-1', 'lesson-5-2', 'lesson-5-3', 'lesson-5-4', 'lesson-5-5',
      'lesson-6-1', 'lesson-6-2',
    ],
    duration: '8h 30m',
  },
  {
    id: '2',
    title: 'Node.js Backend Development',
    description: 'Master server-side JavaScript with Node.js. Create RESTful APIs and databases.',
    instructor: 'Michael Chen',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
    category: 'Backend',
    totalLessons: 36,
    lessonIds: Array.from({ length: 36 }, (_, i) => `node-lesson-${i + 1}`),
    duration: '12h 15m',
  },
  {
    id: '3',
    title: 'TypeScript Mastery',
    description: 'Deep dive into TypeScript with advanced types, generics, and best practices.',
    instructor: 'Emily Davis',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
    category: 'Frontend',
    totalLessons: 18,
    lessonIds: Array.from({ length: 18 }, (_, i) => `ts-lesson-${i + 1}`),
    duration: '6h 45m',
  },
  {
    id: '4',
    title: 'Python for Data Science',
    description: 'Introduction to Python with focus on data analysis and machine learning basics.',
    instructor: 'David Kim',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
    category: 'Data Science',
    totalLessons: 42,
    lessonIds: Array.from({ length: 42 }, (_, i) => `python-lesson-${i + 1}`),
    duration: '15h 00m',
  },
];

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

// Course Card Component
const CourseProgressCard = ({
  course,
  completedCount,
  isDark,
  isCompleted,
}: {
  course: UserCourse;
  completedCount: number;
  isDark: boolean;
  isCompleted: boolean;
}) => {
  const progressPercent = Math.round((completedCount / course.totalLessons) * 100);

  return (
    <Link to={`/courses/${course.id}`} className="block group">
      <Card
        className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
          isDark
            ? 'bg-slate-800/50 border-white/[0.08] hover:border-purple-500/30'
            : 'bg-white border-slate-200 hover:border-purple-300'
        }`}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative sm:w-48 shrink-0">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-32 sm:h-full object-cover"
            />
            {/* Category badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              {course.category}
            </span>
            {/* Completed overlay */}
            {isCompleted && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <Award className="w-10 h-10 text-green-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={`font-semibold group-hover:text-purple-500 transition-colors line-clamp-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {course.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {course.instructor}
                </p>
              </div>
              {isCompleted ? (
                <Tag color="success" className="!m-0">
                  Completed
                </Tag>
              ) : (
                <Tag color="processing" className="!m-0">
                  In Progress
                </Tag>
              )}
            </div>

            <p
              className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              {course.description}
            </p>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                  {completedCount} of {course.totalLessons} lessons
                </span>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {progressPercent}%
                </span>
              </div>
              <Progress
                percent={progressPercent}
                showInfo={false}
                strokeColor={isCompleted ? '#22c55e' : '#8b5cf6'}
                trailColor={isDark ? '#334155' : '#e2e8f0'}
                size="small"
              />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {course.duration}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {course.totalLessons} lessons
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Empty State Component
const EmptyState = ({
  isDark,
  type,
}: {
  isDark: boolean;
  type: 'active' | 'finished';
}) => (
  <div
    className={`py-16 rounded-2xl ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}
  >
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="space-y-2">
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {type === 'active'
              ? "You haven't started any courses yet"
              : "You haven't completed any courses yet"}
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {type === 'active'
              ? 'Start your learning journey today!'
              : 'Keep learning to see your achievements here!'}
          </p>
        </div>
      }
    >
      <Link to="/courses">
        <Button type="primary" icon={<ArrowRight className="w-4 h-4" />}>
          Browse Catalog
        </Button>
      </Link>
    </Empty>
  </div>
);

const UserSettingsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('active');

  // Load completed lessons from localStorage
  useEffect(() => {
    setCompletedLessons(getCompletedLessons());

    // Listen for storage changes (if user completes lessons in another tab)
    const handleStorageChange = () => {
      setCompletedLessons(getCompletedLessons());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Calculate course progress based on completed lessons
  const courseProgress = useMemo(() => {
    return mockUserCourses.map((course) => {
      const completedCount = course.lessonIds.filter((id) =>
        completedLessons.includes(id)
      ).length;
      const progress = Math.round((completedCount / course.totalLessons) * 100);
      return {
        ...course,
        completedCount,
        progress,
        isCompleted: progress === 100,
        isStarted: completedCount > 0,
      };
    });
  }, [completedLessons]);

  // Filter courses by status
  const activeCourses = courseProgress.filter((c) => c.isStarted && !c.isCompleted);
  const finishedCourses = courseProgress.filter((c) => c.isCompleted);

  // Stats
  const totalCompleted = finishedCourses.length;
  const totalInProgress = activeCourses.length;
  const totalLessonsCompleted = completedLessons.length;

  const tabItems = [
    {
      key: 'active',
      label: (
        <span className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Active Courses
          {totalInProgress > 0 && (
            <span
              className={`px-1.5 py-0.5 text-xs rounded-full ${
                isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}
            >
              {totalInProgress}
            </span>
          )}
        </span>
      ),
      children: (
        <div className="space-y-4 pt-4">
          {activeCourses.length > 0 ? (
            activeCourses.map((course) => (
              <CourseProgressCard
                key={course.id}
                course={course}
                completedCount={course.completedCount}
                isDark={isDark}
                isCompleted={false}
              />
            ))
          ) : (
            <EmptyState isDark={isDark} type="active" />
          )}
        </div>
      ),
    },
    {
      key: 'finished',
      label: (
        <span className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          Finished
          {totalCompleted > 0 && (
            <span
              className={`px-1.5 py-0.5 text-xs rounded-full ${
                isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
              }`}
            >
              {totalCompleted}
            </span>
          )}
        </span>
      ),
      children: (
        <div className="space-y-4 pt-4">
          {finishedCourses.length > 0 ? (
            finishedCourses.map((course) => (
              <CourseProgressCard
                key={course.id}
                course={course}
                completedCount={course.completedCount}
                isDark={isDark}
                isCompleted={true}
              />
            ))
          ) : (
            <EmptyState isDark={isDark} type="finished" />
          )}
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
        components: {
          Tabs: {
            itemColor: isDark ? '#94a3b8' : '#64748b',
            itemSelectedColor: isDark ? '#ffffff' : '#0f172a',
            itemHoverColor: '#8b5cf6',
            inkBarColor: '#8b5cf6',
          },
          Statistic: {
            contentFontSize: 28,
          },
        },
      }}
    >
      <div className="space-y-8">
        {/* Profile Header Section */}
        <div
          className={`rounded-2xl p-8 text-center ${
            isDark
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/[0.05]'
              : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200'
          }`}
        >
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar
                size={100}
                className="!bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25"
                icon={<User className="w-12 h-12" />}
              />
              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full" />
            </div>
          </div>

          {/* Username */}
          <Title
            level={3}
            className={`!mb-1 ${isDark ? '!text-white' : '!text-slate-900'}`}
          >
            John Doe
          </Title>
          <Text className={isDark ? '!text-slate-400' : '!text-slate-500'}>
            Aspiring Full-Stack Developer
          </Text>

          {/* Stats Summary - Bento Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-white/[0.03]' : 'bg-slate-50'
              }`}
            >
              <Statistic
                title={
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    In Progress
                  </span>
                }
                value={totalInProgress}
                valueStyle={{
                  color: isDark ? '#c4b5fd' : '#7c3aed',
                  fontWeight: 700,
                }}
                prefix={<TrendingUp className="w-5 h-5 mr-1 inline" />}
              />
            </div>
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-white/[0.03]' : 'bg-slate-50'
              }`}
            >
              <Statistic
                title={
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Completed
                  </span>
                }
                value={totalCompleted}
                valueStyle={{
                  color: isDark ? '#86efac' : '#16a34a',
                  fontWeight: 700,
                }}
                prefix={<Award className="w-5 h-5 mr-1 inline" />}
              />
            </div>
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-white/[0.03]' : 'bg-slate-50'
              }`}
            >
              <Statistic
                title={
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Lessons Done
                  </span>
                }
                value={totalLessonsCompleted}
                valueStyle={{
                  color: isDark ? '#93c5fd' : '#2563eb',
                  fontWeight: 700,
                }}
                prefix={<BookOpen className="w-5 h-5 mr-1 inline" />}
              />
            </div>
          </div>
        </div>

        {/* Course Progress Tabs */}
        <div
          className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-slate-800/30 border border-white/[0.05]'
              : 'bg-white border border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              My Learning
            </h2>
            <Link
              to="/courses"
              className="text-sm text-purple-500 hover:text-purple-400 flex items-center gap-1"
            >
              Browse more
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="account-tabs"
          />
        </div>

        {/* Quick Actions Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/courses" className="block group">
            <div
              className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                isDark
                  ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20 hover:border-purple-500/40'
                  : 'bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:border-purple-300'
              }`}
            >
              <BookOpen
                className={`w-8 h-8 mb-3 ${isDark ? 'text-purple-400' : 'text-purple-500'}`}
              />
              <h3
                className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                Explore Courses
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Discover new skills and topics
              </p>
            </div>
          </Link>

          <div
            className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              isDark
                ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40'
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300'
            }`}
          >
            <Award
              className={`w-8 h-8 mb-3 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}
            />
            <h3
              className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Certificates
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              View your earned certificates
            </p>
          </div>

          <div
            className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              isDark
                ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <TrendingUp
              className={`w-8 h-8 mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}
            />
            <h3
              className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Learning Stats
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Track your progress over time
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default UserSettingsPage;

