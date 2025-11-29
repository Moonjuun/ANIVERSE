'use client';

import { useModalStore } from '@/stores/useModalStore';
import { Button } from '@/components/ui/button';
import { X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';

interface EmailVerificationModalProps {
  email: string;
  onClose?: () => void;
}

export function EmailVerificationModal({ email, onClose }: EmailVerificationModalProps) {
  const t = useTranslations('auth.email_verification');
  const { setLoginModalOpen } = useModalStore();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setLoginModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl',
          'animate-in fade-in-0 zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-white">{t('title')}</h2>
          <p className="text-sm text-zinc-400">{t('subtitle')}</p>
        </div>

        <div className="mb-6 rounded-lg bg-zinc-800/50 p-4">
          <p className="text-center text-sm text-zinc-300">
            <span className="font-medium text-white">{email}</span>
            {t('email_sent_to')}
          </p>
        </div>

        <div className="mb-6 space-y-2 text-sm text-zinc-400">
          <p>{t('instruction_1')}</p>
          <p>{t('instruction_2')}</p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleClose} className="w-full">
            {t('close')}
          </Button>
          <button
            onClick={() => {
              handleClose();
              setLoginModalOpen(true);
            }}
            className="w-full text-center text-sm text-zinc-400 hover:text-blue-500"
          >
            {t('back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
}

