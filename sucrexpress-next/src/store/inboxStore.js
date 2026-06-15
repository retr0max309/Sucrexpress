import { create } from 'zustand';

export const useInboxStore = create((set) => ({
  items: [],
  ultimoTimestamp: new Date().toISOString(),

  setSincronizaciones: (items) => set({ items }),

  addItem: (item) => set((state) => ({
    items: [item, ...state.items].slice(0, 10)
  })),

  setUltimoTimestamp: (timestamp) => set({ ultimoTimestamp: timestamp }),

  clearItems: () => set({ items: [] })
}));
