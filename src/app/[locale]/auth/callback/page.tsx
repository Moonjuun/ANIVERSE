'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // URL에서 인증 코드 처리
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/');
        return;
      }

      if (data.session?.user) {
        setUser(data.session.user);
        // AuthStateHandler가 프로필 체크를 수행하므로 여기서는 리다이렉트만
        router.push('/');
      } else {
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router, supabase, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400">로그인 처리 중...</p>
      </div>
    </div>
  );
}

