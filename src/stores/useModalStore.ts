import { create } from 'zustand';

interface ModalState {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  profileSetupModalOpen: boolean;
  setProfileSetupModalOpen: (open: boolean) => void;
  onboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),
  profileSetupModalOpen: false,
  setProfileSetupModalOpen: (open) => set({ profileSetupModalOpen: open }),
  onboardingModalOpen: false,
  setOnboardingModalOpen: (open) => set({ onboardingModalOpen: open }),
}));

