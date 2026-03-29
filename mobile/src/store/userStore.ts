import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../types/auth';
import { authApi } from '../services/api/authApi';

interface UserState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login(email, password);
      await AsyncStorage.setItem('auth_token', token);
      set({ token, user, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, displayName, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.register(email, displayName, password);
      await AsyncStorage.setItem('auth_token', token);
      set({ token, user, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  loadStoredAuth: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) set({ token });
  },
}));
