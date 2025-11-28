import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const language = searchParams.get("language") || "ko-KR";

  try {
    const data = await tmdbClient.getAnimeShows(page, language);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Anime API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch anime data" },
      { status: 500 }
    );
  }
}

