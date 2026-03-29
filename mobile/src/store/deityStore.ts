import { create } from 'zustand';
import type { Deity } from '../types/deity';
import { deityApi } from '../services/api/deityApi';

interface DeityState {
  deities: Deity[];
  selectedDeityId: string | null;
  isLoading: boolean;

  fetchDeities: () => Promise<void>;
  selectDeity: (id: string) => void;
  getDeity: (id: string) => Deity | undefined;
}

export const useDeityStore = create<DeityState>((set, get) => ({
  deities: [],
  selectedDeityId: null,
  isLoading: false,

  fetchDeities: async () => {
    set({ isLoading: true });
    try {
      const deities = await deityApi.getAll();
      set({ deities, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectDeity: (id) => set({ selectedDeityId: id }),

  getDeity: (id) => get().deities.find((d) => d.id === id),
}));
