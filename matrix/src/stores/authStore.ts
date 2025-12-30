import { makeAutoObservable, runInAction } from 'mobx';
import apiClient, { setAuthToken, clearAuthToken, getAuthToken } from '../services/apiClient';
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '../types/api';

class AuthStore {
  user: User | null = null;
  token: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeFromStorage();
  }

  // Computed properties
  get isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  // Initialize from localStorage on app start
  private initializeFromStorage(): void {
    const storedToken = getAuthToken();
    if (storedToken) {
      this.token = storedToken;
      // Fetch user profile with stored token
      this.fetchCurrentUser();
    }
  }

  // Fetch current user profile
  async fetchCurrentUser(): Promise<void> {
    if (!this.token) return;

    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient.get<User>('/users/me');
      runInAction(() => {
        this.user = response.data;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Failed to fetch user';
        // If fetching user fails, clear invalid token
        this.logout();
      });
    }
  }

  // Login action
  async login(email: string, password: string): Promise<boolean> {
    console.log('🔐 [AuthStore] Starting login...', { email });
    this.isLoading = true;
    this.error = null;

    try {
      const payload: LoginRequest = { email, password };
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);

      console.log('✅ [AuthStore] Login response received:', response.data);

      // Response is already unwrapped by interceptor
      // Backend sends { token, user } and interceptor unwraps it
      const token = response.data.token;
      const user = response.data.user;

      console.log('🎫 [AuthStore] Token extracted:', token ? '✓ Token exists' : '✗ No token');
      console.log('👤 [AuthStore] User extracted:', user);

      runInAction(() => {
        this.token = token;
        this.user = user;
        this.isLoading = false;
      });

      // Save token to localStorage
      setAuthToken(token);
      console.log('💾 [AuthStore] Token saved to localStorage');
      console.log('✅ [AuthStore] Login successful, isAuthenticated:', this.isAuthenticated);
      
      return true;
    } catch (error) {
      console.error('❌ [AuthStore] Login failed:', error);
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Login failed';
      });
      return false;
    }
  }

  // Register action
  async register(email: string, password: string, name: string): Promise<boolean> {
    console.log('📝 [AuthStore] Starting registration...', { email, name });
    this.isLoading = true;
    this.error = null;

    try {
      const payload: RegisterRequest = { email, password, name };
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);

      console.log('✅ [AuthStore] Registration response received:', response.data);

      // Auto-login after registration
      runInAction(() => {
        this.isLoading = false;
      });

      return await this.login(email, password);
    } catch (error) {
      console.error('❌ [AuthStore] Registration failed:', error);
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Registration failed';
      });
      return false;
    }
  }

  // Logout action
  logout(): void {
    this.user = null;
    this.token = null;
    this.error = null;
    clearAuthToken();
  }

  // Update profile action
  async updateProfile(data: UpdateProfileRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient.patch<User>('/users/me', data);

      runInAction(() => {
        this.user = response.data;
        this.isLoading = false;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Profile update failed';
      });
      return false;
    }
  }

  // Change password action
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      await apiClient.post('/users/me/change-password', { oldPassword, newPassword });

      runInAction(() => {
        this.isLoading = false;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Password change failed';
      });
      return false;
    }
  }

  // Upload avatar action
  async uploadAvatar(file: File): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.patch<User>('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      runInAction(() => {
        if (this.user) {
          this.user = { ...this.user, avatarUrl: response.data.avatarUrl };
        }
        this.isLoading = false;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Avatar upload failed';
      });
      return false;
    }
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }
}

export default AuthStore;

