import { create } from 'zustand';
import type { User } from '@/types';
import { authService } from '@/api/services';
import toast from 'react-hot-toast';
import api from '@/api/axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Returns null on success, error message string on failure
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<string | null>;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: () => {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (rawUser && token) {
      try {
        set({ user: JSON.parse(rawUser), isAuthenticated: true });
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  },

  // Returns null on success, error message on failure (no toast — page handles display)
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${user.firstName}!`);
      return null; // success
    } catch (err: any) {
      set({ isLoading: false });
      const msg = err.response?.data?.message;
      const text = Array.isArray(msg) ? msg[0] : (msg || 'Login failed. Please try again.');
      return text; // return error for inline display — do NOT show toast here
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authService.register(data);
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
      return null;
    } catch (err: any) {
      set({ isLoading: false });
      const msg = err.response?.data?.message;
      const text = Array.isArray(msg) ? msg[0] : (msg || 'Registration failed. Please try again.');
      return text;
    }
  },

  logout: () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return false;
    try {
      const res = await api.put<User>('/users/profile', data);
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      toast.success('Profile updated successfully!');
      return true;
    } catch {
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }
    try {
      await api.put('/users/profile/password', { currentPassword, newPassword, confirmPassword });
      toast.success('Password updated successfully!');
      return true;
    } catch {
      return false;
    }
  },
}));
