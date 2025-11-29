/**
 * AniList GraphQL API 클라이언트
 */

const ANILIST_API_URL = "https://graphql.anilist.co";

export interface AniListReview {
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

export interface AniListMedia {
  id: number;
  reviews: {
    nodes: AniListReview[];
    pageInfo: {
      hasNextPage: boolean;
      currentPage: number;
    };
  } | null;
}

export interface AniListResponse {
  data: {
    Media: AniListMedia | null;
  };
}

class AniListClient {
  private baseURL: string;

  constructor() {
    this.baseURL = ANILIST_API_URL;
  }

  /**
   * GraphQL 쿼리 실행
   */
  private async query<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.baseURL, {
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

  /**
   * 애니메이션 이름으로 AniList Media ID 찾기
   * TMDB의 애니메이션 이름을 사용하여 AniList에서 검색
   */
  async findMediaByTitle(
    title: string,
    originalTitle?: string
  ): Promise<number | null> {
    try {
      // 영어 제목 우선, 없으면 원제 사용
      const searchQuery = title || originalTitle || "";
      if (!searchQuery) {
        return null;
      }

      // AniList에서 검색
      const results = await this.searchMedia(searchQuery);

      if (results.length === 0) {
        // 원제로 다시 시도
        if (originalTitle && originalTitle !== title) {
          const originalResults = await this.searchMedia(originalTitle);
          if (originalResults.length > 0) {
            return originalResults[0].id;
          }
        }
        return null;
      }

      // 첫 번째 결과 반환 (가장 관련성 높은 결과)
      return results[0].id;
    } catch (error) {
      console.warn(
        "AniList search error:",
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  /**
   * AniList Media ID로 리뷰 가져오기
   */
  async getReviews(
    mediaId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<AniListReview[]> {
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

    const result = await this.query<AniListResponse>(query, {
      id: mediaId,
      page,
      perPage,
    });

    return result.data.Media?.reviews?.nodes || [];
  }

  /**
   * 애니메이션 이름으로 검색하여 Media ID 찾기
   */
  async searchMedia(
    query: string
  ): Promise<
    Array<{ id: number; title: { romaji: string; english: string | null } }>
  > {
    const graphqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
            }
          }
        }
      }
    `;

    const result = await this.query<{
      data: {
        Page: {
          media: Array<{
            id: number;
            title: {
              romaji: string;
              english: string | null;
            };
          }>;
        };
      };
    }>(graphqlQuery, { search: query });

    return result.data.Page.media;
  }
}

// 싱글톤 인스턴스
export const anilistClient = new AniListClient();
