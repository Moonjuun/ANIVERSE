import { create } from 'zustand';

interface ModalState {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),
}));

