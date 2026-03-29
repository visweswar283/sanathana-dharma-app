import { apiClient } from './client';
import type { Deity } from '../../types/deity';

export const deityApi = {
  getAll: async (): Promise<Deity[]> => {
    const { data } = await apiClient.get<{ deities: Deity[] }>('/deities');
    return data.deities;
  },

  getAvailable: async (): Promise<Deity[]> => {
    const { data } = await apiClient.get<{ deities: Deity[] }>('/deities/available');
    return data.deities;
  },
};
