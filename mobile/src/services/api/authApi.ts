import { apiClient } from './client';
import type { AuthResponse } from '../../types/auth';

export const authApi = {
  register: async (email: string, displayName: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      displayName,
      password,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
};
