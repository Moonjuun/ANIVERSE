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

  // 프로필 및 온보딩 체크 함수
  const checkProfileAndOnboarding = async (session: any) => {
    if (!session?.user) return;

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
  };

  useEffect(() => {
    // 현재 세션 확인 및 초기 체크
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      // 초기 로드 시에도 체크 (이미 로그인된 사용자)
      if (session?.user) {
        await checkProfileAndOnboarding(session);
      }
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // 로그인 성공 시 프로필 체크
      if (event === 'SIGNED_IN' && session?.user) {
        await checkProfileAndOnboarding(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, supabase, setProfileSetupModalOpen, setOnboardingModalOpen]);

  return null;
}





