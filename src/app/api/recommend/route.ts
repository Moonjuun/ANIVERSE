import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const genres = searchParams.get("genres");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const sortBy = searchParams.get("sortBy");
  const language = searchParams.get("language") || "ko-KR";

  if (!genres || !fromDate || !toDate || !sortBy) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const recommendations = await tmdbClient.getRecommendations(
      genres,
      fromDate,
      toDate,
      sortBy,
      language,
      3 // 3개 추천
    );

    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json(
        { error: "No recommendation found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("Recommendation API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch recommendation",
        recommendation: null,
      },
      { status: 500 }
    );
  }
}

