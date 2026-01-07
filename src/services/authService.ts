import api from './api';
import type { IAuthResponse, ILoginCredentials, IRegisterData, IUser } from '../types';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: IRegisterData): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<IUser> {
    const response = await api.get<{ success: boolean; data: IUser }>('/auth/me');
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  /**
   * Get stored user
   */
  getStoredUser(): IUser | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

