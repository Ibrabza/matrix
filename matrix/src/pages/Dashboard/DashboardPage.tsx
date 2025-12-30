import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, Empty, Button } from 'antd';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useStore } from '../../stores';

/**
 * Dashboard Page - "My Learning"
 * Shows user's enrolled courses and progress
 */
const DashboardPage = observer(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { authStore } = useStore();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#8b5cf6' },
      }}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1
            className={`text-3xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            My Learning
          </h1>
          <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Welcome back, {authStore.user?.name || 'Learner'}! Continue where you left off.
          </p>
        </div>

        {/* Empty State - Placeholder */}
        <div
          className={`py-16 rounded-2xl ${
            isDark ? 'bg-slate-800/30' : 'bg-slate-100'
          }`}
        >
          <Empty
            image={<BookOpen className="w-16 h-16 mx-auto text-slate-400" />}
            description={
              <div className="space-y-2">
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  You haven't enrolled in any courses yet
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Start your learning journey today!
                </p>
              </div>
            }
          >
            <Link to="/courses">
              <Button type="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Browse Courses
              </Button>
            </Link>
          </Empty>
        </div>
      </div>
    </ConfigProvider>
  );
});

export default DashboardPage;

