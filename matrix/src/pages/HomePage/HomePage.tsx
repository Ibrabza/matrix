import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Input, Select, ConfigProvider, theme as antdTheme, Empty, Pagination, Button } from 'antd';
import { Search, Sparkles, TrendingUp, BookOpen, Users } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCourses } from '../../hooks/use-courses';
import type { Course } from '../../types/api';

// Skeleton card for loading state
const SkeletonCard = ({ isDark }: { isDark: boolean }) => (
  <div
    className={`rounded-2xl overflow-hidden animate-pulse ${
      isDark ? 'bg-slate-800/50' : 'bg-white'
    }`}
  >
    <div className={`w-full h-44 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
    <div className="p-5 space-y-3">
      <div className={`h-5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} w-3/4`} />
      <div className={`h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} w-1/2`} />
      <div className={`h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} w-full`} />
      <div className={`h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} w-2/3`} />
    </div>
  </div>
);

// Course card component
const CatalogCourseCard = ({ course, isDark }: { course: Course; isDark: boolean }) => {
  return (
    <Link to={`/courses/${course.id}`} className="block group">
      <div
        className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
          isDark
            ? 'bg-slate-800/50 border border-white/[0.08] hover:border-purple-500/30'
            : 'bg-white border border-slate-200 hover:border-purple-300'
        }`}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <img
            alt={course.title}
            src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop'}
            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {course.category?.name || 'Course'}
          </span>
          {/* Level badge */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full ${
              course.level === 'Beginner'
                ? 'bg-green-500/80 text-white'
                : course.level === 'Intermediate'
                  ? 'bg-yellow-500/80 text-white'
                  : 'bg-red-500/80 text-white'
            }`}
          >
            {course.level}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3
            className={`text-lg font-semibold mb-2 line-clamp-1 group-hover:text-purple-500 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {course.title}
          </h3>

          {/* Instructor */}
          <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            by {course.instructor}
          </p>

          {/* Description */}
          <p
            className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {course.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {course.duration}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {course.lessonsCount} lessons
              </span>
            </div>

            {/* Price */}
            <span
              className={`text-lg font-bold ${
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
        </div>
      </div>
    </Link>
  );
};

// Stats card for hero section
const StatCard = ({
  icon: Icon,
  value,
  label,
  isDark,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  isDark: boolean;
}) => (
  <div
    className={`flex items-center gap-3 p-4 rounded-xl ${
      isDark ? 'bg-white/[0.05]' : 'bg-white/80'
    } backdrop-blur-sm`}
  >
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isDark ? 'bg-purple-500/20' : 'bg-purple-100'
      }`}
    >
      <Icon className="w-5 h-5 text-purple-500" />
    </div>
    <div>
      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    </div>
  </div>
);

const HomePage = observer(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses with React Query
  const {
    data: coursesData,
    isLoading,
    error,
  } = useCourses({
    page: currentPage,
    limit: 12,
    search: debouncedSearch || undefined,
    categoryId: selectedCategory,
  });

  const courses = coursesData?.data || [];
  const meta = coursesData?.meta;

  // Categories - could be fetched from API
  const categories = [
    { value: undefined, label: 'All Categories' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'design', label: 'Design' },
    { value: 'devops', label: 'DevOps' },
    { value: 'mobile', label: 'Mobile' },
  ];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
        components: {
          Input: {
            colorBgContainer: isDark ? '#1e293b' : '#ffffff',
            colorBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            activeBorderColor: '#8b5cf6',
            hoverBorderColor: '#8b5cf6',
          },
          Select: {
            colorBgContainer: isDark ? '#1e293b' : '#ffffff',
            colorBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            colorBgElevated: isDark ? '#1e293b' : '#ffffff',
            optionSelectedBg: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
          },
        },
      }}
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <section
          className={`relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 px-4 sm:px-6 lg:px-8 py-16 overflow-hidden ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900'
              : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
          }`}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
                isDark ? 'bg-purple-500/10' : 'bg-purple-200/50'
              }`}
            />
            <div
              className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-200/50'
              }`}
            />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Discover Your Next Skill</span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Master New Skills with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Expert Courses
              </span>
            </h1>

            <p
              className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Join thousands of learners and accelerate your career with industry-leading courses
              taught by experts.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <StatCard icon={BookOpen} value="500+" label="Courses" isDark={isDark} />
              <StatCard icon={Users} value="50K+" label="Students" isDark={isDark} />
              <StatCard icon={TrendingUp} value="95%" label="Success Rate" isDark={isDark} />
              <StatCard icon={Sparkles} value="4.9" label="Avg Rating" isDark={isDark} />
            </div>
          </div>
        </section>

        {/* Course Catalog Section */}
        <section className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Explore Courses
              </h2>
              <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Find the perfect course to level up your skills
              </p>
            </div>

            <Link to="/courses">
              <Button type="link" className="!text-purple-500 !font-medium !p-0">
                View All Courses →
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input.Search
              placeholder="Search courses..."
              allowClear
              size="large"
              prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              style={{ maxWidth: '100%' }}
            />
            <Select
              value={selectedCategory}
              size="large"
              onChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
              options={categories}
              className="w-full sm:w-48"
              popupMatchSelectWidth={false}
              placeholder="Category"
            />
          </div>

          {/* Results count */}
          {!isLoading && meta && (
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Showing {courses.length} of {meta.total} courses
            </p>
          )}

          {/* Error State */}
          {error && (
            <div
              className={`py-12 text-center rounded-2xl ${
                isDark ? 'bg-red-500/10' : 'bg-red-50'
              }`}
            >
              <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Failed to load courses. Please try again.
              </p>
              <Button
                type="primary"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} isDark={isDark} />
              ))}
            </div>
          )}

          {/* Courses Grid */}
          {!isLoading && !error && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CatalogCourseCard key={course.id} course={course} isDark={isDark} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && courses.length === 0 && (
            <div
              className={`py-16 rounded-2xl ${isDark ? 'bg-slate-800/30' : 'bg-slate-100'}`}
            >
              <Empty
                description={
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    No courses found matching your criteria
                  </span>
                }
              />
            </div>
          )}

          {/* Pagination */}
          {!isLoading && meta && meta.totalPages > 1 && (
            <div className="flex justify-center pt-8">
              <Pagination
                current={currentPage}
                total={meta.total}
                pageSize={meta.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          )}
        </section>
      </div>
    </ConfigProvider>
  );
});

export default HomePage;

