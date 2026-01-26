import { apiService } from './api';
import { mockAuthService } from './mockAuth';
import type { LoginRequest, LoginResponse, CreateUserRequest, User, RegisterRequest, RegisterResponse } from '../types';

// Cambiar a false para usar el backend real
const USE_MOCK = false;

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (USE_MOCK) {
      return await mockAuthService.login(credentials);
    }
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    return response;
  },

  async refresh(): Promise<{ accessToken: string }> {
    if (USE_MOCK) {
      return await mockAuthService.refresh();
    }
    // El refresh token se envía automáticamente como cookie por withCredentials
    const response = await apiService.post<{ accessToken: string }>('/auth/refresh');
    return response;
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await mockAuthService.logout();
    } else {
      await apiService.post('/auth/logout');
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiService.post<User>('/users', userData);
    return response;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiService.post<RegisterResponse>('/auth/register', data);
    return response;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};