"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CharacterData {
  id: number;
  name: string;
  image: string;
  aniTitle: string;
}

export interface WorldCupWinner {
  id: string;
  user_id: string;
  worldcup_id: string;
  character_id: number;
  character_name: string;
  character_image: string;
  ani_title: string;
  created_at: string;
}

/**
 * 월드컵 우승자 저장
 */
export async function saveWinner(
  worldcupId: string,
  character: CharacterData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("worldcup_winners").insert({
      user_id: user.id,
      worldcup_id: worldcupId,
      character_id: character.id,
      character_name: character.name,
      character_image: character.image,
      ani_title: character.aniTitle,
    });

    if (error) {
      console.error("Save winner error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Save winner error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 내 우승자 리스트 조회 (최신순)
 */
export async function getMyWinners(): Promise<{
  success: boolean;
  data?: WorldCupWinner[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("worldcup_winners")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get winners error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Get winners error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

