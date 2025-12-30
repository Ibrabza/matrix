import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'matrix_auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('🔐 [Request Interceptor - services]', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
    });
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [Request Interceptor - services] Token attached to request');
    } else if (!token) {
      console.warn('⚠️ [Request Interceptor - services] No token found in localStorage');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - unwrap backend response and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in { success: true, data: {...}, message?: string }
    // Unwrap the 'data' property for easier access
    console.log('🔵 [API Response]', response.config.url, response.data);
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      console.log('✅ [API Unwrapped]', response.data.data);
      return { ...response, data: response.data.data };
    }
    
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ [API Error - services]', {
      url,
      status,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    // Handle 401 Unauthorized - ONLY logout for auth-related endpoints
    if (status === 401) {
      console.log('🔴 [401 Unauthorized - services]', { url, endpoint: url });
      
      // Only auto-logout if it's an auth-verification endpoint
      const isAuthEndpoint = url?.includes('/users/me') || url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        console.log('🔴 [401 on Auth Endpoint] Clearing token');
        localStorage.removeItem(TOKEN_KEY);
      } else {
        console.warn('⚠️ [401 on Non-Auth Endpoint] NOT auto-logging out. Let component handle error.', { url });
      }
    }

    // Handle 500 Server Error
    if (status && status >= 500) {
      console.error('💥 [500 Server Error]', error.response?.data?.message);
      console.error('❌ DO NOT LOGOUT - This is a server error, not an auth issue');
    }

    // Extract error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

// Token management helpers
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export default apiClient;

