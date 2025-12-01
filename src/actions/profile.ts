"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

export interface UpdateProfileInput {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  marketing_agreed?: boolean;
}

/**
 * 현재 사용자 프로필 조회
 */
export async function getProfile() {
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
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // 프로필이 없는 경우 기본 프로필 생성
      // user_metadata에서 마케팅 동의 정보 가져오기
      const marketingAgreed =
        (user.user_metadata?.marketing_agreed as boolean) || false;

      // marketing_agreed 컬럼이 없을 수 있으므로, 먼저 기본 프로필 생성 시도
      const insertData: {
        id: string;
        username: string;
        marketing_agreed?: boolean;
      } = {
        id: user.id,
        username: user.email?.split("@")[0] || "user",
      };

      // marketing_agreed 컬럼이 있는 경우에만 추가
      // 마이그레이션이 적용되지 않은 경우를 대비
      try {
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            ...insertData,
            marketing_agreed: marketingAgreed,
          })
          .select()
          .single();

        if (createError) {
          // marketing_agreed 컬럼이 없는 경우, 컬럼 없이 재시도
          if (createError.message?.includes("marketing_agreed")) {
            const { data: newProfileWithoutMarketing, error: createError2 } = await supabase
              .from("user_profiles")
              .insert(insertData)
              .select()
              .single();

            if (createError2) {
              return {
                success: false,
                error: createError2.message || "프로필을 생성하는데 실패했습니다.",
                data: null,
              };
            }

            return {
              success: true,
              data: newProfileWithoutMarketing,
            };
          }

          return {
            success: false,
            error: createError.message || "프로필을 생성하는데 실패했습니다.",
            data: null,
          };
        }

        return {
          success: true,
          data: newProfile,
        };
      } catch (err) {
        // 예상치 못한 오류 발생 시, marketing_agreed 없이 재시도
        const { data: newProfileWithoutMarketing, error: createError2 } = await supabase
          .from("user_profiles")
          .insert(insertData)
          .select()
          .single();

        if (createError2) {
          return {
            success: false,
            error: createError2.message || "프로필을 생성하는데 실패했습니다.",
            data: null,
          };
        }

        return {
          success: true,
          data: newProfileWithoutMarketing,
        };
      }
    }

    return {
      success: false,
      error: error.message || "프로필을 불러오는데 실패했습니다.",
      data: null,
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * 특정 사용자 프로필 조회 (공개)
 */
export async function getPublicProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "프로필을 찾을 수 없습니다.",
        data: null,
      };
    }

    return {
      success: false,
      error: error.message || "프로필을 불러오는데 실패했습니다.",
      data: null,
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * 프로필 수정
 */
export async function updateProfile(input: UpdateProfileInput) {
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

  // 입력 검증
  if (input.username && input.username.length < 3) {
    return {
      success: false,
      error: "사용자명은 최소 3자 이상이어야 합니다.",
    };
  }

  if (input.username && input.username.length > 20) {
    return {
      success: false,
      error: "사용자명은 최대 20자까지 가능합니다.",
    };
  }

  if (input.bio && input.bio.length > 500) {
    return {
      success: false,
      error: "소개는 최대 500자까지 가능합니다.",
    };
  }

  // 업데이트 데이터 구성
  const updateData: UserProfileUpdate = {};
  if (input.username !== undefined) {
    updateData.username = input.username.trim() || null;
  }
  if (input.display_name !== undefined) {
    updateData.display_name = input.display_name.trim() || null;
  }
  if (input.bio !== undefined) {
    updateData.bio = input.bio.trim() || null;
  }
  if (input.avatar_url !== undefined) {
    updateData.avatar_url = input.avatar_url.trim() || null;
  }
  // marketing_agreed는 컬럼이 있을 때만 포함
  // 마이그레이션이 적용되지 않은 경우를 대비
  if (input.marketing_agreed !== undefined) {
    updateData.marketing_agreed = input.marketing_agreed;
  }

  // 프로필 수정
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    // UNIQUE 제약 조건 위반 (username 중복)
    if (error.code === "23505") {
      return {
        success: false,
        error: "이미 사용 중인 사용자명입니다.",
      };
    }

    // marketing_agreed 컬럼이 없는 경우, 컬럼 없이 재시도
    if (error.message?.includes("marketing_agreed") && input.marketing_agreed !== undefined) {
      const updateDataWithoutMarketing = { ...updateData };
      delete updateDataWithoutMarketing.marketing_agreed;

      const { data: updatedData, error: updateError2 } = await supabase
        .from("user_profiles")
        .update(updateDataWithoutMarketing)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError2) {
        return {
          success: false,
          error: updateError2.message || "프로필 수정에 실패했습니다.",
        };
      }

      // 경로 재검증
      revalidatePath("/profile");

      return {
        success: true,
        data: updatedData,
      };
    }

    return {
      success: false,
      error: error.message || "프로필 수정에 실패했습니다.",
    };
  }

  // 경로 재검증
  revalidatePath("/profile");

  return {
    success: true,
    data,
  };
}

/**
 * 사용자가 작성한 리뷰 목록 조회
 */
export async function getUserReviews(userId?: string) {
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
      data: [],
    };
  }

  const targetUserId = userId || user.id;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: error.message || "리뷰를 불러오는데 실패했습니다.",
      data: [],
    };
  }

  return {
    success: true,
    data: data || [],
  };
}





