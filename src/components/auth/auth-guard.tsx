'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useModalStore } from '@/stores/useModalStore';
import { createClient } from '@/lib/supabase/client';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, setUser } = useAuthStore();
  const { setLoginModalOpen } = useModalStore();
  const supabase = createClient();

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, supabase]);

  const handleUnauthorized = () => {
    setLoginModalOpen(true);
  };

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // fallback이 없으면 클릭 시 로그인 모달 열기
    return (
      <div onClick={handleUnauthorized} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

