'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useModalStore } from '@/stores/useModalStore';
import { useTranslations } from 'next-intl';

export function DeleteAccountButton() {
  const t = useTranslations('profile');
  const { setDeleteAccountConfirmModalOpen } = useModalStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mt-6 w-full text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
      onClick={() => setDeleteAccountConfirmModalOpen(true)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {t('delete_account')}
    </Button>
  );
}

