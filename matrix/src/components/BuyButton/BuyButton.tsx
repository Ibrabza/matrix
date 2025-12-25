import { Button, message } from 'antd';
import type { ButtonProps } from 'antd';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useBuyCourse } from '../../hooks/use-checkout';
import { useAuth } from '../../hooks/useAuth';

// ============================================
// Types
// ============================================

export interface BuyButtonProps extends Omit<ButtonProps, 'onClick' | 'loading'> {
  /** The ID of the course to purchase */
  courseId: string;
  /** Price to display on the button (optional) */
  price?: number;
  /** Currency symbol (default: $) */
  currency?: string;
  /** Custom button text */
  text?: string;
  /** Callback when purchase starts */
  onPurchaseStart?: () => void;
  /** Callback when purchase fails */
  onError?: (error: Error) => void;
}

// ============================================
// Component
// ============================================

/**
 * BuyButton Component
 * 
 * Handles course purchase flow:
 * 1. Checks if user is authenticated
 * 2. Calls POST /api/checkout/create-session
 * 3. Redirects to Stripe checkout URL
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <BuyButton courseId="course-123" />
 * 
 * // With price display
 * <BuyButton courseId="course-123" price={49.99} />
 * 
 * // Custom text
 * <BuyButton courseId="course-123" text="Enroll Now" />
 * 
 * // With callbacks
 * <BuyButton 
 *   courseId="course-123" 
 *   onPurchaseStart={() => analytics.track('purchase_started')}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
const BuyButton = ({
  courseId,
  price,
  currency = '$',
  text,
  onPurchaseStart,
  onError,
  className,
  ...buttonProps
}: BuyButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { mutate: buyCourse, isPending } = useBuyCourse();

  // ============================================
  // Handle Purchase Click
  // ============================================
  
  const handleClick = () => {
    // Check authentication first
    if (!isAuthenticated) {
      message.warning('Please log in to purchase this course');
      // Optionally redirect to login
      window.location.href = `/login?redirect=/courses/${courseId}`;
      return;
    }

    // Notify purchase start
    onPurchaseStart?.();

    // Initiate purchase
    buyCourse(courseId, {
      onSuccess: (data) => {
        // Show loading message before redirect
        message.loading('Redirecting to checkout...', 0);
        
        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
        message.error(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      },
    });
  };

  // ============================================
  // Button Text
  // ============================================
  
  const getButtonText = () => {
    if (isPending) {
      return 'Processing...';
    }
    if (text) {
      return text;
    }
    if (price !== undefined) {
      return `Buy for ${currency}${price.toFixed(2)}`;
    }
    return 'Buy Now';
  };

  // ============================================
  // Render
  // ============================================
  
  return (
    <Button
      type="primary"
      size="large"
      disabled={isPending}
      onClick={handleClick}
      className={`!flex !items-center !justify-center !gap-2 !font-semibold !shadow-lg !shadow-purple-500/25 hover:!shadow-purple-500/40 ${className || ''}`}
      icon={
        isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )
      }
      {...buttonProps}
    >
      {getButtonText()}
    </Button>
  );
};

export default BuyButton;

