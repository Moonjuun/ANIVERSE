"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase";

/**
 * 이메일이 이미 가입되어 있는지 확인
 */
export async function checkEmailExists(email: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return {
      success: false,
      exists: false,
      error: "서버 설정 오류",
    };
  }

  try {
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

    // Admin API로 사용자 목록에서 이메일 검색
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return {
        success: false,
        exists: false,
        error: error.message,
      };
    }

    const userExists = data.users.some((user) => user.email === email);

    return {
      success: true,
      exists: userExists,
    };
  } catch (error) {
    console.error("Check email exists error:", error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

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
      error: "인증이 필요합니다.",
    };
  }

  const userId = user.id;

  try {
    // Service Role Key로 Admin 클라이언트 생성
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
      return {
        success: false,
        error: "서버 설정 오류가 발생했습니다.",
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
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Profile deletion error:", profileError);
    }

    // 2. 사용자 리뷰 삭제
    const { error: reviewsError } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", userId);

    if (reviewsError) {
      console.error("Reviews deletion error:", reviewsError);
    }

    // 3. 사용자 찜하기 삭제
    const { error: favoritesError } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId);

    if (favoritesError) {
      console.error("Favorites deletion error:", favoritesError);
    }

    // 4. Auth 사용자 삭제 (Admin API 사용)
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("User deletion error:", deleteUserError);
      // 사용자 삭제 실패 시에도 세션 종료
      await supabase.auth.signOut();
      return {
        success: false,
        error: "계정 삭제에 실패했습니다. 고객센터로 문의해주세요.",
      };
    }

    // 경로 재검증
    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete account error:", error);
    // 에러 발생 시에도 세션 종료 시도
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error("Sign out error:", signOutError);
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "회원탈퇴에 실패했습니다.",
    };
  }
}

/**
 * 비밀번호 재설정 이메일 전송 (다국어 지원)
 * 사용자의 locale 정보를 확인하여 적절한 언어로 이메일을 전송합니다.
 */
export async function resetPasswordForEmail(
  email: string,
  locale: string = "ko"
) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return {
        success: false,
        error: "서버 설정 오류",
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

    // 이메일로 사용자 찾기
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return {
        success: false,
        error: listError.message || "사용자를 찾을 수 없습니다.",
      };
    }

    const user = users.users.find((u) => u.email === email);

    // 사용자의 기존 locale 정보가 있으면 사용, 없으면 현재 locale 사용
    const userLocale = (user?.user_metadata?.locale as string) || locale;

    // 유효한 locale인지 확인
    const validLocale = ["ko", "en", "ja"].includes(userLocale)
      ? userLocale
      : "ko";

    // redirectTo URL에 locale 포함
    // 환경 변수에서 사이트 URL 가져오기 (없으면 localhost 사용)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const redirectTo = `${siteUrl}/${validLocale}/auth/reset-password`;

    // Server Action에서 비밀번호 재설정 이메일 전송
    // Supabase의 resetPasswordForEmail은 클라이언트에서만 작동하므로
    // 여기서는 redirectTo만 설정하고, 실제 이메일은 Supabase가 전송합니다
    // 이메일 템플릿은 Supabase 대시보드에서 설정하며,
    // 템플릿 내에서 .Data.locale을 사용하여 다국어를 지원합니다
    const supabase = await createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );

    if (resetError) {
      return {
        success: false,
        error:
          resetError.message || "비밀번호 재설정 이메일 전송에 실패했습니다.",
      };
    }

    // 사용자의 user_metadata에 locale이 없으면 업데이트
    if (user && !user.user_metadata?.locale) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          locale: validLocale,
        },
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Reset password email error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "비밀번호 재설정 이메일 전송에 실패했습니다.",
    };
  }
}
