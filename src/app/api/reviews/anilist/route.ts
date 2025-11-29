import { NextRequest, NextResponse } from "next/server";

const ANILIST_API_URL = "https://graphql.anilist.co";

interface AniListReview {
  id: number;
  summary: string | null;
  body: string | null;
  score: number | null;
  rating: number | null;
  user: {
    name: string;
    avatar: {
      large: string | null;
    } | null;
  };
  createdAt: number;
}

interface AniListResponse {
  data: {
    Media: {
      id: number;
      reviews: {
        nodes: AniListReview[];
        pageInfo: {
          hasNextPage: boolean;
          currentPage: number;
        };
      } | null;
    } | null;
  };
}

async function queryAniList<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: {
      revalidate: 3600, // 1시간 캐시
    },
  });

  if (!response.ok) {
    throw new Error(
      `AniList API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(
      `AniList GraphQL error: ${JSON.stringify(result.errors)}`
    );
  }

  return result as T;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaId = searchParams.get("mediaId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);

    if (!mediaId) {
      return NextResponse.json(
        { error: "mediaId is required" },
        { status: 400 }
      );
    }

    const query = `
      query ($id: Int, $page: Int, $perPage: Int) {
        Media(id: $id, type: ANIME) {
          id
          reviews(page: $page, perPage: $perPage, sort: CREATED_AT_DESC) {
            nodes {
              id
              summary
              body
              score
              rating
              user {
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            pageInfo {
              hasNextPage
              currentPage
            }
          }
        }
      }
    `;

    const result = await queryAniList<AniListResponse>(query, {
      id: parseInt(mediaId, 10),
      page,
      perPage,
    });

    const reviews = result.data.Media?.reviews?.nodes || [];
    const hasNextPage = result.data.Media?.reviews?.pageInfo?.hasNextPage || false;

    return NextResponse.json({
      reviews,
      page,
      perPage,
      hasNextPage,
    });
  } catch (error) {
    console.error("AniList reviews API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
        reviews: [],
        page: 1,
        perPage: 10,
        hasNextPage: false,
      },
      { status: 500 }
    );
  }
}

