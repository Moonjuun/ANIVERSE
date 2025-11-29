'use client';

import { useState } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { deleteAccount } from '@/actions/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from '@/i18n/navigation';
import { useToast } from '@/lib/utils/toast';

export function DeleteAccountConfirmModal() {
  const t = useTranslations('auth.delete_account');
  const { deleteAccountConfirmModalOpen, setDeleteAccountConfirmModalOpen } = useModalStore();
  const { setUser } = useAuthStore();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    // 번역 파일의 confirm_placeholder와 비교
    const requiredText = t('confirm_placeholder');
    
    if (confirmText !== requiredText) {
      toast.error(t('confirm_text_mismatch'));
      return;
    }

    setLoading(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        setUser(null);
        setDeleteAccountConfirmModalOpen(false);
        toast.success(t('success'));
        router.push('/');
      } else {
        toast.error(result.error || t('error'));
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!deleteAccountConfirmModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={() => setDeleteAccountConfirmModalOpen(false)}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl',
          'animate-in fade-in-0 zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDeleteAccountConfirmModalOpen(false)}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-white">{t('title')}</h2>
          <p className="mb-4 text-sm text-zinc-400">{t('message')}</p>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-left">
            <p className="text-sm text-rose-400 font-medium mb-2">{t('warning_title')}</p>
            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
              <li>{t('warning_1')}</li>
              <li>{t('warning_2')}</li>
              <li>{t('warning_3')}</li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            {t('confirm_label')}
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('confirm_placeholder')}
            className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setDeleteAccountConfirmModalOpen(false);
              setConfirmText('');
            }}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-rose-600 hover:bg-rose-500"
            onClick={handleDelete}
            disabled={loading || confirmText !== t('confirm_placeholder')}
          >
            {loading ? t('deleting') : t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}

