'use client';

import { useModalStore } from '@/stores/useModalStore';
import { EmailVerificationModal } from './email-verification-modal';

export function EmailVerificationModalWrapper() {
  const { emailVerificationModalOpen, emailVerificationEmail, setEmailVerificationModalOpen } =
    useModalStore();

  if (!emailVerificationModalOpen) return null;

  return (
    <EmailVerificationModal
      email={emailVerificationEmail}
      onClose={() => setEmailVerificationModalOpen(false)}
    />
  );
}

