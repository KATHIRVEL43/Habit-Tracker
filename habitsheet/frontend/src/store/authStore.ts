import { create } from 'zustand';
import { User } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('habitsheet_token'),
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('habitsheet_token', token);
    localStorage.setItem('habitsheet_user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorage.setItem('habitsheet_user', JSON.stringify(updated));
      return { user: updated };
    });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('habitsheet_token');
      localStorage.removeItem('habitsheet_user');
      set({ user: null, token: null, isLoading: false });
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('habitsheet_token');
    const cachedUser = localStorage.getItem('habitsheet_user');

    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    if (cachedUser) {
      try {
        set({ user: JSON.parse(cachedUser), token });
      } catch {
        // ignore
      }
    }

    try {
      const res = await apiClient.get<User>('/auth/me');
      localStorage.setItem('habitsheet_user', JSON.stringify(res.data));
      set({ user: res.data, token, isLoading: false });
    } catch {
      localStorage.removeItem('habitsheet_token');
      localStorage.removeItem('habitsheet_user');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
