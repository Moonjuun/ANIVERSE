import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const language = searchParams.get("language") || "ko-KR";
  const genre = searchParams.get("genre");
  const year = searchParams.get("year");
  const sort = searchParams.get("sort");

  try {
    const options: {
      genre?: number;
      year?: number;
      sortBy?: "popularity.desc" | "popularity.asc" | "vote_average.desc" | "vote_average.asc" | "first_air_date.desc" | "first_air_date.asc";
    } = {};

    if (genre) {
      options.genre = parseInt(genre, 10);
    }
    if (year) {
      options.year = parseInt(year, 10);
    }
    if (sort) {
      options.sortBy = sort as any;
    }

    const data = await tmdbClient.getAnimeShows(page, language, true, options);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Anime API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch anime data" },
      { status: 500 }
    );
  }
}

