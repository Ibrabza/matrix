import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// localStorage key for JWT token
// IMPORTANT: Must match the key used in services/apiClient.ts and stores/authStore.ts
const TOKEN_KEY = 'matrix_auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor - Add JWT token to Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('🔐 [Request Interceptor]', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
    });
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [Request Interceptor] Token attached to request');
    } else if (!token) {
      console.warn('⚠️ [Request Interceptor] No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Unwrap backend response and handle global errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in { success: true, data: {...}, message?: string }
    // Unwrap the 'data' property for easier access
    console.log('🔵 [API Response - lib]', response.config.url, response.data);
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      console.log('✅ [API Unwrapped - lib]', response.data.data);
      return { ...response, data: response.data.data };
    }
    
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ [API Error - lib]', {
      url,
      status,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers
    });

    // Handle 401 Unauthorized - ONLY logout for auth-related endpoints
    if (status === 401) {
      console.log('🔴 [401 Unauthorized - lib]', { url, endpoint: url });
      
      // Only auto-logout if it's an auth-verification endpoint
      // For other endpoints, let the component handle the error
      const isAuthEndpoint = url?.includes('/users/me') || url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        console.log('🔴 [401 on Auth Endpoint] Clearing token and redirecting to login');
        localStorage.removeItem(TOKEN_KEY);
        
        // Only redirect if we're in the browser and not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        console.warn('⚠️ [401 on Non-Auth Endpoint] NOT auto-logging out. Let component handle error.', { url });
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error('🚫 [403 Forbidden]', error.response?.data?.message);
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.error('🔍 [404 Not Found]', error.config?.url);
    }

    // Handle 500 Server Error
    if (status && status >= 500) {
      console.error('💥 [500 Server Error]', error.response?.data?.message);
      console.error('❌ DO NOT LOGOUT - This is a server error, not an auth issue');
    }

    // Extract error message for consumers
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

// Helper functions for token management
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export default apiClient;

