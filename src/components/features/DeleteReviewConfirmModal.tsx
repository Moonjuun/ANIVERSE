'use client';

import { useState } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { deleteReview } from '@/actions/review';
import { useRouter } from '@/i18n/navigation';
import { useToast } from '@/lib/utils/toast';

export function DeleteReviewConfirmModal() {
  const t = useTranslations('review');
  const { deleteReviewConfirmModalOpen, setDeleteReviewConfirmModalOpen, deleteReviewId, setDeleteReviewId } = useModalStore();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteReviewId) return;

    setLoading(true);
    try {
      const result = await deleteReview(deleteReviewId);
      if (result.success) {
        setDeleteReviewConfirmModalOpen(false);
        setDeleteReviewId(null);
        toast.success(t('delete_success'));
        router.refresh();
      } else {
        toast.error(result.error || t('delete_error'));
      }
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error(t('delete_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setDeleteReviewConfirmModalOpen(false);
    setDeleteReviewId(null);
  };

  if (!deleteReviewConfirmModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
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
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <Trash2 className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-white">{t('delete_review')}</h2>
          <p className="text-sm text-zinc-400">{t('delete_confirm')}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-rose-600 hover:bg-rose-500"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? t('detail.deleting') : t('detail.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}

