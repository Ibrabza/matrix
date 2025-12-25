import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import apiClient, { setToken, getToken, removeToken } from '../lib/api-client';
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
// Types
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  
  // Profile actions
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  updateAvatar: (file: File) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
  });

  // ============================================
  // Initialize - Check for existing token on mount
  // ============================================
  
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setState((prev) => ({ ...prev, isInitialized: true }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Fetch current user with existing token
        const response = await apiClient.get<User>('/users/me');
        
        setState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch {
        // Token is invalid, clear it
        removeToken();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // ============================================
  // Login
  // POST /api/auth/login
  // ============================================
  
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const payload: LoginRequest = { email, password };
      const response = await apiClient.post<LoginResponse>('/auth/login', payload);

      const { token, user } = response.data;

      // Save token to localStorage
      setToken(token);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return false;
    }
  }, []);

  // ============================================
  // Register
  // POST /api/auth/register
  // ============================================
  
  const register = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const payload: RegisterRequest = { email, password, name };
      const response = await apiClient.post<RegisterResponse>('/auth/register', payload);

      const { token, user } = response.data;

      // Save token to localStorage
      setToken(token);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return false;
    }
  }, []);

  // ============================================
  // Logout
  // ============================================
  
  const logout = useCallback(() => {
    removeToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  }, []);

  // ============================================
  // Update Profile
  // PATCH /api/users/me
  // ============================================
  
  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.patch<User>('/users/me', data);

      setState((prev) => ({
        ...prev,
        user: response.data,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return false;
    }
  }, []);

  // ============================================
  // Change Password
  // POST /api/users/me/change-password
  // ============================================
  
  const changePassword = useCallback(async (
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const payload: ChangePasswordRequest = { oldPassword, newPassword };
      await apiClient.post('/users/me/change-password', payload);

      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return false;
    }
  }, []);

  // ============================================
  // Update Avatar (Multipart Upload)
  // PATCH /api/users/me/avatar
  // CRUCIAL: Uses FormData with Content-Type: multipart/form-data
  // ============================================
  
  const updateAvatar = useCallback(async (file: File): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Make request with multipart/form-data content type
      // Axios will automatically set the correct Content-Type with boundary
      const response = await apiClient.patch<User>('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user state with new avatar URL
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, avatarUrl: response.data.avatarUrl } : response.data,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Avatar upload failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return false;
    }
  }, []);

  // ============================================
  // Refresh User (re-fetch from API)
  // ============================================
  
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!getToken()) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await apiClient.get<User>('/users/me');
      setState((prev) => ({
        ...prev,
        user: response.data,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh user';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  // ============================================
  // Clear Error
  // ============================================
  
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================
  // Context Value
  // ============================================
  
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    updateAvatar,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// Hook
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ============================================
// Higher-Order Component for Protected Routes
// ============================================

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isInitialized } = useAuth();

    if (!isInitialized) {
      return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      window.location.href = '/login';
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithAuthComponent;
};

export default AuthProvider;

