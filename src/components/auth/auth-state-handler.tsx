'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useModalStore } from '@/stores/useModalStore';
import { getProfile } from '@/actions/profile';
import { getFavorites } from '@/actions/favorite';

export function AuthStateHandler() {
  const { user, setUser } = useAuthStore();
  const { setProfileSetupModalOpen, setOnboardingModalOpen } = useModalStore();
  const supabase = createClient();

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // 로그인 성공 시 프로필 체크
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // 프로필 확인
          const profileResult = await getProfile();

          if (!profileResult.success || !profileResult.data?.username) {
            // 프로필이 없으면 프로필 설정 모달 열기
            setProfileSetupModalOpen(true);
          } else {
            // 프로필이 있으면 찜하기 확인 (온보딩 체크)
            const favoritesResult = await getFavorites();
            const hasFavorites =
              favoritesResult.success && favoritesResult.data.length > 0;

            if (!hasFavorites) {
              // 찜하기가 없으면 온보딩 모달 열기
              setOnboardingModalOpen(true);
            }
          }
        } catch (error) {
          console.error('Profile check error:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, supabase, setProfileSetupModalOpen, setOnboardingModalOpen]);

  return null;
}

