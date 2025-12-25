import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { setToken, removeToken, getToken } from '../lib/api-client';
import { queryKeys } from '../lib/query-client';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types/api';

// ============================================
// API Functions
// ============================================

const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/users/me/change-password', data);
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.patch<User>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook to get current user
 * Only fetches if token exists
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getCurrentUser,
    enabled: !!getToken(), // Only fetch if token exists
    retry: false, // Don't retry auth requests
  });
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Save token to localStorage
      setToken(data.token);
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
  });
};

/**
 * Hook for register mutation
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Save token to localStorage
      setToken(data.token);
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
  });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    // Remove token from localStorage
    removeToken();
    // Clear user from cache
    queryClient.setQueryData(queryKeys.auth.user(), null);
    // Invalidate all queries
    queryClient.clear();
  };
};

/**
 * Hook for updating profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.auth.user(), updatedUser);
    },
  });
};

/**
 * Hook for changing password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

/**
 * Hook for uploading avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.auth.user(), updatedUser);
    },
  });
};

// Export API functions for direct use if needed
export { authApi };

