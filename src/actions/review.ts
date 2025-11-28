"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export interface CreateReviewInput {
  anime_id: number;
  rating: number;
  title?: string;
  content: string;
}

export interface UpdateReviewInput {
  id: string;
  rating?: number;
  title?: string;
  content?: string;
}

/**
 * 리뷰 작성
 */
export async function createReview(input: CreateReviewInput) {
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
  if (input.rating < 1 || input.rating > 10) {
    return {
      success: false,
      error: "평점은 1~10 사이여야 합니다.",
    };
  }

  if (!input.content.trim()) {
    return {
      success: false,
      error: "리뷰 내용을 입력해주세요.",
    };
  }

  // 리뷰 작성
  const reviewData: ReviewInsert = {
    user_id: user.id,
    anime_id: input.anime_id,
    rating: input.rating,
    title: input.title?.trim() || null,
    content: input.content.trim(),
  };

  const { data, error } = await supabase
    .from("reviews")
    .insert(reviewData)
    .select()
    .single();

  if (error) {
    // UNIQUE 제약 조건 위반 (이미 리뷰가 있는 경우)
    if (error.code === "23505") {
      return {
        success: false,
        error: "이미 이 애니메이션에 대한 리뷰를 작성하셨습니다.",
      };
    }

    return {
      success: false,
      error: error.message || "리뷰 작성에 실패했습니다.",
    };
  }

  // 경로 재검증
  revalidatePath(`/anime/${input.anime_id}`);

  return {
    success: true,
    data,
  };
}

/**
 * 리뷰 수정
 */
export async function updateReview(input: UpdateReviewInput) {
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

  // 기존 리뷰 확인 및 권한 체크
  const { data: existingReview, error: fetchError } = await supabase
    .from("reviews")
    .select("user_id, anime_id")
    .eq("id", input.id)
    .single();

  if (fetchError || !existingReview) {
    return {
      success: false,
      error: "리뷰를 찾을 수 없습니다.",
    };
  }

  if (existingReview.user_id !== user.id) {
    return {
      success: false,
      error: "본인의 리뷰만 수정할 수 있습니다.",
    };
  }

  // 업데이트 데이터 구성
  const updateData: ReviewUpdate = {};
  if (input.rating !== undefined) {
    if (input.rating < 1 || input.rating > 10) {
      return {
        success: false,
        error: "평점은 1~10 사이여야 합니다.",
      };
    }
    updateData.rating = input.rating;
  }
  if (input.title !== undefined) {
    updateData.title = input.title.trim() || null;
  }
  if (input.content !== undefined) {
    if (!input.content.trim()) {
      return {
        success: false,
        error: "리뷰 내용을 입력해주세요.",
      };
    }
    updateData.content = input.content.trim();
  }

  // 리뷰 수정
  const { data, error } = await supabase
    .from("reviews")
    .update(updateData)
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "리뷰 수정에 실패했습니다.",
    };
  }

  // 경로 재검증
  revalidatePath(`/anime/${existingReview.anime_id}`);

  return {
    success: true,
    data,
  };
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(reviewId: string) {
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

  // 기존 리뷰 확인 및 권한 체크
  const { data: existingReview, error: fetchError } = await supabase
    .from("reviews")
    .select("user_id, anime_id")
    .eq("id", reviewId)
    .single();

  if (fetchError || !existingReview) {
    return {
      success: false,
      error: "리뷰를 찾을 수 없습니다.",
    };
  }

  if (existingReview.user_id !== user.id) {
    return {
      success: false,
      error: "본인의 리뷰만 삭제할 수 있습니다.",
    };
  }

  // 리뷰 삭제
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    return {
      success: false,
      error: error.message || "리뷰 삭제에 실패했습니다.",
    };
  }

  // 경로 재검증
  revalidatePath(`/anime/${existingReview.anime_id}`);

  return {
    success: true,
  };
}

/**
 * 애니메이션의 리뷰 목록 조회
 */
export async function getReviews(animeId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      user_profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("anime_id", animeId)
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

/**
 * 사용자의 특정 애니메이션 리뷰 조회
 */
export async function getUserReview(animeId: number) {
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
    .from("reviews")
    .select("*")
    .eq("anime_id", animeId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // 리뷰가 없는 경우
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: false,
      error: error.message || "리뷰를 불러오는데 실패했습니다.",
      data: null,
    };
  }

  return {
    success: true,
    data,
  };
}

