'use client';

import { useState } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { Button } from '@/components/ui/button';
import { X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

export function LogoutConfirmModal() {
  const t = useTranslations('auth.logout');
  const { logoutConfirmModalOpen, setLogoutConfirmModalOpen } = useModalStore();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setLogoutConfirmModalOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!logoutConfirmModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={() => setLogoutConfirmModalOpen(false)}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl',
          'animate-in fade-in-0 zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setLogoutConfirmModalOpen(false)}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <LogOut className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-white">{t('title')}</h2>
          <p className="text-sm text-zinc-400">{t('message')}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setLogoutConfirmModalOpen(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? t('logging_out') : t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}

