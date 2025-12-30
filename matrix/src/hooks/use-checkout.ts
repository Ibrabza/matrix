import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { CheckoutSession } from '../types/api';

// ============================================
// Types
// ============================================

export interface BuyCourseParams {
  courseId: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId?: string;
}

// ============================================
// API Function
// ============================================

/**
 * Create a Stripe checkout session for course purchase
 * POST /api/checkout/create-session
 * 
 * @param courseId - The ID of the course to purchase
 * @returns Checkout session with Stripe redirect URL
 */
export const buyCourse = async (courseId: string): Promise<CheckoutResponse> => {
  console.log('🛒 [buyCourse] Creating checkout session', { courseId });
  
  try {
    const response = await apiClient.post<CheckoutSession>('/checkout/create-session', {
      courseId,
    });

    console.log('✅ [buyCourse] Checkout session created', response.data);

    return {
      url: response.data.url,
      sessionId: response.data.sessionId,
    };
  } catch (error) {
    console.error('❌ [buyCourse] Failed to create checkout session:', error);
    throw error;
  }
};

// ============================================
// React Query Hook
// ============================================

/**
 * Hook for purchasing a course
 * 
 * @param options - Mutation options
 * @returns Mutation object with buyCourse function
 * 
 * @example
 * ```tsx
 * const { mutate: purchase, isPending } = useBuyCourse();
 * 
 * const handlePurchase = () => {
 *   purchase('course-123', {
 *     onSuccess: (data) => {
 *       // Redirect to Stripe checkout
 *       window.location.href = data.url;
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     },
 *   });
 * };
 * ```
 */
export const useBuyCourse = () => {
  return useMutation({
    mutationFn: buyCourse,
    onSuccess: (data) => {
      console.log('✅ [useBuyCourse] Checkout session created', { url: data.url });
      
      // Redirect to Stripe checkout page
      if (data.url) {
        console.log('🔄 [useBuyCourse] Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('❌ [useBuyCourse] No checkout URL returned from backend');
      }
    },
    onError: (error) => {
      console.error('❌ [useBuyCourse] Checkout session creation failed:', error);
    },
  });
};

/**
 * Hook with automatic redirect handling
 * 
 * @example
 * ```tsx
 * const { purchase, isPurchasing, error } = usePurchaseCourse();
 * 
 * <Button 
 *   loading={isPurchasing} 
 *   onClick={() => purchase('course-123')}
 * >
 *   Buy Now
 * </Button>
 * ```
 */
export const usePurchaseCourse = () => {
  const mutation = useBuyCourse();

  return {
    purchase: (courseId: string) => mutation.mutate(courseId),
    isPurchasing: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};

