import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ConfigProvider, theme as antdTheme, Spin, Result, Button } from 'antd';
import { Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCourse } from '../../hooks/use-courses';
import { useBuyCourse } from '../../hooks/use-checkout';

/**
 * Checkout Page - Intermediate page for purchase handling
 * Automatically initiates checkout or shows course info before purchase
 */
const CheckoutPage = observer(() => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId || '');
  const { mutate: buyCourse, isPending: isPurchasing, error: purchaseError } = useBuyCourse();

  // Auto-redirect if already enrolled
  useEffect(() => {
    if (course?.isEnrolled) {
      navigate(`/courses/${courseId}`, { replace: true });
    }
  }, [course, courseId, navigate]);

  const handlePurchase = () => {
    if (courseId) {
      buyCourse(courseId);
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={`w-10 h-10 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Result
          status="error"
          title="Course Not Found"
          subTitle="The course you're trying to purchase doesn't exist."
          extra={
            <Link to="/courses">
              <Button type="primary">Browse Courses</Button>
            </Link>
          }
        />
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          to={`/courses/${courseId}`}
          className={`inline-flex items-center gap-2 text-sm ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to course
        </Link>

        {/* Checkout Card */}
        <div
          className={`p-8 rounded-2xl ${
            isDark
              ? 'bg-slate-800/50 border border-white/[0.05]'
              : 'bg-white border border-slate-200'
          }`}
        >
          <div className="flex items-start gap-6">
            {/* Thumbnail */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-32 h-20 object-cover rounded-lg"
            />

            {/* Info */}
            <div className="flex-1">
              <h1
                className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                {course.title}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                by {course.instructor}
              </p>
            </div>
          </div>

          {/* Price & Purchase */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Total
              </span>
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ${course.price?.toFixed(2) || '0.00'}
              </span>
            </div>

            {purchaseError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                {purchaseError.message || 'Failed to initiate checkout'}
              </div>
            )}

            <Button
              type="primary"
              size="large"
              block
              loading={isPurchasing}
              onClick={handlePurchase}
              icon={<ShoppingCart className="w-5 h-5" />}
              className="!h-14 !text-lg !font-semibold !shadow-lg !shadow-purple-500/25"
            >
              {isPurchasing ? 'Redirecting to Checkout...' : 'Proceed to Payment'}
            </Button>

            <p className={`text-xs text-center mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
});

export default CheckoutPage;

