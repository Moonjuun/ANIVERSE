import { create } from "zustand";

interface ModalState {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  profileSetupModalOpen: boolean;
  setProfileSetupModalOpen: (open: boolean) => void;
  onboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;
  emailVerificationModalOpen: boolean;
  setEmailVerificationModalOpen: (open: boolean) => void;
  emailVerificationEmail: string;
  setEmailVerificationEmail: (email: string) => void;
  logoutConfirmModalOpen: boolean;
  setLogoutConfirmModalOpen: (open: boolean) => void;
  deleteAccountConfirmModalOpen: boolean;
  setDeleteAccountConfirmModalOpen: (open: boolean) => void;
  deleteReviewConfirmModalOpen: boolean;
  setDeleteReviewConfirmModalOpen: (open: boolean) => void;
  deleteReviewId: string | null;
  setDeleteReviewId: (id: string | null) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),
  profileSetupModalOpen: false,
  setProfileSetupModalOpen: (open) => set({ profileSetupModalOpen: open }),
  onboardingModalOpen: false,
  setOnboardingModalOpen: (open) => set({ onboardingModalOpen: open }),
  emailVerificationModalOpen: false,
  setEmailVerificationModalOpen: (open) =>
    set({ emailVerificationModalOpen: open }),
  emailVerificationEmail: "",
  setEmailVerificationEmail: (email) => set({ emailVerificationEmail: email }),
  logoutConfirmModalOpen: false,
  setLogoutConfirmModalOpen: (open) => set({ logoutConfirmModalOpen: open }),
  deleteAccountConfirmModalOpen: false,
  setDeleteAccountConfirmModalOpen: (open) =>
    set({ deleteAccountConfirmModalOpen: open }),
  deleteReviewConfirmModalOpen: false,
  setDeleteReviewConfirmModalOpen: (open) =>
    set({ deleteReviewConfirmModalOpen: open }),
  deleteReviewId: null,
  setDeleteReviewId: (id) => set({ deleteReviewId: id }),
}));
