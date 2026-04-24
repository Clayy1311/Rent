import { create } from 'zustand';

interface ModalState {
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isAuthOpen: false,
  openAuth: () => set({ isAuthOpen: true }),
  closeAuth: () => set({ isAuthOpen: false }),
}));