'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase';

/**
 * 회원탈퇴
 * 사용자 계정과 관련된 모든 데이터를 삭제합니다.
 */
export async function deleteAccount() {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: '인증이 필요합니다.',
    };
  }

  const userId = user.id;

  try {
    // Service Role Key로 Admin 클라이언트 생성
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
      return {
        success: false,
        error: '서버 설정 오류가 발생했습니다.',
      };
    }

    const supabaseAdmin = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. 사용자 프로필 삭제
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Profile deletion error:', profileError);
    }

    // 2. 사용자 리뷰 삭제
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', userId);

    if (reviewsError) {
      console.error('Reviews deletion error:', reviewsError);
    }

    // 3. 사용자 찜하기 삭제
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);

    if (favoritesError) {
      console.error('Favorites deletion error:', favoritesError);
    }

    // 4. Auth 사용자 삭제 (Admin API 사용)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('User deletion error:', deleteUserError);
      // 사용자 삭제 실패 시에도 세션 종료
      await supabase.auth.signOut();
      return {
        success: false,
        error: '계정 삭제에 실패했습니다. 고객센터로 문의해주세요.',
      };
    }

    // 경로 재검증
    revalidatePath('/');
    revalidatePath('/profile');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete account error:', error);
    // 에러 발생 시에도 세션 종료 시도
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Sign out error:', signOutError);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : '회원탈퇴에 실패했습니다.',
    };
  }
}

