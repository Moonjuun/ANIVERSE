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
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          username: user.email?.split("@")[0] || "user",
        })
        .select()
        .single();

      if (createError) {
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

