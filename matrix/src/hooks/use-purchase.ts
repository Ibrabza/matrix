import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { queryKeys } from '../lib/query-client';

// ============================================
// Types
// ============================================

export interface PurchaseResponse {
  message: string;
  purchase: {
    id: string;
    courseId: string;
    courseName: string;
    courseDescription?: string;
    purchasedAt: string;
    alreadyOwned: boolean;
  };
}

export interface CheckPurchaseResponse {
  hasPurchased: boolean;
  purchaseDate: string | null;
}

// ============================================
// API Functions
// ============================================

/**
 * Direct purchase a course (Mock/Testing - bypasses Stripe)
 * POST /api/courses/:courseId/purchase
 * 
 * This is useful for development/testing without Stripe setup.
 * In production, use the Stripe checkout flow instead.
 */
export const directPurchaseCourse = async (courseId: string): Promise<PurchaseResponse> => {
  console.log('🛒 [Direct Purchase] Initiating purchase', { courseId });
  
  const response = await apiClient.post<PurchaseResponse>(
    `/courses/${courseId}/purchase`,
    {}
  );

  console.log('✅ [Direct Purchase] Purchase successful', response.data);
  return response.data;
};

/**
 * Check if user has purchased a course
 * GET /api/courses/:courseId/has-purchased
 */
export const checkCoursePurchase = async (courseId: string): Promise<CheckPurchaseResponse> => {
  const response = await apiClient.get<CheckPurchaseResponse>(
    `/courses/${courseId}/has-purchased`
  );
  return response.data;
};

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook for direct course purchase (Mock/Testing)
 * 
 * @example
 * ```tsx
 * const { mutate: purchase, isPending } = useDirectPurchase();
 * 
 * const handlePurchase = () => {
 *   purchase('course-123', {
 *     onSuccess: (data) => {
 *       message.success(data.message);
 *       // Refresh course data
 *       refetch();
 *     },
 *     onError: (error) => {
 *       message.error(error.message);
 *     },
 *   });
 * };
 * ```
 */
export const useDirectPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: directPurchaseCourse,
    onSuccess: (data, courseId) => {
      console.log('🎉 [Direct Purchase Hook] Purchase successful, invalidating queries', {
        courseId,
        purchaseId: data.purchase.id,
      });

      // Invalidate course details to refresh purchase status
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });

      // Invalidate course list
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.all,
      });

      // Invalidate user purchases
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      });
    },
    onError: (error) => {
      console.error('❌ [Direct Purchase Hook] Purchase failed', error);
    },
  });
};

/**
 * Hook with simpler API for direct purchase
 * 
 * @example
 * ```tsx
 * const { purchase, isPurchasing, error } = usePurchase();
 * 
 * <Button 
 *   loading={isPurchasing} 
 *   onClick={() => purchase('course-123')}
 * >
 *   Buy Now (Mock)
 * </Button>
 * ```
 */
export const usePurchase = () => {
  const mutation = useDirectPurchase();

  return {
    purchase: (courseId: string) => mutation.mutate(courseId),
    isPurchasing: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
};

