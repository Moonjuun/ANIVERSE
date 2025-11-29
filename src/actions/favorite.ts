"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type FavoriteInsert = Database["public"]["Tables"]["favorites"]["Insert"];

/**
 * 찜하기 추가
 */
export async function addFavorite(animeId: number) {
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

  // 찜하기 추가
  const favoriteData: FavoriteInsert = {
    user_id: user.id,
    anime_id: animeId,
  };

  const { data, error } = await supabase
    .from("favorites")
    .insert(favoriteData)
    .select()
    .single();

  if (error) {
    // UNIQUE 제약 조건 위반 (이미 찜하기가 있는 경우)
    if (error.code === "23505") {
      return {
        success: false,
        error: "이미 찜하기 목록에 추가되어 있습니다.",
      };
    }

    return {
      success: false,
      error: error.message || "찜하기 추가에 실패했습니다.",
    };
  }

  // 경로 재검증
  revalidatePath(`/anime/${animeId}`);
  revalidatePath("/favorites");

  return {
    success: true,
    data,
  };
}

/**
 * 찜하기 제거
 */
export async function removeFavorite(animeId: number) {
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

  // 찜하기 제거
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("anime_id", animeId);

  if (error) {
    return {
      success: false,
      error: error.message || "찜하기 제거에 실패했습니다.",
    };
  }

  // 경로 재검증
  revalidatePath(`/anime/${animeId}`);
  revalidatePath("/favorites");

  return {
    success: true,
  };
}

/**
 * 찜하기 여부 확인
 */
export async function isFavorite(animeId: number) {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      isFavorite: false,
    };
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("anime_id", animeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // 찜하기가 없는 경우
      return {
        success: true,
        isFavorite: false,
      };
    }

    return {
      success: false,
      isFavorite: false,
    };
  }

  return {
    success: true,
    isFavorite: !!data,
  };
}

/**
 * 사용자의 찜하기 목록 조회
 */
export async function getFavorites() {
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

  const { data, error } = await supabase
    .from("favorites")
    .select("anime_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: error.message || "찜하기 목록을 불러오는데 실패했습니다.",
      data: [],
    };
  }

  return {
    success: true,
    data: data || [],
  };
}





